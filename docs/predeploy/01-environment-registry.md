# AI Haat — Environment Variable Registry Baseline

> **Generated:** Phase 1 Pre-Deployment Baseline  
> **Source-of-Truth:** Direct codebase inspection of `process.env` references  
> **Security Notice:** No secret values or credentials are disclosed in this registry.

---

## 1. Environment Variable Inventory & Analysis

| Variable | Scope | Required | Referenced Files | Fail Behavior | In `.env.example`? | Production Critical |
|---|---|:---:|---|---|:---:|:---:|
| `DATABASE_URL` | Server | **YES** | `src/lib/prisma.ts`, `prisma/schema.prisma` | **Fail-Closed** (throws Error on init) | ✅ Yes | **CRITICAL** |
| `NEXTAUTH_URL` | Server/Client | **YES** | `src/lib/auth.ts`, `src/lib/seo.ts`, `src/app/api/payment/create/route.ts` | **Fail-Open** (defaults to `https://aihaat.shop`) | ✅ Yes | **CRITICAL** |
| `NEXTAUTH_SECRET` | Server | **YES** | `src/lib/auth.ts`, `src/app/api/health/route.ts` | **Fail-Closed** (throws Error at module load) | ✅ Yes | **CRITICAL** |
| `GOOGLE_CLIENT_ID` | Server | **YES** | `src/lib/auth.ts` | **Fail-Closed** (throws Error at module load) | ✅ Yes | **CRITICAL** |
| `GOOGLE_CLIENT_SECRET` | Server | **YES** | `src/lib/auth.ts` | **Fail-Closed** (throws Error at module load) | ✅ Yes | **CRITICAL** |
| `ADMIN_EMAILS` | Server | **YES** | `src/lib/auth.ts`, `src/lib/auth-guard.ts` | **Fail-Closed** (no users get ADMIN role) | ✅ Yes | **CRITICAL** |
| `SMTP_HOST` | Server | **YES** | `src/lib/email-service.ts`, `src/app/api/health/route.ts` | **Fail-Open** (defaults to `smtp.hostinger.com`) | ✅ Yes | HIGH |
| `SMTP_PORT` | Server | Optional | `src/lib/email-service.ts` | **Fail-Open** (defaults to 465) | ✅ Yes | MEDIUM |
| `SMTP_USER` | Server | **YES** | `src/lib/email-service.ts`, `src/app/api/health/route.ts` | **Fail-Open** (simulation mode active if missing) | ✅ Yes | HIGH |
| `SMTP_PASS` | Server | **YES** | `src/lib/email-service.ts` | **Fail-Open** (simulation mode active if missing) | ✅ Yes | HIGH |
| `EMAIL_FROM` | Server | Optional | `src/lib/email-service.ts` | **Fail-Open** (defaults to `"AI Haat" <SMTP_USER>`) | ❌ **Missing** | MEDIUM |
| `PIPRAPAY_BASE_URL` | Server | **YES** | `src/app/api/payment/create/route.ts`, `src/app/api/payment/callback/route.ts`, `src/app/api/payment/webhook/route.ts` | **Fail-Open** (defaults to sandbox/demo endpoint) | ✅ Yes | **CRITICAL** |
| `PIPRAPAY_API_KEY` | Server | **YES** | `src/app/api/payment/create/route.ts`, `src/app/api/health/route.ts` | **Fail-Closed** (payment initiation fails) | ✅ Yes | **CRITICAL** |
| `PIPRAPAY_MERCHANT_ID` | Server | Optional | `src/app/api/health/route.ts` | Checked only in health route | ❌ **Missing** | LOW |
| `PIPRAPAY_DATABASE_URL` | Server | Optional | `src/app/api/admin/gateways/route.ts` | **Fail-Closed** (gateway parameters fallback) | ❌ **Missing** | LOW |
| `MFA_ENCRYPTION_KEY` | Server | **YES** | `src/lib/mfa/crypto.ts`, `src/app/api/health/route.ts` | **Fail-Open in Dev** (falls back to dev key with console warning) | ✅ Yes | **CRITICAL** |
| `EMAIL_OTP_PEPPER` | Server | **YES** | `src/lib/mfa/crypto.ts` | **Fail-Open in Dev** (falls back to dev pepper with console warning) | ✅ Yes | HIGH |
| `CRON_SECRET` | Server | **YES** | `src/app/api/cron/*`, `src/app/api/analytics/retry/route.ts` | **VULNERABLE** in `email-queue` (bypasses if unset), Secure in other cron routes | ❌ **Missing** | **CRITICAL** |
| `TELEGRAM_BOT_TOKEN` | Server | Optional | `src/lib/telegram-db.ts`, `src/utils/telegram.ts`, `src/lib/notifications/channels/telegram.ts`, `src/app/api/health/route.ts` | **Fail-Open** (simulation mode, alerts skipped) | ❌ **Missing** | HIGH |
| `TELEGRAM_ADMIN_CHAT_ID` | Server | Optional | `src/app/api/health/route.ts`, `DEPLOYMENT.md` | Checked in health route | ❌ **Missing** | MEDIUM |
| `TELEGRAM_CHAT_ID` | Server | Optional | `src/lib/telegram-db.ts`, `src/utils/telegram.ts`, `src/lib/notifications/channels/telegram.ts` | **Fail-Open** (alerts skipped if unset) | ❌ **Missing** | HIGH |
| `NEXT_PUBLIC_APP_URL` | Public | Optional | `src/lib/seo.ts`, `src/lib/commerce/abandoned-cart.ts` | **Fail-Open** (defaults to `https://aihaat.shop`) | ❌ **Missing** | MEDIUM |
| `NEXT_PUBLIC_SITE_URL` | Public | Optional | `src/lib/seo.ts` | **Fail-Open** (defaults to `NEXTAUTH_URL` or `https://aihaat.shop`) | ❌ **Missing** | MEDIUM |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Public | Optional | `src/lib/whatsapp.ts`, `src/components/cro/FloatingWhatsAppWidget.tsx` | **Fail-Open** (defaults to placeholder `8801712345678`) | ❌ **Missing** | HIGH |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Public | Optional | `src/components/analytics/AnalyticsProvider.tsx` | **Fail-Open** (GA4 script injection skipped) | ✅ Yes | MEDIUM |
| `NEXT_PUBLIC_META_PIXEL_ID` | Public | Optional | `src/components/analytics/AnalyticsProvider.tsx` | **Fail-Open** (Pixel script injection skipped) | ✅ Yes | MEDIUM |
| `META_PIXEL_ID` | Server | Optional | `src/lib/analytics/meta-capi.ts` | **Fail-Open** (Server CAPI dispatch skipped) | ✅ Yes | MEDIUM |
| `META_CAPI_ACCESS_TOKEN` | Server | Optional | `src/lib/analytics/meta-capi.ts` | **Fail-Open** (Server CAPI dispatch skipped) | ✅ Yes | MEDIUM |
| `META_TEST_EVENT_CODE` | Server | Optional | `src/lib/analytics/meta-capi.ts` | **Fail-Open** (Test code omitted in live CAPI events) | ❌ **Missing** | LOW |
| `NODE_ENV` | System | System | Next.js, Prisma, PM2 | Standard Node.js runtime environment | ✅ Yes | **CRITICAL** |

---

## 2. Key Observations

1. **8 Variables Missing from `.env.example`**:
   `CRON_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_ADMIN_CHAT_ID`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `EMAIL_FROM`.
2. **Fail-Open Vulnerability in `email-queue`**:
   Unauthenticated execution if `CRON_SECRET` is unset.
3. **Secret Storage Integrity**:
   No credentials, passwords, or tokens are logged or included in this baseline.
