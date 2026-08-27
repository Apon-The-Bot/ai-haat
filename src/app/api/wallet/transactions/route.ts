import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllLocalTransactions, recordLocalTransaction } from "@/lib/wallet-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    // 1. Try Prisma MySQL
    try {
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
    } catch (dbErr) {
      console.warn("[Prisma /api/wallet/transactions fallback to JSON]:", dbErr);
    }

    // 2. Fallback to Local JSON Storage
    let localTxs = getAllLocalTransactions();
    if (!all) {
      if (email) {
        const cleanEmail = email.toLowerCase().trim();
        localTxs = localTxs.filter((t) => t.userEmail.toLowerCase().trim() === cleanEmail);
      } else if (userId) {
        localTxs = localTxs.filter((t) => t.userId === userId);
      }
    }

    return NextResponse.json({ success: true, transactions: localTxs });
  } catch (error: any) {
    console.error("[Wallet Transactions GET Fatal Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amountBDT,
      method,
      senderNumber,
      trxId,
      userEmail,
      userName,
      userPhone,
      note,
    } = body;

    if (!amountBDT || amountBDT <= 0 || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanEmail = userEmail.toLowerCase().trim();

    // 1. Record in local fallback
    const recorded = recordLocalTransaction({
      userId: `usr_${cleanEmail.slice(0, 5)}`,
      userEmail: cleanEmail,
      userName: userName || "Customer",
      amountBDT: Number(amountBDT),
      type: "DEPOSIT",
      method: method || "gateway",
      senderNumber: senderNumber || "",
      trxId: trxId || "N/A",
      status: "APPROVED",
      note: note || "Wallet Deposit",
    });

    // 2. Try sync to Prisma MySQL
    try {
      let user = await prisma.user.findFirst({
        where: { email: cleanEmail },
      });

      if (user) {
        await prisma.walletTransaction.create({
          data: {
            userId: user.id,
            amountBDT: Number(amountBDT),
            type: "DEPOSIT",
            method: method || "gateway",
            senderNumber: senderNumber || null,
            trxId: trxId || null,
            status: "APPROVED",
            note: note || null,
          },
        });
      }
    } catch (dbErr) {
      console.warn("[Prisma wallet tx create error - non-fatal]:", dbErr);
    }

    return NextResponse.json({ success: true, transaction: recorded });
  } catch (error: any) {
    console.error("[Wallet Transactions POST Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to record transaction" }, { status: 500 });
  }
}
