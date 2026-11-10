# 02 — SECURITY HARDENING AND DEFENSE-IN-DEPTH REPORT

This report provides the exhaustive technical implementation and security architecture details for all vulnerability remediations applied to AI Haat (`aihaat.shop`).

---

## 1. Access Control & Authorization Hardening

### 1.1 Broken Object-Level Authorization (BOLA/IDOR) in Guest Invoices (AUDIT-001)
- **Vulnerability Description:** Previously, `/api/orders/[id]/invoice` did not enforce that callers requesting a guest order invoice provide an email address. If the query parameter `?email=` was omitted, the condition `if (emailParam && emailParam !== order.customerEmail)` evaluated to `false`, granting unauthenticated access to the full PDF invoice containing customer name, phone number, physical/email address, transaction ID, and itemized purchase breakdown.
- **Remediation Implemented:**
  1. For orders with an associated `userId`, the endpoint calls `getServerSession(authOptions)`. If the user is unauthenticated, HTTP 401 is returned. If the caller's ID does not match `order.userId` and role is not `ADMIN`, HTTP 403 Forbidden is returned.
  2. For guest orders (`order.userId === null`):
     - The endpoint requires either an authentic HMAC-SHA256 token (`?token=`) generated with `generateInvoiceToken(orderId, order.customerEmail)` or a matching customer email address (`?email=`).
     - Token comparison is performed in constant time using `crypto.timingSafeEqual` via `safeTokenCompare` to prevent timing attack side-channels.
     - If neither credentials match, the request fails closed with HTTP 403 Forbidden and code `GUEST_VERIFICATION_REQUIRED`.
  3. Added IP-based rate limiting of 20 requests per minute per IP via `rateLimitResponse` to mitigate brute-force enumeration attacks across order numbers.
  4. Updated `OrderTrackingClient.tsx` to prompt guest users for their order email before initiating invoice download.

---

## 2. Information Disclosure Defenses

### 2.1 Digital Gift Claim Token Leakage (AUDIT-002)
- **Vulnerability Description:** Public tracking endpoint `/api/orders?tracking=true&query=...` included `giftClaimToken: tracked.giftClaimToken || null` in the returned JSON object. An attacker looking up any order number or customer phone number received the token and could immediately navigate to `/gift/claim/[token]` to steal purchased licenses, software activations, and account credentials.
- **Remediation Implemented:**
  1. `giftClaimToken` is permanently omitted (`giftClaimToken: null`) in both the primary Prisma query mapper (line 137) and the local JSON DB fallback mapper (line 196).
  2. Claim tokens are now only returned to:
     - The buyer upon immediate checkout completion (`POST /api/orders` / `CheckoutPageClient.tsx`).
     - Authenticated buyers in `/dashboard/orders` when their session matches `order.userId`.
     - Direct recipients via targeted email / WhatsApp share link.

---

## 3. Input Validation & Content Injection Defenses

### 3.1 Stored Cross-Site Scripting (XSS) via SVG Uploads (AUDIT-003)
- **Vulnerability Description:** The upload validator in `src/lib/security/upload-validator.ts` permitted `.svg` files by only checking if the buffer contained `<svg`. Attackers could upload SVG files containing malicious `<script>` tags or XML event handlers (`onload`, `onerror`), which were stored in `public/uploads/` on the primary application domain.
- **Remediation Implemented:**
  1. `validateImageBuffer` explicitly inspects the header bytes for XML/SVG indicators (`<svg`, `<?xml`, `<html`, `<script`, `onload=`, `onerror=`) and immediately returns `{ valid: false, error: "SVG and scriptable image formats are not allowed for security reasons." }`.
  2. Permitted file types are strictly locked down to raster images verified via magic-byte signatures:
     - JPEG: `FF D8 FF`
     - PNG: `89 50 4E 47 0D 0A 1A 0A`
     - WEBP: `52 49 46 46 .... 57 45 42 50`
     - GIF: `47 49 46 38`
  3. In `src/app/api/upload/route.ts`, normalized extensions are restricted to `.jpg`, `.png`, `.webp`, `.gif`. Maximum payload size is capped at 10MB.
  4. Filenames are generated using 16 bytes of cryptographically random entropy (`crypto.randomBytes(16).toString("hex")`), eliminating directory traversal risks.

---

## 4. Availability, Rate Limiting & Proxy Security

