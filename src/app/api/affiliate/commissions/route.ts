import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { DEFAULT_HOLDING_DAYS } from "@/lib/commerce/affiliates";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const statusFilter = url.searchParams.get("status");
    const skip = (page - 1) * limit;

    const whereClause: any = {
      affiliateProfile: { userId: user.id },
    };

    if (statusFilter && statusFilter !== "ALL") {
      whereClause.status = statusFilter;
    }

    const commissions = await prisma.affiliateCommission.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true,
            deliveryStatus: true,
            paymentStatus: true,
            items: {
              select: {
                productName: true,
                variationName: true,
                quantity: true,
                priceBDT: true,
              },
            },
          },
        },
      },
    });

    const total = await prisma.affiliateCommission.count({
      where: whereClause,
    });

    // Transform for the client
    const formatted = commissions.map((c: any) => {
      const createdAt = new Date(c.createdAt);
      const holdingReleaseDate = new Date(createdAt.getTime() + DEFAULT_HOLDING_DAYS * 24 * 60 * 60 * 1000);
      const isHolding = c.status === "PENDING";

      return {
        id: c.id,
        amount: c.commissionAmountBDT,
        commissionAmountBDT: c.commissionAmountBDT,
        orderTotalBDT: c.orderTotalBDT,
        commissionRatePercent: c.commissionRatePercent,
        status: c.status,
        orderNumber: c.order?.orderNumber,
        orderDate: c.order?.createdAt,
        orderStatus: c.order?.status,
        productNames: c.order?.items?.map((i: any) => i.productName) || [],
        items: c.order?.items || [],
        createdAt: c.createdAt,
        holdingReleaseDate: isHolding ? holdingReleaseDate.toISOString() : null,
        isHolding,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("GET /api/affiliate/commissions error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

