import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { GiftTheme } from "@/types";

export interface GiftThemeConfig {
  id: GiftTheme;
  nameEn: string;
  nameBn: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  ribbonColor: string;
  cardBg: string;
  taglineEn: string;
  taglineBn: string;
}

export const GIFT_THEMES: Record<GiftTheme, GiftThemeConfig> = {
  neon: {
    id: "neon",
    nameEn: "Neon Tech / AI Glow",
    nameBn: "🌟 নিয়ন টেক / এআই গ্লো",
    emoji: "⚡",
    gradient: "from-cyan-500 via-indigo-600 to-purple-600",
    accentColor: "#06B6D4",
    ribbonColor: "#A855F7",
    cardBg: "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white",
    taglineEn: "Supercharge your workflow with this digital surprise!",
    taglineBn: "তোমার কাজকে আরও সুপারচার্জ করতে এই ডিজিটাল সারপ্রাইজ!",
  },
  birthday: {
    id: "birthday",
    nameEn: "Birthday Joy & Confetti",
    nameBn: "🎂 শুভ জন্মদিন ও আনন্দ",
    emoji: "🎂",
    gradient: "from-amber-400 via-rose-500 to-orange-500",
    accentColor: "#F59E0B",
    ribbonColor: "#EF4444",
    cardBg: "bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 text-slate-900",
    taglineEn: "Wishing you a fantastic Birthday full of joy and success!",
    taglineBn: "জন্মদিনের একরাশ শুভেচ্ছা ও আগামী দিনগুলোর জন্য সাফল্য!",
  },
  festive: {
    id: "festive",
    nameEn: "Festive Celebration / Eid",
    nameBn: "🎉 উৎসবের আনন্দ / ঈদ মোবারক",
    emoji: "🎉",
    gradient: "from-emerald-500 via-teal-600 to-emerald-800",
    accentColor: "#10B981",
    ribbonColor: "#F59E0B",
    cardBg: "bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white",
    taglineEn: "Heartiest festive greetings and blessings on this special day!",
    taglineBn: "এই বিশেষ দিনে আন্তরিক উৎসবের শুভেচ্ছা ও শুভকামনা!",
  },
  friendship: {
    id: "friendship",
    nameEn: "Friendship & Gratitude",
    nameBn: "💖 বন্ধুত্ব ও আন্তরিক ধন্যবাদ",
    emoji: "💖",
    gradient: "from-rose-400 via-pink-500 to-rose-600",
    accentColor: "#F43F5E",
    ribbonColor: "#FB7185",
    cardBg: "bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 text-slate-900",
    taglineEn: "A small gift to thank you for always being there!",
    taglineBn: "সবসময় পাশে থাকার জন্য ভালোবাসার একটি ছোট্ট উপহার!",
  },
  midnight: {
    id: "midnight",
    nameEn: "Pro Hustler / Creator",
    nameBn: "🚀 প্রো ক্রিয়েটর / হ্যাসলার",
    emoji: "🚀",
    gradient: "from-slate-900 via-gray-900 to-zinc-950",
    accentColor: "#FC5C03",
    ribbonColor: "#FC5C03",
    cardBg: "bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950 text-white",
    taglineEn: "Level up your craft and build something legendary!",
    taglineBn: "তোমার কাজের দক্ষতা আরও বাড়াতে এই প্রিমিয়াম গিফট!",
  },
};

export const QUICK_GREETINGS = [
  {
    tag: "🎂 জন্মদিন",
    message: "শুভ জন্মদিন দোস্ত! 🎂 তোমার জন্য এই বিশেষ ডিজিটাল উপহারটি পাঠালাম। দারুণভাবে উপভোগ কর!",
  },
  {
    tag: "🚀 ক্যারিয়ার ও ফ্রিল্যান্সিং",
    message: "তোমার কাজ ও ফ্রিল্যান্সিং ক্যারিয়ারের জন্য অনেক শুভকামনা! 🚀 আশা করি টুলসটি তোমার কাজের গতি দ্বিগুণ করবে।",
  },
  {
    tag: "🎉 ঈদ ও উৎসব",
    message: "ঈদ মোবারক! 🎉 উৎসবের খুশিতে তোমার জন্য ছোট একটি ডিজিটাল উপহার। ভালো থেকো সবসময়।",
  },
  {
    tag: "💖 আন্তরিক ধন্যবাদ",
    message: "সবসময় একজন দারুণ বন্ধু ও শুভাকাঙ্ক্ষী হিসেবে পাশে থাকার জন্য অসংখ্য ধন্যবাদ! ❤️",
  },
];

