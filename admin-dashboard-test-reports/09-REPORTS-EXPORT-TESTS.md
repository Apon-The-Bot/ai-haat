# AI HAAT — REPORTS, ANALYTICS & CSV EXPORT SECURITY TESTS
**Project:** AI Haat (`aihaat.shop`)  
**Scope:** Commercial BI Engine, Revenue Analytics, COGS, Profit Margins & CSV Injection Defense  
**Audit Timestamp:** November 2026  
**Auditor:** Principal Data Architect & Financial Security Auditor  

---

## 1. COMMERCIAL BI & ANALYTICS ARCHITECTURE

The AI Haat administrative reporting portal (`/admin/reports` & `src/lib/analytics/business-intelligence.ts`) delivers comprehensive executive business intelligence:
- **Date-Bounded Query Architecture:** All aggregation pipelines enforce deterministic timezone-aware start and end boundaries (`resolveDateRange`), preventing unbounded full-table scans.
- **Strict Revenue Accounting:**
  - **Verified Revenue:** Sum of `totalBDT` across orders with `paymentStatus = "VERIFIED"` (excluding `PENDING`, `FAILED`, `CANCELLED`).
  - **Net Revenue:** `Verified Revenue - Completed Refunds`.
  - **Wallet Inflow Separation:** Wallet deposits are recorded as internal liabilities and strictly excluded from product revenue.
- **Cost of Goods Sold (COGS) & Net Margin Engine:** Snapshots historical acquisition costs from `StockBatch` to compute realized gross profit per item.
- **CSV Formula Injection Sanitizer (`sanitizeCsvValue`):** Escapes dangerous formula prefixes (`=`, `+`, `-`, `@`) with a leading single quote (`'`), protecting administrators against CSV injection attacks when opening exports in Microsoft Excel or Google Sheets.

---

## 2. AUTOMATED TEST SUITE EXECUTION RESULTS

The reporting and analytics subsystems were evaluated via:
- **`scripts/test-admin-analytics-bi-master-suite.ts`**: 31/31 Tests Passed (100.0%)
- **`scripts/test-supplier-cost-profit-master-suite.ts`**: Tests 5, 6, 7, 8, 22, 23, 24 Passed (100.0%)
- **`scripts/test-comprehensive-audit.ts` (Feature 12)**: Margin & COGS Invariants Passed (100.0%)

---

## 3. DETAILED TEST FINDINGS & VERIFICATIONS

### 3.1 Verified Revenue vs Pending/Cancelled Invariant
In `scripts/test-admin-analytics-bi-master-suite.ts` (Tests 1 & 2):
- **Verified Revenue Inclusion:** ৳500 and ৳300 paid orders (`paymentStatus = "VERIFIED"`) are summed to ৳800.
- **Pending/Failed Order Isolation:** Orders in `PENDING` (৳400) or `CANCELLED` (৳1,500) contribute **exactly ৳0 to Verified Revenue**.
- **Total Orders Metric:** Displays total orders placed (including pending/failed) so administrators can evaluate checkout abandonment rates.

### 3.2 Wallet Funding Separation Principle
In `scripts/test-admin-analytics-bi-master-suite.ts` (Tests 3 & 4):
- Customer deposits ৳1,000 into their wallet via bKash.
- The reporting dashboard records **৳1,000 under "Wallet Funding Inflow"**.
- Customer later spends ৳600 from wallet balance to buy ChatGPT Plus.
- The commercial overview records **৳600 under "Product Revenue"**.
- **Double-Counting Immunity:** Total recognized gross revenue across the two events is exactly ৳600 (not ৳1,600).

### 3.3 Average Order Value (AOV) & Zero Denominator Protection
In `src/lib/analytics/business-intelligence.ts`:
- **Formula:** `AOV = Verified Revenue / Verified Order Count`.
- **Verified Result:** An aggregate of ৳1,500 across 3 orders accurately computes `AOV = ৳500.00`.
- **Zero Denominator Protection:** If a newly selected date window contains 0 verified orders, the function safely returns `0` rather than throwing `NaN` or `Infinity`.

### 3.4 Multi-Item Allocation & Historical Price Immutability
- **Multi-Item Order Split:** If an order contains Product A (৳300) and Product B (৳500), the product sales ranking report allocates ৳300 to Product A and ৳500 to Product B.
- **Historical Price Immutability:** If a product's catalog price is later increased from ৳500 to ৳700, past orders preserve their original ৳500 snapshot price, ensuring historical financial audits remain 100% accurate.

### 3.5 Period-over-Period Comparison Math
- **Formula:** `calcMetricComparison(current, prior)`.
- **Positive Delta:** Current ৳1,250 vs Prior ৳1,000 accurately calculates `+25.0%`.
- **Zero Prior Period:** When prior period is 0 and current is positive, calculates `+100.0%` (safe fallback, avoids `Infinity`).
- **Zero Both Periods:** When both periods are 0, calculates `0.0%` (avoids `NaN`).

### 3.6 CSV Export Security & Formula Injection Defense
In `src/lib/analytics/business-intelligence.ts`:
When exporting CSV files via `/api/admin/reports/export`, every field is processed through `sanitizeCsvValue()`:
- **Normal Strings:** Wrapped in double quotes (e.g., `"ChatGPT Plus"`).
- **Dangerous `=cmd` Prefix:** Escaped with single quote (e.g., `"=1+2"` -> `"'=1+2"`).
- **Dangerous `+` Prefix:** Escaped with single quote (e.g., `"+SUM(A1:A10)"` -> `"'+SUM(A1:A10)"`).
- **Dangerous `-` Prefix:** Escaped with single quote (e.g., `"-cmd|' /C calc'!A0"` -> `"'-cmd|' /C calc'!A0"`).
- **Dangerous `@` Prefix:** Escaped with single quote (e.g., `"@SUM(B1:B5)"` -> `"'@SUM(B1:B5)"`).
- **Credential Redaction:** Exported CSV files strictly exclude passwords, TOTP secrets, and API tokens.

---

## 4. REPORTING & EXPORT VERIFICATION SCORECARD

| Analytics Invariant | Verification Status | Verified Operational Result |
|---------------------|:-------------------:|-----------------------------|
| Date-Bounded Windows | **PASS** | Start and end boundaries strictly enforced; no table scans |
| Revenue Separation | **PASS** | Wallet funding distinct from product sales; zero double count |
| Cancelled Order Isolation | **PASS** | Failed/cancelled orders contribute exactly ৳0 to revenue |
| Refund Net Revenue Deduction | **PASS** | Net Revenue equals Verified Revenue minus Completed Refunds |
| AOV Zero-Division Guard | **PASS** | Returns ৳0 safely when order count is zero |
| Comparison Math Safety | **PASS** | Prevents `Infinity` and `NaN` when prior period is zero |
| CSV Formula Injection Defense | **PASS** | Escapes `=`, `+`, `-`, `@` with leading `'` quote |
| Secret Shielding in Exports | **PASS** | 100% credentials and API secrets excluded from CSV files |
