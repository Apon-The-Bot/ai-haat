import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export type AccountStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "BANNED"
  | "RESTRICTED"
  | "PENDING_VERIFICATION"
  | "DEACTIVATED";

export type FeatureCategory =
  | "SHOPPING"
  | "FINANCIAL"
  | "DIGITAL_PRODUCTS"
  | "REWARDS"
  | "SUPPORT"
  | "ACCOUNT";

export interface FeatureDefinition {
  key: string;
  name: string;
  description: string;
  category: FeatureCategory;
  defaultAllowed: boolean;
}

export const SYSTEM_FEATURES: FeatureDefinition[] = [
  // SHOPPING
  {
    key: "SHOPPING_BROWSE",
    name: "Product Browsing",
    description: "Viewing product catalog, categories, and product details",
    category: "SHOPPING",
    defaultAllowed: true,
  },
  {
    key: "SHOPPING_CART",
    name: "Shopping Cart",
    description: "Adding items to cart and updating cart quantities",
    category: "SHOPPING",
    defaultAllowed: true,
  },
  {
    key: "SHOPPING_CHECKOUT",
    name: "Checkout Process",
    description: "Initiating checkout session and viewing payment gateways",
    category: "SHOPPING",
    defaultAllowed: true,
  },
  {
    key: "SHOPPING_PURCHASE",
    name: "Order Placement",
    description: "Submitting orders and completing product purchases",
    category: "SHOPPING",
    defaultAllowed: true,
  },
  {
    key: "SHOPPING_INVOICE",
    name: "Invoice Access",
    description: "Downloading and viewing official tax receipts/invoices",
    category: "SHOPPING",
    defaultAllowed: true,
  },

  // FINANCIAL
  {
    key: "WALLET_ACCESS",
    name: "Wallet Dashboard",
    description: "Viewing wallet balance and historical transactions",
    category: "FINANCIAL",
    defaultAllowed: true,
  },
  {
    key: "WALLET_PAYMENT",
    name: "Wallet Balance Payments",
    description: "Using accumulated wallet balance to pay for orders",
    category: "FINANCIAL",
    defaultAllowed: true,
  },
  {
    key: "WALLET_TOPUP",
    name: "Wallet Recharge",
    description: "Adding money to wallet via bKash, Nagad, Rocket, Bank",
    category: "FINANCIAL",
    defaultAllowed: true,
  },
  {
    key: "REFUND_REQUEST",
    name: "Refund Requests",
    description: "Requesting wallet or gateway refunds for orders",
    category: "FINANCIAL",
    defaultAllowed: true,
  },

  // DIGITAL PRODUCTS
  {
    key: "DIGITAL_LICENSE",
    name: "License Key Viewing",
    description: "Accessing software license keys and activation codes",
    category: "DIGITAL_PRODUCTS",
    defaultAllowed: true,
  },
  {
    key: "DIGITAL_CREDENTIALS",
    name: "Account Credentials Viewing",
    description: "Revealing account login credentials for digital services",
    category: "DIGITAL_PRODUCTS",
    defaultAllowed: true,
  },
  {
    key: "DIGITAL_DOWNLOAD",
    name: "Protected Downloads",
    description: "Downloading digital product files and installation guides",
    category: "DIGITAL_PRODUCTS",
    defaultAllowed: true,
  },
  {
    key: "DIGITAL_VAULT",
    name: "Digital Credential Vault",
    description: "Accessing encrypted personal vault storage",
    category: "DIGITAL_PRODUCTS",
    defaultAllowed: true,
  },
  {
    key: "GIFT_CLAIM",
    name: "Gift Unboxing & Claim",
    description: "Redeeming digital gift cards and unboxing gifted items",
    category: "DIGITAL_PRODUCTS",
    defaultAllowed: true,
  },
  {
    key: "REPLACEMENT_REQUEST",
    name: "Warranty Replacements",
    description: "Requesting replacements for faulty or revoked keys",
    category: "DIGITAL_PRODUCTS",
    defaultAllowed: true,
  },

  // REWARDS
  {
    key: "REWARDS_COUPON",
    name: "Coupon Usage",
    description: "Applying promotional discount coupon codes at checkout",
    category: "REWARDS",
    defaultAllowed: true,
  },
  {
    key: "REWARDS_COINS",
    name: "Loyalty Coins",
    description: "Earning and redeeming AI Haat loyalty coins",
    category: "REWARDS",
    defaultAllowed: true,
  },
  {
    key: "REWARDS_REFERRAL",
    name: "Affiliate & Referral System",
    description: "Sharing referral links and earning commission payouts",
    category: "REWARDS",
    defaultAllowed: true,
  },

  // SUPPORT
  {
    key: "SUPPORT_TICKETS",
    name: "Customer Support Tickets",
    description: "Creating new support tickets and sending replies",
    category: "SUPPORT",
    defaultAllowed: true,
  },
  {
    key: "PRODUCT_REQUEST",
    name: "Custom Product Requests",
    description: "Submitting requests for unlisted digital goods",
    category: "SUPPORT",
    defaultAllowed: true,
  },
  {
    key: "STOCK_WAITLIST",
    name: "Stock Waitlist Notifications",
    description: "Subscribing to out-of-stock product availability alerts",
    category: "SUPPORT",
    defaultAllowed: true,
  },

  // ACCOUNT
  {
    key: "AUTH_LOGIN",
    name: "Platform Authentication",
    description: "Logging into user account via email/password or OAuth",
    category: "ACCOUNT",
    defaultAllowed: true,
  },
  {
    key: "PROFILE_EDIT",
    name: "Profile Editing",
    description: "Modifying profile details, phone number, and preferences",
    category: "ACCOUNT",
    defaultAllowed: true,
  },
];

