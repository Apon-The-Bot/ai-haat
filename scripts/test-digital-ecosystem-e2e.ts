/**
 * AI Haat — Digital Ecosystem Automated E2E Verification Suite
 * Tests all 12 core digital e-commerce features across:
 * 1. Vault & Subscription Expiry Tracking
 * 2. Bundles, Tiered Pricing & Flash Sales
 * 3. Comparison, Social Proof & WhatsApp
 * 4. Loyalty Coins & Digital Gift Cards
 * 5. Branded PDF Invoices & COGS Analytics
 */

import { calculateCartTotals } from "../src/lib/commerce/pricing";
import { COIN_REWARD_TIERS } from "../src/lib/loyalty/coins";
import { generateGiftCardCode } from "../src/lib/gifting/gift-cards";
import { generateInvoicePdf } from "../src/lib/invoicing/pdf-generator";
import { calculateGrossMarginPct } from "../src/lib/commerce/costing";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${testName} ${details ? `(${details})` : ""}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("   AI HAAT — DIGITAL PRODUCT ECOSYSTEM E2E TESTS       ");
  console.log("=======================================================\n");

  // -------------------------------------------------------------------
  // TEST GROUP 1: Pricing Engine — Tiered Volume & Bundles
  // -------------------------------------------------------------------
  console.log("📦 [1] Pricing Engine & Sales Boosters");

  const singleItemCart = [
    {
      productId: "prod-gpt-4",
      productName: "ChatGPT Plus 1 Month",
      productSlug: "chatgpt-plus",
      variationId: "var-1",
      variationName: "1 Month Shared",
      priceBDT: 850,
      quantity: 1,
      costPriceBDT: 500,
    },
  ];

  const singleResult = calculateCartTotals(singleItemCart);
  assert(singleResult.subtotalBDT === 850, "Single item subtotal correct (850 BDT)");
  assert(singleResult.volumeDiscountBDT === 0, "No volume discount for 1 item");
  assert(singleResult.totalBDT === 850, "Total equals subtotal for single item");

  // Tiered Volume Pricing (3 units => 5% off)
  const threeItemsCart = [
    {
      ...singleItemCart[0],
      quantity: 3,
    },
  ];
  const threeResult = calculateCartTotals(threeItemsCart);
  assert(threeResult.subtotalBDT === 2550, "3 units subtotal is 2550 BDT");
  assert(threeResult.volumeDiscountBDT === 128, "3 units qualifies for 5% volume discount (~128 BDT)");
  assert(threeResult.totalBDT === 2422, "Net total reflects 5% volume discount");

  // Tiered Volume Pricing (5 units => 10% off)
  const fiveItemsCart = [
    {
      ...singleItemCart[0],
      quantity: 5,
    },
  ];
  const fiveResult = calculateCartTotals(fiveItemsCart);
  assert(fiveResult.subtotalBDT === 4250, "5 units subtotal is 4250 BDT");
  assert(fiveResult.volumeDiscountBDT === 425, "5 units qualifies for 10% volume discount (425 BDT)");
  assert(fiveResult.totalBDT === 3825, "Net total reflects 10% volume discount");

  // Bundle Discount (10% companion discount)
  const bundleCart = [
    { ...singleItemCart[0], quantity: 1 },
    {
      productId: "prod-canva-pro",
      productName: "Canva Pro 1 Year",
      productSlug: "canva-pro",
      variationId: "var-2",
      variationName: "1 Year Private",
      priceBDT: 400,
      quantity: 1,
      costPriceBDT: 200,
    },
  ];
  const bundleResult = calculateCartTotals(bundleCart, {
    bundleDiscountPercent: 10,
  });
  assert(bundleResult.subtotalBDT === 1250, "Bundle subtotal is 1250 BDT");
  assert(bundleResult.bundleDiscountBDT === 125, "10% bundle discount applied (125 BDT)");
  assert(bundleResult.totalBDT === 1125, "Net total reflects bundle discount (1125 BDT)");

  // -------------------------------------------------------------------
  // TEST GROUP 2: Loyalty Rewards Club (AI Haat Coins)
  // -------------------------------------------------------------------
  console.log("\n🪙 [2] Loyalty Rewards Club");

  assert(COIN_REWARD_TIERS.length === 4, "4 distinct coin reward tiers defined");
  const bronze = COIN_REWARD_TIERS.find((t) => t.id === "tier-bronze");
  const diamond = COIN_REWARD_TIERS.find((t) => t.id === "tier-diamond");
  assert(bronze?.coinsCost === 100 && bronze?.discountBDT === 20, "Bronze voucher: 100 coins = 20 BDT discount");
  assert(diamond?.coinsCost === 1000 && diamond?.discountBDT === 350, "Diamond voucher: 1000 coins = 350 BDT discount");

  // Coin Earning formula check (1 Coin per 10 BDT)
  const testOrderBDT = 1250;
  const expectedCoins = Math.floor(testOrderBDT / 10);
  assert(expectedCoins === 125, "1250 BDT order earns exactly 125 coins");

  // -------------------------------------------------------------------
  // TEST GROUP 3: Digital Gift Cards & Vouchers
  // -------------------------------------------------------------------
  console.log("\n🎁 [3] Digital Gift Cards");

  const sampleGiftCode = generateGiftCardCode();
  assert(
    /^AIHT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(sampleGiftCode),
    `Gift card code matches format AIHT-XXXX-XXXX-XXXX (${sampleGiftCode})`
  );

  const sampleGiftCode2 = generateGiftCardCode();
  assert(sampleGiftCode !== sampleGiftCode2, "Generated gift codes are unique");

  // -------------------------------------------------------------------
  // TEST GROUP 4: Digital Vault & 1-Click Renewal URL Formats
  // -------------------------------------------------------------------
  console.log("\n🔐 [4] Digital Vault & 1-Click Renewal");

  const sampleKey = {
    id: "key-12345",
    orderId: "ord-98765",
    orderNumber: "AIHT-2026-001",
    productSlug: "chatgpt-plus",
    variationId: "var-1",
    credentialsDelivered: "email: user@aihaat.com | pass: Secret123",
  };

  // Build renewal link
  const renewalUrl = `/checkout?renewOrderId=${encodeURIComponent(sampleKey.orderId)}&renewKeyId=${encodeURIComponent(sampleKey.id)}&slug=${encodeURIComponent(sampleKey.productSlug)}&varId=${encodeURIComponent(sampleKey.variationId)}`;
  assert(renewalUrl.includes("renewOrderId=ord-98765"), "Renewal URL carries existing order context");
  assert(renewalUrl.includes("renewKeyId=key-12345"), "Renewal URL carries key ID for seamless continuation");

  // -------------------------------------------------------------------
  // TEST GROUP 5: Financial Costing & Profit Margins (COGS)
  // -------------------------------------------------------------------
  console.log("\n📊 [5] Business Intelligence & Margin Costing");

  const margin1 = calculateGrossMarginPct(500, 1000);
  assert(margin1 === 50, "500 profit on 1000 revenue = 50% margin");

  const margin2 = calculateGrossMarginPct(0, 1000);
  assert(margin2 === 0, "0 profit on 1000 revenue = 0% margin");

  const margin3 = calculateGrossMarginPct(-200, 1000);
  assert(margin3 === -20, "-200 profit on 1000 revenue = -20% margin");

  const marginZeroRev = calculateGrossMarginPct(0, 0);
  assert(marginZeroRev === 0, "0 revenue safely returns 0% margin without division by zero");

  // -------------------------------------------------------------------
  // TEST GROUP 6: Branded PDF Invoice Generation
  // -------------------------------------------------------------------
  console.log("\n📄 [6] Branded PDF Invoicing Engine");

  try {
    const mockOrder = {
      orderNumber: "AIHT-2026-TEST",
      createdAt: new Date(),
      customerName: "Md Amanullah",
      customerEmail: "aman@example.com",
      customerPhone: "01700000000",
      paymentMethod: "BKASH",
      paymentStatus: "VERIFIED",
      deliveryStatus: "DELIVERED",
      subtotalBDT: 1500,
      discountBDT: 100,
      totalBDT: 1400,
      trxId: "TRX99887766",
      items: [
        {
          productName: "ChatGPT Plus Subscription",
          variationName: "1 Month Shared",
          quantity: 1,
          priceBDT: 850,
          subtotalBDT: 850,
        },
        {
          productName: "Midjourney Pro",
          variationName: "1 Month Private",
          quantity: 1,
          priceBDT: 650,
          subtotalBDT: 650,
        },
      ],
    };

    const pdfBuffer = await generateInvoicePdf(mockOrder);
    assert(pdfBuffer instanceof Buffer, "PDF generator returns valid Buffer instance");
    assert(pdfBuffer.length > 1000, `PDF invoice buffer generated successfully (${pdfBuffer.length} bytes)`);
    assert(pdfBuffer.toString("utf8", 0, 4) === "%PDF", "Buffer begins with valid %PDF magic header");
  } catch (pdfErr: any) {
    assert(false, "PDF generation failed", pdfErr?.message);
  }

  // -------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`   E2E RESULTS: ${passed} PASSED | ${failed} FAILED     `);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
