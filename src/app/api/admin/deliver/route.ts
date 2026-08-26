import { NextResponse } from "next/server";
import { sendOrderDeliveryEmail } from "@/utils/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      orderId,
      customerName,
      customerEmail,
      productName,
      accountType,
      variationName,
      credentials,
      instructions,
      downloadUrl,
    } = body;

    const finalOrderId = orderId || orderNumber;

    if (!finalOrderId || !credentials) {
      return NextResponse.json({ error: "Order Number and Credentials required" }, { status: 400 });
    }

    // Trigger Delivery Email
    if (customerEmail && customerEmail.includes("@")) {
      await sendOrderDeliveryEmail({
        customerName: customerName || "Valued Customer",
        customerEmail,
        orderId: finalOrderId,
        productName: productName || "Digital License",
        variationName: variationName || accountType,
        credentials,
        instructions,
        downloadUrl,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Credentials delivered successfully for order ${finalOrderId}.`,
    });
  } catch (error) {
    console.error("[Admin Deliver API Error]:", error);
    return NextResponse.json({ error: "Failed to deliver credentials" }, { status: 500 });
  }
}
