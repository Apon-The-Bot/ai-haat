import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { isSameOriginMutation } from "@/lib/security/csrf";
import { checkRateLimit } from "@/lib/rate-limit";
import { calculateOrderQuote } from "@/lib/commerce/pricing";
import { buildCapiPurchaseData } from "@/lib/analytics/meta-purchase";

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!isSameOriginMutation(req)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (!checkRateLimit(`analytics-checkout:${auth.user.id}`, 12, 60_000).allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body?.items) || !body.items.length || body.items.length > 30 ||
    !body.items.every((item: any) => typeof item?.productId === "string" && item.productId.length <= 191 &&
      (item.variationId == null || (typeof item.variationId === "string" && item.variationId.length <= 191)) &&
      Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 100)) {
    return NextResponse.json({ error: "Invalid quote items" }, { status: 400 });
  }
  try {
    const result = await calculateOrderQuote(body.items.map(({ productId, variationId, quantity }: {
      productId: string; variationId?: string | null; quantity: number;
    }) => ({ productId, variationId, quantity })), typeof body.coupon === "string" ? body.coupon.slice(0, 80) : undefined);
    if (!result.isValid) return NextResponse.json({ error: "Checkout quote unavailable" }, { status: 422 });
    const { order_id, ...data } = buildCapiPurchaseData({
      orderNumber: "", totalBDT: result.quote.totalBDT, items: result.quote.items,
    });
    return NextResponse.json({ data }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Checkout quote unavailable" }, { status: 503 });
  }
}