// Helper to sanitize sensitive fields from JSON payloads before logging
function sanitizeMetadata(obj: any): string {
  if (!obj || typeof obj !== "object") return "{}";
  const sanitized = { ...obj };
  const sensitiveKeys = [
    "password",
    "passwordHash",
    "token",
    "sessionToken",
    "totpSecret",
    "secret",
    "recoveryCode",
    "cardNumber",
    "cvv",
  ];
  for (const k of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
      sanitized[k] = "[REDACTED]";
    }
  }
  return JSON.stringify(sanitized);
}

/**
 * 1. User Activity Logger
 */
export async function logUserActivity(params: {
  userId: string;
  eventType: string;
  category: "AUTH" | "SHOPPING" | "FINANCIAL" | "REWARDS" | "DIGITAL" | "SECURITY" | "ADMIN";
  description: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.userActivityLog.create({
      data: {
        userId: params.userId,
        eventType: params.eventType,
        category: params.category,
        description: params.description,
        metadata: params.metadata ? sanitizeMetadata(params.metadata) : null,
        ipAddress: params.ipAddress ? params.ipAddress.slice(0, 45) : null,
        userAgent: params.userAgent ? params.userAgent.slice(0, 255) : null,
      },
    });
  } catch (err) {
    console.error("[logUserActivity error]:", err);
  }
}

/**
 * 2. Get User Effective Status (handles expiration)
 */
export async function getUserEffectiveStatus(userId: string): Promise<{
  status: AccountStatus;
  reason?: string;
  internalNote?: string;
  expiresAt?: Date | null;
  durationHours?: number | null;
  adminEmail?: string;
  recordId?: string;
}> {
  const activeRecord = await prisma.userStatusRecord.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (!activeRecord) {
    return { status: "ACTIVE" };
  }

  // Check if temporary suspension expired
  if (activeRecord.expiresAt && new Date() > activeRecord.expiresAt) {
    // Automatically retire expired status
    await prisma.userStatusRecord.update({
      where: { id: activeRecord.id },
      data: { isActive: false },
    });

    await logUserActivity({
      userId,
      eventType: "STATUS_RESTORED_EXPIRED",
      category: "SECURITY",
      description: `Temporary suspension expired. Account automatically restored to ACTIVE status.`,
    });

    return { status: "ACTIVE" };
  }

  return {
    status: activeRecord.status as AccountStatus,
    reason: activeRecord.reason,
    internalNote: activeRecord.internalNote || undefined,
    expiresAt: activeRecord.expiresAt,
    durationHours: activeRecord.durationHours,
    adminEmail: activeRecord.adminEmail,
    recordId: activeRecord.id,
  };
}

/**
 * 3. Set User Account Status (Active, Suspended, Banned, Restricted)
 */
