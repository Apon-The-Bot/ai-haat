import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getMetaSettings, metaActive } from "./meta-settings";
import { META_PROVIDER, purchaseEligible, purchaseEventId } from "./meta-purchase";

// Called only by trusted payment transitions. No provider network request runs here.
export async function trackServerPurchase(orderId: string): Promise<void> {
  try {
    const settings = await getMetaSettings();
    const browser = !!metaActive(settings, "browser", "Purchase");
    const capi = !!metaActive(settings, "capi", "Purchase") && !!settings.tokenCiphertext;
    if (!browser && !capi) return;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderNumber: orderId }], paymentStatus: "VERIFIED", metaConsentId: { not: null } },
    });
    if (!order || !purchaseEligible(order) || order.analyticsPurchaseSentAt) return;
    await prisma.analyticsEvent.create({
      data: {
        eventName: "Purchase",
        orderId: order.orderNumber,
        provider: META_PROVIDER,
        eventId: purchaseEventId(order.orderNumber),
        payload: JSON.stringify({ pixelId: settings.pixelId, browser, advanced: settings.advanced }),
        status: capi ? "PENDING" : "BROWSER_ONLY",
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return;
    console.warn("[Meta analytics] Purchase could not be queued");
  }
}
