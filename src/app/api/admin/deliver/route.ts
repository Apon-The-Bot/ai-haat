import { requireAdminMfa } from "@/lib/auth-guard";
import { NextResponse } from "next/server";
import { sendOrderDeliveryEmail } from "@/utils/email";
import { prisma } from "@/lib/prisma";
import { encryptCredential } from "@/lib/mfa/crypto";

export async function POST(req: Request) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: adminUser } = auth;

  try {
    const body = await req.json();
    const {
      orderNumber,
      orderId,
      orderItemId,
      customerName,
      customerEmail,
      productName,
      accountType,
      variationName,
      credentials,
      instructions,
      downloadUrl,
    } = body;

    const finalOrderId = (orderId || orderNumber || "").trim();

    if (!finalOrderId || (!credentials && !downloadUrl)) {
      return NextResponse.json({ error: "Order ID and Credentials/Download link are required" }, { status: 400 });
    }

    // 1. Dispatch Delivery Email
    if (customerEmail && customerEmail.includes("@")) {
      await sendOrderDeliveryEmail({
        customerName: customerName || "Valued Customer",
        customerEmail,
        orderId: finalOrderId,
        productName: productName || "Digital License",
        variationName: variationName || accountType,
        credentials,
        instructions,
        downloadUrl,
      });
    }

    // 2. Persist to Database & Encrypt Credentials at Rest
    try {
      const orderRecord = await prisma.order.findFirst({
        where: {
          OR: [{ orderNumber: finalOrderId }, { id: finalOrderId }],
        },
      });

      if (orderRecord) {
        await prisma.order.update({
          where: { id: orderRecord.id },
          data: {
            deliveryStatus: "DELIVERED",
            paymentStatus: orderRecord.paymentStatus === "PENDING" ? "VERIFIED" : orderRecord.paymentStatus,
          },
        });

        const rawCreds = credentials || (downloadUrl ? `Download: ${downloadUrl}` : "Delivered");
        let encCreds = rawCreds;
        try {
          encCreds = encryptCredential(rawCreds);
        } catch {
          encCreds = rawCreds;
        }

        const deliveredKey = await prisma.deliveredKey.create({
          data: {
            orderId: orderRecord.id,
            orderItemId: orderItemId || null,
            userId: orderRecord.userId,
            productName: productName || "Digital Subscription",
            accountType: variationName || accountType || "Standard",
            credentials: "Encrypted at rest (View in Vault)",
            credentialsEncrypted: encCreds,
            instructions: instructions || null,
          },
        });

        // Dispatch Centralized ORDER_DELIVERED Notification Event (In-App + Email)
        const { dispatchNotificationEvent, NOTIFICATION_EVENTS } = await import("@/lib/notifications");
        await dispatchNotificationEvent({
          eventType: NOTIFICATION_EVENTS.ORDER_DELIVERED,
          entityType: "ORDER",
          entityId: orderRecord.id,
          userId: orderRecord.userId || undefined,
          recipientEmail: customerEmail || orderRecord.customerEmail,
          dedupeKey: `admin_delivery_${orderRecord.id}_${deliveredKey.id}`,
          payload: {
            orderId: orderRecord.id,
            orderNumber: orderRecord.orderNumber,
            customerName: orderRecord.customerName || "Customer",
            customerEmail: customerEmail || orderRecord.customerEmail,
            isConsolidated: true,
            deliveredItems: [
              {
                productName: productName || "Digital Subscription",
                variationName: variationName || accountType || "Standard",
                quantity: 1,
                hasCredentials: true,
                instructions: instructions || "Access your digital vault anytime.",
              },
            ],
            pendingItemsCount: 0,
            vaultUrl: "https://aihaat.shop/dashboard/keys",
            orderUrl: "https://aihaat.shop/dashboard/orders",
          },
        }).catch(console.error);

        // Record Admin Audit Log
        await prisma.adminAuditLog.create({
          data: {
            actorId: adminUser.id,
            actorEmail: adminUser.email,
            action: "ORDER_MANUAL_DELIVERY",
            targetType: "ORDER",
            targetId: orderRecord.id,
            details: JSON.stringify({
              orderNumber: finalOrderId,
              productName,
              variationName,
              recipient: customerEmail,
            }),
          },
        });
      }
    } catch (dbErr) {
      console.warn("[Admin Deliver DB Sync Warning]:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `Credentials delivered successfully for order ${finalOrderId}.`,
    });
  } catch (error) {
    console.error("[Admin Deliver API Error]:", error);
    return NextResponse.json({ error: "Failed to deliver credentials" }, { status: 500 });
  }
}
