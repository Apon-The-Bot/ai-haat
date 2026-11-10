# AI HAAT — COUPON, LOYALTY CLUB & REFERRAL SYSTEM TESTS
**Project:** AI Haat (`aihaat.shop`)  
**Scope:** Discount Engine, AI Haat Coins Loyalty Club, Affiliate Referrals & Commission Settlements  
**Audit Timestamp:** November 2026  
**Auditor:** Senior Backend Engineer & Growth Systems Architect  

---

## 1. GROWTH & INCENTIVE SUBSYSTEM ARCHITECTURE

AI Haat incorporates three integrated growth and retention systems:
1. **Promotional Coupon Engine (`src/lib/commerce/pricing.ts` & `src/app/api/admin/coupons`):** Manages promotional codes with flat or percentage deductions, minimum spend barriers, expiration limits, and global usage limits.
2. **AI Haat Coins Loyalty Rewards Club (`src/lib/loyalty.ts`):** Gamified reward program awarding coins on verified purchases that can be redeemed for instant discount vouchers.
3. **Affiliate & Referral Network (`src/lib/affiliate.ts` & `/admin/affiliates`):** User referral tracking with fraud-resistant click deduplication, commission accounting, and administrator payout disbursements.

---

## 2. AUTOMATED TEST SUITE EXECUTION RESULTS

The growth and reward mechanisms were validated against:
- **`scripts/verify-admin-suite.ts` (Test 4):** Passed (Coupon creation, quote calculation & limit checks)
- **`scripts/test-comprehensive-audit.ts` (Feature 9):** Passed (Loyalty coin transaction tables & tier redemptions)
- **`scripts/verify-all-fixes.ts` (Test Group 9):** Passed (AUDIT-013 Referral Code Anti-Inflation Validation)
- **`scripts/test-affiliate-master-suite.ts`:** Passed (Affiliate commission attribution and payout workflow)

---

## 3. DETAILED TEST FINDINGS & VERIFICATIONS

### 3.1 Coupon Engine & Server-Side Enforcement
In `src/lib/commerce/pricing.ts` and `src/app/api/admin/coupons/route.ts`:
- **Discount Types:**
  - `FLAT_BDT`: Deducts an exact amount (e.g., ৳50 off).
  - `PERCENTAGE`: Deducts a percentage (e.g., 10% off), subject to an optional maximum cap (`maxDiscountBDT`).
- **Minimum Spend Barrier:** A coupon requiring `minOrderBDT = 500` will be rejected by the server quote engine if the order subtotal is ৳490, returning `error: "কুপনটি ব্যবহার করতে ন্যূনতম ৳৫০০ অর্ডারের প্রয়োজন।"`.
- **Expiration Date Check:** Coupons past `validUntil` are automatically invalidated.
- **Usage Limit Invariant:** When `usedCount >= usageLimit`, the server marks the coupon inactive, preventing over-redemption.
- **Database Persistence:** Evaluated in `scripts/verify-admin-suite.ts` (Test 4):
  - Created coupon `TESTXXXX` (৳50 flat discount, min spend ৳100).
  - Submitted server quote for ৳340 item.
  - Server calculated exact discount `discountBDT = 50` and net total `totalBDT = 290`.
  - Cleaned up test record cleanly.

### 3.2 AI Haat Coins (Loyalty Rewards Club)
In `src/lib/loyalty.ts`:
- **Coin Earning Mechanics:** Customers earn **1 AI Haat Coin for every ৳10 spent** on verified orders. An order of ৳1,250 automatically awards 125 coins to the buyer upon payment confirmation.
- **Redemption Tiers:** The loyalty engine provides 4 redemption voucher tiers:
  | Tier Name | Coins Required | Discount Voucher Value | Effective Return |
  |-----------|:--------------:|:----------------------:|:----------------:|
  | **Bronze Voucher** | 100 Coins | ৳20 BDT Discount | 20.0% |
  | **Silver Voucher** | 250 Coins | ৳60 BDT Discount | 24.0% |
  | **Gold Voucher** | 500 Coins | ৳150 BDT Discount | 30.0% |
  | **Diamond VIP Voucher** | 1000 Coins | ৳350 BDT Discount | 35.0% |
- **Transaction Ledger (`CoinTransaction`):** Every earn or spend event is permanently recorded with user ID, coin delta (+/-), order reference, and balance snapshot.

### 3.3 Affiliate & Referral Program (`/admin/affiliates`)
In `src/lib/affiliate.ts` and `src/app/admin/affiliates/page.tsx`:
- **Referral Code Format & Validation (AUDIT-013):**
  - Referral codes must match `^[a-zA-Z0-9_-]{3,30}$`.
  - Malicious inputs, SQL injection fragments, or XSS script tags (e.g., `<script>alert(1)</script>`) are rejected immediately with HTTP 400.
- **Anti-Inflation Click Deduplication:**
  - To prevent botnet click inflation, the referral tracking route (`/api/affiliates/track`) checks IP address and User-Agent.
  - Repeated clicks from the same IP within a 24-hour window are deduplicated and do not increment the affiliate's click counter.
- **Commission Attribution:**
  - When a referred user completes a verified purchase, the affiliate receives a standard **5% commission** on the order subtotal.
  - The commission is added to `AffiliateProfile.pendingBalanceBDT`.
- **Administrative Payout Settlement:**
  - Administrators review pending payouts at `/admin/affiliates`.
  - Clicking **"Mark as Settled"** creates an `AffiliatePayout` record with method (`bKash`, `Nagad`, `Bank Transfer`), transaction ID, and timestamp, safely zeroing out the affiliate's settled pending balance.

---

## 4. SUBSYSTEM VERIFICATION SCORECARD

| Feature | Audit Status | Verified Behavioral Invariant |
|---------|:------------:|-------------------------------|
| Flat Coupon Discounts | **PASS** | Deducts exact BDT amount from subtotal |
| Percentage Coupon Discounts | **PASS** | Calculates percentage, respects maximum discount cap |
| Minimum Spend Barrier | **PASS** | Rejects under-threshold orders with clear user message |
| Expiration & Usage Limits | **PASS** | Fails closed on expired dates or exhausted usage caps |
| Loyalty Coin Generation | **PASS** | 1 coin per 10 BDT awarded on verified payment |
| 4-Tier Coin Redemption | **PASS** | 100/250/500/1000 coin tiers validated in database |
| Referral Code Sanitation | **PASS** | Regex strictly blocks XSS scripts and invalid lengths |
| Click Inflation Defense | **PASS** | IP-based rate limiting and deduplication active |
| Affiliate Payout Settlement | **PASS** | Superadmin creates settlement records and updates balances |
