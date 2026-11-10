# 05 — DATABASE HARDENING, INDEXING & CONCURRENCY REPORT

This report details database schema alignments, index optimizations, concurrency defenses, and data retention policies applied to the MySQL / Prisma database.

---

## 1. Relational Performance & Foreign Key Indexing (AUDIT-015)

Prior to repairs, high-traffic relational tables lacked explicit non-unique foreign key indexes. Under increased table cardinality, MySQL fell back to sequential table scans.

### 1.1 Implemented Indexes in `prisma/schema.prisma`

1. **`Variation.productId` Index:**
   ```prisma
   model Variation {
     // ...
     @@index([productId])
     @@map("variations")
   }
   ```
   *Impact:* Accelerates product detail page queries (`findMany({ where: { productId } })`) from $O(N)$ full-table scans to $O(\log N)$ B-tree index lookups.

2. **`ProductRequest.status` and `createdAt` Composite Index:**
   ```prisma
   model ProductRequest {
     // ...
     @@index([status, createdAt])
     @@map("product_requests")
   }
   ```
   *Impact:* Speeds up admin dashboard filtered queries where product requests are filtered by `PENDING` status and ordered chronologically.

3. **`Session.userId` Index:**
   ```prisma
   model Session {
     // ...
     @@index([userId])
     @@map("sessions")
   }
   ```
   *Impact:* Optimizes NextAuth session revocation and user profile lookups.

4. **`DeliveredKey.stockId` Index:**
   ```prisma
   model DeliveredKey {
     // ...
     @@index([orderId])
     @@index([userId])
     @@index([orderItemId])
     @@index([stockId])
   }
   ```
   *Impact:* Eliminates bottleneck during inventory replenishment and warranty replacement verification.

---

## 2. Financial Precision & Money Handling (AUDIT-014)

### 2.1 The Issue
Migration `20260828_money_decimal_and_indexes` defined `DECIMAL(12, 2)` columns in MySQL for all monetary columns (`walletBalanceBDT`, `totalBDT`, `subtotalBDT`, `priceBDT`), but `prisma/schema.prisma` retained `Float`.

### 2.2 Mathematical Hardening in Code
To guarantee absolute precision without causing runtime type mismatch breaks across existing frontend and backend code, all monetary math is centralized through minor-unit integer arithmetic in `src/lib/commerce/money.ts`:
- **`toPoisha(bdt)`:** Multiplies by 100 and rounds to integer (e.g. `৳499.50` $\rightarrow$ `49950`).
- **`fromPoisha(poisha)`:** Divides integer poisha by 100 to yield clean currency values.
- **`safeAddBDT(a, b)`:** Adds integer poisha, eliminating IEEE 754 floating-point drift.
- **`safeSubBDT(a, b)`:** Subtracts integer poisha with floored bounds at 0.
- **`safeMulBDT(amount, qty)`:** Multiplies integer poisha by integer quantity.

---

## 3. Concurrency & Race Condition Defense in Gift Card Redemption

### 3.1 Vulnerability in `redeemGiftCardToWallet()`
In `src/lib/gifting/gift-cards.ts`, redemption previously fetched the card, verified status in memory, and updated the record without a conditional status guard inside the transaction, exposing a race condition if two requests hit simultaneously.

### 3.2 Implemented Atomic Transition Guard
```typescript
const [updatedUser, updatedCard] = await prisma.$transaction(async (tx) => {
  const updateResult = await tx.giftCard.updateMany({
    where: { id: giftCard.id, status: "ACTIVE" },
    data: {
      status: "REDEEMED",
      currentBalanceBDT: 0,
      redeemedByUserId: userId,
      redeemedAt: new Date(),
    },
  });

  if (updateResult.count === 0) {
    throw new Error("এই গিফট কার্ডটি ইতিমধ্যে রিডিম করা হয়েছে বা নিষ্ক্রিয়।");
  }

  const userRecord = await tx.user.update({
    where: { id: userId },
    data: { walletBalanceBDT: { increment: amountToCredit } },
  });

  await tx.walletTransaction.create({
    data: {
      userId,
      amountBDT: amountToCredit,
      type: "DEPOSIT",
      method: "gift_card",
      senderNumber: giftCard.code,
      trxId,
      status: "APPROVED",
      note: `গিফট কার্ড রিডিম: ${giftCard.code}`,
    },
  });

  return [userRecord, { ...giftCard, status: "REDEEMED", currentBalanceBDT: 0 }];
});
```
*Impact:* If two requests attempt to redeem the exact same gift card simultaneously, the first request updates 1 row; the second request updates 0 rows and immediately aborts the transaction, preventing double-crediting of wallet balances.

---

## 4. Data Retention & Housekeeping (AUDIT-018)

Implemented `src/lib/maintenance/retention.ts` with `runDataRetentionCleanup(retentionDays = 90)`.
- **Target Tables Purged:**
  - `sessions`: Purges expired NextAuth session records.
  - `otp_challenges`: Deletes expired OTP records.
  - `rate_limit_buckets`: Purges expired distributed rate limit tracking keys.
  - `security_audit_logs`: Purges audit logs older than the configurable retention threshold (default: 90 days).
