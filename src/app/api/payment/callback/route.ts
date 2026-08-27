import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId") || "";
  const ppStatus = (searchParams.get("pp_status") || searchParams.get("status") || "").toLowerCase();
  const transactionRef = searchParams.get("transaction_ref") || searchParams.get("pp_id") || "";

  // Dynamic host determination
  const host = req.headers.get("host") || "aihaat.shop";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const siteUrl = `${proto}://${host}`;

  let verifiedStatus = ppStatus;

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

  if (verifiedStatus === "completed" || verifiedStatus === "success") {
    // Payment Verified & Completed -> Redirect to Success Page
    return NextResponse.redirect(
      `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=completed&trxId=${encodeURIComponent(transactionRef)}`
    );
  } else if (verifiedStatus === "pending") {
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

