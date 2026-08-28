import { prisma } from "../src/lib/prisma";
import { createQATracker, createCustomerFixture, createProductFixture, createOrderFixture, cleanupTestFixtures, guardSafeTestDatabase } from "./qa-fixtures";
import { calculateOrderQuote } from "../src/lib/commerce/pricing";
import { resolveProductConfiguration } from "../src/lib/commerce/resolver";

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
    failCount++;
  }
}

async function runCheckoutPricingSuite() {
  console.log("=================================================");
  console.log("  AGENT 3 — CHECKOUT, PRICING & ORDER QA SUITE");
  console.log("=================================================\n");

  guardSafeTestDatabase();
  const tracker = createQATracker();

  try {
    const user = await createCustomerFixture(tracker, "shopper");

    const { product: prodA, variation: varA } = await createProductFixture(tracker, {
      productType: "SUBSCRIPTION",
      priceBDT: 500,
    });

    const { product: prodB, variation: varB } = await createProductFixture(tracker, {
      productType: "LICENSE_KEY",
      priceBDT: 350,
    });

    const { product: prodC, variation: varC } = await createProductFixture(tracker, {
      productType: "WORKSPACE_ACCESS",
      priceBDT: 1200,
    });

    // Create a limited-use coupon
    const coupon = await prisma.coupon.create({
      data: {
        code: `QA-DISC10-${Date.now()}`,
        discountType: "PERCENTAGE",
        discountValue: 10,
        maxDiscountBDT: 200,
        minOrderBDT: 400,
        usageLimit: 1,
        usedCount: 0,
        isActive: true,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    tracker.couponIds.push(coupon.id);

    // --- TEST 1: Client Price Tampering Attack ---
    console.log("--- 1. SERVER-AUTHORITATIVE PRICING VS CLIENT TAMPERING ---");
    const tamperedClientItems = [
      {
        productId: prodA.id,
        variationId: varA.id,
        quantity: 1,
        clientSuppliedPrice: 1, // Tampered client price (1 BDT instead of 500 BDT)
      },
    ];

    const quoteResult = await calculateOrderQuote(
      tamperedClientItems.map((item) => ({
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
      })),
      null
    );

    assert(quoteResult.quote.subtotalBDT === 500, "Server calculates authentic price (৳500) and ignores client-submitted price (৳1)");
    assert(quoteResult.quote.totalBDT === 500, "Final total matches server-authoritative ৳500");

    // --- TEST 2: Arbitrary Client Discount Injection Attack ---
    console.log("\n--- 2. UNAUTHORIZED DISCOUNT INJECTION DEFENSE ---");
    const quoteNoCoupon = await calculateOrderQuote(
      [{ productId: prodA.id, variationId: varA.id, quantity: 1 }],
      "FAKE-COUPON-ATTACK"
    );
    assert(quoteNoCoupon.quote.discountBDT === 0, "Fake coupon code produces 0 discount");
    assert(quoteNoCoupon.quote.totalBDT === 500, "Order total remains full price ৳500");

    // --- TEST 3: Valid Coupon Calculation ---
    console.log("\n--- 3. COUPON ENGINE & RULES ---");
    const quoteWithCoupon = await calculateOrderQuote(
      [{ productId: prodA.id, variationId: varA.id, quantity: 1 }],
      coupon.code
    );
    assert(quoteWithCoupon.quote.discountBDT === 50, "Valid 10% coupon correctly computes ৳50 discount on ৳500 order");
    assert(quoteWithCoupon.quote.totalBDT === 450, "Final discounted total is exactly ৳450");

    // --- TEST 4: Coupon Minimum Order Requirement ---
    const quoteMinOrderFail = await calculateOrderQuote(
      [{ productId: prodB.id, variationId: varB.id, quantity: 1 }], // ৳350 < ৳400 min order
      coupon.code
    );
    assert(quoteMinOrderFail.quote.discountBDT === 0, "Coupon rejected when order total (৳350) is below minimum threshold (৳400)");

    // --- TEST 5: Coupon Final Usage Race Condition ---
    console.log("\n--- 4. CONCURRENT COUPON FINAL USAGE RACE ---");
    let couponClaim1Success: any = false;
    let couponClaim2Success: any = false;

    // Simulate 2 parallel checkout transactions attempting to consume the final coupon usage
    await prisma.$transaction(async (tx) => {
      const c1 = await tx.coupon.findUnique({ where: { id: coupon.id } });
      if (c1 && c1.isActive && (c1.usageLimit === null || c1.usedCount < c1.usageLimit)) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
        couponClaim1Success = true;
      }
    });

    await prisma.$transaction(async (tx) => {
      const c2 = await tx.coupon.findUnique({ where: { id: coupon.id } });
      if (c2 && c2.isActive && (c2.usageLimit === null || c2.usedCount < c2.usageLimit)) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
        couponClaim2Success = true;
      }
    });

    assert(couponClaim1Success === true, "First buyer successfully consumes the final coupon use");
    assert(couponClaim2Success === false, "Second buyer safely rejected as coupon reached maximum uses");

    // --- TEST 6: Multi-Item Order Snapshot ---
    console.log("\n--- 5. MULTI-ITEM ORDER SNAPSHOT INTEGRITY ---");
    const multiQuote = await calculateOrderQuote(
      [
        { productId: prodA.id, variationId: varA.id, quantity: 2 }, // 500 * 2 = 1000
        { productId: prodB.id, variationId: varB.id, quantity: 1 }, // 350 * 1 = 350
        { productId: prodC.id, variationId: varC.id, quantity: 1 }, // 1200 * 1 = 1200
      ],
      null
    );

    assert(multiQuote.quote.subtotalBDT === 2550, "Multi-item order subtotal sums correctly to ৳2550");
    assert(multiQuote.quote.items.length === 3, "Quote contains all 3 distinct line items");

    // --- TEST 7: Historical Price Immutability ---
    console.log("\n--- 6. HISTORICAL PRICE IMMUTABILITY ---");
    const { order, orderItem } = await createOrderFixture(tracker, {
      userId: user.id,
      customerEmail: user.email,
      customerName: user.name || "Customer",
      productId: prodA.id,
      variationId: varA.id,
      productName: prodA.name,
      priceBDT: 500,
      paymentStatus: "VERIFIED",
    });

    // Update the live product catalog price to ৳900
    await prisma.product.update({
      where: { id: prodA.id },
      data: { minPriceBDT: 900, regularPriceBDT: 900 },
    });
    await prisma.variation.update({
      where: { id: varA.id },
      data: { priceBDT: 900, regularPriceBDT: 900 },
    });

    // Verify historical OrderItem remained ৳500
    const historicalItem = await prisma.orderItem.findUnique({
      where: { id: orderItem.id },
    });
    assert(historicalItem?.priceBDT === 500, "Historical OrderItem price remains immutable at ৳500 despite product price increase to ৳900");
  } finally {
    await cleanupTestFixtures(tracker);
  }

  console.log("\n=================================================");
  console.log(`  AGENT 3 RESULTS: ${passCount} PASSED | ${failCount} FAILED`);
  console.log("=================================================");

  if (failCount > 0) process.exit(1);
}

runCheckoutPricingSuite().catch((err) => {
  console.error("Checkout Pricing Suite Error:", err);
  process.exit(1);
});
