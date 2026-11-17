import { requireAuth, requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllLocalTransactions, creditLocalWalletBalance } from "@/lib/wallet-db";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const { searchParams } = new URL(req.url);
    let all = searchParams.get("all") === "true";
    let email = searchParams.get("email");
    let userId = searchParams.get("userId");
    const statusFilter = searchParams.get("status");
    const query = searchParams.get("query") || searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10)));

    if (user.role !== "ADMIN") {
      all = false;
      email = user.email;
      userId = user.id;
    }

    // 1. Query Prisma MySQL
    try {
      const whereClause: any = {};

      if (!all) {
        if (userId) {
          whereClause.userId = userId;
        } else if (email) {
          whereClause.user = {
            email: email.toLowerCase().trim(),
          };
        }
      } else {
        // Admin filters
        if (statusFilter && statusFilter !== "ALL") {
          whereClause.status = statusFilter;
        }

        if (query && query.trim()) {
          const clean = query.trim();
          whereClause.OR = [
            { trxId: { contains: clean } },
            { senderNumber: { contains: clean } },
            { user: { name: { contains: clean } } },
            { user: { email: { contains: clean } } },
            { user: { phone: { contains: clean } } },
          ];
        }
      }

      const total = await prisma.walletTransaction.count({ where: whereClause });
      const totalPages = Math.ceil(total / pageSize);
      const skip = (page - 1) * pageSize;

      const txs = await prisma.walletTransaction.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              walletBalanceBDT: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      });

      const formatted = txs.map((t) => ({
        id: t.id,
        userId: t.userId,
        userName: t.user?.name || "Customer",
        userEmail: t.user?.email || "",
        userPhone: t.user?.phone || t.senderNumber || "N/A",
        currentBalance: t.user?.walletBalanceBDT || 0,
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

      return NextResponse.json({
        success: true,
        transactions: formatted,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      });
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

    return NextResponse.json({
      success: true,
      transactions: localTxs,
      pagination: {
        page: 1,
        pageSize: localTxs.length,
        total: localTxs.length,
        totalPages: 1,
      },
    });
  } catch (error: any) {
    console.error("[Wallet Transactions GET Fatal Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export { POST } from "./request-wallet-change";

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const body = await req.json();
    const { transactionId, status, note } = body;

    if (!transactionId || !status) {
      return NextResponse.json({ error: "Missing transactionId or status" }, { status: 400 });
    }

    const newStatus = status.toUpperCase() === "APPROVED" ? "APPROVED" : "REJECTED";

    try {
      const txRecord = await prisma.walletTransaction.findUnique({
        where: { id: transactionId },
        include: { user: true },
      });

      if (!txRecord) {
        return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
      }

      // V7 FIX: Move status check INSIDE transaction for atomic idempotency
      // The old check outside the transaction allowed race conditions where
      // two concurrent approvals could both pass and credit twice.
      const result = await prisma.$transaction(async (tx) => {
        // Atomic status transition: only update if still PENDING
        const statusUpdate = await tx.walletTransaction.updateMany({
          where: {
            id: transactionId,
            status: "PENDING", // Only transition from PENDING — atomic guard
          },
          data: {
            status: newStatus as any,
            note: note || txRecord.note,
          },
        });

        if (statusUpdate.count === 0) {
          // Already processed by another concurrent request
          return { alreadyProcessed: true };
        }

        if (newStatus === "APPROVED") {
          // Credit user balance atomically
          await tx.user.update({
            where: { id: txRecord.userId },
            data: { walletBalanceBDT: { increment: txRecord.amountBDT } },
          });

          await tx.notification.create({
            data: {
              userId: txRecord.userId,
              title: "ডিপোজিট অ্যাপ্রুভ হয়েছে!",
              message: `আপনার ৳${txRecord.amountBDT} ডিপোজিট রিকোয়েস্ট অনুমোদিত হয়েছে। ব্যালেন্স যুক্ত হয়েছে।`,
              type: "WALLET",
              link: "/dashboard/wallet",
            },
          });
        } else {
          await tx.notification.create({
            data: {
              userId: txRecord.userId,
              title: "ডিপোজিট রিকোয়েস্ট বাতিল",
              message: `আপনার ৳${txRecord.amountBDT} ডিপোজিট রিকোয়েস্টটি বাতিল করা হয়েছে। ${note ? `কারণ: ${note}` : ""}`,
              type: "WALLET",
              link: "/dashboard/wallet",
            },
          });
        }

        return { alreadyProcessed: false };
      });

      if (result.alreadyProcessed) {
        return NextResponse.json({ error: `Transaction is already processed (no longer PENDING).` }, { status: 400 });
      }

      // Log Admin Audit
      await logAdminAudit({
        actorId: currentAdmin.id,
        actorEmail: currentAdmin.email,
        action: newStatus === "APPROVED" ? "WALLET_DEPOSIT_APPROVE" : "WALLET_DEPOSIT_REJECT",
        targetType: "WALLET",
        targetId: txRecord.id,
        details: {
          userEmail: txRecord.user?.email,
          amountBDT: txRecord.amountBDT,
          method: txRecord.method,
          trxId: txRecord.trxId,
          rejectionReason: newStatus === "REJECTED" ? note : undefined,
        },
      });

      // Update local storage backup if user exists
      if (newStatus === "APPROVED" && txRecord.user?.email) {
        creditLocalWalletBalance(txRecord.user.email, txRecord.amountBDT);
      }

      return NextResponse.json({
        success: true,
        message: `Transaction ${newStatus.toLowerCase()} successfully.`,
      });
    } catch (err: any) {
      console.error("[Wallet Transaction PATCH DB Error]:", err);
      return NextResponse.json({ error: err?.message || "Database update failed" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[Wallet Transactions PATCH Error]:", error);
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}
