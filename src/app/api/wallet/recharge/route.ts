import { requireAuth } from "@/lib/auth-guard";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWalletRechargeTelegramAlert } from "@/utils/telegram";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { isSameOriginMutation } from "@/lib/security/csrf";

export async function POST(req: Request) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`wallet-recharge:${user.id || ip}`, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterMs, "ওয়ালেট রিচার্জের অনুরোধের সীমা অতিক্রম করেছে। কিছুক্ষণ পর আবার চেষ্টা করুন।");
  }

  try {
    const body = await req.json();
    const { userName, userPhone, amountBDT, method, senderNumber, trxId } = body;

    const numAmount = Number(amountBDT);
    if (!amountBDT || isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: "Valid amount is required (greater than ৳0)." }, { status: 400 });
    }

    const cleanTrxId = typeof trxId === "string" ? trxId.trim().toUpperCase() : "";
    if (!cleanTrxId) {
      return NextResponse.json({ error: "Transaction ID (TrxID) is required." }, { status: 400 });
    }

    // 1. Enforce unique transaction ID in database
    const existingTx = await prisma.walletTransaction.findUnique({
      where: { trxId: cleanTrxId },
    });

    if (existingTx) {
      return NextResponse.json(
        { error: "এই ট্রানজেকশন আইডিটি (TrxID) ইতিমধ্যে ব্যবহৃত হয়েছে।" },
        { status: 409 }
      );
    }

    // 2. Create durable PENDING WalletTransaction in database
    const pendingTx = await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        amountBDT: numAmount,
        type: "DEPOSIT",
        method: method || "bkash",
        senderNumber: senderNumber || userPhone || null,
        trxId: cleanTrxId,
        status: "PENDING",
        note: `Manual recharge request via ${method || "MFS"}`,
      },
    });

    // 3. Dispatch Telegram alert (non-fatal)
    try {
      await sendWalletRechargeTelegramAlert({
        userName: userName || user.name || "Customer",
        userPhone: userPhone || senderNumber || "N/A",
        userEmail: user.email,
        amountBDT: numAmount,
        method: method || "bkash",
        senderNumber: senderNumber || "N/A",
        trxId: cleanTrxId,
      });
    } catch (telegramErr) {
      console.warn("[Wallet Recharge Telegram Alert Non-fatal Error]:", telegramErr);
    }

    return NextResponse.json({
      success: true,
      message: "রিচার্জের অনুরোধ জমা হয়েছে। এডমিন ভেরিফাই করে ব্যালেন্স যোগ করবেন।",
      transactionId: pendingTx.id,
      trxId: cleanTrxId,
    });
  } catch (error: any) {
    console.error("[Recharge API Error]:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "এই ট্রানজেকশন আইডিটি (TrxID) ইতিমধ্যে ব্যবহৃত হয়েছে।" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to submit recharge" }, { status: 500 });
  }
}
