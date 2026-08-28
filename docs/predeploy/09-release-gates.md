# AI Haat — Production Release Gates & Launch Checklist (Phase 9)

**System**: AI Haat (`aihaat.shop`)  
**Decision**: **PASS WITH BLOCKERS — NO-GO FOR DEPLOYMENT UNTIL MANUAL GATES COMPLETED**  

---

## 1. Technical Release Gates Status

| Technical Gate | Requirement | Status |
|:---|:---|:---|
| **TypeScript Compilation** | `npx tsc --noEmit` exits 0 with 0 errors | **PASS** |
| **Prisma Schema Validity** | `npx prisma validate` exits 0 | **PASS** |
| **Production Application Build** | `npm run build` compiles all 104 routes cleanly | **PASS** |
| **Safe Regression Suite** | 192 / 192 tests pass across 9 test suites | **PASS (100%)** |
| **Financial Idempotency** | Double settlement, top-up race, and over-refunds blocked | **PASS** |
| **IDOR & Resource Ownership** | Session user ID enforced on orders, vault, support, wallet | **PASS** |
| **MFA & Auth Security** | TOTP, Email OTP, Recovery Codes & Admin MFA enforced | **PASS** |
| **Backup & DR Architecture** | Encrypted logical backup engine + restore safety guards | **PASS** |

---

## 2. Mandatory Release Blockers Required Prior to Production Cutover

1. **Hostinger MariaDB Password Rotation**: Change remote password in Hostinger panel and update production `.env`.
2. **Google Cloud OAuth Secret Rotation**: Rotate client secret in Google Cloud Console and update production `.env`.
3. **MFA Recovery Code Pepper**: Set random 64-char hex `MFA_RECOVERY_CODE_PEPPER` in production `.env`.
4. **Dedicated Backup Encryption Key**: Set 64-char hex `BACKUP_ENCRYPTION_KEY` in production `.env` and escrow in team vault.
5. **Prisma Production Baseline Resolution**: Execute `npx prisma migrate resolve --applied 0_init` on production.
6. **Decimal Money Precision Migration**: Execute `npx prisma migrate deploy` during the maintenance release window.
7. **Business WhatsApp Number**: Configure official `NEXT_PUBLIC_WHATSAPP_NUMBER` in production `.env`.
