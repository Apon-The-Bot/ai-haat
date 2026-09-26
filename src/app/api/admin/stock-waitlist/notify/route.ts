import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { notifyWaitingCustomersForProduct } from "@/lib/commerce/stock-waitlist";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { productId, variationId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }

    const result = await notifyWaitingCustomersForProduct(
      productId,
      variationId || null,
      auth.user
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Admin StockWaitlist Notify Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to notify waiting customers" },
      { status: 500 }
    );
  }
}
