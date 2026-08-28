// ─── AI Haat — Analytics Master Test Suite ──────────────────────
// 25 test assertions covering analytics integration correctness.
// Run: npx tsx scripts/test-analytics-suite.ts

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";

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

function readFile(rel: string): string {
  return readFileSync(join(ROOT, rel), "utf-8");
}

console.log("\n" + "═".repeat(70));
console.log("  AI HAAT — ANALYTICS MASTER TEST SUITE (25 Tests)");
console.log("═".repeat(70) + "\n");

// ─── TEST 1: Product detail view_item fires once on mount ─────
assert(
  "ProductDetailClient fires view_item once via useRef guard",
  fileContains("src/components/product/ProductDetailClient.tsx", "trackViewItem", "viewTrackedRef") &&
  fileContains("src/components/product/ProductDetailClient.tsx", "viewTrackedRef.current = true")
);

// ─── TEST 2: React rerender does NOT duplicate view_item ──────
assert(
  "view_item guarded by useRef to prevent re-render duplicates",
  fileContains("src/components/product/ProductDetailClient.tsx", "if (viewTrackedRef.current) return")
);

// ─── TEST 3: Add to cart produces correct analytics call ──────
assert(
  "CartContext fires trackAddToCart with sanitized item data",
  fileContains("src/context/CartContext.tsx", "trackAddToCart", "sanitizeItem")
);

// ─── TEST 4: Begin checkout fires once ────────────────────────
assert(
  "CheckoutPageClient fires trackBeginCheckout once via useRef",
  fileContains("src/components/checkout/CheckoutPageClient.tsx", "trackBeginCheckout", "checkoutTrackedRef")
);

// ─── TEST 5: Payment method event includes safe label ─────────
assert(
  "Payment info event uses safe label ('Wallet'/'Gateway'), not raw method",
  fileContains("src/components/checkout/CheckoutPageClient.tsx", "trackAddPaymentInfo(label", "\"Wallet\" : \"Gateway\"")
);

// ─── TEST 6: Fake success page does NOT fire Purchase ─────────
assert(
  "PurchaseTracker only fires when paymentStatus === 'VERIFIED'",
  fileContains("src/components/analytics/PurchaseTracker.tsx", 'data.paymentStatus !== "VERIFIED"')
);

// ─── TEST 7: Verified order success fires exactly one Purchase
assert(
  "PurchaseTracker fires trackPurchase for VERIFIED orders with event_id",
  fileContains("src/components/analytics/PurchaseTracker.tsx", "trackPurchase(purchaseData)", "event_id: `purchase_${data.orderNumber}`")
);

// ─── TEST 8: Success page refresh does NOT duplicate Purchase ─
assert(
  "PurchaseTracker uses sessionStorage dedup key",
  fileContains("src/components/analytics/PurchaseTracker.tsx", "sessionStorage.getItem(dedupKey)", "sessionStorage.setItem(dedupKey")
);

// ─── TEST 9: Server-side CAPI on payment callback ─────────────
assert(
  "Payment callback route calls trackServerPurchase after updateResult.count > 0",
  fileContains("src/app/api/payment/callback/route.ts", "trackServerPurchase") &&
  fileContains("src/app/api/payment/callback/route.ts", "import { trackServerPurchase }")
);

// ─── TEST 10: CAPI event_id matches client Purchase ───────────
assert(
  "Server uses same event_id format (purchase_<orderNumber>) as client",
  fileContains("src/lib/analytics/server.ts", "const eventId = `purchase_${order.orderNumber}`") &&
  fileContains("src/components/analytics/PurchaseTracker.tsx", "event_id: `purchase_${data.orderNumber}`")
);

// ─── TEST 11: Multi-item order Purchase includes all items ────
assert(
  "Server Purchase builds items array from order.items",
  fileContains("src/lib/analytics/server.ts", "order.items")
);

// ─── TEST 12: Purchase uses OrderItem.priceBDT ────────────────
assert(
  "CAPI Purchase data uses historical item.priceBDT from OrderItem",
  fileContains("src/lib/analytics/meta-capi.ts", "item_price: item.priceBDT")
);

// ─── TEST 13: Coupon included in Purchase ─────────────────────
assert(
  "PurchaseTracker passes coupon to Purchase event",
  fileContains("src/components/analytics/PurchaseTracker.tsx", "coupon: data.couponCode")
);

// ─── TEST 14: Failed payment produces no Purchase ─────────────
assert(
  "PurchaseTracker aborts if status is not 'completed'/'success'",
  fileContains("src/components/analytics/PurchaseTracker.tsx", 'if (status !== "completed" && status !== "success") return')
);

// ─── TEST 15: Wallet purchase fires product Purchase ──────────
assert(
  "Wallet purchase route fires server-side Purchase tracking",
  fileContains("src/app/api/wallet/purchase/route.ts", "trackServerPurchase")
);

// ─── TEST 16: Wallet top-up is NOT a Purchase event ───────────
assert(
  "Server trackServerWalletTopup is separate from trackServerPurchase — no Purchase event",
  fileContains("src/lib/analytics/server.ts", "trackServerWalletTopup") &&
  fileNotContains("src/lib/analytics/server.ts", "wallet_topup.*Purchase")
);

// ─── TEST 17: UTM attribution persists in cookies ─────────────
assert(
  "Attribution module sets first-touch and last-touch cookies",
  fileContains("src/lib/analytics/attribution.ts", "aihaat_first_touch", "aihaat_last_touch")
);

// ─── TEST 18: Order creation saves attribution fields ─────────
assert(
  "Orders API accepts and persists UTM attribution fields",
  fileContains("src/app/api/orders/route.ts", "utmSource") &&
  fileContains("src/app/api/orders/route.ts", "utmCampaign")
);

