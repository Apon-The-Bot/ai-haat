# AI Haat — Post-Deployment Verification Protocol (Phase 10)

**Target System**: AI Haat (`aihaat.shop`)  
**Scope**: Production Verification Procedures Following Operator Cutover  

---

## 1. Immediate Health & Connectivity Verification (T+0 Minutes)

1. **Health Endpoint Check**:
   ```bash
   curl -s -i https://aihaat.shop/api/health
   ```
   - Verify HTTP status is `200 OK`.
   - Verify `checks.database.status === "UP"`.
   - Verify error messages are sanitized and do not leak internal database hosts.

2. **PM2 Cluster Status**:
   ```bash
   pm2 status
   ```
   - Verify all workers are `online` in cluster mode.
   - Verify restart count is `0`.
   - Verify memory usage is within expected thresholds (< 300MB per worker).

---

## 2. Storefront & Customer Flow Verification (T+5 Minutes)

1. **Public Storefront**: Navigate to `https://aihaat.shop` and verify hero banner, categories, product cards, and Bangla fonts.
2. **Product Catalog**: Navigate to `/shop` and `/product/[slug]`; verify image loading (AVIF/WebP) and BDT price formatting.
3. **Cart & Checkout**: Add product to cart; verify coupon validation and order summary calculations.
4. **Authentication**: Test Google OAuth login and verify canonical session profile.
5. **Digital Vault & Dashboard**: Navigate to `/dashboard/keys` and verify encrypted credential rendering.

---

## 3. Financial & Database Verification (T+15 Minutes)

1. **Schema Decimal Verification**:
   ```sql
   SELECT COLUMN_NAME, DATA_TYPE, NUMERIC_PRECISION, NUMERIC_SCALE 
   FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_NAME = 'Order' AND COLUMN_NAME IN ('totalBDT', 'subtotalBDT', 'discountBDT');
   ```
   - Verify `DATA_TYPE = 'decimal'`, `NUMERIC_PRECISION = 12`, `NUMERIC_SCALE = 2`.
2. **Data Consistency**:
   - Run read-only integrity checks via `npx tsx scripts/test-database-integrity-suite.ts`.

---

## 4. 30–60 Minute Observation Window (T+60 Minutes)

1. **Monitor Error Logs**:
   ```bash
   pm2 logs ai-haat --lines 100
   ```
   - Verify zero unhandled 5xx exceptions or database connection errors.
2. **Payment IPN Monitoring**:
   - Monitor `PaymentAuditLog` for incoming payment webhooks and verify exactly-once order settlement.
3. **Cron & Queue Monitoring**:
   - Verify scheduled notification retries and email queue batches run cleanly.
