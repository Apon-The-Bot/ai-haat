#!/usr/bin/env node
/**
 * AI Haat — Development vs Production Database Isolation Guard
 *
 * Prevents development servers (`npm run dev`) and development-only Prisma
 * commands (`migrate dev`, `db push`, `db seed`) from accidentally connecting
 * to or mutating the live Hostinger production database (`u298980084_ai_haat`).
 *
 * Never prints passwords or full connection strings.
 */

import fs from "node:fs";
import path from "node:path";

const PROD_HOST_PATTERNS = [/srv1497\.hstgr\.io/i, /\.hstgr\.io$/i, /main-hosting\.eu$/i];
const PROD_DB_PATTERNS = [/^u298980084_/i, /ai_haat$/i];

function readEnvFileUrl(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

function resolveEffectiveDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return { url: process.env.DATABASE_URL, source: "process.env.DATABASE_URL" };
  }
  const localUrl = readEnvFileUrl(path.join(process.cwd(), ".env.local"));
  if (localUrl) return { url: localUrl, source: ".env.local" };
  const envUrl = readEnvFileUrl(path.join(process.cwd(), ".env"));
  if (envUrl) return { url: envUrl, source: ".env" };
  return { url: null, source: "none" };
}

function isProductionTarget(host, dbName) {
  const hostMatch = PROD_HOST_PATTERNS.some((re) => re.test(host));
  const dbMatch = PROD_DB_PATTERNS.some((re) => re.test(dbName));
  const isLocalHost = /^(localhost|127\.0\.0\.1|::1)$/i.test(host);
  if (hostMatch) return true;
  if (!isLocalHost && dbMatch) return true;
  if (/^u298980084_/i.test(dbName)) return true;
  return false;
}

const modeArg = process.argv.find((a) => a.startsWith("--mode="));
const mode = modeArg ? modeArg.split("=")[1] : "dev";

const { url, source } = resolveEffectiveDatabaseUrl();
if (!url) {
  console.error("[db-env-guard] BLOCKED: DATABASE_URL is not configured.");
  process.exit(1);
}

let host = "unknown";
let dbName = "unknown";
try {
  const parsed = new URL(url);
  host = parsed.hostname;
  dbName = parsed.pathname.replace(/^\//, "");
} catch {
  console.error(`[db-env-guard] BLOCKED: Invalid DATABASE_URL format in ${source}.`);
  process.exit(1);
}

const targetsProd = isProductionTarget(host, dbName);

if (mode === "dev-only" && targetsProd) {
  console.error(
    `[db-env-guard] FATAL SAFETY BLOCK: Refusing to run development schema command against production database (${host}/${dbName} from ${source}).\n` +
      `Configure a dedicated local development database in .env (see .env.development.example).`
  );
  process.exit(1);
}

if (mode === "dev" && targetsProd && process.env.ALLOW_PRODUCTION_DB_IN_DEV !== "true") {
  console.error(
    `[db-env-guard] SAFETY BLOCK: Local development server refused because ${source} points to production (${host}/${dbName}).\n` +
      `Point .env to an isolated local development database (see .env.development.example),\n` +
      `or set ALLOW_PRODUCTION_DB_IN_DEV=true if you explicitly intend to inspect production.`
  );
  process.exit(1);
}

console.log(`[db-env-guard] Verified (${mode}): target=${host}/${dbName} (source=${source})`);
