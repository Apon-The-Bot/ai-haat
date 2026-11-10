# 05 — DATABASE & DATA INTEGRITY AUDIT

This audit reviews schema normalization, migration safety, foreign key relationships, index coverage, transaction atomicity, and financial precision across the 58 Prisma models and 35 enums.

---

## 1. Database Architecture Overview

- **RDBMS Engine:** MySQL 8.0 (Hostinger Cloud Database: `srv1497.hstgr.io:3306`)
- **ORM:** Prisma 5.19.1
- **Models:** 58 models defined in `prisma/schema.prisma`
- **Enums:** 35 enum definitions
- **Migration State:** 2 checked-in SQL migrations:
  1. `prisma/migrations/0_init`
  2. `prisma/migrations/20260828_money_decimal_and_indexes`

---

## 2. Critical Database Findings

### 2.1 Financial Precision Schema Drift (Float vs DECIMAL)
- **Finding ID:** AUDIT-014
- **Severity:** High
- **Description:**
  On August 28, 2026, migration `20260828_money_decimal_and_indexes` was drafted to convert financial columns from `Float` to `DECIMAL(12, 2)`:
  ```sql
  -- prisma/migrations/20260828_money_decimal_and_indexes/migration.sql
  ALTER TABLE `users` MODIFY `walletBalanceBDT` DECIMAL(12, 2) NOT NULL DEFAULT 0.00;
  ALTER TABLE `orders` MODIFY `subtotalBDT` DECIMAL(12, 2) NOT NULL,
                       MODIFY `discountBDT` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
                       MODIFY `totalBDT` DECIMAL(12, 2) NOT NULL;
  ```
  However, `prisma/schema.prisma` **was never updated to match**. The active schema file continues to define:
  ```prisma
  // prisma/schema.prisma:254
  walletBalanceBDT Float @default(0.0)

  // prisma/schema.prisma:429-431
  subtotalBDT Float
  discountBDT Float @default(0.0)
  totalBDT    Float
  ```
- **Consequences:**
  1. If an operator or CI pipeline runs `prisma db push` (recommended in `DEPLOYMENT.md` Step 3), Prisma detects a schema divergence and executes `ALTER TABLE` to revert the columns from `DECIMAL(12, 2)` back to `Double` (Float).
  2. In JavaScript, floating-point arithmetic causes precision loss (e.g. `199.99 - 0.20 = 199.78999999999999`), which can lead to wallet balance discrepancies, order amount mismatch errors during gateway verification, and inaccurate ledger balancing.
- **Remediation:** Update `prisma/schema.prisma` across all monetary fields to `@db.Decimal(12, 2)` with TypeScript `Prisma.Decimal` handling, and generate a canonical migration via `prisma migrate dev`.

---

### 2.2 Missing Indexes on Critical Foreign Keys
- **Finding ID:** AUDIT-015
- **Severity:** Medium
- **Description:**
  Relational query performance analysis revealed that several key foreign relations lack explicit composite or single-column indexes:
  - `Variation.productId`: Queried constantly on every product detail page and catalog query (`prisma.variation.findMany({ where: { productId } })`).
  - `ProductRequest.status`: Filtered by admin dashboard to view pending product requests.
  - `Session.userId`: NextAuth lookup for user sessions.
  - `DeliveredKey.stockId`: Filtered during stock audit and warranty replacement checks.
- **Consequences:** Under high table cardinality (thousands of variations and stock items), MySQL performs full-table scans for unindexed foreign keys, causing high query latency and connection pool exhaustion.
- **Remediation:** Add explicit `@@index` directives in `prisma/schema.prisma`:
  ```prisma
  model Variation {
    // ...
    @@index([productId])
    @@map("variations")
  }

  model ProductRequest {
    // ...
    @@index([status, createdAt])
    @@map("product_requests")
  }
  ```

---

### 2.3 Concurrency & Race-Condition Controls in Mutations
- **Analysis:**
  - **Wallet Top-Up:** `src/lib/commerce/wallet-topup.ts` uses `prisma.$transaction` and enforces `@unique` on `trxId` at the database level. If two webhook/callback requests race, the second hits a unique constraint violation and is safely ignored as idempotent.
  - **Wallet Purchase:** `src/app/api/wallet/purchase/route.ts#L94-L102` uses `tx.user.updateMany({ where: { id: user.id, walletBalanceBDT: { gte: requiredAmount } }, data: { walletBalanceBDT: { decrement: requiredAmount } } })`. This atomic conditional check prevents negative wallet balances.
  - **Digital Stock Claiming:** `src/lib/commerce/inventory.ts#L291-L305` uses `tx.digitalStock.updateMany({ where: { id: available.id, status: available.status }, data: { status: "DELIVERED", assignedOrderId: orderId } })`. If `claimResult.count === 0`, it detects collision and skips the row, preventing double allocation.
- **Verdict:** Transactional mutation logic in the commerce core demonstrates strong concurrency discipline.

---

### 2.4 Unbounded Database Growth & Missing Retention Policies
- **Analysis:** Several logging models accumulate rows indefinitely:
  1. `AnalyticsEvent`: Tracks page views, clicks, and checkout events.
  2. `EmailEventLog`: Tracks email opens and clicks.
  3. `NotificationDelivery`: Tracks individual delivery attempts.
  4. `ReferralClick`: Tracks every affiliate URL click.
- **Impact:** Over 12–24 months, these append-only logging tables will grow to millions of rows, degrading query performance on the shared Hostinger MySQL instance.
- **Remediation:** Establish automated 90-day data retention cleanup tasks in `src/app/api/cron/**` or configure MySQL table partitioning for high-volume event tables.
