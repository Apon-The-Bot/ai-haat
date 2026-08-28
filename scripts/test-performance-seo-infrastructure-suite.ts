import assert from "assert";
import fs from "fs";
import path from "path";

interface TestCase {
  category: string;
  name: string;
  run: () => void | Promise<void>;
}

const testCases: TestCase[] = [];

function registerTest(category: string, name: string, run: () => void | Promise<void>) {
  testCases.push({ category, name, run });
}

// -------------------------------------------------------------------------
// 1. Image Optimization & Media Delivery
// -------------------------------------------------------------------------
registerTest("Image Optimization", "next.config.mjs configures safe modern image formats (WebP) and strict remotePatterns", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "next.config.mjs"), "utf8");
  assert.strictEqual(fileContent.includes("formats: [\"image/webp\"]"), true);
  assert.strictEqual(fileContent.includes("remotePatterns:"), true);
  assert.strictEqual(fileContent.includes("hostname: \"images.unsplash.com\""), true);
  assert.strictEqual(fileContent.includes("unoptimized: true"), false, "unoptimized must be false for production");
});

registerTest("Image Optimization", "OpenGraph brand image assets exist in public/images/", () => {
  const pngExists = fs.existsSync(path.join(process.cwd(), "public/images/og-image.png"));
  const svgExists = fs.existsSync(path.join(process.cwd(), "public/images/og-image.svg"));
  assert.strictEqual(pngExists || svgExists, true, "OG image asset must exist");
});

registerTest("Image Optimization", "SafeImage component enforces layout-shift prevention with aspect containment", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/components/SafeImage.tsx"), "utf8");
  assert.strictEqual(fileContent.includes("aspectClass"), true);
  assert.strictEqual(fileContent.includes("fallbackSrc"), true);
  assert.strictEqual(fileContent.includes("sizes="), true);
});

// -------------------------------------------------------------------------
// 2. Font Optimization & Localization
// -------------------------------------------------------------------------
registerTest("Font Optimization", "globals.css does not contain render-blocking Google Font @import", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
  assert.strictEqual(fileContent.includes("@import url('https://fonts.googleapis.com"), false);
});

registerTest("Font Optimization", "Root layout loads optimized fonts via next/font/google with Bengali support", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");
  assert.strictEqual(fileContent.includes("from \"next/font/google\""), true);
  assert.strictEqual(fileContent.includes("Hind_Siliguri"), true);
  assert.strictEqual(fileContent.includes("bengali"), true);
  assert.strictEqual(fileContent.includes("<html lang=\"bn\""), true);
});

// -------------------------------------------------------------------------
// 3. Technical SEO & Social Graph Integrity
// -------------------------------------------------------------------------
registerTest("SEO & Social Graph", "Root metadata defines canonical URL, OpenGraph, and Twitter cards", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");
  assert.strictEqual(fileContent.includes("metadataBase: new URL(SITE_URL)"), true);
  assert.strictEqual(fileContent.includes("canonical: SITE_URL"), true);
  assert.strictEqual(fileContent.includes("/images/og-image.png"), true);
  assert.strictEqual(fileContent.includes("summary_large_image"), true);
  assert.strictEqual(fileContent.includes("locale: \"bn_BD\""), true);
});

registerTest("SEO & Social Graph", "Private transactional and admin routes enforce noindex, nofollow", () => {
  const adminLayout = fs.readFileSync(path.join(process.cwd(), "src/app/admin/layout.tsx"), "utf8");
  assert.strictEqual(adminLayout.includes("index: false"), true);
  assert.strictEqual(adminLayout.includes("follow: false"), true);

  const dashLayout = fs.readFileSync(path.join(process.cwd(), "src/app/dashboard/layout.tsx"), "utf8");
  assert.strictEqual(dashLayout.includes("index: false"), true);
  assert.strictEqual(dashLayout.includes("follow: false"), true);
});

registerTest("SEO & Social Graph", "Robots.txt disallows private administration, dashboard, and checkout paths", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/app/robots.ts"), "utf8");
  assert.strictEqual(fileContent.includes("disallowRoutes"), true);
  assert.strictEqual(fileContent.includes('"/admin"'), true);
  assert.strictEqual(fileContent.includes('"/dashboard"'), true);
  assert.strictEqual(fileContent.includes('"/checkout"'), true);
});

