import { prisma } from "../src/lib/prisma";
import {
  captureAbandonedCart,
  getCartByRecoveryToken,
  markCartRecovered,
  markCartConverted,
  markCartCleared,
  getEligibleAbandonedCarts,
  processAbandonedCartStage,
  getLocalAbandonedCarts,
  saveLocalAbandonedCarts,
} from "../src/lib/commerce/abandoned-cart";
import {
  processPostDeliveryReviewRequests,
  submitQuickRating,
  findReviewRequestByToken,
  getLocalReviewRequests,
  saveLocalReviewRequests,
} from "../src/lib/commerce/reviews-retention";
import { runInventoryExpiryCheck } from "../src/lib/commerce/inventory";
import { getAllReviews } from "../src/lib/reviews-db";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failedCount++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log("  🚀 AI HAAT - CUSTOMER ENGAGEMENT, ABANDONED CART & LIFECYCLE TEST SUITE");
  console.log("================================================================================\n");

  const timestamp = Date.now();
  const testEmail1 = `test_abandon_${timestamp}@aihaat.shop`;
  const testEmail2 = `test_suppressed_${timestamp}@aihaat.shop`;
  const testEmail3 = `test_converted_${timestamp}@aihaat.shop`;
  const testEmail4 = `test_review_${timestamp}@aihaat.shop`;

  // Backup existing data
  const initialCarts = getLocalAbandonedCarts();
  const initialReviewReqs = getLocalReviewRequests();

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 1: ABANDONED CART CAPTURE, TOKEN GENERATION & RECOVERY
    // ─────────────────────────────────────────────────────────────────────────
    console.log("🔹 [TEST GROUP 1] Abandoned Cart Capture & 1-Click Restoration Engine");

    const cart1 = await captureAbandonedCart({
      email: testEmail1,
      phone: "01711000001",
      name: "Engaged Customer",
      items: [
        {
          productId: "chatgpt-plus",
          productName: "ChatGPT Plus (Shared)",
          variationId: "var-gpt-1m",
          variationName: "1 Month Shared",
          priceBDT: 450,
          quantity: 1,
        },
        {
          productId: "canva-pro",
          productName: "Canva Pro (1 Year)",
          variationId: "var-canva-1y",
          variationName: "1 Year Edu",
          priceBDT: 300,
          quantity: 2,
        },
      ],
      subtotalBDT: 1050,
    });

    assert(cart1 !== null, "Cart 1 successfully captured in persistent store");
    assert(typeof cart1?.recoveryToken === "string" && cart1.recoveryToken.startsWith("rec_"), "Valid cryptographic recovery token generated");
    assert(cart1?.items.length === 2, "Items preserved accurately in abandoned cart");
    assert(cart1?.subtotalBDT === 1050, "Subtotal calculated correctly (1050 BDT)");
    assert(cart1?.status === "ACTIVE", "Initial status is ACTIVE");

    // 1-Click Token Lookup
    const recoveredLookup = await getCartByRecoveryToken(cart1!.recoveryToken);
    assert(recoveredLookup !== null && recoveredLookup.id === cart1!.id, "Direct token lookup retrieves correct cart");

    // Mark Recovered
    const markedRecovered = await markCartRecovered(cart1!.recoveryToken);
    assert(markedRecovered?.status === "RECOVERED" && Boolean(markedRecovered.recoveredAt), "Cart marked as RECOVERED upon customer restoration");

    // Re-activate cart for stage progression tests
    const activeCart = await captureAbandonedCart({
      email: testEmail1,
      items: [{ productId: "chatgpt-plus", productName: "ChatGPT Plus", priceBDT: 450, quantity: 1 }],
      subtotalBDT: 450,
    });
    assert(activeCart?.status === "ACTIVE", "Re-activated cart for 2-stage lifecycle simulation");

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 2: 2-STAGE RECOVERY SCHEDULE SIMULATION (1h & 24h)
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n🔹 [TEST GROUP 2] 2-Stage Automated Recovery Schedule & 5% Discount");

    // Test Eligibility at T = 0 (Immediate - Should NOT be eligible for Stage 1)
    const eligibleImmediate = getEligibleAbandonedCarts(1, new Date());
    const isCart1EligibleImmediate = eligibleImmediate.some((c) => c.customerEmail === testEmail1);
    assert(!isCart1EligibleImmediate, "Cart is NOT eligible for Stage 1 immediately (< 1 hour)");

    // Simulate T = +1.5 Hours (Should be eligible for Stage 1)
    const simulatedTPlus1Point5H = new Date(Date.now() + 90 * 60 * 1000);
    const eligibleStage1 = getEligibleAbandonedCarts(1, simulatedTPlus1Point5H);
    const isCart1EligibleStage1 = eligibleStage1.some((c) => c.customerEmail === testEmail1);
    assert(isCart1EligibleStage1, "Cart IS eligible for Stage 1 after 1.5 hours");

    // Execute Stage 1 Process
    const stage1Result = await processAbandonedCartStage(1, "https://aihaat.shop", simulatedTPlus1Point5H);
    assert(stage1Result.sent >= 1, `Stage 1 email dispatched (Sent: ${stage1Result.sent})`);

    // Verify stage1SentAt timestamp updated
    const updatedCartsAfterS1 = getLocalAbandonedCarts();
    const cartAfterS1 = updatedCartsAfterS1.find((c) => c.customerEmail === testEmail1);
    assert(Boolean(cartAfterS1?.stage1SentAt), "stage1SentAt timestamp recorded in persistent store");

    // Simulate T = +25 Hours (Should be eligible for Stage 2 with 5% discount incentive)
    const simulatedTPlus25H = new Date(Date.now() + 25 * 60 * 60 * 1000);
    const eligibleStage2 = getEligibleAbandonedCarts(2, simulatedTPlus25H);
    const isCart1EligibleStage2 = eligibleStage2.some((c) => c.customerEmail === testEmail1);
    assert(isCart1EligibleStage2, "Cart IS eligible for Stage 2 after 25 hours");

    // Execute Stage 2 Process
    const stage2Result = await processAbandonedCartStage(2, "https://aihaat.shop", simulatedTPlus25H);
    assert(stage2Result.sent >= 1, `Stage 2 email with 5% coupon dispatched (Sent: ${stage2Result.sent})`);

    const updatedCartsAfterS2 = getLocalAbandonedCarts();
    const cartAfterS2 = updatedCartsAfterS2.find((c) => c.customerEmail === testEmail1);
    assert(Boolean(cartAfterS2?.stage2SentAt), "stage2SentAt timestamp recorded in persistent store");

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 3: CART CONVERTED, CLEARED & EMAIL SUPPRESSION GUARDS
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n🔹 [TEST GROUP 3] Conversion, Clear & Email Suppression Guards");

    // Create Cart for Conversion Guard Test
    const convertCart = await captureAbandonedCart({
      email: testEmail3,
      items: [{ productId: "midjourney-pro", productName: "Midjourney Pro", priceBDT: 800, quantity: 1 }],
      subtotalBDT: 800,
    });
    assert(convertCart !== null, "Created cart for conversion test");

    // Simulate Order Conversion
    await markCartConverted(testEmail3, "ORD-TEST-999");
    const convertedCartRecord = getLocalAbandonedCarts().find((c) => c.customerEmail === testEmail3);
    assert(convertedCartRecord?.status === "CONVERTED" && convertedCartRecord?.orderId === "ORD-TEST-999", "Cart status successfully transitioned to CONVERTED with orderId");

    // Verify Converted cart is skipped from future recovery runs
    const eligibleConverted = getEligibleAbandonedCarts(1, simulatedTPlus1Point5H);
    assert(!eligibleConverted.some((c) => c.customerEmail === testEmail3), "CONVERTED cart is suppressed from recovery dispatch");

    // Test Cart Clear Guard
    const clearCartItem = await captureAbandonedCart({
      email: `clear_${timestamp}@aihaat.shop`,
      items: [{ productId: "claude-pro", productName: "Claude Pro", priceBDT: 600, quantity: 1 }],
    });
    await markCartCleared(clearCartItem!.recoveryToken);
    const clearedCartRecord = getLocalAbandonedCarts().find((c) => c.id === clearCartItem!.id);
    assert(clearedCartRecord?.status === "CLEARED", "Cart marked as CLEARED when cart is emptied");

    // Test Suppression List Guard
    await prisma.emailSuppression.create({
      data: {
        email: testEmail2,
        reason: "UNSUBSCRIBED",
        source: "USER_CLICK",
      },
    });

    const suppressedCart = await captureAbandonedCart({
      email: testEmail2,
      items: [{ productId: "netflix-uhd", productName: "Netflix 4K UHD", priceBDT: 350, quantity: 1 }],
      subtotalBDT: 350,
    });

    // Execute Stage 1 with suppressed user
    const suppressedStage1Result = await processAbandonedCartStage(1, "https://aihaat.shop", simulatedTPlus1Point5H);
    assert(suppressedStage1Result.skippedSuppressed >= 1, "Suppressed user cart was successfully detected and skipped from email dispatch");

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 4: POST-DELIVERY REVIEW COLLECTION & 1-CLICK RATING ENGINE
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n🔹 [TEST GROUP 4] Post-Delivery Review Collection & 1-Click Rating");

    // 1. Create Delivered Order 30 hours in the past
    const deliveredOrder = await prisma.order.create({
      data: {
        id: `TEST-DELIV-ORD-${timestamp}`,
        orderNumber: `TEST-DELIV-ORD-${timestamp}`,
        customerName: "Review Test Customer",
        customerEmail: testEmail4,
        customerPhone: "01700000088",
        subtotalBDT: 700,
        totalBDT: 700,
        paymentMethod: "bKash",
        paymentStatus: "VERIFIED",
        deliveryStatus: "DELIVERED",
        updatedAt: new Date(Date.now() - 30 * 60 * 60 * 1000), // 30 hours ago
        items: {
          create: {
            productId: "p-chatgpt-plus",
            productName: "ChatGPT Plus Subscription",
            variationName: "1 Month Shared",
            priceBDT: 700,
            quantity: 1,
          },
        },
      },
    });

    assert(Boolean(deliveredOrder.id), "Created delivered test order (30h past delivery)");

    // 2. Scan & Process Review Requests
    const reviewResult = await processPostDeliveryReviewRequests("https://aihaat.shop", new Date());
    assert(reviewResult.sent >= 1, `Review request email dispatched (Sent: ${reviewResult.sent})`);

    // 3. Verify Review Request Record and Token
    const reviewRequests = getLocalReviewRequests();
    const createdReq = reviewRequests.find((r) => r.orderId === deliveredOrder.id || r.customerEmail === testEmail4);
    assert(createdReq !== undefined, "Review request record stored in local store with token");
    assert(createdReq?.token.startsWith("rev_") === true, "Secure review token generated");

    // 4. Submit 1-Click Quick Rating (5 Stars)
    const ratingSubmission = await submitQuickRating(
      createdReq!.token,
      5,
      "AI Haat এর সার্ভিস অত্যন্ত চমৎকার এবং ডেলিভারি সুপার ফাস্ট!"
    );

    assert(ratingSubmission.success === true, "1-Click rating submitted successfully");
    assert(ratingSubmission.review?.rating === 5, "Rating recorded as 5 stars");
    assert(ratingSubmission.review?.isVerifiedPurchase === true, "Verified Buyer Badge (isVerifiedPurchase: true) automatically attached!");
    assert(ratingSubmission.review?.status === "APPROVED", "Review status automatically APPROVED for verified buyer");

    // Verify Review in Reviews DB
    const allApproved = await getAllReviews({ status: "APPROVED", limit: 20 });
    const foundApproved = allApproved.find((r) => r.id === ratingSubmission.review?.id);
    assert(foundApproved !== undefined, "Verified review visible in approved reviews list");

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 5: PRE-EXPIRY SUBSCRIPTION & WARRANTY RENEWAL REMINDERS
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n🔹 [TEST GROUP 5] Pre-Expiry Subscription Renewal Reminders (3-Day & 1-Day)");

    const expiryTestUser = await prisma.user.create({
      data: {
        id: `test-expiry-user-${timestamp}`,
        email: `expiry_cust_${timestamp}@aihaat.shop`,
        name: "Expiry Cust",
      },
    });

    const expiryTestProduct = await prisma.product.create({
      data: {
        id: `test-exp-prod-${timestamp}`,
        slug: `test-exp-prod-${timestamp}`,
        name: "Claude 3.5 Sonnet Pro",
        category: "AI Tools",
        image: "/images/claude.svg",
        minPriceBDT: 650,
        maxPriceBDT: 650,
        regularPriceBDT: 650,
        shortDesc: "Claude Pro subscription",
        descriptionBangla: "টেস্ট",
        descriptionEnglish: "Test",
        features: JSON.stringify(["Full access"]),
        productType: "SUBSCRIPTION",
        fulfillmentType: "AUTO_STOCK",
        warrantyDays: 30,
      },
    });

    const expiryOrder = await prisma.order.create({
      data: {
        id: `TEST-EXP-ORD-${timestamp}`,
        orderNumber: `TEST-EXP-ORD-${timestamp}`,
        userId: expiryTestUser.id,
        customerName: expiryTestUser.name || "Test Expiry Customer",
        customerEmail: expiryTestUser.email,
        customerPhone: "01722000000",
        subtotalBDT: 650,
        totalBDT: 650,
        paymentMethod: "bKash",
        paymentStatus: "VERIFIED",
        deliveryStatus: "DELIVERED",
      },
    });

    // 1-Day Pre-Expiry DeliveredKey (expires in 20 hours / tomorrow)
    const tomorrowDate = new Date(Date.now() + 20 * 60 * 60 * 1000);
    const expiringKey1Day = await prisma.deliveredKey.create({
      data: {
        id: `test-key-1day-${timestamp}`,
        orderId: expiryOrder.id,
        userId: expiryTestUser.id,
        productName: expiryTestProduct.name,
        accountType: "1 Month - Personal",
        credentials: "user:pass",
        credentialsEncrypted: "encrypted",
        warrantyExpiresAt: tomorrowDate,
        isReplacement: false,
      },
    });

    // Execute runInventoryExpiryCheck
    const expiryReport = await runInventoryExpiryCheck();
    assert(expiryReport.customerExpiringCount >= 1, `Expiring subscriptions detected: ${expiryReport.customerExpiringCount}`);
    assert(expiryReport.customerNotifiedCount >= 1, `Customer pre-expiry notices dispatched: ${expiryReport.customerNotifiedCount}`);
    assert(expiryReport.notified1DayCount >= 1, `1-Day urgent expiry notices dispatched: ${expiryReport.notified1DayCount}`);

    // Verify In-App Notification generated
    const inAppExpiryNotif = await prisma.notification.findFirst({
      where: {
        userId: expiryTestUser.id,
        title: { contains: "জরুরি" },
      },
    });
    assert(inAppExpiryNotif !== null, "1-Day urgent in-app notification successfully created");

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 6: CLEANUP
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n🔹 [CLEANUP] Cleaning up test artifacts...");

    await prisma.notification.deleteMany({ where: { userId: expiryTestUser.id } });
    await prisma.deliveredKey.deleteMany({ where: { id: expiringKey1Day.id } });
    await prisma.order.deleteMany({ where: { id: { in: [expiryOrder.id, deliveredOrder.id] } } });
    await prisma.product.deleteMany({ where: { id: expiryTestProduct.id } });
    await prisma.user.deleteMany({ where: { id: expiryTestUser.id } });
    await prisma.emailSuppression.deleteMany({ where: { email: testEmail2 } });
    await prisma.review.deleteMany({ where: { author: "Review Test Customer" } });

    // Restore original carts & review requests
    saveLocalAbandonedCarts(initialCarts);
    saveLocalReviewRequests(initialReviewReqs);

    console.log("  Cleaned up all test records and restored state.\n");

    console.log("================================================================================");
    console.log(`  🎉 ALL TESTS PASSED! (${passedCount} checks passed, ${failedCount} failed)`);
    console.log("================================================================================\n");
  } catch (error) {
    // Attempt cleanup even on failure
    try {
      await prisma.emailSuppression.deleteMany({ where: { email: testEmail2 } });
      await prisma.order.deleteMany({ where: { customerEmail: { in: [testEmail1, testEmail2, testEmail3, testEmail4] } } });
      saveLocalAbandonedCarts(initialCarts);
      saveLocalReviewRequests(initialReviewReqs);
    } catch {}

    console.error("Test Suite Failed with Error:", error);
    process.exit(1);
  }
}

runTestSuite()
  .catch((err) => {
    console.error("Fatal Test Suite Runner Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
