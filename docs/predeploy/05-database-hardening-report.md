# Phase 5 — Database, Migrations, Financial Precision & Query Integrity Report

**Project**: AI Haat (`aihaat.shop`)  
**Phase**: 5 — Database Migrations, Money Precision, Query Integrity & Data Safety  
**Status**: COMPLETE & VERIFIED (Zero Destructive Live Database Operations)  
**Date**: August 28, 2026  
**Environment**: Remote Hostinger MariaDB (`srv1497.hstgr.io`, DB `u298980084_ai_haat`)  
**Safety Classification**: `PRODUCTION_LIKE` / `STAGING` (Live Data Protected)  

---

## A. Executive Summary

Phase 5 successfully verified Phase 4 security closure, audited all database queries and schemas, designed and prepared the financial Float-to-Decimal precision migration, resolved missing foreign key performance indexes, and established a reproducible Prisma migration baseline.

In accordance with strict safety mandates, **no unverified destructive migrations or fixture mutations were executed against the remote live database**. All schema alterations are codified in verified migration artifacts (`0_init` and `20260828_money_decimal_and_indexes`) and accompanied by a detailed execution manifest for the scheduled production release window.

---

## B. Phase 4 Closure Verification Matrix

| Security Area | Audit Finding / Requirement | Remediation & Production Policy | Final Status |
|:---|:---|:---|:---|
| **Security Test Harness** | Asynchronous tests were not awaited deterministically | Refactored `scripts/test-application-security-hardening-suite.ts` with sequential array-based execution; dynamic test reconciliation. | **PASS (22/22)** |
| **Test Reconcile** | Declared vs executed test counts were not dynamically matched | Harness dynamically asserts `declaredCount === executedCount && failedCount === 0`. | **PASS** |
| **PM2 Rate Limiting** | Process-local in-memory Map allowed multi-worker limit multiplication | Designed shared `rate_limit_buckets` model/table with atomic window tracking, memory fallback, and bounded key sizing. | **PASS** |
| **Client IP Resolution** | Fallback `127.0.0.1` collapsed all users into one limiter bucket | Changed fallback to explicit `unknown:direct` when proxy trust is disabled. | **PASS** |
| **Trusted Proxy Policy** | Blindly trusting proxy headers allows IP spoofing | Requires explicit `TRUST_PROXY=true` or `TRUST_CF_CONNECTING_IP=true` with IPv4/IPv6 regex validation. | **PASS** |
| **CSRF Browser Defense** | Missing Origin/Referer allowed cookie-authenticated mutations | Enforced strict fail-closed policy: requests with `next-auth` cookies lacking both `Origin` and `Referer` are rejected. | **PASS** |
| **MFA Recovery Pepper** | Fallback to default hardcoded key in `getRecoveryCodePepper()` | Enforced strict production fail-closed invariant: throws error if `MFA_RECOVERY_CODE_PEPPER` is missing in production. | **PASS** |
| **Content Security Policy** | Missing or overly permissive CSP | Configured production CSP in `next.config.mjs` allowing GA4, Meta, PipraPay, Google Fonts, and Google OAuth; blocks object and frame injection. | **PASS** |
| **DB Password Rotation** | Previous audit noted password rotation pending | Documented as **MANUAL ACTION REQUIRED** in deployment release gates. | **MANUAL ACTION REQUIRED** |
| **Google OAuth Secret** | Secret rotation pending | Documented as **MANUAL ACTION REQUIRED** in deployment release gates. | **MANUAL ACTION REQUIRED** |

---

## C. Git State & Checkpoint

- **Start Commit**: `89e7989` (`feat(phase-3): financial concurrency, refund atomicity & affiliate ledger integrity`)
- **Active Branch**: `main`
- **Working Tree**: Clean and fully compiling. All Phase 2, 3, 4, and 5 files exist in repository tree.

---

## D. Database Environment Classification

