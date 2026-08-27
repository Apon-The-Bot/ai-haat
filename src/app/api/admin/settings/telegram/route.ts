import { NextRequest, NextResponse } from "next/server";
import { getTelegramSettings, saveTelegramSettings } from "@/lib/telegram-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = getTelegramSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error("[Telegram Settings GET Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { botToken, chatId, isEnabled, notifyOnOrder, notifyOnWallet } = body;

    const saved = saveTelegramSettings({
      botToken: botToken !== undefined ? botToken.trim() : undefined,
      chatId: chatId !== undefined ? chatId.trim() : undefined,
      isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
      notifyOnOrder: notifyOnOrder !== undefined ? Boolean(notifyOnOrder) : true,
      notifyOnWallet: notifyOnWallet !== undefined ? Boolean(notifyOnWallet) : true,
    });

    return NextResponse.json({
      success: true,
      message: "Telegram bot settings saved successfully.",
      settings: saved,
    });
  } catch (error: any) {
    console.error("[Telegram Settings POST Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
