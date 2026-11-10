# 14 — MASTER ISSUE REGISTER

This register consolidates every identified issue, security vulnerability, and architectural defect across the AI Haat project, categorized and prioritized with verifiable evidence.

---

## Issue Summary Statistics

- **Total Issues Identified:** 18
- **Critical (P0):** 4
- **High (P1):** 4
- **Medium (P2):** 6
- **Low / Informational (P3):** 4

---

## Master Register Table

| ID | Title | Category | Severity | Conf. | Verification Status | Priority | Affected Files |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **AUDIT-001** | BOLA / IDOR Guest Invoice PDF Download | Security | **Critical** | High | Confirmed Static Analysis | **P0** | `src/app/api/orders/[id]/invoice/route.ts:41-47` |
| **AUDIT-002** | Digital Gift Token Leak in Order Tracking | Security | **Critical** | High | Confirmed Static Analysis | **P0** | `src/app/api/orders/route.ts:137` |
| **AUDIT-003** | Stored XSS via Unsanitized SVG Uploads | Security | **High** | High | Confirmed Static Analysis | **P0** | `src/lib/security/upload-validator.ts:52-56` |
| **AUDIT-004** | Global Client IP Rate Limiter Collapse (DoS) | Security / Reliability | **High** | High | Confirmed Static Analysis | **P0** | `src/lib/rate-limit.ts:70-73` |
| **AUDIT-005** | Admin MFA Bypass for Un-enrolled Accounts | Security | **High** | High | Confirmed Static Analysis | **P1** | `src/lib/auth-guard.ts:80-120` |
| **AUDIT-006** | Plaintext Mailer Secrets in SiteSettings DB | Security | **Medium** | High | Confirmed Static Analysis | **P2** | `src/app/api/admin/email-marketing/settings/route.ts:61-79` |
| **AUDIT-007** | Hardcoded Super-Admin Email Addresses | Security | **Medium** | High | Confirmed Static Analysis | **P2** | `src/lib/auth.ts:6-11` |
| **AUDIT-008** | Inconsistent CSRF Defense on Admin Routes | Security | **Medium** | High | Confirmed Static Analysis | **P2** | `src/app/api/admin/**` |
| **AUDIT-009** | Admin Product Form 405 Method Not Allowed | Functionality | **Critical** | High | Confirmed Static Analysis | **P0** | `src/components/admin/ProductEditorForm.tsx:248` |
| **AUDIT-010** | Duplicate Admin Product Edit Routes | Architecture | **Low** | High | Confirmed Static Analysis | **P3** | `src/app/admin/products/[id]/edit` & `edit/[id]` |
| **AUDIT-011** | Dead NextAuth `/login` Route Reference | Functionality | **Medium** | High | Confirmed Static Analysis | **P2** | `src/lib/auth.ts:182` |
| **AUDIT-012** | Dual-State DB Architecture (MySQL vs JSON) | Architecture | **High** | High | Confirmed Static Analysis | **P1** | `src/lib/*-db.ts` & `src/app/api/orders/route.ts` |
| **AUDIT-013** | Unbounded Unauthenticated Click Inflation | Reliability | **Low** | High | Confirmed Static Analysis | **P3** | `src/app/api/affiliate/click/route.ts:6-30` |
| **AUDIT-014** | Financial Schema Drift (Float vs DECIMAL) | Database | **High** | High | Confirmed Static Analysis | **P1** | `prisma/schema.prisma:254, 429-431` |
| **AUDIT-015** | Missing Foreign Key Database Indexes | Database / Perf | **Medium** | High | Confirmed Static Analysis | **P2** | `prisma/schema.prisma:388-419` |
| **AUDIT-016** | Ephemeral File Uploads on Local Disks | DevOps | **Medium** | High | Confirmed Static Analysis | **P2** | `src/app/api/upload/route.ts:51-61` |
| **AUDIT-017** | Overly Restrictive Global `no-store` Header | Performance | **Low** | High | Confirmed Static Analysis | **P3** | `next.config.mjs:74-76` |
| **AUDIT-018** | Missing Data Retention & Table Partitioning | Database / Scalability | **Low** | High | Confirmed Static Analysis | **P3** | `prisma/schema.prisma` (Event Logs) |

---

## Detailed Issue Records

