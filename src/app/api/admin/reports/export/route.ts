import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { resolveDateRange, generateReportCSV, sanitizeCsvValue } from "@/lib/analytics/business-intelligence";
import { readDrilldown, sourceFor, type Source } from "@/app/admin/reports/drilldown/records";
import type { Query } from "@/app/admin/reconciliation/records";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "SALES").toUpperCase();
    const range = searchParams.get("range") || "30D";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const filter = resolveDateRange(range, customStart, customEnd);
    const supportedTypes = ["SALES", "PRODUCTS", "CUSTOMERS", "PAYMENTS", "COUPONS", "PROFIT", "SUPPLIERS", "PROCUREMENT"];
    let csvData: string;
    let filenameType = type;

    if (type === "DRILLDOWN") {
      const source = sourceFor(Object.fromEntries(searchParams.entries()) as Query) as Source;
      const rows = await readDrilldown(source, Object.fromEntries(searchParams.entries()) as Query, 0);
      const headers = ["Record ID", "Order Number", "Date (UTC)", "Detail", "Amount (BDT)"];
      csvData = [headers.join(","), ...rows.map((row) => [
        sanitizeCsvValue(row.id),
        sanitizeCsvValue(row.order?.orderNumber || ""),
        sanitizeCsvValue(row.date?.toISOString() || ""),
        sanitizeCsvValue(row.detail),
        row.amount ?? "",
      ].join(","))].join("\n");
      filenameType = `DRILLDOWN_${source}`;
    } else {
      if (!supportedTypes.includes(type)) {
        return NextResponse.json({ success: false, error: "Unsupported report export type" }, { status: 400 });
      }
      csvData = await generateReportCSV(type, filter);
    }

    const filename = `AI_Haat_${filenameType}_Report_${filter.preset}_${new Date().toISOString().split("T")[0]}.csv`;

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
