# AI Haat — Original Audit Issues Reconciliation (Phase 9)

| Issue ID / Area | Description | Original Severity | Current Status | Verification Evidence | Production Applied? |
|:---|:---|:---|:---|:---|:---|
| **ISSUE-01** | Wallet Top-up Race Condition | P0 | FIXED_AND_VERIFIED | Atomic Prisma transactions + `isFinalizing` locks | YES |
| **ISSUE-02** | Hardcoded JWT & NextAuth Fallbacks | P0 | FIXED_AND_VERIFIED | Fail-closed env checks in `auth.ts` | YES |
| **ISSUE-03** | Missing MFA on Admin Actions | P0 | FIXED_AND_VERIFIED | `requireAdminMfa` in `auth-guard.ts` | YES |
| **ISSUE-04** | Exposed Secrets in Source Code | P0 | FIXED_AND_VERIFIED | Scrubbed code + sanitized helper scripts | YES (Rotations Req) |
| **ISSUE-05** | Float Data Types for Currency | P1 | PREPARED_NOT_APPLIED | Schema updated to `Decimal(12, 2)` + migration | PREPARED |
| **ISSUE-06** | Missing Unique Constraints on Indexes | P1 | PREPARED_NOT_APPLIED | Explicit FK `@@index` in schema + migration | PREPARED |
| **ISSUE-07** | IDOR on Orders & Vault | P1 | FIXED_AND_VERIFIED | Session user ID ownership enforced in all APIs | YES |
| **ISSUE-08** | Insecure Password Reset / Email OTP | P1 | FIXED_AND_VERIFIED | Hashed OTPs + Pepper + 10-min expiration | YES |
| **ISSUE-09** | CSRF Vulnerability on Mutating Routes | P1 | FIXED_AND_VERIFIED | Strict Origin & Referer verification | YES |
| **ISSUE-10** | Render-Blocking Google Fonts | P2 | FIXED_AND_VERIFIED | Migrated to `next/font/google` with Bengali subsets | YES |
| **ISSUE-11** | Unoptimized Next.js Images | P2 | FIXED_AND_VERIFIED | AVIF/WebP enabled + strict `remotePatterns` | YES |
| **ISSUE-12** | Hardcoded 125 USD Exchange Rate | P2 | FIXED_AND_VERIFIED | BDT authoritative; USD only when configured | YES |
| **ISSUE-13** | Cron Query-String Secret Leakage | P1 | FIXED_AND_VERIFIED | `Authorization: Bearer <CRON_SECRET>` enforced | YES |
| **ISSUE-14** | Weak JSON Model-by-Model Backups | P1 | FIXED_AND_VERIFIED | Native logical dumps + AES-256-GCM encryption | YES |
| **ISSUE-15** | Telegram Notification Credential Leaks | P1 | FIXED_AND_VERIFIED | Redacted sensitive tokens and credentials | YES |
