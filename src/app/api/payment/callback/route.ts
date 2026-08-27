import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/orders-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId") || searchParams.get("order_id") || "";
  const ppStatus = (searchParams.get("pp_status") || searchParams.get("status") || "").toLowerCase();
  const transactionRef = searchParams.get("transaction_ref") || searchParams.get("pp_id") || "";

  // Dynamic host determination
  const host = req.headers.get("host") || "aihaat.shop";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const siteUrl = `${proto}://${host}`;

  let verifiedStatus = ppStatus;
  let verifiedAmount = Number(searchParams.get("amount") || 0);
  let customerEmail = (searchParams.get("customerEmail") || "").toLowerCase().trim();
  let userId = searchParams.get("userId") || "";
  let realTrxId = transactionRef;

  // 1. Verify payment directly on PipraPay API if transaction reference or pp_id exists
  if (transactionRef) {
    try {
      const baseUrl = process.env.PIPRAPAY_BASE_URL || "https://pay.aihaat.shop";
      const apiKey = process.env.PIPRAPAY_API_KEY || "6efac52b56d3a19e2b7f39d54df43a8653e5dd21fe93249f84";
      
      const verifyRes = await fetch(`${baseUrl}/api/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "MHS-PIPRAPAY-API-KEY": apiKey,
          "X-Api-Key": apiKey,
        },
        body: JSON.stringify({ pp_id: transactionRef }),
      });

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        console.log("[PipraPay Verify Callback Response]:", verifyData);

        if (verifyData?.status) {
          verifiedStatus = verifyData.status.toLowerCase();
        }
        if (verifyData?.amount || verifyData?.total) {
          verifiedAmount = Number(verifyData.amount || verifyData.total);
        }
        if (verifyData?.email_address) {
          customerEmail = verifyData.email_address.toLowerCase().trim();
        } else if (verifyData?.metadata?.email) {
          customerEmail = verifyData.metadata.email.toLowerCase().trim();
        }
        if (verifyData?.metadata?.userId) {
          userId = verifyData.metadata.userId;
        }
        if (verifyData?.transaction_id && verifyData.transaction_id !== "--") {
          realTrxId = verifyData.transaction_id;
        }
      }
    } catch (err) {
      console.error("[Verify Callback Error]:", err);
    }
  }

  const isWalletTopup = orderId.startsWith("WT-");
  const isCompleted = verifiedStatus === "completed" || verifiedStatus === "success";

  // CASE 1: Payment is genuinely SUCCESSFUL / COMPLETED
  if (isCompleted) {
    if (isWalletTopup) {
      try {
        let user = null;
        if (userId) {
          user = await prisma.user.findUnique({ where: { id: userId } });
        }
        if (!user && customerEmail) {
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: customerEmail },
                { email: { equals: customerEmail } },
              ],
            },
          });
        }

        const topupAmount = verifiedAmount || Number(searchParams.get("amount")) || 0;

        if (user && topupAmount > 0) {
          // Prevent double credit
          const existingApproved = await prisma.walletTransaction.findFirst({
            where: {
              trxId: realTrxId || transactionRef || orderId,
              status: "APPROVED",
            },
          });

          if (!existingApproved) {
            // Credit user wallet balance in MySQL DB
            await prisma.user.update({
              where: { id: user.id },
              data: {
                walletBalanceBDT: {
                  increment: topupAmount,
                },
              },
            });

            // Record deposit transaction
            await prisma.walletTransaction.create({
              data: {
                userId: user.id,
                amountBDT: topupAmount,
                type: "DEPOSIT",
                method: "gateway",
                senderNumber: "GATEWAY",
                trxId: realTrxId || transactionRef || orderId,
                status: "APPROVED",
                note: `Automated Gateway Top-up (${realTrxId || transactionRef})`,
              },
            });

            // Add notification
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: "ওয়ালেট রিচার্জ সফল!",
                message: `আপনার ওয়ালেটে ৳${topupAmount} সফলভাবে জমা হয়েছে।`,
                type: "WALLET",
                link: "/dashboard/wallet",
              },
            });
            console.log(`✓ Wallet credited ৳${topupAmount} for user ${user.email}`);
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
        await prisma.order.updateMany({
          where: {
            OR: [{ orderNumber: orderId }, { id: orderId }],
          },
          data: {
            paymentStatus: "VERIFIED",
            deliveryStatus: "PROCESSING",
            trxId: realTrxId || transactionRef || undefined,
          },
        });
      } catch (dbErr) {
        console.warn("[Prisma callback update order error]:", dbErr);
      }

      updateOrderStatus(orderId, {
        paymentStatus: "Completed",
        deliveryStatus: "Processing",
        trxId: realTrxId || transactionRef || undefined,
      });
    }

    return NextResponse.redirect(
      `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=completed&trxId=${encodeURIComponent(realTrxId || transactionRef)}`
    );
  }

  // CASE 2: Payment is Pending
  if (verifiedStatus === "pending") {
    if (orderId && !isWalletTopup) {
      try {
        await prisma.order.updateMany({
          where: {
            OR: [{ orderNumber: orderId }, { id: orderId }],
          },
          data: {
            paymentStatus: "PENDING",
            deliveryStatus: "PROCESSING",
            trxId: realTrxId || transactionRef || undefined,
          },
        });
      } catch (dbErr) {
        console.warn("[Prisma callback pending error]:", dbErr);
      }

      updateOrderStatus(orderId, {
        paymentStatus: "Pending",
        deliveryStatus: "Processing",
        trxId: realTrxId || transactionRef || undefined,
      });
    }

    return NextResponse.redirect(
      isWalletTopup
        ? `${siteUrl}/dashboard/wallet?topup=pending&trxId=${encodeURIComponent(realTrxId || transactionRef)}`
        : `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=pending&trxId=${encodeURIComponent(realTrxId || transactionRef)}`
    );
  }

  // CASE 3: Payment is CANCELED, FAILED, or Cross-button clicked
  if (isWalletTopup) {
    return NextResponse.redirect(
      `${siteUrl}/dashboard/wallet?topup=cancelled`
    );
  }

  return NextResponse.redirect(
    `${siteUrl}/checkout?payment_status=cancelled&orderId=${encodeURIComponent(orderId)}`
  );
}
