import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const cleanEmail = (customerEmail || "").trim().toLowerCase();
    const cleanPhone = (customerPhone || "01700000000").trim();
    const cleanName = (customerName || "Customer").trim();
    const currentOrderId = orderId || `AH-${Date.now().toString().slice(-5)}`;

    const returnUrl = `${siteUrl}/api/payment/callback?orderId=${encodeURIComponent(currentOrderId)}&customerEmail=${encodeURIComponent(cleanEmail)}&amount=${encodeURIComponent(String(numAmount))}&userId=${encodeURIComponent(metadata?.userId || "")}`;

    const payload = {
      full_name: cleanName,
      email_address: cleanEmail || "customer@aihaat.shop",
      mobile_number: cleanPhone,
      amount: numAmount.toFixed(2),
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

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: "PipraPay API Key is not configured",
      }, { status: 500 });
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
        message: data?.error?.message || data?.message || "Failed to generate gateway payment URL",
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
