/**
 * AI Haat — Prisma-based MySQL/MariaDB Logical SQL Dump & Backup Verifier
 * Used as an automatic fallback when mysqldump / mariadb-dump CLI binaries
 * are not installed on the operator workstation, and to verify encrypted
 * AIHAAT_BACKUP_V1 backup artifacts without touching production.
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import fs from "fs";

function escapeSqlString(str: string): string {
  return (
    "'" +
    str
      .replace(/\\/g, "\\\\")
      .replace(/\0/g, "\\0")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/'/g, "\\'")
      .replace(/\x1a/g, "\\Z") +
    "'"
  );
}

function serializeSqlValue(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "1" : "0";
  if (typeof val === "number") return Number.isFinite(val) ? String(val) : "NULL";
  if (typeof val === "bigint") return val.toString();
  if (val instanceof Date) {
    return `'${val.toISOString().slice(0, 23).replace("T", " ")}'`;
  }
  if (Buffer.isBuffer(val) || val instanceof Uint8Array) {
    return `X'${Buffer.from(val).toString("hex")}'`;
  }
  if (typeof val === "object") {
    const maybeDecimal = val as { toFixed?: () => string; toString?: () => string; d?: unknown };
    if (typeof maybeDecimal.toFixed === "function" && Array.isArray(maybeDecimal.d)) {
      return escapeSqlString(String(maybeDecimal.toString ? maybeDecimal.toString() : val));
    }
    return escapeSqlString(JSON.stringify(val));
  }
  return escapeSqlString(String(val));
}

export async function dumpDatabaseViaPrisma(targetFile: string, customDbUrl?: string): Promise<void> {
  const prisma = new PrismaClient(
    customDbUrl ? { datasources: { db: { url: customDbUrl } } } : undefined
  );
  const out = fs.createWriteStream(targetFile, { encoding: "utf8" });
  let streamErr: Error | null = null;
  out.on("error", (err) => {
    streamErr = err;
  });
  const write = (chunk: string) =>
    new Promise<void>((resolve, reject) => {
      if (streamErr) return reject(streamErr);
      if (!out.write(chunk)) out.once("drain", () => (streamErr ? reject(streamErr) : resolve()));
      else resolve();
    });

  try {
    const metaRows = await prisma.$queryRawUnsafe<Array<{ db: string; v: string }>>(
      "SELECT DATABASE() AS db, VERSION() AS v"
    );
    const dbName = metaRows[0]?.db || "unknown";
    const version = metaRows[0]?.v || "unknown";

    const tableRows = await prisma.$queryRawUnsafe<Array<Record<string, string>>>(
      "SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'"
    );
    const tables = tableRows
      .map((r) => Object.values(r)[0])
      .filter(Boolean)
      .sort();

    await write(`-- AIHAAT_LOGICAL_SQL_DUMP_V1\n`);
    await write(`-- Database: ${dbName}\n`);
    await write(`-- Server: ${version}\n`);
    await write(`-- GeneratedAt: ${new Date().toISOString()}\n`);
    await write(`-- TableCount: ${tables.length}\n`);
    await write(`SET FOREIGN_KEY_CHECKS=0;\nSET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";\nSET time_zone = "+00:00";\n\n`);

    for (const table of tables) {
      const safeTable = table.replace(/`/g, "``");
      const ddlRows = await prisma.$queryRawUnsafe<Array<Record<string, string>>>(
        `SHOW CREATE TABLE \`${safeTable}\``
      );
      const ddl = ddlRows[0]?.["Create Table"] || Object.values(ddlRows[0] || {})[1];
      if (!ddl) throw new Error(`Could not read CREATE TABLE DDL for ${table}`);

      const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT * FROM \`${safeTable}\``
      );

      await write(`-- TableSummary: ${table}:${rows.length}\n`);
      await write(`DROP TABLE IF EXISTS \`${safeTable}\`;\n${ddl};\n`);

      if (rows.length > 0) {
        const cols = Object.keys(rows[0]);
        const colList = cols.map((c) => `\`${c.replace(/`/g, "``")}\``).join(", ");
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const valuesSql = batch
            .map((row) => `(${cols.map((c) => serializeSqlValue(row[c])).join(", ")})`)
            .join(",\n  ");
          await write(`INSERT INTO \`${safeTable}\` (${colList}) VALUES\n  ${valuesSql};\n`);
        }
      }
      await write("\n");
    }

    await write(`SET FOREIGN_KEY_CHECKS=1;\n-- END_OF_AIHAAT_LOGICAL_SQL_DUMP\n`);
  } finally {
    await new Promise<void>((resolve) => out.end(resolve));
    await prisma.$disconnect();
  }
}

export interface BackupVerificationReport {
  validChecksum: boolean;
  validDecryption: boolean;
  decryptedBytes: number;
  tableCreateCount: number;
  hasEndMarker: boolean;
  tableRowCounts: Record<string, number>;
  criticalTablesPresent: boolean;
}

export function verifyEncryptedBackupFile(
  encryptedFilePath: string,
  metaFilePath: string,
  key: Buffer
): BackupVerificationReport {
  const fileBuffer = fs.readFileSync(encryptedFilePath);
  const meta = JSON.parse(fs.readFileSync(metaFilePath, "utf8"));
  const actualSha256 = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  const validChecksum = actualSha256 === meta.sha256;
  if (!validChecksum) {
    throw new Error(`SHA-256 mismatch: expected ${meta.sha256}, got ${actualSha256}`);
  }

  const headerPrefix = "AIHAAT_BACKUP_V1:";
  if (!fileBuffer.subarray(0, headerPrefix.length).toString("utf8").startsWith(headerPrefix)) {
    throw new Error("Missing AIHAAT_BACKUP_V1: header");
  }

  const offset = headerPrefix.length;
  const iv = fileBuffer.subarray(offset, offset + 12);
  const authTag = fileBuffer.subarray(offset + 12, offset + 28);
  const ciphertext = fileBuffer.subarray(offset + 28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const sql = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");

  const createMatches = sql.match(/^CREATE TABLE `/gm) || [];
  const tableRowCounts: Record<string, number> = {};
  const summaryRe = /^-- TableSummary: ([^:\r\n]+):(\d+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = summaryRe.exec(sql)) !== null) {
    tableRowCounts[m[1]] = Number(m[2]);
  }

  const required = [
    "users",
    "orders",
    "order_items",
    "wallet_transactions",
    "advertising_consents",
    "_prisma_migrations",
  ];
  const criticalTablesPresent =
    required.every((t) => sql.includes(`CREATE TABLE \`${t}\``)) &&
    sql.includes("`metaConsentId`") &&
    sql.includes("`metaAttribution`");

  return {
    validChecksum,
    validDecryption: true,
    decryptedBytes: Buffer.byteLength(sql, "utf8"),
    tableCreateCount: createMatches.length,
    hasEndMarker: sql.includes("END_OF_AIHAAT_LOGICAL_SQL_DUMP") || sql.includes("Dump completed"),
    tableRowCounts,
    criticalTablesPresent,
  };
}
