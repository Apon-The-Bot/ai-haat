#!/usr/bin/env node
/**
 * AI Haat — Guarded Production Database Migration & Release Gate
 *
 * Usage:
 *   node scripts/db-predeploy-check.mjs                        # read-only checks
 *   node scripts/db-predeploy-check.mjs --require-backup       # enforce backup even with 0 pending migrations
 *   node scripts/db-predeploy-check.mjs --apply                # apply pending migrations if all gates pass
 *   node scripts/db-predeploy-check.mjs --smoke-url=https://aihaat.shop
 *
 * Required environment (never printed):
 *   DATABASE_URL               target database
 *   DB_EXPECTED_TARGET         "<host>/<database>" the operator intends to touch
 *   DB_BACKUP_MAX_AGE_HOURS    optional, default 24
 *   DB_BACKUP_DIR              optional, default backups/database
 *   ALLOW_DESTRUCTIVE_MIGRATION=true   optional, only after explicit review
 *
 * Concurrency: `prisma migrate deploy` acquires a database advisory lock, so
 * concurrent runs cannot apply overlapping migrations. Never invoked by `npm run build`.
 */
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const apply = process.argv.includes("--apply");
const requireBackup = apply || process.argv.includes("--require-backup");
const smokeArg = process.argv.find((a) => a.startsWith("--smoke-url="));
const smokeUrl = smokeArg ? smokeArg.split("=")[1].replace(/\/$/, "") : null;

const blockers = [];
const warnings = [];
const log = (msg) => console.log(`[db-gate] ${msg}`);
const redact = (s) => String(s || "").replace(/mysql:\/\/[^\s"']+/gi, "[redacted-url]");

function prisma(args) {
  const r = spawnSync("npx", ["prisma", ...args], { encoding: "utf8", shell: process.platform === "win32" });
  return { code: r.status ?? 1, out: redact(`${r.stdout || ""}${r.stderr || ""}`), stdout: redact(r.stdout || "") };
}

// 1. Target verification
function checkTarget() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return blockers.push("DATABASE_URL is not set.");
  let target;
  try {
    const u = new URL(raw);
    target = `${u.hostname}/${u.pathname.replace(/^\//, "")}`.toLowerCase();
  } catch {
    return blockers.push("DATABASE_URL is not a valid URL.");
  }
  const expected = (process.env.DB_EXPECTED_TARGET || "").trim().toLowerCase();
  if (!expected) return blockers.push("DB_EXPECTED_TARGET is not set; refusing to guess the target database.");
  if (expected !== target) return blockers.push(`Target mismatch: DATABASE_URL points to "${target}", expected "${expected}".`);
  log(`Target verified: ${target}`);
}

// 2. Prisma schema & generated client check
function checkPrismaClient() {
  const v = prisma(["validate"]);
  if (v.code !== 0) return blockers.push(`Prisma schema validation failed:\n${v.out}`);
  const clientFile = path.join("node_modules", ".prisma", "client", "index.js");
  if (!fs.existsSync(clientFile)) {
    return blockers.push("Generated Prisma Client is missing (node_modules/.prisma/client). Run `npx prisma generate`.");
  }
  log("Prisma schema & generated client verified.");
}

// 3. Migration status
function pendingMigrations() {
  const { code, out } = prisma(["migrate", "status"]);
  if (/failed|P3009|P3018/i.test(out)) blockers.push("A failed migration is recorded. Resolve it manually before deploying.");
  if (/drift|not found locally/i.test(out)) blockers.push("Migration history diverges from prisma/migrations.");
  const m = out.match(/have not yet been applied:\s*([\s\S]*?)(\n\s*\n|To apply)/);
  const pending = m ? m[1].split(/\r?\n/).map((s) => s.trim()).filter(Boolean) : [];
  if (code !== 0 && pending.length === 0 && blockers.length === 0) blockers.push(`prisma migrate status failed:\n${out}`);
  log(pending.length ? `Pending migrations: ${pending.join(", ")}` : "No pending migrations.");
  return pending;
}

// 4. Destructive SQL review of pending migrations
const DESTRUCTIVE = [
  /\bDROP\s+(TABLE|DATABASE|SCHEMA|COLUMN)\b/i,
  /\bTRUNCATE\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bALTER\s+TABLE[\s\S]*?\bDROP\s+(?!INDEX|FOREIGN\s+KEY|CONSTRAINT)/i,
  /\bMODIFY\b[\s\S]*?\bNOT\s+NULL\b(?![\s\S]*?\bDEFAULT\b)/i,
  /\bRENAME\s+(TABLE|COLUMN)\b/i,
];
function reviewMigrations(pending) {
  for (const name of pending) {
    const file = path.join("prisma", "migrations", name, "migration.sql");
    if (!fs.existsSync(file)) { blockers.push(`Missing SQL for pending migration ${name}.`); continue; }
    const sql = fs.readFileSync(file, "utf8").replace(/--.*$/gm, "");
    const hits = DESTRUCTIVE.filter((re) => re.test(sql)).map((re) => re.source.slice(0, 40));
    if (hits.length && process.env.ALLOW_DESTRUCTIVE_MIGRATION !== "true") {
      blockers.push(`Migration ${name} contains potentially destructive SQL (${hits.join("; ")}). Review it, then set ALLOW_DESTRUCTIVE_MIGRATION=true.`);
    } else if (hits.length) {
      warnings.push(`Destructive SQL in ${name} explicitly allowed by operator.`);
    }
  }
}

// 5. Material vs non-material drift check independent of _prisma_migrations
function checkDrift(pending) {
  const live = prisma(["migrate", "diff", "--from-schema-datasource", "prisma/schema.prisma", "--to-schema-datamodel", "prisma/schema.prisma", "--script"]);
  if (live.code !== 0) {
    warnings.push("Live schema drift diff could not run.");
    return;
  }
  const sql = live.stdout.trim();
  if (!sql || /^--\s*This is an empty migration/i.test(sql)) {
    log("Zero schema drift between live database and prisma/schema.prisma.");
    return;
  }
  const missingTables = (sql.match(/\bCREATE\s+TABLE\s+`[^`]+`/gi) || []).map((s) => s.replace(/\s+/g, " "));
  const missingCols = (sql.match(/\bADD\s+COLUMN\s+`[^`]+`/gi) || []).map((s) => s.replace(/\s+/g, " "));
  if ((missingTables.length || missingCols.length) && pending.length === 0) {
    blockers.push(
      `Material schema drift detected with 0 pending migrations! Missing in DB: ${[...missingTables, ...missingCols].join(", ")}`
    );
  } else if (missingTables.length || missingCols.length) {
    warnings.push(`Pending migrations will add: ${[...missingTables, ...missingCols].join(", ")}`);
  } else {
    warnings.push("Non-material drift present (foreign keys / index names / DATETIME fractional precision); no missing tables or columns.");
  }
}

// 6. Backup readiness & cryptographic SHA-256 verification
function checkBackup(pending) {
  const mustHaveBackup = requireBackup || pending.length > 0;
  const dir = process.env.DB_BACKUP_DIR || path.join("backups", "database");
  const maxAge = Number(process.env.DB_BACKUP_MAX_AGE_HOURS || 24);
  const metas = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".meta.json")) : [];
  const newest = metas
    .map((f) => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch { return null; } })
    .filter((m) => m && m.timestamp && m.sha256 && m.encryptedFile)
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0];
  const failOrWarn = (msg) => (mustHaveBackup ? blockers.push(msg) : warnings.push(msg));
  if (!newest) return failOrWarn(`No verified backup metadata in ${dir}. Run 'npm run backup:db' first.`);
  const ageH = (Date.now() - Date.parse(newest.timestamp)) / 36e5;
  if (ageH > maxAge) return failOrWarn(`Newest backup is ${ageH.toFixed(1)}h old (limit ${maxAge}h).`);
  const encPath = path.join(dir, newest.encryptedFile);
  if (!fs.existsSync(encPath)) return blockers.push("Backup metadata exists but encrypted .sql.enc file is missing.");
  const actualSha = crypto.createHash("sha256").update(fs.readFileSync(encPath)).digest("hex");
  if (actualSha !== newest.sha256) return blockers.push(`Backup SHA-256 integrity mismatch for ${newest.encryptedFile}!`);
  log(`Backup verified: ${newest.encryptedFile} (${ageH.toFixed(2)}h old, SHA-256 OK).`);
}

