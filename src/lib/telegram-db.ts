import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export interface TelegramSettings {
  botToken: string;
  chatId: string;
  isEnabled: boolean;
  notifyOnOrder: boolean;
  notifyOnWallet: boolean;
}

const defaultSettings: TelegramSettings = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || "",
  chatId: process.env.TELEGRAM_CHAT_ID || "",
  isEnabled: true,
  notifyOnOrder: true,
  notifyOnWallet: true,
};

const dataDir = path.join(process.cwd(), "data");
const settingsFile = path.join(dataDir, "telegram-settings.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function getTelegramSettings(): TelegramSettings {
  ensureDir();
  try {
    if (fs.existsSync(settingsFile)) {
      const raw = fs.readFileSync(settingsFile, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        ...defaultSettings,
        ...parsed,
        botToken: parsed.botToken || defaultSettings.botToken,
        chatId: parsed.chatId || defaultSettings.chatId,
      };
    }
  } catch (err) {
    console.warn("Failed to read telegram settings file:", err);
  }
  return defaultSettings;
}

export function saveTelegramSettings(settings: Partial<TelegramSettings>): TelegramSettings {
  ensureDir();
  const current = getTelegramSettings();
  const updated: TelegramSettings = {
    ...current,
    ...settings,
  };

  try {
    fs.writeFileSync(settingsFile, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write telegram settings file:", err);
  }

  return updated;
}
