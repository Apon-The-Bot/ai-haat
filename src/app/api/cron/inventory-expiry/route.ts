import { NextRequest, NextResponse } from "next/server";
import { runInventoryExpiryCheck } from "@/lib/commerce/inventory";
import { isCronAuthorized } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

async function handleRequest(req: NextRequest) {
  try {
    const authorized = isCronAuthorized(req);
    if (!authorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing Bearer CRON_SECRET" },
        { status: 401 }
      );
    }

    const report = await runInventoryExpiryCheck();

    return NextResponse.json({
      success: true,
      report,
      expiredCount: report.expiredCount,
      expiringSoonCount: report.expiringSoonCount,
      customerExpiringCount: report.customerExpiringCount,
      customerNotifiedCount: report.customerNotifiedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Inventory Expiry Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
