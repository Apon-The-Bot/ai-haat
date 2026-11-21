import { Prisma } from "@prisma/client";
import { trackServerPurchase } from "@/lib/analytics/server";
import { tryAutoFulfillOrder } from "@/lib/commerce/inventory";
import { processPaidOrderCommission } from "@/lib/commerce/affiliates";
import { awardCoinsForOrder } from "@/lib/loyalty/coins";
import { dispatchNotificationEvent, NOTIFICATION_EVENTS } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { verifyEpsAttempt } from "./verify-attempt";

export async function finalizeEpsOrder(merchantTransactionId: string, userId: string) {
  const verified = await verifyEpsAttempt(merchantTransactionId, userId);
  if (!verified || verified.attempt.purpose !== "ORDER") return false;

  const order = await prisma.$transaction(async (tx) => {
    const attempt = await tx.epsPaymentAttempt.updateMany({
      where: {
        merchantTransactionId,
        userId,
        state: { in: ["INITIALIZING", "PENDING"] },
        OR: [{ providerTransactionId: null }, { providerTransactionId: verified.providerId }],
        ...(verified.settlementId && {
          AND: [{ OR: [{ settlementTransactionId: null }, { settlementTransactionId: verified.settlementId }] }],
        }),
      },
      data: { state: "FINALIZED", providerTransactionId: verified.providerId,
        settlementTransactionId: verified.settlementId, checkoutUrl: null },
    });
    if (!attempt.count) return null;

    const order = await tx.order.findUnique({
      where: { orderNumber: verified.attempt.reference },
      include: { _count: { select: { items: true } } },
    });
    const trxId = `EPS:${verified.attempt.mode}:${merchantTransactionId}`;
    const matchesOrder = order && order.userId === userId &&
      verified.amountBDT.equals(new Prisma.Decimal(order.totalBDT));
    if (!matchesOrder || !(await tx.order.updateMany({
      where: { id: order.id, userId, totalBDT: order.totalBDT, paymentStatus: "PENDING", deliveryStatus: { not: "CANCELLED" } },
      data: { paymentStatus: "VERIFIED", deliveryStatus: "PROCESSING", paymentMethod: "EPS", trxId },
    })).count) {
      await tx.epsPaymentAttempt.update({
        where: { merchantTransactionId },
        data: { state: "REVIEW_REQUIRED" },
      });
      return null;
    }
    await tx.orderTimelineEvent.create({
      data: { orderId: order.id, status: "PAYMENT_VERIFIED", actor: "EPS", note: trxId },
    });
    return { ...order, trxId };
  });

  if (!order) return false;
  const tasks = [
    ["analytics", () => trackServerPurchase(order.orderNumber)],
    ["notification", () => dispatchNotificationEvent({
      eventType: NOTIFICATION_EVENTS.PAYMENT_VERIFIED,
      entityType: "ORDER",
      entityId: order.id,
      userId,
      recipientEmail: order.customerEmail,
      dedupeKey: `payment_verified_${order.id}`,
      payload: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName || "Customer",
        customerEmail: order.customerEmail,
        amountBDT: order.totalBDT,
        trxId: order.trxId,
        paymentMethod: "EPS",
        itemsCount: order._count.items,
        orderUrl: new URL("/dashboard/orders", process.env.NEXTAUTH_URL || "https://aihaat.shop").href,
      },
    })],
    ["fulfillment", () => tryAutoFulfillOrder(order.orderNumber)],
    ["affiliate commission", () => processPaidOrderCommission(order.id)],
    ["loyalty", () => awardCoinsForOrder(order.id)],
  ] as const;
  const effects = await Promise.allSettled(tasks.map(async ([, run]) => run()));
  const failed = tasks.filter((_, index) => effects[index].status === "rejected").map(([name]) => name);
  if (failed.length) {
    await prisma.orderTimelineEvent.create({
      data: {
        orderId: order.id,
        status: "POST_PAYMENT_REVIEW",
        actor: "EPS",
        note: `EPS confirmed payment. Review: ${failed.join(", ")}.`,
      },
    }).catch(() => console.warn("[EPS] Post-payment review could not be recorded", order.id));
  }
  return true;
}
