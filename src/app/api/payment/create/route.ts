import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/auth-guard";
import { isSameOriginMutation } from "@/lib/security/csrf";
import { randomUUID } from "node:crypto";
import { checkFeatureEntitlement } from "@/lib/user-control/user-control-service";
import { initializeEpsAttempt } from "@/lib/payments/eps/initialize-attempt";

function parseBilling(value: unknown, fallback?: { name?: string; phone?: string }) {
  const fields = (value && typeof value === "object") ? (value as Record<string, unknown>) : {};
  const read = (key: string) => (typeof fields[key] === "string" ? fields[key].trim() : "");

  let rawPhone = read("phone") || fallback?.phone?.trim() || "";
  rawPhone = rawPhone.replace(/[^\d+]/g, "");
  if (rawPhone.startsWith("+880")) rawPhone = rawPhone.slice(4);
  else if (rawPhone.startsWith("880")) rawPhone = rawPhone.slice(3);
  if (!rawPhone.startsWith("0") && rawPhone.length === 10) rawPhone = `0${rawPhone}`;
  const phone = /^01\d{9}$/.test(rawPhone) ? rawPhone : "01700000000";

  const rawPostcode = read("postcode");
  const postcode = /^\d{4}$/.test(rawPostcode) ? rawPostcode : "1200";

  const name = (read("name") || fallback?.name?.trim() || "Customer").slice(0, 200);
  const address = (read("address") || "Dhaka, Bangladesh").slice(0, 200);
  const city = (read("city") || "Dhaka").slice(0, 200);
  const state = (read("state") || "Dhaka").slice(0, 200);

  return { name, phone, address, city, state, postcode };
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "Cross-site request forgery blocked" }, { status: 403 });
  }
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
      customerPhone,
    } = body;

    const baseUrl = process.env.PIPRAPAY_BASE_URL;
    const apiKey = process.env.PIPRAPAY_API_KEY;

    const epsEnabled = process.env.EPS_PAYMENT_ENABLED === "true";
    if (!epsEnabled && (!baseUrl || !apiKey)) {
      return NextResponse.json(
        { success: false, message: "Payment gateway is not configured." },
        { status: 503 }
      );
    }

    // SECURITY FIX: Use canonical server-configured URL instead of request headers
    const siteUrl = process.env.NEXTAUTH_URL || "https://aihaat.shop";

    const reference = typeof orderId === "string" ? orderId.trim() : "";
    if (!reference) {
      return NextResponse.json({ success: false, message: "Order reference required." }, { status: 400 });
    }
    const isTopup = reference.startsWith("WT-");
    if (isTopup && epsEnabled && !/^WT-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reference)) {
      return NextResponse.json({ success: false, message: "Invalid wallet payment reference." }, { status: 400 });
    }
    let currentOrderId = isTopup && !epsEnabled ? `WT-${randomUUID()}` : reference;
    let payableAmount = 0;

    // 1. Derive authoritative payable amount
    if (!isTopup) {
      const entitlement = await checkFeatureEntitlement(user.id, "SHOPPING_PURCHASE", { action: "PURCHASE" });
      if (!entitlement.allowed) {
        return NextResponse.json({ success: false, message: entitlement.reason }, { status: 403 });
      }
      // STORE ORDER: Amount MUST come from database — never trust client
      const orderRecord = await prisma.order.findFirst({
        where: {
          OR: [
            { orderNumber: currentOrderId },
            { id: currentOrderId },
          ],
        },
      });

      if (!orderRecord || orderRecord.userId !== user.id) {
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
      if (orderRecord.paymentStatus !== "PENDING" || orderRecord.deliveryStatus === "CANCELLED") {
        return NextResponse.json({ success: false, message: "This order cannot be paid." }, { status: 409 });
      }

      payableAmount = Number(orderRecord.totalBDT);
      currentOrderId = orderRecord.orderNumber;
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

    if (!Number.isFinite(payableAmount) || payableAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payment amount." },
        { status: 400 }
      );
    }

    const cleanEmail = user.email.trim().toLowerCase();
    const cleanPhone = (typeof customerPhone === "string" && customerPhone.trim()) || "01700000000";
    const cleanName = (typeof customerName === "string" && customerName.trim()) || user.name || "Customer";

    if (epsEnabled) {
      const billing = parseBilling(body.billing, { name: cleanName, phone: cleanPhone });
      const prefix = process.env.EPS_MODE === "live" ? "EPS_LIVE" : "EPS_SANDBOX";
      const storeId = process.env[`${prefix}_STORE_ID`];
      const merchantId = process.env[`${prefix}_MERCHANT_ID`];
      const transactionTypeId = Number(process.env[`${prefix}_TRANSACTION_TYPE_ID`] ?? "1");
      if (!storeId?.trim() || !merchantId?.trim() || transactionTypeId !== 1) {
        return NextResponse.json({ success: false, message: "EPS payments are unavailable." }, { status: 503 });
      }
      const result = await initializeEpsAttempt({
        reference: currentOrderId,
        userId: user.id,
        purpose: isTopup ? "WALLET_TOPUP" : "ORDER",
        returnUrl: (id) => new URL(`/payment/eps/wallet?merchantTransactionId=${id}`, siteUrl).href,
        payment: {
          storeId,
          merchantId,
          transactionTypeId,
          totalAmount: payableAmount,
          customerName: billing.name,
          customerEmail: cleanEmail,
          customerAddress: billing.address,
          customerCity: billing.city,
          customerState: billing.state,
          customerPostcode: billing.postcode,
          customerCountry: "Bangladesh",
          customerPhone: billing.phone,
          productName: isTopup ? "AI Haat Wallet Top-up" : `AI Haat Order ${currentOrderId}`,
        },
      });
      return NextResponse.json({ success: true, pp_url: result.redirectUrl, pp_id: result.merchantTransactionId });
    }
    if (!baseUrl || !apiKey) return NextResponse.json({ success: false }, { status: 503 });

    const returnUrl = `${siteUrl}/api/payment/callback?orderId=${encodeURIComponent(currentOrderId)}`;

    const payload = {
      full_name: cleanName,
      email_address: cleanEmail,
      mobile_number: cleanPhone,
      amount: payableAmount.toFixed(2),
      currency: "BDT",
      return_url: returnUrl,
      webhook_url: `${siteUrl}/api/payment/webhook`,
      metadata: {
        orderId: currentOrderId,
        email: cleanEmail,
        userId: user.id,
        ...(isTopup ? { type: "WALLET_TOPUP" } : {}),
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
  } catch (err: any) {
    console.error("[Payment Create Error] Payment initialization failed:", err?.message || err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to initialize payment. Please try again." },
      { status: 500 }
    );
  }
}
