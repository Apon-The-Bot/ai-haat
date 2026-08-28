# AI Haat — Release Candidate File Manifest (Phase 9)

**Project**: AI Haat (`aihaat.shop`)  
**Phase**: 9 — Release Candidate Validation  
**Release Candidate Commit**: `89e798956dbe80369dff396827ede46b4adc9552` (`89e7989`)  
**Status**: VERIFIED & SECURED  

---

## 1. Tracked & Production-Critical File Summary

| File Path | Classification | Category |
|:---|:---|:---|
| `src/lib/auth.ts` | TRACKED_MODIFIED | Authentication & NextAuth Identity |
| `src/lib/auth-guard.ts` | UNTRACKED_READY | Session, Admin & MFA RBAC Guards |
| `src/lib/cron-auth.ts` | UNTRACKED_READY | Timing-Safe Bearer CRON_SECRET |
| `src/lib/security/*` | UNTRACKED_READY | Device tracking, Rate limiting, Audit logs |
| `src/lib/mfa/*` | UNTRACKED_READY | TOTP, Recovery codes, Email OTP, Sessions |
| `src/lib/commerce/wallet-topup.ts` | UNTRACKED_READY | Durable Wallet Recharge Finalization |
| `src/lib/commerce/inventory.ts` | UNTRACKED_READY | Stock reservation & auto-delivery |
| `src/lib/commerce/refunds.ts` | UNTRACKED_READY | Atomic refund state transitions |
| `src/lib/commerce/replacements.ts` | UNTRACKED_READY | Replacement stock reservation & vault link |
| `src/lib/commerce/support.ts` | UNTRACKED_READY | IDOR-safe customer & admin ticketing |
| `src/lib/notifications/*` | UNTRACKED_READY | Outbox pattern & retry workers |
| `src/app/api/cron/*` | UNTRACKED_READY | 4 Bearer-authenticated cron endpoints |
| `ecosystem.config.js` | UNTRACKED_READY | PM2 cluster & zero-downtime reload |
| `scripts/backup-production-db.ts` | UNTRACKED_READY | Database logical backup & AES-256-GCM encryption |
| `scripts/restore-production-backup.ts` | UNTRACKED_READY | Safe decryption & production guard |
| `scripts/backup-uploads.ts` | UNTRACKED_READY | Public uploads asset backup engine |
| `scripts/test-*.ts` | UNTRACKED_READY | 9 Deterministic verification suites (192 tests) |
| `prisma/schema.prisma` | TRACKED_MODIFIED | 50 models, 33 enums, Decimal(12,2) targets |
| `prisma/migrations/*` | UNTRACKED_READY | 0_init baseline & decimal precision migrations |
