import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { resolveDateRange, generateReportCSV } from "@/lib/analytics/business-intelligence";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "SALES").toUpperCase(); // "SALES" | "PRODUCTS" | "CUSTOMERS" | "PAYMENTS" | "COUPONS"
    const range = searchParams.get("range") || "30D";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const filter = resolveDateRange(range, customStart, customEnd);
    const csvData = await generateReportCSV(type, filter);

    const filename = `AI_Haat_${type}_Report_${filter.preset}_${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[Reports CSV Export Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export report CSV" },
      { status: 500 }
    );
  }
}
