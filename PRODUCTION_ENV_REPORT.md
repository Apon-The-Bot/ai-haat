# AI Haat production environment readiness

**Local validation passed. Production service access has not been verified.**

AI Haat uses Next.js 15 App Router, React 18, Node.js, Prisma with MySQL, NextAuth with Google OAuth, PipraPay, SMTP and local filesystem uploads. The deployment logs identify Hostinger managed Node.js 22 with `npm run build` and `.next` output. Hostinger manages the listening port and app process. No VPS or PM2 configuration is required for this import.

## Import profile

The local validator checks 19 keys for the production storefront and its admin, mail, payment, scheduled job and backup configuration. All 19 are populated. The file also contains three optional settings copied from the confirmed source.

| Area | Resolved | Unresolved |
| --- | --- | --- |
| Application | `NODE_ENV`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL` | |
| Database | `DATABASE_URL` | |
| Authentication | `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS` | |
| MFA, cron and backup | `MFA_ENCRYPTION_KEY`, `EMAIL_OTP_PEPPER`, `MFA_RECOVERY_CODE_PEPPER`, `CRON_SECRET`, `BACKUP_ENCRYPTION_KEY` | |
| Mail | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | |
| Payments | `PIPRAPAY_BASE_URL`, `PIPRAPAY_API_KEY` | |

The project-root `.env` was confirmed by the user as the credential source. Its localhost NextAuth URL was replaced with the canonical production URL. Copied settings round-trip through the dotenv parser without changing their values. Preserve existing production keys and peppers when historical encrypted data or recovery codes depend on them. Generate new values only for confirmed first-time initialization.

## Conditional settings

- Mail can also use `SMTP_PORT` (defaults to 465), `EMAIL_FROM` and `RESEND_API_KEY` when the provider is enabled. The previous runtime log recorded SMTP authentication failure. Confirm the working mailbox password.
- `PIPRAPAY_MERCHANT_ID` is used by the health check. `PIPRAPAY_DATABASE_URL` is for admin gateway management. Confirm the live payment endpoint, credentials and webhook configuration with the provider.
- Telegram uses `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` and `TELEGRAM_ADMIN_CHAT_ID`. Meta server events use `META_PIXEL_ID` and `META_CAPI_ACCESS_TOKEN`. `META_TEST_EVENT_CODE` is for test events.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_BDT_PER_USD`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_META_PIXEL_ID` are optional public storefront configuration.
- `TRUST_PROXY` and `TRUST_CF_CONNECTING_IP` depend on the actual trusted proxy path. `APP_URL` is a reminder fallback when `NEXTAUTH_URL` is unavailable. No separate AI model credential or external upload bucket is required by the inspected runtime.
- `NEXT_PHASE` is framework-owned. `PM2_INSTANCES` is for the separate PM2 setup. `ALLOW_RESTORE`, `ALLOW_TEST_ON_PROD` and `DIGITAL_INVENTORY_ENCRYPTION_KEY` are script settings, outside the managed app import.

## Verification and deployment

Run `node scripts/validate-production-env.mjs` using Node.js 22. The completed file passed local checks. The three settings previously missing from the source and the supplied Hostinger runtime log were initialized with independent random values at the user's request. If hPanel has since acquired existing recovery or backup secrets, preserve those values instead. Local format checks do not authenticate providers or verify whether a payment account is live.

Hostinger imports dotenv key/value lines. Public `NEXT_PUBLIC_*` values are embedded at build time and require redeployment when changed. Database, OAuth, mail, payments and encryption values are server-side. The build also needs database access for routes that read it while generating pages.

Verify schema readiness, Google OAuth callback `https://aihaat.shop/api/auth/callback/google`, live payment webhooks, mailbox access, upload storage and cron scheduling separately. Preserve the current Hostinger configuration before importing. No production credentials were tested and no live data was modified.