### 4.1 Client IP Resolution & Global Rate Limiter Collapse (AUDIT-004)
- **Vulnerability Description:** When `TRUST_PROXY` was not set in `.env`, `getClientIp(req)` skipped proxy headers and returned a static literal string `"unknown:direct"`. Every user globally was assigned to the exact same rate limiting bucket. A single user placing an order or hitting the payment gateway rate limit (6 requests/minute) locked out all customers worldwide.
- **Remediation Implemented:**
  1. Trusted proxy mode defaults to active in production (`process.env.TRUST_PROXY !== "false"`).
  2. Evaluates headers in priority order:
     - `cf-connecting-ip` (Cloudflare trusted edge)
     - `x-real-ip` (Nginx reverse proxy)
     - `x-forwarded-for` (first valid public client IP in chain)
     - `req.ip` (Next.js server connection property)
  3. Validates each candidate IP with strict IPv4 and IPv6 regexes before adoption.
  4. Fallback when headers are absent: generates a SHA-256 fingerprint hash based on client User-Agent and headers (`client:${hash}`), ensuring distinct clients never collapse into a single global bucket.

---

## 5. Administrative Authentication & MFA Hardening

### 5.1 Admin MFA Bypass for Un-enrolled Accounts (AUDIT-005)
- **Vulnerability Description:** `requireAdminMfa()` called `requireMfaVerified()`. If the admin had not enrolled in TOTP (`totpEnabled === false`), `requireMfaVerified` returned `mfaLevel: 'NONE'` and allowed the request, completely defeating mandatory 2FA.
- **Remediation Implemented:**
  1. In `src/lib/auth-guard.ts`, `requireAdminMfa()` now queries `userSecurity` for `totpEnabled`. If `!isMfaEnabled`, it immediately fails closed, returning HTTP 403 with `{ error: "Administrative two-factor authentication setup is required.", code: "MFA_ENROLLMENT_REQUIRED" }`.
  2. `AdminLayoutClient.tsx` renders a prominent alert banner warning unenrolled administrators to activate 2FA at `/admin/mfa-setup`.

### 5.2 Hardcoded Super-Admin Emails (AUDIT-007)
- **Vulnerability Description:** Specific Gmail addresses were hardcoded in `src/lib/auth.ts` and in the client bundle `src/components/admin/AdminLayoutClient.tsx`, leaking administrator identities to anyone inspecting frontend JavaScript.
- **Remediation Implemented:**
  1. Removed hardcoded emails from `AdminLayoutClient.tsx`, relying solely on server-authoritative `user.role === 'ADMIN'`.
  2. Updated `getAdminEmails()` in `src/lib/auth.ts` to strictly prioritize the `ADMIN_EMAILS` environment variable.

---

## 6. Secrets Management & Cryptography at Rest

### 6.1 Plaintext Mailer Secrets in SiteSettings DB (AUDIT-006)
- **Vulnerability Description:** SMTP passwords and API keys entered via the Admin Email Settings UI were written directly to `SiteSetting` records in plaintext.
- **Remediation Implemented:**
  1. In `src/app/api/admin/email-marketing/settings/route.ts`, `smtpPass` and `apiKey` are encrypted with AES-256-GCM using `encryptCredential()` before persistence.
  2. In `src/lib/email-marketing/provider.ts`, `decryptCredential()` transparently decrypts the stored values upon initialization, while preserving backward compatibility for legacy unencrypted entries.
  3. `getMaskedEmailMarketingSettings()` masks the plaintext secrets, exposing only boolean existence flags (`hasSmtpPass`, `hasApiKey`) in the Admin UI.

---

## 7. Cross-Site Request Forgery (CSRF) Defense

### 7.1 Uniform Edge CSRF Middleware (AUDIT-008)
- **Vulnerability Description:** Administrative mutation endpoints previously relied on ad-hoc origin checks that were missing across multiple routes.
- **Remediation Implemented:**
  1. Deployed `src/middleware.ts` configured with matcher `["/api/admin/:path*"]`.
  2. Every state-changing request (`POST`, `PUT`, `PATCH`, `DELETE`) is intercepted at the edge and verified using `isSameOriginMutation(req)`.
  3. Requests carrying mismatched `Origin`, external `Referer`, or `Sec-Fetch-Site: cross-site` are blocked immediately with HTTP 403 Forbidden and code `CSRF_FORBIDDEN`.
