import { NextRequest, NextResponse } from "next/server";
import { trackServerPurchase } from "@/lib/analytics/server";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/orders-db";
import { creditLocalWalletBalance, recordLocalTransaction } from "@/lib/wallet-db";
import { tryAutoFulfillOrder } from "@/lib/commerce/inventory";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = (searchParams.get("orderId") || searchParams.get("order_id") || "").trim();
  const transactionRef = (searchParams.get("transaction_ref") || searchParams.get("pp_id") || "").trim();

  // Dynamic host determination
  const host = req.headers.get("host") || "aihaat.shop";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const siteUrl = `${proto}://${host}`;

  const isWalletTopup = orderId.startsWith("WT-");

  // If no transaction reference is supplied by the gateway, treat as unverified/pending
  if (!transactionRef) {
    if (isWalletTopup) {
      return NextResponse.redirect(`${siteUrl}/dashboard/wallet?topup=pending`);
    }
    return NextResponse.redirect(
      `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=pending`
    );
  }

  let isVerifiedSuccess = false;
  let verifiedAmount = 0;
  let verifiedEmail = "";
  let verifiedUserId = "";
  let realTrxId = transactionRef;
  let verifiedOrderId = "";

  // 1. Server-to-Server Verification with PipraPay API
  try {
    const baseUrl = process.env.PIPRAPAY_BASE_URL;
    const apiKey = process.env.PIPRAPAY_API_KEY;

    if (baseUrl && apiKey) {
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
          console.log("[PipraPay Callback Verified]:", {
            status: verifyData?.status,
            amount: verifyData?.amount,
            orderId: verifyData?.metadata?.orderId,
          });

          const status = (verifyData?.status || "").toLowerCase();
          if (status === "completed" || status === "success") {
            isVerifiedSuccess = true;
            verifiedAmount = Number(verifyData.amount || verifyData.total || 0);
            verifiedEmail = (verifyData.email_address || verifyData.metadata?.email || "").toLowerCase().trim();
            verifiedUserId = verifyData.metadata?.userId || "";
            verifiedOrderId = verifyData.metadata?.orderId || "";
            if (verifyData.transaction_id && verifyData.transaction_id !== "--") {
              realTrxId = verifyData.transaction_id;
            }
          }
        }
      } catch (fetchErr: any) {
        clearTimeout(timeout);
        if (fetchErr.name === "AbortError") {
          console.error("[PipraPay Callback] Verification request timed out");
        } else {
          throw fetchErr;
        }
      }
    } else {
      console.warn("[PipraPay Callback] Missing PIPRAPAY_BASE_URL or PIPRAPAY_API_KEY in environment");
    }
  } catch (err) {
    console.error("[Verify Callback Network Error]:", err);
  }

  // 2. Process Verified Successful Payment
  if (isVerifiedSuccess) {
    // V3 FIX: Validate that the orderId from the provider matches the orderId from the callback URL
    // This prevents transaction reuse attacks where a transaction from Order A is used for Order B
    if (verifiedOrderId && orderId && verifiedOrderId !== orderId) {
      console.warn(`[PaymentAudit] PAYMENT_TRX_REUSE_BLOCKED: Callback orderId="${orderId}" does not match provider orderId="${verifiedOrderId}" for trxRef="${transactionRef}"`);
      if (isWalletTopup) {
        return NextResponse.redirect(`${siteUrl}/dashboard/wallet?topup=failed&reason=mismatch`);
      }
      return NextResponse.redirect(
        `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=failed&reason=mismatch`
      );
    }

    if (isWalletTopup) {
      try {
        let user = null;
        if (verifiedUserId) {
          user = await prisma.user.findUnique({ where: { id: verifiedUserId } });
        }
        if (!user && verifiedEmail) {
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: verifiedEmail },
                { email: { equals: verifiedEmail } },
              ],
            },
          });
        }

        if (user && verifiedAmount > 0) {
          const { finalizeWalletTopup } = await import("@/lib/commerce/wallet-topup");
          const topupResult = await finalizeWalletTopup({
            userId: user.id,
            userEmail: user.email,
            userName: user.name || user.email.split("@")[0],
            amountBDT: verifiedAmount,
            trxId: realTrxId || transactionRef,
            method: "gateway",
            senderNumber: "GATEWAY",
            note: `Automated Gateway Top-up (${realTrxId || transactionRef})`,
          });

          if (topupResult.alreadyProcessed) {
            console.log(`[PaymentAudit] DUPLICATE_EVENT_IGNORED: Wallet topup trxId="${realTrxId || transactionRef}" already processed`);
          } else if (topupResult.success) {
            console.log(`[PaymentAudit] WALLET_CREDITED: ৳${verifiedAmount} for user ${user.email} via callback`);
          }
        }
      } catch (wErr) {
        console.error("[Wallet Topup Callback Error]:", wErr);
      }

      return NextResponse.redirect(
        `${siteUrl}/dashboard/wallet?topup=success&amount=${encodeURIComponent(String(verifiedAmount))}&trxId=${encodeURIComponent(realTrxId || transactionRef)}`
      );
    }

    // REGULAR STORE ORDER FLOW
    if (orderId) {
      try {
        // V2 FIX: Load order and validate amount matches
        const orderRecord = await prisma.order.findFirst({
          where: {
            OR: [{ orderNumber: orderId }, { id: orderId }],
          },
        });

        if (!orderRecord) {
          console.warn(`[PaymentAudit] PAYMENT_FAILED: Order "${orderId}" not found for callback trxRef="${transactionRef}"`);
          return NextResponse.redirect(
            `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=failed`
          );
        }

        // V2: Amount matching — verified amount must equal expected order total
        const expectedAmount = Number(orderRecord.totalBDT);
        const amountTolerance = 0.01; // Allow tiny float rounding differences
        if (Math.abs(verifiedAmount - expectedAmount) > amountTolerance) {
          console.warn(`[PaymentAudit] PAYMENT_AMOUNT_MISMATCH: Order "${orderId}" expected ৳${expectedAmount} but provider verified ৳${verifiedAmount}. TrxRef="${transactionRef}"`);
          // Log mismatch in timeline but do NOT verify
          await prisma.orderTimelineEvent.create({
            data: {
              orderId: orderRecord.id,
              status: "PAYMENT_AMOUNT_MISMATCH",
              actor: "GATEWAY_CALLBACK",
              note: `Amount mismatch: expected ৳${expectedAmount}, received ৳${verifiedAmount}. TrxRef: ${transactionRef}`,
            },
          }).catch(console.error);

          return NextResponse.redirect(
            `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=pending&reason=amount_review`
          );
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
          console.warn(`[PaymentAudit] PAYMENT_TRX_REUSE_BLOCKED: TrxId "${realTrxId}" already used for order "${existingTrxOrder.orderNumber}". Blocked reuse for order "${orderId}".`);
          return NextResponse.redirect(
            `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=failed&reason=trx_reuse`
          );
        }

        // V4 FIX: Atomic idempotent order status update — only transition from PENDING
        const updateResult = await prisma.order.updateMany({
          where: {
            id: orderRecord.id,
            paymentStatus: "PENDING", // Atomic guard — only one request succeeds
          },
          data: {
            paymentStatus: "VERIFIED",
            deliveryStatus: "PROCESSING",
            trxId: realTrxId || transactionRef,
          },
        });

        if (updateResult.count > 0) {
          // Successfully transitioned — this is the winning request
          console.log(`[PaymentAudit] PAYMENT_VERIFIED: Order "${orderId}" verified via callback. Amount: ৳${verifiedAmount}. TrxId: ${realTrxId}`);

          // Record timeline event
          await prisma.orderTimelineEvent.create({
            data: {
              orderId: orderRecord.id,
              status: "PAYMENT_VERIFIED",
              actor: "GATEWAY_CALLBACK",
              note: `Payment verified: ৳${verifiedAmount}. TrxId: ${realTrxId || transactionRef}`,
            },
          }).catch(console.error);

          // Trigger Instant Auto-Fulfillment (non-critical, outside atomic path)
          await tryAutoFulfillOrder(orderId);

          // Process Affiliate Commission if applicable (non-blocking)
          try {
            const { processPaidOrderCommission } = await import("@/lib/commerce/affiliates");
            await processPaidOrderCommission(orderId);
          } catch (affErr) {
            console.warn("[Affiliate Commission Process Warning]:", affErr);
          }

          // Analytics: Fire server-side Purchase (non-blocking, never blocks payment)
          try {
            const cookieHeader = req.headers.get("cookie") || "";
            const cookies: Record<string, string> = {};
            cookieHeader.split(";").forEach(c => {
              const [k, v] = c.trim().split("=");
              if (k && v) cookies[k] = decodeURIComponent(v);
            });
            trackServerPurchase(orderId, {
              cookies,
              ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
              userAgent: req.headers.get("user-agent") || undefined,
            }).catch(console.error);
          } catch (analyticsErr) {
            console.warn("[Analytics] Purchase tracking error (non-fatal):", analyticsErr);
          }
        } else {
          // Order was already updated (by webhook or concurrent callback) — idempotent
          console.log(`[PaymentAudit] DUPLICATE_EVENT_IGNORED: Order "${orderId}" already processed (callback). TrxRef="${transactionRef}"`);
        }
      } catch (dbErr) {
        console.warn("[Prisma callback update order error]:", dbErr);
      }

      // Sync to JSON fallback (non-critical)
      updateOrderStatus(orderId, {
        paymentStatus: "Completed",
        deliveryStatus: "Processing",
        trxId: realTrxId || transactionRef,
      });

      return NextResponse.redirect(
        `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=completed&trxId=${encodeURIComponent(realTrxId || transactionRef)}`
      );
    }
  }

  // 3. Fallback: If not verified by gateway API, return pending/review status (Fail Closed)
  if (isWalletTopup) {
    return NextResponse.redirect(
      `${siteUrl}/dashboard/wallet?topup=pending&trxId=${encodeURIComponent(realTrxId || transactionRef)}`
    );
  }

  return NextResponse.redirect(
    `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=pending&trxId=${encodeURIComponent(realTrxId || transactionRef)}`
  );
}
