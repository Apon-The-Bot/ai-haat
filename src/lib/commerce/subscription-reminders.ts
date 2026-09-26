import { prisma } from "@/lib/prisma";
import { sendCustomerExpiryNoticeEmail } from "@/lib/email-service";

export interface ExpiryReminderResult {
  scanned: number;
  notified3Days: number;
  notified1Day: number;
  errors: string[];
}

/**
 * Scans delivered subscriptions and licenses expiring within 3 days or 1 day,
 * and sends an automated branded email reminder with 1-click renewal.
 */
export async function processSubscriptionExpiryReminders(): Promise<ExpiryReminderResult> {
  const result: ExpiryReminderResult = {
    scanned: 0,
    notified3Days: 0,
    notified1Day: 0,
    errors: [],
  };

  const now = new Date();
  const threeDaysAhead = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    // Find active keys expiring within the next 3 days
    const expiringKeys = await prisma.deliveredKey.findMany({
      where: {
        warrantyExpiresAt: {
          gt: now,
          lte: threeDaysAhead,
        },
      },
      include: {
        order: {
          include: {
            user: true,
          },
        },
        orderItem: true,
      },
    });

    result.scanned = expiringKeys.length;
    const baseUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || "https://aihaat.shop";

    for (const key of expiringKeys) {
      if (!key.warrantyExpiresAt || !key.order) continue;

      const customerEmail = key.order.customerEmail || key.order.user?.email;
      const customerName = key.order.customerName || key.order.user?.name || "সম্মানিত গ্রাহক";
      if (!customerEmail) continue;

      const diffMs = key.warrantyExpiresAt.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffHours / 24);

      const is1DayWindow = diffHours <= 24;
      const dedupeKey = is1DayWindow
        ? `expiry-reminder-1d-${key.id}-${key.warrantyExpiresAt.toISOString().slice(0, 10)}`
        : `expiry-reminder-3d-${key.id}-${key.warrantyExpiresAt.toISOString().slice(0, 10)}`;

      // Check if already notified for this stage using dedupeKey in Notification
      const alreadyNotified = await prisma.notification.findFirst({
        where: {
          userId: key.order.userId || "",
          dedupeKey,
        },
      });

      if (alreadyNotified) {
        continue;
      }

      const renewalUrl = `${baseUrl}/checkout?renewal=true&orderId=${key.orderId}&renewKeyId=${key.id}${
        key.orderItem?.productId ? `&productId=${key.orderItem.productId}` : ""
      }`;

      try {
        await sendCustomerExpiryNoticeEmail({
          customerName,
          customerEmail,
          orderNumber: key.order.orderNumber,
          productName: key.productName,
          variationName: key.orderItem?.variationName || key.accountType,
          daysRemaining: diffDays,
          expiryDate: key.warrantyExpiresAt.toLocaleDateString("bn-BD"),
          renewalUrl,
        });

        // Record deduplication notification if user is registered
        if (key.order.userId) {
          await prisma.notification.create({
            data: {
              userId: key.order.userId,
              title: `সাবস্ক্রিপশন মেয়াদ শেষ হচ্ছে: ${key.productName}`,
              message: `আপনার ${key.productName} এর মেয়াদ আর ${diffDays} দিন বাকি রয়েছে। নিরবচ্ছিন্ন সার্ভিসের জন্য এখনই ১-ক্লিকে রিনিউ করুন।`,
              type: "DELIVERY",
              link: renewalUrl,
              dedupeKey,
            },
          });
        }

        if (is1DayWindow) {
          result.notified1Day++;
        } else {
          result.notified3Days++;
        }
      } catch (err: any) {
        result.errors.push(`Failed for key ${key.id} (${customerEmail}): ${err.message}`);
      }
    }
  } catch (error: any) {
    result.errors.push(`Global reminder error: ${error.message}`);
  }

  return result;
}

/**
 * Direct query helper to fetch expiring subscriptions for audits, diagnostics or reporting.
 */
export async function findExpiringSubscriptions(daysAhead: number = 3) {
  const now = new Date();
  const targetDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return prisma.deliveredKey.findMany({
    where: {
      warrantyExpiresAt: {
        gt: now,
        lte: targetDate,
      },
    },
    include: {
      order: true,
      orderItem: true,
    },
  });
}

