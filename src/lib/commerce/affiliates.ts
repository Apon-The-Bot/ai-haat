import { prisma } from "@/lib/prisma";
import { 
  AffiliateTier, 
  AffiliateStatus, 
  PayoutMethod, 
  CommissionStatus, 
  PayoutStatus, 
  TransactionType, 
  TransactionStatus,
  NotificationType
} from "@prisma/client";
import { dispatchNotificationEvent, NOTIFICATION_EVENTS } from "@/lib/notifications";
import { 
  sendAffiliatePayoutTelegramAlert as sendTelegramPayoutAlert, 
  sendAffiliateNewPartnerTelegramAlert as sendTelegramNewPartnerAlert 
} from "@/utils/telegram";

// ─── CONSTANTS & CONFIGURATION ────────────────────────────────────────────────
export const MIN_PAYOUT_AMOUNT_BDT = 500;
export const DEFAULT_HOLDING_DAYS = 7;

// In-app notifications & prisma.notification.create dispatched with /dashboard/affiliate link
export const AFFILIATE_DASHBOARD_LINK = "/dashboard/affiliate";

export const TIER_RATES: Record<AffiliateTier, number> = {
  BRONZE: 5.0,
  SILVER: 8.0,
  GOLD: 12.0,
  CUSTOM: 5.0, // fallback if customRatePercent is not set
};

// ─── PRODUCT-SPECIFIC COMMISSION RULES REGISTRY ──────────────────────────────
export interface ProductCommissionRule {
  productId?: string;
  productSlug?: string;
  category?: string;
  type: "PERCENTAGE" | "FIXED_BDT";
  value: number; // e.g. 15 for 15% or 150 for ৳150 fixed
  description?: string;
}

const customProductRules: ProductCommissionRule[] = [];

/**
 * Register a product-specific or category-specific commission rule
 */
export function registerProductCommissionRule(rule: ProductCommissionRule) {
  customProductRules.push(rule);
}

/**
 * Get all registered product commission rules
 */
export function getProductCommissionRules(): ProductCommissionRule[] {
  return [...customProductRules];
}

/**
 * Clear custom product commission rules (primarily for test resets)
 */
export function clearProductCommissionRules() {
  customProductRules.length = 0;
}

/**
 * Match a product rule for an item
 */
export function findProductCommissionRule(item: {
  productId?: string;
  productSlug?: string;
  category?: string;
}): ProductCommissionRule | null {
  return (
    customProductRules.find(
      (r) =>
        (r.productId && r.productId === item.productId) ||
        (r.productSlug && r.productSlug === item.productSlug) ||
        (r.category && r.category === item.category)
    ) || null
  );
}

// ─── COUPON-AFFILIATE LINKING REGISTRY ────────────────────────────────────────
const couponAffiliateMap = new Map<string, string>(); // couponCode (uppercase) -> referralCode / affiliateId

export function linkCouponToAffiliate(affiliateReferralCode: string, couponCode: string) {
  couponAffiliateMap.set(couponCode.trim().toUpperCase(), affiliateReferralCode.trim().toUpperCase());
}

export function getAffiliateByLinkedCoupon(couponCode: string): string | null {
  return couponAffiliateMap.get(couponCode.trim().toUpperCase()) || null;
}

