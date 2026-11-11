# Production Database & Deployment Runbook

Production: MariaDB `11.8.9-MariaDB-log` on Hostinger (`in-mum-web1497.main-hosting.eu` / `srv1497.hstgr.io`), database `u298980084_ai_haat`.
Hostinger Git auto-deployment builds from `main` using `npm run build` (`scripts/build.mjs`), which **never** executes database migrations automatically.

## 1. Development vs Production Isolation

- Local development commands (`npm run dev`, `npm run db:migrate:dev`, `npm run db:push`) are protected by `scripts/db-env-guard.mjs`.
- If `.env` or `.env.local` points to `srv1497.hstgr.io` or any `u298980084_*` database:
  - `npm run db:migrate:dev` and `npm run db:push` **unconditionally block** (`--mode=dev-only`).
  - `npm run dev` (`predev`) **blocks** unless `ALLOW_PRODUCTION_DB_IN_DEV=true` is explicitly set.
- Copy `.env.development.example` to `.env` for local work so local tools use an isolated `127.0.0.1/aihaat_dev` database. Keep production credentials only in `production.env` (gitignored) and Hostinger hPanel.

## 2. Encrypted Backup & Integrity Verification

`scripts/backup-production-db.ts` uses `mysqldump` / `mariadb-dump` when installed, and automatically falls back to the Prisma logical SQL dump engine (`scripts/lib/prisma-sql-dump.ts`) when native MySQL CLI binaries are absent.

```bash
# 1. Capture fresh AES-256-GCM encrypted backup (writes to backups/database/)
node --env-file=production.env ./node_modules/tsx/dist/cli.mjs scripts/backup-production-db.ts

# 2. Verify SHA-256 checksum, AES-256-GCM authTag decryption, and 68-table SQL structure
node --env-file=production.env ./node_modules/tsx/dist/cli.mjs scripts/restore-production-backup.ts \
  --verify-only backups/database/<backup-file>.sql.enc
```

## 3. Guarded Pre-Deployment Migration Workflow

1. Author and test the migration against a local development database (`npm run db:migrate:dev`).
2. Capture and verify a fresh production backup (`npm run backup:db`).
3. Run the read-only release gate against `production.env`:

   ```bash
   DB_EXPECTED_TARGET="srv1497.hstgr.io/u298980084_ai_haat" \
   node --env-file=production.env scripts/db-predeploy-check.mjs --require-backup --smoke-url=https://aihaat.shop
   ```

   The gate verifies:
   - `DATABASE_URL` matches `DB_EXPECTED_TARGET`.
   - `prisma validate` and generated `@prisma/client` are present.
   - `_prisma_migrations` has no failed migrations.
   - Pending SQL contains no unapproved destructive statements (`DROP`, `TRUNCATE`, `DELETE`, `RENAME`, `NOT NULL` without `DEFAULT`).
   - Live schema diff has no unrecorded material drift (missing tables or columns).
   - A backup newer than `DB_BACKUP_MAX_AGE_HOURS` (default 24h) exists in `backups/database/` and passes `SHA-256` verification.
4. Apply approved pending migrations:

   ```bash
   DB_EXPECTED_TARGET="srv1497.hstgr.io/u298980084_ai_haat" \
   node --env-file=production.env scripts/db-predeploy-check.mjs --apply --require-backup --smoke-url=https://aihaat.shop
   ```

## 4. Hostinger Connection Limits & Remote MySQL Least-Privilege Plan

- MariaDB grant `u298980084_ai_haat_db@%` enforces `MAX_CONNECTIONS_PER_HOUR 500` and `MAX_STATEMENT_TIME 120.000000`. Avoid polling loops or spawning excessive CLI connections.
- Before revoking the `%` Remote MySQL rule via Hostinger MCP (`hosting_deleteDatabaseRemoteConnectionV1`):
  1. Confirm in Hostinger hPanel that the Node.js `DATABASE_URL` uses `127.0.0.1:3306` (same host as `in-mum-web1497.main-hosting.eu`, verified at 1ms latency via `/api/health`).
  2. Add the operator workstation static IP (`103.25.251.200` or current IP) via `hosting_createDatabaseRemoteConnectionV1` if remote CLI administration is needed.
  3. Obtain explicit operator approval, then delete the `%` rule and immediately verify `https://aihaat.shop/api/health`.
