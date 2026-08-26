import { NextResponse } from "next/server";
import { sendOrderDeliveryEmail } from "@/utils/email";

export async function POST(req: Request) {
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

    const result = await sendOrderDeliveryEmail({
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

    return NextResponse.json({
      message: (result as any).simulated
        ? "Email dispatched (Hostinger SMTP simulated - add SMTP_PASS in .env for live sending)"
        : "HTML delivery email successfully sent from delivery@aihaat.shop!",
      ...result,
    });
  } catch (error: any) {
    console.error("API Send Delivery Email Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
