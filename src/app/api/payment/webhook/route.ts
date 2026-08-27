import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/orders-db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Payment Webhook Received]:", body);

    const orderId = body?.metadata?.orderId || body?.orderId || body?.pp_id || "";
    const status = (body?.status || "").toLowerCase();
    const trxId = body?.transaction_id || body?.trx_id || body?.pp_id || "";
    const amount = Number(body?.amount || body?.total || 0);
    const email = (body?.email_address || body?.customer_email || body?.metadata?.email || "").toLowerCase().trim();
    const userId = body?.metadata?.userId || "";

    if (orderId && (status === "completed" || status === "success")) {
      if (orderId.startsWith("WT-") && (email || userId) && amount > 0) {
        let user = null;
        if (userId) {
          user = await prisma.user.findUnique({ where: { id: userId } });
        }
        if (!user && email) {
          user = await prisma.user.findFirst({
            where: {
              OR: [{ email }, { email: email.toLowerCase() }],
            },
          });
        }

        if (user) {
          const existing = await prisma.walletTransaction.findFirst({
            where: {
              trxId: trxId || orderId,
              status: "APPROVED",
            },
          });

          if (!existing) {
            await prisma.user.update({
              where: { id: user.id },
              data: { walletBalanceBDT: { increment: amount } },
            });

            await prisma.walletTransaction.create({
              data: {
                userId: user.id,
                amountBDT: amount,
                type: "DEPOSIT",
                method: "gateway",
                senderNumber: "GATEWAY",
                trxId: trxId || orderId,
                status: "APPROVED",
                note: `Automated Gateway IPN (${trxId})`,
              },
            });

            await prisma.notification.create({
              data: {
                userId: user.id,
                title: "ওয়ালেট রিচার্জ সফল!",
                message: `আপনার ওয়ালেটে ৳${amount} সফলভাবে জমা হয়েছে।`,
                type: "WALLET",
                link: "/dashboard/wallet",
              },
            });
            console.log(`✓ Webhook credited ৳${amount} to user ${user.email}`);
          }
        }
      } else {
        try {
          await prisma.order.updateMany({
            where: {
              OR: [{ orderNumber: orderId }, { id: orderId }],
            },
            data: {
              paymentStatus: "VERIFIED",
              deliveryStatus: "PROCESSING",
              trxId: trxId || undefined,
            },
          });
        } catch (dbErr) {
          console.warn("[Prisma Webhook Update Error]:", dbErr);
        }

        updateOrderStatus(orderId, {
          paymentStatus: "Completed",
          deliveryStatus: "Processing",
          trxId: trxId || undefined,
        });
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("[Webhook Handling Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
