import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";

const required = [
  "NODE_ENV", "NEXTAUTH_URL", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_SITE_URL",
  "DATABASE_URL", "NEXTAUTH_SECRET", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
  "ADMIN_EMAILS", "MFA_ENCRYPTION_KEY", "EMAIL_OTP_PEPPER",
  "MFA_RECOVERY_CODE_PEPPER", "CRON_SECRET", "BACKUP_ENCRYPTION_KEY",
  "SMTP_HOST", "SMTP_USER", "SMTP_PASS", "PIPRAPAY_BASE_URL", "PIPRAPAY_API_KEY",
];
const publicKeys = new Set([
  "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_BDT_PER_USD",
  "NEXT_PUBLIC_WHATSAPP_NUMBER", "NEXT_PUBLIC_GA_MEASUREMENT_ID", "NEXT_PUBLIC_META_PIXEL_ID",
]);
const file = process.argv[2] ?? "production.env";
let source;
try {
  source = readFileSync(file, "utf8");
} catch {
  console.error("Unable to read the environment file.");
  process.exit(1);
}

const errors = [];
const seen = new Set();
for (const [index, line] of source.split(/\r?\n/).entries()) {
  if (!line.trim() || line.trimStart().startsWith("#")) continue;
  const entry = /^([A-Z][A-Z0-9_]*)=.*$/.exec(line);
  if (!entry) {
    errors.push(`Line ${index + 1}: expected KEY=value`);
    continue;
  }
  const key = entry[1];
  if (seen.has(key)) errors.push(`Line ${index + 1}: duplicate key`);
  seen.add(key);
  if (key.startsWith("NEXT_PUBLIC_") && !publicKeys.has(key)) {
    errors.push(`Line ${index + 1}: unapproved public variable`);
  }
}

const env = parseEnv(source);
for (const key of required) {
  if (!env[key]?.trim() || /^(REPLACE_|CHANGEME|YOUR_)/i.test(env[key])) {
    errors.push(`${key}: missing production value`);
  }
}
for (const key of seen) {
  if (!Object.hasOwn(env, key) || /[\r\n]/.test(env[key])) {
    errors.push("A setting could not be parsed as a single dotenv line");
  }
}
if (env.NODE_ENV && env.NODE_ENV !== "production") errors.push("NODE_ENV: expected production");
for (const key of ["NEXTAUTH_URL", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_SITE_URL"]) {
  if (env[key] && !/^https:\/\/aihaat\.shop\/?$/.test(env[key])) {
    errors.push(`${key}: expected the canonical HTTPS site URL`);
  }
}
for (const key of ["DATABASE_URL", "PIPRAPAY_DATABASE_URL", "PIPRAPAY_BASE_URL"]) {
  if (!env[key]) continue;
  try {
    const url = new URL(env[key]);
    const database = key.endsWith("DATABASE_URL");
    if (!url.hostname || (database
      ? url.protocol !== "mysql:" || !url.username || !url.password || url.pathname.length < 2
      : url.protocol !== "https:" || url.username || url.password ||
        /(^|[.-])(localhost|sandbox|staging|test|example)([.-]|$)/i.test(url.hostname) ||
        /(?:^|\/)(sandbox|staging|test)(?:\/|$)/i.test(url.pathname) ||
        /^(127\.|0\.|\[::1\]$)/.test(url.hostname))) {
      throw new Error();
    }
  } catch {
    errors.push(`${key}: invalid production endpoint format`);
  }
}
for (const key of [
  "MFA_ENCRYPTION_KEY", "EMAIL_OTP_PEPPER", "MFA_RECOVERY_CODE_PEPPER",
  "CRON_SECRET", "BACKUP_ENCRYPTION_KEY",
]) {
  if (env[key] && !/^[a-f\d]{64}$/i.test(env[key])) errors.push(`${key}: expected 64 hex characters`);
}
if (env.NEXTAUTH_SECRET && env.NEXTAUTH_SECRET.length < 32) {
  errors.push("NEXTAUTH_SECRET: expected at least 32 characters");
}
if (env.SMTP_PORT && (!/^\d{1,5}$/.test(env.SMTP_PORT) || Number(env.SMTP_PORT) < 1 || Number(env.SMTP_PORT) > 65535)) {
  errors.push("SMTP_PORT: invalid port");
}
if (env.ADMIN_EMAILS && env.ADMIN_EMAILS.split(",").some((email) => !/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(email.trim()))) {
  errors.push("ADMIN_EMAILS: expected comma-separated email addresses");
}

if (errors.length) {
  console.error("BLOCKED — MISSING OR INVALID PRODUCTION CONFIGURATION");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Local checks passed. Verify production credential provenance and service access before import.");
}
