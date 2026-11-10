# 02 — FEATURE-BY-FEATURE FUNCTIONAL INVENTORY

This document inventories every implemented feature across the AI Haat platform, tracing execution flow from UI components through state management, API routes, database models, and external integrations.

---

## 1. Feature Classification & Verification Matrix

Verification Status Definitions:
- **Verified Working**: Code trace, static analysis, and logic verification confirm complete, safe implementation.
- **Partially Verified**: Feature works in standard flows but contains known edge-case or concurrency defects.
- **Confirmed Defective**: Feature is fundamentally broken or throws runtime errors in actual usage.
- **Not Testable with Current Access**: Requires live external API sandbox (e.g., active payment gateway or live OAuth credentials).

| # | Feature Name | Primary UI Component / Route | API Endpoints | Database Models | Verification Status | Defect / Vulnerability Reference |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **01** | **Customer Digital Vault** | `/dashboard/vault`, `/dashboard/keys` | `GET /api/vault/credentials` | `DeliveredKey`, `Order`, `Product` | **Verified Working** | AES-256-GCM encryption with auto-masking & activation guides. |
| **02** | **Subscription Expiry & 1-Click Renewal** | `/dashboard/vault`, `/checkout?renewal=true` | `GET /api/cron/subscription-reminders` | `DeliveredKey`, `Order` | **Verified Working** | 72h urgency badges, 1-click renewal cart injection. |
| **03** | **Companion Product Bundles** | `/product/[slug]`, `CompanionBundleSection` | `GET /api/products/[slug]` | `ProductBundle`, `BundleItem` | **Verified Working** | 10% combo discount calculated server-side in pricing quote. |
| **04** | **Tiered Volume Pricing** | `/product/[slug]`, `VolumePricingCard` | `GET /api/products/[slug]` | `TieredPricingRule` | **Verified Working** | 3-4 units (5%), 5-9 (10%), 10+ (15%) auto-applied in cart. |
| **05** | **Flash Sale & FOMO Urgency** | `FlashSaleBanner`, `FlashSaleSection` | Embedded in Catalog APIs | `FlashSale`, `FlashSaleItem` | **Verified Working** | Countdown timers, real-time stock claim badges. |
| **06** | **AI Tool Comparison Matrix** | `/compare`, `ComparePageClient` | Static + `/api/products` | `Product`, `Variation` | **Verified Working** | Side-by-side feature, price, SLA, warranty comparison. |
| **07** | **Social Proof Purchase Toasts** | `RecentPurchasePopup.tsx` | Local mock / Recent orders | N/A (Client-side) | **Partially Verified** | Shows simulated recent purchases on homepage; excluded from checkout. |
| **08** | **Floating WhatsApp Support** | `FloatingWhatsAppWidget.tsx` | N/A (External WhatsApp link) | `SiteSetting` | **Verified Working** | Dynamic fallback number, bottom offset on mobile product pages. |
| **09** | **AI Haat Coins / Loyalty Club** | `/dashboard/rewards`, `CoinsBalanceBadge` | `GET/POST /api/loyalty` | `CoinTransaction`, `User` | **Verified Working** | 1 coin per 10 BDT spent; voucher tiers (100 coins = 20 BDT, etc.). |
| **10** | **Digital Gift Cards & Vouchers** | `/gift-cards`, `/dashboard/wallet` | `POST /api/gift-cards/create`, `/redeem` | `GiftCard`, `WalletTransaction`, `User` | **Partially Verified** | Missing rate-limiting on redemption endpoint (`/api/gift-cards/redeem`). |
| **11** | **Direct Product Gifting & Unboxing**| `/gift/[token]`, `CheckoutPageClient` | `GET/POST /api/gift/claim/[token]` | `Order`, `DeliveredKey` | 🔴 **Confirmed Defective (Security)** | **AUDIT-002**: Token leaked in public order tracking endpoint (`/api/orders`). |
| **12** | **Give 50 Get 50 Referral Loop** | `/dashboard/referrals`, `ShareToUnlockBanner`| `GET /api/referrals/me`, `/api/affiliate/**` | `AffiliateProfile`, `ReferralClick` | **Partially Verified** | **AUDIT-013**: Unbounded click inflation via `/api/affiliate/click`. |
| **13** | **Automated PipraPay Checkout** | `/checkout`, `CheckoutPageClient` | `POST /api/payment/create`, `callback`, `webhook` | `Order`, `WalletTransaction` | **Partially Verified** | **AUDIT-004**: Global IP collapse causes 429 errors on payment creation. |
| **14** | **Digital Wallet Purchase & Top-up**| `/dashboard/wallet`, `/wallet` | `POST /api/wallet/purchase`, `/recharge` | `User`, `WalletTransaction` | **Verified Working** | Atomic conditional debit prevents double-spending and negative balances. |
| **15** | **Public Order Tracking** | `/order-tracking`, `OrderTrackingClient` | `GET /api/orders?tracking=true` | `Order`, `OrderItem`, `OrderTimelineEvent` | 🔴 **Confirmed Defective (Security)** | **AUDIT-002**: Exposes plain `giftClaimToken` to anyone tracking orders. |
| **16** | **Official PDF Invoice Generator** | Download button in tracking & order history | `GET /api/orders/[id]/invoice` | `Order`, `OrderItem` | 🔴 **Confirmed Defective (Security)** | **AUDIT-001**: BOLA/IDOR allows guest invoice PDF download without email verification. |
| **17** | **Admin Product Management** | `/admin/products`, `ProductEditorForm` | `/api/admin/products`, `/api/products` | `Product`, `Variation`, `DigitalStock` | 🔴 **Confirmed Defective (Functional)**| **AUDIT-009**: Form calls non-existent `POST /api/admin/products` & `PUT [id]`. |
| **18** | **Digital Stock Pool & Auto-Delivery**| `/admin/inventory`, `/admin/inventory/batches` | `GET/POST /api/admin/inventory/**` | `DigitalStock`, `InventoryBatch`, `DeliveredKey` | **Verified Working** | Atomic `updateMany` claiming prevents duplicate key assignment. |
| **19** | **After-Sales Warranty Replacements**| `/dashboard/replacements`, `/admin/replacements`| `GET/POST /api/replacements/request` | `ReplacementRequest`, `DeliveredKey` | **Verified Working** | Enforces active warranty window and atomic state machine transitions. |
| **20** | **Refund Claims & Processing** | `/dashboard/refunds`, `/admin/refunds` | `GET/POST /api/refunds/request`, `reviewRefundRequest` | `Refund`, `WalletTransaction`, `User` | **Verified Working** | Supports wallet deposit or manual MFS payout with atomic state locks. |
| **21** | **Customer Support Helpdesk** | `/dashboard/support`, `/admin/support` | `GET/POST /api/support/tickets/**` | `SupportTicket`, `SupportMessage` | **Verified Working** | Ticket creation, conversation threads, order/item association. |
| **22** | **Email Marketing Automation Hub**| `/admin/email-marketing/**` | `GET/POST /api/admin/email-marketing/**` | `EmailCampaign`, `EmailTemplate`, `EmailContact`| **Partially Verified** | **AUDIT-006**: SMTP password and API keys stored in plaintext in `SiteSetting`. |
| **23** | **Business Intelligence & Reports** | `/admin/reports` | `GET /api/admin/reports`, `/export` | `Order`, `OrderItem`, `DigitalStock` | **Verified Working** | CSV export with CSV injection sanitization (`sanitizeCsvValue`). |
| **24** | **Admin MFA (TOTP / Recovery)** | `/admin/mfa-setup`, `/dashboard/security` | `GET/POST /api/security/**` | `UserSecurity`, `OtpChallenge`, `RecoveryCode` | 🔴 **Confirmed Defective (Security)** | **AUDIT-005**: `requireAdminMfa()` fails open if admin has not enrolled in TOTP. |

