import { NextRequest, NextResponse } from "next/server";
import { trackServerPurchase } from "@/lib/analytics/server";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/orders-db";
import { creditLocalWalletBalance, recordLocalTransaction } from "@/lib/wallet-db";
import { tryAutoFulfillOrder } from "@/lib/commerce/inventory";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const rl = checkRateLimit(`webhook:${ip}`, 30, 60000);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    console.log("[Payment Webhook Received]:", {
      pp_id: body?.pp_id,
      transaction_ref: body?.transaction_ref,
      orderId: body?.metadata?.orderId,
      status: body?.status,
    });

    const transactionRef = (body?.pp_id || body?.transaction_ref || body?.transaction_id || "").trim();
    const orderId = (body?.metadata?.orderId || body?.orderId || "").trim();

    if (!transactionRef && !orderId) {
      return NextResponse.json({ success: false, error: "Missing transaction reference" }, { status: 400 });
    }

    let isVerifiedSuccess = false;
    let verifiedAmount = 0;
    let verifiedEmail = (body?.email_address || body?.customer_email || body?.metadata?.email || "").toLowerCase().trim();
    let verifiedUserId = body?.metadata?.userId || "";
    let realTrxId = transactionRef;
    let matchedOrderId = orderId;
    let verifiedOrderIdFromProvider = "";

    // 1. Direct Server-to-Server Verification with PipraPay Gateway
    try {
      const baseUrl = process.env.PIPRAPAY_BASE_URL;
      const apiKey = process.env.PIPRAPAY_API_KEY;

      if (baseUrl && apiKey && transactionRef) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
          const verifyRes = await fetch(`${baseUrl}/api/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "MHS-PIPRAPAY-API-KEY": apiKey,
              "X-Api-Key": apiKey,
            },
            body: JSON.stringify({ pp_id: transactionRef }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (verifyRes.ok) {
            const verifyData = await verifyRes.json();
            console.log("[PipraPay Webhook Verified Response]:", {
              status: verifyData?.status,
              amount: verifyData?.amount,
              orderId: verifyData?.metadata?.orderId,
            });

            const status = (verifyData?.status || "").toLowerCase();
            if (status === "completed" || status === "success") {
              isVerifiedSuccess = true;
              verifiedAmount = Number(verifyData.amount || verifyData.total || 0);
              if (verifyData.email_address) verifiedEmail = verifyData.email_address.toLowerCase().trim();
              if (verifyData.metadata?.userId) verifiedUserId = verifyData.metadata.userId;
              if (verifyData.metadata?.orderId) {
                matchedOrderId = verifyData.metadata.orderId;
                verifiedOrderIdFromProvider = verifyData.metadata.orderId;
              }
              if (verifyData.transaction_id && verifyData.transaction_id !== "--") realTrxId = verifyData.transaction_id;
            }
          }
        } catch (fetchErr: any) {
          clearTimeout(timeout);
          if (fetchErr.name === "AbortError") {
            console.error("[PipraPay Webhook] Verification request timed out");
          } else {
            throw fetchErr;
          }
        }
      }
    } catch (verErr) {
      console.error("[Webhook Verification Error]:", verErr);
    }

    if (!isVerifiedSuccess) {
      console.warn(`[PaymentAudit] PAYMENT_FAILED: Unverified webhook for ref=${transactionRef}, orderId=${orderId}`);
      return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
    }

    // V3 FIX: Validate that the orderId from the provider matches the orderId from the webhook body
    if (verifiedOrderIdFromProvider && orderId && verifiedOrderIdFromProvider !== orderId) {
      console.warn(`[PaymentAudit] PAYMENT_TRX_REUSE_BLOCKED: Webhook body orderId="${orderId}" does not match provider orderId="${verifiedOrderIdFromProvider}" for trxRef="${transactionRef}"`);
      return NextResponse.json({ success: false, error: "Order ID mismatch" }, { status: 400 });
    }

    // 2. Process Verified Payment
    if (matchedOrderId.startsWith("WT-") && verifiedEmail && verifiedAmount > 0) {
      // Wallet Top-up
      try {
        let user = null;
        if (verifiedUserId) {
          user = await prisma.user.findUnique({ where: { id: verifiedUserId } });
        }
        if (!user && verifiedEmail) {
          user = await prisma.user.findFirst({
            where: {
              OR: [{ email: verifiedEmail }, { email: verifiedEmail.toLowerCase() }],
            },
          });
        }

        if (user) {
          const { finalizeWalletTopup } = await import("@/lib/commerce/wallet-topup");
          const topupResult = await finalizeWalletTopup({
            userId: user.id,
            userEmail: verifiedEmail,
            userName: user.name || verifiedEmail.split("@")[0],
            amountBDT: verifiedAmount,
            trxId: realTrxId || matchedOrderId,
            method: "gateway",
            senderNumber: "GATEWAY",
            note: `Automated Gateway IPN (${realTrxId || matchedOrderId})`,
          });

          if (topupResult.alreadyProcessed) {
            console.log(`[PaymentAudit] DUPLICATE_EVENT_IGNORED: Wallet topup trxId="${realTrxId || matchedOrderId}" already processed`);
          } else if (topupResult.success) {
            console.log(`[PaymentAudit] WALLET_CREDITED: ৳${verifiedAmount} to user ${user.email} via webhook`);
          }
        }
      } catch (dbErr) {
        console.warn("[Prisma Webhook DB sync error]:", dbErr);
      }
    } else if (matchedOrderId) {
      // Store Order
      try {
        // V2 FIX: Load order and validate amount matches
        const orderRecord = await prisma.order.findFirst({
          where: {
            OR: [{ orderNumber: matchedOrderId }, { id: matchedOrderId }],
          },
          include: {
            items: true,
          },
        });

        if (!orderRecord) {
          console.warn(`[PaymentAudit] PAYMENT_FAILED: Order "${matchedOrderId}" not found for webhook trxRef="${transactionRef}"`);
          return NextResponse.json({ success: true, message: "Order not found, webhook acknowledged" });
        }

        // V2: Amount matching — verified amount must equal expected order total
        const expectedAmount = Number(orderRecord.totalBDT);
        const amountTolerance = 0.01;
        if (Math.abs(verifiedAmount - expectedAmount) > amountTolerance) {
          console.warn(`[PaymentAudit] PAYMENT_AMOUNT_MISMATCH: Order "${matchedOrderId}" expected ৳${expectedAmount} but provider verified ৳${verifiedAmount}. TrxRef="${transactionRef}"`);
          // Log mismatch but do NOT verify order
          await prisma.orderTimelineEvent.create({
            data: {
              orderId: orderRecord.id,
              status: "PAYMENT_AMOUNT_MISMATCH",
              actor: "GATEWAY_WEBHOOK",
              note: `Amount mismatch: expected ৳${expectedAmount}, received ৳${verifiedAmount}. TrxRef: ${transactionRef}`,
            },
          }).catch(console.error);

          // Alert Admin on Telegram about mismatch
          const { dispatchNotificationEvent, NOTIFICATION_EVENTS } = await import("@/lib/notifications");
          await dispatchNotificationEvent({
            eventType: NOTIFICATION_EVENTS.PAYMENT_MISMATCH,
            entityType: "ORDER",
            entityId: orderRecord.id,
            dedupeKey: `payment_mismatch_${orderRecord.id}_${verifiedAmount}`,
            payload: {
              orderNumber: orderRecord.orderNumber,
              expectedAmount,
              receivedAmount: verifiedAmount,
              trxRef: transactionRef,
            },
            channels: ["TELEGRAM"],
          }).catch(console.error);

          return NextResponse.json({ success: true, message: "Amount mismatch — order requires review" });
        }

        // V3 FIX: Check that this transaction is not already bound to a DIFFERENT verified order
        const existingTrxOrder = await prisma.order.findFirst({
          where: {
            trxId: realTrxId || transactionRef,
            paymentStatus: "VERIFIED",
            id: { not: orderRecord.id },
          },
        });

        if (existingTrxOrder) {
          console.warn(`[PaymentAudit] PAYMENT_TRX_REUSE_BLOCKED: TrxId "${realTrxId}" already used for order "${existingTrxOrder.orderNumber}". Blocked reuse for order "${matchedOrderId}" via webhook.`);
          return NextResponse.json({ success: true, message: "Transaction already used for another order" });
        }

        // V4 FIX: Atomic idempotent order status update — only transition from PENDING
        const updateResult = await prisma.order.updateMany({
          where: {
            id: orderRecord.id,
            paymentStatus: "PENDING", // Atomic guard
          },
          data: {
            paymentStatus: "VERIFIED",
            deliveryStatus: "PROCESSING",
            trxId: realTrxId || undefined,
          },
        });

        if (updateResult.count > 0) {
          console.log(`[PaymentAudit] PAYMENT_VERIFIED: Order "${matchedOrderId}" verified via webhook. Amount: ৳${verifiedAmount}. TrxId: ${realTrxId}`);

          // Record timeline event
          await prisma.orderTimelineEvent.create({
            data: {
              orderId: orderRecord.id,
              status: "PAYMENT_VERIFIED",
              actor: "GATEWAY_WEBHOOK",
              note: `Payment verified: ৳${verifiedAmount}. TrxId: ${realTrxId || transactionRef}`,
            },
          }).catch(console.error);

          // Emit PAYMENT_VERIFIED Customer Notification Event (In-App + Email)
          const { dispatchNotificationEvent, NOTIFICATION_EVENTS } = await import("@/lib/notifications");
          await dispatchNotificationEvent({
            eventType: NOTIFICATION_EVENTS.PAYMENT_VERIFIED,
            entityType: "ORDER",
            entityId: orderRecord.id,
            userId: orderRecord.userId || undefined,
            recipientEmail: orderRecord.customerEmail,
            dedupeKey: `payment_verified_${orderRecord.id}`,
            payload: {
              orderId: orderRecord.id,
              orderNumber: orderRecord.orderNumber,
              customerName: orderRecord.customerName || "Customer",
              customerEmail: orderRecord.customerEmail,
              amountBDT: Number(orderRecord.totalBDT),
              trxId: realTrxId || undefined,
              paymentMethod: orderRecord.paymentMethod || "GATEWAY",
              itemsCount: orderRecord.items?.length || 1,
              orderUrl: `https://aihaat.shop/dashboard/orders`,
            },
          }).catch(console.error);

          // Trigger Instant Auto-Fulfillment (non-critical, outside atomic path)
          await tryAutoFulfillOrder(matchedOrderId);

          // Process Affiliate Commission if applicable (non-blocking)
          try {
            const { processPaidOrderCommission } = await import("@/lib/commerce/affiliates");
            await processPaidOrderCommission(orderRecord.id);
          } catch (affErr) {
            console.warn("[Affiliate Commission Process Warning]:", affErr);
          }

          // Analytics: Fire server-side Purchase (non-blocking)
          try {
            trackServerPurchase(matchedOrderId || orderId, {
              ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
              userAgent: req.headers.get("user-agent") || undefined,
            }).catch(console.error);
          } catch (analyticsErr) {
            console.warn("[Analytics] Purchase tracking error (non-fatal):", analyticsErr);
          }
        } else {
          console.log(`[PaymentAudit] DUPLICATE_EVENT_IGNORED: Order "${matchedOrderId}" already processed (webhook). TrxRef="${transactionRef}"`);
        }
      } catch (dbErr) {
        console.warn("[Prisma Webhook Update Error]:", dbErr);
      }

      // Sync to JSON fallback (non-critical)
      updateOrderStatus(matchedOrderId, {
        paymentStatus: "Completed",
        deliveryStatus: "Processing",
        trxId: realTrxId || undefined,
      });
    }

    return NextResponse.json({ success: true, message: "Webhook verified and processed" });
  } catch (error: any) {
    console.error("[Webhook Handling Error]:", error);
    return NextResponse.json({ success: false, error: "Internal processing error" }, { status: 500 });
  }
}
