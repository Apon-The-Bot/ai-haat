# AI Haat (`aihaat.shop`) — Phase 2 P0 Critical Remediation Report

> **Report Date:** August 28, 2026  
> **Phase:** 2 — P0 Critical Security, Secret Exposure & Wallet Idempotency Remediation  
> **Status:** **COMPLETE — PASS WITH MANUAL ACTIONS (ROTATIONS)**  
> **Verified Tests:** 38/38 P0 tests passed | 288/288 regression tests passed | **326/326 Total Passed (100%)**

---

## A. Phase Summary

In Phase 2, all 6 verified P0 critical vulnerabilities and their required supporting changes were remediated with zero regressions:
1. **P0-1 (Double Wallet Top-up Race Condition):** Resolved via centralized `finalizeWalletTopup()` service with database-level `@unique` constraint on `WalletTransaction.trxId` and interactive transaction write-conflict resolution.
2. **P0-2 (Hardcoded Database Password in Source):** Removed plaintext password fragments from `src/lib/prisma.ts`; connection string strictly enforced via `process.env.DATABASE_URL`.
3. **P0-3 (Cron Email Queue Auth Bypass):** Implemented timing-safe `isCronAuthorized()` helper in `src/lib/cron-auth.ts` ensuring fail-closed authentication when `CRON_SECRET` is unset.
4. **P0-4 (Supplier Webhook Auth Bypass):** Fixed `validateSupplierAuth()` in `src/lib/commerce/suppliers.ts` to strictly require and verify `x-supplier-secret` using constant-time comparison when configured.
5. **P0-5 (Exposed Google OAuth Credentials File):** Removed `Ai Haat Client ID Secret.json` from the project workspace and hardened `.gitignore` with explicit secret file patterns.
6. **P0-6 (Open Redirect in Email Click Tracker):** Implemented strict domain allowlist and URL validator in `src/app/api/track/click/route.ts` that neutralizes protocol-relative, credential, and external phishing redirects.

---

## B. Files Changed

| File | Change Type | Purpose |
|---|:---:|---|
| `prisma/schema.prisma` | MODIFIED | Added `@unique` to `WalletTransaction.trxId` |
| `src/lib/prisma.ts` | MODIFIED | Removed hardcoded database password string; fail-closed on missing `DATABASE_URL` |
| `src/lib/cron-auth.ts` | **NEW** | Centralized, timing-safe (`crypto.timingSafeEqual`) cron authorization helper |
| `src/app/api/cron/email-queue/route.ts` | MODIFIED | Applied `isCronAuthorized()` to prevent unauthenticated execution |
| `src/app/api/cron/notifications/route.ts` | MODIFIED | Applied timing-safe cron authentication |
| `src/app/api/cron/inventory-expiry/route.ts` | MODIFIED | Applied timing-safe cron authentication |
| `src/app/api/cron/engagement/route.ts` | MODIFIED | Applied timing-safe cron authentication |
| `src/lib/commerce/suppliers.ts` | MODIFIED | Fixed `validateSupplierAuth` to fail-closed on missing/invalid supplier secret |
| `src/app/api/track/click/route.ts` | MODIFIED | Fixed open redirect with domain whitelist and protocol sanitization |
| `src/lib/commerce/wallet-topup.ts` | **NEW** | Centralized, atomic, concurrency-safe wallet top-up finalization engine |
| `src/app/api/payment/webhook/route.ts` | MODIFIED | Integrated `finalizeWalletTopup()` |
| `src/app/api/payment/callback/route.ts` | MODIFIED | Integrated `finalizeWalletTopup()` |
| `.gitignore` | MODIFIED | Added explicit ignore patterns for OAuth/secret JSON files |
| `.env.example` | MODIFIED | Added placeholders for `CRON_SECRET`, Telegram, WhatsApp, and URL variables |
| `Ai Haat Client ID Secret.json` | **DELETED** | Removed exposed credentials file from project workspace |
| `scripts/test-p0-remediation-suite.ts` | **NEW** | Comprehensive 38-assertion automated test suite for all P0 fixes |

---

## C. P0-1 Wallet Race Remediation

### Root Cause
Both `/api/payment/webhook` and `/api/payment/callback` executed separate wallet crediting routines. Under concurrency, both routes checked `findFirst({ where: { trxId } })` before inserting. Because `WalletTransaction.trxId` had no `@unique` constraint, simultaneous requests both inserted a record and credited `walletBalanceBDT` 2x.

### Fix & Database Invariant
1. Added `@unique` constraint to `WalletTransaction.trxId` in `prisma/schema.prisma`.
2. Created centralized `finalizeWalletTopup()` in `src/lib/commerce/wallet-topup.ts`.
3. The function uses an interactive transaction:
   - Queries `findUnique({ where: { trxId } })`.
   - Inserts `WalletTransaction` with `@unique` lock.
   - Atomically increments `User.walletBalanceBDT`.
   - Catches Prisma `P2002` (Unique Constraint) and `P2034` (Write Conflict) to safely return `alreadyProcessed: true`.
4. Dispatches deduplicated notification events only on the first credit.

### Concurrency Test Evidence
- **Burst Test:** 10 simultaneous concurrent requests with identical `trxId` produced **exactly 1 credit** and **9 idempotent responses**.
- **User Balance:** Verified exact balance increment without duplicate credits.

---

## D. P0-2 Database Secret Remediation

- `src/lib/prisma.ts` was cleaned of all plaintext password strings and hardcoded connection URLs.
- `getDatabaseUrl()` strictly checks `process.env.DATABASE_URL` and throws an error without leaking details if absent.

---

## E. P0-3 Cron Authentication Remediation