export async function setUserStatus(params: {
  userId: string;
  status: AccountStatus;
  reason: string;
  internalNote?: string;
  durationHours?: number;
  adminId: string;
  adminEmail: string;
}): Promise<{ success: boolean; status: AccountStatus }> {
  const { userId, status, reason, internalNote, durationHours, adminId, adminEmail } = params;

  // Deactivate any previous active status records
  await prisma.userStatusRecord.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  let expiresAt: Date | null = null;
  if (durationHours && durationHours > 0) {
    expiresAt = new Date(Date.now() + durationHours * 3600 * 1000);
  }

  const record = await prisma.userStatusRecord.create({
    data: {
      userId,
      status,
      reason,
      internalNote,
      durationHours: durationHours || null,
      expiresAt,
      adminId,
      adminEmail,
      isActive: true,
    },
  });

  // If Banned or Suspended, invalidate all user sessions immediately!
  if (status === "BANNED" || status === "SUSPENDED") {
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.mfaSession.deleteMany({ where: { userId } });
  }

  // Log admin audit
  await logAdminAudit({
    actorId: adminId,
    actorEmail: adminEmail,
    action: `USER_STATUS_${status}`,
    targetType: "USER",
    targetId: userId,
    details: {
      newStatus: status,
      reason,
      internalNote,
      expiresAt: expiresAt?.toISOString() || null,
      sessionsRevoked: status === "BANNED" || status === "SUSPENDED",
    },
  });

  // Log user activity
  await logUserActivity({
    userId,
    eventType: `ACCOUNT_STATUS_${status}`,
    category: "ADMIN",
    description: `Account status updated to ${status} by administrator (${adminEmail}). Reason: ${reason}`,
  });

  return { success: true, status };
}

/**
 * 4. Check Feature Entitlement & Enforce Restrictions
 */
export async function checkFeatureEntitlement(
  userId: string,
  featureKey: string,
  context?: { amountBDT?: number; action?: string }
): Promise<{
  allowed: boolean;
  reason?: string;
  restriction?: any;
}> {
  if (!userId) {
    return { allowed: false, reason: "Authentication required." };
  }

  // 1. Check account-wide status first
  const effectiveStatus = await getUserEffectiveStatus(userId);
  if (effectiveStatus.status === "BANNED") {
    return {
      allowed: false,
      reason: `Your account has been permanently suspended by administration. Reason: ${effectiveStatus.reason || "Policy violation"}`,
    };
  }

  if (effectiveStatus.status === "SUSPENDED") {
    const expiryMsg = effectiveStatus.expiresAt
      ? ` until ${effectiveStatus.expiresAt.toLocaleString("bn-BD")}`
      : "";
    return {
      allowed: false,
      reason: `Your account is temporarily suspended${expiryMsg}. Reason: ${effectiveStatus.reason || "Administrative review"}`,
    };
  }

  // 2. Check granular feature restriction
  const restriction = await prisma.userRestriction.findFirst({
    where: {
      userId,
      featureKey,
      isRestricted: true,
    },
  });

  if (!restriction) {
    return { allowed: true };
  }

  // Check if restriction has expired
  if (restriction.expiresAt && new Date() > restriction.expiresAt) {
    await prisma.userRestriction.update({
      where: { id: restriction.id },
      data: { isRestricted: false },
    });
    return { allowed: true };
  }

  // Check action-level restriction if specified
  if (context?.action && restriction.actionRestrictions) {
    try {
      const actions = JSON.parse(restriction.actionRestrictions);
      if (Array.isArray(actions) && actions.length > 0) {
        if (!actions.includes(context.action)) {
          return { allowed: true }; // This specific action is not restricted
        }
      }
    } catch {}
  }

  // Check spending limit if specified
  if (restriction.spendingLimitBDT) {
    const limit = Number(restriction.spendingLimitBDT);
    if (context?.amountBDT !== undefined) {
      if (context.amountBDT > limit) {
        return {
          allowed: false,
          reason: `This transaction exceeds your configured spending limit of ৳${limit.toFixed(2)}.`,
          restriction,
        };
      }
      return { allowed: true }; // Allowed under spending limit
    }
  }

  return {
    allowed: false,
    reason: restriction.reason || "This feature is currently restricted for your account.",
    restriction,
  };
}

/**
 * 5. Set or Update Feature Restriction
 */
