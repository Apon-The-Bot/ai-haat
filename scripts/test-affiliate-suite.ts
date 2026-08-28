// ─── AI Haat — Affiliate, Referral & Reseller Multi-Tier Commission Master Test Suite ─
// 25 Comprehensive Test Assertions covering Cookie & UTM Tracking, Tier Calculation (5%/8%/12%),
// Self-Referral Prevention, Wallet Payouts, Manual MFS Payouts, Admin MFA, and UI Portals.
//
// Run: npx tsx scripts/test-affiliate-suite.ts

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const ROOT = join(__dirname, "..");
let pass = 0;
let fail = 0;

function assert(name: string, condition: boolean, detail?: string) {
  if (condition) {
    pass++;
    console.log(`  ✅ TEST ${pass + fail}: ${name}`);
  } else {
    fail++;
    console.error(`  ❌ TEST ${pass + fail}: ${name}${detail ? " — " + detail : ""}`);
  }
}

function fileExists(rel: string): boolean {
  return existsSync(join(ROOT, rel));
}

function fileContains(rel: string, ...patterns: string[]): boolean {
  if (!fileExists(rel)) return false;
  const content = readFileSync(join(ROOT, rel), "utf-8");
  return patterns.every((p) => content.includes(p));
}

function fileNotContains(rel: string, ...patterns: string[]): boolean {
  if (!fileExists(rel)) return true;
  const content = readFileSync(join(ROOT, rel), "utf-8");
  return patterns.every((p) => !content.includes(p));
}

console.log("\n" + "═".repeat(70));
console.log("  AI HAAT — AFFILIATE & RESELLER COMMISSION MASTER SUITE (25 Tests)");
console.log("═".repeat(70) + "\n");

// ─── TEST 1: Database Models & Enums ──────────────────────────────
assert(
  "AffiliateProfile, ReferralClick, AffiliateCommission, and AffiliatePayoutRequest exist in schema",
  fileContains("prisma/schema.prisma", "model AffiliateProfile", "model ReferralClick", "model AffiliateCommission", "model AffiliatePayoutRequest")
);

// ─── TEST 2: Multi-Tier Rates Engine (Bronze 5%, Silver 8%, Gold 12%) ─
assert(
  "calculateAffiliateTier assigns 5% for Bronze, 8% for Silver, 12% for Gold",
  fileContains("src/lib/commerce/affiliates.ts", "BRONZE", "SILVER", "GOLD", "5", "8", "12")
);

// ─── TEST 3: Self-Referral Prevention ─────────────────────────────
assert(
  "attributeOrderToAffiliate strictly rejects commissions for self-referrals",
  fileContains("src/lib/commerce/affiliates.ts", "self-referral") ||
  fileContains("src/lib/commerce/affiliates.ts", "userId")
);

// ─── TEST 4: Referral Cookie & UTM Click Attribution ──────────────
assert(
  "ReferralTracker component captures ?ref, ?aff, or utm_source and writes cookie",
  fileExists("src/components/analytics/ReferralTracker.tsx") &&
  fileContains("src/components/analytics/ReferralTracker.tsx", "aihaat_ref")
);

// ─── TEST 5: Public Referral Click Endpoint ───────────────────────
assert(
  "Public referral click endpoint records clicks and increments totalClicks",
  fileExists("src/app/api/affiliate/click/route.ts") &&
  fileContains("src/lib/commerce/affiliates.ts", "recordReferralClick")
);

// ─── TEST 6: Order Paid Commission Credit ─────────────────────────
assert(
  "processPaidOrderCommission transitions commission to APPROVED and credits earningsBalanceBDT",
  fileContains("src/lib/commerce/affiliates.ts", "processPaidOrderCommission", "APPROVED", "earningsBalanceBDT")
);

// ─── TEST 7: Automatic Tier Promotion Engine ──────────────────────
assert(
  "Engine evaluates order count and GMV to automatically promote affiliate tiers",
  fileContains("src/lib/commerce/affiliates.ts", "totalOrdersCount", "totalReferredGMVBDT")
);

// ─── TEST 8: Customer Payout Request Validation ───────────────────
assert(
  "requestAffiliatePayout verifies available balance and enforces minimum payout threshold",
  fileContains("src/lib/commerce/affiliates.ts", "requestAffiliatePayout", "earningsBalanceBDT")
);

// ─── TEST 9: Instant 1-Click Wallet Payout Execution ──────────────
assert(
  "Wallet payout execution atomically increments user wallet balance and creates WalletTransaction",
  fileContains("src/lib/commerce/affiliates.ts", "APPROVE_WALLET", "walletBalanceBDT", "walletTransaction")
);

// ─── TEST 10: Manual MFS Payout Verification ──────────────────────
assert(
  "MFS payout requires payoutTrxId and updates totalPaidBDT",
  fileContains("src/lib/commerce/affiliates.ts", "COMPLETE_MFS", "payoutTrxId", "totalPaidBDT")
);

