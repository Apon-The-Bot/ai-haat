import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId") || "";
  const ppStatus = (searchParams.get("pp_status") || "").toLowerCase();
  const transactionRef = searchParams.get("transaction_ref") || "";

  const siteUrl = process.env.NEXTAUTH_URL || "https://aihaat.shop";

  if (ppStatus === "completed" || ppStatus === "success") {
    // Payment Successful
    return NextResponse.redirect(
      `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=completed&trxId=${encodeURIComponent(transactionRef)}`
    );
  } else if (ppStatus === "pending") {
    // Payment Pending Verification
    return NextResponse.redirect(
      `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=pending&trxId=${encodeURIComponent(transactionRef)}`
    );
  } else {
    // Payment Failed or Canceled
    return NextResponse.redirect(
      `${siteUrl}/checkout?payment_status=${encodeURIComponent(ppStatus || "failed")}&orderId=${encodeURIComponent(orderId)}`
    );
  }
}
