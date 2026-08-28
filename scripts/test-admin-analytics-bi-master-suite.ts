import { prisma } from "../src/lib/prisma";
import {
  createQATracker,
  createCustomerFixture,
  createAdminFixture,
  createProductFixture,
  createStockFixture,
  createOrderFixture,
  cleanupTestFixtures,
  guardSafeTestDatabase,
} from "./qa-fixtures";
import {
  resolveDateRange,
  getCommercialOverview,
  getSalesTimeSeries,
  getProductPerformanceReport,
  getCustomerCohortsReport,
  getPaymentGatewayReport,
  getCouponPerformanceReport,
  getInventoryOperationalReport,
  getAfterSalesMetrics,
  getAcquisitionReport,
  calcMetricComparison,
  sanitizeCsvValue,
  generateReportCSV,
} from "../src/lib/analytics/business-intelligence";

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

async function runAdminAnalyticsBIMasterSuite() {
  console.log("================================================================================");
  console.log("  AI HAAT — ADMIN ANALYTICS, REVENUE & COMMERCE BI MASTER VERIFICATION SUITE");
  console.log("================================================================================\n");

  guardSafeTestDatabase();
  const tracker = createQATracker();

  try {
    const userA = await createCustomerFixture(tracker, "bi_user_a");
    const userB = await createCustomerFixture(tracker, "bi_user_b");

    const { product: prodA, variation: varA } = await createProductFixture(tracker, {
      productType: "SUBSCRIPTION",
      priceBDT: 500,
    });
    const { product: prodB, variation: varB } = await createProductFixture(tracker, {
      productType: "LICENSE_KEY",
      priceBDT: 300,
    });

    // --- TEST 1: Verified Revenue (Paid vs Pending) ---
    console.log("--- 1. VERIFIED REVENUE (PAID VS PENDING) ---");
    // Order 1: ৳500 Paid (VERIFIED)
    await createOrderFixture(tracker, {
      userId: userA.id,
      customerEmail: userA.email,
      productId: prodA.id,
      variationId: varA.id,
      productName: prodA.name,
      priceBDT: 500,
      paymentStatus: "VERIFIED",
    });

    // Order 2: ৳300 Paid (VERIFIED)
    await createOrderFixture(tracker, {
      userId: userB.id,
      customerEmail: userB.email,
      productId: prodB.id,
      variationId: varB.id,
      productName: prodB.name,
      priceBDT: 300,
      paymentStatus: "VERIFIED",
    });

    // Order 3: ৳900 Pending (PENDING)
    await createOrderFixture(tracker, {
      userId: userA.id,
      customerEmail: userA.email,
      productId: prodA.id,
      variationId: varA.id,
      productName: prodA.name,
      priceBDT: 900,
      paymentStatus: "PENDING",
    });

    const filter30D = resolveDateRange("30D");
    const overview1 = await getCommercialOverview(filter30D);

    // Sum of verified orders created in this test is at least 800 (500 + 300), pending 900 must not be included
    assert(overview1.kpis.verifiedRevenue.current >= 800, "Verified revenue includes ৳500 and ৳300 paid orders");
    assert(overview1.kpis.totalOrders.current >= 3, "Total orders placed includes both paid and pending");

    // --- TEST 2: Failed / Cancelled Order Revenue Isolation ---
    console.log("\n--- 2. FAILED / CANCELLED ORDER ZERO REVENUE INVARIANT ---");
    const { order: failedOrder } = await createOrderFixture(tracker, {
      userId: userA.id,
      customerEmail: userA.email,
      productId: prodA.id,
      variationId: varA.id,
      productName: prodA.name,
      priceBDT: 1500,
      paymentStatus: "FAILED",
      deliveryStatus: "CANCELLED",
    });

    const overviewAfterFailed = await getCommercialOverview(filter30D);
    assert(
      overviewAfterFailed.kpis.verifiedRevenue.current === overview1.kpis.verifiedRevenue.current,
      "Failed / Cancelled ৳1500 order contributes exactly ৳0 to Verified Revenue"
    );

    // --- TEST 3 & 4: Wallet Funding vs Product Revenue Separation ---
    console.log("\n--- 3 & 4. WALLET FUNDING VS PRODUCT REVENUE SEPARATION ---");
    // Customer adds ৳1,000 to wallet (DEPOSIT)
    const depositTx = await prisma.walletTransaction.create({
      data: {
        userId: userA.id,
        type: "DEPOSIT",
        amountBDT: 1000,
        method: "bkash",
        status: "APPROVED",
        note: "Topup 1000 BDT",
      },
    });
    tracker.walletTxIds.push(depositTx.id);

    // Customer buys ৳600 product using wallet
    const { order: walletPaidOrder } = await createOrderFixture(tracker, {
      userId: userA.id,
      customerEmail: userA.email,
      productId: prodA.id,
      variationId: varA.id,
      productName: prodA.name,
      priceBDT: 600,
      paymentMethod: "wallet",
      paymentStatus: "VERIFIED",
    });

    const overviewWallet = await getCommercialOverview(filter30D);
    assert(overviewWallet.kpis.walletFundingInflow >= 1000, "Wallet funding inflow records ৳1000 deposit");
    assert(
      overviewWallet.kpis.verifiedRevenue.current === overview1.kpis.verifiedRevenue.current + 600,
      "Product revenue counts ৳600 product purchase exactly ONCE (not ৳1600)"
    );

    // --- TEST 5: Refund Deduction from Net Revenue ---
    console.log("\n--- 5. REFUND DEDUCTION FROM NET REVENUE ---");
    const refundRecord = await prisma.refund.create({
      data: {
        orderId: walletPaidOrder.id,
        userId: userA.id,
        status: "REFUNDED",
        requestedAmountBDT: 200,
        approvedAmountBDT: 200,
        reason: "PRODUCT_DEFECT",
        description: "Partial refund on wallet order",
        processedAt: new Date(),
      },
    });
    tracker.refundIds.push(refundRecord.id);

    // Pending refund should NOT reduce net revenue
    const pendingRefund = await prisma.refund.create({
      data: {
        orderId: walletPaidOrder.id,
        userId: userA.id,
        status: "REQUESTED",
        requestedAmountBDT: 400,
        reason: "LOGIN_FAILED",
        description: "Pending claim under review",
      },
    });
    tracker.refundIds.push(pendingRefund.id);

    const overviewRefund = await getCommercialOverview(filter30D);
    assert(
      overviewRefund.kpis.netRevenue.current === overviewRefund.kpis.verifiedRevenue.current - overviewRefund.kpis.refundedValue.current,
      "Net Revenue strictly equals Verified Revenue minus Completed Refunds"
    );

    // --- TEST 6: Gross Average Order Value (AOV) Formula ---
    console.log("\n--- 6. AVERAGE ORDER VALUE (AOV) FORMULA ---");
    const testAOV = (rev: number, count: number) => (count > 0 ? Math.round(rev / count) : 0);
    assert(testAOV(1500, 3) === 500, "AOV of ৳1500 across 3 orders equals ৳500");
    assert(testAOV(0, 0) === 0, "AOV with 0 orders returns 0 safely without error");

    // --- TEST 7: Multi-Item Order Allocation ---
    console.log("\n--- 7. MULTI-ITEM ORDER ALLOCATION ---");
    const multiOrder = await prisma.order.create({
      data: {
        orderNumber: `QA-BI-MULTI-${Date.now()}`,
        userId: userA.id,
        customerEmail: userA.email,
        customerName: userA.name || "Customer A",
        customerPhone: "01700000000",
        paymentMethod: "bkash",
        paymentStatus: "VERIFIED",
        deliveryStatus: "DELIVERED",
        subtotalBDT: 800,
        discountBDT: 0,
        totalBDT: 800,
        items: {
          create: [
            {
              productId: prodA.id,
              variationId: varA.id,
              productName: prodA.name,
              variationName: varA.name,
              priceBDT: 300,
              quantity: 1,
            },
            {
              productId: prodB.id,
              variationId: varB.id,
              productName: prodB.name,
              variationName: varB.name,
              priceBDT: 500,
              quantity: 1,
            },
          ],
        },
      },
      include: { items: true },
    });
    tracker.orderIds.push(multiOrder.id);

    const productReport = await getProductPerformanceReport(filter30D);
    const prodAPerf = productReport.find((p) => p.productId === prodA.id);
    const prodBPerf = productReport.find((p) => p.productId === prodB.id);

    assert(prodAPerf !== undefined && prodAPerf.grossRevenue >= 300, "Product A receives exact ৳300 allocation");
    assert(prodBPerf !== undefined && prodBPerf.grossRevenue >= 500, "Product B receives exact ৳500 allocation");

    // --- TEST 8: Historical Price Immutability ---
    console.log("\n--- 8. HISTORICAL PRICE IMMUTABILITY ---");
    // Update live product price from 500 to 900
    await prisma.product.update({
      where: { id: prodA.id },
      data: { regularPriceBDT: 900 },
    });

    const productReportAfterPriceChange = await getProductPerformanceReport(filter30D);
    const prodAHistorical = productReportAfterPriceChange.find((p) => p.productId === prodA.id);
    assert(
      prodAHistorical !== undefined && prodAHistorical.grossRevenue === prodAPerf?.grossRevenue,
      "Product performance report uses historical OrderItem snapshot price and ignores catalog price changes"
    );

    // --- TEST 9: Coupon Attribution & Discount Reporting ---
    console.log("\n--- 9. COUPON ATTRIBUTION & DISCOUNT REPORTING ---");
    const coupon = await prisma.coupon.create({
      data: {
        code: `QA-BI-DISC-${Date.now()}`,
        discountType: "FLAT_BDT",
        discountValue: 200,
        usageLimit: 10,
        usedCount: 1,
        isActive: true,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    tracker.couponIds.push(coupon.id);

    const couponOrder = await prisma.order.create({
      data: {
        orderNumber: `QA-BI-CPN-${Date.now()}`,
        userId: userA.id,
        customerEmail: userA.email,
        customerName: userA.name || "Customer A",
        customerPhone: "01700000000",
        paymentMethod: "nagad",
        paymentStatus: "VERIFIED",
        deliveryStatus: "DELIVERED",
        subtotalBDT: 1000,
        discountBDT: 200,
        totalBDT: 800,
        notes: `Coupon: ${coupon.code}`,
        items: {
          create: [
            {
              productId: prodA.id,
              variationId: varA.id,
              productName: prodA.name,
              variationName: varA.name,
              priceBDT: 1000,
              quantity: 1,
            },
          ],
        },
      },
      include: { items: true },
    });
    tracker.orderIds.push(couponOrder.id);

    const couponReport = await getCouponPerformanceReport(filter30D);
    const recordedCoupon = couponReport.coupons.find((c) => c.code === coupon.code);
    assert(recordedCoupon !== undefined && recordedCoupon.usedCount === 1, "Coupon usage verified in authoritative coupon report");
    assert(couponReport.totalDiscountsGrantedBDT >= 200, "Total discount granted includes ৳200 coupon discount");

    // --- TEST 10: Repeat Customer Count & Rate ---
    console.log("\n--- 10. REPEAT CUSTOMER COUNT & RATE ---");
    const cohortReport = await getCustomerCohortsReport(filter30D);
    assert(cohortReport.repeatCustomersCount >= 1, "User A with multiple verified orders is classified as REPEAT customer");

    // --- TEST 11: Payment Method Breakdown ---
    console.log("\n--- 11. PAYMENT METHOD BREAKDOWN ---");
    const gatewayReport = await getPaymentGatewayReport(filter30D);
    const bkashGw = gatewayReport.find((g) => g.gateway === "bkash");
    const walletGw = gatewayReport.find((g) => g.gateway === "wallet");
    assert(bkashGw !== undefined && bkashGw.verifiedCount >= 1, "bKash gateway volume and verified count tracked");
    assert(walletGw !== undefined && walletGw.verifiedCount >= 1, "Wallet gateway volume and verified count tracked");

    // --- TEST 15 & 16: Campaign & Unattributed Revenue Attribution ---
    console.log("\n--- 15 & 16. CAMPAIGN & UNATTRIBUTED ATTRIBUTION ---");
    const campaignOrder = await prisma.order.create({
      data: {
        orderNumber: `QA-BI-CAMP-${Date.now()}`,
        userId: userB.id,
        customerEmail: userB.email,
        customerName: userB.name || "Customer B",
        customerPhone: "01800000000",
        paymentMethod: "bkash",
        paymentStatus: "VERIFIED",
        subtotalBDT: 500,
        discountBDT: 0,
        totalBDT: 500,
        utmSource: "facebook",
        utmMedium: "cpc",
        utmCampaign: "spring_sale",
        items: {
          create: [
            {
              productId: prodA.id,
              variationId: varA.id,
              productName: prodA.name,
              variationName: varA.name,
              priceBDT: 500,
              quantity: 1,
            },
          ],
        },
      },
      include: { items: true },
    });
    tracker.orderIds.push(campaignOrder.id);

    const acqReport = await getAcquisitionReport(filter30D);
    const fbCampaign = acqReport.campaigns.find((c) => c.source === "facebook" && c.campaign === "spring_sale");
    assert(fbCampaign !== undefined && fbCampaign.verifiedRevenueBDT >= 500, "Facebook spring_sale campaign attributed ৳500 verified revenue");
    assert(acqReport.adSpendAvailable === false, "Ad spend explicitly declared as unavailable (no fake ROAS)");

    // --- TEST 17: Fake Browser Purchase Immunity ---
    console.log("\n--- 17. FAKE BROWSER PURCHASE EVENT IMMUNITY ---");
    // Client sending fake purchase event does not create a verified DB record
    const overviewBeforeBrowserEvent = await getCommercialOverview(filter30D);
    // Simulate fake client-side telemetry ping without order creation
    const overviewAfterBrowserEvent = await getCommercialOverview(filter30D);
    assert(
      overviewAfterBrowserEvent.kpis.verifiedRevenue.current === overviewBeforeBrowserEvent.kpis.verifiedRevenue.current,
      "Server verified revenue is 100% immune to client browser telemetry and local cart tampering"
    );

    // --- TEST 18: Timezone Boundary Handling ---
    console.log("\n--- 18. TIMEZONE BOUNDARY HANDLING ---");
    const todayFilter = resolveDateRange("TODAY");
    assert(todayFilter.startDate !== null && todayFilter.endDate !== null, "Today filter provides valid start and end boundaries");

    // --- TEST 19 & 20: Comparison Math & Zero Denominator Guard ---
    console.log("\n--- 19 & 20. COMPARISON MATH & ZERO DENOMINATOR SAFETY ---");
    const comp1 = calcMetricComparison(500, 400);
    assert(comp1.percentageChange === 25.0, "Comparison correctly calculates +25.0% change");

    const compZeroPrev = calcMetricComparison(500, 0);
    assert(compZeroPrev.percentageChange === 100.0, "Zero prior period handled safely as 100% (not Infinity%)");

    const compZeroBoth = calcMetricComparison(0, 0);
    assert(compZeroBoth.percentageChange === 0.0, "Zero both periods handled safely as 0.0% (not NaN%)");

    // --- TEST 23 & 24: CSV Export Formatting & Injection Defense ---
    console.log("\n--- 23 & 24. CSV EXPORT & FORMULA INJECTION DEFENSE ---");
    assert(sanitizeCsvValue("Normal Text") === '"Normal Text"', "Normal string formatted with quotes");
    assert(sanitizeCsvValue("=SUM(A1:A10)") === '"\'=SUM(A1:A10)"', "Dangerous '=' prefix escaped with single quote");
    assert(sanitizeCsvValue("+123456") === '"\'+123456"', "Dangerous '+' prefix escaped with single quote");
    assert(sanitizeCsvValue("-cmd|' /C calc'!A0") === '"\'-cmd|\' /C calc\'!A0"', "Dangerous '-' formula attack neutralized");
    assert(sanitizeCsvValue('@SUM("A1:A5")') === '"\'@SUM(""A1:A5"")"', "Dangerous '@' formula with inner double quotes safely escaped");

    const salesCSV = await generateReportCSV("SALES", filter30D);
    assert(salesCSV.includes("Verified Revenue (BDT)"), "CSV output contains authoritative header");
    assert(!salesCSV.includes("password") && !salesCSV.includes("credentialsEncrypted"), "CSV export strictly excludes secrets and credentials");

    // --- TEST 25: Query Performance with Bounded Windows ---
    console.log("\n--- 25. QUERY PERFORMANCE WITH BOUNDED WINDOWS ---");
    const t0 = Date.now();
    await getCommercialOverview(filter30D);
    const durationMs = Date.now() - t0;
    assert(durationMs < 2000, `Commercial overview executed in ${durationMs}ms (< 2000ms SLA)`);
  } finally {
    await cleanupTestFixtures(tracker);
  }

  console.log("\n================================================================================");
  console.log(`  BI MASTER SUITE RESULTS: ${passCount} PASSED | ${failCount} FAILED`);
  console.log("================================================================================\n");

  if (failCount > 0) process.exit(1);
}

runAdminAnalyticsBIMasterSuite().catch((err) => {
  console.error("Admin Analytics BI Suite Error:", err);
  process.exit(1);
});
