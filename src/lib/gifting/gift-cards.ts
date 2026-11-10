import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface CreateGiftCardParams {
  amountBDT: number;
  purchasedByUserId?: string;
  recipientEmail?: string;
  recipientName?: string;
  senderName?: string;
  senderEmail?: string;
  customMessage?: string;
  orderId?: string;
  expiresInDays?: number;
}

/**
 * Generates a branded, unique 16-character gift card code formatted like: AIHT-XXXX-XXXX-XXXX
 */
export function generateGiftCardCode(): string {
  const segment1 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const segment2 = crypto.randomBytes(2).toString("hex").toUpperCase();
  const segment3 = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `AIHT-${segment1}-${segment2}-${segment3}`;
}

/**
 * Creates a new active digital gift card record.
 */
export async function createGiftCard(params: CreateGiftCardParams) {
  const code = generateGiftCardCode();
  const expiresAt = params.expiresInDays
    ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1-year default validity

  const giftCard = await prisma.giftCard.create({
    data: {
      code,
      initialAmountBDT: params.amountBDT,
      currentBalanceBDT: params.amountBDT,
      status: "ACTIVE",
      senderName: params.senderName,
      senderEmail: params.senderEmail,
      recipientName: params.recipientName,
      recipientEmail: params.recipientEmail,
      customMessage: params.customMessage,
      purchasedByUserId: params.purchasedByUserId,
      orderId: params.orderId,
      expiresAt,
    },
  });

  return giftCard;
}

/**
 * Redeems a gift card and immediately deposits the full amount into the user's wallet.
 */
export async function redeemGiftCardToWallet(code: string, userId: string) {
  const cleanCode = code.trim().toUpperCase();

  const giftCard = await prisma.giftCard.findUnique({
    where: { code: cleanCode },
  });

  if (!giftCard) {
    return { success: false, error: "ভুল বা মেয়াদোত্তীর্ণ গিফট কার্ড কোড।" };
  }

  if (giftCard.status !== "ACTIVE") {
    return {
      success: false,
      error: `এই গিফট কার্ডটি ইতিমধ্যে ${giftCard.status === "REDEEMED" ? "ব্যবহার করা হয়েছে" : "বাতিল হয়েছে"}।`,
    };
  }

  if (giftCard.expiresAt && giftCard.expiresAt < new Date()) {
    await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: { status: "EXPIRED" },
    });
    return { success: false, error: "দুঃখিত, এই গিফট কার্ডটির মেয়াদ শেষ হয়ে গেছে।" };
  }

  const amountToCredit = giftCard.currentBalanceBDT;
  if (amountToCredit <= 0) {
    return { success: false, error: "এই গিফট কার্ডে কোনো ব্যালেন্স অবশিষ্ট নেই।" };
  }

  const trxId = `GC_${giftCard.code.replace(/-/g, "")}`;

  // Execute atomic redemption with status: "ACTIVE" guard to prevent concurrency race conditions
  try {
    const [updatedUser, updatedCard] = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.giftCard.updateMany({
        where: { id: giftCard.id, status: "ACTIVE" },
        data: {
          status: "REDEEMED",
          currentBalanceBDT: 0,
          redeemedByUserId: userId,
          redeemedAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        throw new Error("এই গিফট কার্ডটি ইতিমধ্যে রিডিম করা হয়েছে বা নিষ্ক্রিয়।");
      }

      const userRecord = await tx.user.update({
        where: { id: userId },
        data: {
          walletBalanceBDT: { increment: amountToCredit },
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId,
          amountBDT: amountToCredit,
          type: "DEPOSIT",
          method: "gift_card",
          senderNumber: giftCard.code,
          trxId,
          status: "APPROVED",
          note: `গিফট কার্ড রিডিম: ${giftCard.code}${giftCard.senderName ? ` (প্রেরক: ${giftCard.senderName})` : ""}`,
        },
      });

      await tx.notification.create({
        data: {
          userId,
          title: "💳 গিফট কার্ড ওয়ালেটে রিডিম সফল!",
          message: `আপনার গিফট কার্ড (${giftCard.code}) থেকে ${amountToCredit} ৳ ওয়ালেটে যুক্ত করা হয়েছে।`,
          type: "WALLET",
          link: "/dashboard/wallet",
        },
      });

      return [userRecord, { ...giftCard, status: "REDEEMED", currentBalanceBDT: 0 }];
    });

    return {
      success: true,
      creditedBDT: amountToCredit,
      newWalletBalanceBDT: updatedUser.walletBalanceBDT,
      giftCard: updatedCard,
    };
  } catch (txError: any) {
    return {
      success: false,
      error: txError?.message || "গিফট কার্ড রিডিম প্রক্রিয়া সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
    };
  }
}
