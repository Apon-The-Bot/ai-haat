import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { bulkUpdateProductStatus, bulkUpdateProductPrice } from "@/lib/commerce/products";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdminMfa();
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { action, productIds, status, adjustment } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid productIds" }, { status: 400 });
    }

    if (action === "STATUS") {
      if (!status) {
        return NextResponse.json({ success: false, error: "Status is required for STATUS action" }, { status: 400 });
      }
      await bulkUpdateProductStatus(productIds, status, authResult.user);
      return NextResponse.json({ success: true });
    } else if (action === "PRICE") {
      if (!adjustment || !adjustment.type || adjustment.value === undefined || !adjustment.direction) {
        return NextResponse.json({ success: false, error: "Adjustment details are required for PRICE action" }, { status: 400 });
      }
      await bulkUpdateProductPrice(productIds, adjustment, authResult.user);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
