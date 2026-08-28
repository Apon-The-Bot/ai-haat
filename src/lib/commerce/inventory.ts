import { prisma } from "@/lib/prisma";
import { encryptCredential, decryptCredential } from "@/lib/mfa/crypto";
import { StockStatus, StockType, FulfillmentType, DeliveryStatus } from "@prisma/client";
import { sendOrderDeliveryEmail } from "@/utils/email";
import { sendCustomerExpiryNoticeEmail } from "@/lib/email-service";
import { sendTelegramMessage, sendLowStockTelegramAlert, sendStockExpiryTelegramAlert } from "@/utils/telegram";
import { isEmailSuppressed } from "@/lib/commerce/abandoned-cart";
import crypto from "crypto";

export interface StockSummaryItem {
  productId: string;
  productName: string;
  variationId: string | null;
  variationName: string;
  availableCount: number;
  reservedCount: number;
  deliveredCount: number;
  invalidCount: number;
  totalCount: number;
  lowStockAlert: boolean;
}

/**
 * Compute SHA-256 fingerprint for deduplication
 */
export function computeStockFingerprint(payload: string): string {
  const normalized = payload.trim().toLowerCase().replace(/[\s\r\n\t]/g, "");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Add a single digital stock item encrypted at rest with duplicate detection
 */
export async function addStockItem(data: {
  productId: string;
  variationId?: string | null;
  supplierId?: string | null;
  batchId?: string | null;
  type?: StockType;
  payload: string;
  batchRef?: string;
  costPriceBDT?: number | null;
  expiryDate?: Date | null;
  notes?: string;
}) {
  const trimmed = data.payload.trim();
  if (!trimmed) {
    throw new Error("Stock payload cannot be empty");
  }

  const fingerprint = computeStockFingerprint(trimmed);

  // Check for active duplicate in database
  const existing = await prisma.digitalStock.findFirst({
    where: {
      productId: data.productId,
      fingerprint,
      status: { in: ["AVAILABLE", "RESERVED", "DELIVERED"] },
    },
  });

  if (existing) {
    throw new Error(`Duplicate stock item detected (Already registered in stock pool with status ${existing.status})`);
  }

  const encrypted = encryptCredential(trimmed);

  const cost = data.costPriceBDT !== undefined && data.costPriceBDT !== null
    ? Number(data.costPriceBDT)
    : null;

  return prisma.digitalStock.create({
    data: {
      productId: data.productId,
      variationId: data.variationId || null,
      supplierId: data.supplierId || null,
      batchId: data.batchId || null,
      type: data.type || "LICENSE_KEY",
      payloadEncrypted: encrypted,
      fingerprint,
      batchRef: data.batchRef || null,
      costPriceBDT: cost,
      expiryDate: data.expiryDate || null,
      status: "AVAILABLE",
      notes: data.notes || null,
    },
  });
}

/**
 * Bulk import stock items with duplicate detection, validation preview & reporting
 */
export async function bulkImportStock(data: {
  productId: string;
  variationId?: string | null;
  supplierId?: string | null;
  batchId?: string | null;
  type?: StockType;
  lines: string[];
  batchRef?: string;
  costPriceBDT?: number | null;
  notes?: string;
}) {
  let importedCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;
  const duplicates: string[] = [];
  const errors: string[] = [];

  // 1. Fetch existing fingerprints for this product to prevent duplicates
  const existingStocks = await prisma.digitalStock.findMany({
    where: {
      productId: data.productId,
      status: { in: ["AVAILABLE", "RESERVED", "DELIVERED"] },
    },
    select: { fingerprint: true },
  });

  const existingFingerprintSet = new Set(
    existingStocks.map((s) => s.fingerprint).filter(Boolean)
  );

  const seenInBatch = new Set<string>();
  const cost = data.costPriceBDT !== undefined && data.costPriceBDT !== null
    ? Number(data.costPriceBDT)
    : null;

  for (let i = 0; i < data.lines.length; i++) {
    const rawLine = data.lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    if (trimmed.length < 3) {
      invalidCount++;
      errors.push(`Row #${i + 1}: Invalid length for stock payload`);
      continue;
    }

    const fingerprint = computeStockFingerprint(trimmed);

    if (existingFingerprintSet.has(fingerprint) || seenInBatch.has(fingerprint)) {
      duplicateCount++;
      duplicates.push(trimmed.slice(0, 16) + "...");
      continue;
    }

    seenInBatch.add(fingerprint);

    try {
      const encrypted = encryptCredential(trimmed);
      await prisma.digitalStock.create({
        data: {
          productId: data.productId,
          variationId: data.variationId || null,
          supplierId: data.supplierId || null,
          batchId: data.batchId || null,
          type: data.type || "LICENSE_KEY",
          payloadEncrypted: encrypted,
          fingerprint,
          batchRef: data.batchRef || null,
          costPriceBDT: cost,
          status: "AVAILABLE",
          notes: data.notes || null,
        },
      });
      importedCount++;
      existingFingerprintSet.add(fingerprint);
    } catch (err: any) {
      errors.push(`Row #${i + 1}: ${err.message}`);
    }
  }

  return {
    totalProcessed: data.lines.length,
    importedCount,
    duplicateCount,
    invalidCount,
    duplicates,
    errors,
  };
}

/**
 * Concurrency-safe stock reservation for checkout/order processing
 */
export async function reserveStock(
  tx: any,
  productId: string,
  variationId: string | null,
  orderId: string,
  orderItemId: string,
  durationSeconds = 900 // 15 mins default
) {
  // Release any expired reservations first
  await tx.digitalStock.updateMany({
    where: {
      status: "RESERVED",
      reservationExpiresAt: { lt: new Date() },
    },
    data: {
      status: "AVAILABLE",
      assignedOrderId: null,
      assignedOrderItemId: null,
      reservedAt: null,
      reservationExpiresAt: null,
    },
  });

  const whereClause: any = {
    productId,
    status: "AVAILABLE",
  };
  if (variationId) {
    whereClause.variationId = variationId;
  }

  const available = await tx.digitalStock.findFirst({
    where: whereClause,
    orderBy: { createdAt: "asc" },
  });

  if (!available) {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationSeconds * 1000);

  const reserved = await tx.digitalStock.update({
    where: { id: available.id },
    data: {
      status: "RESERVED",
      assignedOrderId: orderId,
      assignedOrderItemId: orderItemId,
      reservedAt: now,
      reservationExpiresAt: expiresAt,
    },
  });

  return reserved;
}

/**
 * Atomically claim available or reserved stock for an order item inside a database transaction
 */
export async function claimAvailableStock(
  tx: any,
  productId: string,
  variationId: string | null,
  orderId: string,
  orderItemId?: string
) {
  const whereClause: any = {
    productId,
    OR: [
      { status: "AVAILABLE" },
      {
        status: "RESERVED",
        assignedOrderId: orderId,
      },
    ],
  };
  if (variationId) {
    whereClause.variationId = variationId;
  }

  const available = await tx.digitalStock.findFirst({
    where: whereClause,
    orderBy: { createdAt: "asc" },
  });

  if (!available) {
    return null;
  }

  // Atomic conditional update to guarantee no two concurrent transactions claim the same row
  const claimResult = await tx.digitalStock.updateMany({
    where: {
      id: available.id,
      status: available.status,
    },
    data: {
      status: "DELIVERED",
      assignedOrderId: orderId,
      assignedOrderItemId: orderItemId || null,
      deliveredAt: new Date(),
      reservedAt: null,
      reservationExpiresAt: null,
    },
  });

  if (claimResult.count === 0) {
    // Collision detected: another concurrent request claimed this item
    return null;
  }

  const claimed = await tx.digitalStock.findUnique({ where: { id: available.id } });
  if (!claimed) return null;

  let plaintext = "";
  try {
    plaintext = decryptCredential(claimed.payloadEncrypted);
  } catch {
    plaintext = claimed.payloadEncrypted;
  }

  return {
    stockId: claimed.id,
    type: claimed.type,
    credentials: plaintext,
  };
}

/**
 * Attempt automated instant delivery for eligible stocked products in multi-item orders
 */
export async function tryAutoFulfillOrder(orderId: string): Promise<{
  success: boolean;
  totalItems: number;
  deliveredItemsCount: number;
  orderStatus: DeliveryStatus;
}> {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: orderId }, { id: orderId }],
      },
      include: {
        items: true,
        deliveredKeys: true,
        user: true,
      },
    });

    if (!order || !order.items || order.items.length === 0) {
      return { success: false, totalItems: 0, deliveredItemsCount: 0, orderStatus: "ORDER_PLACED" };
    }

    // Only fulfill if payment is VERIFIED
    if (order.paymentStatus !== "VERIFIED") {
      console.warn(`[Auto-Fulfillment Skipped]: Order #${order.orderNumber} payment is not VERIFIED (${order.paymentStatus})`);
      return { success: false, totalItems: order.items.length, deliveredItemsCount: 0, orderStatus: order.deliveryStatus };
    }

    const claimedDeliveries: Array<{
      orderItemId: string;
      productName: string;
      variationName: string;
      credentials: string;
    }> = [];

    // Process each OrderItem atomically
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (!item.productId) continue;

        // Idempotency: check if this OrderItem already has delivered keys
        const existingKeys = await tx.deliveredKey.count({
          where: { orderId: order.id, orderItemId: item.id },
        });

        if (existingKeys >= item.quantity) {
          continue; // Already fulfilled
        }

        // Check Product fulfillment type
        const prod = await tx.product.findUnique({
          where: { id: item.productId },
          select: { fulfillmentType: true, warrantyDays: true },
        });

        // Skip manual items for automated dispatch
        if (prod?.fulfillmentType === "MANUAL" || item.fulfillmentType === "MANUAL") {
          await tx.orderItem.update({
            where: { id: item.id },
            data: { deliveryStatus: "PROCESSING" },
          });
          continue;
        }

        const warrantyDays = prod?.warrantyDays || 30;
        const warrantyExpiresAt = new Date(Date.now() + warrantyDays * 24 * 60 * 60 * 1000);

        const needed = item.quantity - existingKeys;

        for (let q = 0; q < needed; q++) {
          const claimed = await claimAvailableStock(
            tx,
            item.productId,
            item.variationId,
            order.id,
            item.id
          );

          if (claimed) {
            // Create delivered key record
            await tx.deliveredKey.create({
              data: {
                orderId: order.id,
                orderItemId: item.id,
                stockId: claimed.stockId,
                userId: order.userId,
                productName: item.productName,
                accountType: item.variationName,
                credentials: "Encrypted at rest (Use Vault to view)",
                credentialsEncrypted: encryptCredential(claimed.credentials),
                instructions: "Use the credentials above to log in or activate your software.",
                warrantyExpiresAt,
                isReplacement: false,
              },
            });

            claimedDeliveries.push({
              orderItemId: item.id,
              productName: item.productName,
              variationName: item.variationName,
              credentials: claimed.credentials,
            });
          }
        }

        // Check if item is now fully fulfilled
        const totalKeys = await tx.deliveredKey.count({
          where: { orderId: order.id, orderItemId: item.id },
        });

        if (totalKeys >= item.quantity) {
          await tx.orderItem.update({
            where: { id: item.id },
            data: { deliveryStatus: "DELIVERED" },
          });
        }
      }
    });

    // Check all items to determine final order delivery status
    const allItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
    });

    const allDelivered = allItems.length > 0 && allItems.every((it) => it.deliveryStatus === "DELIVERED");
    const anyDelivered = allItems.some((it) => it.deliveryStatus === "DELIVERED");

    const finalStatus: DeliveryStatus = allDelivered ? "DELIVERED" : anyDelivered ? "PROCESSING" : "PROCESSING";

    await prisma.order.update({
      where: { id: order.id },
      data: { deliveryStatus: finalStatus },
    });

    const { dispatchNotificationEvent, NOTIFICATION_EVENTS } = await import("@/lib/notifications");

    if (claimedDeliveries.length > 0) {
      const isConsolidated = allDelivered;
      const pendingItemsCount = allItems.filter(it => it.deliveryStatus !== "DELIVERED").length;

      // Dispatch Unified ORDER_DELIVERED / DELIVERY_PARTIAL Event (In-App + Email)
      await dispatchNotificationEvent({
        eventType: isConsolidated ? NOTIFICATION_EVENTS.ORDER_DELIVERED : NOTIFICATION_EVENTS.DELIVERY_PARTIAL,
        entityType: "ORDER",
        entityId: order.id,
        userId: order.userId || undefined,
        recipientEmail: order.customerEmail,
        dedupeKey: `order_delivered_${order.id}_${claimedDeliveries.map(d => d.orderItemId).join("_")}`,
        payload: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName || "Customer",
          customerEmail: order.customerEmail,
          isConsolidated,
          deliveredItems: claimedDeliveries.map(d => ({
            productName: d.productName,
            variationName: d.variationName,
            quantity: 1,
            hasCredentials: true,
            instructions: "Digital credentials issued. View in Digital Vault.",
          })),
          pendingItemsCount,
          vaultUrl: "https://aihaat.shop/dashboard/keys",
          orderUrl: "https://aihaat.shop/dashboard/orders",
        },
      }).catch(console.error);

      // Dispatch Operational Telegram Alert
      await sendTelegramMessage(`
🎉 <b>অটোমেটিক ইনস্ট্যান্ট ডেলিভারি সম্পন্ন! (Instant Auto-Delivery)</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID:</b> <code>${order.orderNumber}</code>
👤 <b>ক্রেতা:</b> ${order.customerName} (${order.customerEmail})
📦 <b>ডেলিভারিকৃত আইটেম:</b> ${claimedDeliveries.map((d) => d.productName).join(", ")}
🔑 <b>স্টক পুল থেকে অটো ডিসপ্যাচ করা হয়েছে।</b>
📊 <b>অর্ডার স্ট্যাটাস:</b> ${finalStatus}
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
      `).catch(console.error);

      // Check for low stock on all claimed items
      for (const item of order.items) {
        if (item.productId) {
          checkLowStockConditions(item.productId, item.variationId).catch(console.error);
        }
      }

      return {
        success: true,
        totalItems: allItems.length,
        deliveredItemsCount: claimedDeliveries.length,
        orderStatus: finalStatus,
      };
    } else {
      // Out of Stock condition after verified payment — alert admin immediately
      await dispatchNotificationEvent({
        eventType: NOTIFICATION_EVENTS.OUT_OF_STOCK,
        entityType: "ORDER",
        entityId: order.id,
        dedupeKey: `out_of_stock_alert_${order.id}`,
        payload: {
          orderNumber: order.orderNumber,
          productId: order.items[0]?.productId || "unknown",
          productName: order.items[0]?.productName || "Product",
          variationName: order.items[0]?.variationName,
          customerEmail: order.customerEmail,
          paidAmountBDT: Number(order.totalBDT),
          adminOrderUrl: `https://aihaat.shop/admin/orders`,
        },
        channels: ["TELEGRAM"],
      }).catch(console.error);
    }

    return {
      success: false,
      totalItems: allItems.length,
      deliveredItemsCount: 0,
      orderStatus: finalStatus,
    };
  } catch (err) {
    console.error("[Auto-Fulfillment Error]:", err);
    return { success: false, totalItems: 0, deliveredItemsCount: 0, orderStatus: "PROCESSING" };
  }
}