// ─── BACKWARD COMPATIBLE NOTIFICATION WRAPPERS ───────────────────────────────
export async function sendAffiliateCommissionEarnedEmail(params: {
  customerName: string;
  customerEmail: string;
  amountBDT: number;
  orderNumber: string;
}) {
  try {
    const { renderAffiliateCommissionEarnedEmail } = await import("@/lib/email-templates");
    const { sendEmail } = await import("@/lib/email-service");
    const rendered = renderAffiliateCommissionEarnedEmail({
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      commissionAmountBDT: params.amountBDT,
      orderTotalBDT: params.amountBDT,
      referralCode: "AFFILIATE",
      newBalanceBDT: params.amountBDT,
    });
    await sendEmail({
      to: params.customerEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  } catch (error) {
    console.warn("sendAffiliateCommissionEarnedEmail fallback error:", error);
  }
}

export async function sendAffiliatePayoutCompletedEmail(params: {
  customerName: string;
  customerEmail: string;
  amountBDT: number;
  method: string;
  payoutTrxId?: string;
}) {
  try {
    const { renderAffiliatePayoutCompletedEmail } = await import("@/lib/email-templates");
    const { sendEmail } = await import("@/lib/email-service");
    const rendered = renderAffiliatePayoutCompletedEmail({
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      payoutAmountBDT: params.amountBDT,
      payoutMethod: params.method,
      payoutTrxId: params.payoutTrxId,
    });
    await sendEmail({
      to: params.customerEmail,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  } catch (error) {
    console.warn("sendAffiliatePayoutCompletedEmail fallback error:", error);
  }
}

export async function sendAffiliatePayoutTelegramAlert(params: {
  message?: string;
  partnerName?: string;
  partnerEmail?: string;
  amountBDT?: number;
  payoutMethod?: string;
  payoutPhone?: string;
  availableBalanceBDT?: number;
}) {
  try {
    if (params.partnerName && params.partnerEmail && params.amountBDT !== undefined && params.payoutMethod) {
      await sendTelegramPayoutAlert({
        partnerName: params.partnerName,
        partnerEmail: params.partnerEmail,
        amountBDT: params.amountBDT,
        payoutMethod: params.payoutMethod,
        payoutPhone: params.payoutPhone,
        availableBalanceBDT: params.availableBalanceBDT || 0,
      });
    } else if (params.message) {
      const { sendTelegramMessage } = await import("@/utils/telegram");
      await sendTelegramMessage(params.message);
    }
  } catch (error) {
    console.warn("sendAffiliatePayoutTelegramAlert error:", error);
  }
}

// ─── PROFILE & TIER FUNCTIONS ─────────────────────────────────────────────────
export function generateReferralCode(prefix: string = "AH"): string {
  const random6 = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${random6}`;
}

export async function getOrCreateAffiliateProfile(userId: string) {
  let profile = await prisma.affiliateProfile.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!profile) {
    const code = generateReferralCode();
    profile = await prisma.affiliateProfile.create({
      data: {
        userId,
        referralCode: code,
        tier: "BRONZE",
        earningsBalanceBDT: 0.0,
      },
      include: { user: true },
    });

    // Notify telegram of new partner asynchronously
    if (profile.user) {
      sendTelegramNewPartnerAlert({
        partnerName: profile.user.name || "Partner",
        partnerEmail: profile.user.email || "N/A",
        referralCode: code,
      }).catch((e) => console.warn("Telegram new partner alert failed:", e));
    }
  }

  return profile;
}

export function calculateAffiliateTier(profile: {
  totalOrdersCount: number;
  totalReferredGMVBDT: number;
  tier: AffiliateTier;
  customRatePercent?: number | null;
}) {
  if (profile.tier === "CUSTOM" && profile.customRatePercent != null) {
    return {
      tier: "CUSTOM" as AffiliateTier,
      ratePercent: profile.customRatePercent,
      nextTier: null,
      ordersNeeded: 0,
      gmvNeeded: 0,
    };
  }

  // Determine standard tier:
  // Bronze: 5% (0-9 orders, < 5,000 GMV)
  // Silver: 8% (10-49 orders OR 5,000-24,999 GMV)
  // Gold: 12% (50+ orders OR 25,000+ GMV)
  let calculatedTier: AffiliateTier = "BRONZE";
  let ratePercent = 5.0;

  if (profile.totalOrdersCount >= 50 || profile.totalReferredGMVBDT >= 25000) {
    calculatedTier = "GOLD";
    ratePercent = 12.0;
  } else if (profile.totalOrdersCount >= 10 || profile.totalReferredGMVBDT >= 5000) {
    calculatedTier = "SILVER";
    ratePercent = 8.0;
  }

  let nextTier: AffiliateTier | null = null;
  let ordersNeeded = 0;
  let gmvNeeded = 0;

  if (calculatedTier === "BRONZE") {
    nextTier = "SILVER";
    ordersNeeded = Math.max(0, 10 - profile.totalOrdersCount);
    gmvNeeded = Math.max(0, 5000 - profile.totalReferredGMVBDT);
  } else if (calculatedTier === "SILVER") {
    nextTier = "GOLD";
    ordersNeeded = Math.max(0, 50 - profile.totalOrdersCount);
    gmvNeeded = Math.max(0, 25000 - profile.totalReferredGMVBDT);
  }

  return {
    tier: calculatedTier,
    ratePercent,
    nextTier,
    ordersNeeded,
    gmvNeeded,
  };
}

// ─── REFERRAL CLICK TRACKING ──────────────────────────────────────────────────
export async function recordReferralClick(data: {
  referralCode: string;
  ipAddress?: string;
  userAgent?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  const cleanCode = data.referralCode.trim().toUpperCase();

  // Find by referralCode, customSlug, or linked coupon
  const linkedCode = getAffiliateByLinkedCoupon(cleanCode);
  const searchCode = linkedCode || cleanCode;

  const profile = await prisma.affiliateProfile.findFirst({
    where: {
      OR: [
        { referralCode: searchCode },
        { customSlug: searchCode },
      ],
    },
  });

  if (!profile) {
    return { success: false, error: "Affiliate not found" };
  }

  await prisma.$transaction([
    prisma.affiliateProfile.update({
      where: { id: profile.id },
      data: { totalClicks: { increment: 1 } },
    }),
    prisma.referralClick.create({
      data: {
        affiliateProfileId: profile.id,
        referralCode: data.referralCode,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        landingPage: data.landingPage,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
      },
    }),
  ]);

  return { success: true, profileId: profile.id };
}

// ─── ORDER ATTRIBUTION & FRAUD GUARD ─────────────────────────────────────────
export async function attributeOrderToAffiliate(
  orderId: string,
  referralCodeOrCoupon: string,
  metadata?: {
    customerIp?: string;
    customerPhone?: string;
    couponCode?: string;
  }
) {
  if (!referralCodeOrCoupon && !metadata?.couponCode) {
    return { success: false, error: "No referral or coupon code provided" };
  }

  const rawCode = (referralCodeOrCoupon || metadata?.couponCode || "").trim().toUpperCase();
  const linkedCode = getAffiliateByLinkedCoupon(rawCode);
  const lookupCode = linkedCode || rawCode;

  const affiliate = await prisma.affiliateProfile.findFirst({
    where: {
      OR: [
        { referralCode: lookupCode },
        { customSlug: lookupCode },
      ],
    },
    include: { user: true },
  });

  if (!affiliate) {
    return { success: false, error: "Affiliate not found" };
  }

  // Find order by ID or orderNumber
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: orderId }, { orderNumber: orderId }],
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  // ─── FRAUD GUARD: STRICT SELF-REFERRAL PREVENTION ───────────────────────────
  const isSameUserId = Boolean(order.userId && order.userId === affiliate.userId);
  const isSameEmail = Boolean(
    order.customerEmail &&
    affiliate.user.email &&
    order.customerEmail.trim().toLowerCase() === affiliate.user.email.trim().toLowerCase()
  );
  const isSamePhone = Boolean(
    (order.customerPhone &&
      affiliate.user.phone &&
      order.customerPhone.trim() === affiliate.user.phone.trim()) ||
    (order.customerPhone &&
      affiliate.payoutPhone &&
      order.customerPhone.trim() === affiliate.payoutPhone.trim()) ||
    (metadata?.customerPhone &&
      affiliate.user.phone &&
      metadata.customerPhone.trim() === affiliate.user.phone.trim())
  );

  if (isSameUserId || isSameEmail || isSamePhone) {
    return {
      success: false,
      error: "Self-referral not allowed: customer cannot refer themselves (matching account/email/phone)",
      commissionAmountBDT: 0,
    };
  }

  // Check if commission already attributed for this order
  const existingCommission = await prisma.affiliateCommission.findFirst({
    where: {
      orderId: order.id,
      affiliateProfileId: affiliate.id,
    },
  });

  if (existingCommission) {
    return {
      success: true,
      commissionAmountBDT: existingCommission.commissionAmountBDT,
      isExisting: true,
    };
  }

  // ─── COMMISSION CALCULATION (TIER + PRODUCT SPECIFIC RULES) ─────────────────
  const tierInfo = calculateAffiliateTier(affiliate);
  let totalCommissionBDT = 0;

  if (order.items && order.items.length > 0) {
    // Calculate per item respecting product/category commission overrides
    for (const item of order.items) {
      const itemTotalBDT = (item.priceBDT || 0) * (item.quantity || 1);
      const rule = findProductCommissionRule({
        productId: item.productId || undefined,
      });

      if (rule) {
        if (rule.type === "FIXED_BDT") {
          totalCommissionBDT += rule.value * (item.quantity || 1);
        } else {
          totalCommissionBDT += (itemTotalBDT * rule.value) / 100;
        }
      } else {
        totalCommissionBDT += (itemTotalBDT * tierInfo.ratePercent) / 100;
      }
    }
  } else {
    totalCommissionBDT = (order.totalBDT * tierInfo.ratePercent) / 100;
  }

  // Round to 2 decimal places
  totalCommissionBDT = Math.round(totalCommissionBDT * 100) / 100;

  const commission = await prisma.$transaction(async (tx) => {
    const comm = await tx.affiliateCommission.create({
      data: {
        affiliateProfileId: affiliate.id,
        orderId: order.id,
        orderTotalBDT: order.totalBDT,
        commissionRatePercent: tierInfo.ratePercent,
        commissionAmountBDT: totalCommissionBDT,
        status: "PENDING", // Enters holding status until refund window elapses or order is finalized
      },
    });

    // Attempt to link a recent click
    const recentClick = await tx.referralClick.findFirst({
      where: {
        affiliateProfileId: affiliate.id,
        convertedOrderId: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (recentClick) {
      await tx.referralClick.update({
        where: { id: recentClick.id },
        data: { convertedOrderId: order.id },
      });
    }

    return comm;
  });

  return {
    success: true,
    commissionId: commission.id,
    commissionAmountBDT: totalCommissionBDT,
    ratePercent: tierInfo.ratePercent,
    status: "PENDING",
  };
}

// ─── COMMISSION HOLDING PERIOD & MATURED RELEASE ──────────────────────────────
/**
 * Process order commission upon payment.
 * If immediate = false (default), commission remains in PENDING (holding status for refund window).
 * If immediate = true, commission is approved immediately and credited to earningsBalanceBDT.
 */
export async function processPaidOrderCommission(
  orderId: string,
  options?: { immediate?: boolean; holdingDays?: number }
) {
  const isImmediate = options?.immediate ?? false;
  const holdingDays = options?.holdingDays ?? DEFAULT_HOLDING_DAYS;

  // Find order by ID or orderNumber
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: orderId }, { orderNumber: orderId }],
    },
  });

  if (!order) return { success: false, error: "Order not found" };

  const commissions = await prisma.affiliateCommission.findMany({
    where: {
      orderId: order.id,
      status: "PENDING",
    },
    include: {
      affiliateProfile: {
        include: { user: true },
      },
      order: true,
    },
  });

  if (commissions.length === 0) {
    return { success: true, count: 0, message: "No pending commissions found for order" };
  }

  for (const commission of commissions) {
    const profile = commission.affiliateProfile;

    if (isImmediate) {
      // Approve immediately and credit balance
      await prisma.$transaction(async (tx) => {
        await tx.affiliateCommission.update({
          where: { id: commission.id },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
          },
        });

        const updatedProfile = await tx.affiliateProfile.update({
          where: { id: profile.id },
          data: {
            earningsBalanceBDT: { increment: commission.commissionAmountBDT },
            totalEarnedBDT: { increment: commission.commissionAmountBDT },
            totalOrdersCount: { increment: 1 },
            totalReferredGMVBDT: { increment: commission.orderTotalBDT },
          },
        });

        // Check for tier promotion
        const newTierInfo = calculateAffiliateTier(updatedProfile);
        if (newTierInfo.tier !== updatedProfile.tier && updatedProfile.tier !== "CUSTOM") {
          await tx.affiliateProfile.update({
            where: { id: profile.id },
            data: { tier: newTierInfo.tier },
          });

          // Dispatch tier upgrade event
          dispatchNotificationEvent({
            eventType: NOTIFICATION_EVENTS.AFFILIATE_TIER_UPGRADED,
            entityType: "AFFILIATE",
            entityId: profile.id,
            userId: profile.userId,
            recipientEmail: profile.user.email || undefined,
            dedupeKey: `affiliate_tier_upgrade_${profile.id}_${newTierInfo.tier}`,
            payload: {
              userId: profile.userId,
              customerName: profile.user.name || "Affiliate",
              customerEmail: profile.user.email || "",
              oldTier: profile.tier,
              newTier: newTierInfo.tier,
              newRatePercent: newTierInfo.ratePercent,
              dashboardUrl: "/dashboard/affiliate",
            },
          }).catch((e) => console.warn("Tier upgrade notification failed:", e));
        }

        // Dispatch Commission Earned Notification
        dispatchNotificationEvent({
          eventType: NOTIFICATION_EVENTS.AFFILIATE_COMMISSION_EARNED,
          entityType: "AFFILIATE",
          entityId: commission.id,
          userId: profile.userId,
          recipientEmail: profile.user.email || undefined,
          dedupeKey: `affiliate_commission_${commission.id}`,
          payload: {
            affiliateId: profile.id,
            userId: profile.userId,
            customerName: profile.user.name || "Affiliate",
            customerEmail: profile.user.email || "",
            amountBDT: commission.commissionAmountBDT,
            orderNumber: commission.order.orderNumber,
            orderTotalBDT: commission.orderTotalBDT,
            commissionRatePercent: commission.commissionRatePercent,
            isHolding: false,
            dashboardUrl: "/dashboard/affiliate",
          },
        }).catch((e) => console.warn("Commission earned notification failed:", e));
      });
    } else {
      // Holding Period Active: Notify affiliate that commission is holding during refund window
      dispatchNotificationEvent({
        eventType: NOTIFICATION_EVENTS.AFFILIATE_COMMISSION_HOLDING,
        entityType: "AFFILIATE",
        entityId: commission.id,
        userId: profile.userId,
        recipientEmail: profile.user.email || undefined,
        dedupeKey: `affiliate_holding_${commission.id}`,
        payload: {
          affiliateId: profile.id,
          userId: profile.userId,
          customerName: profile.user.name || "Affiliate",
          customerEmail: profile.user.email || "",
          amountBDT: commission.commissionAmountBDT,
          orderNumber: commission.order.orderNumber,
          orderTotalBDT: commission.orderTotalBDT,
          commissionRatePercent: commission.commissionRatePercent,
          isHolding: true,
          holdUntilDays: holdingDays,
          dashboardUrl: "/dashboard/affiliate",
        },
      }).catch((e) => console.warn("Commission holding notification failed:", e));
    }
  }

  return { success: true, count: commissions.length };
}

/**
 * Release holding commissions that have passed their holding period (refund window)
 */
export async function releaseHoldingCommissions(olderThanDays: number = DEFAULT_HOLDING_DAYS) {
  const thresholdDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  const pendingCommissions = await prisma.affiliateCommission.findMany({
    where: {
      status: "PENDING",
      createdAt: { lte: thresholdDate },
    },
    include: {
      affiliateProfile: {
        include: { user: true },
      },
      order: true,
    },
  });

  let processedCount = 0;
  let totalReleasedBDT = 0;

  for (const commission of pendingCommissions) {
    // Skip if order was cancelled or refunded
    if (commission.order.deliveryStatus === "CANCELLED" || commission.order.refundStatus === "FULLY_REFUNDED") {
      await prisma.affiliateCommission.update({
        where: { id: commission.id },
        data: { status: "CANCELLED", rejectionReason: "Associated order was cancelled or refunded" },
      });
      continue;
    }

    const profile = commission.affiliateProfile;

    await prisma.$transaction(async (tx) => {
      await tx.affiliateCommission.update({
        where: { id: commission.id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });

      const updatedProfile = await tx.affiliateProfile.update({
        where: { id: profile.id },
        data: {
          earningsBalanceBDT: { increment: commission.commissionAmountBDT },
          totalEarnedBDT: { increment: commission.commissionAmountBDT },
          totalOrdersCount: { increment: 1 },
          totalReferredGMVBDT: { increment: commission.orderTotalBDT },
        },
      });

      // Tier promotion check
      const newTierInfo = calculateAffiliateTier(updatedProfile);
      if (newTierInfo.tier !== updatedProfile.tier && updatedProfile.tier !== "CUSTOM") {
        await tx.affiliateProfile.update({
          where: { id: profile.id },
          data: { tier: newTierInfo.tier },
        });

        dispatchNotificationEvent({
          eventType: NOTIFICATION_EVENTS.AFFILIATE_TIER_UPGRADED,
          entityType: "AFFILIATE",
          entityId: profile.id,
          userId: profile.userId,
          recipientEmail: profile.user.email || undefined,
          dedupeKey: `affiliate_tier_upgrade_${profile.id}_${newTierInfo.tier}`,
          payload: {
            userId: profile.userId,
            customerName: profile.user.name || "Affiliate",
            customerEmail: profile.user.email || "",
            oldTier: profile.tier,
            newTier: newTierInfo.tier,
            newRatePercent: newTierInfo.ratePercent,
            dashboardUrl: "/dashboard/affiliate",
          },
        }).catch((e) => console.warn("Tier upgrade notification failed:", e));
      }

      // Dispatch release notification
      dispatchNotificationEvent({
        eventType: NOTIFICATION_EVENTS.AFFILIATE_COMMISSION_RELEASED,
        entityType: "AFFILIATE",
        entityId: commission.id,
        userId: profile.userId,
        recipientEmail: profile.user.email || undefined,
        dedupeKey: `affiliate_released_${commission.id}`,
        payload: {
          affiliateId: profile.id,
          userId: profile.userId,
          customerName: profile.user.name || "Affiliate",
          customerEmail: profile.user.email || "",
          amountBDT: commission.commissionAmountBDT,
          orderNumber: commission.order.orderNumber,
          orderTotalBDT: commission.orderTotalBDT,
          commissionRatePercent: commission.commissionRatePercent,
          newBalanceBDT: updatedProfile.earningsBalanceBDT,
          dashboardUrl: "/dashboard/affiliate",
        },
      }).catch((e) => console.warn("Commission release notification failed:", e));
    });

    processedCount++;
    totalReleasedBDT += commission.commissionAmountBDT;
  }

  return {
    success: true,
    processedCount,
    totalReleasedBDT: Math.round(totalReleasedBDT * 100) / 100,
  };
}

// ─── PAYOUT REQUEST & LIFECYCLE ───────────────────────────────────────────────
export async function requestAffiliatePayout(
  userId: string,
  data: {
    amountBDT: number;
    payoutMethod: PayoutMethod;
    payoutPhone?: string;
    payoutBankDetails?: string;
  }
) {
  const requestedAmount = Math.round((data.amountBDT || 0) * 100) / 100;

  if (requestedAmount < MIN_PAYOUT_AMOUNT_BDT) {
    throw new Error(`Minimum payout amount is ৳${MIN_PAYOUT_AMOUNT_BDT}`);
  }

  const result = await prisma.$transaction(async (tx) => {
    const profile = await tx.affiliateProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) {
      throw new Error("Affiliate profile not found");
    }

    if (profile.status === "SUSPENDED") {
      throw new Error("Affiliate account is suspended. Payouts are disabled.");
    }

    // Atomic conditional balance decrement preventing negative balance race conditions
    const updateResult = await tx.affiliateProfile.updateMany({
      where: {
        id: profile.id,
        earningsBalanceBDT: { gte: requestedAmount },
        status: { not: "SUSPENDED" },
      },
      data: {
        earningsBalanceBDT: { decrement: requestedAmount },
      },
    });

    if (updateResult.count === 0) {
      throw new Error(
        `Insufficient earnings balance (Available: ৳${profile.earningsBalanceBDT}, Requested: ৳${requestedAmount})`
      );
    }

    const payout = await tx.affiliatePayoutRequest.create({
      data: {
        affiliateProfileId: profile.id,
        userId: profile.userId,
        amountBDT: requestedAmount,
        payoutMethod: data.payoutMethod,
        payoutPhone: data.payoutPhone || null,
        payoutBankDetails: data.payoutBankDetails || null,
        status: "REQUESTED",
      },
    });

    const updatedProfile = await tx.affiliateProfile.findUnique({
      where: { id: profile.id },
    });

    return { payout, profile, updatedProfile };
  });

  // Central Notification Event Dispatch (In-App + Email + Telegram)
  dispatchNotificationEvent({
    eventType: NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_REQUESTED,
    entityType: "PAYOUT",
    entityId: result.payout.id,
    userId: result.profile.userId,
    recipientEmail: result.profile.user.email || undefined,
    dedupeKey: `affiliate_payout_requested_${result.payout.id}`,
    payload: {
      payoutId: result.payout.id,
      userId: result.profile.userId,
      customerName: result.profile.user.name || "Affiliate",
      customerEmail: result.profile.user.email || "",
      amountBDT: requestedAmount,
      payoutMethod: data.payoutMethod,
      payoutPhone: data.payoutPhone || "",
      status: "REQUESTED",
      dashboardUrl: "/dashboard/affiliate",
    },
  }).catch((e) => console.warn("Payout requested notification failed:", e));

  return result.payout;
}

export async function reviewAffiliatePayout(data: {
  payoutId: string;
  adminEmail: string;
  action: "APPROVE_WALLET" | "COMPLETE_MFS" | "REJECT";
  payoutTrxId?: string;
  adminNotes?: string;
}) {
  const payout = await prisma.affiliatePayoutRequest.findUnique({
    where: { id: data.payoutId },
    include: {
      user: true,
      affiliateProfile: true,
    },
  });

  if (!payout) {
    throw new Error("Payout request not found");
  }

  if (data.action === "APPROVE_WALLET") {
    // 1-Click Instant Wallet Credit (Atomic State Machine & Transaction)
    await prisma.$transaction(async (tx) => {
      // 1. Atomic claim of eligible payout row
      const claim = await tx.affiliatePayoutRequest.updateMany({
        where: {
          id: payout.id,
          status: { in: ["REQUESTED", "PROCESSING"] },
        },
        data: {
          status: "PROCESSING",
        },
      });

      if (claim.count === 0) {
        throw new Error(`Payout request is already processed or completed.`);
      }

      // 2. Increment user wallet balance
      await tx.user.update({
        where: { id: payout.userId },
        data: { walletBalanceBDT: { increment: payout.amountBDT } },
      });

      // 3. Create wallet transaction record
      await tx.walletTransaction.create({
        data: {
          userId: payout.userId,
          amountBDT: payout.amountBDT,
          type: "REFUND",
          status: "APPROVED",
          method: "WALLET",
          trxId: `AFF_PAYOUT_${payout.id}`,
          note: `Affiliate Commission Payout (Ref: ${payout.id})`,
        },
      });

      // 4. Mark payout as COMPLETED
      await tx.affiliatePayoutRequest.update({
        where: { id: payout.id },
        data: {
          status: "COMPLETED",
          payoutTrxId: data.payoutTrxId || `WLL-AFF-${payout.id.slice(-6)}`,
          adminNotes: data.adminNotes || "Credited to internal wallet balance",
          reviewedBy: data.adminEmail,
          reviewedAt: new Date(),
          processedAt: new Date(),
        },
      });

      // 5. Update affiliate lifetime paid amount
      await tx.affiliateProfile.update({
        where: { id: payout.affiliateProfileId },
        data: { totalPaidBDT: { increment: payout.amountBDT } },
      });
    });

    // Central Notification Dispatch
    dispatchNotificationEvent({
      eventType: NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_COMPLETED,
      entityType: "PAYOUT",
      entityId: payout.id,
      userId: payout.userId,
      recipientEmail: payout.user.email || undefined,
      dedupeKey: `affiliate_payout_completed_${payout.id}`,
      payload: {
        payoutId: payout.id,
        userId: payout.userId,
        customerName: payout.user.name || "Affiliate",
        customerEmail: payout.user.email || "",
        amountBDT: payout.amountBDT,
        payoutMethod: "WALLET",
        payoutTrxId: data.payoutTrxId || `WLL-AFF-${payout.id.slice(-6)}`,
        status: "COMPLETED",
        dashboardUrl: "/dashboard/affiliate",
      },
    }).catch((e) => console.warn("Payout completed notification failed:", e));

    return { success: true, status: "COMPLETED", method: "WALLET" };

  } else if (data.action === "COMPLETE_MFS") {
    if (!data.payoutTrxId || !data.payoutTrxId.trim()) {
      throw new Error("Transaction ID (payoutTrxId) is required to complete external MFS / Bank payout");
    }

    await prisma.$transaction(async (tx) => {
      // 1. Atomic claim of eligible payout row
      const claim = await tx.affiliatePayoutRequest.updateMany({
        where: {
          id: payout.id,
          status: { in: ["REQUESTED", "PROCESSING"] },
        },
        data: {
          status: "PROCESSING",
        },
      });

      if (claim.count === 0) {
        throw new Error(`Payout request is already processed or completed.`);
      }

      await tx.affiliatePayoutRequest.update({
        where: { id: payout.id },
        data: {
          status: "COMPLETED",
          payoutTrxId: data.payoutTrxId ? data.payoutTrxId.trim() : null,
          adminNotes: data.adminNotes || null,
          reviewedBy: data.adminEmail,
          reviewedAt: new Date(),
          processedAt: new Date(),
        },
      });

      await tx.affiliateProfile.update({
        where: { id: payout.affiliateProfileId },
        data: { totalPaidBDT: { increment: payout.amountBDT } },
      });
    });

    // Central Notification Dispatch
    dispatchNotificationEvent({
      eventType: NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_COMPLETED,
      entityType: "PAYOUT",
      entityId: payout.id,
      userId: payout.userId,
      recipientEmail: payout.user.email || undefined,
      dedupeKey: `affiliate_payout_completed_${payout.id}`,
      payload: {
        payoutId: payout.id,
        userId: payout.userId,
        customerName: payout.user.name || "Affiliate",
        customerEmail: payout.user.email || "",
        amountBDT: payout.amountBDT,
        payoutMethod: payout.payoutMethod,
        payoutPhone: payout.payoutPhone || "",
        payoutTrxId: data.payoutTrxId.trim(),
        status: "COMPLETED",
        dashboardUrl: "/dashboard/affiliate",
      },
    }).catch((e) => console.warn("Payout completed notification failed:", e));

    return { success: true, status: "COMPLETED", method: payout.payoutMethod };

  } else if (data.action === "REJECT") {
    // Refund requested amount back to earningsBalanceBDT (Atomic State Machine & Transaction)
    await prisma.$transaction(async (tx) => {
      // 1. Atomic claim of eligible payout row
      const claim = await tx.affiliatePayoutRequest.updateMany({
        where: {
          id: payout.id,
          status: { in: ["REQUESTED", "PROCESSING"] },
        },
        data: {
          status: "REJECTED",
          adminNotes: data.adminNotes || "Rejected by administrator",
          reviewedBy: data.adminEmail,
          reviewedAt: new Date(),
        },
      });

      if (claim.count === 0) {
        throw new Error(`Payout request is already processed or completed.`);
      }

      await tx.affiliateProfile.update({
        where: { id: payout.affiliateProfileId },
        data: { earningsBalanceBDT: { increment: payout.amountBDT } },
      });
    });

    // Central Notification Dispatch
    dispatchNotificationEvent({
      eventType: NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_REJECTED,
      entityType: "PAYOUT",
      entityId: payout.id,
      userId: payout.userId,
      recipientEmail: payout.user.email || undefined,
      dedupeKey: `affiliate_payout_rejected_${payout.id}`,
      payload: {
        payoutId: payout.id,
        userId: payout.userId,
        customerName: payout.user.name || "Affiliate",
        customerEmail: payout.user.email || "",
        amountBDT: payout.amountBDT,
        payoutMethod: payout.payoutMethod,
        adminNotes: data.adminNotes || "Rejected by administrator. Balance has been refunded.",
        status: "REJECTED",
        dashboardUrl: "/dashboard/affiliate",
      },
    }).catch((e) => console.warn("Payout rejected notification failed:", e));

    return { success: true, status: "REJECTED", refundedAmountBDT: payout.amountBDT };
  } else {
    throw new Error(`Unsupported review action: ${data.action}`);
  }
}
