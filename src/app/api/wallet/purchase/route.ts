import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/lib/orders-db";
import {
  getLocalUserByEmail,
  debitLocalWalletBalance,
  recordLocalTransaction,
} from "@/lib/wallet-db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amountBDT, customerEmail } = body;

    if (!orderId || !amountBDT || !customerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const amount = Number(amountBDT);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const cleanEmail = customerEmail.toLowerCase().trim();

    // 1. Check Local Dual-Resilient Storage First
    let localUser = getLocalUserByEmail(cleanEmail);
    let remainingBalance = 0;
    let purchaseSuccess = false;

    if (localUser && (localUser.walletBalanceBDT || 0) >= amount) {
      debitLocalWalletBalance(cleanEmail, amount);
      localUser = getLocalUserByEmail(cleanEmail);
      remainingBalance = localUser?.walletBalanceBDT || 0;
      purchaseSuccess = true;

      recordLocalTransaction({
        userId: localUser?.id || `usr_${cleanEmail.slice(0, 5)}`,
        userEmail: cleanEmail,
        userName: localUser?.name || cleanEmail.split("@")[0],
        amountBDT: amount,
        type: "PURCHASE",
        method: "wallet",
        trxId: `WAL-${orderId}`,
        status: "APPROVED",
        note: `Payment for order #${orderId}`,
      });
    }

    // 2. Try MySQL DB deduction
    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: cleanEmail }, { email: customerEmail }],
        },
      });

      if (dbUser && dbUser.walletBalanceBDT >= amount) {
        const [updatedUser] = await prisma.$transaction([
          prisma.user.update({
            where: { id: dbUser.id },
            data: {
              walletBalanceBDT: {
                decrement: amount,
              },
            },
          }),
          prisma.walletTransaction.create({
            data: {
              userId: dbUser.id,
              amountBDT: amount,
              type: "PURCHASE",
              method: "wallet",
              trxId: `WAL-${orderId}`,
              status: "APPROVED",
              note: `Payment for order #${orderId}`,
            },
          }),
        ]);
        remainingBalance = updatedUser.walletBalanceBDT;
        purchaseSuccess = true;
      }
    } catch (dbErr) {
      console.warn("[Prisma Wallet Purchase DB sync warning]:", dbErr);
    }

    if (!purchaseSuccess) {
      return NextResponse.json(
        {
          error: `ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই (ব্যালেন্স: ৳${localUser?.walletBalanceBDT || 0}, প্রয়োজন: ৳${amount})।`,
        },
        { status: 400 }
      );
    }

    // 3. Mark Order as Verified & Processing in DB & JSON
    try {
      await prisma.order.updateMany({
        where: {
          OR: [{ orderNumber: orderId }, { id: orderId }],
        },
        data: {
          paymentStatus: "VERIFIED",
          deliveryStatus: "PROCESSING",
          trxId: `WAL-${orderId}`,
        },
      });
    } catch (e) {
      console.warn("Order status update error on wallet pay:", e);
    }

    updateOrderStatus(orderId, {
      paymentStatus: "Completed",
      deliveryStatus: "Processing",
      trxId: `WAL-${orderId}`,
    });

    return NextResponse.json({
      success: true,
      message: "Payment completed successfully using wallet balance.",
      remainingBalance,
      transactionId: `WAL-${orderId}`,
    });
  } catch (error: any) {
    console.error("[Wallet Purchase Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
