import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/orders-db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId") || "";
  const ppStatus = (searchParams.get("pp_status") || searchParams.get("status") || "").toLowerCase();
  const transactionRef = searchParams.get("transaction_ref") || searchParams.get("pp_id") || "";

  // Dynamic host determination
  const host = req.headers.get("host") || "aihaat.shop";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const siteUrl = `${proto}://${host}`;

  let verifiedStatus = ppStatus || "completed";

  // Verify payment on PipraPay API if transaction reference is available
  if (transactionRef) {
    try {
      const baseUrl = process.env.PIPRAPAY_BASE_URL || "https://pay.aihaat.shop";
      const apiKey = process.env.PIPRAPAY_API_KEY || "6efac52b56d3a19e2b7f39d54df43a8653e5dd21fe93249f84";
      
      const verifyRes = await fetch(`${baseUrl}/api/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "MHS-PIPRAPAY-API-KEY": apiKey,
          "X-Api-Key": apiKey,
        },
        body: JSON.stringify({ pp_id: transactionRef }),
      });

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        if (verifyData?.status) {
          verifiedStatus = verifyData.status.toLowerCase();
        }
      }
    } catch (err) {
      console.error("[Verify Callback Error]:", err);
    }
  }

  // Update order status in database if verified
  if (verifiedStatus === "completed" || verifiedStatus === "success") {
    if (orderId) {
      try {
        await prisma.order.updateMany({
          where: {
            OR: [{ orderNumber: orderId }, { id: orderId }],
          },
          data: {
            paymentStatus: "VERIFIED",
            deliveryStatus: "PROCESSING",
            trxId: transactionRef || undefined,
          },
        });
      } catch (dbErr) {
        console.warn("[Prisma callback update order error]:", dbErr);
      }

      updateOrderStatus(orderId, {
        paymentStatus: "Completed",
        deliveryStatus: "Processing",
        trxId: transactionRef || undefined,
      });
    }

    // Payment Verified & Completed -> Redirect to Success Page
    return NextResponse.redirect(
      `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=completed&trxId=${encodeURIComponent(transactionRef)}`
    );
  } else if (verifiedStatus === "pending") {
    if (orderId) {
      try {
        await prisma.order.updateMany({
          where: {
            OR: [{ orderNumber: orderId }, { id: orderId }],
          },
          data: {
            paymentStatus: "PENDING",
            deliveryStatus: "PROCESSING",
            trxId: transactionRef || undefined,
          },
        });
      } catch (dbErr) {
        console.warn("[Prisma callback pending error]:", dbErr);
      }

      updateOrderStatus(orderId, {
        paymentStatus: "Pending",
        deliveryStatus: "Processing",
        trxId: transactionRef || undefined,
      });
    }

    // Payment Pending Verification
    return NextResponse.redirect(
      `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=pending&trxId=${encodeURIComponent(transactionRef)}`
    );
  } else {
    // Payment Failed or Canceled -> Return to Checkout with message
    return NextResponse.redirect(
      `${siteUrl}/checkout?payment_status=${encodeURIComponent(verifiedStatus || "failed")}&orderId=${encodeURIComponent(orderId)}`
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body?.metadata?.orderId || body?.orderId || body?.pp_id || "";
    const status = (body?.status || "").toLowerCase();
    const trxId = body?.transaction_id || body?.trx_id || body?.pp_id || "";

    if (orderId && (status === "completed" || status === "success")) {
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

      updateOrderStatus(orderId, {
        paymentStatus: "Completed",
        deliveryStatus: "Processing",
        trxId: trxId || undefined,
      });
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("[Payment Webhook Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
