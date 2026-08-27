import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWalletRechargeTelegramAlert } from "@/utils/telegram";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    const whereClause: any = {};

    if (!all) {
      if (userId) {
        whereClause.userId = userId;
      } else if (email) {
        whereClause.user = {
          email: email.toLowerCase(),
        };
      }
    }

    const txs = await prisma.walletTransaction.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = txs.map((t) => ({
      id: t.id,
      userId: t.userId,
      userName: t.user?.name || "Customer",
      userEmail: t.user?.email || "",
      userPhone: t.user?.phone || t.senderNumber || "",
      amountBDT: t.amountBDT,
      type: t.type,
      method: t.method,
      senderNumber: t.senderNumber || "",
      trxId: t.trxId || "N/A",
      status: t.status,
      note: t.note || "",
      date: t.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, transactions: formatted });
  } catch (error: any) {
    console.error("[Wallet Transactions GET Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userName, userPhone, userEmail, amountBDT, method, senderNumber, trxId, note } = body;

    if (!amountBDT || !trxId || !userEmail) {
      return NextResponse.json({ error: "Amount, email, and TrxID are required." }, { status: 400 });
    }

    // Find or create user
    let dbUser = await prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          name: userName || "Customer",
          email: userEmail.toLowerCase(),
          phone: userPhone || senderNumber || null,
          role: "USER",
          walletBalanceBDT: 0,
        },
      });
    }

    const tx = await prisma.walletTransaction.create({
      data: {
        userId: dbUser.id,
        amountBDT: Number(amountBDT),
        type: "DEPOSIT",
        method: method || "manual",
        senderNumber: senderNumber || null,
        trxId: trxId || null,
        status: "PENDING",
        note: note || "Manual top-up request",
      },
    });

    // Send Telegram Alert
    try {
      await sendWalletRechargeTelegramAlert({
        userName: userName || dbUser.name || "Customer",
        userPhone: userPhone || senderNumber || "N/A",
        userEmail: userEmail,
        amountBDT: Number(amountBDT),
        method: method || "bkash",
        senderNumber: senderNumber || "N/A",
        trxId,
      });
    } catch (e) {
      console.warn("Telegram alert error:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Top-up request submitted for approval.",
      transaction: tx,
    });
  } catch (error: any) {
    console.error("[Wallet Transactions POST Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, status } = body; // status: "APPROVED" | "REJECTED"

    if (!transactionId || !status) {
      return NextResponse.json({ error: "Missing transactionId or status" }, { status: 400 });
    }

    const tx = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (tx.status === "APPROVED" && status === "APPROVED") {
      return NextResponse.json({ success: true, message: "Transaction is already approved" });
    }

    const updatedTx = await prisma.walletTransaction.update({
      where: { id: transactionId },
      data: { status },
    });

    if (status === "APPROVED") {
      // Credit user's wallet in MySQL DB
      await prisma.user.update({
        where: { id: tx.userId },
        data: {
          walletBalanceBDT: {
            increment: tx.amountBDT,
          },
        },
      });

      // Create in-app notification
      try {
        await prisma.notification.create({
          data: {
            userId: tx.userId,
            title: "ওয়ালেট রিচার্জ সফল!",
            message: `আপনার ওয়ালেটে ৳${tx.amountBDT} সফলভাবে জমা করা হয়েছে।`,
            type: "WALLET",
            link: "/dashboard/wallet",
          },
        });
      } catch (e) {
        console.warn("Notification create error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Transaction ${status.toLowerCase()} successfully`,
      transaction: updatedTx,
    });
  } catch (error: any) {
    console.error("[Wallet Transactions PATCH Error]:", error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