/**
 * Generate a friendly, secure token for gift claim links
 * Format: gift_xxxxxxxxxxxxxxxx (16 hex chars)
 */
export function generateGiftToken(): string {
  return `gift_${randomBytes(8).toString("hex")}`;
}

function parseCredentials(credStr?: string | null) {
  if (!credStr) return {};
  const trimmed = credStr.trim();

  // 1. JSON formatted credentials
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        licenseKey: parsed.licenseKey || parsed.key || parsed.serial || null,
        accountEmail: parsed.email || parsed.username || parsed.accountEmail || null,
        accountPassword: parsed.password || parsed.pass || parsed.accountPassword || null,
        accessUrl: parsed.url || parsed.accessUrl || parsed.loginUrl || null,
      };
    } catch {
      // not json, continue
    }
  }

  // 2. email:password or email | password
  const parts = trimmed.split(/[:|]/).map((p) => p.trim());
  if (parts.length === 2 && parts[0].includes("@")) {
    return {
      accountEmail: parts[0],
      accountPassword: parts[1],
    };
  }

  // 3. License key pattern or generic text
  return {
    licenseKey: trimmed,
  };
}

/**
 * Retrieve public gift order details by claim token
 */
export async function getGiftByClaimToken(token: string) {
  if (!token || typeof token !== "string") return null;

  try {
    const order = await prisma.order.findUnique({
      where: { giftClaimToken: token },
      include: {
        items: true,
        deliveredKeys: {
          select: {
            id: true,
            productName: true,
            accountType: true,
            credentials: true,
            instructions: true,
            warrantyExpiresAt: true,
            deliveredAt: true,
          },
        },
      },
    });

    if (!order) return null;

    return {
      orderNumber: order.orderNumber,
      senderName: order.customerName,
      recipientName: order.recipientName || "Dear Friend",
      recipientEmail: order.recipientEmail,
      recipientPhone: order.recipientPhone,
      giftMessage: order.giftMessage || "Enjoy your special digital gift from AI Haat!",
      giftTheme: (order.giftTheme || "neon") as GiftTheme,
      hidePriceOnGift: order.hidePriceOnGift,
      giftWrapOpened: order.giftWrapOpened,
      giftOpenedAt: order.giftOpenedAt ? order.giftOpenedAt.toISOString() : null,
      createdAt: order.createdAt.toISOString(),
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
      isDelivered: order.deliveryStatus === "DELIVERED",
      items: order.items.map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: it.productName,
        variationName: it.variationName,
        quantity: it.quantity,
        priceBDT: order.hidePriceOnGift ? undefined : it.priceBDT,
        image: it.image,
      })),
      deliveredCredentials:
        order.deliveryStatus === "DELIVERED"
          ? order.deliveredKeys.map((k) => {
              const parsed = parseCredentials(k.credentials);
              return {
                id: k.id,
                productName: k.productName,
                accountType: k.accountType,
                licenseKey: parsed.licenseKey || null,
                accountEmail: parsed.accountEmail || null,
                accountPassword: parsed.accountPassword || null,
                accessUrl: parsed.accessUrl || null,
                credentialsText: k.credentials,
                instructions: k.instructions || null,
                warrantyExpiresAt: k.warrantyExpiresAt ? k.warrantyExpiresAt.toISOString() : null,
              };
            })
          : [],
    };
  } catch (error) {
    console.error("[getGiftByClaimToken Error]:", error);
    return null;
  }
}

/**
 * Mark a gift as opened/unwrapped by the recipient
 */
export async function markGiftAsOpened(token: string) {
  if (!token) return false;

  try {
    const updated = await prisma.order.update({
      where: { giftClaimToken: token },
      data: {
        giftWrapOpened: true,
        giftOpenedAt: new Date(),
      },
      select: {
        orderNumber: true,
        customerName: true,
        recipientName: true,
        giftOpenedAt: true,
      },
    });

    return updated;
  } catch (err) {
    console.error("[markGiftAsOpened Error]:", err);
    return false;
  }
}
