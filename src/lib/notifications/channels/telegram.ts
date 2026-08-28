import { getTelegramSettings } from "@/lib/telegram-db";
import { NotificationErrorCategory } from "../types";

export interface TelegramDispatchResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCategory?: NotificationErrorCategory;
}

export async function dispatchTelegramAlert(textHtml: string): Promise<TelegramDispatchResult> {
  const settings = getTelegramSettings();
  const botToken = settings.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = settings.chatId || process.env.TELEGRAM_CHAT_ID;
  const isEnabled = settings.isEnabled;

  if (!isEnabled) {
    return { success: false, error: "Telegram notifications disabled in settings." };
  }

  if (!botToken || !chatId) {
    return {
      success: false,
      error: "Telegram Bot Token or Chat ID not configured.",
      errorCategory: "CONFIGURATION",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: textHtml,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();
    if (data.ok === true) {
      return {
        success: true,
        messageId: String(data.result?.message_id || ""),
      };
    } else {
      const isRateLimit = response.status === 429;
      return {
        success: false,
        error: data.description || "Failed to send telegram message.",
        errorCategory: isRateLimit ? "RATE_LIMITED" : "PERMANENT",
      };
    }
  } catch (error: any) {
    console.error("[Telegram Channel Error]:", error?.message || error);
    return {
      success: false,
      error: error?.message || "Network error sending telegram message",
      errorCategory: error?.name === "AbortError" ? "TRANSIENT" : "TRANSIENT",
    };
  }
}
