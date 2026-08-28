import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveDateRange, getCommercialOverview, getSalesTimeSeries } from "@/lib/analytics/business-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "7D";

    const filter = resolveDateRange(period);
    const [overview, salesTrend] = await Promise.all([
      getCommercialOverview(filter),
      getSalesTimeSeries(filter),
    ]);

    // Total registered customers
    const totalCustomers = await prisma.user.count({
      where: { role: "USER" },
    });

    // Gateway distribution aggregated directly in MySQL database engine
    const gatewayGrouped = await prisma.order.groupBy({
      by: ["paymentMethod"],
      where: {
        paymentStatus: "VERIFIED",
        ...(filter.startDate ? { createdAt: { gte: filter.startDate } } : {}),
      },
      _sum: {
        totalBDT: true,
      },
    });

    const gatewayMap: Record<string, number> = {};
    for (const group of gatewayGrouped) {
      const method = (group.paymentMethod || "other").toLowerCase();
      gatewayMap[method] = (gatewayMap[method] || 0) + (group._sum.totalBDT || 0);
    }

    // Recent 6 Orders
    const recentOrders = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      stats: {
        period: filter.preset,
        revenue: overview.kpis.verifiedRevenue.current,
        netRevenue: overview.kpis.netRevenue.current,
        totalOrders: overview.kpis.totalOrders.current,
        verifiedOrdersCount: overview.kpis.verifiedOrders.current,
        averageOrderValue: overview.kpis.averageOrderValue.current,
        refundedAmount: overview.kpis.refundedValue.current,
        pendingFulfillment: overview.operational.pendingDeliveries,
        pendingDeposits: overview.operational.pendingPaymentReviews,
        totalCustomers,
        availableStockCount: overview.operational.availableStockCount,
        gatewayDistribution: gatewayMap,
        dailyTrend: salesTrend.map((s) => ({
          date: s.date,
          revenue: s.verifiedRevenue,
          orders: s.totalOrders,
        })),
        recentOrders: recentOrders.map((o) => ({
          id: o.orderNumber || o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          totalBDT: o.totalBDT,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          deliveryStatus: o.deliveryStatus,
          itemsSummary: o.items.map((it) => `${it.productName} (${it.variationName}) x${it.quantity}`).join(", "),
          createdAt: o.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error("[Dashboard Stats GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate dashboard statistics" },
      { status: 500 }
    );
  }
}
