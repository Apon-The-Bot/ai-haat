import { prisma } from "../src/lib/prisma";
import { calculateOrderQuote } from "../src/lib/commerce/pricing";
import {
  getOrCreateReferralProfile,
  getUserReferralData,
  claimReferralMilestone,
} from "../src/lib/commerce/referrals";

async function runViralMarketingE2E() {
  console.log("==================================================");
  console.log("🚀 STARTING VIRAL MARKETING & REFERRAL E2E TEST");
  console.log("==================================================");

  // 1. Create a dummy test user for referral testing
  const testEmail = `test.referrer.${Date.now()}@aihaat.io`;
  const testUser = await prisma.user.create({
    data: {
      email: testEmail,
      name: "Test Viral Referrer",
      phone: "01799887766",
      walletBalanceBDT: 0,
      coinBalance: 0,
    },
  });

  console.log(`\n[Test 1] Created Test User: ${testUser.id} (${testUser.email})`);

  try {
    // 2. Test Get or Create Referral Profile
    console.log("\n[Test 2] Generating / Fetching Referral Profile...");
    const profile = await getOrCreateReferralProfile(testUser.id);
    console.log("✓ Profile Created:");
    console.log(`  - Referral Code: ${profile.referralCode}`);
    console.log(`  - Status: ${profile.status}`);

    if (!profile.referralCode || !profile.referralCode.startsWith("AH-")) {
      throw new Error("Invalid referral code format generated!");
    }

    // Fetch a real product from DB
    const realProduct = await prisma.product.findFirst({
      where: { inStock: true },
      include: { variations: true },
    });
    if (!realProduct) throw new Error("No in-stock product found in DB to test pricing!");
    const realVar = realProduct.variations[0];

    // 3. Test Pricing Engine: SHARE30 Coupon
    console.log("\n[Test 3] Testing Pricing Engine with SHARE30 Viral Coupon...");
    const shareQuote = await calculateOrderQuote(
      [
        {
          productId: realProduct.id,
          variationId: realVar?.id,
          productName: realProduct.name,
          variationName: realVar?.name || "Standard",
          quantity: 1,
        },
      ],
      "SHARE30"
    );

    console.log("✓ SHARE30 Quote Checked:");
    console.log(`  - Valid: ${shareQuote.isValid}`);
    console.log(`  - Coupon Code: ${shareQuote.quote.couponCode}`);
    console.log(`  - Discount BDT: ${shareQuote.quote.discountBDT}`);
    if (shareQuote.quote.couponCode !== "SHARE30" || shareQuote.quote.discountBDT !== 30) {
      throw new Error(`SHARE30 did not apply 30 BDT discount! Got: ${shareQuote.quote.discountBDT}`);
    }

    // 4. Test Pricing Engine: Referral Code Discount (Give ৳50)
    console.log(`\n[Test 4] Testing Pricing Engine with Referral Code "${profile.referralCode}"...`);
    const refQuote = await calculateOrderQuote(
      [
        {
          productId: realProduct.id,
          variationId: realVar?.id,
          productName: realProduct.name,
          variationName: realVar?.name || "Standard",
          quantity: 1,
        },
      ],
      profile.referralCode
    );

    console.log("✓ Referral Code Quote Checked:");
    console.log(`  - Valid: ${refQuote.isValid}`);
    console.log(`  - Coupon Code: ${refQuote.quote.couponCode}`);
    console.log(`  - Discount BDT: ${refQuote.quote.discountBDT}`);
    if (refQuote.quote.couponCode !== profile.referralCode || refQuote.quote.discountBDT !== 50) {
      throw new Error(`Referral Code did not apply 50 BDT discount! Got: ${refQuote.quote.discountBDT}`);
    }

    // 5. Test Milestone Progress & Claiming
    console.log("\n[Test 5] Simulating 3 Referred Converted Orders for Milestone 1...");
    // Update profile count to 3
    await prisma.affiliateProfile.update({
      where: { id: profile.id },
      data: {
        totalOrdersCount: 3,
        totalEarnedBDT: 150,
      },
    });

    const userRefData = await getUserReferralData(testUser.id);
    console.log(`  - Converted Orders: ${userRefData.convertedOrdersCount}`);
    console.log(`  - Milestone 1 (3 Friends) Ready?: ${userRefData.milestones[0].isReady}`);
    if (!userRefData.milestones[0].isReady) {
      throw new Error("Milestone 1 should be ready to claim when orders >= 3!");
    }

    console.log("\n[Test 6] Claiming Milestone 1 (500 Coins)...");
    const claimRes = await claimReferralMilestone(testUser.id, "milestone_1");
    console.log("✓ Claim Result:", claimRes);
    if (!claimRes.success) {
      throw new Error(`Failed to claim milestone 1: ${claimRes.error}`);
    }

    // Verify user coin balance
    const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
    console.log(`  - User Coin Balance: ${updatedUser?.coinBalance} (Expected: 500)`);
    if (updatedUser?.coinBalance !== 500) {
      throw new Error(`User coin balance was not updated properly! Got: ${updatedUser?.coinBalance}`);
    }

    // 7. Test Milestone 2 Claiming (৳100 Wallet Cash)
    console.log("\n[Test 7] Simulating 5 Referred Orders for Milestone 2 (৳100 Wallet Cash)...");
    await prisma.affiliateProfile.update({
      where: { id: profile.id },
      data: { totalOrdersCount: 5 },
    });

    const claim2Res = await claimReferralMilestone(testUser.id, "milestone_2");
    console.log("✓ Claim 2 Result:", claim2Res);
    if (!claim2Res.success) {
      throw new Error(`Failed to claim milestone 2: ${claim2Res.error}`);
    }

    const updatedUserWallet = await prisma.user.findUnique({ where: { id: testUser.id } });
    console.log(`  - User Wallet Balance: ${updatedUserWallet?.walletBalanceBDT} (Expected: 100)`);
    if (updatedUserWallet?.walletBalanceBDT !== 100) {
      throw new Error(`User wallet balance was not updated properly! Got: ${updatedUserWallet?.walletBalanceBDT}`);
    }

    console.log("\n==================================================");
    console.log("🎉 ALL VIRAL MARKETING & REFERRAL TESTS PASSED!");
    console.log("==================================================");
  } finally {
    // Cleanup
    console.log("\n[Cleanup] Cleaning up test records from database...");
    await prisma.coinTransaction.deleteMany({ where: { userId: testUser.id } });
    await prisma.walletTransaction.deleteMany({ where: { userId: testUser.id } });
    await prisma.notification.deleteMany({ where: { userId: testUser.id } });
    await prisma.affiliateProfile.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log("✓ Test records cleaned up successfully.");
  }
}

runViralMarketingE2E().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