export async function setFeatureRestriction(params: {
  userId: string;
  featureKey: string;
  isRestricted: boolean;
  reason: string;
  adminNote?: string;
  actionRestrictions?: string[];
  spendingLimitBDT?: number;
  dailyLimitBDT?: number;
  durationHours?: number;
  adminId: string;
  adminEmail: string;
}) {
  const {
    userId,
    featureKey,
    isRestricted,
    reason,
    adminNote,
    actionRestrictions,
    spendingLimitBDT,
    dailyLimitBDT,
    durationHours,
    adminId,
    adminEmail,
  } = params;

  let expiresAt: Date | null = null;
  if (durationHours && durationHours > 0) {
    expiresAt = new Date(Date.now() + durationHours * 3600 * 1000);
  }

  const existing = await prisma.userRestriction.findFirst({
    where: { userId, featureKey },
  });

  let savedRestriction;
  if (existing) {
    savedRestriction = await prisma.userRestriction.update({
      where: { id: existing.id },
      data: {
        isRestricted,
        reason,
        adminNote,
        actionRestrictions: actionRestrictions ? JSON.stringify(actionRestrictions) : null,
        spendingLimitBDT: spendingLimitBDT !== undefined ? spendingLimitBDT : null,
        dailyLimitBDT: dailyLimitBDT !== undefined ? dailyLimitBDT : null,
        expiresAt,
        createdById: adminId,
      },
    });
  } else {
    savedRestriction = await prisma.userRestriction.create({
      data: {
        userId,
        featureKey,
        isRestricted,
        reason,
        adminNote,
        actionRestrictions: actionRestrictions ? JSON.stringify(actionRestrictions) : null,
        spendingLimitBDT: spendingLimitBDT !== undefined ? spendingLimitBDT : null,
        dailyLimitBDT: dailyLimitBDT !== undefined ? dailyLimitBDT : null,
        expiresAt,
        createdById: adminId,
      },
    });
  }

  // Log admin audit
  await logAdminAudit({
    actorId: adminId,
    actorEmail: adminEmail,
    action: isRestricted ? "FEATURE_RESTRICTED" : "FEATURE_RESTORED",
    targetType: "USER",
    targetId: userId,
    details: {
      featureKey,
      isRestricted,
      reason,
      adminNote,
      expiresAt: expiresAt?.toISOString() || null,
    },
  });

  // Log user activity
  await logUserActivity({
    userId,
    eventType: isRestricted ? "FEATURE_RESTRICTED" : "FEATURE_RESTORED",
    category: "ADMIN",
    description: `Feature ${featureKey} was ${isRestricted ? "restricted" : "restored"} by admin (${adminEmail}). Reason: ${reason}`,
  });

  return savedRestriction;
}

/**
 * 6. Financial Management: Wallet Add / Deduct with Atomic Integrity
 */
