# AI Haat — Production Operations Runbook

**Target System**: AI Haat (`aihaat.shop`)  
**Scope**: Routine Maintenance, Health Verification, PM2 Management, Cron Operations, Logging & Monitoring  
**Audience**: DevOps & System Administrators  

---

## 1. Application Process Management (PM2)

AI Haat is deployed as a high-availability clustered Next.js application managed by PM2.

### Essential PM2 Commands:
```bash
# 1. Start application cluster
pm2 start ecosystem.config.js

# 2. Check cluster status & worker memory usage
pm2 status

# 3. Graceful zero-downtime reload (preserves active connections)
pm2 reload ai-haat

# 4. View live aggregated application logs
pm2 logs ai-haat --lines 100

# 5. Save current process list across server reboots
pm2 save
```

---

## 2. Health Monitoring & Triage

### Health Check Endpoint
- **URL**: `https://aihaat.shop/api/health`
- **Method**: `GET`
- **Expected Response (200 OK)**:
  ```json
  {
    "status": "HEALTHY",
    "environment": "production",
    "domain": "aihaat.shop",
    "timestamp": "2026-08-28T10:00:00.000Z",
    "responseTimeMs": 14,
    "uptimeSeconds": 86400,
    "memoryUsage": { "rssMB": 128, "heapUsedMB": 82 },
    "checks": {
      "database": { "status": "UP", "latencyMs": 8 },
      "security_keys": { "status": "UP", "message": "Cryptographic keys configured" },
      "smtp_mailer": { "status": "UP", "message": "Hostinger SMTP configured" },
      "payment_gateway": { "status": "UP", "message": "PipraPay credentials loaded" },
      "telegram_bot": { "status": "UP", "message": "Telegram notifications active" }
    }
  }
  ```

### Health Failure Triage:
1. **Database Status DOWN (503)**: Check MariaDB service status, credentials in `.env`, and Hostinger firewall.
2. **Security Keys WARN**: Ensure `MFA_ENCRYPTION_KEY` and `NEXTAUTH_SECRET` are populated in `.env`.
3. **SMTP Mailer WARN**: Check Hostinger business email credentials and port 465 SSL connectivity.

---

## 3. Scheduled Cron Maintenance

Machine cron jobs are triggered periodically via curl / Hostinger cron scheduler with `Authorization: Bearer <CRON_SECRET>`.

| Cron Job Route | Recommended Cadence | Description | Idempotent | Overlap Safe |
|:---|:---|:---|:---|:---|
| `/api/cron/notifications` | Every 2 mins | Retries transient in-app, email & Telegram failures | YES | YES (Lease-based) |
| `/api/cron/email-queue` | Every 5 mins | Dispatches scheduled email marketing campaign batches | YES | YES (Batch-locked) |
| `/api/cron/engagement` | Every 30 mins | Processes abandoned carts & post-delivery reviews | YES | YES (State-checked) |
| `/api/cron/inventory-expiry` | Daily @ 03:00 (BST) | Checks warranty expiry & alerts expiring accounts | YES | YES |
| `backup:db` (npm script) | Daily @ 04:00 (BST) | Creates encrypted logical database dump | YES | YES (`.backup.lock`) |

### Example Cron Crontab Entry (Hostinger Linux / OS Cron):
```bash
# Run notification processor every 2 minutes
*/2 * * * * curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" https://aihaat.shop/api/cron/notifications > /dev/null 2>&1

# Run email campaign queue every 5 minutes
*/5 * * * * curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" https://aihaat.shop/api/cron/email-queue > /dev/null 2>&1

# Run automated encrypted database backup daily at 04:00 BST (22:00 UTC)
0 22 * * * cd /var/www/ai-haat && npm run backup:db >> /var/log/aihaat-backup.log 2>&1
```

---

## 4. Manual Database Backup & Verification

### Executing a Backup Manually:
```bash
# Run backup script
npm run backup:db

# Verify backup artifacts
ls -lh backups/database/
```

### Inspecting Backup Freshness:
Backups should be produced daily. Check the timestamp of the latest `.meta.json` in `backups/database/`. If older than 26 hours, investigate server cron status.

---

## 5. Log Management & Rotation

- **PM2 Log Paths**:
  - `logs/pm2-error.log`
  - `logs/pm2-out.log`
- **Rotation**: Install PM2 logrotate module:
  ```bash
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 10M
  pm2 set pm2-logrotate:retain 14
  ```

---

## 6. Disk Space Alerting Thresholds

- **Warning Threshold**: < 20% free disk space.
- **Critical Threshold**: < 10% free disk space.
- **Action**: Check `backups/`, `logs/`, and `.next/cache/`. Clean up old logs or increase host disk allocation.
