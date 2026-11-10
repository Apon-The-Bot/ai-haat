import { requireAdminMfa } from "@/lib/auth-guard";
import { NextResponse } from "next/server";
import { sendOrderDeliveryEmail } from "@/utils/email";
import { prisma } from "@/lib/prisma";
import { encryptCredential } from "@/lib/mfa/crypto";
import { isSameOriginMutation } from "@/lib/security/csrf";

export async function POST(req: Request) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  if (!isSameOriginMutation(req)) return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });

  try {
    const {
      orderNumber, orderId, orderItemId, customerName, productName,
      accountType, variationName, credentials, instructions, downloadUrl, subject,
    } = await req.json();
    const reference = (orderId || orderNumber || "").trim();
    if (!reference || (!credentials && !downloadUrl)) {
      return NextResponse.json({ error: "Order ID and Credentials/Download link are required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { OR: [{ orderNumber: reference }, { id: reference }] },
    });
    if (!order?.userId || order.paymentStatus !== "VERIFIED" || order.deliveryStatus === "CANCELLED") {
      return NextResponse.json({ error: "A verified, account-owned order is required." }, { status: 409 });
    }
    if (orderItemId && !await prisma.orderItem.findFirst({
      where: { id: orderItemId, orderId: order.id },
      select: { id: true },
    })) {
      return NextResponse.json({ error: "Order item not found." }, { status: 404 });
    }

    const credentialsEncrypted = encryptCredential(credentials || `Download: ${downloadUrl}`);
    const deliveredKey = await prisma.$transaction(async (tx) => {
      // Serialize manual deliveries for the order, and recheck eligibility under the write lock.
      const updated = await tx.order.updateMany({
        where: { id: order.id, userId: order.userId, paymentStatus: "VERIFIED", deliveryStatus: { not: "CANCELLED" } },
        data: { deliveryStatus: "DELIVERED" },
      });
      if (!updated.count) return null;
      const key = await tx.deliveredKey.create({
        data: {
          orderId: order.id,
          orderItemId: orderItemId || null,
          userId: order.userId,
          productName: productName || "Digital Subscription",
          accountType: variationName || accountType || "Standard",
          credentials: "Encrypted at rest (View in Vault)",
          credentialsEncrypted,
          instructions: instructions || null,
        },
      });
      await tx.adminAuditLog.create({
        data: {
          actorId: auth.user.id,
          actorEmail: auth.user.email,
          action: "ORDER_MANUAL_DELIVERY",
          targetType: "ORDER",
          targetId: order.id,
          details: JSON.stringify({ orderNumber: order.orderNumber, productName, variationName, recipient: order.customerEmail }),
        },
      });
      return key;
    });
    if (!deliveredKey) return NextResponse.json({ error: "Order is no longer eligible for delivery." }, { status: 409 });

    try {
      const { dispatchNotificationEvent, NOTIFICATION_EVENTS } = await import("@/lib/notifications");
      await dispatchNotificationEvent({
        eventType: NOTIFICATION_EVENTS.ORDER_DELIVERED,
        entityType: "ORDER",
        entityId: order.id,
        userId: order.userId,
        recipientEmail: order.customerEmail,
        dedupeKey: `admin_delivery_${order.id}_${deliveredKey.id}`,
        payload: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          isConsolidated: true,
          deliveredItems: [{
            productName: deliveredKey.productName,
            variationName: deliveredKey.accountType,
            quantity: 1,
            hasCredentials: true,
            instructions: instructions || "Access your digital vault anytime.",
          }],
          pendingItemsCount: 0,
          vaultUrl: "https://aihaat.shop/dashboard/keys",
          orderUrl: "https://aihaat.shop/dashboard/orders",
        },
      });
    } catch (error) {
      console.warn("[Admin delivery notification failed]:", error);
    }
    const emailResult = order.customerEmail.includes("@")
      ? await sendOrderDeliveryEmail({
        customerName: customerName || order.customerName,
        customerEmail: order.customerEmail,
        orderId: reference,
        productName: productName || "Digital License",
        variationName: variationName || accountType,
        credentials,
        instructions,
        downloadUrl,
        subject,
      }).catch((error) => {
        console.warn("[Admin delivery email failed]:", error);
        return null;
      })
      : null;
    return NextResponse.json({ success: true, message: `Delivery recorded for order ${reference}.`, emailResult });
  } catch (error) {
    console.error("[Admin Deliver API Error]:", error);
    return NextResponse.json({ error: "Failed to deliver credentials" }, { status: 500 });
  }
}
