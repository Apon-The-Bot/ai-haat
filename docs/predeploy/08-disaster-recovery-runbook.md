# AI Haat — Disaster Recovery Runbook

**System**: AI Haat (`aihaat.shop`)  
**Target RPO**: <= 1 hour (daily backups / hourly automated cron dumps)  
**Target RTO**: <= 4 hours (estimated restore duration: 30–60 minutes)  
**Classification**: CONFIDENTIAL / ENGINEERING OPERATIONS  

---

## 1. Disaster Recovery Overview & Core Principles

This runbook provides deterministic, step-by-step procedures for handling critical production emergencies. In any emergency:
1. **Preserve Financial & Audit Trails**: Never delete logs or truncate database tables under emergency pressure.
2. **Isolate First**: Stop write traffic (or activate maintenance mode) before performing database recovery.
3. **Never Restore Directly Over Live Data**: Always restore backups into an isolated temporary database to verify schema and row counts prior to cutover.
4. **Key Separation**: `BACKUP_ENCRYPTION_KEY` is separate from `NEXTAUTH_SECRET` and `MFA_ENCRYPTION_KEY`.

---

## 2. Emergency Scenarios & Action Plans

### Scenario A: Complete Database Loss / Corruption

**Trigger**: MariaDB instance destroyed, data corrupted, or host database disk unrecoverable.

1. **Step 1: Declare Incident & Stop Traffic**:
   - Set application maintenance mode or stop PM2 workers:
     ```bash
     pm2 stop ai-haat
     ```
2. **Step 2: Locate Latest Verified Encrypted Backup**:
   - Identify the most recent `backup_<database>_<timestamp>.sql.enc` and its corresponding `.meta.json` in `backups/database/` or offsite storage (S3/R2).
3. **Step 3: Provision Clean Target Database**:
   - Create a clean MySQL/MariaDB database in Hostinger cPanel / CLI (e.g., `u298980084_ai_haat_restore`).
4. **Step 4: Execute Safe Decryption & Import**:
   - Run the restoration tool:
     ```bash
     ALLOW_RESTORE=true BACKUP_ENCRYPTION_KEY="<key>" npx tsx scripts/restore-production-backup.ts backups/database/backup_*.sql.enc "mysql://user:pass@srv1497.hstgr.io:3306/u298980084_ai_haat_restore"
     ```
5. **Step 5: Verify Schema & Financial Integrity**:
   - Run read-only integrity suite against the restored database:
     ```bash
     DATABASE_URL="mysql://user:pass@srv1497.hstgr.io:3306/u298980084_ai_haat_restore" npx tsx scripts/test-database-integrity-suite.ts
     ```
6. **Step 6: Update `DATABASE_URL` & Cutover**:
   - Update production `.env` with the restored database URL.
   - Run `npx prisma validate` to confirm client connectivity.
   - Start PM2 cluster:
     ```bash
     pm2 start ecosystem.config.js
     ```
7. **Step 7: Smoke Test**:
   - Verify storefront (`/`), product page (`/product/[slug]`), and health check (`/api/health`).

---

### Scenario B: Accidental Data Deletion / Truncation

**Trigger**: Accidental deletion of products, orders, or users.

1. **Step 1: Freeze Mutation Paths**:
   - Do NOT immediately overwrite the current live database (which contains recent valid orders).
2. **Step 2: Restore Backup to a Staging DB**:
   - Restore the latest pre-incident backup into `ai_haat_recovery_temp`.
3. **Step 3: Extract & Reconcile Missing Records**:
   - Export only the deleted records (e.g. specific `Product` rows) via SQL `INSERT INTO ... SELECT` or custom reconciliation script.
4. **Step 4: Audit & Log**:
   - Document the incident in `AdminAuditLog` with affected entity IDs and timestamps.

---

### Scenario C: Complete Host / Server Failure

**Trigger**: VPS or Hostinger server destroyed or non-responsive.

1. **Step 1: Deploy Codebase to New Host**:
   - Clone repository:
     ```bash
     git clone <repo-url> /var/www/ai-haat
     cd /var/www/ai-haat
     git checkout main
     ```
2. **Step 2: Install Node & Dependencies**:
   - Ensure Node.js 20+ LTS is active.
   - Run `npm ci`.
3. **Step 3: Reconstitute Environment Secrets**:
   - Restore `.env` from secure password manager / offline vault.
4. **Step 4: Restore Uploaded Assets**:
   - Run asset restore script to extract `public/uploads/`:
     ```bash
     npx tsx scripts/backup-uploads.ts
     ```
5. **Step 5: Build & Launch**:
   - Run `npx prisma generate`.
   - Run `npm run build`.
   - Launch with PM2:
     ```bash
     pm2 start ecosystem.config.js
     pm2 save
     ```
6. **Step 6: Update DNS & Verify SSL**:
   - Point `aihaat.shop` A records to the new host IP.
   - Ensure SSL certificate is active.

---

### Scenario D: Bad Code Deployment Rollback

**Trigger**: Critical bug discovered immediately post-deploy.

1. **Step 1: Rollback Application Git Commit**:
   - Checkout previous known-good commit:
     ```bash
     git checkout <previous-commit-hash>
     npm ci
     npm run build
     ```
2. **Step 2: Graceful PM2 Zero-Downtime Reload**:
   - Run:
     ```bash
     pm2 reload ai-haat
     ```
3. **Step 3: Verification**:
   - Check `/api/health` and PM2 logs:
     ```bash
     pm2 logs ai-haat --lines 50
     ```
   - **Important Note**: Never rollback database DDL automatically when rolling back application code unless a schema incompatibility is explicitly diagnosed.

---

### Scenario E: Credential Compromise Response

**Trigger**: Leaked API key, compromised database password, or exposed NextAuth secret.

1. **Database Password Compromised**:
   - Immediately change password in Hostinger MySQL management panel.
   - Update `DATABASE_URL` in production `.env`.
   - Reload PM2: `pm2 reload ai-haat`.
2. **NextAuth / MFA Secret Compromised**:
   - Generate new 64-char hex secret: `openssl rand -hex 32`.
   - Update `NEXTAUTH_SECRET` in `.env`.
   - Invalidate all existing sessions by restarting PM2: `pm2 restart ai-haat`.
3. **PipraPay / Gateway API Key Compromised**:
   - Regenerate API key in PipraPay merchant portal.
   - Update `PIPRAPAY_API_KEY` in `.env`.
   - Test webhook signature validation.
4. **Telegram Bot Token Compromised**:
   - Revoke token via Telegram `@BotFather` and generate new token.
   - Update `TELEGRAM_BOT_TOKEN` in `.env` and admin settings.

---

## 3. Key Escrow Policy

> [!WARNING]
> If `BACKUP_ENCRYPTION_KEY` is lost, all encrypted backups become cryptographically irrecoverable.
> Store a secure copy of `BACKUP_ENCRYPTION_KEY` in an encrypted team vault (e.g. 1Password / Bitwarden) outside the production server.
