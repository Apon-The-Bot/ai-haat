import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { trackServerPurchase } from "@/lib/analytics/server";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/orders-db";
import {
  getLocalUserByEmail,
  debitLocalWalletBalance,
  recordLocalTransaction,
} from "@/lib/wallet-db";
import { sendTelegramMessage } from "@/utils/telegram";
import { tryAutoFulfillOrder } from "@/lib/commerce/inventory";
import { isSameOriginMutation } from "@/lib/security/csrf";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "Cross-site request forgery blocked" }, { status: 403 });
  }

  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  const clientIp = getClientIp(req);
  const limiter = checkRateLimit(`wallet_purchase:${user.id || clientIp}`, 10, 5 * 60 * 1000);
  if (!limiter.allowed) {
    return rateLimitResponse(limiter.retryAfterMs, "Too many wallet purchase requests. Please wait.");
  }

  try {
    const body = await req.json();
    const { orderId } = body;
    const customerEmail = user.email.toLowerCase().trim();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const cleanOrderId = String(orderId).trim();

    // All financial checks and mutations must happen inside a single atomic transaction
    let remainingBalance = 0;
    let requiredAmount = 0;

    try {
      const txResult = await prisma.$transaction(async (tx) => {
        // 1. Load order INSIDE transaction for atomic consistency
        const orderRecord = await tx.order.findFirst({
          where: {
            OR: [
              { orderNumber: cleanOrderId },
              { id: cleanOrderId },
            ],
          },
        });

        if (!orderRecord) {
          throw new Error("Order not found.");
        }

        // SECURITY FIX: Check both userId and customerEmail for ownership
        // Prevents guest order hijacking when userId is null
        const orderEmailClean = orderRecord.customerEmail?.toLowerCase().trim();
        const userEmailClean = user.email.toLowerCase().trim();
        const isOwner = orderRecord.userId === user.id || orderEmailClean === userEmailClean;
        if (!isOwner && user.role !== "ADMIN") {
          throw new Error("Unauthorized access to order.");
        }

        if (orderRecord.paymentStatus === "VERIFIED") {
          throw new Error("Order is already paid and verified.");
        }

        requiredAmount = Number(orderRecord.totalBDT);
        if (isNaN(requiredAmount) || requiredAmount <= 0) {
          throw new Error("Invalid order amount.");
        }

        // Idempotency: check if a wallet purchase transaction already exists for this order
        const existingWalletTx = await tx.walletTransaction.findFirst({
          where: {
            trxId: `WAL-${cleanOrderId}`,
            status: "APPROVED",
          },
        });
        if (existingWalletTx) {
          throw new Error("Order is already paid and verified.");
        }

        // V6 FIX: Atomic conditional wallet debit — prevents negative balance under concurrency
        const walletDebit = await tx.user.updateMany({
          where: {
            id: user.id,
            walletBalanceBDT: { gte: requiredAmount },
          },
          data: {
            walletBalanceBDT: { decrement: requiredAmount },
          },
        });

        if (walletDebit.count === 0) {
          // Either user not found or insufficient balance
          const currentUser = await tx.user.findUnique({ where: { id: user.id } });
          throw new Error(
            `ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই (বর্তমান ব্যালেন্স: ৳${currentUser?.walletBalanceBDT || 0}, প্রয়োজনীয়: ৳${requiredAmount}).`
          );
        }

        // Read updated balance
        const updatedUser = await tx.user.findUnique({ where: { id: user.id } });
        remainingBalance = Number(updatedUser?.walletBalanceBDT || 0);

        // Record wallet transaction
        await tx.walletTransaction.create({
          data: {
            userId: user.id,
            amountBDT: requiredAmount,
            type: "PURCHASE",
            method: "wallet",
            trxId: `WAL-${cleanOrderId}`,
            status: "APPROVED",
            note: `Payment for order #${cleanOrderId}`,
          },
        });

        // Atomic order status update — only if still PENDING
        const orderUpdate = await tx.order.updateMany({
          where: {
            id: orderRecord.id,
            paymentStatus: "PENDING", // Atomic guard
          },
          data: {
            paymentStatus: "VERIFIED",
            deliveryStatus: "PROCESSING",
            trxId: `WAL-${cleanOrderId}`,
          },
        });

        if (orderUpdate.count === 0) {
          // Order was already updated by another concurrent request
          throw new Error("Order payment state conflict. Please try again.");
        }

        // Create customer notification
        await tx.notification.create({
          data: {
            userId: user.id,
            title: "অর্ডার পেমেন্ট সফল!",
            message: `অর্ডার #${cleanOrderId} এর জন্য ওয়ালেট থেকে ৳${requiredAmount} পরিশোধ করা হয়েছে।`,
            type: "WALLET",
            link: "/dashboard/orders",
          },
        });

        // Timeline event
        await tx.orderTimelineEvent.create({
          data: {
            orderId: orderRecord.id,
            status: "PAYMENT_VERIFIED",
            actor: "CUSTOMER",
            note: `Wallet payment of ৳${requiredAmount} verified. TrxID: WAL-${cleanOrderId}`,
          },
        });

        return { requiredAmount, orderRecord };
      });

      // 2b. Attempt Instant Auto-Fulfillment (OUTSIDE transaction — non-critical)
      await tryAutoFulfillOrder(cleanOrderId);

      // Process Affiliate Commission if applicable (non-blocking)
      try {
        const { processPaidOrderCommission } = await import("@/lib/commerce/affiliates");
        await processPaidOrderCommission(cleanOrderId);
      } catch (affErr) {
        console.warn("[Affiliate Commission Process Warning]:", affErr);
      }

      // Analytics: Fire server-side Purchase (non-blocking)
      try {
        const cookieHeader = req.headers.get("cookie") || "";
        const cookies: Record<string, string> = {};
        cookieHeader.split(";").forEach(c => {
          const [k, v] = c.trim().split("=");
          if (k && v) cookies[k] = decodeURIComponent(v);
        });
        trackServerPurchase(cleanOrderId, {
          cookies,
          ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
          userAgent: req.headers.get("user-agent") || undefined,
        }).catch(console.error);
      } catch (analyticsErr) {
        console.warn("[Analytics] Purchase tracking error (non-fatal):", analyticsErr);
      }
    } catch (txError: any) {
      return NextResponse.json(
        { error: txError?.message || "Failed to process wallet payment." },
        { status: 400 }
      );
    }

    // 3. Sync to Local Fallback Storage
    try {
      debitLocalWalletBalance(customerEmail, requiredAmount);
      recordLocalTransaction({
        userId: user.id,
        userEmail: customerEmail,
        userName: user.name || customerEmail.split("@")[0],
        amountBDT: requiredAmount,
        type: "PURCHASE",
        method: "wallet",
        trxId: `WAL-${cleanOrderId}`,
        status: "APPROVED",
        note: `Payment for order #${cleanOrderId}`,
      });
      updateOrderStatus(cleanOrderId, {
        paymentStatus: "Completed",
        deliveryStatus: "Processing",
        trxId: `WAL-${cleanOrderId}`,
      });
    } catch (localErr) {
      console.warn("[Local Fallback Sync Warning]:", localErr);
    }

    // 4. Dispatch Telegram Notification
    try {
      await sendTelegramMessage(`
⚡ <b>ওয়ালেট দিয়ে অর্ডার পেমেন্ট সম্পন্ন! (Paid via Wallet)</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID:</b> <code>${cleanOrderId}</code>
👤 <b>ক্রেতার ইমেইল:</b> ${customerEmail}
💰 <b>পরিশোধিত মূল্য:</b> <b>৳${requiredAmount}</b>
💳 <b>মেথড:</b> WALLET BALANCE
🔑 <b>TrxID:</b> <code>WAL-${cleanOrderId}</code>
💵 <b>অবশিষ্ট ওয়ালেট ব্যালেন্স:</b> ৳${remainingBalance}
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
<i>অর্ডারটি ভেরিফাইড এবং প্রসেসিং হচ্ছে।</i>
      `);
    } catch (tErr) {
      console.warn("[Telegram Dispatch Warning]:", tErr);
    }

    return NextResponse.json({
      success: true,
      message: "Payment completed successfully using wallet balance.",
      remainingBalance,
      transactionId: `WAL-${cleanOrderId}`,
    });
  } catch (error: any) {
    console.error("[Wallet Purchase Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