- **Host**: `srv1497.hstgr.io`
- **Port**: `3306`
- **Database**: `u298980084_ai_haat`
- **Engine**: MariaDB 11.8.8
- **Classification**: **`PRODUCTION_LIKE` / `STAGING`**
- **Safety Directive**: **DIRECT DESTRUCTIVE MIGRATIONS FORBIDDEN**.
- **Mutating Tests against Remote DB**: **DISABLED**.

---

## E. Migration Baseline & Created Migration Files

Because the repository historically used `prisma db push`, `prisma/migrations/` was uninitialized. We established a non-destructive migration baseline strategy:

1. **`prisma/migrations/0_init/migration.sql`**:
   Baseline snapshot marker. In production deployment, applied non-destructively via:
   ```bash
   npx prisma migrate resolve --applied 0_init
   ```
2. **`prisma/migrations/20260828_money_decimal_and_indexes/migration.sql`**:
   Contains all Phase 5 DDL operations:
   - `CREATE TABLE rate_limit_buckets`
   - 8 `ALTER TABLE ... ADD INDEX` statements for foreign key acceleration
   - 27 `ALTER TABLE ... MODIFY` statements converting `Float` to `DECIMAL(12, 2)`
3. **`docs/predeploy/05-migration-manifest.md`**:
   Full migration execution guide with pre-checks, post-checks, lock estimations, and rollback procedures.

---

## F. Financial Money Field Registry & Precision Design

### Precision Specification: `DECIMAL(12, 2)`
- Supports values up to ৳9,999,999,999.99 (10 Billion BDT), exceeding maximum platform volume by orders of magnitude.
- 2 decimal places enforces standard Paisa precision and eliminates binary float rounding bugs (`0.30000000000000004`).
- Exchange rates configured with `DECIMAL(12, 4)` for micro-precision FX conversion.
- Percentages configured with `DECIMAL(5, 2)` for 0.00% to 100.00% rates.

### Audited Financial Fields (27 Fields):
1. `users.walletBalanceBDT`: `DECIMAL(12, 2)`
2. `products.minPriceBDT`: `DECIMAL(12, 2)`
3. `products.maxPriceBDT`: `DECIMAL(12, 2)`
4. `products.regularPriceBDT`: `DECIMAL(12, 2)`
5. `products.salePriceBDT`: `DECIMAL(12, 2)`
6. `products.costPriceBDT`: `DECIMAL(12, 2)`
7. `variations.priceBDT`: `DECIMAL(12, 2)`
8. `variations.regularPriceBDT`: `DECIMAL(12, 2)`
9. `variations.salePriceBDT`: `DECIMAL(12, 2)`
10. `variations.costPriceBDT`: `DECIMAL(12, 2)`
11. `orders.subtotalBDT`: `DECIMAL(12, 2)`
12. `orders.discountBDT`: `DECIMAL(12, 2)`
13. `orders.totalBDT`: `DECIMAL(12, 2)`
14. `orders.refundedBDT`: `DECIMAL(12, 2)`
15. `order_items.priceBDT`: `DECIMAL(12, 2)`
16. `order_items.refundedBDT`: `DECIMAL(12, 2)`
17. `wallet_transactions.amountBDT`: `DECIMAL(12, 2)`
18. `coupons.discountValue`: `DECIMAL(12, 2)`
19. `coupons.minOrderBDT`: `DECIMAL(12, 2)`
20. `coupons.maxDiscountBDT`: `DECIMAL(12, 2)`
21. `refunds.requestedAmountBDT`: `DECIMAL(12, 2)`
22. `refunds.approvedAmountBDT`: `DECIMAL(12, 2)`
23. `affiliate_profiles.earningsBalanceBDT`: `DECIMAL(12, 2)`
24. `affiliate_profiles.totalEarnedBDT`: `DECIMAL(12, 2)`
25. `affiliate_profiles.totalPaidBDT`: `DECIMAL(12, 2)`
26. `affiliate_commissions.orderTotalBDT`: `DECIMAL(12, 2)`
27. `affiliate_commissions.commissionAmountBDT`: `DECIMAL(12, 2)`

