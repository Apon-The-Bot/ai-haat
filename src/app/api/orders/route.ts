import { NextResponse } from "next/server";
import { sendNewOrderTelegramAlert } from "@/utils/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      items,
      totalBDT,
      paymentMethod,
      senderNumber,
      trxId,
      notes,
    } = body;

    if (!orderNumber || !customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
    }

    // Dispatch Telegram Alert
    await sendNewOrderTelegramAlert({
      orderNumber,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "guest@aihaat.com",
      items,
      totalBDT,
      paymentMethod: paymentMethod || "bkash",
      senderNumber,
      trxId,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully and admin notified via Telegram.",
      orderNumber,
    });
  } catch (error) {
    console.error("[Orders API Error]:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}
