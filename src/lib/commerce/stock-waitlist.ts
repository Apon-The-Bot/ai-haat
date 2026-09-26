import { prisma } from "@/lib/prisma";
import { sendBackInStockEmail } from "@/lib/email-service";
import { sendTelegramMessage } from "@/utils/telegram";
import { logAdminAudit } from "@/lib/audit-logger";

const SITE_URL = process.env.NEXTAUTH_URL || "https://aihaat.shop";

export interface StockWaitlistSubscriptionInput {
  email: string;
  phone?: string | null;
  productId: string;
  variationId?: string | null;
  userId?: string | null;
}

/**
 * Subscribes a user to be notified when a product or variation comes back in stock.
 */
export async function subscribeToStockWaitlist(data: StockWaitlistSubscriptionInput) {
  const normalizedEmail = data.email.trim().toLowerCase();
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("সঠিক ইমেইল অ্যাড্রেস প্রদান করুন");
  }

  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    select: { id: true, name: true, slug: true, inStock: true },
  });

  if (!product) {
    throw new Error("প্রোডাক্টটি খুঁজে পাওয়া যায়নি");
  }

  let variationName: string | undefined;
  if (data.variationId) {
    const variation = await prisma.variation.findUnique({
      where: { id: data.variationId },
      select: { id: true, name: true, inStock: true },
    });
    if (variation) {
      variationName = variation.name;
    }
  }

  // Clean phone number (optional)
  const phone = data.phone ? data.phone.trim().replace(/[^\d+]/g, "") : null;

  // Find existing subscription (supports null variationId cleanly)
  const existing = await prisma.stockWaitlist.findFirst({
    where: {
      email: normalizedEmail,
      productId: data.productId,
      variationId: data.variationId || null,
    },
  });

  let subscription;
  if (existing) {
    subscription = await prisma.stockWaitlist.update({
      where: { id: existing.id },
      data: {
        phone: phone || undefined,
        userId: data.userId || undefined,
        status: "PENDING",
        notifiedAt: null,
      },
    });
  } else {
    subscription = await prisma.stockWaitlist.create({
      data: {
        email: normalizedEmail,
        phone,
        productId: data.productId,
        variationId: data.variationId || null,
        userId: data.userId || null,
        status: "PENDING",
      },
    });
  }

  return {
    success: true,
    subscription,
    productName: product.name,
    variationName,
  };
}

/**
 * Triggers back-in-stock notification dispatch to all pending subscribers for a product/variation.
 */
