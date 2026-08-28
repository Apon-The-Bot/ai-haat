/**
 * AI Haat — Uploaded Assets & Static Files Backup Engine
 * Creates encrypted archives of mutable user/product uploads in public/uploads.
 * Authenticated AES-256-GCM encryption with SHA-256 integrity verification.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getBackupEncryptionKey } from "./backup-production-db";

export interface UploadsBackupMetadata {
  format: "AIHAAT_UPLOADS_V1";
  timestamp: string;
  filesCount: number;
  totalSizeBytes: number;
  encryptedFile: string;
  encryptedSize: number;
  sha256: string;
}

export async function backupUploads(options?: {
  uploadsDir?: string;
  outputDir?: string;
  encryptionKey?: Buffer;
}): Promise<UploadsBackupMetadata> {
  const uploadsDir = options?.uploadsDir || path.join(process.cwd(), "public", "uploads");
  const backupDir = options?.outputDir || path.join(process.cwd(), "backups", "uploads");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const encryptedFile = path.join(backupDir, `uploads_${timestamp}.tar.enc`);
  const metaFile = path.join(backupDir, `uploads_${timestamp}.meta.json`);

  // Recursively collect all files in uploads
  const allFiles: { relativePath: string; buffer: Buffer; size: number }[] = [];
  function scan(dir: string, base: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.join(base, entry.name);
      if (entry.isDirectory()) {
        scan(full, rel);
      } else if (entry.isFile()) {
        const buf = fs.readFileSync(full);
        allFiles.push({ relativePath: rel.replace(/\\/g, "/"), buffer: buf, size: buf.length });
      }
    }
  }

  scan(uploadsDir, "");

  const totalRawBytes = allFiles.reduce((acc, f) => acc + f.size, 0);

  // Bundle into a structured JSON manifest archive
  const archivePayload = JSON.stringify({
    version: "1.0",
    createdAt: new Date().toISOString(),
    files: allFiles.map((f) => ({
      path: f.relativePath,
      contentBase64: f.buffer.toString("base64"),
    })),
  });

  const rawBuffer = Buffer.from(archivePayload, "utf8");

  // Encrypt with AES-256-GCM
  const key = options?.encryptionKey || getBackupEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encryptedData = Buffer.concat([cipher.update(rawBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const header = Buffer.from("AIHAAT_UPLOADS_V1:", "utf8");
  const finalPackage = Buffer.concat([header, iv, authTag, encryptedData]);

  fs.writeFileSync(encryptedFile, finalPackage);

  const sha256 = crypto.createHash("sha256").update(finalPackage).digest("hex");

  const meta: UploadsBackupMetadata = {
    format: "AIHAAT_UPLOADS_V1",
    timestamp: new Date().toISOString(),
    filesCount: allFiles.length,
    totalSizeBytes: totalRawBytes,
    encryptedFile: path.basename(encryptedFile),
    encryptedSize: finalPackage.length,
    sha256,
  };

  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2), "utf8");

  console.log(`[Uploads Backup] ✅ Encrypted ${allFiles.length} uploaded files (${(finalPackage.length / 1024).toFixed(1)} KB).`);
  console.log(`[Uploads Backup] SHA-256: ${sha256}`);

  return meta;
}

if (require.main === module) {
  backupUploads()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
