# AI Haat — Production Readiness, Security, Backup & Deployment Report

- **Application**: AI Haat (`https://aihaat.shop`)
- **Hosting Platform**: Hostinger Managed Node.js 22 (`u298980084`, Order `1009799228`)
- **Database Server**: `in-mum-web1497.main-hosting.eu` (`srv1497.hstgr.io:3306`, MariaDB `11.8.9-MariaDB-log`)
- **Production Database**: `u298980084_ai_haat` (68 tables, InnoDB)
- **Assessment Date**: 2026-11-11

---

## Status Classification Summary

| Area | Status | Evidence Summary |
|---|---|---|
| Missing `orders.metaConsentId` Fix | **VERIFIED** | Migration `20261110_meta_tracking` applied and baselined; zero runtime errors since `17:38 UTC`. |
| Production Encrypted Database Backup | **FIXED & VERIFIED** | Fresh `AES-256-GCM` backup captured (`backup_u298980084_ai_haat_2026-11-10T18-14-59-624Z.sql.enc`, 302 KB SQL, 68 tables, SHA-256 verified). |
| Cryptographic Decryption & Content Audit | **VERIFIED** | In-memory decryption (`--verify-only`) confirmed 68 `CREATE TABLE` DDLs, 9 users, 80 orders, 102 order items, 31 delivered keys, 3 wallet transactions. |
| Isolated MySQL Server Restore Rehearsal | **BLOCKED / REQUIRES APPROVAL** | `restore-production-backup.ts` blocks restoring over production (`ALLOW_RESTORE` + target guard). No isolated staging MySQL DB is provisioned yet. |
| Development vs Production Isolation | **FIXED & VERIFIED** | Added `scripts/db-env-guard.mjs` (`predev`, `db:migrate:dev`, `db:push`) and `.env.development.example`. Local dev/migration commands now block when `.env` targets production. |
| Remote MySQL `%` Access Restriction | **REQUIRES APPROVAL** | Least-privilege plan prepared. Not executed silently to prevent disconnecting production if `DATABASE_URL` in hPanel uses `srv1497.hstgr.io` instead of `127.0.0.1`. |
| Deployment Migration & Drift Gate | **FIXED & VERIFIED** | `scripts/db-predeploy-check.mjs` validates target, Prisma client, pending SQL, material vs non-material drift, backup SHA-256, and live `/api/health`. |
| Remaining Prisma Schema Drift | **VERIFIED (LOW RISK)** | Read-only audit confirmed 0 missing tables/columns, 0 non-InnoDB tables, and 0 orphaned rows across all 8 empty `user_*` tables. |
| Public & Auth Boundary Verification | **VERIFIED** | `/`, `/login`, `/shop`, `/cart`, `/checkout`, `/api/health`, `/api/auth/session`, `/api/analytics/meta` return `200`; unauthenticated order/payment/admin routes return `401`. |
| Authenticated End-to-End Flows | **NOT TESTED** | Real Google OAuth login, authenticated checkout payment creation, and admin mutations were not executed (no test session token; live financial mutations prohibited). |

---

## 1. Database Backup Status (`FIXED & VERIFIED`)

- **Hostinger MCP Capability Finding**:
  - Searched `hostinger` and `hostinger-hosting` MCP servers (`backup`, `database`, `cron`).
  - Hostinger MCP exposes backup endpoints only for VPS (`VPS_getBackupsV1`), not for shared/CloudLinux MySQL databases.
  - `hosting_listAccountCronJobsV1` for `u298980084` returned `[]` (no server-side cron job is scheduled on Hostinger).
- **Backup Engine Enhancement & Execution**:
  - Because `mysqldump` / `mariadb-dump` CLI binaries are not installed on this Windows workstation, `scripts/lib/prisma-sql-dump.ts` was implemented and wired into `scripts/backup-production-db.ts` as an automatic fallback.
  - Executed a full logical SQL dump of `u298980084_ai_haat` over a single read-only Prisma connection and immediately encrypted it with `AES-256-GCM` (`AIHAAT_BACKUP_V1:`).