### Centralized Money Utilities:
- `src/lib/commerce/money.ts`: Complete suite with `toPoisha`, `fromPoisha`, `roundBDT`, `safeAddBDT`, `safeSubBDT`, `safeMulBDT`, `calculatePercentageDiscount`, `normalizeBDT`, `decimalToBDT`, `parseBDT`, `serializeBDT`.

---

## G. Foreign Key Performance Indexes Added

| Table | Index Name | Indexed Columns | Query Purpose |
|:---|:---|:---|:---|
| `orders` | `orders_userId_idx` | `userId` | Accelerates customer order history and dashboard loading |
| `order_items` | `order_items_orderId_idx` | `orderId` | Accelerates order detail and delivery lookups |
| `order_items` | `order_items_productId_idx` | `productId` | Accelerates product sales analytics |
| `order_items` | `order_items_variationId_idx` | `variationId` | Accelerates variation sales tracking |
| `delivered_keys` | `delivered_keys_orderId_idx` | `orderId` | Accelerates digital vault customer views |
| `delivered_keys` | `delivered_keys_userId_idx` | `userId` | Accelerates customer license key management |
| `delivered_keys` | `delivered_keys_orderItemId_idx` | `orderItemId` | Accelerates warranty & replacement verifications |
| `proofs` | `proofs_orderId_idx` | `orderId` | Accelerates payment proof lookups |

---

## H. Query Scalability & Aggregation Optimizations

1. **Admin Dashboard Stats (`src/app/api/admin/dashboard/stats/route.ts`)**:
   - Replaced in-memory array iteration of all orders with native MySQL `prisma.order.groupBy` and `_sum.totalBDT`.
2. **Customer & Admin Pagination**:
   - Clamped all client-supplied `pageSize` parameters (`Math.min(100, Math.max(1, pageSize))`) across admin users, orders, refunds, and affiliate APIs.
3. **Database-Level Aggregations**:
   - Verified that affiliate earnings, commission summaries, and refund balances utilize `prisma.aggregate` rather than loading row collections into memory.

---

## I. Regression & Hardening Test Results

### Safe Non-Mutating Suites (Rerun Sequentially):
| Test Suite File | Declared | Executed | Passed | Failed | Exit Code |
|:---|:---|:---|:---|:---|:---|
| `test-application-security-hardening-suite.ts` | 22 | 22 | 22 | 0 | 0 |
| `test-database-migration-integrity-suite.ts` | 12 | 12 | 12 | 0 | 0 |
| `test-security-auth-idor-suite.ts` | 12 | 12 | 12 | 0 | 0 |
| `test-checkout-pricing-tamper-suite.ts` | 12 | 12 | 12 | 0 | 0 |
| `test-seo-master-suite.ts` | 61 | 61 | 61 | 0 | 0 |
| `test-notification-master-suite.ts` | 31 | 31 | 31 | 0 | 0 |
| **Total Synchronous Verification** | **150** | **150** | **150** | **0** | **0** |

---

## J. Build & Compilation Verification Gates

- **TypeScript Compilation**: `npx tsc --noEmit` -> **0 errors (PASS)**
- **Prisma Schema Validation**: `npx prisma validate` -> **Valid (PASS)**
- **Next.js Production Build**: `npm run build` -> **104 / 104 static & dynamic routes compiled successfully (PASS)**

---

## K. Deployment Readiness & Residual Deployment Gates

| Gate Item | Requirement | Action Required |
|:---|:---|:---|
| **Database Migration** | Apply `0_init` and `20260828_money_decimal_and_indexes` | Run during scheduled release window after database backup |
| **Database Password** | Rotate remote MySQL password | Update in Hostinger panel + `.env` |
| **Google OAuth Secret** | Rotate Google OAuth client secret | Update in Google Cloud Console + `.env` |
| **MFA Recovery Pepper** | Set `MFA_RECOVERY_CODE_PEPPER` in production environment | Set cryptographically secure 64-char hex key |
| **Proxy Trust Setting** | Configure `TRUST_PROXY=true` if behind Nginx/Cloudflare | Set matching reverse proxy architecture |

Phase 5 Database, Migrations, Financial Precision & Query Hardening is **100% COMPLETE & VERIFIED**.
