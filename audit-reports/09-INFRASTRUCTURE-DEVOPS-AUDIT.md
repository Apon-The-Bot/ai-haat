# 09 — INFRASTRUCTURE, DEVOPS & DEPLOYMENT AUDIT

This audit reviews deployment topology, PM2 cluster configurations, environment isolation, backup routines, and operational runbooks against production stability standards.

---

## 1. Hosting & Infrastructure Architecture

```mermaid
flowchart LR
    subgraph HostingerVPS["Hostinger Cloud Linux VPS"]
        direction TB
        NGINX["NGINX Reverse Proxy (Port 80/443 SSL)"]
        
        subgraph PM2Cluster["PM2 Cluster Mode (Port 3000)"]
            W1["Worker Process 1"]
            W2["Worker Process 2"]
            WN["Worker Process N (max)"]
        end

        DISK[("Host Local Disk (/var/www/aihaat/public/uploads)")]
    end

    subgraph ManagedDB["Hostinger Managed MySQL"]
        MYSQL[("MySQL 8.0 Cloud Instance (srv1497.hstgr.io:3306)")]
    end

    subgraph Cloud["External Services"]
        SMTP["Hostinger SMTP (Port 465)"]
        PIPRA["PipraPay API Gateway"]
        CF["Cloudflare DNS & Proxy"]
    end

    CF --> NGINX
    NGINX --> PM2Cluster
    PM2Cluster <--> MYSQL
    PM2Cluster --> DISK
    PM2Cluster --> SMTP
    PM2Cluster --> PIPRA
```

---

## 2. Infrastructure & Configuration Findings

### 2.1 Absence of Development vs. Production Database Isolation
- **Severity:** High (Operational Risk)
- **Observation:**
  Inspecting `.env` in the active workspace reveals:
  ```env
  DATABASE_URL=mysql://u298980084_ai_haat_db:***@srv1497.hstgr.io:3306/u298980084_ai_haat
  ```
  The local development workspace points directly to the **live production Hostinger database**!
- **Impact:**
  - Running automated test suites locally (e.g. `npx tsx scripts/test-comprehensive-audit.ts` or `scripts/e2e-master-suite.ts`) executes `createGiftCard()`, modifies user wallet balances, and generates mock orders directly inside the live customer database.
  - A developer running `prisma db push` or testing migration scripts locally could corrupt live customer data.
- **Remediation:** Strictly enforce environment isolation:
  - `.env.local` for local development pointing to a local MySQL container (`mysql://root:password@localhost:3306/aihaat_dev`).
  - Production database connection strings must only be provisioned on the production server via encrypted environment managers.

---

### 2.2 PM2 Cluster Configuration & Ephemeral Uploads
In `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: "ai-haat",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: process.env.PM2_INSTANCES || "max",
      exec_mode: "cluster",
      max_memory_restart: "1G",
      // ...
    },
  ],
};
```
- **Analysis:**
  1. `exec_mode: "cluster"` spawns independent Node.js processes across all available CPU cores.
  2. Each process maintains its own independent in-memory rate limiting map (`store` in `rate-limit.ts`).
  3. When files are uploaded via `POST /api/upload`, they are saved to `public/uploads/` on the local filesystem.
  4. In `DEPLOYMENT.md`, Step 2 instructs operators to run `git clone ... /var/www/aihaat`. On git pull or clean deployments, if `public/uploads/` is not a persistent symlink pointing to shared external storage, previous uploads will be inaccessible or wiped.
- **Remediation:**
  1. Offload uploaded assets to an S3-compatible cloud storage bucket (e.g. Cloudflare R2, AWS S3, or Backblaze B2).
  2. Or create a shared persistent directory `/var/www/shared/uploads` symlinked to `public/uploads`.

---

### 2.3 Automated Backup & Disaster Recovery Scripts
The repository contains robust operational backup scripts:
- `scripts/backup-production-db.ts`: Executes MySQL database dumps, AES-256-GCM encryption with `BACKUP_ENCRYPTION_KEY`, and optional offsite S3 upload.
- `scripts/restore-production-backup.ts`: Decrypts and restores database archives.
- `scripts/backup-uploads.ts`: Packages and encrypts the `public/uploads/` directory.
- **Status:** Backup automation is well-designed. However, backup execution currently relies on manual triggers or crontab setup outside version control.
