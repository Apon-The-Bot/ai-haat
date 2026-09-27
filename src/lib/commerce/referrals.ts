import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export interface ReferralMilestone {
  id: string;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  requiredCount: number;
  rewardType: "COINS" | "WALLET_CASH" | "VIP_BADGE";
  rewardValue: number;
  rewardBadgeText: string;
  icon: string;
}

export const REFERRAL_MILESTONES: ReferralMilestone[] = [
  {
    id: "milestone_1",
    titleEn: "3 Friends Joined & Ordered",
    titleBn: "৩ জন বন্ধুকে রেফার করুন",
    descEn: "Get 500 AI Haat Coins (Redeemable for discount vouchers & free tools)!",
    descBn: "৫০০ এআই হাট কয়েন জিতে নিন যা দিয়ে ডিসকাউন্ট ভাউচার ও ফ্রি টুলস নেওয়া যাবে!",
    requiredCount: 3,
    rewardType: "COINS",
    rewardValue: 500,
    rewardBadgeText: "🎁 ৫০০ রিওয়ার্ড কয়েন",
    icon: "Coins",
  },
  {
    id: "milestone_2",
    titleEn: "5 Friends Joined & Ordered",
    titleBn: "৫ জন বন্ধুকে রেফার করুন",
    descEn: "Instant ৳100 Cash Bonus credited straight to your AI Haat Wallet!",
    descBn: "সরাসরি ৳১০০ ক্যাশ বোনাস আপনার এআই হাট ওয়ালেটে জমা হবে!",
    requiredCount: 5,
    rewardType: "WALLET_CASH",
    rewardValue: 100,
    rewardBadgeText: "💰 ৳১০০ ওয়ালেট ক্যাশ",
    icon: "Wallet",
  },
  {
    id: "milestone_3",
    titleEn: "10 Friends Joined & Ordered",
    titleBn: "১০ জন বন্ধুকে রেফার করুন",
    descEn: "Upgrade to VIP Creator Badge + Lifetime +5% Extra Commission!",
    descBn: "ভিআইপি ক্রিয়েটর ব্যাজ এবং আজীবন অতিরিক্ত ৫% বোনাস কমিশন!",
    requiredCount: 10,
    rewardType: "VIP_BADGE",
    rewardValue: 0,
    rewardBadgeText: "👑 ভিআইপি ক্রিয়েটর স্ট্যাটাস",
    icon: "Award",
  },
];

/**
 * Get or automatically create user's affiliate/referral profile
 */
export async function getOrCreateReferralProfile(userId: string) {
  let profile = await prisma.affiliateProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          walletBalanceBDT: true,
          coinBalance: true,
        },
      },
    },
  });

  if (!profile) {
    // Generate unique friendly code e.g. AH-9821
    let code = `AH-${randomBytes(2).toString("hex").toUpperCase()}`;
    let exists = await prisma.affiliateProfile.findUnique({ where: { referralCode: code } });
    while (exists) {
      code = `AH-${randomBytes(2).toString("hex").toUpperCase()}`;
      exists = await prisma.affiliateProfile.findUnique({ where: { referralCode: code } });
    }

    profile = await prisma.affiliateProfile.create({
      data: {
        userId,
        referralCode: code,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            walletBalanceBDT: true,
            coinBalance: true,
          },
        },
      },
    });
  }

  return profile;
}

/**
 * Get full referral dashboard data including milestones and referral orders
 */
