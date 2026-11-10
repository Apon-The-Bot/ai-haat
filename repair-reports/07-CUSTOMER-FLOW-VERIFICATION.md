# 07 — CUSTOMER JOURNEY & CRITICAL COMMERCE FLOW VERIFICATION

This report provides the validation results across all critical customer-facing journeys: catalog browsing, cart management, server-authoritative checkout, order tracking, invoice downloading, and loyalty rewards.

---

## 1. Customer Journey Verification Matrix

| Customer Journey | Critical Steps Validated | Status | Verification Evidence |
| :--- | :--- | :---: | :--- |
| **Authentication & Sign-in** | NextAuth Google login, `/login` callback handling, session persistence | **PASS** | Verified `/login` page compilation, session redirection, and Google provider callbacks. |
| **Catalog Browsing** | Category filters, instant search, stock status badges, variation selectors | **PASS** | Verified `getPublicProducts()` query filters, stock availability indicators, and SSR slug pages. |
| **Cart & Pricing Engine** | Volume discounts, bundle pricing, coupon application, poisha arithmetic | **PASS** | Verified deterministic minor-unit arithmetic in `src/lib/commerce/pricing.ts` and `money.ts`. |
| **Checkout & Payment** | Order creation, gateway verification (bKash/Nagad/Rocket/Wallet), stock reservation | **PASS** | Verified `POST /api/orders` server-side price recalculation and atomic coupon usage counter. |
| **Order Tracking** | Lookup by order ID or phone, delivery timeline progress, masked PII | **PASS** | Verified public tracking response masking; gift tokens and customer PII are strictly redacted. |
| **Invoice Retrieval** | Customer invoice PDF generation, ownership verification, rate limiting | **PASS** | Verified guest email verification challenge; unauthenticated enumeration attempts blocked. |
| **Gift Card Redemption** | Code input in `/dashboard/wallet`, balance credit, re-entrancy defense | **PASS** | Verified atomic transaction in `redeemGiftCardToWallet()` with conditional `status: "ACTIVE"`. |
| **Affiliate Referral** | Click tracking, 30-day attribution cookie, anti-inflation rate limiting | **PASS** | Verified `POST /api/affiliate/click` regex validation and IP deduplication filters. |

---

## 2. In-Depth Journey Step Validations

### 2.1 Server-Authoritative Checkout & Anti-Tampering
- **Test Objective:** Verify that malicious clients cannot manipulate unit prices, discounts, or total amounts during checkout.
- **Workflow Execution:**
  1. Client sends `POST /api/orders` with cart items containing deliberately spoofed prices (e.g. `priceBDT: 1`).
  2. The server-side pricing engine (`calculateOrderQuote`) completely ignores client-supplied prices.
  3. It performs authoritative database lookups for each product and variation.
  4. Applies volume discount rules:
     - 3+ items: 5% discount
     - 5+ items: 10% discount
     - 10+ items: 15% discount
  5. Validates coupon codes against active database records and checks expiration and usage limits.
  6. Enforces exact minor-unit poisha calculations (`safeAddBDT`, `safeSubBDT`).
  7. Result: Client-tampered prices are rejected and overwritten by server-authoritative quotes.

### 2.2 Public Order Tracking & Information Shielding
- **Test Objective:** Verify that order tracking does not disclose buyer PII or claim tokens to unauthorized searchers.
- **Workflow Execution:**
  1. A visitor enters a customer phone number (e.g. `01712345678`) into `/order-tracking`.
  2. Public tracking returns matched order records with masked fields:
     - Customer Name: `M**** A***`
     - Customer Email: `mo***@gmail.com`
     - Customer Phone: `017****5678`
     - Transaction ID: `9J8K****`
     - `giftClaimToken`: Explicitly `null` (never leaked to public searchers).
  3. Timeline events reflect fulfillment progress (Order Placed $\rightarrow$ Payment Verified $\rightarrow$ License Preparation $\rightarrow$ Delivered to Vault).

### 2.3 Verified Invoice Download
- **Test Objective:** Verify that guest customers can download invoices while unauthorized callers are rejected.
- **Workflow Execution:**
  1. When clicking "Invoice (PDF)" from order tracking, the UI prompts the guest user to enter the email address used during checkout.
  2. The request dispatches to `/api/orders/[id]/invoice?email=user@example.com`.
  3. If the provided email matches `order.customerEmail`, a branded PDF invoice is streamed with `Content-Type: application/pdf` and `Content-Disposition: attachment`.
  4. If a caller queries the invoice URL without `?email=` or with a mismatched email, the server returns HTTP 403 Forbidden with `GUEST_VERIFICATION_REQUIRED`.

### 2.4 Digital Gift Card Redemption
- **Test Objective:** Verify that gift cards cannot be double-redeemed via concurrent requests.
- **Workflow Execution:**
  1. User navigates to `/dashboard/wallet` and inputs 16-character code (`AIHT-XXXX-XXXX-XXXX`).
  2. The database executes an atomic transaction with `where: { id: giftCard.id, status: "ACTIVE" }`.
  3. First execution succeeds: credits user wallet balance, updates status to `REDEEMED`, creates a `WalletTransaction` audit record, and sends an in-app notification.
  4. Any subsequent or simultaneous concurrent request fails immediately with 0 rows updated, preserving ledger consistency.
