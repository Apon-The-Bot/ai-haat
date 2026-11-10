# 11 — PRODUCTION DEPLOYMENT & ROLLBACK RUNBOOK

This runbook outlines the exact operational procedures for deploying the hardened AI Haat application to the Hostinger Linux VPS using PM2, including emergency rollback procedures.

---

## 1. Pre-Deployment Prerequisites

1. **Hostinger VPS SSH Access:** Confirm SSH access to the deployment server (`srv1497.hstgr.io` or configured VPS IP).
2. **Node.js Runtime:** Ensure Node.js v20.x or v22.x LTS and npm are installed.
3. **PM2 Process Manager:** Ensure PM2 is installed globally (`npm install -g pm2`).
4. **Environment Variables Verification:**
   Ensure `/var/www/aihaat/.env` contains:
   ```env
   NODE_ENV="production"
   PORT=3000
   DATABASE_URL="mysql://u298980084_ai_haat:PASSWORD@srv1497.hstgr.io:3306/u298980084_ai_haat"
   NEXTAUTH_URL="https://aihaat.shop"
   NEXTAUTH_SECRET="SECURE_32_BYTE_HEX_OR_BASE64"
   MFA_ENCRYPTION_KEY="64_CHAR_HEX_KEY"
   BACKUP_ENCRYPTION_KEY="64_CHAR_HEX_KEY"
   ADMIN_EMAILS="mdamanullahsheikhapon@gmail.com,seratul.alim@gmail.com"
   TRUST_PROXY="true"
   TRUST_CF_CONNECTING_IP="true"
   ```

---

## 2. Standard Zero-Downtime Deployment Procedure

Execute the following commands sequentially on the production server:

```bash
# Step 1: Navigate to application root
cd /var/www/aihaat

# Step 2: Create a backup of the current operational release
tar -czf /var/backups/aihaat-predeploy-$(date +%F_%H%M%S).tar.gz .next/ data/

# Step 3: Pull verified code from repository
git fetch origin
git checkout main
git pull origin main

# Step 4: Install exact dependencies
npm ci --prefer-offline --no-audit

# Step 5: Generate Prisma Client (Safe: does NOT alter MySQL database schema)
npx prisma generate

# Step 6: Execute verification test suite
npx tsx scripts/verify-all-fixes.ts

# Step 7: Build optimized production bundle
npm run build

# Step 8: Zero-Downtime PM2 Cluster Reload
pm2 reload ecosystem.config.js --update-env

# Step 9: Verify running processes and health
pm2 status
curl -I https://aihaat.shop/
```

---

## 3. Post-Deployment Smoke Testing Checklist

1. [ ] **Storefront Check:** Verify `https://aihaat.shop/` loads with HTTP 200 within 1 second.
2. [ ] **Authentication Check:** Test Google Login redirect and `/login` landing page.
3. [ ] **Product Catalog:** Verify `/shop` and `/product/[slug]` load with correct BDT prices.
4. [ ] **Cart & Quote Calculation:** Add item to cart and verify checkout pricing quote.
5. [ ] **Admin MFA Barrier:** Access `/admin` and confirm 2FA prompt appears.
6. [ ] **Order Tracking:** Verify `/order-tracking` lookups work without leaking tokens.
7. [ ] **Logs Inspection:** Inspect PM2 logs for runtime warnings:
   ```bash
   pm2 logs ai-haat --lines 100
   ```

---

## 4. Emergency Rollback Plan

If a critical issue occurs post-deployment, initiate the emergency rollback procedure immediately:

### 4.1 Quick Process Rollback (Under 60 Seconds)
```bash
# 1. Revert Git working tree to the prior commit
git log -n 5 --oneline
git checkout <PREVIOUS_STABLE_COMMIT_HASH>

# 2. Restore cached build from backup archive if needed
tar -xzf /var/backups/aihaat-predeploy-<TIMESTAMP>.tar.gz -C /var/www/aihaat

# 3. Reload PM2 processes
pm2 reload ecosystem.config.js

# 4. Confirm restoration
curl -I https://aihaat.shop/
```

### 4.2 Database Rollback Policy
Because all database changes in this update were non-destructive additions (adding non-unique indexes and retention utilities), **NO database rollback or schema reversion is required or recommended**. The database remains backward and forward-compatible.