- **Verified Backup Artifact**:
  - **Encrypted File**: `backups/database/backup_u298980084_ai_haat_2026-11-10T18-14-59-624Z.sql.enc`
  - **Metadata File**: `backups/database/backup_u298980084_ai_haat_2026-11-10T18-14-59-624Z.meta.json`
  - **Timestamp**: `2026-11-10T18:16:22.143Z`
  - **Raw SQL Size**: `302,049 bytes` (`295.0 KB`)
  - **SHA-256**: `c56da370738396a799640cce0a84c12c9a3f50d6df5ae7caa8f216a75feffab7`
  - **Git Protection**: Stored outside `public/`; matched by `.gitignore` rules `/backups/`, `*.enc`, and `*.sql`.

---

## 2. Restore-Test Status (`VERIFIED` In-Memory / `BLOCKED` Pending Isolated Staging DB)

- **Cryptographic & Structural Verification (`VERIFIED`)**:
  - Added `--verify-only` mode to `scripts/restore-production-backup.ts`.
  - Verified `SHA-256` hash, `AES-256-GCM` authentication tag decryption, `68/68` `CREATE TABLE` DDL definitions (including `orders.metaConsentId`, `orders.metaAttribution`, and `advertising_consents`), and exact row counts:
    - `users`: `9`, `orders`: `80`, `order_items`: `102`, `delivered_keys`: `31`, `digital_stocks`: `28`, `products`: `17`, `variations`: `24`, `coupons`: `40`, `wallet_transactions`: `3`, `site_settings`: `17`, `_prisma_migrations`: `3`.
- **Live SQL Import into Isolated Server (`BLOCKED / REQUIRES APPROVAL`)**:
  - Direct restoration over `u298980084_ai_haat` is strictly blocked by `scripts/restore-production-backup.ts` (`FATAL SAFETY VIOLATION`).
  - No local MySQL server is installed on this workstation, and the other 7 databases on Hostinger account `u298980084` belong to separate domains/applications.
  - To complete a full MySQL import rehearsal, either provision a local MySQL instance (`127.0.0.1/aihaat_restore_test`) or approve creating a temporary `u298980084_restore_test` database on Hostinger.

---

## 3. Development Database Isolation Status (`FIXED & VERIFIED`)

- **Risk Identified**:
  - Local `.env` pointed to `srv1497.hstgr.io/u298980084_ai_haat`.
  - Inspection of `u298980084_ai_haat.products` revealed 11 `test-*` products (`test-prod-dl-*`, `test-win11-*`, `test-chatgpt-*`, `test-lovable-ws-*`) and all 17 products set to `status: "ARCHIVED"`, caused by prior local test runs executing against `.env`.
- **Safeguards Implemented**:
  1. Created `scripts/db-env-guard.mjs` and wired it into `package.json`:
     - `predev` (`npm run dev`) and `npm run db:guard` block with exit code `1` whenever `.env` / `.env.local` targets `srv1497.hstgr.io` or `u298980084_*` (unless `ALLOW_PRODUCTION_DB_IN_DEV=true`).
     - `npm run db:migrate:dev` and `npm run db:push` (`--mode=dev-only`) **unconditionally refuse** to run against production.
  2. Created `.env.development.example` with isolated local database defaults (`mysql://aihaat_dev:...@127.0.0.1:3306/aihaat_dev`) and non-production keys.
  3. Preserved existing `.env`, `.env.local`, and `production.env` without destructive overwrite; confirmed all three are gitignored and have zero commits in Git history.

---

## 4. MySQL Access Control Findings (`VERIFIED` Audit / `REQUIRES APPROVAL` to Change)

- **Active Hostinger Remote MySQL Rules for `u298980084_ai_haat`**:
  - `%` (any host)
  - `113.11.53.3`
- **Database Server & Grant Audit**:
  - Underlying host: `in-mum-web1497.main-hosting.eu` (`srv1497.hstgr.io:3306`).
  - Current workstation outbound IP seen by MariaDB: `103.25.251.200`.
  - MariaDB grant for `u298980084_ai_haat_db@%` enforces `MAX_CONNECTIONS_PER_HOUR 500` and `MAX_STATEMENT_TIME 120.000000`.
  - Production `/api/health` reports `checks.database.latencyMs: 1`, confirming the Node.js runtime runs on the same Hostinger server.
- **Why `%` Was Not Removed Automatically**:
  - Hostinger MCP masks the value of `DATABASE_URL` in `hosting_listNode_jsEnvironmentVariablesV1`.
  - If the production Node.js environment variable uses `@srv1497.hstgr.io` instead of `@127.0.0.1`, MariaDB resolves the connection via the external interface (`@%`) rather than `@localhost`. Deleting `%` before switching `DATABASE_URL` to `127.0.0.1` would immediately lock out production.
