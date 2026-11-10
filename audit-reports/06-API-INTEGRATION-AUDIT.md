# 06 — API & THIRD-PARTY INTEGRATION AUDIT

This report inventories all 121 App Router API route handlers, evaluates third-party external integrations, and assesses error handling, timeout configurations, and reliability.

---

## 1. External Third-Party Integration Inventory

| Integration | Provider / Endpoint | Integration Type | Authentication | Reliability & Timeout Assessment |
| :--- | :--- | :--- | :--- | :--- |
| **Payment Gateway** | PipraPay (`https://piprapay.com/api`) | REST POST (`/checkout/redirect`, `/verify-payment`) | API Key Header (`MHS-PIPRAPAY-API-KEY`) | **Hardened**: 15s `AbortController` timeout; atomic idempotent order transition; amount and order ID matching. |
| **Authentication** | Google Identity (`accounts.google.com`) | OAuth 2.0 / OpenID Connect | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | **Standard**: Managed by NextAuth v4 JWT flow. |
| **Transactional Email**| Hostinger SMTP (`smtp.hostinger.com:465`) | Nodemailer TLS Pool | `SMTP_USER`, `SMTP_PASS` | **Functional**: Configurable retry logic in `email-service.ts`; plaintext password in `site_settings`. |
| **Admin Alerts** | Telegram Bot API (`api.telegram.org`) | REST POST (`/sendMessage`) | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID` | **Resilient**: Non-blocking `catch(console.error)`; alerts on orders, low stock, payment mismatches. |
| **Marketing Analytics**| Meta Conversions API (CAPI) | Server REST POST (`graph.facebook.com`) | `META_CAPI_ACCESS_TOKEN`, `META_PIXEL_ID` | **Non-blocking**: Server purchase events fired in background; never halts user checkout. |

---

## 2. API Route Inventory & Security Matrix (Selected Key Routes)

The application defines 121 route files in `src/app/api/**/route.ts`. The table below outlines major functional domains and their verified status:

| Endpoint Path | Methods | Auth Guard | Rate Limited? | CSRF Protected? | Verified Status & Notes |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `/api/orders` | `GET, POST` | Optional GET / None POST | ⚠️ Yes (Global IP) | Yes | **Defect**: Leaks `giftClaimToken` in tracking GET; global IP collapse blocks POST. |
| `/api/orders/[id]/invoice` | `GET` | Conditional | No | Exempt (GET) | 🔴 **Critical Defect (AUDIT-001)**: Omitting `?email=` allows guest invoice download. |
| `/api/payment/create` | `POST` | None | ⚠️ Yes (Global IP) | No | **Defect (AUDIT-004)**: Global IP rate limiter blocks users if >6 global requests/min. |
| `/api/payment/callback` | `GET` | None | No | Exempt (GET) | **Verified**: Remote server verification against PipraPay; atomic order transition. |
| `/api/payment/webhook` | `POST` | None (IPN) | Yes (30/min) | No (External) | **Verified**: Remote server verification against PipraPay; idempotent replay guard. |
| `/api/gift/claim/[token]` | `GET, POST` | None | No | No | 🔴 **Critical Defect (AUDIT-002)**: Unauthenticated plain text key delivery. |
| `/api/gift-cards/redeem` | `POST` | `requireAuth` | ❌ No | No | **Risk**: Missing rate limiting on code redemption guessing. |
| `/api/admin/products` | `GET` | `requireAdminMfa` | No | No | 🔴 **Critical Defect (AUDIT-009)**: Missing `POST` handler (returns 405). |
| `/api/admin/products/[id]`| `GET, PATCH, DELETE` | `requireAdminMfa` | No | No | 🔴 **Critical Defect (AUDIT-009)**: Missing `PUT` handler (returns 405). |
| `/api/products` | `GET, POST, PATCH, DELETE` | `requireAdmin` (mutations) | No | No | ⚠️ **Risk**: Bypasses Admin MFA check (`requireAdmin` vs `requireAdminMfa`). |
| `/api/upload` | `POST` | `requireAdminMfa` | No | No | 🔴 **High Defect (AUDIT-003)**: Unsanitized SVG file upload stored on main domain. |
| `/api/affiliate/click` | `POST` | None | ❌ No | No | ⚠️ **Risk (AUDIT-013)**: Unbounded click stat inflation and DB row creation. |
| `/api/cron/**` | `GET, POST` | `isCronAuthorized` | No | Exempt | **Verified**: Timing-safe comparison of `Authorization: Bearer <CRON_SECRET>`. |

---

## 3. Webhook & Payment Gateway Failure Recovery

### 3.1 Idempotency & Replay Protection
- Both the **Callback** (`/api/payment/callback`) and **Webhook** (`/api/payment/webhook`) handlers implement atomic status checks:
  ```typescript
  const updateResult = await prisma.order.updateMany({
    where: {
      id: orderRecord.id,
      paymentStatus: "PENDING", // Atomic guard
    },
    data: {
      paymentStatus: "VERIFIED",
      deliveryStatus: "PROCESSING",
      trxId: realTrxId || transactionRef,
    },
  });
  ```
- If PipraPay delivers both the webhook and the browser callback concurrently, whichever arrives first updates the record from `PENDING` to `VERIFIED`. The second handler receives `updateResult.count === 0` and logs `DUPLICATE_EVENT_IGNORED`, preventing duplicate fulfillment emails or double-crediting.

### 3.2 Amount Mismatch Detection
- When PipraPay confirms payment, the verified amount is checked against the database order total:
  ```typescript
  const expectedAmount = Number(orderRecord.totalBDT);
  if (Math.abs(verifiedAmount - expectedAmount) > 0.01) {
    // Blocks verification and creates PAYMENT_AMOUNT_MISMATCH timeline event
  }
  ```
- This prevents tampering attacks where an attacker creates an order for 1,000 BDT but pays 10 BDT.