export async function adjustUserWalletBalance(params: {
  userId: string;
  type: "CREDIT" | "DEBIT";
  amountBDT: number;
  category: "BONUS" | "MANUAL_ADJUSTMENT" | "REFUND" | "PENALTY" | "CORRECTION";
  reason: string;
  reference?: string;
  internalNote?: string;
  adminId: string;
  adminEmail: string;
}): Promise<{
  success: boolean;
  previousBalance: number;
  newBalance: number;
  transactionId: string;
}> {
  const { userId, type, amountBDT, category, reason, reference, internalNote, adminId, adminEmail } = params;

  if (amountBDT <= 0) {
    throw new Error("Adjustment amount must be strictly greater than zero.");
  }

  const roundedAmount = Math.round(amountBDT * 100) / 100;

  // Execute core financial mutations inside an isolated atomic transaction
  const txResult = await prisma.$transaction(
    async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, walletBalanceBDT: true },
      });

      if (!user) {
        throw new Error("Target customer not found.");
      }

      const previousBalance = user.walletBalanceBDT || 0;
      let newBalance = previousBalance;

      if (type === "CREDIT") {
        newBalance = Math.round((previousBalance + roundedAmount) * 100) / 100;
      } else {
        if (previousBalance < roundedAmount) {
          throw new Error(
            `Insufficient wallet balance. Available: ৳${previousBalance.toFixed(2)}, Requested Deduction: ৳${roundedAmount.toFixed(2)}.`
          );
        }
        newBalance = Math.round((previousBalance - roundedAmount) * 100) / 100;
      }

      // 1. Create Immutable WalletTransaction record
      const trx = await tx.walletTransaction.create({
        data: {
          userId,
          amountBDT: roundedAmount,
          type: type === "CREDIT" ? "BONUS" : "PURCHASE",
          method: "ADMIN_ADJUSTMENT",
          status: "APPROVED",
          trxId: reference || `ADJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        },
      });

      // 2. Update user wallet balance atomically
      await tx.user.update({
        where: { id: userId },
        data: { walletBalanceBDT: newBalance },
      });

      return {
        previousBalance,
        newBalance,
        transactionId: trx.id,
        trxReference: trx.trxId,
        userEmail: user.email,
      };
    },
    { timeout: 15000, maxWait: 10000 }
  );

  // 3. Post-transaction audit and activity logging (asynchronous and non-blocking)
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorId: adminId,
        actorEmail: adminEmail,
        action: type === "CREDIT" ? "WALLET_MANUAL_CREDIT" : "WALLET_MANUAL_DEBIT",
        targetType: "WALLET",
        targetId: userId,
        details: JSON.stringify({
          previousBalance: txResult.previousBalance,
          newBalance: txResult.newBalance,
          amountBDT: roundedAmount,
          category,
          reason,
          reference: txResult.trxReference,
          internalNote,
        }),
      },
    });

    await prisma.userActivityLog.create({
      data: {
        userId,
        eventType: type === "CREDIT" ? "WALLET_CREDITED" : "WALLET_DEBITED",
        category: "FINANCIAL",
        description: `Wallet ${type === "CREDIT" ? "credited" : "debited"} by ৳${roundedAmount.toFixed(2)}. New balance: ৳${txResult.newBalance.toFixed(2)}. Reason: ${reason}`,
        metadata: JSON.stringify({
          transactionId: txResult.transactionId,
          reference: txResult.trxReference,
          amount: roundedAmount,
          category,
        }),
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: type === "CREDIT" ? "ওয়ালেট ব্যালেন্স যোগ হয়েছে" : "ওয়ালেট ব্যালেন্স কর্তন করা হয়েছে",
        message:
          type === "CREDIT"
            ? `আপনার ওয়ালেটে ৳${roundedAmount.toFixed(2)} যোগ করা হয়েছে। বর্তমান ব্যালেন্স: ৳${txResult.newBalance.toFixed(2)}। কারণ: ${reason}`
            : `আপনার ওয়ালেট থেকে ৳${roundedAmount.toFixed(2)} কর্তন করা হয়েছে। বর্তমান ব্যালেন্স: ৳${txResult.newBalance.toFixed(2)}। কারণ: ${reason}`,
        type: "WALLET",
      },
    });
  } catch (logErr) {
    console.warn("[Post-Wallet Log Warning]:", logErr);
  }

  return {
    success: true,
    previousBalance: txResult.previousBalance,
    newBalance: txResult.newBalance,
    transactionId: txResult.transactionId,
  };
}

/**
 * 7. Session Revocation
 */
export async function revokeAllUserSessions(userId: string, adminId: string, adminEmail: string) {
  const sessionCount = await prisma.session.count({ where: { userId } });
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.mfaSession.deleteMany({ where: { userId } });

  await logAdminAudit({
    actorId: adminId,
    actorEmail: adminEmail,
    action: "USER_SESSIONS_REVOKED",
    targetType: "USER",
    targetId: userId,
    details: { sessionsRevoked: sessionCount },
  });

  await logUserActivity({
    userId,
    eventType: "SESSIONS_REVOKED",
    category: "SECURITY",
    description: `All active browser and mobile sessions were revoked by administrator (${adminEmail}).`,
  });

  return { success: true, count: sessionCount };
}

/**
 * 8. Admin Notes Management
 */
export async function addAdminNote(params: {
  userId: string;
  adminId: string;
  adminEmail: string;
  note: string;
  category?: string;
}) {
  const { userId, adminId, adminEmail, note, category = "GENERAL" } = params;
  return await prisma.userAdminNote.create({
    data: {
      userId,
      adminId,
      adminEmail,
      note,
      category,
    },
  });
}

/**
 * 9. Tagging
 */
export async function setUserTags(userId: string, tags: string[], adminId: string) {
  // Remove existing
  await prisma.userTag.deleteMany({ where: { userId } });

  // Add new
  if (tags && tags.length > 0) {
    const data = tags.map((tag) => ({
      userId,
      tag: tag.trim().toUpperCase(),
      assignedById: adminId,
    }));
    await prisma.userTag.createMany({ data, skipDuplicates: true });
  }

  return await prisma.userTag.findMany({ where: { userId } });
}
