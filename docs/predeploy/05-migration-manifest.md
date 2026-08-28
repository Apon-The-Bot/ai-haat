# Phase 5 — Migration Manifest & Execution Plan

**Project**: AI Haat (`aihaat.shop`)  
**Phase**: 5 — Database Migrations, Money Precision & Foreign Key Indexing  
**Release Plan**: Scheduled for Production Maintenance Window  

---

## 1. Migration Overview

This manifest documents the database migrations prepared to transition the AI Haat database from ad-hoc schema pushes to a versioned, repeatable Prisma migration ledger.

| Migration Identifier | Name | Scope & Changes | Applied to Prod | Risk Level |
|:---|:---|:---|:---|:---|
| `0_init` | Baseline Schema | Represents existing baseline tables and columns. Baseline marker only. | **NO (Pending Release)** | Zero / Non-destructive |
| `20260828_money_decimal_and_indexes` | Precision & Indexes | 1. Creates `rate_limit_buckets` table<br>2. Adds 8 missing FK indexes<br>3. Converts 27 Float fields to `DECIMAL(12, 2)` | **NO (Pending Release)** | Low (Rehearsed) |

---

## 2. Detailed Migration Specifications

### Migration 1: `0_init`
- **Migration Name**: `0_init`
- **Purpose**: Establishes initial migration baseline in `_prisma_migrations` for existing production database without dropping or re-creating tables.
- **SQL Path**: `prisma/migrations/0_init/migration.sql`
- **Production Baseline Command**:
  ```bash
  npx prisma migrate resolve --applied 0_init
  ```
- **Risk Assessment**: Zero risk. No DDL operations performed.

---

### Migration 2: `20260828_money_decimal_and_indexes`
- **Migration Name**: `20260828_money_decimal_and_indexes`
- **Purpose**: Hardens financial money fields from floating-point (`Float`) to exact fixed-point (`DECIMAL(12, 2)`), creates the PM2 cluster rate-limiting table, and adds missing high-traffic foreign key performance indexes.
- **SQL Path**: `prisma/migrations/20260828_money_decimal_and_indexes/migration.sql`
- **Target Tables**:
  - `rate_limit_buckets` (NEW)
  - `orders` (INDEX + MODIFY)
  - `order_items` (INDEX + MODIFY)
  - `delivered_keys` (INDEX)
  - `proofs` (INDEX + MODIFY)
  - `users` (MODIFY)
  - `products` (MODIFY)
  - `variations` (MODIFY)
  - `wallet_transactions` (MODIFY)
  - `coupons` (MODIFY)
  - `refunds` (MODIFY)
  - `affiliate_profiles` (MODIFY)
  - `affiliate_commissions` (MODIFY)
  - `affiliate_payout_requests` (MODIFY)
- **Indexes Created**:
  - `orders(userId)`
  - `order_items(orderId)`
  - `order_items(productId)`
  - `order_items(variationId)`
  - `delivered_keys(orderId)`
  - `delivered_keys(userId)`
  - `delivered_keys(orderItemId)`
  - `proofs(orderId)`
- **Data Conversion**:
  - Direct type modification via `ALTER TABLE ... MODIFY ... DECIMAL(12, 2)`.
  - In MariaDB/MySQL, Float to Decimal conversion rounds smoothly to 2 decimal places without data loss.
- **Estimated Lock Time**: < 1.5 seconds on current table volume (<10,000 rows).
- **Online DDL**: Supported via `ALGORITHM=INPLACE` in MariaDB 11.x for index creation.
- **Pre-Check**:
  ```sql
  SELECT COUNT(*) FROM orders WHERE totalBDT < 0;
  SELECT COUNT(*) FROM users WHERE walletBalanceBDT < 0;
  ```
- **Post-Check**:
  ```sql
  SELECT table_name, column_name, data_type, numeric_precision, numeric_scale 
  FROM information_schema.columns 
  WHERE table_schema = 'u298980084_ai_haat' AND column_name LIKE '%BDT';
  ```
- **Rollback SQL**:
  ```sql
  DROP TABLE IF EXISTS `rate_limit_buckets`;
  ALTER TABLE `orders` DROP INDEX `orders_userId_idx`;
  -- (Optionally revert DECIMAL to DOUBLE if needed)
  ```

---

## 3. Production Deployment Execution Checklist

1. **Pre-Deployment Backup**: Run full logical mysqldump backup of database `u298980084_ai_haat`.
2. **Maintenance Mode**: Enable brief maintenance banner.
3. **Execute Baseline Resolution**:
   ```bash
   npx prisma migrate resolve --applied 0_init
   ```
4. **Deploy Migration**:
   ```bash
   npx prisma migrate deploy
   ```
5. **Run Verification Suite**:
   ```bash
   npx tsx scripts/test-database-migration-integrity-suite.ts
   ```
6. **Disable Maintenance Mode**: Complete production verification.
