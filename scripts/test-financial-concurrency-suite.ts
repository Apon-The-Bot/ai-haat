import { prisma } from "../src/lib/prisma";
import { finalizeWalletTopup } from "../src/lib/commerce/wallet-topup";
import { createRefundRequest, reviewRefundRequest } from "../src/lib/commerce/refunds";
import { requestAffiliatePayout, reviewAffiliatePayout } from "../src/lib/commerce/affiliates";

async function runFinancialTests() {
  console.log("=========================================================================");
  console.log("🧪 AI HAAT — PHASE 3 FINANCIAL CONCURRENCY, REFUND & AFFILIATE INTEGRITY SUITE");
  console.log("=========================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  const testSuffix = Date.now().toString();
  const testUserEmailA = `fin_user_a_${testSuffix}@aihaat.shop`;
  const testUserEmailB = `fin_user_b_${testSuffix}@aihaat.shop`;

  // Create isolated test fixtures
  const userA = await prisma.user.create({
    data: {
      email: testUserEmailA,
      name: "Financial Test User A",
      role: "USER",
      walletBalanceBDT: 0,
    },
  });

  const userB = await prisma.user.create({
    data: {
      email: testUserEmailB,
      name: "Financial Test User B",
      role: "USER",
      walletBalanceBDT: 0,
    },
  });

  try {
    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 1: WALLET & MYSQL DATABASE UNIQUE CONSTRAINT (PART A)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("--- 1. WALLET & MYSQL UNIQUE INDEX VERIFICATION ---");

    // Test 1.1: Verify actual MySQL index
    const indexes: any = await prisma.$queryRawUnsafe("SHOW INDEX FROM `wallet_transactions`");
    const trxIdIndexes = indexes.filter((idx: any) => idx.Column_name === "trxId");
    const isUniqueInMySql = trxIdIndexes.some((idx: any) => Number(idx.Non_unique) === 0);
    assert(isUniqueInMySql, "MySQL database table `wallet_transactions` has active UNIQUE index on `trxId`");

    // Test 1.2: Single top-up
    const topupTrx1 = `fin_topup_single_${testSuffix}`;
    const resTopup1 = await finalizeWalletTopup({
      userId: userA.id,
      userEmail: userA.email,
      amountBDT: 300,
      trxId: topupTrx1,
      method: "bkash",
    });
    assert(resTopup1.success && !resTopup1.alreadyProcessed, "Single top-up credits user wallet");

    let freshA = await prisma.user.findUnique({ where: { id: userA.id } });
    assert(freshA?.walletBalanceBDT === 300, "Wallet balance reflects exactly ৳300");

    // Test 1.3: Conflicting metadata for existing trxId
    const resConflict = await finalizeWalletTopup({
      userId: userB.id, // different user!
      userEmail: userB.email,
      amountBDT: 300,
      trxId: topupTrx1,
      method: "bkash",
    });
    assert(!resConflict.success && resConflict.conflict === true, "Reused trxId with mismatched userId is rejected with PAYMENT_IDEMPOTENCY_CONFLICT");

    const resConflictAmount = await finalizeWalletTopup({
      userId: userA.id,
      userEmail: userA.email,
      amountBDT: 9999, // different amount!
      trxId: topupTrx1,
      method: "bkash",
    });
    assert(!resConflictAmount.success && resConflictAmount.conflict === true, "Reused trxId with mismatched amount is rejected with PAYMENT_IDEMPOTENCY_CONFLICT");

    freshA = await prisma.user.findUnique({ where: { id: userA.id } });
    assert(freshA?.walletBalanceBDT === 300, "Wallet balance untouched after conflicting requests");

    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 2: REFUND CONCURRENCY & ATOMIC WALLET CREDITS (PART B)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("\n--- 2. REFUND CONCURRENCY & WALLET ATOMICITY ---");

    // Create an eligible completed order for User A
    const orderA = await prisma.order.create({
      data: {
        orderNumber: `ORD-FIN-${testSuffix}`,
        user: { connect: { id: userA.id } },
        customerName: userA.name || "Test User",
        customerEmail: userA.email,
        customerPhone: "01700000000",
        paymentMethod: "bkash",
        subtotalBDT: 500,
        totalBDT: 500,
        discountBDT: 0,
        refundedBDT: 0,
        paymentStatus: "VERIFIED",
        deliveryStatus: "DELIVERED",
      },
    });

    const itemA = await prisma.orderItem.create({
      data: {
        orderId: orderA.id,
        productName: "Test Software Pro",
        variationName: "1 Month License",
        quantity: 1,
        priceBDT: 500,
        refundedBDT: 0,
      },
    });

    // Test 2.1: Create item-level refund with safe description handling
    const refundReq = await createRefundRequest({
      userId: userA.id,
      orderId: orderA.id,
      orderItemId: itemA.id,
      reason: "Faulty license key",
      description: "   License key does not activate cleanly   ",
      refundMethod: "WALLET",
    });
    assert(Boolean(refundReq.id) && refundReq.requestedAmountBDT === 500, "Item-level refund created with ৳500 requested amount");
    assert(refundReq.description === "License key does not activate cleanly", "Description safely trimmed without crash");

    // Test 2.2: IDOR Prevention: User B cannot claim refund on User A's order/item
    let idorBlocked = false;
    try {
      await createRefundRequest({
        userId: userB.id, // User B attempting User A's order
        orderId: orderA.id,
        orderItemId: itemA.id,
        reason: "IDOR test",
        refundMethod: "WALLET",
      });
    } catch (e: any) {
      idorBlocked = true;
    }
    assert(idorBlocked, "IDOR check blocks User B from requesting refund on User A's order");

    // Test 2.3: Approve Refund
    const approvedRefund = await reviewRefundRequest({
      refundId: refundReq.id,
      adminEmail: "admin@aihaat.shop",
      action: "APPROVE",
      approvedAmount: 500,
    });
    assert(approvedRefund.success && approvedRefund.status === "APPROVED", "Admin approves refund for ৳500");

    // Test 2.4: Concurrent PROCESS_WALLET race condition (Simultaneous 10 requests)
    const refundBurstPromises = Array.from({ length: 10 }, () =>
      reviewRefundRequest({
        refundId: refundReq.id,
        adminEmail: "admin@aihaat.shop",
        action: "PROCESS_WALLET",
      }).catch((e) => ({ success: false, error: e.message }))
    );

    const burstResults = await Promise.all(refundBurstPromises);
    const successfulClaims = burstResults.filter((r) => r.success).length;
    assert(successfulClaims === 1, "Exactly ONE admin/system worker succeeds in claiming and crediting refund");

    // Verify User A wallet balance: 300 (topup) + 500 (refund) = exactly 800
    freshA = await prisma.user.findUnique({ where: { id: userA.id } });
    assert(freshA?.walletBalanceBDT === 800, "User wallet balance incremented by exactly ৳500 (Total: ৳800, No duplicate credit)");

    // Verify exactly 1 WalletTransaction created for this refund
    const refundWalletTxs = await prisma.walletTransaction.findMany({
      where: { userId: userA.id, trxId: `REFUND_${refundReq.id}` },
    });
    assert(refundWalletTxs.length === 1, "Exactly ONE WalletTransaction row linked to refund (trxId: REFUND_<id>)");

    // Test 2.5: Subsequent sequential retry returns rejection
    let retryBlocked = false;
    try {
      await reviewRefundRequest({
        refundId: refundReq.id,
        adminEmail: "admin@aihaat.shop",
        action: "PROCESS_WALLET",
      });
    } catch {
      retryBlocked = true;
    }
    assert(retryBlocked, "Sequential subsequent refund process attempt is safely rejected");

    // ════════════════════════════════════════════════════════════════════════════
    // SECTION 3: AFFILIATE CONCURRENCY & NEGATIVE BALANCE PREVENTION (PART B)
    // ════════════════════════════════════════════════════════════════════════════
    console.log("\n--- 3. AFFILIATE CONCURRENCY & BALANCE PRESERVATION ---");

    // Create Affiliate Profile for User A with ৳1,000 available balance
    const affProfile = await prisma.affiliateProfile.create({
      data: {
        userId: userA.id,
        referralCode: `TESTAFF${testSuffix.slice(-4)}`,
        earningsBalanceBDT: 1000,
        totalEarnedBDT: 1000,
        tier: "BRONZE",
        status: "ACTIVE",
      },
    });

    // Test 3.1: 2 Concurrent Payout Requests of ৳800 each (Total ৳1600 > ৳1000 balance)
    const [payoutReq1, payoutReq2] = await Promise.allSettled([
      requestAffiliatePayout(userA.id, {
        amountBDT: 800,
        payoutMethod: "WALLET",
      }),
      requestAffiliatePayout(userA.id, {
        amountBDT: 800,
        payoutMethod: "WALLET",
      }),
    ]);

    const req1Success = payoutReq1.status === "fulfilled";
    const req2Success = payoutReq2.status === "fulfilled";
    assert(
      (req1Success && !req2Success) || (!req1Success && req2Success),
      "Only ONE of two concurrent ৳800 payout requests succeeds against ৳1000 balance"
    );

    let freshProfile = await prisma.affiliateProfile.findUnique({ where: { id: affProfile.id } });
    assert(freshProfile?.earningsBalanceBDT === 200, "Affiliate balance decremented to exactly ৳200 (Never negative!)");

    // Test 3.2: 10 Concurrent Payout Requests of ৳500 each against ৳200 balance (All should fail)
    const payoutBurst = await Promise.allSettled(
      Array.from({ length: 10 }, () =>
        requestAffiliatePayout(userA.id, {
          amountBDT: 500,
          payoutMethod: "WALLET",
        })
      )
    );
    const burstSuccessCount = payoutBurst.filter((r) => r.status === "fulfilled").length;
    assert(burstSuccessCount === 0, "10 concurrent requests of ৳500 against ৳200 balance all safely rejected");

    freshProfile = await prisma.affiliateProfile.findUnique({ where: { id: affProfile.id } });
    assert(freshProfile?.earningsBalanceBDT === 200, "Affiliate balance remains strictly ৳200");

    // Find the successful payout request from Test 3.1
    const successfulPayout = req1Success ? (payoutReq1 as PromiseFulfilledResult<any>).value : (payoutReq2 as PromiseFulfilledResult<any>).value;

    // Test 3.3: Concurrent Approval of the same payout request (Simultaneous APPROVE_WALLET)
    const approveBurst = await Promise.all(
      Array.from({ length: 10 }, () =>
        reviewAffiliatePayout({
          payoutId: successfulPayout.id,
          adminEmail: "admin@aihaat.shop",
          action: "APPROVE_WALLET",
        }).catch((e) => ({ success: false, error: e.message }))
      )
    );

    const approveSuccessCount = approveBurst.filter((r) => r.success).length;
    assert(approveSuccessCount === 1, "Exactly ONE admin approval wins the payout race");

    // User A wallet balance: 800 + 800 (payout) = exactly 1600
    freshA = await prisma.user.findUnique({ where: { id: userA.id } });
    assert(freshA?.walletBalanceBDT === 1600, "User wallet balance credited exactly ৳800 from affiliate payout (Total: ৳1600)");

    // Test 3.4: Payout Rejection restores reserved balance
    // Give profile ৳500 and create a payout request to reject
    await prisma.affiliateProfile.update({
      where: { id: affProfile.id },
      data: { earningsBalanceBDT: { increment: 500 } },
    });

    const rejectablePayout = await requestAffiliatePayout(userA.id, {
      amountBDT: 500,
      payoutMethod: "BKASH",
      payoutPhone: "01711111111",
    });

    freshProfile = await prisma.affiliateProfile.findUnique({ where: { id: affProfile.id } });
    assert(freshProfile?.earningsBalanceBDT === 200, "Balance reduced by ৳500 upon payout request");

    // Reject payout
    const rejectRes = await reviewAffiliatePayout({
      payoutId: rejectablePayout.id,
      adminEmail: "admin@aihaat.shop",
      action: "REJECT",
      adminNotes: "Incorrect bKash number",
    });
    assert(rejectRes.success && rejectRes.status === "REJECTED", "Admin rejects payout request");

    freshProfile = await prisma.affiliateProfile.findUnique({ where: { id: affProfile.id } });
    assert(freshProfile?.earningsBalanceBDT === 700, "Rejected payout restores ৳500 back to earningsBalanceBDT (Total: ৳700)");
  } finally {
    // Clean up test fixtures strictly
    await prisma.affiliatePayoutRequest.deleteMany({ where: { userId: userA.id } }).catch(() => {});
    await prisma.affiliateProfile.deleteMany({ where: { userId: userA.id } }).catch(() => {});
    await prisma.refund.deleteMany({ where: { userId: userA.id } }).catch(() => {});
    await prisma.orderItem.deleteMany({ where: { order: { userId: userA.id } } }).catch(() => {});
    await prisma.orderTimelineEvent.deleteMany({ where: { order: { userId: userA.id } } }).catch(() => {});
    await prisma.order.deleteMany({ where: { userId: userA.id } }).catch(() => {});
    await prisma.walletTransaction.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } }).catch(() => {});
    await prisma.notification.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } }).catch(() => {});
    await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } }).catch(() => {});
  }

  console.log("\n=========================================================================");
  console.log(`📊 PHASE 3 FINANCIAL TEST RESULTS: ${passed} PASSED | ${failed} FAILED (Total: ${passed + failed})`);
  console.log("=========================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runFinancialTests().finally(() => prisma.$disconnect());
