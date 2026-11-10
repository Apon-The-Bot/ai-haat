import { requireAdmin, requireAdminMfa, requireRecentMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import {
  getUserEffectiveStatus,
  SYSTEM_FEATURES,
  logUserActivity,
} from "@/lib/user-control/user-control-service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id: userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: {
          include: {
            items: true,
            timelineEvents: { orderBy: { createdAt: "asc" } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        coinTransactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        deliveredKeys: {
          select: {
            id: true,
            orderId: true,
            orderItemId: true,
            productName: true,
            accountType: true,
            deliveredAt: true,
            isReplacement: true,
          },
          orderBy: { deliveredAt: "desc" },
          take: 50,
        },
        security: true,
        sessions: {
          select: {
            id: true,
            expires: true,
          },
        },
        mfaSessions: {
          select: {
            id: true,
            mfaLevel: true,
            verifiedAt: true,
            createdAt: true,
          },
        },
        trustedDevices: {
          select: {
            id: true,
            label: true,
            lastUsedAt: true,
            createdAt: true,
            expiresAt: true,
            revokedAt: true,
          },
        },
        statusRecords: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        restrictions: {
          orderBy: { createdAt: "desc" },
        },
        adminNotes: {
          orderBy: { createdAt: "desc" },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        userTags: true,
        supportTickets: {
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
            category: true,
            status: true,
            priority: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        affiliateProfile: {
          include: {
            commissions: {
              orderBy: { createdAt: "desc" },
              take: 20,
            },
          },
        },
        refunds: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // 1. Calculate Financial KPIs
    const verifiedOrders = user.orders.filter((o) => o.paymentStatus === "VERIFIED");
    const lifetimeSpend = verifiedOrders.reduce((sum, o) => sum + (o.totalBDT || 0), 0);
    const totalRefundsBDT = user.refunds
      .filter((r) => r.status === "APPROVED" || r.status === "REFUNDED")
      .reduce((sum, r) => sum + (r.approvedAmountBDT || r.requestedAmountBDT || 0), 0);

    const creditTransactions = user.transactions.filter(
      (t) => (t.type === "DEPOSIT" || t.type === "BONUS" || t.type === "REFUND") && t.status === "APPROVED"
    );
    const lifetimeCreditsBDT = creditTransactions.reduce((sum, t) => sum + t.amountBDT, 0);

    const debitTransactions = user.transactions.filter(
      (t) => t.type === "PURCHASE" && t.status === "APPROVED"
    );
    const lifetimeDebitsBDT = debitTransactions.reduce((sum, t) => sum + t.amountBDT, 0);

    // 2. Resolve Effective Account Status
    const effectiveStatus = await getUserEffectiveStatus(user.id);

    // 3. Assemble Feature Entitlement Status
    const featureMap = SYSTEM_FEATURES.map((f) => {
      const activeRestriction = user.restrictions.find(
        (r) => r.featureKey === f.key && r.isRestricted
      );
      return {
        key: f.key,
        name: f.name,
        description: f.description,
        category: f.category,
        isAllowed: !activeRestriction,
        restriction: activeRestriction
          ? {
              id: activeRestriction.id,
              reason: activeRestriction.reason,
              adminNote: activeRestriction.adminNote,
              spendingLimitBDT: activeRestriction.spendingLimitBDT,
              dailyLimitBDT: activeRestriction.dailyLimitBDT,
              expiresAt: activeRestriction.expiresAt?.toISOString() || null,
              createdAt: activeRestriction.createdAt.toISOString(),
            }
          : null,
      };
    });

    // 4. Mask sensitive credentials in delivered keys (secrets revealed via audited reveal endpoint)
    const sanitizedDeliveredKeys = user.deliveredKeys.map((dk) => {
      return {
        id: dk.id,
        orderId: dk.orderId,
        orderItemId: dk.orderItemId,
        productName: dk.productName,
        accountType: dk.accountType,
        maskedValue: "•••••••••••••••••••••••• [Click Reveal to Inspect]",
        deliveredAt: dk.deliveredAt.toISOString(),
        isReplacement: dk.isReplacement,
      };
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || "Customer",
        email: user.email,
        phone: user.phone || "N/A",
        role: user.role,
        image: user.image || null,
        emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),

        // Status & Access
        status: effectiveStatus.status,
        statusReason: effectiveStatus.reason || null,
        statusExpiresAt: effectiveStatus.expiresAt?.toISOString() || null,
        statusHistory: user.statusRecords.map((sr) => ({
          id: sr.id,
          status: sr.status,
          reason: sr.reason,
          internalNote: sr.internalNote,
          adminEmail: sr.adminEmail,
          durationHours: sr.durationHours,
          expiresAt: sr.expiresAt?.toISOString() || null,
          createdAt: sr.createdAt.toISOString(),
          isActive: sr.isActive,
        })),

        // Financial Metrics
        walletBalanceBDT: user.walletBalanceBDT || 0,
        lifetimeSpendBDT: lifetimeSpend,
        lifetimeCreditsBDT,
        lifetimeDebitsBDT,
        totalRefundsBDT,
        totalOrdersCount: user.orders.length,
        verifiedOrdersCount: verifiedOrders.length,

        // Loyalty & Coins
        coinBalance: user.coinBalance || 0,
        lifetimeCoinsEarned: user.lifetimeCoinsEarned || 0,

        // Affiliate / Referral
        affiliate: user.affiliateProfile
          ? {
              code: user.affiliateProfile.referralCode,
              status: user.affiliateProfile.status,
              tier: user.affiliateProfile.tier,
              totalClicks: user.affiliateProfile.totalClicks,
              totalOrdersCount: user.affiliateProfile.totalOrdersCount,
              totalEarnedBDT: user.affiliateProfile.totalEarnedBDT,
              earningsBalanceBDT: user.affiliateProfile.earningsBalanceBDT,
            }
          : null,

        // Security & Sessions
        security: {
          isMfaEnabled: Boolean(user.security?.totpEnabled),
          totpEnabledAt: user.security?.totpEnabledAt?.toISOString() || null,
          activeSessionsCount: user.sessions.length,
          activeMfaSessionsCount: user.mfaSessions.length,
          trustedDevices: user.trustedDevices.map((td) => ({
            id: td.id,
            name: td.label || "Browser Device",
            lastUsedAt: td.lastUsedAt.toISOString(),
            isRevoked: Boolean(td.revokedAt),
          })),
        },

        // Tags & Notes
        tags: user.userTags.map((t) => t.tag),
        adminNotes: user.adminNotes.map((an) => ({
          id: an.id,
          note: an.note,
          category: an.category,
          adminEmail: an.adminEmail,
          createdAt: an.createdAt.toISOString(),
        })),

        // Features & Entitlements
        features: featureMap,

        // Orders List
        orders: user.orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          totalBDT: o.totalBDT,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          deliveryStatus: o.deliveryStatus,
          createdAt: o.createdAt.toISOString(),
          items: o.items.map((it) => ({
            id: it.id,
            productName: it.productName,
            variationName: it.variationName,
            quantity: it.quantity,
            priceBDT: it.priceBDT,
          })),
        })),

        // Wallet Transactions
        transactions: user.transactions.map((t) => ({
          id: t.id,
          amountBDT: t.amountBDT,
          type: t.type,
          method: t.method,
          trxId: t.trxId || "N/A",
          status: t.status,
          createdAt: t.createdAt.toISOString(),
        })),

        // Delivered Digital Products
        deliveredKeys: sanitizedDeliveredKeys,

        // Support Tickets
        supportTickets: user.supportTickets,

        // Notifications
        notifications: user.notifications.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        })),

        // Activity Logs
        activityLogs: user.activityLogs.map((al) => ({
          id: al.id,
          eventType: al.eventType,
          category: al.category,
          description: al.description,
          metadata: al.metadata ? JSON.parse(al.metadata) : null,
          ipAddress: al.ipAddress,
          createdAt: al.createdAt.toISOString(),
        })),
      },
    });
  } catch (err: any) {
    console.error("[Admin Users Single GET Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load user profile" }, { status: 500 });
  }
}

