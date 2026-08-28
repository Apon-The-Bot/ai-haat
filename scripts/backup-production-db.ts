/**
 * AI Haat — Production Database Backup Engine
 * Database-native, transaction-consistent, encrypted logical backup utility.
 * Authenticated AES-256-GCM encryption with SHA-256 integrity verification.
 *
 * Invariants:
 * 1. Covers full database (all tables, relations, triggers, indexes).
 * 2. Non-blocking InnoDB reads (--single-transaction).
 * 3. Never prints passwords or DATABASE_URL in stdout/stderr/logs.
 * 4. Immediate AES-256-GCM encryption (AIHAAT_BACKUP_V1 format).
 * 5. Automatic retention pruning (retains latest N backups).
 * 6. Overlap prevention via .backup.lock with stale lock detection.
 */

import { exec, execSync, spawn } from "child_process";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface BackupMetadata {
  format: "AIHAAT_BACKUP_V1";
  timestamp: string;
  database: string;
  host: string;
  encryptedFile: string;
  encryptedSize: number;
  sha256: string;
  ivHex: string;
  authTagHex: string;
  retentionKept: number;
}

export function parseDatabaseUrl(urlStr?: string) {
  const connectionUrl = urlStr || process.env.DATABASE_URL;
  if (!connectionUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const parsed = new URL(connectionUrl);
  return {
    host: parsed.hostname || "localhost",
    port: parsed.port || "3306",
    user: decodeURIComponent(parsed.username || "root"),
    password: decodeURIComponent(parsed.password || ""),
    database: parsed.pathname ? parsed.pathname.replace(/^\//, "") : "",
  };
}

export function getBackupEncryptionKey(): Buffer {
  const keyHex = process.env.BACKUP_ENCRYPTION_KEY;
  if (!keyHex) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("BACKUP_ENCRYPTION_KEY environment variable is required in production.");
    }
    // Safe deterministic development/test fallback key (32 bytes)
    return crypto.createHash("sha256").update("aihaat_dev_backup_key_fallback_only").digest();
  }

  if (keyHex.length === 64) {
    return Buffer.from(keyHex, "hex");
  }
  return crypto.createHash("sha256").update(keyHex).digest();
}