- **Least-Privilege Remediation Plan (Requires Operator Approval)**:
  1. In Hostinger hPanel (or via `hosting_replaceNode_jsEnvironmentVariablesV1`), verify `DATABASE_URL` uses `@127.0.0.1:3306/u298980084_ai_haat`.
  2. Whitelist the operator's static management IP via `hosting_createDatabaseRemoteConnectionV1`.
  3. Delete the `%` rule via `hosting_deleteDatabaseRemoteConnectionV1` (`username: "u298980084"`, `name: "u298980084_ai_haat"`, `ip: "%"`).
  4. Immediately verify `https://aihaat.shop/api/health` returns `200 HEALTHY`.

---

## 5. Production Deployment Guard Results (`FIXED & VERIFIED`)

- Upgraded `scripts/db-predeploy-check.mjs` (`191` lines):
  - Enforces `DB_EXPECTED_TARGET` match against `DATABASE_URL`.
  - Validates `prisma/schema.prisma` and checks for generated `@prisma/client`.
  - Checks `prisma migrate status` and blocks on failed migrations (`P3009`/`P3018`).
  - Scans pending migration SQL and blocks destructive statements (`DROP`, `TRUNCATE`, `DELETE`, `RENAME`, `NOT NULL` without `DEFAULT`).
  - Separates **material schema drift** (missing tables/columns -> hard `BLOCKED`) from **non-material drift** (`WARN`).
  - Verifies backup recency (`<= 24h`) and recomputes the `SHA-256` checksum of the `.sql.enc` artifact in `backups/database/`.
  - Supports `--smoke-url=https://aihaat.shop` for lightweight post-deploy verification.
- **Verified Execution**:
  - Missing/wrong `DB_EXPECTED_TARGET` -> `BLOCKED (exit 1)`.
  - Correct target + `--require-backup --smoke-url=https://aihaat.shop` -> `PASS (exit 0)`.

---

## 6. Prisma Schema Drift Assessment (`VERIFIED — LOW SEVERITY`)

Read-only audit across all 68 tables in `u298980084_ai_haat`:

| Drift Item | Production State | Schema State | Impact & Recommendation |
|---|---|---|---|
| 8 `user_*` foreign keys (`user_restrictions`, `user_status_records`, `user_admin_notes`, `user_activity_logs`, `user_tags`, `user_device_instances`, `user_technical_observations`, `user_consent_records`) | Missing FK constraints; **0 rows** and **0 orphans** in all 8 tables | `ON DELETE CASCADE ON UPDATE CASCADE` | **Low**. Safe to add in a future maintenance window; no data inconsistency exists today. |
| `DATETIME` vs `DATETIME(3)` on the 8 `user_*` tables | `datetime` (second precision), empty tables | `DATETIME(3)` (millisecond precision) | **Cosmetic / Low**. Does not cause Prisma read/write errors. |
| `delivered_keys_stockId_fkey` & `sessions_userId_fkey` index names | Indexed under `*_fkey` name | `@@index` expects `*_idx` name | **Cosmetic (Zero impact)**. Columns are already indexed in InnoDB. Do not drop/recreate on live traffic. |
| `product_requests (status, createdAt)` composite index | Missing (`2` rows total in table) | `@@index([status, createdAt])` | **Low**. Table has only 2 rows; negligible query impact. |

---

## 7. Authentication, Admin & Checkout Verification Results

