// ─── AI Haat Analytics — Server-Side Analytics Orchestrator ──────
// Handles server-side Purchase tracking via Meta CAPI.
// Deduplication via order.analyticsPurchaseSentAt DB flag.
// Independent failure — never blocks payment/delivery.

import { prisma } from "@/lib/prisma";
import { sendCapiEvent, buildCapiPurchaseData } from "./meta-capi";

interface RequestContext {
  cookies?: Record<string, string>;
  ip?: string;
  userAgent?: string;
}

/**
 * Track a verified purchase server-side.
 * Called from payment callback, webhook, and wallet purchase routes
 * ONLY after order.paymentStatus transitions to VERIFIED.
 *
 * - Loads order + items from DB
 * - Checks analyticsPurchaseSentAt for dedup
 * - Fires Meta CAPI Purchase
 * - Records to AnalyticsEvent outbox
 * - Sets analyticsPurchaseSentAt
 *
 * NEVER throws — all errors are caught and logged.
 */
export async function trackServerPurchase(
  orderId: string,
  context?: RequestContext
): Promise<void> {
  try {
    // 1. Load order with items
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
        paymentStatus: "VERIFIED",
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      console.warn(`[Analytics Server] Order "${orderId}" not found or not VERIFIED — skipping Purchase event`);
      return;
    }

    // 2. Deduplication check
    if (order.analyticsPurchaseSentAt) {
      console.log(`[Analytics Server] Purchase already sent for "${order.orderNumber}" at ${order.analyticsPurchaseSentAt} — skipping`);
      return;
    }

    // 3. Generate stable event ID
    const eventId = `purchase_${order.orderNumber}`;

    // 4. Build CAPI purchase data from authoritative order
    const customData = buildCapiPurchaseData({
      orderNumber: order.orderNumber,
      totalBDT: order.totalBDT,
      items: order.items,
    });

    // 5. Build user data for CAPI matching
    const userData: {
      email?: string;
      phone?: string;
      externalId?: string;
      clientIpAddress?: string;
      clientUserAgent?: string;
      fbp?: string;
      fbc?: string;
    } = {
      email: order.customerEmail || undefined,
      phone: order.customerPhone || undefined,
      externalId: order.userId || undefined,
      clientIpAddress: context?.ip || undefined,
      clientUserAgent: context?.userAgent || undefined,
      fbp: context?.cookies?._fbp || undefined,
      fbc: context?.cookies?._fbc || undefined,
    };

    const eventSourceUrl = `https://aihaat.shop/checkout/success?orderId=${encodeURIComponent(order.orderNumber)}`;

    // 6. Record to AnalyticsEvent outbox FIRST (for retry reliability)
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventName: "Purchase",
          orderId: order.orderNumber,
          provider: "meta_capi",
          eventId,
          payload: JSON.stringify({ customData, userData: { ...userData, email: "[hashed]", phone: "[hashed]" } }),
          status: "PENDING",
          attempts: 0,
        },
      });
    } catch (outboxErr) {
      // Unique constraint = already queued, that's fine
      console.log(`[Analytics Server] Outbox entry already exists for "${eventId}" — proceeding`);
    }

    // 7. Fire Meta CAPI (non-blocking)
    const success = await sendCapiEvent(
      "Purchase",
      eventId,
      customData,
      userData,
      eventSourceUrl
    );

    // 8. Update outbox status
    try {
      await prisma.analyticsEvent.update({
        where: { eventId },
        data: {
          status: success ? "SENT" : "FAILED",
          attempts: { increment: 1 },
          sentAt: success ? new Date() : undefined,
          lastError: success ? undefined : "CAPI delivery failed after retries",
        },
      });
    } catch {
      // Non-critical
    }

    // 9. Mark order as analytics-sent (dedup flag)
    if (success) {
      try {
        await prisma.order.update({
          where: { id: order.id },
          data: { analyticsPurchaseSentAt: new Date() },
        });
        console.log(`[Analytics Server] ✅ Purchase event sent for "${order.orderNumber}" — value: ৳${order.totalBDT}`);
      } catch {
        // Non-critical — CAPI was sent regardless
      }
    }
  } catch (err) {
    // ABSOLUTE RULE: Analytics failure NEVER blocks payment/order/delivery
    console.error("[Analytics Server] Purchase tracking error (non-fatal):", err);
  }
}

/**
 * Track wallet top-up completion server-side (custom event, NOT Purchase).
 * Does not fire Meta CAPI Purchase to prevent double revenue.
 */
export async function trackServerWalletTopup(
  userId: string,
  amount: number,
  transactionId: string
): Promise<void> {
  try {
    console.log(`[Analytics Server] 💰 Wallet top-up completed: userId=${userId}, amount=৳${amount}, trxId=${transactionId}`);
    // GA4 Measurement Protocol could be added here in the future
    // For now, wallet top-up is tracked client-side only
  } catch (err) {
    console.error("[Analytics Server] Wallet topup tracking error (non-fatal):", err);
  }
}
