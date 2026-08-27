import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/utils/telegram";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { botToken, chatId } = body;

    const testMessage = `
🤖 <b>AI Haat - Telegram Bot সংযোগ সফল! (Connection Test)</b>
━━━━━━━━━━━━━━━━━━━━
✅ আপনার টেলিগ্রাম বট সফলভাবে AI Haat স্টোরের সাথে সংযুক্ত হয়েছে।
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
<i>এখন থেকে নতুন অর্ডার এবং ওয়ালেট রিচার্জের তাৎক্ষণিক নোটিফিকেশন এই চ্যাটে চলে আসবে।</i>
`;

    const result = await sendTelegramMessage(testMessage, { botToken, chatId });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test message sent to Telegram successfully! Check your Telegram chat.",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send test message to Telegram.",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[Telegram Test API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
