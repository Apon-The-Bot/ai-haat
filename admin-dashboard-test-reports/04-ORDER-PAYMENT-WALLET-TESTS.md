# AI HAAT — ORDER, PAYMENT & WALLET SYSTEM TESTS
**Project:** AI Haat (`aihaat.shop`)  
**Scope:** Order Lifecycle, Multi-Item Quotations, Gateway Verifications, Wallet Adjustments & Reversals  
**Audit Timestamp:** November 2026  
**Auditor:** Senior Backend Engineer & Financial Systems Auditor  

---

## 1. COMMERCE & FINANCIAL ENGINE ARCHITECTURE

The AI Haat commerce pipeline operates on strict financial consistency rules:
- **Server-Authoritative Pricing Engine (`src/lib/commerce/pricing.ts`):** Calculates quotes strictly on the server; completely ignores client-supplied totals, discounts, or prices.
- **Exact Poisha Precision Math (`src/lib/commerce/money.ts`):** Eliminates IEEE-754 binary floating-point drift using scaled integer poisha arithmetic (`1 BDT = 100 poisha`).
- **Revenue Separation Principle:** Customer wallet deposits are recorded as **Financing Inflow** (unearned customer liability), while only actual product purchases are recognized as **Sales Revenue**.
- **Idempotent Multi-Item Order Model:** Orders support multiple items (`OrderItem`), each snapshotting historical price, variation details, and fulfillment requirements.
- **Auditable Lifecycle Tracking (`OrderTimelineEvent`):** Every transition (`ORDER_PLACED` -> `PAYMENT_VERIFIED` -> `DELIVERED` -> `COMPLETED`) is permanently logged with actor and timestamp.

---

## 2. AUTOMATED TEST SUITE EXECUTION RESULTS

The order, payment, and wallet systems were verified across multiple specialized test suites:
- **`scripts/verify-admin-suite.ts` (Tests 3 & 5):** Passed (Server quote engine & order timeline transitions)
- **`scripts/test-admin-operations-suite.ts` (Tests 1, 2, 3):** Passed (Manual delivery, wallet approval, warranty replacement)
- **`scripts/test-admin-analytics-bi-master-suite.ts` (Tests 1, 2, 3, 4, 5):** Passed (Verified revenue vs pending, wallet separation, refund deduction)
- **`scripts/test-digital-gifting-e2e.ts`:** Passed (Full order creation, token claim, digital unboxing)

---

## 3. DETAILED TEST FINDINGS & VERIFICATIONS

### 3.1 Server-Authoritative Quote Engine (`calculateOrderQuote`)
- **Tampering Defense:** If a client manipulates a request payload to declare `priceBDT: 10` for a ৳1,200 product, `calculateOrderQuote` looks up the product and variation in the database and recalculates the total at ৳1,200.
- **Volume & Bundle Discounts:** Server automatically computes tiered volume discounts (5% for 3 units, 10% for 5 units, 15% for 10 units) and companion bundle discounts (10% off).
- **Out of Stock Prevention:** The quote engine strictly blocks order creation if an `AUTO_STOCK` product has 0 available vault items.

### 3.2 Order Lifecycle & Operational Workflows
The administrative order interface at `/admin/orders` handles four primary delivery flows:
1. **Instant Auto-Delivery (`AUTO_STOCK`):**
   - On successful payment verification (bKash, Nagad, Rocket, or Wallet), the payment webhook atomically selects an available key from `DigitalStock`, marks it `DELIVERED`, creates a `DeliveredKey` record encrypted with AES-256-GCM, and transitions the order to `DELIVERED`.
2. **Manual Delivery Workflow (`MANUAL`):**
   - For custom accounts or workspace seats, the order remains in `PROCESSING`.
   - The administrator clicks **"Deliver Keys"**, enters the login credentials, and submits.
   - The system calls `POST /api/admin/orders/[id]/deliver`, encrypts the credentials, creates the `DeliveredKey`, creates a timeline event (`actor: "ADMIN"`), and transitions the order to `DELIVERED`.
3. **Bulk Fulfillment:**
   - Administrators can select multiple pending orders via checkboxes and click **"Bulk Deliver"** on `BulkActionBar`. The backend fulfills all eligible auto-stock orders in a single database transaction.

### 3.3 Payment Gateway Verification (bKash, Nagad, Rocket)
- **Automated Verification:** PipraPay gateway webhook calls verify transaction ID (`trxId`), amount, and status using cryptographic signature verification.
- **Manual Verification Fallback:** For manual offline payments, administrators can inspect the submitted `trxId` on the order card and click **"Verify Payment"**, transitioning `paymentStatus` to `VERIFIED`.

### 3.4 Customer Wallet Engine & Administrative Controls
The customer wallet system (`User.walletBalanceBDT` and `WalletTransaction`) enforces strict banking-grade controls:
- **Wallet Funding vs Product Revenue:**
  - When a customer deposits ৳1,000, `WalletTransaction` records `type = "DEPOSIT", status = "APPROVED"`. The commercial overview records ৳1,000 under **Wallet Funding Inflow**, but **Product Revenue remains ৳0**.
  - When the customer uses ৳600 from their wallet to purchase a subscription, `Order.paymentMethod = "wallet"` and `totalBDT = 600`. The reporting engine records **৳600 under Product Revenue**. This strictly prevents double-counting revenue.
- **Superadmin Manual Balance Adjustments (`/admin/wallet`):**
  - Only administrators with `SUPERADMIN` privileges can adjust customer wallet balances.
  - Every adjustment requires an explicit reason (e.g., *"Customer compensation for downtime"*).
  - The transaction is committed atomically with `prisma.user.update({ data: { walletBalanceBDT: { increment: amount } } })`.
  - A corresponding `AdminAuditLog` record is created, automatically redacting any sensitive data.

### 3.5 Warranty Replacements & Refunds
- **Replacement Workflow (`/admin/replacements`):**
  - Customer submits a replacement claim (e.g., `"Account credentials locked"`).
  - The claim appears in the admin queue with original order details, warranty expiry, and customer reason.
  - Upon admin approval (`POST /api/admin/replacements/[id]/approve`), a replacement key is allocated from stock, and a new `DeliveredKey` is created with `isReplacement: true`, **strictly preserving the original warranty expiration date**.
- **Refund Workflow (`/admin/refunds`):**
  - Refund requests can be settled as an instant wallet credit or payment gateway refund.
  - On approval, the order is marked `REFUNDED`, the delivered key is revoked, and the net revenue in financial reports is reduced by the refund amount (`Net Revenue = Verified Revenue - Completed Refunds`).

---

## 4. FINANCIAL PRECISION & DATA INTEGRITY VERIFICATION

| Invariant | Test Evidence | Result |
|-----------|---------------|:------:|
| Poisha Integer Math | `safeAddBDT(199.99, 0.01) === 200.00` | **PASS** |
| Floating-Point Drift Elimination | `safeSubBDT(200.00, 0.21) === 199.79` | **PASS** |
| Revenue Double-Counting Immunity | Wallet funding separated from product revenue in BI queries | **PASS** |
| Zero Denominator Safety | Zero orders handled gracefully (`AOV = 0`, no `NaN`/`Infinity`) | **PASS** |
| Concurrency Guard | Prisma atomic increments prevent race conditions on balances | **PASS** |
| Secret Sanitization in Audit | Admin manual adjustments redact raw passwords and TOTP secrets | **PASS** |
