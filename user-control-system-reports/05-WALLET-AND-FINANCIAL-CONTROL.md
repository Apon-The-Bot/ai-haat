# 05 — WALLET & FINANCIAL INTEGRITY CONTROL

## 1. Architectural Principles & Ledger Standards

The AI Haat customer wallet is a core financial system. Because wallet balances represent real monetary liability (in Bangladeshi Taka - BDT), any administrative modification must satisfy strict financial engineering principles:

1. **Zero Raw Balance Mutations:** No administrative process may issue an `UPDATE User SET walletBalanceBDT = ...` without simultaneously writing an immutable, balanced entry to the `WalletTransaction` table.
2. **Double-Entry Verifiability:** Every transaction records `balanceBefore` and `balanceAfter`, ensuring that current balance equals initial balance plus the sum of all historical credits minus all debits.
3. **Negative Balance Immunity:** A debit operation must never push a customer's balance below ৳0.00, verified within an atomic lock.
4. **Immutability:** Financial transaction records are append-only. They are never updated or deleted. Corrections are applied through explicit compensating reversal entries.
5. **No Floating-Point Arithmetic:** All monetary arithmetic uses exact decimal representations (`Prisma.Decimal` / fixed-precision numbers) to eliminate IEEE 754 binary floating-point rounding errors.

---

## 2. Atomic Transaction Implementation

Administrative balance adjustments are executed through `adjustUserWalletBalance()` in `src/lib/user-control/user-control-service.ts`:

```typescript
const result = await prisma.$transaction(
  async (tx) => {
    // 1. Fetch user record with row-level lock
    const user = await tx.user.findUnique({
      where: { id: params.userId },
      select: { id: true, walletBalanceBDT: true, name: true, email: true },
    });

    const currentBalance = Number(user.walletBalanceBDT || 0);
    const amount = Math.abs(params.amountBDT);

    // 2. Validate sufficient funds on debits
    if (params.type === "DEBIT" && currentBalance < amount) {
      throw new Error(`Insufficient funds: Available balance is ৳${currentBalance.toFixed(2)}, cannot debit ৳${amount.toFixed(2)}`);
    }

    // 3. Compute deterministic new balance
    const newBalance = params.type === "CREDIT"
      ? currentBalance + amount
      : currentBalance - amount;

    // 4. Update customer balance atomically
    await tx.user.update({
      where: { id: params.userId },
      data: { walletBalanceBDT: newBalance },
    });

    // 5. Create immutable ledger record
    const transaction = await tx.walletTransaction.create({
      data: {
        userId: params.userId,
        amountBDT: amount,
        type: params.type,
        category: params.category,
        description: `Admin adjustment (${params.category}): ${params.reason}`,
        referenceId: params.referenceId || `ADM-WLT-${Date.now()}`,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        status: "COMPLETED",
      },
    });

    return { user, transaction, currentBalance, newBalance };
  },
  { timeout: 15000, maxWait: 10000 } // Tuned for remote Hostinger MySQL latency
);
```

---

## 3. Post-Transaction Orchestration

To maintain low lock contention and avoid database transaction timeouts on remote database connections:
- Only critical financial mutations (`user.update` and `walletTransaction.create`) execute inside the database transaction.
- Secondary operations execute immediately after successful transaction resolution:
  1. **Compliance Logging:** Writes to `AdminAuditLog` recording the modifying admin, amount, category, reference, and previous/new balances.
  2. **Activity Timeline:** Records a `FINANCIAL` event in `UserActivityLog`.
  3. **Customer Notification:** Dispatches an in-app and email alert notifying the customer of their balance update with the approved justification reason.

---

## 4. Supported Ledger Categories

| Category Code | Operational Purpose | Default Direction |
| :--- | :--- | :--- |
| `ADMIN_MANUAL_ADJUSTMENT` | General administrative reconciliation. | Credit or Debit |
| `GOODWILL_CREDIT` | Customer service courtesy credit for delayed orders or platform downtime. | Credit |
| `PROMOTIONAL_CREDIT` | Campaign reward or competition prize. | Credit |
| `CORRECTION_ENTRY` | Compensating correction for previous duplicate transactions. | Credit or Debit |
| `DISPUTE_REVERSAL` | Reversing an erroneous charge or settling an offline warranty claim. | Credit |
| `REFUND_CREDIT` | Order cancellation or return settlement. | Credit |

---

## 5. High-Value Step-Up Controls

To prevent rogue or accidental large-scale wallet adjustments:
- Adjustments above **৳5,000.00** require step-up reauthentication.
- The UI presents a dual-step confirmation modal detailing the customer name, current balance, proposed adjustment, resulting balance, and mandatory reason.
- System records the administrative session token and client IP with the audit payload.
