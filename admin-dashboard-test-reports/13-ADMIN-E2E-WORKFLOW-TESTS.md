# AI HAAT — ADMIN END-TO-END WORKFLOW INTEGRATION TESTS
**Project:** AI Haat (`aihaat.shop`)  
**Scope:** Multi-Stage Admin Workflows, Commerce Lifecycles & Cross-Module State Synchronization  
**Audit Timestamp:** November 2026  
**Auditor:** QA Lead Automation Architect & Senior Backend Engineer  

---

## 1. END-TO-END WORKFLOW SCOPE

Administrative operations are rarely isolated actions; they form cohesive, multi-stage business workflows spanning the storefront, database, payment gateways, and administrative interfaces.

This audit evaluated **7 critical end-to-end operational workflows**:
1. **Catalog Inception & Inward Procurement Workflow**
2. **Instant Auto-Stock Fulfillment & Vault Delivery Workflow**
3. **Manual Order Fulfillment & Credential Dispatch Workflow**
4. **Warranty Claim & Replacement Key Delivery Workflow**
5. **Customer Refund & Wallet Reversal Workflow**
6. **Email Marketing Broadcast Campaign Lifecycle**
7. **Administrator MFA Enrollment & Emergency Recovery Workflow**

---

## 2. WORKFLOW 1: CATALOG INCEPTION & PROCUREMENT BATCH

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant ProductUI as Admin Products (/admin/products/new)
    participant BatchUI as Procurement (/admin/inventory/batches)
    participant DB as MySQL Database
    participant Catalog as Storefront (/products)

    Admin->>ProductUI: Define "Cursor AI Pro" + Variations (1 Mo, 1 Yr)
    ProductUI->>DB: POST /api/admin/products (Product & Variations)
    DB-->>ProductUI: Created (inStock = false initially)
    Admin->>BatchUI: Upload Inward Batch (50 keys @ $10 USD, FX 120 BDT)
    BatchUI->>DB: POST /api/admin/inventory/batches (StockBatch + 50 DigitalStocks)
    DB-->>BatchUI: Batch Committed
    Admin->>ProductUI: Toggle Product Visibility to Active
    ProductUI->>DB: PATCH /api/admin/products/[id] ({ isActive: true })
    Catalog->>DB: GET /api/products/cursor-ai-pro
    DB-->>Catalog: Dynamic inStock = true (stockCount: 50)
```

- **Verification Evidence:** Executed in `scripts/test-product-domain-master-suite.ts` and `scripts/test-supplier-cost-profit-master-suite.ts`.
- **Outcome:** **PASS**. Product creates cleanly, accepts multi-tier variations, inward batch records historical exchange rate ($10 @ ৳120 = ৳1,200), and storefront immediately reports the product as in stock.

---

## 3. WORKFLOW 2: INSTANT AUTO-STOCK FULFILLMENT & VAULT DELIVERY

```mermaid
sequenceDiagram
    autonumber
    actor Buyer
    participant Checkout as Storefront Checkout
    participant Pricing as Server Quote Engine
    participant Webhook as Payment Webhook (/api/payment/verify)
    participant Vault as Digital Vault DB
    participant CustomerUI as Customer Digital Vault (/dashboard/keys)

    Buyer->>Checkout: Selects "Telegram Premium 1 Month" (৳340)
    Checkout->>Pricing: calculateOrderQuote()
    Pricing-->>Checkout: Server-validated subtotal ৳340 (inStock: true)
    Buyer->>Checkout: Pays via bKash TrxID
    Webhook->>Vault: Atomic Transaction: Allocate DigitalStock (status: DELIVERED)
    Webhook->>Vault: Create DeliveredKey (AES-256 encrypted credentials)
    Webhook->>Vault: Transition Order status to DELIVERED
    CustomerUI->>Vault: GET /api/user/keys
    Vault-->>CustomerUI: Decrypted credentials revealed in buyer's Digital Vault
```

- **Verification Evidence:** Executed in `scripts/test-digital-ecosystem-e2e.ts` and `scripts/test-vault-warranty-master-suite.ts`.
- **Outcome:** **PASS**. Key is allocated atomically, marked delivered, encrypted with AES-256-GCM, and immediately accessible in the customer's vault.

---

## 4. WORKFLOW 3: MANUAL ORDER FULFILLMENT WORKFLOW

```mermaid
sequenceDiagram
    autonumber
    actor Buyer
    actor Admin
    participant OrderUI as Admin Orders (/admin/orders)
    participant DB as MySQL Database
    participant CustomerUI as Customer Vault

    Buyer->>DB: Submits Manual Workspace Seat Order (status: PROCESSING)
    Admin->>OrderUI: Opens Order #AH-XXXXX
    OrderUI->>Admin: Displays "Deliver Keys" Modal
    Admin->>OrderUI: Enters custom login credentials & submits
    OrderUI->>DB: POST /api/admin/orders/[id]/deliver
    DB->>DB: Encrypts credentials with AES-256-GCM
    DB->>DB: Inserts DeliveredKey with 30-day warranty
    DB->>DB: Appends OrderTimelineEvent (actor: ADMIN)
    DB->>DB: Transitions order to DELIVERED
    CustomerUI->>DB: Buyer views unlocked credentials in Digital Vault
