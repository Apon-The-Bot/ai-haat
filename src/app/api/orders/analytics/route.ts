import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { checkRateLimit } from "@/lib/rate-limit";
import { consentId, META_CONSENT_COOKIE } from "@/lib/analytics/meta-consent";
import { getMetaSettings, metaActive } from "@/lib/analytics/meta-settings";
import { buildCapiPurchaseData, META_EVENT_AGE_MS, META_PROVIDER, purchaseEligible, purchaseEventId } from "@/lib/analytics/meta-purchase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (!checkRateLimit(`order-analytics:${auth.user.id}`, 20, 60_000).allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  const reference = req.nextUrl.searchParams.get("orderId");
  if (!reference || !/^[A-Za-z0-9_-]{1,100}$/.test(reference)) {
    return NextResponse.json({ error: "Invalid order reference" }, { status: 400 });
  }
  try {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: reference }, { orderNumber: reference }], userId: auth.user.id, paymentStatus: "VERIFIED", deliveryStatus: { not: "CANCELLED" } },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const eventId = purchaseEventId(order.orderNumber);
    let meta: { pixelId: string; data: ReturnType<typeof buildCapiPurchaseData> } | undefined;
    if (purchaseEligible(order) && consentId(req.cookies.get(META_CONSENT_COOKIE)?.value) === order.metaConsentId) {
      const [receipt, consent] = await Promise.all([
        prisma.analyticsEvent.findUnique({ where: { eventId } }),
        prisma.advertisingConsent.findUnique({ where: { id: order.metaConsentId! } }),
      ]);
      if (consent && consent.expiresAt > new Date() && receipt?.provider === META_PROVIDER && Date.now() - receipt.createdAt.getTime() < META_EVENT_AGE_MS) {
        const snapshot = JSON.parse(receipt.payload);
        const settings = await getMetaSettings();
        if (snapshot.browser === true && snapshot.pixelId === settings.pixelId && metaActive(settings, "browser", "Purchase")) {
          meta = { pixelId: settings.pixelId, data: buildCapiPurchaseData(order) };
        }
      }
    }
    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber, totalBDT: order.totalBDT, paymentStatus: order.paymentStatus, eventId,
        items: order.items.map(({ productId, variationId, productName, variationName, priceBDT, quantity }) =>
          ({ productId, variationId, productName, variationName, priceBDT, quantity })),
      },
      meta,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Order analytics unavailable" }, { status: 503 });
  }
}
