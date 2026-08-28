# AI Haat (`aihaat.shop`) — Production Deployment Guide & Runbook

## 1. System Architecture Overview

- **Framework**: Next.js 14 App Router (Node.js 18+ / 20+ LTS)
- **Database**: MySQL 8.0 via Prisma ORM
- **Process Manager**: PM2 (Cluster Mode)
- **Reverse Proxy**: NGINX / Cloudflare SSL (Full Strict)
- **Payment Gateway**: PipraPay (Automated bKash, Nagad, Rocket, Upay, Cards)
- **Email Service**: Hostinger SMTP (TLS Port 465 / 587)
- **Admin Alerts**: Telegram Bot Webhook API

---

## 2. Environment Variables Checklist (`.env.production`)

```env
# Node & App
NODE_ENV="production"
PORT=3000
NEXT_PUBLIC_APP_URL="https://aihaat.shop"

# MySQL Database
DATABASE_URL="mysql://username:password@localhost:3306/aihaat_db"

# NextAuth v4 Security
NEXTAUTH_URL="https://aihaat.shop"
NEXTAUTH_SECRET="[STRONG_64_CHAR_HEX_SECRET]"

# Google OAuth
GOOGLE_CLIENT_ID="[GOOGLE_OAUTH_CLIENT_ID]"
GOOGLE_CLIENT_SECRET="[GOOGLE_OAUTH_CLIENT_SECRET]"

# AES-256-GCM Digital Vault Encryption (32-byte / 64-hex chars)
MFA_ENCRYPTION_KEY="[32_BYTE_HEX_ENCRYPTION_KEY]"
EMAIL_OTP_PEPPER="[32_BYTE_HEX_PEPPER]"

# Hostinger SMTP Mailer
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=465
SMTP_SECURE="true"
SMTP_USER="orders@aihaat.shop"
SMTP_PASS="[STRONG_EMAIL_PASSWORD]"
EMAIL_FROM="AI Haat <orders@aihaat.shop>"

# PipraPay Payment Gateway
PIPRAPAY_API_KEY="[PIPRAPAY_LIVE_API_KEY]"
PIPRAPAY_MERCHANT_ID="[PIPRAPAY_MERCHANT_ID]"
PIPRAPAY_BASE_URL="https://piprapay.com/api"

# Telegram Bot Admin Alerts
TELEGRAM_BOT_TOKEN="[TELEGRAM_BOT_TOKEN]"
TELEGRAM_ADMIN_CHAT_ID="[TELEGRAM_ADMIN_CHAT_ID]"
```

---

## 3. Server Deployment Steps (Hostinger VPS / Linux Server)

### Step 1: Install Node.js 20 LTS & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

### Step 2: Clone & Install Dependencies
```bash
git clone https://github.com/aihaat/aihaat-web.git /var/www/aihaat
cd /var/www/aihaat
npm install --frozen-lockfile
```

### Step 3: Run Database Migrations
```bash
npx prisma generate
npx prisma db push
```

### Step 4: Build Next.js Production Bundle
```bash
npm run build
```

### Step 5: Start with PM2 Cluster Mode
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 4. Operational Maintenance & Diagnostic Commands

- **Live System Health Check**:
  ```bash
  curl https://aihaat.shop/api/health
  ```
- **Automated Database Backup**:
  ```bash
  npx tsx scripts/backup-db.ts
  ```
- **Run Full-Lifecycle E2E Verification**:
  ```bash
  npx tsx scripts/e2e-master-suite.ts
  ```
- **View Live PM2 Logs**:
  ```bash
  pm2 logs ai-haat
  ```
- **Zero-Downtime Reload**:
  ```bash
  pm2 reload ai-haat
  ```
