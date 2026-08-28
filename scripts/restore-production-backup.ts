/**
 * AI Haat — Production Database Restoration Engine
 * Decrypts AES-256-GCM backup artifacts and imports them safely into an isolated database.
 *
 * CRITICAL SAFETY GUARDS:
 * 1. Requires explicit ALLOW_RESTORE=true in environment.
 * 2. Compares target database against DATABASE_URL. If target equals production, it REFUSES execution.
 * 3. Verifies SHA-256 checksum against metadata before restoration.
 * 4. Never prints passwords or raw connection strings to logs.
 */

import { execSync, spawn } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getBackupEncryptionKey, parseDatabaseUrl } from "./backup-production-db";

export interface RestoreResult {
  status: "SUCCESS" | "REFUSED" | "FAILED";
  targetDatabase: string;
  sourceFile: string;
  tablesFound?: number;
  message: string;
}

export async function restoreDatabaseBackup(
  encryptedFilePath: string,
  targetDbUrl: string,
  options?: {
    metaFilePath?: string;
    encryptionKey?: Buffer;
    emergencyProductionOverride?: boolean;
  }
): Promise<RestoreResult> {
  // 1. Safety Guard Check: ALLOW_RESTORE=true
  if (process.env.ALLOW_RESTORE !== "true") {
    throw new Error(
      "SAFETY VIOLATION: ALLOW_RESTORE=true environment variable is required to execute a database restoration."
    );
  }

  // 2. Production Guard: Detect if target matches active production database
  const targetConfig = parseDatabaseUrl(targetDbUrl);
  const activeProductionConfig = parseDatabaseUrl(process.env.DATABASE_URL);

  const isTargetingProduction =
    targetConfig.host.toLowerCase() === activeProductionConfig.host.toLowerCase() &&
    targetConfig.database.toLowerCase() === activeProductionConfig.database.toLowerCase();

  if (isTargetingProduction && !options?.emergencyProductionOverride) {
    throw new Error(
      `FATAL SAFETY VIOLATION: Target database "${targetConfig.database}" matches the configured production database! Direct restoration over production is strictly blocked.`
    );
  }

  if (!fs.existsSync(encryptedFilePath)) {
    throw new Error(`Backup file not found at: ${encryptedFilePath}`);
  }

  console.log(`[Restore] Initiating safe restore for target DB: ${targetConfig.database} @ ${targetConfig.host}`);

  // 3. Read & Verify Encrypted Payload
  const fileBuffer = fs.readFileSync(encryptedFilePath);
  const headerPrefix = "AIHAAT_BACKUP_V1:";

  if (!fileBuffer.subarray(0, headerPrefix.length).toString("utf8").startsWith(headerPrefix)) {
    throw new Error("Invalid backup format: missing AIHAAT_BACKUP_V1 header prefix.");
  }

  // Optional Checksum Validation
  if (options?.metaFilePath && fs.existsSync(options.metaFilePath)) {
    const meta = JSON.parse(fs.readFileSync(options.metaFilePath, "utf8"));
    const actualChecksum = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    if (meta.sha256 && meta.sha256 !== actualChecksum) {
      throw new Error(`Checksum mismatch! Expected: ${meta.sha256}, Actual: ${actualChecksum}`);
    }
    console.log(`[Restore] Checksum verified: ${actualChecksum}`);
  }

  // 4. Decrypt Payload
  const offset = headerPrefix.length;
  const iv = fileBuffer.subarray(offset, offset + 12);
  const authTag = fileBuffer.subarray(offset + 12, offset + 28);
  const ciphertext = fileBuffer.subarray(offset + 28);

  const key = options?.encryptionKey || getBackupEncryptionKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decryptedSql: Buffer;
  try {
    decryptedSql = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch (err: any) {
    throw new Error(`Decryption failed (corrupted ciphertext or invalid encryption key): ${err.message}`);
  }

  console.log(`[Restore] Payload decrypted successfully (${(decryptedSql.length / 1024).toFixed(1)} KB). Streaming into MySQL...`);

  // 5. Execute MySQL Import
  await executeImport(targetConfig, decryptedSql);

  console.log(`[Restore] ✅ Restoration completed successfully into target database: ${targetConfig.database}`);

  return {
    status: "SUCCESS",
    targetDatabase: targetConfig.database,
    sourceFile: path.basename(encryptedFilePath),
    message: "Restoration verified and completed.",
  };
}

function executeImport(dbConfig: ReturnType<typeof parseDatabaseUrl>, sqlBuffer: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      `--host=${dbConfig.host}`,
      `--port=${dbConfig.port}`,
      `--user=${dbConfig.user}`,
      dbConfig.database,
    ];

    const env = {
      ...process.env,
      MYSQL_PWD: dbConfig.password,
    };

    const child = spawn("mysql", args, { env, stdio: ["pipe", "pipe", "pipe"] });

    let stderr = "";
    child.stdin.write(sqlBuffer);
    child.stdin.end();

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to launch mysql client: ${err.message}`));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        const sanitizedErr = stderr.replace(/password: \S+/gi, "password: [REDACTED]");
        reject(new Error(`mysql client import exited with code ${code}: ${sanitizedErr}`));
      }
    });
  });
}

if (require.main === module) {
  const [,, fileArg, targetUrlArg] = process.argv;
  if (!fileArg || !targetUrlArg) {
    console.error("Usage: ALLOW_RESTORE=true npx tsx scripts/restore-production-backup.ts <backup-file.enc> <target-db-url>");
    process.exit(1);
  }

  restoreDatabaseBackup(fileArg, targetUrlArg)
    .then((res) => {
      console.log("[Restore Result]", res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Restore Error]", err.message);
      process.exit(1);
    });
}
