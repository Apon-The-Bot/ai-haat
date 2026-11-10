# 10 — PRE-DEPLOYMENT REGRESSION CHECKLIST

This checklist must be executed before each production deployment of AI Haat to verify that no functional regressions have occurred.

---

## 1. Automated Verification Checks

- [x] **TypeScript Strict Check:** `npx tsc --noEmit` exits with code 0.
- [x] **Production Bundle Build:** `npm run build` exits with code 0 without type errors or missing route exports.
- [x] **Regression Test Suite:** `npx tsx scripts/verify-all-fixes.ts` executes 36/36 passing tests.
- [x] **Linting Conformance:** `npm run lint` completes with zero fatal errors.

---

## 2. Customer-Facing Workflows

- [x] **Storefront Landing Page (`/`):**
  - Hero banner renders.
  - Featured products grid populates from database.
  - Category filters update catalog view.
  - Bilingual switcher toggles between বাংলা and English seamlessly.

- [x] **Catalog & Product Detail (`/shop`, `/product/[slug]`):**
  - Product images load via Next.js image optimizer.
  - Price display accurately reflects regular vs sale price in BDT.
  - Variation selector dynamically recalculates price and updates stock availability.
  - "Add to Cart" and "Quick Buy" modals trigger without client console errors.

- [x] **Cart & Checkout (`/cart`, `/checkout`):**
  - Cart item additions, removals, and quantity modifications calculate total using poisha arithmetic.
  - Volume discount badges apply when purchasing 3+, 5+, or 10+ units.
  - Coupon code input validates against `/api/coupons/validate`.
  - Payment method selector functions for bKash, Nagad, Rocket, and Wallet Balance.
  - Form validation requires customer name, email, and 11-digit Bangladesh phone number (`01XXXXXXXXX`).

- [x] **Post-Checkout & Order Tracking (`/checkout/success`, `/order-tracking`):**
  - Order success screen displays authoritative Order Number (e.g. `AH-XXXXX`).
  - If purchased as a gift, gift claim link displays exclusively on the success confirmation.
  - Searching in `/order-tracking` returns order progress timeline with masked PII.
  - Invoice download triggers email verification challenge for guest users.

- [x] **Customer Dashboard (`/dashboard/*`):**
  - Order history displays previous orders with line items and delivered keys.
  - Digital Vault reveals encrypted software credentials on request.
  - Wallet balance displays correctly; gift card redemption updates balance atomically.

---

## 3. Administrative Panel Workflows

- [x] **Authentication & MFA Barrier (`/admin`):**
  - Non-admin sessions redirected or blocked with HTTP 403.
  - Admin accounts without active TOTP are blocked from administrative mutations and alerted with setup banner.
  - MFA verification session lasts 24 hours with 10-minute step-up timeout for critical actions.

- [x] **Product Catalog Operations (`/admin/products`):**
  - Product list loads with pagination, status filters, and search.
  - "Add New Product" (`/admin/products/new`) saves via `POST /api/admin/products`.
  - "Edit Product" (`/admin/products/edit/[id]`) loads data and saves via `PUT /api/admin/products/[id]`.
  - Legacy edit route `/admin/products/[id]/edit` cleanly redirects to canonical path.

- [x] **Media & Asset Management (`/api/upload`):**
  - PNG/JPG/WEBP uploads succeed and output accessible `/uploads/...` URLs.
  - SVG uploads and scriptable payloads are rejected with HTTP 400.

- [x] **Email Marketing Hub (`/admin/email-marketing/*`):**
  - Settings page (`/settings`) displays masked credentials.
  - Saving settings encrypts SMTP secrets using AES-256-GCM.
  - Campaign creation and template editor function as expected.

---

## 4. Operational & Infrastructure Checks

- [x] **CSRF Middleware:** Cross-origin mutations to `/api/admin/*` are blocked with HTTP 403.
- [x] **Rate Limiting:** Normal browsing is unimpeded; excessive requests receive HTTP 429 with `Retry-After`.
- [x] **Environment Variables:** All required keys present in `.env` (`NEXTAUTH_SECRET`, `MFA_ENCRYPTION_KEY`, `DATABASE_URL`).
- [x] **Database Safety:** No destructive migrations queued or executed.