// -------------------------------------------------------------------------
// 4. Analytics Financial Correctness & Deduplication
// -------------------------------------------------------------------------
registerTest("Analytics Correctness", "PurchaseTracker verifies order paymentStatus is VERIFIED on server", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/components/analytics/PurchaseTracker.tsx"), "utf8");
  assert.strictEqual(fileContent.includes('data.paymentStatus !== "VERIFIED"'), true);
  assert.strictEqual(fileContent.includes("sessionStorage.setItem"), true);
});

registerTest("Analytics Correctness", "Purchase event sets stable transaction_id and matching Meta CAPI event_id", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/components/analytics/PurchaseTracker.tsx"), "utf8");
  assert.strictEqual(fileContent.includes("transaction_id: data.orderNumber"), true);
  assert.strictEqual(fileContent.includes("event_id: `purchase_${data.orderNumber}`"), true);
});

registerTest("Analytics Correctness", "AnalyticsProvider excludes admin routes from marketing scripts", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/components/analytics/AnalyticsProvider.tsx"), "utf8");
  assert.strictEqual(fileContent.includes('pathname?.startsWith("/admin")'), true);
  assert.strictEqual(fileContent.includes('strategy="afterInteractive"'), true);
});

// -------------------------------------------------------------------------
// 5. Production Infrastructure & Environment Contracts
// -------------------------------------------------------------------------
registerTest("Infrastructure", "PM2 ecosystem config is configured for cluster mode with node_modules next binary", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "ecosystem.config.js"), "utf8");
  assert.strictEqual(fileContent.includes('exec_mode: "cluster"'), true);
  assert.strictEqual(fileContent.includes("instances:"), true);
  assert.strictEqual(fileContent.includes('"max"'), true);
  assert.strictEqual(fileContent.includes('NODE_ENV: "production"'), true);
});

registerTest("Infrastructure", "Currency converter avoids unconfigured USD fallback and prioritizes BDT", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/utils/currency.ts"), "utf8");
  assert.strictEqual(fileContent.includes("BDT_PER_USD: number | null"), true);
  assert.strictEqual(fileContent.includes("if (!BDT_PER_USD || BDT_PER_USD <= 0) return null;"), true);
});

registerTest("Infrastructure", "Health endpoint sanitizes database error output in production environment", () => {
  const fileContent = fs.readFileSync(path.join(process.cwd(), "src/app/api/health/route.ts"), "utf8");
  assert.strictEqual(fileContent.includes('process.env.NODE_ENV === "production"'), true);
  assert.strictEqual(fileContent.includes('"Database connection unavailable"'), true);
  assert.strictEqual(fileContent.includes('status: isHealthy ? "HEALTHY" : "UNHEALTHY"'), true);
});

// -------------------------------------------------------------------------
// Execution Engine
// -------------------------------------------------------------------------
async function main() {
  console.log("================================================================================");
  console.log("AI HAAT - PHASE 7: PERFORMANCE, SEO & INFRASTRUCTURE SUITE");
  console.log("Deterministic Production Optimization Verification Harness");
  console.log("================================================================================\n");

  const declaredCount = testCases.length;
  let executedCount = 0;
  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  let currentCategory = "";

  for (const testCase of testCases) {
    if (testCase.category !== currentCategory) {
      currentCategory = testCase.category;
      console.log(`\n--- ${currentCategory} ---`);
    }

    executedCount++;
    try {
      await testCase.run();
      console.log(`  [PASS] ${testCase.name}`);
      passedCount++;
    } catch (err: any) {
      console.error(`  [FAIL] ${testCase.name}:`, err.message);
      failedCount++;
    }
  }

  console.log("\n================================================================================");
  console.log("PHASE 7 PERFORMANCE & INFRASTRUCTURE SUITE SUMMARY");
  console.log(`Declared test cases : ${declaredCount}`);
  console.log(`Executed test cases : ${executedCount}`);
  console.log(`Passed              : ${passedCount}`);
  console.log(`Failed              : ${failedCount}`);
  console.log(`Skipped             : ${skippedCount}`);
  console.log("================================================================================");

  if (declaredCount !== executedCount || failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test harness uncaught error:", err);
  process.exit(1);
});
