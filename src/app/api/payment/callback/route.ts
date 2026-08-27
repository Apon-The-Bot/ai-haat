import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/orders-db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId") || "";
  const ppStatus = (searchParams.get("pp_status") || searchParams.get("status") || "").toLowerCase();
  const transactionRef = searchParams.get("transaction_ref") || searchParams.get("pp_id") || "";

  // Dynamic host determination
  const host = req.headers.get("host") || "aihaat.shop";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const siteUrl = `${proto}://${host}`;

  let verifiedStatus = ppStatus || "completed";
  let verifiedAmount = 0;
  let customerEmail = "";

  // Verify payment on PipraPay API if transaction reference is available
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
        if (verifyData?.status) {
          verifiedStatus = verifyData.status.toLowerCase();
        }
        if (verifyData?.amount) {
          verifiedAmount = Number(verifyData.amount);
        }
        if (verifyData?.customer_email) {
          customerEmail = verifyData.customer_email;
        }
      }
    } catch (err) {
      console.error("[Verify Callback Error]:", err);
    }
  }

  const isWalletTopup = orderId.startsWith("WT-");

  // Handle Successful Payment
  if (verifiedStatus === "completed" || verifiedStatus === "success") {
    // 1. WALLET TOP-UP FLOW
    if (isWalletTopup) {
      try {
        let user = null;
        if (customerEmail) {
          user = await prisma.user.findUnique({ where: { email: customerEmail.toLowerCase() } });
        }

        const topupAmount = verifiedAmount || Number(searchParams.get("amount")) || 0;

        if (user && topupAmount > 0) {
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
              trxId: transactionRef || orderId,
              status: "APPROVED",
              note: `Automated Gateway Top-up (${transactionRef})`,
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
        }
      } catch (wErr) {
        console.error("[Wallet Topup Callback Error]:", wErr);
      }

      return NextResponse.redirect(
        `${siteUrl}/dashboard/wallet?topup=success&amount=${encodeURIComponent(String(verifiedAmount))}&trxId=${encodeURIComponent(transactionRef)}`
      );
    }

    // 2. REGULAR STORE ORDER FLOW
    if (orderId) {
      try {
        await prisma.order.updateMany({
          where: {
            OR: [{ orderNumber: orderId }, { id: orderId }],
          },
          data: {
            paymentStatus: "VERIFIED",
            deliveryStatus: "PROCESSING",
            trxId: transactionRef || undefined,
          },
        });
      } catch (dbErr) {
        console.warn("[Prisma callback update order error]:", dbErr);
      }

      updateOrderStatus(orderId, {
        paymentStatus: "Completed",
        deliveryStatus: "Processing",
        trxId: transactionRef || undefined,
      });
    }

    // Redirect to Success Page
    return NextResponse.redirect(
      `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=completed&trxId=${encodeURIComponent(transactionRef)}`
    );
  } else if (verifiedStatus === "pending") {
    if (orderId && !isWalletTopup) {
      try {
        await prisma.order.updateMany({
          where: {
            OR: [{ orderNumber: orderId }, { id: orderId }],
          },
          data: {
            paymentStatus: "PENDING",
            deliveryStatus: "PROCESSING",
            trxId: transactionRef || undefined,
          },
        });
      } catch (dbErr) {
        console.warn("[Prisma callback pending error]:", dbErr);
      }

      updateOrderStatus(orderId, {
        paymentStatus: "Pending",
        deliveryStatus: "Processing",
        trxId: transactionRef || undefined,
      });
    }

    return NextResponse.redirect(
      isWalletTopup
        ? `${siteUrl}/dashboard/wallet?topup=pending&trxId=${encodeURIComponent(transactionRef)}`
        : `${siteUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}&status=pending&trxId=${encodeURIComponent(transactionRef)}`
    );
  } else {
    // Payment Failed or Canceled
    return NextResponse.redirect(
      isWalletTopup
        ? `${siteUrl}/dashboard/wallet?topup=failed`
        : `${siteUrl}/checkout?payment_status=${encodeURIComponent(verifiedStatus || "failed")}&orderId=${encodeURIComponent(orderId)}`
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = body?.metadata?.orderId || body?.orderId || body?.pp_id || "";
    const status = (body?.status || "").toLowerCase();
    const trxId = body?.transaction_id || body?.trx_id || body?.pp_id || "";
    const amount = Number(body?.amount || 0);
    const email = body?.customer_email || body?.metadata?.email || "";

    if (status === "completed" || status === "success") {
      if (orderId.startsWith("WT-") && email && amount > 0) {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { walletBalanceBDT: { increment: amount } },
          });
          await prisma.walletTransaction.create({
            data: {
              userId: user.id,
              amountBDT: amount,
              type: "DEPOSIT",
              method: "gateway",
              trxId: trxId || orderId,
              status: "APPROVED",
              note: `Automated Gateway IPN (${trxId})`,
            },
          });
        }
      } else if (orderId) {
        await prisma.order.updateMany({
          where: {
            OR: [{ orderNumber: orderId }, { id: orderId }],
          },
          data: {
            paymentStatus: "VERIFIED",
            deliveryStatus: "PROCESSING",
            trxId: trxId || undefined,
          },
        });

        updateOrderStatus(orderId, {
          paymentStatus: "Completed",
          deliveryStatus: "Processing",
          trxId: trxId || undefined,
        });
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    console.error("[Payment Webhook Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