/**
 * PATCH: Edit User Personal Information
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const { id: userId } = await params;
    const body = await req.json();
    const { name, email, phone, role, image } = body;

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};
    const beforeState: any = {};
    const afterState: any = {};

    // 1. Email change
    if (email && email.toLowerCase().trim() !== existingUser.email) {
      const cleanEmail = email.toLowerCase().trim();
      const duplicate = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (duplicate && duplicate.id !== userId) {
        return NextResponse.json({ error: "This email address is already registered to another account" }, { status: 409 });
      }
      beforeState.email = existingUser.email;
      afterState.email = cleanEmail;
      updateData.email = cleanEmail;
    }

    // 2. Name change
    if (name !== undefined && name !== existingUser.name) {
      beforeState.name = existingUser.name;
      afterState.name = name.trim();
      updateData.name = name.trim();
    }

    // 3. Phone change
    if (phone !== undefined && phone !== existingUser.phone) {
      beforeState.phone = existingUser.phone;
      afterState.phone = phone ? phone.trim() : null;
      updateData.phone = phone ? phone.trim() : null;
    }

    // 4. Role change
    if (role && role !== existingUser.role) {
      const validRoles = ["USER", "RESELLER", "ADMIN"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
      }
      if (role === "ADMIN") {
        const stepUp = await requireRecentMfa(10);
        if (stepUp instanceof NextResponse) return stepUp;
      }
      beforeState.role = existingUser.role;
      afterState.role = role;
      updateData.role = role;
    }

    // 5. Image change
    if (image !== undefined && image !== existingUser.image) {
      beforeState.image = existingUser.image;
      afterState.image = image;
      updateData.image = image;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No changes detected", user: existingUser });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Log admin audit
    await logAdminAudit({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: "USER_PROFILE_UPDATED",
      targetType: "USER",
      targetId: userId,
      details: {
        before: beforeState,
        after: afterState,
      },
    });

    // Log user activity
    await logUserActivity({
      userId,
      eventType: "PROFILE_UPDATED_BY_ADMIN",
      category: "ADMIN",
      description: `Personal information updated by administrator (${currentAdmin.email}). Changed: ${Object.keys(afterState).join(", ")}`,
      metadata: afterState,
    });

    return NextResponse.json({
      success: true,
      message: "Customer profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        image: updatedUser.image,
      },
    });
  } catch (err: any) {
    console.error("[Admin Users Single PATCH Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update user profile" }, { status: 500 });
  }
}

/**
 * DELETE: Soft deactivation and anonymization of user account
 * (Preserves financial ledger integrity and historical order accounting)
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  // Deletion / Anonymization requires recent MFA step-up
  const stepUp = await requireRecentMfa(5);
  if (stepUp instanceof NextResponse) return stepUp;

  try {
    const { id: userId } = await params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { orders: true, transactions: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (user.id === currentAdmin.id) {
      return NextResponse.json({ error: "Cannot delete or deactivate your own account" }, { status: 400 });
    }

    // 1. Invalidate all active sessions
    await prisma.session.deleteMany({ where: { userId } });
    await prisma.mfaSession.deleteMany({ where: { userId } });

    // 2. Set Status to DEACTIVATED
    await prisma.userStatusRecord.create({
      data: {
        userId,
        status: "DEACTIVATED",
        reason: "Customer account deactivated and anonymized by administrative data governance request.",
        adminId: currentAdmin.id,
        adminEmail: currentAdmin.email,
        isActive: true,
      },
    });

    // 3. Anonymize PII while preserving financial orders and ledger integrity
    const anonymizedEmail = `anonymized_${userId.slice(0, 8)}@deleted.aihaat.local`;
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: "Deactivated Customer",
        email: anonymizedEmail,
        phone: null,
        image: null,
      },
    });

    // Log admin audit
    await logAdminAudit({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: "USER_DEACTIVATED_ANONYMIZED",
      targetType: "USER",
      targetId: userId,
      details: {
        previousEmail: user.email,
        anonymizedEmail,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Customer account has been deactivated and personal data anonymized.",
    });
  } catch (err: any) {
    console.error("[Admin Users Single DELETE Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to deactivate user" }, { status: 500 });
  }
}