// 7. Optional lightweight post-deploy HTTP health check
async function runSmokeCheck(baseUrl) {
  for (const route of ["/api/health", "/", "/login", "/api/auth/session"]) {
    const res = await fetch(`${baseUrl}${route}`, { cache: "no-store" });
    if (res.status !== 200) {
      blockers.push(`Smoke check failed: ${route} returned HTTP ${res.status}`);
      return;
    }
    if (route === "/api/health") {
      const body = await res.json();
      if (body.status !== "HEALTHY" || body.checks?.database?.status !== "UP") {
        blockers.push(`Health endpoint degraded: ${JSON.stringify(body)}`);
        return;
      }
    }
  }
  log(`Smoke health checks passed against ${baseUrl} (/api/health, /, /login, /api/auth/session).`);
}

async function main() {
  checkTarget();
  let pending = [];
  if (blockers.length === 0) {
    checkPrismaClient();
    pending = pendingMigrations();
    reviewMigrations(pending);
    checkDrift(pending);
    checkBackup(pending);
  }
  if (smokeUrl && blockers.length === 0 && !apply) {
    await runSmokeCheck(smokeUrl);
  }

  warnings.forEach((w) => log(`WARN ${w}`));
  if (blockers.length) {
    blockers.forEach((b) => console.error(`[db-gate] BLOCKED ${b}`));
    process.exit(1);
  }
  if (!apply) { log("All checks passed (read-only mode)."); process.exit(0); }
  if (pending.length === 0) { log("Nothing to apply."); process.exit(0); }

  log("Applying approved migrations with prisma migrate deploy...");
  const res = prisma(["migrate", "deploy"]);
  console.log(res.out);
  if (res.code !== 0) { console.error("[db-gate] migrate deploy FAILED. Do not restart the app; investigate."); process.exit(1); }
  const after = prisma(["migrate", "status"]);
  if (after.code !== 0) { console.error("[db-gate] Post-deploy status is not clean."); process.exit(1); }
  if (smokeUrl) await runSmokeCheck(smokeUrl);
  log("Migrations applied and status verified.");
}

main().catch((e) => {
  console.error(`[db-gate] Error: ${redact(e?.message || e)}`);
  process.exit(1);
});
