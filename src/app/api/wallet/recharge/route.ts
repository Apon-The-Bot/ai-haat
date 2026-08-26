import { NextResponse } from "next/server";
import { sendWalletRechargeTelegramAlert } from "@/utils/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userName, userPhone, userEmail, amountBDT, method, senderNumber, trxId } = body;

    if (!amountBDT || !trxId) {
      return NextResponse.json({ error: "Amount and TrxID are required." }, { status: 400 });
    }

    // Dispatch Telegram Alert
    await sendWalletRechargeTelegramAlert({
      userName: userName || "Customer",
      userPhone: userPhone || "017XXXXXXXX",
      userEmail: userEmail || "customer@aihaat.com",
      amountBDT: Number(amountBDT),
      method: method || "bkash",
      senderNumber,
      trxId,
    });

    return NextResponse.json({
      success: true,
      message: "Recharge request submitted. Admin notified.",
    });
  } catch (error) {
    console.error("[Recharge API Error]:", error);
    return NextResponse.json({ error: "Failed to submit recharge" }, { status: 500 });
  }
}
