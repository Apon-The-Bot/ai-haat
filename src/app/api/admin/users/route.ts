import { requireAdmin, requireAdminMfa, requireRecentMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const singleUserId = searchParams.get("userId");
    const query = searchParams.get("query") || searchParams.get("search");
    const roleFilter = searchParams.get("role");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

    // Single Customer Detail View
    if (singleUserId) {
      const userRecord = await prisma.user.findUnique({
        where: { id: singleUserId },
        include: {
          orders: {
            include: {
              items: true,
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          security: {
            select: {
              totpEnabled: true,
              totpEnabledAt: true,
            },
          },
        },
      });

      if (!userRecord) {
        return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
      }

      const verifiedOrders = userRecord.orders.filter((o) => o.paymentStatus === "VERIFIED");
      const lifetimeSpend = verifiedOrders.reduce((sum, o) => sum + (o.totalBDT || 0), 0);

      return NextResponse.json({
        success: true,
        user: {
          id: userRecord.id,
          name: userRecord.name || "Customer",
          email: userRecord.email,
          phone: userRecord.phone || "N/A",
          role: userRecord.role,
          walletBalanceBDT: userRecord.walletBalanceBDT || 0,
          lifetimeSpend,
          totalOrders: userRecord.orders.length,
          verifiedOrdersCount: verifiedOrders.length,
          isMfaEnabled: Boolean(userRecord.security?.totpEnabled),
          joinedDate: userRecord.createdAt.toISOString().split("T")[0],
          createdAt: userRecord.createdAt.toISOString(),
          orders: userRecord.orders.map((o) => ({
            id: o.orderNumber || o.id,
            orderNumber: o.orderNumber,
            totalBDT: o.totalBDT,
            paymentMethod: o.paymentMethod,
            paymentStatus: o.paymentStatus,
            deliveryStatus: o.deliveryStatus,
            items: o.items.map((it) => `${it.productName} (${it.variationName}) x${it.quantity}`).join(", "),
            createdAt: o.createdAt.toISOString(),
          })),
          transactions: userRecord.transactions.map((t) => ({
            id: t.id,
            amountBDT: t.amountBDT,
            type: t.type,
            method: t.method,
            trxId: t.trxId || "N/A",
            status: t.status,
            createdAt: t.createdAt.toISOString(),
          })),
        },
      });
    }

    // Paginated Customer Listing
    const whereClause: any = {};

    if (roleFilter && roleFilter !== "ALL") {
      whereClause.role = roleFilter;
    }

    if (query && query.trim()) {
      const clean = query.trim();
      whereClause.OR = [
        { name: { contains: clean } },
        { email: { contains: clean } },
        { phone: { contains: clean } },
      ];
    }

    const total = await prisma.user.count({ where: whereClause });
    const totalPages = Math.ceil(total / pageSize);
    const skip = (page - 1) * pageSize;

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        walletBalanceBDT: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          select: {
            id: true,
            totalBDT: true,
            paymentStatus: true,
          },
        },
        security: {
          select: {
            totpEnabled: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    const formatted = users.map((u) => {
      const totalOrders = u.orders.length;
      const totalSpent = u.orders
        .filter((o) => o.paymentStatus === "VERIFIED")
        .reduce((sum, o) => sum + (o.totalBDT || 0), 0);

      return {
        id: u.id,
        name: u.name || "Customer",
        email: u.email,
        phone: u.phone || "N/A",
        role: u.role,
        walletBalanceBDT: u.walletBalanceBDT || 0,
        totalOrders,
        totalSpent,
        isMfaEnabled: Boolean(u.security?.totpEnabled),
        joinDate: u.createdAt.toISOString().split("T")[0],
        createdAt: u.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      users: formatted,
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

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const body = await req.json();
    const { userId, role, phone, name } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;

    if (role && role !== targetUser.role) {
      const validRoles = ["USER", "RESELLER", "ADMIN"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
      }

      // Security check: Promoting someone to ADMIN requires Step-Up MFA
      if (role === "ADMIN") {
        const stepUp = await requireRecentMfa(10);
        if (stepUp instanceof NextResponse) return stepUp;
      }

      // Prevent admin self-demotion if they are the only admin
      if (targetUser.id === currentAdmin.id && role !== "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: "Cannot demote yourself as the only active Administrator." },
            { status: 400 }
          );
        }
      }

      updateData.role = role;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Log admin audit
    if (role && role !== targetUser.role) {
      await logAdminAudit({
        actorId: currentAdmin.id,
        actorEmail: currentAdmin.email,
        action: role === "ADMIN" ? "ROLE_PROMOTED" : "ROLE_DEMOTED",
        targetType: "USER",
        targetId: targetUser.id,
        details: {
          targetEmail: targetUser.email,
          previousRole: targetUser.role,
          newRole: role,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `User details updated successfully.`,
      user: {
        id: updated.id,
        email: updated.email,
        role: updated.role,
        name: updated.name,
      },
    });
  } catch (error: any) {
    console.error("[Admin Users PATCH Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to update user" }, { status: 500 });
  }
}
