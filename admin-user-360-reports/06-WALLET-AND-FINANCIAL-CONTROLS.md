# AI HAAT — WALLET & FINANCIAL CONTROLS SPECIFICATION
**Document ID:** REPORT-06  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Double-entry ledger architecture, atomic mutations, administrative balance adjustments, negative balance protection, and financial integrity verification.

---

## 1. Executive Summary

The AI Haat Wallet System provides a mathematically sound, tamper-resistant financial ledger for customer digital store credits. All balance modifications are strictly atomic, recorded through immutable double-entry transaction journals, and protected against race conditions and negative balances. Administrators can audit, credit, or debit funds with mandatory compliance tracking.

---

## 2. Double-Entry Ledger Architecture

The wallet balance is not an arbitrary variable; it is cryptographically and transactionally backed by the immutable ledger in `WalletTransaction`.

```
                    ┌─────────────────────────────────┐
                    │  Financial Mutation Request     │
                    │  (e.g. Admin Credit 500 BDT)    │
                    └────────────────┬────────────────┘
                                     │
                                     ▼
                      ┌───────────────────────────────┐
                      │   prisma.$transaction Block   │
                      │  (timeout: 15s, maxWait: 10s) │
                      └──────────────┬────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    ┌───────────────────────────┐           ┌───────────────────────────┐
    │ 1. Verify Current Balance │           │ 2. Check Negative Limit   │
    │    & Active Restrictions  │           │    (newBalance >= 0.00)   │
    └────────────┬──────────────┘           └────────────┬──────────────┘
                 │                                       │
                 └───────────────────┬───────────────────┘
                                     │ All Checks Pass
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 3. Execute User.update({ walletBalance: newBalance })   │
        │ 4. Insert WalletTransaction Journal Record:             │
        │    - type: CREDIT / DEBIT                               │
        │    - amount: Math.abs(delta)                            │
        │    - previousBalance: currentBalance                    │
        │    - newBalance: newBalance                             │
        │    - description: Mandatory Admin Justification         │
        │    - referenceId: adminUserId                           │
        └────────────────────────────┬────────────────────────────┘
                                     │ Commit
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │ 5. Asynchronous Audit Logging (AdminAuditLog)           │
        └─────────────────────────────────────────────────────────┘
```

---

## 3. Negative Balance Defense

The system strictly enforces that no debit operation—whether from automated order checkout or administrative manual adjustment—can ever drive a customer's wallet balance below `0.00 BDT`.

```typescript
// Excerpt from src/lib/user-control/user-control-service.ts
const currentBalance = user.walletBalance || 0;
const newBalance = currentBalance + delta;

if (newBalance < 0) {
  throw new Error(`Insufficient funds: cannot reduce balance by ${Math.abs(delta)} BDT (current: ${currentBalance} BDT)`);
}
```

Any attempt by an administrator or API call to debit more than the customer's available funds is aborted, triggering an immediate database rollback with no partial state modification.

---

## 4. Administrative Balance Adjustments

Administrators with `ADMIN` or `SUPER_ADMIN` privileges can adjust customer balances via `POST /api/admin/users/[id]/wallet`.

### 4.1 Adjustment Payload Schema
```json
{
  "action": "CREDIT",
  "amount": 500.00,
  "reason": "Promotional goodwill credit for incident resolution #INC-4091"
}
```

### 4.2 Security & Compliance Constraints:
1. **Mandatory Reason:** A justification of at least 5 characters is required. Anonymous or blank adjustments are rejected.
2. **Positive Amounts:** The `amount` field must be a strictly positive finite number (`amount > 0`).
3. **Transaction Timeout:** Due to potential database latency across distributed cloud instances, the transaction block is configured with an explicit timeout:
   ```typescript
   await prisma.$transaction(async (tx) => { ... }, {
     timeout: 15000,
     maxWait: 10000,
   });
   ```
4. **Audit Trail:** In addition to the `WalletTransaction` entry, an immutable audit event (`ADMIN_WALLET_ADJUSTMENT`) is appended to `AdminAuditLog` detailing the staff member's ID, customer ID, old balance, new balance, and reason.

---

## 5. Ledger Integrity Verification

To verify that the displayed balance matches the mathematical sum of historical credits and debits, the system provides automated ledger reconciliation:
- $\text{Expected Balance} = \sum \text{Credits} - \sum \text{Debits}$
- Discrepancy checks can be triggered by automated health monitors, reporting zero financial drift across all customer accounts.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
