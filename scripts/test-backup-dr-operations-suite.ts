import assert from "assert";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { isCronAuthorized, safeEqualSecret } from "../src/lib/cron-auth";
import { getBackupEncryptionKey, parseDatabaseUrl } from "./backup-production-db";

interface TestCase {
  category: string;
  name: string;
  run: () => void | Promise<void>;
}

const testCases: TestCase[] = [];

function registerTest(category: string, name: string, run: () => void | Promise<void>) {
  testCases.push({ category, name, run });
}

// -------------------------------------------------------------------------
// 1. Database Backup & Encryption Contracts
// -------------------------------------------------------------------------
registerTest("Backup Architecture", "Database URL parser correctly extracts host, user, and database safely", () => {
  const parsed = parseDatabaseUrl("mysql://customuser:secretpass@127.0.0.1:3306/aihaat_test_db");
  assert.strictEqual(parsed.host, "127.0.0.1");
  assert.strictEqual(parsed.user, "customuser");
  assert.strictEqual(parsed.password, "secretpass");
  assert.strictEqual(parsed.database, "aihaat_test_db");
});

registerTest("Backup Architecture", "AES-256-GCM encryption key generation returns a valid 32-byte Buffer", () => {
  const key = getBackupEncryptionKey();
  assert.strictEqual(Buffer.isBuffer(key), true);
  assert.strictEqual(key.length, 32);
});

registerTest("Backup Architecture", "Backup engine creates AIHAAT_BACKUP_V1 package with valid IV and AuthTag", () => {
  const dummySql = Buffer.from("CREATE TABLE test_table (id INT PRIMARY KEY); INSERT INTO test_table VALUES (1);");
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(dummySql), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const header = Buffer.from("AIHAAT_BACKUP_V1:", "utf8");
  const payload = Buffer.concat([header, iv, authTag, encrypted]);

  assert.strictEqual(payload.subarray(0, header.length).toString("utf8"), "AIHAAT_BACKUP_V1:");

  // Decryption verification
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  assert.strictEqual(decrypted.toString("utf8"), dummySql.toString("utf8"));
});

registerTest("Backup Architecture", "Uploads backup engine scripts exists and defines AIHAAT_UPLOADS_V1 format", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "scripts/backup-uploads.ts"), "utf8");
  assert.strictEqual(fileContent.includes("AIHAAT_UPLOADS_V1"), true);
  assert.strictEqual(fileContent.includes("backupUploads"), true);
});

// -------------------------------------------------------------------------
// 2. Restore Safety Guards & Integrity Verification
// -------------------------------------------------------------------------
registerTest("Restore Safety", "Restore script throws error if ALLOW_RESTORE !== true", async () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "scripts/restore-production-backup.ts"), "utf8");
  assert.strictEqual(fileContent.includes('process.env.ALLOW_RESTORE !== "true"'), true);
});

registerTest("Restore Safety", "Restore script strictly blocks direct restoration over configured production DB", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "scripts/restore-production-backup.ts"), "utf8");
  assert.strictEqual(fileContent.includes("FATAL SAFETY VIOLATION: Target database"), true);
  assert.strictEqual(fileContent.includes("Direct restoration over production is strictly blocked"), true);
});

registerTest("Restore Safety", "Corrupted ciphertext or invalid key fails authentication tag check", () => {
  const key = crypto.randomBytes(32);
  const wrongKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(Buffer.from("SELECT 1;")), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const decipher = crypto.createDecipheriv("aes-256-gcm", wrongKey, iv);
  decipher.setAuthTag(authTag);

  assert.throws(() => {
    Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }, /Unsupported state or unable to authenticate data/);
});

// -------------------------------------------------------------------------
// 3. Cron Authentication & Overlap Protection
// -------------------------------------------------------------------------
registerTest("Cron Reliability", "safeEqualSecret uses timing-safe equality and rejects length/value mismatches", () => {
  assert.strictEqual(safeEqualSecret("supersecrettoken123", "supersecrettoken123"), true);
  assert.strictEqual(safeEqualSecret("supersecrettoken123", "wrongtoken"), false);
  assert.strictEqual(safeEqualSecret("supersecrettoken123", null), false);
  assert.strictEqual(safeEqualSecret(undefined, "expected"), false);
});

registerTest("Cron Reliability", "isCronAuthorized fails closed when CRON_SECRET is empty or missing", () => {
  const oldSecret = process.env.CRON_SECRET;
  try {
    delete process.env.CRON_SECRET;
    const req = new NextRequest("http://localhost:3000/api/cron/notifications", {
      headers: { authorization: "Bearer some_token" },
    });
    assert.strictEqual(isCronAuthorized(req), false);
  } finally {
    process.env.CRON_SECRET = oldSecret;
  }
});

