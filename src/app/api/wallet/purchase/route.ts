import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const dbUser = await prisma.user.findUnique({
      where: { email: customerEmail.toLowerCase() },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    if (dbUser.walletBalanceBDT < amount) {
      return NextResponse.json(
        {
          error: `Insufficient wallet balance. Current balance: ৳${dbUser.walletBalanceBDT}, Required: ৳${amount}`,
          currentBalance: dbUser.walletBalanceBDT,
        },
        { status: 400 }
      );
    }

    // Deduct balance from User and record purchase transaction atomically
    const [updatedUser, tx] = await prisma.$transaction([
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

    // Update order status to VERIFIED & PROCESSING in DB
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

    return NextResponse.json({
      success: true,
      message: "Payment completed successfully using wallet balance.",
      remainingBalance: updatedUser.walletBalanceBDT,
      transactionId: tx.id,
    });
  } catch (error: any) {
    console.error("[Wallet Purchase Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