/**
 * Get digital stock summary overview for all products with low-stock alerts
 */
export async function getStockSummary(): Promise<StockSummaryItem[]> {
  const products = await prisma.product.findMany({
    include: {
      variations: true,
      digitalStocks: {
        select: {
          id: true,
          variationId: true,
          status: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const summary: StockSummaryItem[] = [];

  for (const prod of products) {
    if (prod.variations && prod.variations.length > 0) {
      for (const v of prod.variations) {
        const vStocks = prod.digitalStocks.filter((s) => s.variationId === v.id);
        const available = vStocks.filter((s) => s.status === "AVAILABLE").length;
        const reserved = vStocks.filter((s) => s.status === "RESERVED").length;
        const delivered = vStocks.filter((s) => s.status === "DELIVERED").length;
        const invalid = vStocks.filter((s) => s.status === "INVALID" || s.status === "REPLACED").length;

        summary.push({
          productId: prod.id,
          productName: prod.name,
          variationId: v.id,
          variationName: v.name,
          availableCount: available,
          reservedCount: reserved,
          deliveredCount: delivered,
          invalidCount: invalid,
          totalCount: vStocks.length,
          lowStockAlert: available <= 5,
        });
      }
    } else {
      const available = prod.digitalStocks.filter((s) => s.status === "AVAILABLE").length;
      const reserved = prod.digitalStocks.filter((s) => s.status === "RESERVED").length;
      const delivered = prod.digitalStocks.filter((s) => s.status === "DELIVERED").length;
      const invalid = prod.digitalStocks.filter((s) => s.status === "INVALID" || s.status === "REPLACED").length;

      summary.push({
        productId: prod.id,
        productName: prod.name,
        variationId: null,
        variationName: "Standard",
        availableCount: available,
        reservedCount: reserved,
        deliveredCount: delivered,
        invalidCount: invalid,
        totalCount: prod.digitalStocks.length,
        lowStockAlert: available <= 5,
      });
    }
  }

  return summary;
}

/**
 * Run inventory expiry checks and automated customer warranty/subscription expiry alerts
 */
export async function runInventoryExpiryCheck() {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const thirtySixHoursAgo = new Date(now.getTime() - 36 * 60 * 60 * 1000);

  let expiredCount = 0;
  let expiringSoonCount = 0;
  let customerExpiringCount = 0;
  let customerNotifiedCount = 0;
  let notified3DayCount = 0;
  let notified1DayCount = 0;

  // 1. Expire past due AVAILABLE stock
  const expiredResult = await prisma.digitalStock.updateMany({
    where: {
      status: "AVAILABLE",
      expiryDate: { lte: now },
    },
    data: {
      status: "EXPIRED",
    },
  });
  expiredCount = expiredResult.count;

  // 2. Mark AVAILABLE stock expiring in next 3 days
  const expiringSoonResult = await prisma.digitalStock.updateMany({
    where: {
      status: "AVAILABLE",
      expiryDate: { 
        lte: threeDaysFromNow,
        gt: now,
      },
      isExpiringSoon: false,
    },
    data: {
      isExpiringSoon: true,
    },
  });
  expiringSoonCount = expiringSoonResult.count;

  // 3. Find customer DeliveredKey items expiring in next 3 days
  const customerExpiringKeys = await prisma.deliveredKey.findMany({
    where: {
      warrantyExpiresAt: {
        lte: threeDaysFromNow,
        gt: now,
      },
    },
    include: {
      order: true,
      user: true,
    },
  });
  customerExpiringCount = customerExpiringKeys.length;

  for (const key of customerExpiringKeys) {
    if (!key.warrantyExpiresAt) continue;

    const daysRemaining = Math.max(1, Math.ceil((key.warrantyExpiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    const isOneDayStage = daysRemaining <= 1;
    const stageLabel = isOneDayStage ? "1-day" : "3-day";

    // Deduplication check: check if notification was already sent for this specific stage
    let alreadyNotified = false;
    if (key.userId) {
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId: key.userId,
          title: { contains: isOneDayStage ? "জরুরি" : key.productName },
          createdAt: { gte: isOneDayStage ? oneDayAgo : thirtySixHoursAgo },
        },
      });
      if (recentNotification) alreadyNotified = true;
    }

    // Check suppression list
    const customerEmail = key.order?.customerEmail;
    const isSuppressed = customerEmail ? await isEmailSuppressed(customerEmail) : false;

    if (!alreadyNotified && !isSuppressed) {
      const inAppTitle = isOneDayStage
        ? `⚠️ জরুরি: আগামীকাল সাবস্ক্রিপশনের মেয়াদ শেষ হচ্ছে (${key.productName})`
        : `সাবস্ক্রিপশনের মেয়াদ শেষ হতে চলেছে (${daysRemaining} দিন বাকি): ${key.productName}`;

      const inAppMessage = isOneDayStage
        ? `আপনার ${key.productName} (${key.accountType}) এর মেয়াদ আগামীকাল শেষ হবে। এখনই রিনিউ করুন সেবা চালু রাখতে।`
        : `আপনার ${key.productName} (${key.accountType}) এর মেয়াদ আর ${daysRemaining} দিনের মধ্যে শেষ হবে। নিরবচ্ছিন্ন সেবা পেতে রিনিউ করুন।`;

      // 3a. Create In-App Notification
      if (key.userId) {
        await prisma.notification.create({
          data: {
            userId: key.userId,
            title: inAppTitle,
            message: inAppMessage,
            type: "DELIVERY",
            link: "/dashboard/keys",
          },
        }).catch(console.error);
      }

      // 3b. Send Customer Expiry Email with 1-click renewal link
      if (customerEmail) {
        const renewalUrl = `https://aihaat.shop/shop?renew=${encodeURIComponent(key.productName)}`;

        await sendCustomerExpiryNoticeEmail({
          customerName: key.order?.customerName || "Valued Customer",
          customerEmail,
          productName: key.productName,
          variationName: key.accountType,
          orderNumber: key.order?.orderNumber || "ORDER",
          expiryDate: key.warrantyExpiresAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          daysRemaining,
          renewalUrl,
          vaultUrl: "https://aihaat.shop/dashboard/keys",
          subject: isOneDayStage
            ? `⚠️ Urgent: Your subscription for ${key.productName} expires Tomorrow!`
            : `⏳ Reminder: Your subscription for ${key.productName} expires in ${daysRemaining} days`,
        }).catch(console.error);
      }

      customerNotifiedCount++;
      if (isOneDayStage) {
        notified1DayCount++;
      } else {
        notified3DayCount++;
      }
    }
  }

  if (expiredCount > 0 || expiringSoonCount > 0 || customerExpiringCount > 0) {
    await sendStockExpiryTelegramAlert({
      expiredCount,
      expiringSoonCount,
      customerExpiringCount,
    }).catch(console.error);
  }

  return {
    expiredCount,
    expiringSoonCount,
    customerExpiringCount,
    customerNotifiedCount,
    notified3DayCount,
    notified1DayCount,
  };
}

/**
 * Check low stock conditions and alert if below threshold
 */
export async function checkLowStockConditions(productId: string, variationId?: string | null) {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });
  
  if (!product) return;
  
  let threshold = product.lowStockThreshold;
  let name = product.name;
  let varName: string | undefined = undefined;
  
  if (variationId) {
    const variation = await prisma.variation.findUnique({
      where: { id: variationId }
    });
    if (variation) {
      if (variation.lowStockThreshold !== null) {
        threshold = variation.lowStockThreshold;
      }
      varName = variation.name;
    }
  }
  
  const availableCount = await prisma.digitalStock.count({
    where: {
      productId,
      variationId: variationId || null,
      status: "AVAILABLE"
    }
  });
  
  if (availableCount <= threshold) {
    const { dispatchNotificationEvent, NOTIFICATION_EVENTS } = await import("@/lib/notifications");
    await dispatchNotificationEvent({
      eventType: NOTIFICATION_EVENTS.LOW_STOCK,
      entityType: "INVENTORY",
      entityId: variationId || productId,
      dedupeKey: `low_stock_${productId}_${variationId || "default"}_threshold_${threshold}`,
      payload: {
        productId,
        productName: name,
        variationId: variationId || undefined,
        variationName: varName,
        availableCount,
        threshold,
        adminInventoryUrl: "https://aihaat.shop/admin/inventory",
      },
      channels: ["TELEGRAM"],
    }).catch(console.error);
  }
}

/**
 * Get real-time available stock count for a product and/or specific variation
 */
export async function getRealtimeAvailableStock(
  productId: string,
  variationId?: string | null
): Promise<number> {
  try {
    const where: any = {
      productId,
      status: "AVAILABLE",
    };
    if (variationId) {
      where.OR = [
        { variationId: variationId },
        { variationId: null }, // Unassigned stock works for any variation
      ];
    }
    const count = await prisma.digitalStock.count({
      where,
    });
    return count;
  } catch (err) {
    console.error("[getRealtimeAvailableStock Error]:", err);
    return 0;
  }
}