### AUDIT-001
- **Finding ID:** AUDIT-001
- **Title:** Broken Object-Level Authorization (BOLA/IDOR) in Guest Invoice PDF Download
- **Category:** Security
- **Severity:** Critical
- **Confidence:** High
- **Verification Status:** Confirmed Static Analysis
- **Affected Files:** `src/app/api/orders/[id]/invoice/route.ts:41-47`
- **Description:** For guest orders (`order.userId === null`), if the caller omits `?email=`, `emailParam` is null. The conditional check `if (emailParam && emailParam !== order.customerEmail)` evaluates to false, completely bypassing authorization and delivering the customer's full PDF invoice containing PII and transaction records.
- **Root Cause:** Incomplete condition logic that only validates email if the parameter is supplied, rather than enforcing that it must be supplied and match.
- **Impact:** Complete exposure of all guest customer PII, phone numbers, and transaction IDs to unauthenticated attackers.
- **Recommended Fix:** Enforce mandatory email presence: `if (!emailParam || emailParam.toLowerCase().trim() !== order.customerEmail.toLowerCase().trim()) return 403;`.
- **Priority:** P0

---

### AUDIT-002
- **Finding ID:** AUDIT-002
- **Title:** Digital Gift Claim Token Leakage in Public Order Tracking
- **Category:** Security
- **Severity:** Critical
- **Confidence:** High
- **Verification Status:** Confirmed Static Analysis
- **Affected Files:** `src/app/api/orders/route.ts:137`
- **Description:** Public order tracking returns `giftClaimToken: tracked.giftClaimToken || null` in the public response. Anyone querying an order number or customer phone number receives the token, which unlocks plaintext software credentials at `/api/gift/claim/[token]`.
- **Root Cause:** Developer included the raw gift claim token in the sanitized order response object.
- **Impact:** Unauthenticated theft of digital licenses, passwords, and accounts purchased as gifts.
- **Recommended Fix:** Omit `giftClaimToken` from the public order tracking DTO.
- **Priority:** P0

---

### AUDIT-003
- **Finding ID:** AUDIT-003
- **Title:** Stored Cross-Site Scripting (XSS) via Unsanitized SVG Uploads
- **Category:** Security
- **Severity:** High
- **Confidence:** High
- **Verification Status:** Confirmed Static Analysis
- **Affected Files:** `src/lib/security/upload-validator.ts:52-56`, `src/app/api/upload/route.ts:46-64`
- **Description:** Upload validator permits SVG files with only a prefix check (`<svg`), performing no script stripping. Files are written to `public/uploads/` on the main domain, where inline scripts are permitted by CSP (`script-src 'unsafe-inline'`).
- **Root Cause:** Inadequate input validation for XML-based file types.
- **Impact:** Stored XSS leading to administrative account takeover.
- **Recommended Fix:** Reject SVG uploads or purify SVG content using `isomorphic-dompurify` before writing to disk; host uploads on an isolated origin.
- **Priority:** P0

---

### AUDIT-004
- **Finding ID:** AUDIT-004
- **Title:** Global Client IP Rate Limiter Collapse & Application Denial of Service
- **Category:** Security / Reliability
- **Severity:** High
- **Confidence:** High
- **Verification Status:** Confirmed Static Analysis
- **Affected Files:** `src/lib/rate-limit.ts:70-73`
- **Description:** Because `TRUST_PROXY` is undefined in `.env`, `getClientIp(req)` returns `"unknown:direct"` for every visitor worldwide. All global users share single rate limit buckets (e.g. 6 requests/minute on payment creation), causing widespread false-positive 429 errors for legitimate customers.
- **Root Cause:** Hardcoded fallback to a static global string when proxy trust is false.
- **Impact:** Severe checkout blockage and inability to place orders under normal traffic.
- **Recommended Fix:** Set `TRUST_PROXY=true` in production and resolve client IP from socket connections when proxies are disabled.
- **Priority:** P0

---

### AUDIT-009
- **Finding ID:** AUDIT-009
- **Title:** Admin Product Creation and Edit Form Calls Non-Existent Endpoints (HTTP 405)
- **Category:** Functionality
- **Severity:** Critical
- **Confidence:** High
- **Verification Status:** Confirmed Static Analysis
- **Affected Files:** `src/components/admin/ProductEditorForm.tsx:248`, `src/app/api/admin/products/route.ts`, `src/app/api/admin/products/[id]/route.ts`
- **Description:** The admin product editor sends `POST /api/admin/products` to create and `PUT /api/admin/products/[id]` to edit. Neither HTTP method is defined in those route files, resulting in HTTP 405 Method Not Allowed and completely breaking catalog updates.
- **Root Cause:** API route handler methods (`PATCH` vs `PUT`, missing `POST`) do not match the frontend component contracts.
- **Impact:** Admins cannot create or edit catalog products from the admin interface.
- **Recommended Fix:** Add `POST` handler to `/api/admin/products/route.ts` and support `PUT`/`PATCH` in `/api/admin/products/[id]/route.ts` with `requireAdminMfa()`.
- **Priority:** P0