export async function getUserReferralData(userId: string) {
  const profile = await getOrCreateReferralProfile(userId);

  // 1. Fetch converted orders associated with this affiliate profile
  const commissions = await prisma.affiliateCommission.findMany({
    where: { affiliateProfileId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const convertedOrdersCount = profile.totalOrdersCount || commissions.length;

  // 2. Fetch already claimed milestone notes
  const [claimedWalletBonuses, claimedCoinBonuses] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: {
        userId,
        type: "BONUS",
        note: { startsWith: "Milestone Claim:" },
      },
      select: { note: true },
    }),
    prisma.coinTransaction.findMany({
      where: {
        userId,
        type: "BONUS",
        description: { startsWith: "Milestone Claim:" },
      },
      select: { description: true },
    }),
  ]);

  const claimedMilestoneIds = new Set<string>();
  for (const b of claimedWalletBonuses) {
    if (b.note) {
      const match = b.note.match(/Milestone Claim:\s*([a-zA-Z0-9_]+)/);
      if (match) claimedMilestoneIds.add(match[1]);
    }
  }
  for (const c of claimedCoinBonuses) {
    if (c.description) {
      const match = c.description.match(/Milestone Claim:\s*([a-zA-Z0-9_]+)/);
      if (match) claimedMilestoneIds.add(match[1]);
    }
  }

  // 3. Compute Milestone statuses
  const milestonesWithStatus = REFERRAL_MILESTONES.map((m) => {
    const isClaimed = claimedMilestoneIds.has(m.id);
    const isReady = !isClaimed && convertedOrdersCount >= m.requiredCount;
    const progress = Math.min(convertedOrdersCount, m.requiredCount);
    const progressPercent = Math.min(100, Math.round((progress / m.requiredCount) * 100));

    return {
      ...m,
      isClaimed,
      isReady,
      progress,
      progressPercent,
    };
  });

  // 4. Formatted recent referrals (masked for privacy)
  const recentReferrals = commissions.map((c, idx) => ({
    id: c.id,
    maskedName: `Friend #${commissions.length - idx}`,
    orderTotalBDT: c.orderTotalBDT,
    commissionAmountBDT: c.commissionAmountBDT,
    status: c.status === "PAID" || c.status === "APPROVED" ? "Earned (৳50 credited)" : "Pending Review",
    date: c.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  }));

  return {
    referralCode: profile.referralCode,
    customSlug: profile.customSlug,
    totalClicks: profile.totalClicks,
    convertedOrdersCount,
    totalEarnedBDT: profile.totalEarnedBDT,
    earningsBalanceBDT: profile.earningsBalanceBDT,
    walletBalanceBDT: profile.user.walletBalanceBDT,
    coinBalance: profile.user.coinBalance,
    milestones: milestonesWithStatus,
    recentReferrals,
  };
}

/**
 * Claim a milestone reward
 */
export async function claimReferralMilestone(userId: string, milestoneId: string) {
  const profile = await getOrCreateReferralProfile(userId);
  const milestone = REFERRAL_MILESTONES.find((m) => m.id === milestoneId);

  if (!milestone) {
    return { success: false, error: "Invalid milestone ID" };
  }

  // Check count
  const convertedOrdersCount = profile.totalOrdersCount;
  if (convertedOrdersCount < milestone.requiredCount) {
    return {
      success: false,
      error: `You need at least ${milestone.requiredCount} referred orders to claim this milestone. Current: ${convertedOrdersCount}`,
    };
  }

  // Check if already claimed
  const existingClaim = await prisma.walletTransaction.findFirst({
    where: {
      userId,
      type: "BONUS",
      note: `Milestone Claim: ${milestone.id}`,
    },
  });

  const existingCoinClaim = await prisma.coinTransaction.findFirst({
    where: {
      userId,
      type: "BONUS",
      description: `Milestone Claim: ${milestone.id}`,
    },
  });

  if (existingClaim || existingCoinClaim) {
    return { success: false, error: "You have already claimed this milestone reward!" };
  }

  // Execute reward dispatch in atomic transaction
  await prisma.$transaction(async (tx) => {
    if (milestone.rewardType === "WALLET_CASH") {
      await tx.user.update({
        where: { id: userId },
        data: {
          walletBalanceBDT: { increment: milestone.rewardValue },
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId,
          amountBDT: milestone.rewardValue,
          type: "BONUS",
          method: "system",
          status: "APPROVED",
          note: `Milestone Claim: ${milestone.id}`,
        },
      });
    } else if (milestone.rewardType === "COINS") {
      await tx.user.update({
        where: { id: userId },
        data: {
          coinBalance: { increment: milestone.rewardValue },
          lifetimeCoinsEarned: { increment: milestone.rewardValue },
        },
      });

      await tx.coinTransaction.create({
        data: {
          userId,
          amount: milestone.rewardValue,
          type: "BONUS",
          description: `Milestone Claim: ${milestone.id}`,
        },
      });
    } else if (milestone.rewardType === "VIP_BADGE") {
      await tx.affiliateProfile.update({
        where: { id: profile.id },
        data: {
          tier: "GOLD",
        },
      });

      // Marker transaction for tracking claim
      await tx.walletTransaction.create({
        data: {
          userId,
          amountBDT: 0,
          type: "BONUS",
          method: "system",
          status: "APPROVED",
          note: `Milestone Claim: ${milestone.id}`,
        },
      });
    }

    // Create Notification
    await tx.notification.create({
      data: {
        userId,
        title: "🎉 অভিনন্দন! মাইলস্টোন রিওয়ার্ড আনলক হয়েছে!",
        message: `আপনি সফলভাবে "${milestone.titleBn}" সম্পন্ন করেছেন এবং "${milestone.rewardBadgeText}" রিওয়ার্ড গ্রহণ করেছেন!`,
        type: "PROMO",
        link: "/dashboard/referrals",
      },
    });
  });

  return {
    success: true,
    message: `সফলভাবে ${milestone.rewardBadgeText} গ্রহণ করা হয়েছে!`,
    rewardType: milestone.rewardType,
    rewardValue: milestone.rewardValue,
  };
}
