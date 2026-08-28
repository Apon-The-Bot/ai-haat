# AI Haat (`aihaat.shop`) — Phase 1 Pre-Deployment Baseline & Source-of-Truth Report

> **Report Date:** August 28, 2026  
> **Phase:** 1 — Pre-Deployment Baseline, Safety Checkpoint & Source-of-Truth Verification  
> **Status:** **COMPLETE — SAFE WITH WARNINGS** (Ready for Phase 2 Remediations)  
> **Integrity Guarantee:** Zero application code modified | Zero production data altered | Zero secrets exposed

---

## A. Executive Summary

| Parameter | Status | Evidence / Notes |
|---|:---:|---|
| **Overall Baseline Status** | **SAFE WITH WARNINGS** | Clean baseline established; all safety checkpoints recorded. |
| **Production Build** | **PASS** | `npm run build` completed with 0 errors; 104 static and dynamic routes compiled. |
| **TypeScript Compilation** | **PASS** | `npx tsc --noEmit` completed with **0 errors** under strict mode. |
| **Prisma Schema Validation** | **PASS** | `npx prisma validate` completed with 0 errors; 45 models and 33 enums validated. |
| **Automated Test Suites** | **PASS** | **288 / 288 assertions passed (100%)** across 10 standalone master test suites. |
| **Dependency Security** | **WARNING** | `npm audit` reported 7 vulnerabilities (6 High, 1 Moderate) in `nodemailer`, `next`, `postcss`. |
| **Secret Safety** | **ACTION REQUIRED** | 1 plaintext credentials file (`Ai Haat Client ID Secret.json`) and 1 hardcoded DB password string found. |
| **Database Backup** | **INCOMPLETE** | `scripts/backup-db.ts` backs up only 12 of 31 active business models; requires enhancement before migrations. |
| **Git Safety Checkpoint** | **ESTABLISHED** | Base commit `57af644326f7166e51032b45cbe5f533fd85f5b5`; all modified/untracked files inventoried. |
| **Production Deployment Readiness** | **CONDITIONAL** | Must resolve 6 P0 and 11 P1 issues before live traffic cutover. |

---

## B. Repository State & Checkpoint

- **Current Branch:** `main`
- **Base Commit Hash:** `57af644326f7166e51032b45cbe5f533fd85f5b5`
- **Working Tree Status:** **DIRTY (Pre-existing modifications preserved)**
- **Modified Source Files (80):** Preserved without overwrite or reset.
- **Untracked Files / Directories (40+):** Preserved in workspace.
- **Ignored Sensitive Files:** `Ai Haat Client ID Secret.json` (Untracked, to be removed in Phase 2).

---

## C. Technology & Toolchain Verification

| Component | Target Version | Installed / Verified Version | Status |
|---|---|---|:---:|
| **Node.js** | Node 20 LTS | `v22.20.0` (Runtime compatible with Node 20 LTS) | ✅ PASS |
| **npm** | 10.x | `10.9.3` | ✅ PASS |
| **TypeScript** | 5.x strict | `5.6.3` / compiler `5.9.3` (`strict: true`) | ✅ PASS |
| **Next.js** | 14.x App Router | `14.2.35` | ✅ PASS |
| **Prisma ORM** | 5.x | `5.19.1` (Query Engine `69d742ee`) | ✅ PASS |
| **React** | 18.x | `18.3.1` / `react-dom 18.3.1` | ✅ PASS |
| **Tailwind CSS** | 3.x | `3.4.14` | ✅ PASS |
| **NextAuth** | v4 | `4.24.15` | ✅ PASS |
| **PM2** | Cluster Mode | `ecosystem.config.js` (`instances: "max"`, `exec_mode: "cluster"`) | ✅ PASS |

---

## D. Environment Registry Summary

- **Total Variables Referenced in Code:** 30
- **Documented in `.env.example`:** 16
- **Missing from `.env.example` (8):** `CRON_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_ADMIN_CHAT_ID`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `EMAIL_FROM`.
- **Critical Fail-Open Security Issue:** `src/app/api/cron/email-queue/route.ts` allows unauthenticated access if `CRON_SECRET` is unset in environment.

*(Detailed variable mapping available in `docs/predeploy/01-environment-registry.md`)*

---

## E. Verified Audit Findings (55 Total)

All 55 reported audit findings have been independently verified against current source code:
- **6 P0 Critical Vulnerabilities**
- **11 P1 High-Severity Vulnerabilities**
- **24 P2 Medium-Severity Issues**
- **14 P3 Low-Severity / Quality Items**

*(Complete itemized breakdown available in `docs/predeploy/01-verified-issues.md`)*

---

## F. Verified P0 & P1 Critical List

### 🔴 P0 Critical (Must Fix in Phase 2)
1. **Double Wallet Top-up Race Condition:** Concurrent PipraPay webhook & callback credit wallet 2x due to missing `@unique` on `WalletTransaction.trxId`.
2. **Hardcoded Database Password in Source:** `src/lib/prisma.ts:10-12` contains plaintext password fragment.
3. **Cron Email-Queue Auth Bypass:** `src/app/api/cron/email-queue/route.ts:18-27` fails open when `CRON_SECRET` is unset.
4. **Supplier Webhook Secret Bypass:** `src/lib/commerce/suppliers.ts:26-40` skips `apiSecret` verification when header is omitted.
5. **Exposed Credentials File:** `Ai Haat Client ID Secret.json` located in project root.
6. **Open Redirect in Click Tracker:** `src/app/api/track/click/route.ts:7-18` performs unvalidated 302 redirect.

