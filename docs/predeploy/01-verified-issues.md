# AI Haat — Verified Issues Registry & Prioritization Matrix

> **Generated:** Phase 1 Pre-Deployment Baseline  
> **Source of Truth:** Direct source-code verification of all reported findings  
> **Summary:** 6 P0 (Critical), 11 P1 (High), 24 P2 (Medium), 14 P3 (Low) = **55 Total Verified Issues**

---

## 1. Complete Verification Matrix

| # | Severity | Finding / Description | Affected File & Lines | Current Status | Evidence & Verification Note | Action Phase |
|---|:---:|---|---|:---:|---|:---:|
| 1 | **P0** | Double Wallet Top-up Race Condition | `src/app/api/payment/webhook/route.ts:128-171`<br>`src/app/api/payment/callback/route.ts:128-175`<br>`prisma/schema.prisma:523` | **VERIFIED** | `WalletTransaction.trxId` is only `@@index([trxId])` without `@unique`. Concurrent webhook + callback execute `findFirst` simultaneously and credit wallet 2x. | Phase 2 |
| 2 | **P0** | Hardcoded Database Password in Source Code | `src/lib/prisma.ts:10-12` | **VERIFIED** | Plaintext password fragment `Rhythm#Aihaatdb01` hardcoded in `getDatabaseUrl()`. | Phase 2 |
| 3 | **P0** | Cron Auth Bypass when `CRON_SECRET` Unset | `src/app/api/cron/email-queue/route.ts:18-27` | **VERIFIED** | `if (cronSecret && authHeader !== ...)` condition evaluates to false when `CRON_SECRET` is unset, allowing unauthenticated public triggers. | Phase 2 |
| 4 | **P0** | Supplier Webhook Secret Validation Bypass | `src/lib/commerce/suppliers.ts:26-40` | **VERIFIED** | `if (apiSecret && supplier.apiSecret !== apiSecret)` skips verification when header `x-supplier-secret` is omitted. | Phase 2 |
| 5 | **P0** | Exposed Google OAuth Client Secret File | Root: `Ai Haat Client ID Secret.json` | **VERIFIED** | Plaintext Google OAuth credentials file exists in project workspace root. | Phase 2 |
| 6 | **P0** | Open Redirect in Email Click Tracker | `src/app/api/track/click/route.ts:7-18, 64` | **VERIFIED** | 302 redirect directly follows user-supplied `url` param without domain/host whitelisting. | Phase 2 |
| 7 | **P1** | Double Refund Wallet Credit Race Condition | `src/lib/commerce/refunds.ts:143-268` | **VERIFIED** | Refund status check is outside transaction; no atomic condition guards `tx.user.update` during wallet refund processing. | Phase 3 |
| 8 | **P1** | Double Affiliate Payout Approval Race Condition | `src/lib/commerce/affiliates.ts:833-872` | **VERIFIED** | Payout status verification is outside transaction; `tx.user.update` increments wallet balance without atomic condition. | Phase 3 |
| 9 | **P1** | Negative Affiliate Balance via Concurrent Payouts | `src/lib/commerce/affiliates.ts:763-774` | **VERIFIED** | Balance check occurs before deduction; `tx.affiliateProfile.update` lacks `earningsBalanceBDT: { gte: data.amountBDT }` guard. | Phase 3 |
| 10 | **P1** | NextAuth `token.id` Uses Google `sub` Instead of Prisma `cuid` | `src/lib/auth.ts:40`<br>`src/lib/auth-guard.ts:24-36` | **VERIFIED** | `token.id = user.id` sets numeric Google sub; not overwritten with `dbUser.id`, causing broken DB lookups and orphaned relations. | Phase 3 |
| 11 | **P1** | Reflected XSS in Review Quick-Rate Page | `src/app/api/reviews/quick-rate/route.ts:6-105` | **VERIFIED** | `renderThankYouHtml` constructs raw HTML with unescaped `${authorName}` and `${productName}` strings. | Phase 3 |
| 12 | **P1** | Image Optimization Globally Disabled | `next.config.mjs:6` | **VERIFIED** | `images.unoptimized: true` disables Next.js WebP/AVIF generation, causing high bandwidth and LCP regressions. | Phase 4 |
| 13 | **P1** | Missing Rate Limiting on High-Impact Mutation Routes | `src/app/api/orders/route.ts:464`<br>`src/app/api/product-request/route.ts:143` | **VERIFIED** | Public POST routes create DB records and send Telegram alerts with 0 rate limit checks. | Phase 3 |
| 14 | **P1** | IP Spoofing Bypass in Rate Limiter | `src/lib/rate-limit.ts:27-46` | **VERIFIED** | `getClientIp()` trusts raw `X-Forwarded-For` without proxy verification, allowing rate limit bypass via header rotation. | Phase 3 |
| 15 | **P1** | Database Backup Incomplete (~40% of Models) | `scripts/backup-db.ts:37-50` | **VERIFIED** | Backs up only 12 of 31 active models; omits Products, Suppliers, Refunds, Support, Affiliates, Email Marketing. | Phase 4 |
| 16 | **P1** | No Automated Database Backup Schedule | Entire repository | **VERIFIED** | `backup-db.ts` is purely manual with no cron or offsite cloud replication. | Phase 4 |
| 17 | **P1** | 7 npm Vulnerabilities (6 High, 1 Moderate) | `package.json` | **VERIFIED** | `nodemailer <=9.0.0` (CRLF injection), `next` (SSRF/auth bypass), `postcss` (path traversal). | Phase 4 |
| 18 | **P2** | Missing `@unique` on `WalletTransaction.trxId` | `prisma/schema.prisma:523` | **VERIFIED** | Column is indexed but lacks unique constraint. | Phase 2 |
| 19 | **P2** | IEEE 754 Float for Financial Columns | `prisma/schema.prisma` (multiple models) | **VERIFIED** | Financial fields defined as `Float` instead of integer poisha or Decimal. | Phase 4 |
| 20 | **P2** | 23 Unbounded Queries Without Pagination | Admin routes (users, affiliates, etc.) | **VERIFIED** | `findMany()` without `take`/`skip` fetches entire tables into Node memory. | Phase 4 |
| 21 | **P2** | 5 N+1 Query Loops | Email import, cart, settings, affiliates | **VERIFIED** | Sequential DB queries and transactions executed inside loops. | Phase 4 |
| 22 | **P2** | 11 Missing Indexes on Foreign Keys | `prisma/schema.prisma` | **VERIFIED** | Unindexed foreign keys cause table scans on user/order/session lookups. | Phase 4 |
| 23 | **P2** | Missing `/images/og-image.png` Asset | `public/images/` | **VERIFIED** | OpenGraph and Twitter card specify `/images/og-image.png` which does not exist. | Phase 4 |
| 24 | **P2** | Missing Content-Security-Policy (CSP) | `next.config.mjs:8-62` | **VERIFIED** | Security headers configured, but CSP is absent. | Phase 3 |
| 25 | **P2** | In-Memory Rate Limiter Not Distributed | `src/lib/rate-limit.ts:7` | **VERIFIED** | `Map` store is in-memory and not shared across PM2 cluster instances. | Phase 4 |
| 26 | **P2** | Item-Level Refund `orderItemId` Dropped | `src/app/api/refunds/request/route.ts:42-54` | **VERIFIED** | Request body destructuring omits `orderItemId`; customer partial refunds impossible. | Phase 3 |
| 27 | **P2** | Unrounded Fractional BDT in Refund Calculation | `src/lib/commerce/warranty.ts:191-197` | **VERIFIED** | Prorated discount calculation produces unrounded repeating floats. | Phase 3 |
| 28 | **P2** | Unhandled `description.trim()` Crash on Undefined | `src/lib/commerce/refunds.ts:72` | **VERIFIED** | `description.trim()` throws TypeError when description is not provided. | Phase 3 |
| 29 | **P2** | Fonts Loaded via CSS `@import` | `src/app/globals.css:1` | **VERIFIED** | Blocks CSS parsing and causes FOUT/CLS; should use `next/font/google`. | Phase 4 |
| 30 | **P2** | BI Calculations Load Entire Tables in Memory | `src/lib/analytics/business-intelligence.ts` | **VERIFIED** | JavaScript in-memory aggregations instead of SQL `_sum`/`_count`. | Phase 4 |
| 31 | **P2** | No Migration History (`prisma db push` only) | `prisma/migrations/` (does not exist) | **VERIFIED** | Relies entirely on manual schema pushes without rollback capability. | Phase 4 |
| 32 | **P2** | Backup Dumps Unencrypted PII to Local Disk | `scripts/backup-db.ts:88` | **VERIFIED** | Writes plaintext JSON containing user emails, phone numbers, and transactions. | Phase 4 |
| 33 | **P2** | Non-Constant-Time Secret Comparisons | Cron routes, `suppliers.ts` | **VERIFIED** | Uses `===` / `!==` instead of `crypto.timingSafeEqual()`. | Phase 3 |
| 34 | **P2** | Single-Round Unsalted SHA-256 for Recovery Codes | `src/lib/mfa/crypto.ts:75-77` | **VERIFIED** | 8-character codes hashed with single SHA-256 without salt/pepper. | Phase 3 |
| 35 | **P2** | Telegram HTML Injection via Unescaped User Strings | `src/utils/telegram.ts:71-409` | **VERIFIED** | User strings interpolated into HTML parse mode without entity escaping. | Phase 3 |
| 36 | **P2** | Missing CSRF Protection on Custom API Mutations | `/api/wallet/purchase`, `/api/orders` | **VERIFIED** | Relies strictly on `SameSite=Lax` cookie without custom headers. | Phase 3 |
| 37 | **P2** | Missing Magic Byte Inspection in File Uploads | `src/app/api/upload/route.ts:17-43` | **VERIFIED** | Checks MIME type and extension only; doesn't verify file binary signature. | Phase 3 |
| 38 | **P2** | Admin Refunds Page Shows MOCK Data | `src/app/admin/refunds/page.tsx:13-35` | **VERIFIED** | Hardcoded sample `REF-1001` rendered instead of calling `/api/admin/refunds`. | Phase 4 |
| 39 | **P2** | Admin Replacements Page Shows MOCK Data | `src/app/admin/replacements/page.tsx:13-32` | **VERIFIED** | Hardcoded sample `REP-2001` rendered instead of calling `/api/admin/replacements`. | Phase 4 |
| 40 | **P2** | Admin Support Page Shows MOCK Tickets | `src/app/admin/support/page.tsx:24-58` | **VERIFIED** | Hardcoded `MOCK_TICKETS` rendered instead of calling `/api/admin/support/tickets`. | Phase 4 |
| 41 | **P2** | Customer Support Page Shows MOCK Tickets | `src/app/dashboard/support/page.tsx:14-34` | **VERIFIED** | Hardcoded `mockTickets` rendered instead of calling `/api/support/tickets`. | Phase 4 |
| 42 | **P3** | `RESELLER` Role Defined but Unused | `prisma/schema.prisma:12` | **VERIFIED** | Enum has RESELLER, but authorization treats RESELLER identically to USER. | Phase 4 |
| 43 | **P3** | Hardcoded Admin Email in Local Fallback DB | `src/lib/wallet-db.ts:78-79` | **VERIFIED** | Hardcoded email string in JSON fallback helper. | Phase 4 |
| 44 | **P3** | Hardcoded FX Rate `BDT_PER_USD = 125` | `src/utils/currency.ts:3` | **VERIFIED** | Static exchange rate constant for USD display toggle. | Phase 4 |
| 45 | **P3** | `<html lang="en">` Language Mismatch | `src/app/layout.tsx:85` | **VERIFIED** | Hardcoded to `"en"` while site targets Bangladesh audience with `bn_BD` OG tags. | Phase 4 |
| 46 | **P3** | Manual Recharge Creates No Database Record | `src/app/api/wallet/recharge/route.ts:18-43` | **VERIFIED** | Sends Telegram alert only; creates no `PENDING` `WalletTransaction` row. | Phase 4 |
| 47 | **P3** | `RecentPurchasePopup` Built but Unmounted | `src/components/AppShell.tsx:9-13` | **VERIFIED** | Component fully implemented with 12 geo-localized alerts but not mounted. | Phase 4 |
| 48 | **P3** | No PWA Manifest or Service Worker | `public/` | **VERIFIED** | Missing `manifest.json` and offline worker. | Phase 4 |
| 49 | **P3** | Duplicate Product Edit Routes | `admin/products/[id]/edit` & `edit/[id]` | **VERIFIED** | Both route structures exist in parallel. | Phase 4 |
| 50 | **P3** | Missing Variables in `.env.example` | `.env.example` | **VERIFIED** | 8 referenced environment variables are omitted. | Phase 4 |
| 51 | **P3** | Deprecated `images.domains` Config | `next.config.mjs:5` | **VERIFIED** | Uses `domains` instead of `remotePatterns`. | Phase 4 |
| 52 | **P3** | Placeholder WhatsApp Number `8801712345678` | 9 files in `src/` | **VERIFIED** | Static placeholder phone number rendered in multiple CTAs. | Phase 4 |
| 53 | **P3** | Welcome Email Dispatched on Every JWT Refresh | `src/lib/auth.ts:60-62` | **VERIFIED** | `sendWelcomeEmail` called inside `jwt()` callback during token refresh. | Phase 4 |
| 54 | **P3** | Unsanitized Markdown HTML in Blog Body | `src/app/blog/[slug]/page.tsx:231` | **VERIFIED** | Uses regex string replacement into `dangerouslySetInnerHTML` without DOMPurify. | Phase 4 |
| 55 | **P3** | Telegram Env Var Naming Inconsistency | Multiple files | **VERIFIED** | `TELEGRAM_ADMIN_CHAT_ID` vs `TELEGRAM_CHAT_ID`. | Phase 4 |
