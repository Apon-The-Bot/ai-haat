import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";
    const tier = url.searchParams.get("tier");
    
    // Filtering logic
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { referralCode: { contains: search, mode: "insensitive" } },
        { customSlug: { contains: search, mode: "insensitive" } },
      ];
    }
    if (tier && tier !== "All" && tier !== "ALL") {
      whereClause.tier = tier.toUpperCase();
    }

    const affiliates = await prisma.affiliateProfile.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Aggregations for total referred GMV, total commissions, tier distribution, pending payouts
    const [totalGMV, totalCommissions, totalPaid, pendingPayoutsAgg, tierDistribution, activePartnersCount] =
      await Promise.all([
        prisma.affiliateCommission.aggregate({
          _sum: { orderTotalBDT: true },
        }),
        prisma.affiliateCommission.aggregate({
          where: { status: { in: ["APPROVED", "PAID"] } },
          _sum: { commissionAmountBDT: true },
        }),
        prisma.affiliatePayoutRequest.aggregate({
          where: { status: "COMPLETED" },
          _sum: { amountBDT: true },
        }),
        prisma.affiliatePayoutRequest.aggregate({
          where: { status: "REQUESTED" },
          _count: { id: true },
          _sum: { amountBDT: true },
        }),
        prisma.affiliateProfile.groupBy({
          by: ["tier"],
          _count: { tier: true },
        }),
        prisma.affiliateProfile.count({
          where: { status: "ACTIVE" },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: affiliates,
      summary: {
        totalReferredGMV: totalGMV._sum?.orderTotalBDT || 0,
        totalCommissions: totalCommissions._sum?.commissionAmountBDT || 0,
        totalPaidOut: totalPaid._sum?.amountBDT || 0,
        pendingPayoutsCount: pendingPayoutsAgg._count.id || 0,
        pendingPayoutsAmount: pendingPayoutsAgg._sum?.amountBDT || 0,
        activePartnersCount,
        tierDistribution: tierDistribution.map((t) => ({ tier: t.tier, count: t._count.tier })),
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/affiliates error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

