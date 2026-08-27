import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

    const baseUrl = process.env.PIPRAPAY_BASE_URL || "https://pay.aihaat.shop";
    const apiKey = process.env.PIPRAPAY_API_KEY || "6efac52b56d3a19e2b7f39d54df43a8653e5dd21fe93249f84";
    
    // Determine dynamic site URL
    const reqOrigin = req.headers.get("origin") || req.headers.get("referer") || "https://aihaat.shop";
    let siteUrl = "https://aihaat.shop";
    try {
      const parsed = new URL(reqOrigin);
      siteUrl = parsed.origin;
    } catch {
      siteUrl = process.env.NEXTAUTH_URL || "https://aihaat.shop";
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const payload = {
      full_name: customerName || "Customer",
      email_address: customerEmail || "customer@aihaat.shop",
      mobile_number: customerPhone || "01700000000",
      amount: amount.toString(),
      currency: "BDT",
      return_url: `${siteUrl}/api/payment/callback?orderId=${encodeURIComponent(orderId || "")}`,
      webhook_url: `${siteUrl}/api/payment/webhook`,
      metadata: {
        orderId: orderId || `AH-${Date.now().toString().slice(-5)}`,
        ...(metadata || {}),
      },
    };

    // If no API key configured yet, return fallback test response
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        mode: "manual_fallback",
        message: "PaknaPay API Key not yet set. Complete database & API key setup in pay.aihaat.shop.",
      });
    }

    const response = await fetch(`${baseUrl}/api/checkout/redirect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "MHS-PIPRAPAY-API-KEY": apiKey,
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

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
        message: data?.error?.message || "Failed to generate gateway payment URL",
        details: data,
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Payment Create Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
