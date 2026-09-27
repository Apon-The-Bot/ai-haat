import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { GiftTheme } from "@/types";
export * from "./gift-themes";

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

import { getAllOrders, updateOrderStatus } from "@/lib/orders-db";

/**
 * Retrieve public gift order details by claim token
 */
export async function getGiftByClaimToken(token: string) {
  if (!token || typeof token !== "string") return null;
  const cleanToken = token.trim();

  try {
    const order = await prisma.order.findUnique({
      where: { giftClaimToken: cleanToken },
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

    if (order && order.isGift) {
      return {
        orderNumber: order.orderNumber,
        senderName: order.customerName,
        senderPhone: order.customerPhone || null,
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
    }
  } catch (error) {
    console.warn("[getGiftByClaimToken Prisma Warning, falling back]:", error);
  }

  // Fallback to local JSON DB
  try {
    const local = getAllOrders().find((o) => o.giftClaimToken === cleanToken && o.isGift);
    if (local) {
      return {
        orderNumber: local.orderNumber || local.id,
        senderName: local.customerName,
        senderPhone: local.customerPhone || null,
        recipientName: local.recipientName || "Dear Friend",
        recipientEmail: local.recipientEmail || null,
        recipientPhone: local.recipientPhone || null,
        giftMessage: local.giftMessage || "Enjoy your special digital gift from AI Haat!",
        giftTheme: (local.giftTheme || "neon") as GiftTheme,
        hidePriceOnGift: local.hidePriceOnGift ?? true,
        giftWrapOpened: local.giftWrapOpened ?? false,
        giftOpenedAt: local.giftOpenedAt || null,
        createdAt: local.createdAt,
        paymentStatus: local.paymentStatus,
        deliveryStatus: local.deliveryStatus,
        isDelivered: local.deliveryStatus === "Delivered",
        items: (local.items || []).map((it) => ({
          id: it.productId || "item",
          productId: it.productId || null,
          productName: it.productName,
          variationName: it.variationName,
          quantity: it.quantity,
          priceBDT: local.hidePriceOnGift ? undefined : it.priceBDT,
          image: it.image,
        })),
        deliveredCredentials:
          local.deliveryStatus === "Delivered" && local.credentialsDelivered
            ? [
                {
                  id: "cred-local-1",
                  productName: local.items[0]?.productName,
                  licenseKey: local.credentialsDelivered,
                  credentialsText: local.credentialsDelivered,
                  instructions: local.deliveryInstructions || null,
                },
              ]
            : [],
      };
    }
  } catch (fallbackErr) {
    console.error("[getGiftByClaimToken Fallback Error]:", fallbackErr);
  }

  return null;
}

/**
 * Mark a gift as opened/unwrapped by the recipient
 */
export async function markGiftAsOpened(token: string) {
  if (!token) return false;
  const cleanToken = token.trim();

  try {
    const updated = await prisma.order.update({
      where: { giftClaimToken: cleanToken },
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
    console.warn("[markGiftAsOpened Prisma Error, falling back]:", err);
  }

  // Fallback update in local JSON
  try {
    const local = getAllOrders().find((o) => o.giftClaimToken === cleanToken);
    if (local) {
      const now = new Date().toISOString();
      updateOrderStatus(local.orderNumber || local.id, {
        giftWrapOpened: true,
        giftOpenedAt: now,
      });
      return {
        orderNumber: local.orderNumber || local.id,
        customerName: local.customerName,
        recipientName: local.recipientName || "Friend",
        giftOpenedAt: new Date(),
      };
    }
  } catch (e) {
    console.error("[markGiftAsOpened Fallback Error]:", e);
  }

  return false;
}