export async function notifyWaitingCustomersForProduct(
  productId: string,
  variationId?: string | null,
  actor?: { id: string; email: string }
) {
  // 1. Fetch product & variation details
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variations: true,
    },
  });

  if (!product) {
    return { success: false, count: 0, error: "Product not found" };
  }

  const selectedVariation = variationId
    ? product.variations.find((v) => v.id === variationId)
    : null;

  // 2. Find all pending subscribers
  // If variationId is specified, notify subscribers matching that variation OR matching any variation (variationId = null)
  const subscribers = await prisma.stockWaitlist.findMany({
    where: {
      productId,
      status: "PENDING",
      ...(variationId
        ? {
            OR: [
              { variationId },
              { variationId: null },
            ],
          }
        : {}),
    },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  if (subscribers.length === 0) {
    return { success: true, count: 0, message: "No pending subscribers to notify." };
  }

  const productUrl = `${SITE_URL}/product/${encodeURIComponent(product.slug)}`;
  const productImageUrl = product.image?.startsWith("http")
    ? product.image
    : `${SITE_URL}${product.image?.startsWith("/") ? "" : "/"}${product.image}`;

  const priceBDT = selectedVariation
    ? selectedVariation.priceBDT
    : product.minPriceBDT;

  let sentCount = 0;
  let failedCount = 0;
  const notifiedIds: string[] = [];

  // 3. Dispatch emails
  for (const sub of subscribers) {
    try {
      const targetVarName = sub.variationId
        ? product.variations.find((v) => v.id === sub.variationId)?.name || selectedVariation?.name
        : selectedVariation?.name;

      const result = await sendBackInStockEmail({
        customerEmail: sub.email,
        customerName: sub.user?.name || undefined,
        productName: product.name,
        variationName: targetVarName,
        productPriceBDT: priceBDT,
        productImageUrl,
        productUrl,
      });

      if (result.success) {
        sentCount++;
        notifiedIds.push(sub.id);
      } else {
        failedCount++;
      }
    } catch (err) {
      console.error(`[StockWaitlist] Failed to send email to ${sub.email}:`, err);
      failedCount++;
    }
  }

  // 4. Mark notified subscribers as NOTIFIED
  if (notifiedIds.length > 0) {
    await prisma.stockWaitlist.updateMany({
      where: {
        id: { in: notifiedIds },
      },
      data: {
        status: "NOTIFIED",
        notifiedAt: new Date(),
      },
    });
  }

  // 5. Send Admin Telegram Alert
  const telegramText = `🔔 <b>স্টক এলার্ট নোটিফিকেশন পাঠানো হয়েছে</b>\n\n` +
    `📦 <b>প্রোডাক্ট:</b> ${product.name}\n` +
    (selectedVariation ? `🏷️ <b>ভ্যারিয়েন্ট:</b> ${selectedVariation.name}\n` : "") +
    `👥 <b>সফলভাবে প্রেরিত:</b> ${sentCount} জন গ্রাহক\n` +
    (failedCount > 0 ? `⚠️ <b>ব্যর্থ:</b> ${failedCount} জন\n` : "") +
    `🕒 <b>সময়:</b> ${new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" })}`;

  sendTelegramMessage(telegramText).catch(() => {});

  // 6. Log admin audit if actor provided
  if (actor) {
    await logAdminAudit({
      actorId: actor.id,
      actorEmail: actor.email,
      action: "STOCK_WAITLIST_NOTIFY",
      targetType: "PRODUCT",
      targetId: productId,
      details: {
        productName: product.name,
        variationId,
        sentCount,
        failedCount,
      },
    }).catch(() => {});
  }

  return {
    success: true,
    count: sentCount,
    failed: failedCount,
    message: `${sentCount} জন অপেক্ষমান গ্রাহককে রিস্টক ইমেইল পাঠানো হয়েছে।`,
  };
}

/**
 * Returns summary metrics of waiting customers grouped by products for admin view.
 */
export async function getStockWaitlistAdminMetrics() {
  const pending = await prisma.stockWaitlist.findMany({
    where: { status: "PENDING" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          inStock: true,
          category: true,
        },
      },
      variation: {
        select: {
          id: true,
          name: true,
          inStock: true,
          priceBDT: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by productId
  const groupedMap = new Map<string, {
    product: any;
    totalSubscribers: number;
    variations: Map<string, { variation: any; count: number }>;
    recentSubscribers: any[];
  }>();

  for (const item of pending) {
    if (!groupedMap.has(item.productId)) {
      groupedMap.set(item.productId, {
        product: item.product,
        totalSubscribers: 0,
        variations: new Map(),
        recentSubscribers: [],
      });
    }

    const group = groupedMap.get(item.productId)!;
    group.totalSubscribers++;

    if (group.recentSubscribers.length < 5) {
      group.recentSubscribers.push({
        id: item.id,
        email: item.email,
        phone: item.phone,
        createdAt: item.createdAt,
        variationName: item.variation?.name || "Any",
      });
    }

    const varKey = item.variationId || "any";
    if (!group.variations.has(varKey)) {
      group.variations.set(varKey, {
        variation: item.variation || { name: "All / Any" },
        count: 0,
      });
    }
    group.variations.get(varKey)!.count++;
  }

  const productDemands = Array.from(groupedMap.values()).map((g) => ({
    product: g.product,
    totalWaiting: g.totalSubscribers,
    variations: Array.from(g.variations.values()),
    recentSubscribers: g.recentSubscribers,
  })).sort((a, b) => b.totalWaiting - a.totalWaiting);

  return {
    totalPendingSubscribers: pending.length,
    distinctProductsCount: groupedMap.size,
    productDemands,
  };
}