- Created `isCronAuthorized()` in `src/lib/cron-auth.ts`.
- Evaluates `process.env.CRON_SECRET` using `crypto.timingSafeEqual()`.
- Fails closed: If `CRON_SECRET` is unset, requests are rejected with HTTP 401.
- Allows authenticated Admin session fallback for manual administrative testing.

---

## F. P0-4 Supplier Webhook Remediation

- In `src/lib/commerce/suppliers.ts`, `validateSupplierAuth()` now verifies:
  1. `apiKey` presence and active status.
  2. If `supplier.apiSecret` is configured in DB, the caller **must** provide `x-supplier-secret` (or body secret), and it must match via `safeEqualSecret()`. Omitted headers are rejected immediately.

---

## G. P0-5 Google OAuth Credential Remediation

- `Ai Haat Client ID Secret.json` was deleted from the project root.
- `.gitignore` was updated with `*Client ID Secret*.json`, `client_secret*.json`, `credentials*.json`, `*.secret.json`.
- NextAuth configuration (`src/lib/auth.ts`) continues to consume `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` strictly from environment variables.

---

## H. P0-6 Open Redirect Remediation

- `src/app/api/track/click/route.ts` uses `getValidatedDestination()` with:
  - Whitelist: `aihaat.shop`, `www.aihaat.shop`, `localhost` (dev only), and configured `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL`.
  - Allowed relative internal paths (e.g. `/product/chatgpt-plus`).
  - Prohibits embedded credentials, protocol-relative URLs (`//evil.com`), `javascript:`, `data:`, and subdomain spoofing.
  - Safely falls back to `https://aihaat.shop`.

---

## I. Tests Added

- `scripts/test-p0-remediation-suite.ts`: 38 test assertions covering wallet concurrency, database secret sanitization, cron timing-safe auth, supplier webhook auth, OAuth file removal, and open redirect defense.

---

## J. Regression Test Results (100% Passing)

| Test Suite | Assertions | Result |
|---|:---:|:---:|
| `scripts/test-p0-remediation-suite.ts` | 38 / 38 | **PASS** |
| `scripts/test-database-integrity-suite.ts` | 17 / 17 | **PASS** |
| `scripts/test-supplier-cost-profit-master-suite.ts` | 25 / 25 | **PASS** |
| `scripts/test-notification-master-suite.ts` | 31 / 31 | **PASS** |
| `scripts/test-affiliate-master-suite.ts` | 33 / 33 | **PASS** |
| `scripts/test-vault-warranty-master-suite.ts` | 37 / 37 | **PASS** |
| `scripts/test-engagement-cart-suite.ts` | 33 / 33 | **PASS** |
| `scripts/test-security-auth-idor-suite.ts` | 12 / 12 | **PASS** |
| `scripts/test-checkout-pricing-tamper-suite.ts` | 12 / 12 | **PASS** |
| `scripts/test-seo-master-suite.ts` | 61 / 61 | **PASS** |
| `scripts/test-product-domain-master-suite.ts` | 27 / 27 | **PASS** |
| **Total Test Suite Assertions** | **326 / 326** | **PASS (100%)** |

---

## K. Compilation & Build Results

- **`npx tsc --noEmit`**: **0 errors (PASS)**
- **`npx prisma validate`**: **0 errors (PASS)**
- **`npm run build`**: **0 errors (PASS — 104 routes compiled)**

---

## L. Secret Rotation Status Checklist

| Secret | Remediation in Code | Production Rotation Status |
|---|:---:|---|
| **Database Password** | **FIXED** (Removed from source) | `MANUAL ACTION REQUIRED` (Rotate password on MySQL server) |
| **Google OAuth Client Secret** | **FIXED** (File removed, gitignored) | `MANUAL ACTION REQUIRED` (Rotate client secret in Google Cloud Console) |
| **CRON_SECRET** | **FIXED** (Fail-closed implemented) | `CONFIGURED` (Ensure high-entropy secret in `.env.local` / VPS environment) |
| **Supplier Webhook Secrets** | **FIXED** (Enforced in code) | `VERIFIED` |

---

## M. Verification Summary Table

| P0 Finding | Before | Fix | Verification Evidence | Remaining Action |
|---|---|---|---|---|
| **P0-1: Double Wallet Top-up** | Concurrency race between webhook & callback credited 2x | Centralized `finalizeWalletTopup()` with `@unique` on `trxId` | 10 concurrent requests burst test produced exactly 1 credit | None (Code complete) |
| **P0-2: Hardcoded DB Password** | Plaintext password fragment in `src/lib/prisma.ts` | Removed hardcoded credentials; strict env variable loading | Automated code inspection verified 0 credentials in source | Rotate MySQL password on server |
| **P0-3: Cron Auth Bypass** | Fails open when `CRON_SECRET` unset | Centralized `isCronAuthorized()` with timing-safe comparison | Unset `CRON_SECRET` verified rejected | Set `CRON_SECRET` on server |
| **P0-4: Supplier Webhook Bypass** | Check skipped if secret header omitted | Enforced secret requirement in `validateSupplierAuth` | Omitted header verified rejected | None (Code complete) |
| **P0-5: OAuth Credentials File** | Exposed file in project root | Deleted file and hardened `.gitignore` | `fs.existsSync` verified file absent | Rotate OAuth secret in Google Console |
| **P0-6: Open Redirect** | Accepted any `http:`/`https:` target URL | Whitelist validator with URL parser in click route | 10 redirect attack vectors verified blocked | None (Code complete) |

---

## N. Ready for Phase 3?

**YES.** All 6 P0 vulnerabilities are completely remediated in code and validated with 326/326 passing automated tests and clean production builds.
