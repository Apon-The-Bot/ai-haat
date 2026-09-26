import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { getStockWaitlistAdminMetrics } from "@/lib/commerce/stock-waitlist";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const metrics = await getStockWaitlistAdminMetrics();
    return NextResponse.json({ success: true, ...metrics });
  } catch (error: any) {
    console.error("[Admin StockWaitlist GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch stock waitlist metrics" },
      { status: 500 }
    );
  }
}
