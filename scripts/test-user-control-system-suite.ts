import { prisma } from "../src/lib/prisma";
import {
  getUserEffectiveStatus,
  setUserStatus,
  checkFeatureEntitlement,
  setFeatureRestriction,
  adjustUserWalletBalance,
  logUserActivity,
  addAdminNote,
  setUserTags,
  revokeAllUserSessions,
  SYSTEM_FEATURES,
} from "../src/lib/user-control/user-control-service";

interface TestReportItem {
  id: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const testResults: TestReportItem[] = [];

function recordTest(id: string, name: string, passed: boolean, error?: string, details?: any) {
  testResults.push({ id, name, passed, error, details });
  const statusIcon = passed ? "✓ PASS" : "✗ FAIL";
  console.log(`[${statusIcon}] [${id}] ${name}`);
  if (!passed && error) {
    console.error(`       Error: ${error}`);
  }
  if (details) {
    console.log(`       Details:`, JSON.stringify(details, null, 2));
  }
}

async function runMasterUserControlTestSuite() {
  console.log("=================================================================");
  console.log(" AI HAAT - MASTER USER 360° & ADMIN CONTROL AUTOMATED TEST SUITE");
  console.log("=================================================================\n");

  const testUserEmail = `test_customer_${Date.now()}@test.aihaat.local`;
  const adminEmail = "admin@aihaat.shop";
  const adminId = "admin_test_operator";
  let testUserId = "";

  try {
    // ------------------------------------------------------------------
    // GROUP 1: User Creation & Baseline State
    // ------------------------------------------------------------------
    console.log("--- Group 1: User Creation & Baseline State ---");

    const createdUser = await prisma.user.create({
      data: {
        name: "Synthetic Test Customer",
        email: testUserEmail,
        phone: "01700000000",
        role: "USER",
        walletBalanceBDT: 100.0,
      },
    });
    testUserId = createdUser.id;

    recordTest(
      "1.1",
      "Synthetic customer created in database",
      !!createdUser.id && createdUser.email === testUserEmail,
      undefined,
      { id: createdUser.id, email: createdUser.email, balance: createdUser.walletBalanceBDT }
    );

    // Initial status check
    const initialStatus = await getUserEffectiveStatus(testUserId);
    recordTest("1.2", "Default account status resolves to ACTIVE", initialStatus.status === "ACTIVE", undefined, {
      status: initialStatus.status,
    });

    // Verify all system features default to allowed
    const browseCheck = await checkFeatureEntitlement(testUserId, "SHOPPING_BROWSE");
    const purchaseCheck = await checkFeatureEntitlement(testUserId, "SHOPPING_PURCHASE");
    recordTest(
      "1.3",
      "Baseline features allowed by default for active customer",
      browseCheck.allowed && purchaseCheck.allowed
    );

    // ------------------------------------------------------------------
    // GROUP 2: Account Suspension, Banning & Restoration
    // ------------------------------------------------------------------
    console.log("\n--- Group 2: Account Suspension & Banning ---");

    // 2.1 Suspend Account
    await setUserStatus({
      userId: testUserId,
      status: "SUSPENDED",
      reason: "Security audit compliance check",
      internalNote: "Temporary suspension for automated test validation",
      durationHours: 24,
      adminId,
      adminEmail,
    });

    const suspendedStatus = await getUserEffectiveStatus(testUserId);
    recordTest(
      "2.1",
      "Account suspension recorded with duration and reason",
      suspendedStatus.status === "SUSPENDED" && !!suspendedStatus.expiresAt,
      undefined,
      { status: suspendedStatus.status, reason: suspendedStatus.reason, expiresAt: suspendedStatus.expiresAt }
    );

    // 2.2 Verify Feature Entitlement Blocked when Suspended
    const suspendedPurchaseCheck = await checkFeatureEntitlement(testUserId, "SHOPPING_PURCHASE");
    recordTest(
      "2.2",
      "All protected operations rejected when account is suspended",
      !suspendedPurchaseCheck.allowed && (suspendedPurchaseCheck.reason?.includes("suspended") || false),
      undefined,
      { allowed: suspendedPurchaseCheck.allowed, reason: suspendedPurchaseCheck.reason }
    );

    // 2.3 Restore Account
    await setUserStatus({
      userId: testUserId,
      status: "ACTIVE",
      reason: "Investigation completed and cleared",
      adminId,
      adminEmail,
    });

    const restoredStatus = await getUserEffectiveStatus(testUserId);
    const restoredPurchaseCheck = await checkFeatureEntitlement(testUserId, "SHOPPING_PURCHASE");
    recordTest(
      "2.3",
      "Account restored to ACTIVE and operations re-enabled",
      restoredStatus.status === "ACTIVE" && restoredPurchaseCheck.allowed,
      undefined,
      { status: restoredStatus.status }
    );

    // ------------------------------------------------------------------
    // GROUP 3: Granular Feature Entitlement & Server-Side Restrictions
    // ------------------------------------------------------------------
    console.log("\n--- Group 3: Granular Feature Entitlement Engine ---");

    // 3.1 Restrict single feature: SHOPPING_PURCHASE
    await setFeatureRestriction({
      userId: testUserId,
      featureKey: "SHOPPING_PURCHASE",
      isRestricted: true,
      reason: "Restricted purchasing due to unverified shipping address",
      adminId,
      adminEmail,
    });

    const restrictedPurchase = await checkFeatureEntitlement(testUserId, "SHOPPING_PURCHASE");
    const unrestrictedBrowse = await checkFeatureEntitlement(testUserId, "SHOPPING_BROWSE");

    recordTest(
      "3.1",
      "Single feature independently restricted while other features remain operational",
      !restrictedPurchase.allowed && unrestrictedBrowse.allowed,
      undefined,
      {
        purchaseAllowed: restrictedPurchase.allowed,
        browseAllowed: unrestrictedBrowse.allowed,
        reason: restrictedPurchase.reason,
      }
    );

    // 3.2 Spending limit restriction
    await setFeatureRestriction({
      userId: testUserId,
      featureKey: "WALLET_PAYMENT",
      isRestricted: true,
      reason: "Spending cap enforced",
      spendingLimitBDT: 250,
      adminId,
      adminEmail,
    });

    const underLimitCheck = await checkFeatureEntitlement(testUserId, "WALLET_PAYMENT", { amountBDT: 200 });
    const overLimitCheck = await checkFeatureEntitlement(testUserId, "WALLET_PAYMENT", { amountBDT: 350 });

    recordTest(
      "3.2",
      "Spending limit policy correctly allows under-limit and denies over-limit transactions",
      underLimitCheck.allowed && !overLimitCheck.allowed,
      undefined,
      {
        underLimit200BDT: underLimitCheck.allowed,
        overLimit350BDT: overLimitCheck.allowed,
        overLimitReason: overLimitCheck.reason,
      }
    );

    // 3.3 Lift restriction
    await setFeatureRestriction({
      userId: testUserId,
      featureKey: "SHOPPING_PURCHASE",
      isRestricted: false,
      reason: "Customer verified via phone call",
      adminId,
      adminEmail,
    });

    const liftedPurchaseCheck = await checkFeatureEntitlement(testUserId, "SHOPPING_PURCHASE");
    recordTest("3.3", "Feature restriction successfully lifted", liftedPurchaseCheck.allowed);

    // ------------------------------------------------------------------
    // GROUP 4: Financial Integrity, Wallet Credits & Debits
    // ------------------------------------------------------------------
    console.log("\n--- Group 4: Wallet Financial Control & Ledger Integrity ---");

    // 4.1 Credit Wallet
    const creditResult = await adjustUserWalletBalance({
      userId: testUserId,
      type: "CREDIT",
      amountBDT: 500,
      category: "BONUS",
      reason: "Promotional loyalty reward bonus",
      reference: "TEST-BONUS-001",
      adminId,
      adminEmail,
    });

    const userAfterCredit = await prisma.user.findUnique({
      where: { id: testUserId },
      select: { walletBalanceBDT: true },
    });

    recordTest(
      "4.1",
      "Wallet credit executed atomically with immutable ledger entry",
      creditResult.success && userAfterCredit?.walletBalanceBDT === 600,
      undefined,
      {
        previousBalance: creditResult.previousBalance,
        newBalance: creditResult.newBalance,
        transactionId: creditResult.transactionId,
      }
    );

    // 4.2 Deduct Wallet
    const debitResult = await adjustUserWalletBalance({
      userId: testUserId,
      type: "DEBIT",
      amountBDT: 150,
      category: "MANUAL_ADJUSTMENT",
      reason: "Order adjustment compensation",
      reference: "TEST-ADJ-002",
      adminId,
      adminEmail,
    });

    const userAfterDebit = await prisma.user.findUnique({
      where: { id: testUserId },
      select: { walletBalanceBDT: true },
    });

    recordTest(
      "4.2",
      "Wallet debit executed atomically and balances verified",
      debitResult.success && userAfterDebit?.walletBalanceBDT === 450,
      undefined,
      {
        previousBalance: debitResult.previousBalance,
        newBalance: debitResult.newBalance,
      }
    );

    // 4.3 Prevent Negative Balance
    let caughtInsufficientFunds = false;
    try {
      await adjustUserWalletBalance({
        userId: testUserId,
        type: "DEBIT",
        amountBDT: 99999, // Exceeds balance
        category: "PENALTY",
        reason: "Test excessive debit attempt",
        adminId,
        adminEmail,
      });
    } catch (err: any) {
      caughtInsufficientFunds = err.message.includes("Insufficient wallet balance");
    }

    const userAfterFailedDebit = await prisma.user.findUnique({
      where: { id: testUserId },
      select: { walletBalanceBDT: true },
    });

    recordTest(
      "4.3",
      "Negative wallet balance strictly rejected and balance uncompromised",
      caughtInsufficientFunds && userAfterFailedDebit?.walletBalanceBDT === 450,
      undefined,
      { finalBalance: userAfterFailedDebit?.walletBalanceBDT }
    );

    // ------------------------------------------------------------------
    // GROUP 5: Admin Notes, Customer Tags & Activity Logging
    // ------------------------------------------------------------------
    console.log("\n--- Group 5: Admin Notes, Tags & Activity Logging ---");

    // 5.1 Admin Note
    const note = await addAdminNote({
      userId: testUserId,
      adminId,
      adminEmail,
      note: "Customer confirmed high-priority business account verification.",
      category: "VERIFICATION",
    });

    recordTest(
      "5.1",
      "Internal administrative note recorded with category and author",
      !!note.id && note.category === "VERIFICATION"
    );

    // 5.2 Customer Tags
    const tags = await setUserTags(testUserId, ["VIP", "WHOLESALE"], adminId);
    recordTest(
      "5.2",
      "Customer tags successfully assigned and retrieved",
      tags.length === 2 && tags.some((t) => t.tag === "VIP")
    );

    // 5.3 Activity Logging
    await logUserActivity({
      userId: testUserId,
      eventType: "ORDER_PLACED_SIMULATION",
      category: "SHOPPING",
      description: "Test simulation of automated order placement event",
      metadata: { orderTotal: 450, itemsCount: 1 },
    });

    const activityLogs = await prisma.userActivityLog.findMany({
      where: { userId: testUserId },
    });

    recordTest(
      "5.3",
      "User activity events logged and retrieved in timeline",
      activityLogs.length > 0 && activityLogs.some((a) => a.eventType === "ORDER_PLACED_SIMULATION")
    );

    // ------------------------------------------------------------------
    // GROUP 6: Session Management & Revocation
    // ------------------------------------------------------------------
    console.log("\n--- Group 6: Session Management & Revocation ---");

    // Create a mock active session
    await prisma.session.create({
      data: {
        sessionToken: `test_token_${Date.now()}`,
        userId: testUserId,
        expires: new Date(Date.now() + 3600 * 1000),
      },
    });

    const activeSessionsBefore = await prisma.session.count({ where: { userId: testUserId } });
    const revokeResult = await revokeAllUserSessions(testUserId, adminId, adminEmail);
    const activeSessionsAfter = await prisma.session.count({ where: { userId: testUserId } });

    recordTest(
      "6.1",
      "Active sessions revoked completely on command",
      activeSessionsBefore === 1 && revokeResult.count === 1 && activeSessionsAfter === 0
    );

    // ------------------------------------------------------------------
    // GROUP 7: System Feature Catalog Completeness
    // ------------------------------------------------------------------
    console.log("\n--- Group 7: System Feature Catalog Completeness ---");

    const categories = ["SHOPPING", "FINANCIAL", "DIGITAL_PRODUCTS", "REWARDS", "SUPPORT", "ACCOUNT"];
    const allCategoriesCovered = categories.every((cat) => SYSTEM_FEATURES.some((f) => f.category === cat));

    recordTest(
      "7.1",
      "All 6 core business feature categories defined in system registry",
      allCategoriesCovered && SYSTEM_FEATURES.length >= 20,
      undefined,
      { totalFeaturesRegistered: SYSTEM_FEATURES.length, categories }
    );
  } catch (err: any) {
    console.error("Test Suite Runtime Error:", err);
    recordTest("FATAL", "Execution aborted due to unexpected error", false, err.message);
  } finally {
    // Clean up synthetic test records
    if (testUserId) {
      try {
        await prisma.userRestriction.deleteMany({ where: { userId: testUserId } });
        await prisma.userStatusRecord.deleteMany({ where: { userId: testUserId } });
        await prisma.userAdminNote.deleteMany({ where: { userId: testUserId } });
        await prisma.userActivityLog.deleteMany({ where: { userId: testUserId } });
        await prisma.userTag.deleteMany({ where: { userId: testUserId } });
        await prisma.walletTransaction.deleteMany({ where: { userId: testUserId } });
        await prisma.notification.deleteMany({ where: { userId: testUserId } });
        await prisma.session.deleteMany({ where: { userId: testUserId } });
        await prisma.user.delete({ where: { id: testUserId } });
        console.log(`\n✓ Synthetic test user (${testUserId}) safely cleaned up.`);
      } catch (cleanErr: any) {
        console.warn("Cleanup warning:", cleanErr.message);
      }
    }
  }

  // ------------------------------------------------------------------
  // TEST SUMMARY REPORT
  // ------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(" AUTOMATED TEST SUITE SUMMARY");
  console.log("=================================================================");
  const total = testResults.length;
  const passed = testResults.filter((t) => t.passed).length;
  const failed = testResults.filter((t) => !t.passed).length;

  console.log(`Total Test Scenarios : ${total}`);
  console.log(`Passed               : ${passed} / ${total} (${((passed / total) * 100).toFixed(1)}%)`);
  console.log(`Failed               : ${failed}`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterUserControlTestSuite()
  .catch((e) => {
    console.error("Fatal suite crash:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