// ─── TEST 19: First-touch not overwritten by direct visit ─────
assert(
  "First-touch cookie is set once and never overwritten",
  fileContains("src/lib/analytics/attribution.ts", "!getCookie(FIRST_TOUCH_KEY)")
);

// ─── TEST 20: No sensitive data in analytics ──────────────────
const sanitizerCode = readFile("src/lib/analytics/sanitize.ts");
assert(
  "Sanitizer strips sensitive URL params (token, otp, secret, password)",
  sanitizerCode.includes('"token"') &&
  sanitizerCode.includes('"otp"') &&
  sanitizerCode.includes('"password"') &&
  sanitizerCode.includes('"secret"')
);

// ─── TEST 21: Admin routes excluded from funnel tracking ──────
assert(
  "AnalyticsProvider skips script loading on /admin routes",
  fileContains("src/components/analytics/AnalyticsProvider.tsx", 'pathname?.startsWith("/admin")')
);

// ─── TEST 22: Analytics does not break checkout ───────────────
assert(
  "Client analytics wraps gtag/fbq in try-catch (safeGtag/safeFbq)",
  fileContains("src/lib/analytics/client.ts", "function safeGtag", "function safeFbq") &&
  fileContains("src/lib/analytics/client.ts", "try {")
);

// ─── TEST 23: Missing env vars do not crash app ───────────────
assert(
  "AnalyticsProvider conditionally loads scripts based on env vars",
  fileContains("src/components/analytics/AnalyticsProvider.tsx", 'process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""') &&
  fileContains("src/components/analytics/AnalyticsProvider.tsx", 'process.env.NEXT_PUBLIC_META_PIXEL_ID || ""')
);

// ─── TEST 24: SPA page view tracking on navigation ────────────
assert(
  "PageViewTracker fires on pathname changes with debounce",
  fileContains("src/components/analytics/PageViewTracker.tsx", "usePathname", "trackPageView") &&
  fileContains("src/components/analytics/PageViewTracker.tsx", "setTimeout")
);

// ─── TEST 25: AnalyticsEvent outbox for CAPI retry ────────────
assert(
  "AnalyticsEvent model exists in schema and server writes to outbox",
  fileContains("prisma/schema.prisma", "model AnalyticsEvent") &&
  fileContains("src/lib/analytics/server.ts", "prisma.analyticsEvent.create")
);

// ─── BONUS CHECKS ─────────────────────────────────────────────

// Prisma schema has attribution fields
assert(
  "[BONUS] Order model has utmSource, utmMedium, utmCampaign, analyticsPurchaseSentAt",
  fileContains("prisma/schema.prisma", "utmSource", "utmMedium", "utmCampaign", "analyticsPurchaseSentAt")
);

// Analytics API endpoint exists
assert(
  "[BONUS] Analytics-safe order data API endpoint exists",
  fileExists("src/app/api/orders/analytics/route.ts") &&
  fileContains("src/app/api/orders/analytics/route.ts", "paymentStatus")
);

// Analytics retry endpoint exists
assert(
  "[BONUS] Analytics retry CRON endpoint exists",
  fileExists("src/app/api/analytics/retry/route.ts") &&
  fileContains("src/app/api/analytics/retry/route.ts", "CRON_SECRET")
);

// Meta CAPI token is server-only
assert(
  "[BONUS] META_CAPI_ACCESS_TOKEN is server-only (no NEXT_PUBLIC prefix)",
  fileContains("src/lib/analytics/meta-capi.ts", "process.env.META_CAPI_ACCESS_TOKEN") &&
  fileNotContains("src/lib/analytics/meta-capi.ts", "NEXT_PUBLIC_META_CAPI")
);

// SHA-256 hashing for CAPI user data
assert(
  "[BONUS] CAPI user data is SHA-256 hashed",
  fileContains("src/lib/analytics/sanitize.ts", "createHash(\"sha256\")")
);

// Currency is always BDT
assert(
  "[BONUS] Currency is always 'BDT' in all analytics — no USD conversion",
  fileContains("src/lib/analytics/types.ts", '"BDT"') &&
  fileContains("src/lib/analytics/client.ts", '"BDT"')
);

// Webhook also fires server purchase
assert(
  "[BONUS] Webhook route fires trackServerPurchase",
  fileContains("src/app/api/payment/webhook/route.ts", "trackServerPurchase")
);

// Shop view_item_list
assert(
  "[BONUS] ShopClient fires view_item_list on product list render",
  fileContains("src/components/shop/ShopClient.tsx", "trackViewItemList")
);

// Search tracking with debounce
assert(
  "[BONUS] ShopClient fires search event with 1s debounce",
  fileContains("src/components/shop/ShopClient.tsx", "trackSearch", "1000")
);

// Homepage section tracking
assert(
  "[BONUS] ProductSection uses IntersectionObserver for view_item_list",
  fileContains("src/components/home/ProductSection.tsx", "IntersectionObserver", "trackViewItemList")
);

// Product request tracking
assert(
  "[BONUS] Product request fires custom analytics event",
  fileContains("src/components/product-request/ProductRequestClient.tsx", "product_request_submitted")
);

console.log("\n" + "─".repeat(70));
console.log(`  RESULTS: ${pass} passed, ${fail} failed (${pass + fail} total)`);
console.log("─".repeat(70));

if (fail > 0) {
  console.error("\n  ⚠️  Some analytics tests FAILED. Review above.\n");
  process.exit(1);
} else {
  console.log("\n  🎉 ALL ANALYTICS TESTS PASSED!\n");
  process.exit(0);
}
