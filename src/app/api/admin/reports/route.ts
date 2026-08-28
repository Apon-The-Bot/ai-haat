import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import {
  resolveDateRange,
  getCommercialOverview,
  getSalesTimeSeries,
  getProductPerformanceReport,
  getProfitAndMarginReport,
  getSupplierPerformanceReport,
  getInventoryValuationReport,
  getCustomerCohortsReport,
  getPaymentGatewayReport,
  getCouponPerformanceReport,
  getInventoryOperationalReport,
  getAfterSalesMetrics,
  getAcquisitionReport,
} from "@/lib/analytics/business-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30D";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");
    const tab = searchParams.get("tab") || "OVERVIEW";

    const filter = resolveDateRange(range, customStart, customEnd);

    // Tab-specific or full report payload
    const [
      overview,
      salesTimeSeries,
      productPerformance,
      profitAndMargin,
      supplierPerformance,
      inventoryValuation,
      customerCohorts,
      paymentGateways,
      couponPerformance,
      inventoryHealth,
      afterSales,
      acquisition,
    ] = await Promise.all([
      getCommercialOverview(filter),
      getSalesTimeSeries(filter),
      getProductPerformanceReport(filter),
      getProfitAndMarginReport(filter),
      getSupplierPerformanceReport(filter),
      getInventoryValuationReport(),
      getCustomerCohortsReport(filter),
      getPaymentGatewayReport(filter),
      getCouponPerformanceReport(filter),
      getInventoryOperationalReport(),
      getAfterSalesMetrics(filter),
      getAcquisitionReport(filter),
    ]);

    return NextResponse.json({
      success: true,
      report: {
        filter: {
          range: filter.preset,
          startDate: filter.startDate?.toISOString() || null,
          endDate: filter.endDate?.toISOString() || null,
        },
        overview,
        salesTimeSeries,
        productPerformance,
        profitAndMargin,
        supplierPerformance,
        inventoryValuation,
        customerCohorts,
        paymentGateways,
        couponPerformance,
        inventoryHealth,
        afterSales,
        acquisition,
      },
    });
  } catch (error: any) {
    console.error("[Reports GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate business intelligence reports" },
      { status: 500 }
    );
  }
}
