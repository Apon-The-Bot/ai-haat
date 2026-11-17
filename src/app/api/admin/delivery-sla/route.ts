import { NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { deliveryPromiseMinutes, deliveryWindowDays, pendingDeadline, summarizeDeliveryMinutes } from "@/lib/admin/delivery-sla";

const headers = { "Cache-Control": "private, no-store" };
const originalDelivery = { isReplacement: false };
const verification = {
  where: { status: "PAYMENT_VERIFIED" },
  orderBy: { createdAt: "asc" as const },
  select: { createdAt: true },
  take: 1,
};

export async function GET() {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const now = new Date();
    const since = new Date(now.getTime() - deliveryWindowDays * 86_400_000);
    const [open, delivered] = await Promise.all([
      prisma.order.findMany({
        where: { paymentStatus: "VERIFIED", deliveryStatus: { in: ["ORDER_PLACED", "PREPARING", "PROCESSING"] } },
        select: {
          orderNumber: true,
          timelineEvents: verification,
          items: {
            where: { isRefunded: false, deliveryStatus: { in: ["ORDER_PLACED", "PREPARING", "PROCESSING"] } },
            select: { productId: true },
          },
        },
      }),
      prisma.order.findMany({
        where: {
          deliveryStatus: "DELIVERED",
          deliveredKeys: { some: { ...originalDelivery, deliveredAt: { gte: since } } },
        },
        select: {
          timelineEvents: verification,
          deliveredKeys: {
            where: originalDelivery,
            orderBy: { deliveredAt: "desc" },
            select: { deliveredAt: true },
            take: 1,
          },
        },
      }),
    ]);
    const productIds = Array.from(new Set(open.flatMap((order) =>
      order.items.flatMap(({ productId }) => productId ? [productId] : []))));
    // Load only catalog timing fields, in batches to keep query parameters bounded.
    const promises = new Map<string, number | null>();
    for (let i = 0; i < productIds.length; i += 500) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds.slice(i, i + 500) } },
        select: { id: true, deliveryTime: true },
      });
      for (const product of products) promises.set(product.id, deliveryPromiseMinutes(product.deliveryTime));
    }

    let unknownCount = 0;
    const overdue = open.flatMap((order) => {
      const status = pendingDeadline(order.timelineEvents[0]?.createdAt, order.items.map(({ productId }) =>
        productId ? promises.get(productId) ?? null : null), now);
      if (!status || (status.incomplete && !status.overdue)) unknownCount++;
      return status?.overdue ? [{ orderNumber: order.orderNumber, deadline: status.deadline }] : [];
    }).sort((a, b) => a.deadline - b.deadline || a.orderNumber.localeCompare(b.orderNumber));
    const durations = delivered.flatMap((order) => {
      const verifiedAt = order.timelineEvents[0]?.createdAt;
      const deliveredAt = order.deliveredKeys[0]?.deliveredAt;
      return verifiedAt && deliveredAt && deliveredAt >= verifiedAt && deliveredAt <= now
        ? [deliveredAt.getTime() - verifiedAt.getTime()]
        : [];
    });
    return NextResponse.json({
      overdueCount: overdue.length,
      unknownCount,
      overdueOrders: overdue.slice(0, 5),
      timing: summarizeDeliveryMinutes(durations),
      excludedTimingCount: delivered.length - durations.length,
    }, { headers });
  } catch (error) {
    console.error("Failed to load delivery SLA metrics", error);
    return NextResponse.json({ error: "Could not load delivery SLA metrics" }, { status: 500, headers });
  }
}