### 🟠 P1 High Severity (Must Fix in Phase 3 & 4)
7. **Double Refund Credit Race Condition:** Status check outside transaction in `src/lib/commerce/refunds.ts:143-268`.
8. **Double Affiliate Payout Race Condition:** Status check outside transaction in `src/lib/commerce/affiliates.ts:833-872`.
9. **Negative Affiliate Balance via Concurrent Payouts:** Missing conditional balance guard in `src/lib/commerce/affiliates.ts:763-774`.
10. **NextAuth ID Mismatch:** `token.id` uses numeric Google `sub` instead of Prisma User `cuid`, causing broken relations.
11. **Reflected XSS in Review Quick-Rate:** Unescaped HTML interpolation in `src/app/api/reviews/quick-rate/route.ts`.
12. **Image Optimization Disabled:** `next.config.mjs:6` sets `images.unoptimized: true`.
13. **Missing Rate Limiting on Orders & Product Requests:** Public mutation POST endpoints lack IP/session rate limits.
14. **Rate Limiter IP Spoofing:** `src/lib/rate-limit.ts` trusts unverified `X-Forwarded-For` proxy headers.
15. **Incomplete Database Backup:** `scripts/backup-db.ts` omits 19 active business models.
16. **No Automated Backup Schedule:** Backups are manual only.
17. **7 Dependency Vulnerabilities:** `nodemailer` CRLF injection, `next` SSRF/auth bypass, `postcss` path traversal.

---

## G. Financial & Commerce Invariant Map

| Financial Invariant | Target Behavior | Current Implementation Status |
|---|---|:---:|
| **1 Payment = 1 Credit** | No double crediting of wallet balance | ⚠️ **VULNERABLE** (P0 Top-up Race Condition) |
| **Order Payment Idempotency** | Verified payment sets order to VERIFIED exactly once | ✅ **PROTECTED** (`order.updateMany({ where: { paymentStatus: 'PENDING' } })`) |
| **Server Price Authority** | Client cannot manipulate checkout prices | ✅ **PROTECTED** (Server recalculates via `calculateOrderQuote`) |
| **Single Stock Delivery** | Digital stock item delivered to at most 1 customer | ✅ **PROTECTED** (Atomic transaction lock with status verification) |
| **Refund Idempotency** | Refund credited to wallet at most once | ⚠️ **VULNERABLE** (P1 Refund Race Condition) |
| **Affiliate Payout Idempotency**| Affiliate payout approved/debited at most once | ⚠️ **VULNERABLE** (P1 Affiliate Race Conditions) |
| **Coupon Usage Limit** | Coupon cannot exceed max uses under concurrency | ✅ **PROTECTED** (Atomic SQL `$executeRaw` with condition) |

---

## H. Authentication Identity Mapping

```
Google OAuth Profile (profile.sub: "1093489...")
       │
       ▼
NextAuth JWT Callback (token.id = "1093489...")  <-- ⚠️ MISMATCH
       │
       ▼
NextAuth Session (session.user.id = "1093489...")
       │
       ├─── MySQL users table (id: "cm1a2b3c..." - CUID)
       ├─── orders table (userId: "cm1a2b3c...")
       └─── delivered_keys table (userId: "cm1a2b3c...")
```
*Remediation Required in Phase 3: Update `jwt` callback to map `token.id = dbUser.id`.*

---

## I. Database & Migration Status

- **Prisma Models:** 45 active models
- **Prisma Enums:** 33 enums
- **Explicit Indexes:** 63+ indexes
- **Migration History:** `prisma/migrations/` **does not exist**.
- **Current DB Sync Strategy:** Direct schema pushes (`prisma db push`).
- **Database Backup:** Manual snapshot script (`scripts/backup-db.ts`) exports 12 models to `backups/*.json`.

---

## J. Build & Test Baseline Results

- **`npx tsc --noEmit`**: **0 errors** (PASS)
- **`npm run build`**: **0 errors** (PASS - 104 static/dynamic routes generated)
- **`npx prisma validate`**: **0 errors** (PASS - Schema is valid)
- **Automated Tests**: **288 / 288 assertions passed (100%)**
  - Database Integrity Suite: 17/17 passed
  - Supplier, Cost & Profit Suite: 25/25 passed
  - Notification & Reliability Suite: 31/31 passed
  - Affiliate & Payout Suite: 33/33 passed
  - Vault & Warranty Suite: 37/37 passed
  - Engagement & Cart Suite: 33/33 passed
  - Security & IDOR Suite: 12/12 passed
  - Checkout & Pricing Tamper Suite: 12/12 passed
  - SEO Master Suite: 61/61 passed
  - Product Domain Suite: 27/27 passed

---

## K. Regression-Sensitive Areas

The following modules have high test coverage and verified production behavior; future remediation phases must strictly avoid unnecessary modifications to them:
1. **Pricing Engine (`src/lib/commerce/pricing.ts`)**: Server-authoritative quote calculation.
2. **Inventory Claim Engine (`src/lib/commerce/inventory.ts`)**: Atomic conditional stock locking.
3. **Notification Outbox (`src/lib/notifications/service.ts`)**: Durable event queue and retry mechanism.
4. **Credential Encryption (`src/lib/mfa/crypto.ts`)**: AES-256-GCM cipher and key derivation.
5. **SEO & Metadata Generators (`src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`)**: Structured JSON-LD schemas.

---

## L. Safe Rollback Strategy

1. **Pre-Hardening Git Checkpoint:**
   Commit: `57af644326f7166e51032b45cbe5f533fd85f5b5` on branch `main`.
2. **Preservation of User Workspace:**
   All 80 modified and 40+ untracked files remain intact. No destructive `git reset` or `git clean` commands were run.
3. **Database Integrity:**
   No schema changes (`db push` / `migrate`) were executed in Phase 1. All test scripts executed within isolated mock fixtures and cleaned up their artifacts.
