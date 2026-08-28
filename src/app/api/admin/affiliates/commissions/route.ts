import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { releaseHoldingCommissions, DEFAULT_HOLDING_DAYS } from "@/lib/commerce/affiliates";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "20", 10);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (status && status !== "ALL" && status !== "All") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
        { affiliateProfile: { referralCode: { contains: search, mode: "insensitive" } } },
        { affiliateProfile: { user: { email: { contains: search, mode: "insensitive" } } } },
        { affiliateProfile: { user: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }

    const [commissions, total, holdingAgg, approvedAgg] = await Promise.all([
      prisma.affiliateCommission.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          affiliateProfile: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
          order: {
            select: {
              orderNumber: true,
              totalBDT: true,
              deliveryStatus: true,
              paymentStatus: true,
              createdAt: true,
              items: {
                select: { productName: true, quantity: true, priceBDT: true },
              },
            },
          },
        },
      }),
      prisma.affiliateCommission.count({ where: whereClause }),
      prisma.affiliateCommission.aggregate({
        where: { status: "PENDING" },
        _sum: { commissionAmountBDT: true },
        _count: { id: true },
      }),
      prisma.affiliateCommission.aggregate({
        where: { status: { in: ["APPROVED", "PAID"] } },
        _sum: { commissionAmountBDT: true },
        _count: { id: true },
      }),
    ]);

    const formatted = commissions.map((c) => {
      const createdAt = new Date(c.createdAt);
      const holdingReleaseDate = new Date(createdAt.getTime() + DEFAULT_HOLDING_DAYS * 24 * 60 * 60 * 1000);
      const isMatured = c.status === "PENDING" && new Date() >= holdingReleaseDate;

      return {
        id: c.id,
        orderId: c.orderId,
        orderNumber: c.order?.orderNumber,
        orderTotalBDT: c.orderTotalBDT,
        orderStatus: c.order?.deliveryStatus,
        orderDate: c.order?.createdAt,
        commissionRatePercent: c.commissionRatePercent,
        commissionAmountBDT: c.commissionAmountBDT,
        status: c.status,
        partnerName: c.affiliateProfile?.user?.name || "Partner",
        partnerEmail: c.affiliateProfile?.user?.email || "N/A",
        referralCode: c.affiliateProfile?.referralCode,
        createdAt: c.createdAt,
        approvedAt: c.approvedAt,
        holdingReleaseDate: holdingReleaseDate.toISOString(),
        isMatured,
        products: c.order?.items?.map((i: any) => i.productName) || [],
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      summary: {
        totalPendingHoldingBDT: holdingAgg._sum?.commissionAmountBDT || 0,
        totalPendingHoldingCount: holdingAgg._count.id || 0,
        totalApprovedBDT: approvedAgg._sum?.commissionAmountBDT || 0,
        totalApprovedCount: approvedAgg._count.id || 0,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/affiliates/commissions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;
    const body = await req.json().catch(() => ({}));
    const action = body.action || "RELEASE_HOLDING";
    const holdingDays = body.holdingDays || DEFAULT_HOLDING_DAYS;

    if (action === "RELEASE_HOLDING") {
      const result = await releaseHoldingCommissions(holdingDays);

      await logAdminAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: "RELEASE_AFFILIATE_COMMISSIONS",
        targetType: "USER",
        targetId: "SYSTEM",
        details: { action, holdingDays, result },
      }).catch((err) => console.error("Audit log error:", err));

      return NextResponse.json({
        success: true,
        message: `Successfully released ${result.processedCount} matured commissions (Total ৳${result.totalReleasedBDT}).`,
        data: result,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/admin/affiliates/commissions error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