export async function createDatabaseBackup(options?: {
  outputDir?: string;
  customDbUrl?: string;
  encryptionKey?: Buffer;
}): Promise<BackupMetadata> {
  const dbConfig = parseDatabaseUrl(options?.customDbUrl);
  const backupDir = options?.outputDir || path.join(process.cwd(), "backups", "database");
  const lockFile = path.join(backupDir, ".backup.lock");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 1. Overlap Prevention & Stale Lock Handling
  if (fs.existsSync(lockFile)) {
    const stats = fs.statSync(lockFile);
    const ageMinutes = (Date.now() - stats.mtimeMs) / (1000 * 60);
    if (ageMinutes < 30) {
      throw new Error(`Backup is already running (locked ${Math.round(ageMinutes)}m ago).`);
    } else {
      console.warn("[Backup] Removing stale lock file (>30 mins old).");
      fs.unlinkSync(lockFile);
    }
  }

  fs.writeFileSync(lockFile, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const tempSqlFile = path.join(backupDir, `temp_${timestamp}.sql`);
  const encryptedFile = path.join(backupDir, `backup_${dbConfig.database}_${timestamp}.sql.enc`);
  const metaFile = path.join(backupDir, `backup_${dbConfig.database}_${timestamp}.meta.json`);

  try {
    console.log(`[Backup] Starting logical database backup for: ${dbConfig.database} @ ${dbConfig.host}`);

    // 2. Execute mysqldump / mariadb-dump
    const dumpBinary = detectDumpBinary();
    await executeDump(dumpBinary, dbConfig, tempSqlFile);

    const sqlStats = fs.statSync(tempSqlFile);
    if (sqlStats.size === 0) {
      throw new Error("Dump produced an empty SQL file.");
    }

    console.log(`[Backup] Raw dump captured (${(sqlStats.size / 1024).toFixed(1)} KB). Encrypting with AES-256-GCM...`);

    // 3. Encrypt with AES-256-GCM
    const key = options?.encryptionKey || getBackupEncryptionKey();
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const inputData = fs.readFileSync(tempSqlFile);
    const encryptedData = Buffer.concat([cipher.update(inputData), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Package format: [Header: AIHAAT_BACKUP_V1][IV: 12B][Tag: 16B][Ciphertext]
    const header = Buffer.from("AIHAAT_BACKUP_V1:", "utf8");
    const packagePayload = Buffer.concat([header, iv, authTag, encryptedData]);

    fs.writeFileSync(encryptedFile, packagePayload);

    // 4. Calculate SHA-256 Checksum
    const sha256 = crypto.createHash("sha256").update(packagePayload).digest("hex");

    // 5. Clean up temporary unencrypted dump immediately
    fs.unlinkSync(tempSqlFile);

    const meta: BackupMetadata = {
      format: "AIHAAT_BACKUP_V1",
      timestamp: new Date().toISOString(),
      database: dbConfig.database,
      host: dbConfig.host,
      encryptedFile: path.basename(encryptedFile),
      encryptedSize: packagePayload.length,
      sha256,
      ivHex: iv.toString("hex"),
      authTagHex: authTag.toString("hex"),
      retentionKept: 14,
    };

    fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2), "utf8");

    // 6. Retention Management (Keep last 14 backups)
    pruneOldBackups(backupDir, 14);

    console.log(`[Backup] ✅ Backup successfully completed and encrypted!`);
    console.log(`[Backup] Encrypted File: ${path.basename(encryptedFile)}`);
    console.log(`[Backup] SHA-256: ${sha256}`);

    return meta;
  } catch (err: any) {
    if (fs.existsSync(tempSqlFile)) {
      try { fs.unlinkSync(tempSqlFile); } catch {}
    }
    console.error(`[Backup] ❌ Backup failed:`, err.message);
    throw err;
  } finally {
    if (fs.existsSync(lockFile)) {
      try { fs.unlinkSync(lockFile); } catch {}
    }
  }
}

function detectDumpBinary(): string {
  try {
    execSync("mysqldump --version", { stdio: "ignore" });
    return "mysqldump";
  } catch {
    try {
      execSync("mariadb-dump --version", { stdio: "ignore" });
      return "mariadb-dump";
    } catch {
      // Fallback: If mysqldump CLI is missing in local environment, we note it
      return "mysqldump";
    }
  }
}

function executeDump(dumpBinary: string, dbConfig: ReturnType<typeof parseDatabaseUrl>, targetFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      `--host=${dbConfig.host}`,
      `--port=${dbConfig.port}`,
      `--user=${dbConfig.user}`,
      "--single-transaction",
      "--quick",
      "--skip-lock-tables",
      "--routines",
      "--triggers",
      dbConfig.database,
    ];

    const env = {
      ...process.env,
      MYSQL_PWD: dbConfig.password,
    };

    const outStream = fs.createWriteStream(targetFile);
    const child = spawn(dumpBinary, args, { env, stdio: ["ignore", "pipe", "pipe"] });

    let stderr = "";
    child.stdout.pipe(outStream);
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      outStream.close();
      reject(new Error(`Failed to launch ${dumpBinary}: ${err.message}`));
    });

    child.on("close", (code) => {
      outStream.close();
      if (code === 0) {
        resolve();
      } else {
        // Sanitize error message to prevent leaking any sensitive passwords
        const sanitizedErr = stderr.replace(/password: \S+/gi, "password: [REDACTED]");
        reject(new Error(`${dumpBinary} exited with code ${code}: ${sanitizedErr}`));
      }
    });
  });
}

function pruneOldBackups(backupDir: string, maxToKeep: number = 14) {
  try {
    const files = fs.readdirSync(backupDir);
    const encFiles = files
      .filter((f) => f.startsWith("backup_") && f.endsWith(".sql.enc"))
      .map((f) => ({
        name: f,
        fullPath: path.join(backupDir, f),
        mtime: fs.statSync(path.join(backupDir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime); // newest first

    if (encFiles.length > maxToKeep) {
      const toDelete = encFiles.slice(maxToKeep);
      for (const item of toDelete) {
        fs.unlinkSync(item.fullPath);
        const metaPath = item.fullPath.replace(/\.sql\.enc$/, ".meta.json");
        if (fs.existsSync(metaPath)) {
          fs.unlinkSync(metaPath);
        }
        console.log(`[Retention] Pruned old backup: ${item.name}`);
      }
    }
  } catch (err: any) {
    console.warn(`[Retention] Backup pruning warning:`, err.message);
  }
}

if (require.main === module) {
  createDatabaseBackup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