| Workflow / Endpoint | Method | Result | Classification |
|---|---|---|---|
| Health Endpoint (`/api/health`) | `GET` | `200 OK` (`status: "HEALTHY"`, DB latency `1ms`, RSS `214 MB`) | **VERIFIED** |
| Homepage (`/`) & Storefront (`/shop`) | `GET` | `200 OK` (no Prisma errors in runtime logs) | **VERIFIED** |
| Login Page (`/login`) | `GET` | `200 OK` (`1.7s–2.8s` TTFB, `x-nextjs-cache: HIT`) | **VERIFIED** |
| Auth Session & Providers (`/api/auth/session`, `/api/auth/providers`) | `GET` | `200 OK` | **VERIFIED** |
| Unauthenticated Profile (`/api/auth/me`) | `GET` | `401 Unauthorized` | **VERIFIED** |
| Product Catalog API (`/api/products`) | `GET` | `200 OK` (`products: []` because all 17 DB products have `status: "ARCHIVED"`) | **VERIFIED (Data Finding)** |
| Product Detail Page (`/product/windows-11-pro-retail-key`) | `GET` | `200 OK` route shell; `/api/products/windows-11-pro-retail-key` returns `404` (`ARCHIVED`) | **VERIFIED** |
| Cart & Checkout Routes (`/cart`, `/checkout`) | `GET` | `200 OK` | **VERIFIED** |
| Checkout Order/Payment Auth Guards (`/api/orders`, `/api/payment/create`, `/api/wallet/purchase`) | `POST` | `401 Unauthorized` (blocks unauthenticated order/payment creation) | **VERIFIED** |
| Customer Order History Guard (`/api/orders`) | `GET` | `401 Unauthorized` when unauthenticated; `/dashboard/orders` renders `200` client guard shell | **VERIFIED** |
| Admin API Guards (`/api/admin/dashboard/stats`, `/api/admin/users`, `/api/admin/products`, `/api/admin/integrations/meta`) | `GET` / `POST` | `401 Unauthorized` | **VERIFIED** |
| Meta Pixel Public Config (`/api/analytics/meta`) | `GET` | `200 OK` (`pixelId: ""`, `available: false`; no CAPI token exposed) | **VERIFIED** |
| End-to-End Authenticated Google Login, Checkout Payment, & Admin Mutations | Interactive | Not executed (no test OAuth session; live payment mutations prohibited) | **NOT TESTED** |

---

## 8. Remaining Risks & Blockers

1. **All 17 Products in Production Are `ARCHIVED` (`ACTION REQUIRED`)**:
   - `/api/products` returns `0` active products because the 6 catalog products (`p-windows-11-pro`, `p-netflix-4k-uhd`, `p-nordvpn`, `p-idm-lifetime`, `p-telegram-premium`, `p-google-play-card`) and 11 `test-*` products are marked `ARCHIVED`. An administrator should re-activate legitimate catalog products and delete the `test-*` products via the Admin Panel.
2. **Local `.env` Still Contains Production Credentials (`ACTION REQUIRED`)**:
   - `scripts/db-env-guard.mjs` now blocks `npm run dev`, `db:migrate:dev`, and `db:push`, but the operator should replace `.env` with `.env.development.example` once a local MySQL database is created.
3. **Remote MySQL `%` Rule Remains Open (`REQUIRES APPROVAL`)**:
   - Restrict after confirming `DATABASE_URL` in Hostinger hPanel uses `127.0.0.1`.
4. **No Server-Side Scheduled Backup Cron (`ACTION REQUIRED`)**:
   - Configure a daily cron job or offsite S3 sync (`BACKUP_STORAGE_PROVIDER=s3`) so encrypted backups run automatically without manual CLI invocation.
5. **Health Endpoint Warnings (`LOW`)**:
   - `/api/health` reports `payment_gateway: WARN` (`PIPRAPAY_MERCHANT_ID` not set in Hostinger env) and `telegram_bot: WARN` (Telegram env vars not configured).

---

## 9. Exact Files Changed & Production Configuration Changes

- **Files Created / Updated**:
  - `scripts/lib/prisma-sql-dump.ts` (new, 179 lines — Prisma logical SQL dump & `AES-256-GCM` backup verifier)
  - `scripts/backup-production-db.ts` (updated, 266 lines — automatic fallback to Prisma SQL dump when `mysqldump` is absent)
  - `scripts/restore-production-backup.ts` (updated, 176 lines — added `--verify-only` integrity & content verification mode)
  - `scripts/db-env-guard.mjs` (new, 87 lines — development vs production database target guard)
  - `scripts/db-predeploy-check.mjs` (updated, 191 lines — target, client, material drift, backup `SHA-256`, and `/api/health` smoke gate)
  - `.env.development.example` (new, 43 lines — isolated local development template)
  - `package.json` (updated — added `predev`, `db:guard`, `db:migrate:dev`, `db:push`, and `--require-backup` on `db:check`/`db:deploy`)
  - `docs/DATABASE_DEPLOYMENT.md` (updated, 66 lines)
  - `docs/PRODUCTION_READINESS_REPORT.md` (new, this report)
- **Production Configuration / Database Mutations Performed in This Session**:
  - **None** (read-only queries, encrypted backup capture, and non-destructive HTTP checks only).
