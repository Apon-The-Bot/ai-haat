/**
 * Warranty, Expiry, Replacement & Refund Policy Calculator
 */

export interface WarrantyStatus {
  isValid: boolean;
  expiresAt: Date;
  daysRemaining: number;
  isLifetime: boolean;
}

export interface EntitlementStatus {
  isActive: boolean;
  expiresAt: Date | null;
  daysRemaining: number | null;
  isLifetime: boolean;
}

export interface RefundEligibility {
  isEligible: boolean;
  isWithinWindow: boolean;
  isFullyRefunded: boolean;
  daysSince: number;
  reason?: string;
}

export interface ReplacementEligibility {
  isEligible: boolean;
  warrantyActive: boolean;
  isRefunded: boolean;
  hasOpenRequest: boolean;
  reason?: string;
}

/**
 * Calculate Warranty Status for a delivered product key
 */
export function calculateWarrantyStatus(deliveredAt: Date, warrantyDays: number): WarrantyStatus {
  const isLifetime = warrantyDays >= 36500; // e.g. 100 years
  if (isLifetime) {
    return {
      isValid: true,
      expiresAt: new Date("9999-12-31T23:59:59.999Z"),
      daysRemaining: 36500,
      isLifetime: true,
    };
  }

  const expiresAt = new Date(deliveredAt.getTime() + warrantyDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  return {
    isValid: daysRemaining > 0,
    expiresAt,
    daysRemaining: Math.max(0, daysRemaining),
    isLifetime: false,
  };
}

/**
 * Calculate Customer Entitlement Duration / Expiry (Subscription duration vs Lifetime)
 */
export function calculateCustomerEntitlementStatus(
  deliveredAt: Date,
  durationDays: number | null
): EntitlementStatus {
  if (!durationDays || durationDays <= 0) {
    return {
      isActive: true,
      expiresAt: null,
      daysRemaining: null,
      isLifetime: true,
    };
  }

  if (durationDays >= 36500) {
    return {
      isActive: true,
      expiresAt: new Date("9999-12-31T23:59:59.999Z"),
      daysRemaining: 36500,
      isLifetime: true,
    };
  }

  const expiresAt = new Date(deliveredAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  return {
    isActive: daysRemaining > 0,
    expiresAt,
    daysRemaining: Math.max(0, daysRemaining),
    isLifetime: false,
  };
}

/**
 * Calculate Refund Eligibility based on purchase-time snapshot policies
 */
export function calculateRefundEligibility(
  order: { createdAt: Date | string; refundStatus?: string | null },
  orderItem?: { isRefunded?: boolean; refundWindowDaysAtPurchase?: number; refundAllowedAtPurchase?: boolean } | null,
  delivery?: { deliveredAt?: Date | string } | null
): RefundEligibility {
  const now = new Date();
  const refDate = delivery?.deliveredAt ? new Date(delivery.deliveredAt) : new Date(order.createdAt);
  const refundDays = orderItem?.refundWindowDaysAtPurchase ?? 7;
  const isRefundAllowed = orderItem?.refundAllowedAtPurchase ?? true;

  const daysSince = Math.floor((now.getTime() - refDate.getTime()) / (24 * 60 * 60 * 1000));
  const isWithinWindow = daysSince <= refundDays;
  const isFullyRefunded = orderItem ? !!orderItem.isRefunded : order.refundStatus === "FULLY_REFUNDED";

  let reason: string | undefined = undefined;
  if (!isRefundAllowed) {
    reason = "Refund is not allowed for this product type.";
  } else if (isFullyRefunded) {
    reason = "This item or order has already been fully refunded.";
  } else if (!isWithinWindow) {
    reason = `Refund window (${refundDays} days) has expired (${daysSince} days since purchase/delivery).`;
  }

  return {
    isEligible: isRefundAllowed && isWithinWindow && !isFullyRefunded,
    isWithinWindow,
    isFullyRefunded,
    daysSince,
    reason,
  };
}

/**
 * Calculate Replacement Eligibility based on warranty & refund states
 */
export function calculateReplacementEligibility(
  deliveredKey: {
    warrantyExpiresAt?: Date | null;
    isReplacement?: boolean;
    replacementsAsOriginal?: Array<{ status: string }>;
  },
  orderItem?: { isRefunded?: boolean; replacementAllowedAtPurchase?: boolean } | null
): ReplacementEligibility {
  const now = new Date();
  const warrantyActive = deliveredKey.warrantyExpiresAt ? new Date(deliveredKey.warrantyExpiresAt) > now : true;
  const isRefunded = orderItem ? !!orderItem.isRefunded : false;
  const isReplacementAllowed = orderItem?.replacementAllowedAtPurchase ?? true;

  const activeReplacements = (deliveredKey.replacementsAsOriginal || []).filter(
    (r) => r.status === "REQUESTED" || r.status === "UNDER_REVIEW"
  );
  const hasOpenRequest = activeReplacements.length > 0;

  let reason: string | undefined = undefined;
  if (!isReplacementAllowed) {
    reason = "Replacement is not permitted for this product.";
  } else if (isRefunded) {
    reason = "This item has been refunded and cannot be replaced.";
  } else if (!warrantyActive) {
    reason = "Warranty period has expired.";
  } else if (hasOpenRequest) {
    reason = "A replacement request is already in progress.";
  }

  return {
    isEligible: isReplacementAllowed && warrantyActive && !isRefunded && !hasOpenRequest,
    warrantyActive,
    isRefunded,
    hasOpenRequest,
    reason,
  };
}

/**
 * Calculate Maximum Refundable Amount
 */
export function calculateMaxRefundableAmount(
  order: {
    totalBDT: number;
    subtotalBDT: number;
    discountBDT: number;
    items: Array<{ id: string; priceBDT: number; quantity: number; refundedBDT?: number }>;
    refundedBDT?: number;
  },
  targetOrderItemId?: string
): number {
  if (targetOrderItemId) {
    const item = order.items.find((i) => i.id === targetOrderItemId);
    if (!item) return 0;

    let netPaidValue = item.priceBDT * item.quantity;
    if (order.subtotalBDT > 0) {
      netPaidValue = (netPaidValue / order.subtotalBDT) * order.totalBDT;
    }

    const maxRefundable = netPaidValue - (item.refundedBDT || 0);
    return Math.max(0, maxRefundable);
  } else {
    const maxRefundable = order.totalBDT - (order.refundedBDT || 0);
    return Math.max(0, maxRefundable);
  }
}
