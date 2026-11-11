import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { getOrderNotificationFeed } from "@/lib/commerce/order-notification-feed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    return NextResponse.json(
      { success: true, orders: await getOrderNotificationFeed(auth.user) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("[Order notification feed GET error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch order notifications" }, { status: 500 });
  }
}
