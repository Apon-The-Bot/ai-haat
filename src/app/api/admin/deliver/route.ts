import { NextResponse } from "next/server";
import { sendOrderDeliveryEmail } from "@/utils/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      customerName,
      customerEmail,
      productName,
      accountType,
      credentials,
      instructions,
    } = body;

    if (!orderNumber || !credentials) {
      return NextResponse.json({ error: "Order Number and Credentials required" }, { status: 400 });
    }

    // Trigger Delivery Email
    if (customerEmail && customerEmail.includes("@")) {
      await sendOrderDeliveryEmail({
        customerName: customerName || "Valued Customer",
        customerEmail,
        orderNumber,
        productName: productName || "Digital License",
        accountType: accountType || "Official Subscription",
        credentials,
        instructions,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Credentials delivered successfully for order ${orderNumber}.`,
    });
  } catch (error) {
    console.error("[Admin Deliver API Error]:", error);
    return NextResponse.json({ error: "Failed to deliver credentials" }, { status: 500 });
  }
}
