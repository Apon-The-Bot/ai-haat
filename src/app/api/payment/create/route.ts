import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`payment-create:${ip}`, 6, 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterMs, "পেমেন্ট রিকোয়েস্ট সীমা অতিক্রম করেছে। কিছুক্ষণ পর আবার চেষ্টা করুন।");
  }

  try {
    const body = await req.json();
    const {
      orderId,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      metadata,
    } = body;

    const baseUrl = process.env.PIPRAPAY_BASE_URL;
    const apiKey = process.env.PIPRAPAY_API_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { success: false, message: "PipraPay Payment Gateway is not configured." },
        { status: 503 }
      );
    }

    // SECURITY FIX: Use canonical server-configured URL instead of request headers
    const siteUrl = process.env.NEXTAUTH_URL || "https://aihaat.shop";

    const currentOrderId = (orderId || `AH-${Date.now().toString().slice(-5)}`).trim();
    let payableAmount = 0;

    // 1. Derive authoritative payable amount
    if (!currentOrderId.startsWith("WT-")) {
      // STORE ORDER: Amount MUST come from database — never trust client
      const orderRecord = await prisma.order.findFirst({
        where: {
          OR: [
            { orderNumber: currentOrderId },
            { id: currentOrderId },
          ],
        },
      });

      if (!orderRecord) {
        return NextResponse.json(
          { success: false, message: "Order not found." },
          { status: 404 }
        );
      }

      // V12 FIX: Block re-payment of already verified orders
      if (orderRecord.paymentStatus === "VERIFIED") {
        return NextResponse.json(
          { success: false, message: "This order is already paid." },
          { status: 400 }
        );
      }

      payableAmount = Number(orderRecord.totalBDT);
    } else {
      // WALLET TOP-UP: Accept client amount but enforce minimum
      payableAmount = Number(amount);
      const MIN_RECHARGE_BDT = 10;
      if (!payableAmount || payableAmount < MIN_RECHARGE_BDT) {
        return NextResponse.json(
          { success: false, message: `Minimum recharge amount is ৳${MIN_RECHARGE_BDT}.` },
          { status: 400 }
        );
      }
    }

    if (!payableAmount || payableAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payment amount." },
        { status: 400 }
      );
    }

    const cleanEmail = (customerEmail || "").trim().toLowerCase();
    const cleanPhone = (customerPhone || "01700000000").trim();
    const cleanName = (customerName || "Customer").trim();

    const returnUrl = `${siteUrl}/api/payment/callback?orderId=${encodeURIComponent(currentOrderId)}`;

    const payload = {
      full_name: cleanName,
      email_address: cleanEmail || "customer@aihaat.shop",
      mobile_number: cleanPhone,
      amount: payableAmount.toFixed(2),
      currency: "BDT",
      return_url: returnUrl,
      webhook_url: `${siteUrl}/api/payment/webhook`,
      metadata: {
        orderId: currentOrderId,
        email: cleanEmail,
        userId: metadata?.userId || "",
        ...(metadata || {}),
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    let response;
    try {
      response = await fetch(`${baseUrl}/api/checkout/redirect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "MHS-PIPRAPAY-API-KEY": apiKey,
          "X-Api-Key": apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      if (fetchErr.name === "AbortError") {
        return NextResponse.json(
          { success: false, message: "Payment gateway timed out. Please try again." },
          { status: 504 }
        );
      }
      throw fetchErr;
    }

    clearTimeout(timeout);

    const data = await response.json();

    if (data && (data.pp_url || data.url)) {
      return NextResponse.json({
        success: true,
        pp_url: data.pp_url || data.url,
        pp_id: data.pp_id || data.transaction_ref,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: data?.error?.message || data?.message || "Failed to generate gateway payment URL",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Payment Create Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to initialize payment. Please try again." },
      { status: 500 }
    );
  }
}
