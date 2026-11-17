import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { getUserEffectiveStatus, logUserActivity } from "@/lib/user-control/user-control-service";
import crypto from "crypto";
import { sanitizeProfileImageUrl } from "@/lib/profile-image";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("search");
    const segment = searchParams.get("segment") || "ALL";
    const roleFilter = searchParams.get("role");
    const minWallet = searchParams.get("minWallet") ? parseFloat(searchParams.get("minWallet")!) : null;
    const maxWallet = searchParams.get("maxWallet") ? parseFloat(searchParams.get("maxWallet")!) : null;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    const whereClause: any = {};

    // 1. Role Filter
    if (roleFilter && roleFilter !== "ALL") {
      whereClause.role = roleFilter;
    }

    // 2. Search Query (Name, Email, Phone, ID)
    if (query && query.trim()) {
      const clean = query.trim();
      whereClause.OR = [
        { id: clean },
        { name: { contains: clean } },
        { email: { contains: clean } },
        { phone: { contains: clean } },
      ];
    }

    // 3. Wallet Range Filter
    if (minWallet !== null || maxWallet !== null) {
      whereClause.walletBalanceBDT = {};
      if (minWallet !== null && !isNaN(minWallet)) whereClause.walletBalanceBDT.gte = minWallet;
      if (maxWallet !== null && !isNaN(maxWallet)) whereClause.walletBalanceBDT.lte = maxWallet;
    }

    // 4. Segment Filter
    const now = new Date();
    if (segment === "RECENT_REGISTERED") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      whereClause.createdAt = { gte: sevenDaysAgo };
    } else if (segment === "INACTIVE") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      whereClause.createdAt = { lte: thirtyDaysAgo };
      whereClause.orders = { none: { createdAt: { gte: thirtyDaysAgo } } };
    } else if (segment === "HIGH_VALUE") {
      // Users with lifetime verified spend > 5,000 BDT or wallet balance > 2,000 BDT
      whereClause.OR = [
        { walletBalanceBDT: { gte: 2000 } },
        { orders: { some: { paymentStatus: "VERIFIED", totalBDT: { gte: 2000 } } } },
      ];
    } else if (segment === "PENDING_ORDERS") {
      whereClause.orders = { some: { deliveryStatus: { in: ["ORDER_PLACED", "PREPARING", "PROCESSING"] } } };
    } else if (segment === "WALLET_ACTIVITY") {
      whereClause.transactions = { some: {} };
    } else if (segment === "SUSPENDED" || segment === "BANNED" || segment === "RESTRICTED") {
      whereClause.statusRecords = {
        some: {
          status: segment,
          isActive: true,
        },
      };
    } else if (segment === "ACTIVE") {
      whereClause.statusRecords = {
        none: {
          status: { in: ["SUSPENDED", "BANNED"] },
          isActive: true,
        },
      };
    }

    // 5. Sorting
    let orderByClause: any = { createdAt: "desc" };
    if (sortBy === "walletBalanceBDT") {
      orderByClause = { walletBalanceBDT: sortOrder };
    } else if (sortBy === "name") {
      orderByClause = { name: sortOrder };
    } else if (sortBy === "createdAt") {
      orderByClause = { createdAt: sortOrder };
    }

    const total = await prisma.user.count({ where: whereClause });
    const totalPages = Math.ceil(total / pageSize);
    const skip = (page - 1) * pageSize;

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        orders: {
          select: {
            id: true,
            totalBDT: true,
            paymentStatus: true,
            deliveryStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        security: {
          select: {
            totpEnabled: true,
          },
        },
        statusRecords: {
          where: { isActive: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        restrictions: {
          where: { isRestricted: true },
          select: { featureKey: true },
        },
        userTags: {
          select: { tag: true },
        },
      },
      orderBy: orderByClause,
      skip,
      take: pageSize,
    });

    const formatted = users.map((u) => {
      const totalOrders = u.orders.length;
      const verifiedOrders = u.orders.filter((o) => o.paymentStatus === "VERIFIED");
      const totalSpent = verifiedOrders.reduce((sum, o) => sum + (o.totalBDT || 0), 0);
      const activeStatus = u.statusRecords[0]?.status || "ACTIVE";
      const hasRestrictions = u.restrictions.length > 0;

      return {
        id: u.id,
        name: u.name || "Customer",
        email: u.email,
        phone: u.phone || "N/A",
        role: u.role,
        image: sanitizeProfileImageUrl(u.image),
        walletBalanceBDT: u.walletBalanceBDT || 0,
        coinBalance: u.coinBalance || 0,
        status: activeStatus,
        statusReason: u.statusRecords[0]?.reason || null,
        statusExpiresAt: u.statusRecords[0]?.expiresAt?.toISOString() || null,
        hasRestrictions,
        restrictedFeatureCount: u.restrictions.length,
        tags: u.userTags.map((t) => t.tag),
        totalOrders,
        totalSpent,
        isMfaEnabled: Boolean(u.security?.totpEnabled),
        lastOrderDate: u.orders[0]?.createdAt?.toISOString() || null,
        joinDate: u.createdAt.toISOString().split("T")[0],
        createdAt: u.createdAt.toISOString(),
      };
    });

    // Dynamic Segment Counts for Tab Badges
    const [allCount, activeCount, suspendedCount, bannedCount, restrictedCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          statusRecords: {
            none: { status: { in: ["SUSPENDED", "BANNED"] }, isActive: true },
          },
        },
      }),
      prisma.user.count({
        where: { statusRecords: { some: { status: "SUSPENDED", isActive: true } } },
      }),
      prisma.user.count({
        where: { statusRecords: { some: { status: "BANNED", isActive: true } } },
      }),
      prisma.user.count({
        where: { restrictions: { some: { isRestricted: true } } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      users: formatted,
      segmentCounts: {
        ALL: allCount,
        ACTIVE: activeCount,
        SUSPENDED: suspendedCount,
        BANNED: bannedCount,
        RESTRICTED: restrictedCount,
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("[Admin Users GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export { POST } from "./create-user";