---

## 2. In-Depth Feature Analysis

### 2.1 Direct Product Gifting & Animated Unboxing (`/gift/[token]`)
- **Intended Functionality:** Buyers can purchase any digital product as a gift, customize a personal message, select an animated unboxing theme (Neon, Luxury, Gaming, Cyberpunk, Birthday), and specify recipient details. The recipient accesses `/gift/[token]`, clicks the 3D present to unwrap it with confetti, and receives their delivered license credentials.
- **Actual Implementation:**
  - Front-end unboxing component (`src/app/gift/[token]/page.tsx`) renders the gift card, triggers `canvas-confetti`, and retrieves gift data from `GET /api/gift/claim/[token]`.
  - Backend handler `src/lib/gifting/product-gifting.ts` retrieves the order and decrypts delivered keys when `order.deliveryStatus === "DELIVERED"`.
- **Security Vulnerability (AUDIT-002):**
  - In `src/app/api/orders/route.ts#L137`, public order tracking maps orders to `safeOrders` and explicitly includes:
    ```typescript
    giftClaimToken: tracked.giftClaimToken || null,
    ```
  - An attacker entering any phone number or order number into `/order-tracking` receives the `giftClaimToken`. They immediately visit `/gift/[token]` or query `GET /api/gift/claim/[token]`, which returns the customer's full login email, password, and license key in plaintext without requiring any authentication or recipient proof.