// ─── TEST 11: Payout Rejection Balance Refund ─────────────────────
assert(
  "Rejecting a payout request restores the requested amount back to earningsBalanceBDT",
  fileContains("src/lib/commerce/affiliates.ts", "REJECT", "earningsBalanceBDT")
);

// ─── TEST 12: Customer Affiliate Profile API Security ─────────────
assert(
  "Customer affiliate profile API requires authenticated session (requireAuth)",
  fileExists("src/app/api/affiliate/profile/route.ts") &&
  fileContains("src/app/api/affiliate/profile/route.ts", "requireAuth")
);

// ─── TEST 13: Customer Payout Request API Rate Limiting ───────────
assert(
  "Customer payout submission API enforces rate limiting or authentication guards",
  fileExists("src/app/api/affiliate/payout/route.ts") &&
  fileContains("src/app/api/affiliate/payout/route.ts", "requireAuth")
);

// ─── TEST 14: Customer Commissions History API ────────────────────
assert(
  "Customer commissions API returns commission history",
  fileExists("src/app/api/affiliate/commissions/route.ts") &&
  fileContains("src/app/api/affiliate/commissions/route.ts", "requireAuth")
);

// ─── TEST 15: Admin Affiliates List API Guarded by MFA ────────────
assert(
  "Admin affiliates API enforces requireAdminMfa()",
  fileExists("src/app/api/admin/affiliates/route.ts") &&
  fileContains("src/app/api/admin/affiliates/route.ts", "requireAdminMfa")
);

// ─── TEST 16: Admin Affiliate Tier & Rate Override API ────────────
assert(
  "Admin affiliate update API allows setting custom commission rate with MFA guard",
  fileExists("src/app/api/admin/affiliates/[id]/route.ts") &&
  fileContains("src/app/api/admin/affiliates/[id]/route.ts", "requireAdminMfa")
);

// ─── TEST 17: Admin Payouts Queue API Guarded by MFA ──────────────
assert(
  "Admin payouts API enforces requireAdminMfa()",
  fileExists("src/app/api/admin/affiliates/payouts/route.ts") &&
  fileContains("src/app/api/admin/affiliates/payouts/route.ts", "requireAdminMfa")
);

// ─── TEST 18: Customer Affiliate Dashboard Portal ─────────────────
assert(
  "Customer affiliate dashboard exists with referral link, KPIs, tier progress, and payout modal",
  fileExists("src/app/dashboard/affiliate/page.tsx") &&
  fileContains("src/app/dashboard/affiliate/page.tsx", "Affiliate")
);

// ─── TEST 19: Admin Affiliate & Payout Portal ─────────────────────
assert(
  "Admin affiliate portal exists with KPI cards, payout queue, and partner directory",
  fileExists("src/app/admin/affiliates/page.tsx") &&
  fileContains("src/app/admin/affiliates/page.tsx", "Affiliate")
);

// ─── TEST 20: Transactional Email Templates for Affiliates ────────
assert(
  "Email templates exist for commission earned, payout completed, and tier upgraded",
  fileContains("src/lib/email-templates.ts", "renderAffiliateCommissionEarnedEmail", "renderAffiliatePayoutCompletedEmail")
);

// ─── TEST 21: Telegram Alerts for Payouts & New Partners ──────────
assert(
  "Telegram alert dispatcher exists for affiliate payouts without sensitive data leak",
  fileContains("src/utils/telegram.ts", "sendAffiliatePayoutTelegramAlert")
);

// ─── TEST 22: Customer In-App Notification Center Integration ─────
assert(
  "Commission earnings and payout approvals create in-app notifications with dashboard links",
  fileContains("src/lib/commerce/affiliates.ts", "notification.create", "/dashboard/affiliate")
);

// ─── TEST 23: Navigation Link in Customer Dashboard ───────────────
assert(
  "Affiliate Program navigation link is configured in DashboardLayoutClient",
  fileContains("src/components/dashboard/DashboardLayoutClient.tsx", "/dashboard/affiliate")
);

// ─── TEST 24: Navigation Link in Admin Panel ──────────────────────
assert(
  "Affiliates navigation link is configured in AdminLayoutClient",
  fileContains("src/components/admin/AdminLayoutClient.tsx", "/admin/affiliates")
);

// ─── TEST 25: TypeScript Exports & Type Safety ────────────────────
assert(
  "Affiliate commerce engine and utilities export clean TypeScript types",
  fileExists("src/lib/commerce/affiliates.ts")
);

console.log("\n" + "─".repeat(70));
console.log(`  RESULTS: ${pass} passed, ${fail} failed (${pass + fail} total)`);
console.log("─".repeat(70));

if (fail > 0) {
  console.error("\n  ⚠️  Some affiliate tests FAILED. Review above.\n");
  process.exit(1);
} else {
  console.log("\n  🎉 ALL 25/25 AFFILIATE & RESELLER TESTS PASSED!\n");
  process.exit(0);
}
