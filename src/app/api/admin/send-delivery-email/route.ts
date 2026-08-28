import { requireAdminMfa } from '@/lib/auth-guard';
import { NextResponse } from "next/server";
import { sendOrderDeliveryEmail } from "@/utils/email";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/orders-db";
import { encryptCredential } from "@/lib/mfa/crypto";

export async function POST(req: Request) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      orderId,
      productName,
      variationName,
      credentials,
      downloadUrl,
      instructions,
      subject,
    } = body;

    if (!customerEmail || (!credentials && !downloadUrl)) {
      return NextResponse.json(
        { error: "Recipient email and credentials/download URL are required." },
        { status: 400 }
      );
    }

    // 1. Send HTML Delivery Email via Hostinger SMTP
    const emailResult = await sendOrderDeliveryEmail({
      customerName: customerName || "Customer",
      customerEmail,
      orderId: orderId || "AH-ORDER",
      productName: productName || "Digital Subscription",
      variationName,
      credentials,
      downloadUrl,
      instructions,
      subject,
    });

    // 2. Update Order & Store Delivered Credentials in Database
    try {
      const orderRecord = await prisma.order.findFirst({
        where: {
          OR: [{ orderNumber: orderId }, { id: orderId }],
        },
      });

      if (orderRecord) {
        await prisma.order.update({
          where: { id: orderRecord.id },
          data: {
            deliveryStatus: "DELIVERED",
            paymentStatus: "VERIFIED",
          },
        });

        if (credentials || downloadUrl) {
          const rawCreds = credentials || (downloadUrl ? `Download Link: ${downloadUrl}` : "Delivered");
          let encCreds: string | null = null;
          try {
            encCreds = encryptCredential(rawCreds);
          } catch (e) {
            console.warn("[Delivery API] Encryption warning:", e);
          }

          await prisma.deliveredKey.create({
            data: {
              orderId: orderRecord.id,
              userId: orderRecord.userId,
              productName: productName || "Delivered Subscription",
              accountType: variationName || "Digital Credentials",
              credentials: "Encrypted at rest (Use Vault to view)", // Masked in legacy field
              credentialsEncrypted: encCreds || rawCreds,
              instructions: instructions || null,
            },
          });
        }

        if (orderRecord.userId) {
          await prisma.notification.create({
            data: {
              userId: orderRecord.userId,
              title: `অর্ডার #${orderId} ডেলিভারি সম্পন্ন!`,
              message: `আপনার ${productName || "প্রোডাক্ট"} এর লগইন তথ্য এবং ডিজিটাল কী প্রস্তুত রয়েছে।`,
              type: "DELIVERY",
              link: "/dashboard/keys",
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn("[DB Delivery Sync Warning]:", dbErr);
    }

    // 3. Sync to local memory file as fallback
    updateOrderStatus(orderId, {
      deliveryStatus: "Delivered",
      paymentStatus: "Completed",
      credentialsDelivered: "[DELIVERED - credentials encrypted in vault]",
      deliveryInstructions: instructions || "",
    });

    return NextResponse.json({
      success: true,
      message: `HTML delivery email successfully dispatched to ${customerEmail}!`,
      emailResult,
    });
  } catch (error: any) {
    console.error("API Send Delivery Email Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send delivery email" },
      { status: 500 }
    );
  }
}