### 2.2 Official PDF Invoice Generator (`/api/orders/[id]/invoice`)
- **Intended Functionality:** Generates high-resolution branded PDF invoices for completed orders using `jsPDF`. Authenticated users can download invoices for their orders; guest buyers can download invoices by providing their checkout email.
- **Security Vulnerability (AUDIT-001):**
  - In `src/app/api/orders/[id]/invoice/route.ts#L41-L47`:
    ```typescript
    if (order.userId) {
      const auth = await requireAuth();
      // ... verifies auth.user.id === order.userId
    } else {
      // Guest order verification: verify caller email matches if provided
      const emailParam = req.nextUrl.searchParams.get("email");
      if (emailParam && emailParam.toLowerCase().trim() !== order.customerEmail.toLowerCase().trim()) {
        return NextResponse.json({ error: "Unauthorized access to invoice" }, { status: 403 });
      }
    }
    ```
  - If `emailParam` is completely omitted (`?email=` not provided), the condition `if (emailParam && ...)` is false.
  - The endpoint skips authentication entirely and serves the full PDF invoice containing the customer's full name, email, phone number, payment method, transaction ID, and itemized totals. Anyone knowing or guessing an order number (e.g., `AH-XXXX`) can download full invoices for all guest orders.

### 2.3 Admin Product Creation & Editing Form
- **Intended Functionality:** Admins manage catalog items, pricing, variations, descriptions, fulfillment modes, and images via `/admin/products/new` and `/admin/products/[id]/edit`.
- **Confirmed Defect (AUDIT-009):**
  - Component `src/components/admin/ProductEditorForm.tsx#L248` executes:
    ```typescript
    const res = await fetch(isEdit ? `/api/admin/products/${initialData.id}` : "/api/admin/products", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    ```
  - Route `src/app/api/admin/products/route.ts` only exports `GET`. It has **no `POST` handler**.
  - Route `src/app/api/admin/products/[id]/route.ts` exports `GET`, `PATCH`, `DELETE`. It has **no `PUT` handler**.
  - Both product creation and editing from the admin UI immediately fail with HTTP 405 Method Not Allowed.
  - Meanwhile, `POST /api/products` and `PATCH /api/products` exist under the public API root but only check `requireAdmin()` without enforcing `requireAdminMfa()`.
