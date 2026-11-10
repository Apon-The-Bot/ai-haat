# 12 — SCALABILITY, CONCURRENCY & RELIABILITY AUDIT

This audit evaluates how the AI Haat system responds under increasing traffic, concurrent transactions, background processing loads, and network failures.

---

## 1. Concurrency Simulation Scenarios

### Scenario A: 100 Concurrent Users (Normal Production Load)
- **Storefront Browsing:** Handled easily by Next.js static asset caching and Node.js event loop.
- **Simultaneous Checkouts (5–10 per second):**
  - **Bottleneck Identified:** Due to AUDIT-004 (`getClientIp` returning `"unknown:direct"`), `/api/payment/create` limits global attempts to 6 per minute. Under 10 checkouts in 10 seconds, users 7–10 are immediately blocked with HTTP 429.
  - **Database Connection Pool:** Prisma default connection pool size (10 connections) is adequate if rate limiting is repaired.

---

### Scenario B: 1,000 Concurrent Users (Flash Sale / Viral Launch)
- **Database Connection Contention:**
  - With PM2 running in cluster mode across 4 CPU cores (`instances: "max"`), each worker maintains its own Prisma Client connection pool.
  - 4 workers $\times$ 10 connections = 40 active database connections to Hostinger MySQL.
  - If MySQL max connections on the shared Hostinger tier is capped at 50, a sudden burst in API calls risks throwing:
    `Can't reach database server at srv1497.hstgr.io:3306 (Too many connections)`
- **Event Loop Starvation:**
  - Synchronous `fs.readFileSync` and `fs.writeFileSync` in `src/lib/orders-db.ts` will create significant main-thread latency spikes under high concurrent order placement.
- **Remediation:**
  1. Remove all synchronous filesystem calls from request handlers.
  2. Configure Prisma connection pooling URL parameters: `DATABASE_URL="mysql://...?connection_limit=15&pool_timeout=10"`.
  3. Deploy a Redis instance for caching product listings and shared distributed rate limiting.

---

### Scenario C: 10,000 Concurrent Users (High Enterprise Load)
- **Current Architecture Limitation:**
  - The monolithic single-VPS architecture cannot support 10,000 concurrent un-cached users without horizontal scaling.
  - File uploads stored in `public/uploads/` cannot be accessed if multiple servers are placed behind a load balancer.
  - Memory-based rate limiting fails across multi-server setups.
- **Required Architecture for 10K+ Scale:**
  1. Stateless Next.js containers running on Kubernetes / ECS / Serverless.
  2. S3/Cloudflare R2 for all user and product asset uploads.
  3. Managed Redis (Upstash / AWS ElastiCache) for session store, distributed rate limiting, and cache invalidation.
  4. Dedicated queue workers (BullMQ) processing email marketing batches and notification retries asynchronously.

---

## 2. Single Points of Failure (SPOF)

| Component | Failure Mode | System Impact | Resilience / Mitigation Status |
| :--- | :--- | :--- | :--- |
| **MySQL Database** | Connection drop / Downtime | Complete application failure. APIs throw 500. | **Partial Fallback**: Storefront product listings fall back to hardcoded `PRODUCTS`, but orders cannot be placed. |
| **PipraPay Gateway** | Gateway API outage (504 Timeout) | Payment initialization fails. Users cannot complete gateway purchases. | **Mitigated**: 15s timeout prevents hanging requests; Express Wallet payment operates independently. |
| **Hostinger SMTP** | Authentication error / SMTP block | Emails fail to deliver. | **Mitigated**: Email failures are non-blocking and logged to `NotificationDelivery` for cron retry. |
| **Local Disk Storage** | Disk full or container rebuild | Uploaded assets and local JSON files lost. | 🔴 **High Risk**: Missing cloud object storage integration. |