```

- **Verification Evidence:** Executed in `scripts/test-admin-operations-suite.ts` (Test 1).
- **Outcome:** **PASS**. Admin manual delivery updates status, creates encrypted key, and appends timeline event with zero orphaned state.

---

## 5. WORKFLOW 4: WARRANTY CLAIM & REPLACEMENT DELIVERY

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    actor Admin
    participant ClaimUI as Admin Replacements (/admin/replacements)
    participant DB as MySQL Database

    Customer->>DB: Submits Warranty Claim ("Account Locked")
    DB->>DB: Creates ReplacementRequest (status: PENDING)
    Admin->>ClaimUI: Reviews claim details and original order
    Admin->>ClaimUI: Clicks "Approve Replacement"
    ClaimUI->>DB: POST /api/admin/replacements/[id]/approve
    DB->>DB: Allocates fresh stock item
    DB->>DB: Creates new DeliveredKey (isReplacement: true)
    DB->>DB: Preserves original warranty expiration date
    DB->>DB: Updates claim status to APPROVED
    Customer->>DB: Customer accesses fresh replacement credentials
```

- **Verification Evidence:** Executed in `scripts/test-admin-operations-suite.ts` (Test 3).
- **Outcome:** **PASS**. Fresh key delivered, claim approved, and original warranty expiry date preserved without resetting countdown.

---

## 6. WORKFLOW 5: CUSTOMER REFUND & REVENUE REVERSAL

```mermaid
sequenceDiagram
    autonumber
    actor Superadmin
    participant RefundUI as Admin Refunds (/admin/refunds)
    participant Wallet as Wallet Ledger
    participant BI as Reports Engine

    Superadmin->>RefundUI: Inspects Refund Request for Order #AH-YYYYY
    Superadmin->>RefundUI: Selects "Refund to Customer Wallet"
    RefundUI->>Wallet: POST /api/admin/refunds/[id]/approve
    Wallet->>Wallet: Atomically increments User.walletBalanceBDT
    Wallet->>Wallet: Inserts WalletTransaction (type: REFUND, status: APPROVED)
    Wallet->>Wallet: Marks Order deliveryStatus: REFUNDED
    Wallet->>Wallet: Revokes DeliveredKey
    BI->>Wallet: getCommercialOverview()
    Wallet-->>BI: Net Revenue = Verified Revenue - Refund Amount (exact deduction)
```

- **Verification Evidence:** Executed in `scripts/test-admin-analytics-bi-master-suite.ts` (Test 5).
- **Outcome:** **PASS**. Customer balance credited, order marked refunded, and Net Revenue strictly deducted in BI reports.

---

## 7. WORKFLOW 6: EMAIL MARKETING BROADCAST LIFECYCLE

1. **Template Selection:** Administrator selects or duplicates a template in `/admin/email-marketing/templates`.
2. **Audience Segmentation:** Selects dynamic segment (e.g., *"VIP Customers > ৳2,000 spend"*).
3. **Coupon Binding:** Selects active promotional coupon from `/api/admin/coupons`.
4. **Draft Composition:** Authors subject line, preview text, and schedules delivery.
5. **Connection Handshake:** Clicks **"Test Connection"** on settings page (`POST /api/admin/email-marketing/settings/verify`), confirming SES/SMTP handshake.
6. **Dispatch & Tracking:** Automated cron / background worker dispatches broadcast, writes delivery logs to `EmailDeliveryLog`, and tracks opens/clicks in real time.

- **Verification Evidence:** Executed in `scripts/audit-admin-endpoints.ts` (All 4 email marketing endpoint repairs verified).
- **Outcome:** **PASS**. Zero 404 or 405 errors across the entire email marketing journey.

---

## 8. WORKFLOW 7: ADMIN MFA ENROLLMENT & RECOVERY

1. **Enforcement Trigger:** Unenrolled administrator accesses `/admin`; top banner alerts them that 2FA is required.
2. **Wizard Navigation:** Administrator navigates to `/admin/mfa-setup`.
3. **Secret Generation:** Calls `POST /api/admin/mfa/generate`; generates 32-character base32 secret and SVG QR code.
4. **Verification Handshake:** Administrator scans QR in Google Authenticator, inputs 6-digit TOTP code, and submits `POST /api/admin/mfa/verify`.
5. **Recovery Code Vault:** Server verifies TOTP token, enables `totpEnabled = true`, and generates 10 single-use recovery codes hashed with `hmac-v1`.
6. **Secure Lockout Protection:** Administrator downloads recovery codes TXT file; full administrative access is unlocked.

- **Verification Evidence:** Executed in `scripts/test-application-security-hardening-suite.ts` (MFA security tests).
- **Outcome:** **PASS**. Fails closed when unenrolled; unlocks seamlessly upon verification; recovery codes verify in constant time.

---

## 9. WORKFLOW INTEGRATION SUMMARY

All 7 administrative workflows have been tested and verified across frontend components, API route handlers, and database models. The workflows operate with complete transactional integrity, zero orphaned records, and deterministic security guarding.
