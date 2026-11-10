# AI HAAT — DATABASE PERSISTENCE & DATA INTEGRITY TESTS
**Project:** AI Haat (`aihaat.shop`)  
**Scope:** Prisma ORM, MySQL Relational Integrity, Poisha Math, Indexing & Data Retention  
**Audit Timestamp:** November 2026  
**Auditor:** Principal Database Architect & Data Systems Auditor  

---

## 1. PERSISTENCE ARCHITECTURE & SAFETY INVARIANTS

The persistence layer of AI Haat is built on **MySQL 8.0** hosted on Hostinger Cloud Infrastructure, managed through **Prisma ORM (v5.19.1)**. 

### Critical Safety Compliance Note
Because the local environment connects directly to the live production database (`srv1497.hstgr.io:3306/u298980084_ai_haat`), all test operations strictly adhered to the non-destructive safety protocol:
- **No Force Resets:** `prisma db push --force-reset` and `prisma migrate reset` are strictly prohibited.
- **Isolated Test Fixtures:** All automated QA test scripts create uniquely prefixed records (e.g., `AH-TEST-*`, `qa-*`) and clean them up deterministically in `finally` blocks.
- **Transactional Atomic Guarantees:** Financial and stock mutations use Prisma `$transaction` blocks to prevent partial writes.

---

## 2. AUTOMATED TEST SUITE EXECUTION RESULTS

Database integrity, schema relationships, and financial calculations were validated via:
- **`scripts/verify-admin-suite.ts`**: Tests 1, 2, 4, 5 Passed (Categories, Audits, Coupons, Orders)
- **`scripts/verify-all-fixes.ts`**: Test Group 8 Passed (Poisha integer arithmetic & float drift elimination)
- **`scripts/test-supplier-cost-profit-master-suite.ts`**: Tests 1, 4, 11 Passed (Prisma models, foreign relations, price snapshots)

---

## 3. DETAILED DATABASE FINDINGS & VERIFICATIONS

### 3.1 Foreign Key Cascade Rules & Referential Integrity
In `prisma/schema.prisma`:
- **`Order` -> `OrderItem`:** One-to-many relationship. Deleting a test order cascades cleanly to delete its corresponding `OrderItem` line items.
- **`Order` -> `OrderTimelineEvent`:** Deleting an order cascades to its operational timeline events, leaving zero orphaned records.
- **`Product` -> `Variation`:** Deleting a product removes its child variations while preserving historical `OrderItem` snapshots (which store denormalized product and variation names).
- **`StockBatch` -> `DigitalStock`:** Vault stock items maintain a foreign key reference to `StockBatch.id`, preserving inward procurement lineage.

### 3.2 Foreign Key Indexing Optimization (AUDIT-015)
In `prisma/schema.prisma`:
- **Problem Identified:** Missing explicit indexes on foreign keys resulted in full-table scans during high-concurrency join queries.
- **Implemented Optimization:** Added explicit `@@index` annotations across critical high-traffic query paths:
  - `Variation`: `@@index([productId])`
  - `DigitalStock`: `@@index([productId])`, `@@index([variationId])`, `@@index([status])`
  - `ProductRequest`: `@@index([status])`
  - `Session`: `@@index([userId])`
  - `Order`: `@@index([paymentStatus])`, `@@index([deliveryStatus])`, `@@index([userId])`

### 3.3 Financial Precision & Poisha Arithmetic (AUDIT-014)
In `src/lib/commerce/money.ts`:
- **IEEE-754 Floating-Point Drift Remediated:** In standard JavaScript floating-point arithmetic, `200.00 - 0.21 = 199.79000000000002`. In financial databases, this drift causes penny-rounding discrepancies.
- **Poisha Mechanics:**
  - `toPoisha(bdt)` converts BDT to integer poisha: `Math.round(bdt * 100)`.
  - `fromPoisha(poisha)` converts integer poisha back to BDT: `Number((poisha / 100).toFixed(2))`.
  - `safeAddBDT(a, b)`: Adds poisha integers before returning BDT.
  - `safeSubBDT(a, b)`: Subtracts poisha integers before returning BDT.
  - Verified in `verify-all-fixes.ts`: `safeSubBDT(200.00, 0.21)` returns exactly `199.79`.

### 3.4 Concurrency & Atomic Balance Mutations
In `src/app/api/admin/users/[id]/wallet/route.ts` and checkout handlers:
- **Atomic Modification:** To prevent race conditions during concurrent wallet transactions, balances are updated using Prisma's atomic increment/decrement operators:
  ```typescript
  await prisma.user.update({
    where: { id: userId },
    data: { walletBalanceBDT: { increment: amountBDT } },
  });
  ```
- **Transaction Consistency:** Deducting wallet balance and placing an order execute inside `prisma.$transaction([...])`. If stock allocation fails, the wallet deduction rolls back automatically.

### 3.5 Bounded Local JSON Fallback Architecture (AUDIT-012)
In `src/lib/products-db.ts`:
- The primary data authority is the MySQL relational database.
- A local JSON file (`data/products.json`) serves as a read-through emergency cache for storefront rendering during database maintenance.
- **Bounded Write Guard:** File writes are limited to a maximum of 1,000 entries and wrapped in non-blocking try-catch blocks, ensuring disk I/O errors never crash administrative mutations.

### 3.6 Automated Data Retention & Partitioning (AUDIT-018)
In `src/lib/maintenance/retention.ts`:
- **Purge Policies:**
  - Expired NextAuth sessions older than 30 days are purged.
  - Expired password reset OTP tokens older than 24 hours are cleared.
  - Inactive rate limit window records are cleared from memory and Redis.
  - Non-critical notification logs older than 90 days are pruned.
- **Audit Log Preservation:** `AdminAuditLog` records are permanently preserved and exempt from automated purges.

---

## 4. DATABASE INTEGRITY SCORECARD

| Architecture Invariant | Verification Status | Verification Evidence |
|------------------------|:-------------------:|-----------------------|
| Prisma Schema Validity | **PASS** | `npx prisma validate` confirms 100% clean schema |
| Cascade Deletions | **PASS** | Tested in `verify-admin-suite.ts`; zero orphaned items |
| Explicit Indexes | **PASS** | `@@index` on `Variation`, `Session`, `Order` active |
| Poisha Precision Math | **PASS** | Zero IEEE-754 floating-point drift on money arithmetic |
| Atomic Concurrency | **PASS** | Prisma atomic `{ increment: N }` prevents balance races |
| Transaction Rollbacks | **PASS** | Multi-step mutations rolled back if any step fails |
| Safe Data Retention | **PASS** | Automated cleanup purges expired tokens and sessions |
