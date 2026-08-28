# AI Haat — Final Pre-Deployment Release Checklist (Phase 10)

**Target System**: AI Haat (`aihaat.shop`)  
**Release Readiness**: **ALL TECHNICAL CODE COMPLETE — PENDING OPERATOR CUTOVER GATES**  

---

## 1. Technical Hardening Checklist (Completed & Verified)

- [x] **P0 Security Remediations**: Double wallet top-up race condition eliminated; hardcoded fallbacks removed; admin MFA enforced.
- [x] **Financial Integrity**: Authoritative server pricing; atomic refund state machines; affiliate commission balance locks.
- [x] **Authentication & RBAC**: Canonical Prisma user mapping; session-scoped ownership checks (IDOR defense); admin step-up authentication.
- [x] **Application Security**: Strict Origin/Referer CSRF defense; safe JSON-LD & Telegram HTML escaping; magic-byte upload validation.
- [x] **Performance & SEO**: Modern AVIF/WebP image formats; zero render-blocking font CSS (`next/font/google`); 1200x630 OpenGraph assets; `<html lang="bn">`.
- [x] **Backup & Disaster Recovery**: AES-256-GCM encrypted native logical backup engine; restore safety guard; DR & Operations runbooks published.
- [x] **Static Compilation**: TypeScript (`npx tsc --noEmit`) and Prisma (`npx prisma validate`) pass with 0 errors.
- [x] **Production Next.js Build**: `npm run build` compiles all 104 static and dynamic routes with exit code 0.
- [x] **Master Test Suites**: 192 / 192 safe automated tests pass across 9 test suites (100% pass rate).

---

## 2. Operator Release Window Checklist (Pending Execution)

- [ ] **1. Git Release Candidate Commit**: Stage and commit all verified production files.
- [ ] **2. Database Credential Rotation**: Rotate MariaDB password in Hostinger panel.
- [ ] **3. Google OAuth Secret Rotation**: Rotate client secret in Google Cloud Console.
- [ ] **4. Production Cryptographic Secrets**: Populate `MFA_RECOVERY_CODE_PEPPER` and `BACKUP_ENCRYPTION_KEY` in production `.env`.
- [ ] **5. Pre-Migration Backup**: Run `npm run backup:db` to capture encrypted snapshot.
- [ ] **6. Production Baseline**: Run `npx prisma migrate resolve --applied 0_init`.
- [ ] **7. Decimal Migration**: Run `npx prisma migrate deploy`.
- [ ] **8. PM2 Reload**: Execute `pm2 reload ecosystem.config.js --env production`.
- [ ] **9. Health Verification**: Check `/api/health` response.
