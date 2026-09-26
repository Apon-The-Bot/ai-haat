import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface CoinRewardTier {
  id: string;
  nameBn: string;
  nameEn: string;
  coinsCost: number;
  discountBDT: number;
  minOrderBDT: number;
  badge: string;
}

export const COIN_REWARD_TIERS: CoinRewardTier[] = [
  {
    id: "tier-bronze",
    nameBn: "ব্রোঞ্জ রিওয়ার্ড কুপন (২০৳ ছাড়)",
    nameEn: "Bronze Voucher (20 BDT OFF)",
    coinsCost: 100,
    discountBDT: 20,
    minOrderBDT: 150,
    badge: "১০০ কয়েন",
  },
  {
    id: "tier-silver",
    nameBn: "সিলভার রিওয়ার্ড কুপন (৬০৳ ছাড়)",
    nameEn: "Silver Voucher (60 BDT OFF)",
    coinsCost: 250,
    discountBDT: 60,
    minOrderBDT: 300,
    badge: "২৫০ কয়েন",
  },
  {
    id: "tier-gold",
    nameBn: "গোল্ড প্রিমিয়াম কুপন (১৫০৳ ছাড়)",
    nameEn: "Gold Voucher (150 BDT OFF)",
    coinsCost: 500,
    discountBDT: 150,
    minOrderBDT: 600,
    badge: "৫০০ কয়েন",
  },
  {
    id: "tier-diamond",
    nameBn: "ডায়মন্ড ভিআইপি কুপন (৩৫০৳ ছাড়)",
    nameEn: "Diamond VIP Voucher (350 BDT OFF)",
    coinsCost: 1000,
    discountBDT: 350,
    minOrderBDT: 1000,
    badge: "১,০০০ কয়েন",
  },
];

/**
 * Calculates and awards coins to user on completed purchase.
 * Rate: 1 Coin per 10 BDT spent (e.g. 500 BDT order = 50 Coins).
 */
export async function awardCoinsForOrder(orderId: string): Promise<number> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order || !order.userId) return 0;

  // Rate: 1 coin per 10 BDT
  const coinsToEarn = Math.max(1, Math.floor(order.totalBDT / 10));

  // Check if coins already awarded for this order
  const existingTx = await prisma.coinTransaction.findFirst({
    where: {
      userId: order.userId,
      orderId: order.id,
      type: "EARNED_ORDER",
    },
  });

  if (existingTx) return 0;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: order.userId },
      data: {
        coinBalance: { increment: coinsToEarn },
        lifetimeCoinsEarned: { increment: coinsToEarn },
      },
    }),
    prisma.coinTransaction.create({
      data: {
        userId: order.userId,
        amount: coinsToEarn,
        type: "EARNED_ORDER",
        orderId: order.id,
        description: `অর্ডার #${order.orderNumber} সম্পন্ন করার জন্য অর্জিত কয়েন`,
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: {
        coinsEarned: coinsToEarn,
      },
    }),
    prisma.notification.create({
      data: {
        userId: order.userId,
        title: "🎉 আপনি এআই হাট কয়েন জিতেছেন!",
        message: `আপনার অর্ডার #${order.orderNumber} এর জন্য ${coinsToEarn} টি কয়েন আপনার অ্যাকাউন্টে জমা হয়েছে। রিওয়ার্ডস ক্লাবে গিয়ে ডিসকাউন্ট কুপন ক্লেম করুন!`,
        type: "SYSTEM",
        link: "/dashboard/rewards",
      },
    }),
  ]);

  return coinsToEarn;
}

/**
 * Retrieves the customer's current coin balance and recent transaction history.
 */
export async function getUserLoyaltyData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      coinBalance: true,
      lifetimeCoinsEarned: true,
    },
  });

  const transactions = await prisma.coinTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    coinBalance: user?.coinBalance || 0,
    lifetimeCoinsEarned: user?.lifetimeCoinsEarned || 0,
    transactions,
    availableTiers: COIN_REWARD_TIERS,
  };
}

/**
 * Claims a discount coupon using customer's accumulated coins.
 */
export async function claimCouponWithCoins(
  userId: string,
  tierId: string
): Promise<{ success: boolean; error?: string; couponCode?: string; discountBDT?: number }> {
  const tier = COIN_REWARD_TIERS.find((t) => t.id === tierId);
  if (!tier) {
    return { success: false, error: "অবৈধ রিওয়ার্ড টিয়ার।" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, coinBalance: true, email: true },
  });

  if (!user) {
    return { success: false, error: "ইউজার পাওয়া যায়নি।" };
  }

  if (user.coinBalance < tier.coinsCost) {
    return {
      success: false,
      error: `আপনার পর্যাপ্ত কয়েন নেই। আপনার আছে ${user.coinBalance} কয়েন, প্রয়োজন ${tier.coinsCost} কয়েন।`,
    };
  }

  const generatedCode = `COIN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

  // Execute atomic deduction and coupon creation
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        coinBalance: { decrement: tier.coinsCost },
      },
    }),
    prisma.coinTransaction.create({
      data: {
        userId,
        amount: -tier.coinsCost,
        type: "REDEEMED_COUPON",
        description: `${tier.nameBn} ক্লেইম করার জন্য ব্যয়কৃত কয়েন (${generatedCode})`,
      },
    }),
    prisma.coupon.create({
      data: {
        code: generatedCode,
        discountType: "FLAT_BDT",
        discountValue: tier.discountBDT,
        minOrderBDT: tier.minOrderBDT,
        usageLimit: 1,
        usedCount: 0,
        validUntil,
        isActive: true,
      },
    }),
    prisma.notification.create({
      data: {
        userId,
        title: "🎁 এক্সক্লুসিভ রিওয়ার্ড কুপন প্রস্তুত!",
        message: `আপনার কয়েন রিডিম করে ${generatedCode} কুপন তৈরি হয়েছে (${tier.discountBDT}৳ ছাড়)। পরবর্তী অর্ডারে চেকআউটে ব্যবহার করুন।`,
        type: "PROMO",
        link: "/shop",
      },
    }),
  ]);

  return {
    success: true,
    couponCode: generatedCode,
    discountBDT: tier.discountBDT,
  };
}
