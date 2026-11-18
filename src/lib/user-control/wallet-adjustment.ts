import { prisma } from "@/lib/prisma";
import type { ApprovalClaim } from "@/lib/admin-approvals";
import { randomUUID } from "node:crypto";

export async function adjustUserWalletBalance(params: {
  userId: string;
  type: "CREDIT" | "DEBIT";
  amountBDT: number;
  category: "BONUS" | "MANUAL_ADJUSTMENT" | "REFUND" | "PENALTY" | "CORRECTION";
  reason: string;
  reference?: string;
  internalNote?: string;
  ledger?: { type: "DEPOSIT" | "LEGACY_ADJUSTMENT" | "INITIAL_CREDIT"; method: string; senderNumber?: string };
  adminId: string;
  adminEmail: string;
}, authorize: ApprovalClaim): Promise<{
  success: boolean;
  previousBalance: number;
  newBalance: number;
  transactionId: string;
}> {
  const { userId, type, amountBDT, category, reason, reference, internalNote, adminId, adminEmail, ledger } = params;

  if (!Number.isFinite(amountBDT) || amountBDT < 0.01) {
    throw new Error("Adjustment amount must be strictly greater than zero.");
  }

  const roundedAmount = Math.round(amountBDT * 100) / 100;

  // Execute core financial mutations inside an isolated atomic transaction
  const txResult = await prisma.$transaction(
    async (tx) => {
      await authorize(tx);
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, walletBalanceBDT: true },
      });

      if (!user) {
        throw new Error("Target customer not found.");
      }

      const previousBalance = user.walletBalanceBDT || 0;
      let newBalance = previousBalance;

      if (type === "CREDIT") {
        newBalance = Math.round((previousBalance + roundedAmount) * 100) / 100;
      } else {
        if (previousBalance < roundedAmount) {
          throw new Error(
            `Insufficient wallet balance. Available: ৳${previousBalance.toFixed(2)}, Requested Deduction: ৳${roundedAmount.toFixed(2)}.`
          );
        }
        newBalance = Math.round((previousBalance - roundedAmount) * 100) / 100;
      }

      // 1. Create Immutable WalletTransaction record
      const trx = await tx.walletTransaction.create({
        data: {
          userId,
          amountBDT: roundedAmount,
          type: type === "DEBIT" ? "PURCHASE" : ledger && ledger.type !== "INITIAL_CREDIT" ? "DEPOSIT" : "BONUS",
          method: ledger?.method ?? "ADMIN_ADJUSTMENT",
          senderNumber: ledger?.senderNumber,
          note: ledger ? reason : undefined,
          status: "APPROVED",
          trxId: reference || `ADJ-${randomUUID()}`,
        },
      });

      // 2. Update user wallet balance atomically
      await tx.user.update({
        where: { id: userId },
        data: { walletBalanceBDT: newBalance },
      });

      return {
        previousBalance,
        newBalance,
        transactionId: trx.id,
        trxReference: trx.trxId,
        userEmail: user.email,
      };
    },
    { isolationLevel: "Serializable", timeout: 15000, maxWait: 10000 }
  );

  // 3. Post-transaction audit and activity logging (asynchronous and non-blocking)
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorId: adminId,
        actorEmail: adminEmail,
        action: type === "CREDIT" ? "WALLET_MANUAL_CREDIT" : "WALLET_MANUAL_DEBIT",
        targetType: "WALLET",
        targetId: userId,
        details: JSON.stringify({
          previousBalance: txResult.previousBalance,
          newBalance: txResult.newBalance,
          amountBDT: roundedAmount,
          category,
          reason,
          reference: txResult.trxReference,
          internalNote,
        }),
      },
    });

    await prisma.userActivityLog.create({
      data: {
        userId,
        eventType: type === "CREDIT" ? "WALLET_CREDITED" : "WALLET_DEBITED",
        category: "FINANCIAL",
        description: `Wallet ${type === "CREDIT" ? "credited" : "debited"} by ৳${roundedAmount.toFixed(2)}. New balance: ৳${txResult.newBalance.toFixed(2)}. Reason: ${reason}`,
        metadata: JSON.stringify({
          transactionId: txResult.transactionId,
          reference: txResult.trxReference,
          amount: roundedAmount,
          category,
        }),
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: type === "CREDIT" ? "ওয়ালেট ব্যালেন্স যোগ হয়েছে" : "ওয়ালেট ব্যালেন্স কর্তন করা হয়েছে",
        message:
          type === "CREDIT"
            ? `আপনার ওয়ালেটে ৳${roundedAmount.toFixed(2)} যোগ করা হয়েছে। বর্তমান ব্যালেন্স: ৳${txResult.newBalance.toFixed(2)}। কারণ: ${reason}`
            : `আপনার ওয়ালেট থেকে ৳${roundedAmount.toFixed(2)} কর্তন করা হয়েছে। বর্তমান ব্যালেন্স: ৳${txResult.newBalance.toFixed(2)}। কারণ: ${reason}`,
        type: "WALLET",
      },
    });
  } catch (logErr) {
    console.warn("[Post-Wallet Log Warning]:", logErr);
  }

  return {
    success: true,
    previousBalance: txResult.previousBalance,
    newBalance: txResult.newBalance,
    transactionId: txResult.transactionId,
  };
}