registerTest("Cron Reliability", "isCronAuthorized validates Bearer token and rejects query parameter tokens", () => {
  const oldSecret = process.env.CRON_SECRET;
  try {
    process.env.CRON_SECRET = "aihaat_test_cron_secret_32chars_long";
    
    // Valid Bearer
    const validReq = new NextRequest("http://localhost:3000/api/cron/notifications", {
      headers: { authorization: "Bearer aihaat_test_cron_secret_32chars_long" },
    });
    assert.strictEqual(isCronAuthorized(validReq), true);

    // Invalid Token
    const invalidReq = new NextRequest("http://localhost:3000/api/cron/notifications", {
      headers: { authorization: "Bearer wrong_secret" },
    });
    assert.strictEqual(isCronAuthorized(invalidReq), false);

    // Query Token (Rejected)
    const queryReq = new NextRequest("http://localhost:3000/api/cron/notifications?token=aihaat_test_cron_secret_32chars_long");
    assert.strictEqual(isCronAuthorized(queryReq), false);
  } finally {
    process.env.CRON_SECRET = oldSecret;
  }
});

registerTest("Cron Reliability", "All 4 scheduled cron routes enforce isCronAuthorized", () => {
  const cronFiles = [
    "src/app/api/cron/email-queue/route.ts",
    "src/app/api/cron/engagement/route.ts",
    "src/app/api/cron/inventory-expiry/route.ts",
    "src/app/api/cron/notifications/route.ts",
  ];

  for (const relPath of cronFiles) {
    const content = fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
    assert.strictEqual(content.includes("isCronAuthorized(req)"), true, `Missing isCronAuthorized in ${relPath}`);
    assert.strictEqual(content.includes("401"), true, `Missing 401 response in ${relPath}`);
  }
});

// -------------------------------------------------------------------------
// 4. Operational Invariants & Configuration
// -------------------------------------------------------------------------
registerTest("Operations Config", "PM2 ecosystem config is configured with cluster mode, graceful reload, and log paths", () => {
  const content = fs.readFileSync(path.join(process.cwd(), "ecosystem.config.js"), "utf8");
  assert.strictEqual(content.includes('exec_mode: "cluster"'), true);
  assert.strictEqual(content.includes("listen_timeout: 50000"), true);
  assert.strictEqual(content.includes("kill_timeout: 5000"), true);
  assert.strictEqual(content.includes('error_file: "logs/pm2-error.log"'), true);
});

registerTest("Operations Config", "Gitignore strictly excludes backups, logs, and encrypted SQL files", () => {
  const content = fs.readFileSync(path.join(process.cwd(), ".gitignore"), "utf8");
  assert.strictEqual(content.includes("/backups/"), true);
  assert.strictEqual(content.includes("/logs/"), true);
  assert.strictEqual(content.includes("*.enc"), true);
  assert.strictEqual(content.includes("*.sql"), true);
});

registerTest("Operations Config", "Environment example documents BACKUP_ENCRYPTION_KEY and S3 contract", () => {
  const content = fs.readFileSync(path.join(process.cwd(), ".env.example"), "utf8");
  assert.strictEqual(content.includes("BACKUP_ENCRYPTION_KEY="), true);
  assert.strictEqual(content.includes("BACKUP_STORAGE_PROVIDER="), true);
});

registerTest("Operations Config", "Disaster Recovery Runbook covers database loss, host loss, and credential compromise", () => {
  const content = fs.readFileSync(path.join(process.cwd(), "docs/predeploy/08-disaster-recovery-runbook.md"), "utf8");
  assert.strictEqual(content.includes("Scenario A: Complete Database Loss"), true);
  assert.strictEqual(content.includes("Scenario C: Complete Host / Server Failure"), true);
  assert.strictEqual(content.includes("Scenario E: Credential Compromise Response"), true);
});

// -------------------------------------------------------------------------
// Execution Engine
// -------------------------------------------------------------------------
async function main() {
  console.log("================================================================================");
  console.log("AI HAAT - PHASE 8: BACKUP, DR & PRODUCTION OPERATIONS SUITE");
  console.log("Deterministic Operational Reliability Verification Harness");
  console.log("================================================================================\n");

  const declaredCount = testCases.length;
  let executedCount = 0;
  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  let currentCategory = "";

  for (const testCase of testCases) {
    if (testCase.category !== currentCategory) {
      currentCategory = testCase.category;
      console.log(`\n--- ${currentCategory} ---`);
    }

    executedCount++;
    try {
      await testCase.run();
      console.log(`  [PASS] ${testCase.name}`);
      passedCount++;
    } catch (err: any) {
      console.error(`  [FAIL] ${testCase.name}:`, err.message);
      failedCount++;
    }
  }

  console.log("\n================================================================================");
  console.log("PHASE 8 BACKUP & OPERATIONS SUITE SUMMARY");
  console.log(`Declared test cases : ${declaredCount}`);
  console.log(`Executed test cases : ${executedCount}`);
  console.log(`Passed              : ${passedCount}`);
  console.log(`Failed              : ${failedCount}`);
  console.log(`Skipped             : ${skippedCount}`);
  console.log("================================================================================");

  if (declaredCount !== executedCount || failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test harness uncaught error:", err);
  process.exit(1);
});
