# AI Haat — Production Deployment & Runtime Baseline

> **Generated:** Phase 1 Pre-Deployment Baseline  
> **Target Environment:** Hostinger Linux VPS / Node.js 20/22 / MySQL 8.0 / PM2 Cluster / Cloudflare SSL  
> **Source-of-Truth:** `DEPLOYMENT.md`, `ecosystem.config.js`, `next.config.mjs`, `package.json`

---

## 1. Production Runtime & Topology

| Parameter | Configuration | Verification Status |
|---|---|:---:|
| **Hosting Target** | Hostinger VPS / Linux x64 | Verified in `DEPLOYMENT.md` |
| **Process Manager** | PM2 Cluster Mode (`instances: "max"`) | Verified in `ecosystem.config.js` |
| **Node.js Runtime** | Node 20 LTS (Development: Node v22.20.0) | Verified in `package.json` / `node -v` |
| **Database Engine** | MySQL 8.0 on Hostinger Server | Verified via Prisma Client 5.19.1 |
| **Reverse Proxy & SSL** | Nginx with Cloudflare SSL Termination (HSTS enabled) | Verified in `next.config.mjs` |
| **Static Asset Caching** | `/_next/static/*` (1 Year Immutable), `/images/*` (24 Hours) | Verified in `next.config.mjs` |
| **Build Command** | `npm run build` | Verified (Exit Code 0, 104 routes) |
| **Start Command** | `npm run start` or `pm2 start ecosystem.config.js` | Verified |
| **Health Check URL** | `https://aihaat.shop/api/health` | Verified in `src/app/api/health/route.ts` |

---

## 2. Health Check Diagnostic Specification (`/api/health`)

The health check route evaluates 5 subsystems:
1. **Database Latency**: Executes `SELECT 1` via Prisma and measures millisecond response time.
2. **Cryptographic Security Keys**: Checks presence of `MFA_ENCRYPTION_KEY` and `NEXTAUTH_SECRET`.
3. **SMTP Transporter**: Checks presence of `SMTP_HOST` and `SMTP_USER`.
4. **Payment Gateway**: Checks presence of `PIPRAPAY_API_KEY` and `PIPRAPAY_MERCHANT_ID`.
5. **Telegram Bot**: Checks presence of `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID`.
6. **Diagnostics**: Returns `uptimeSeconds`, `rssMB`, `heapUsedMB`, and HTTP `200` (HEALTHY) or `503` (UNHEALTHY).

---

## 3. Pre-Deployment Rollback Strategy

If any deployment or migration step fails in production:

### 1. Application Rollback
- Revert the PM2 process to the prior build:
  ```bash
  pm2 reload ai-haat
  ```
- Or restart with fallback configuration:
  ```bash
  pm2 restart ecosystem.config.js
  ```

### 2. Database State Preservation
- Because Phase 1 does not execute any schema migrations (`prisma db push` or `prisma migrate`), the MySQL database remains at its known good state.
- Pre-migration snapshots must be created via database native dumps (`mysqldump`) before any future schema changes are applied.
