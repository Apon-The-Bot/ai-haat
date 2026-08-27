import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/orders-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[Payment Webhook Received]:", body);

    const orderId = body?.metadata?.orderId || body?.orderId || body?.pp_id || "";
    const status = (body?.status || "").toLowerCase();
    const trxId = body?.transaction_id || body?.trx_id || body?.pp_id || "";

    if (orderId && (status === "completed" || status === "success")) {
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

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    console.error("[Webhook Handling Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
