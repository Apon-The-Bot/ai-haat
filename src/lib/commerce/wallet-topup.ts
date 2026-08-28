import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { dispatchNotificationEvent, NOTIFICATION_EVENTS } from "@/lib/notifications";
import { creditLocalWalletBalance, recordLocalTransaction } from "@/lib/wallet-db";

export interface FinalizeWalletTopupParams {
  userId: string;
  userEmail: string;
  userName?: string | null;
  amountBDT: number;
  trxId: string;
  method?: string;
  senderNumber?: string | null;
  note?: string | null;
}

export interface FinalizeWalletTopupResult {
  success: boolean;
  alreadyProcessed: boolean;
  conflict?: boolean;
  amountBDT: number;
  trxId: string;
  newBalanceBDT?: number;
  error?: string;
}

/**
 * Concurrency-safe, centralized wallet top-up finalization engine.
 * Guaranteed idempotency at both application and database constraint levels.
 * Validates metadata integrity to detect and reject PAYMENT_IDEMPOTENCY_CONFLICT.
 * Shared by both Webhook IPN and Callback handlers.
 */
export async function finalizeWalletTopup(
  params: FinalizeWalletTopupParams
): Promise<FinalizeWalletTopupResult> {
  const {
    userId,
    userEmail,
    userName,
    amountBDT,
    trxId,
    method = "gateway",
    senderNumber = "GATEWAY",
    note,
  } = params;

  // 1. Amount & Reference Validation
  const cleanTrxId = (trxId || "").trim();
  const parsedAmount = Math.round(amountBDT * 100) / 100;

  if (!cleanTrxId) {
    return {
      success: false,
      alreadyProcessed: false,
      amountBDT: 0,
      trxId: "",
      error: "Missing transaction reference ID",
    };
  }

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return {
      success: false,
      alreadyProcessed: false,
      amountBDT: 0,
      trxId: cleanTrxId,
      error: "Invalid top-up amount",
    };
  }

  try {
    let alreadyProcessed = false;
    let conflictDetected = false;
    let conflictReason = "";
    let newBalanceBDT = 0;

    // 2. Atomic Database Transaction with DB-Level Unique Constraint Guard
    try {
      await prisma.$transaction(async (tx) => {
        // Fast-path check: Is this transaction already registered?
        const existing = await tx.walletTransaction.findUnique({
          where: { trxId: cleanTrxId },
        });

        if (existing) {
          // Check for PAYMENT_IDEMPOTENCY_CONFLICT
          const amountMismatch = Math.abs(existing.amountBDT - parsedAmount) > 0.01;
          const userMismatch = existing.userId !== userId;

          if (amountMismatch || userMismatch) {
            conflictDetected = true;
            conflictReason = `PAYMENT_IDEMPOTENCY_CONFLICT: Existing trxId=${cleanTrxId} has mismatched attributes (storedUser=${existing.userId}, requestUser=${userId}, storedAmount=৳${existing.amountBDT}, requestAmount=৳${parsedAmount})`;
            console.error(`[WalletTopup] ${conflictReason}`);
            return;
          }

          if (existing.status === "APPROVED") {
            alreadyProcessed = true;
            return;
          }
        }

        // Insert new transaction record (Protected by @unique on trxId in MySQL)
        await tx.walletTransaction.create({
          data: {
            userId,
            amountBDT: parsedAmount,
            type: "DEPOSIT",
            method,
            senderNumber,
            trxId: cleanTrxId,
            status: "APPROVED",
            note: note || `Automated Gateway Top-up (${cleanTrxId})`,
          },
        });

        // Atomically increment user wallet balance
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { walletBalanceBDT: { increment: parsedAmount } },
          select: { walletBalanceBDT: true },
        });

        newBalanceBDT = updatedUser.walletBalanceBDT;

        // Create in-app notification
        await tx.notification.create({
          data: {
            userId,
            title: "ওয়ালেট রিচার্জ সফল!",
            message: `আপনার ওয়ালেটে ৳${parsedAmount} সফলভাবে জমা হয়েছে।`,
            type: "WALLET",
            link: "/dashboard/wallet",
            dedupeKey: `wallet_topup_${cleanTrxId}`,
          },
        });
      });
    } catch (txError: any) {
      // In high-concurrency races, wait briefly for winning transaction commit
      let foundWinner = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        const winnerTx = await prisma.walletTransaction.findUnique({
          where: { trxId: cleanTrxId },
        });
        if (winnerTx && winnerTx.status === "APPROVED") {
          // Verify attributes on the concurrent winner
          if (winnerTx.userId !== userId || Math.abs(winnerTx.amountBDT - parsedAmount) > 0.01) {
            conflictDetected = true;
            conflictReason = `PAYMENT_IDEMPOTENCY_CONFLICT: Concurrent winner has mismatched attributes for trxId=${cleanTrxId}`;
            break;
          }
          alreadyProcessed = true;
          foundWinner = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
      }

      if (!foundWinner && !conflictDetected) {
        throw txError;
      }
    }

    if (conflictDetected) {
      return {
        success: false,
        alreadyProcessed: false,
        conflict: true,
        amountBDT: parsedAmount,
        trxId: cleanTrxId,
        error: conflictReason || "PAYMENT_IDEMPOTENCY_CONFLICT",
      };
    }

    if (alreadyProcessed) {
      return {
        success: true,
        alreadyProcessed: true,
        amountBDT: parsedAmount,
        trxId: cleanTrxId,
      };
    }

    // 3. Side Effects: Dispatch Notification Event (Deduplicated)
    try {
      await dispatchNotificationEvent({
        eventType: NOTIFICATION_EVENTS.WALLET_TOPUP_COMPLETED,
        entityType: "WALLET",
        entityId: cleanTrxId,
        userId,
        recipientEmail: userEmail,
        dedupeKey: `wallet_topup_${cleanTrxId}`,
        payload: {
          userId,
          userEmail,
          userName: userName || userEmail.split("@")[0],
          amountBDT: parsedAmount,
          trxId: cleanTrxId,
          method,
          status: "COMPLETED",
          walletUrl: "https://aihaat.shop/dashboard/wallet",
        },
      });
    } catch (notifErr) {
      console.error("[WalletTopup] Notification dispatch error (non-fatal):", notifErr);
    }

    // 4. Local fallback synchronization
    try {
      creditLocalWalletBalance(userEmail, parsedAmount);
      recordLocalTransaction({
        userId,
        userEmail,
        userName: userName || userEmail.split("@")[0],
        amountBDT: parsedAmount,
        type: "DEPOSIT",
        method,
        senderNumber: senderNumber || undefined,
        trxId: cleanTrxId,
        status: "APPROVED",
        note: note || `Automated Gateway Top-up (${cleanTrxId})`,
      });
    } catch (localErr) {
      console.warn("[WalletTopup] Local fallback sync error:", localErr);
    }

    return {
      success: true,
      alreadyProcessed: false,
      amountBDT: parsedAmount,
      trxId: cleanTrxId,
      newBalanceBDT,
    };
  } catch (error: any) {
    console.error("[WalletTopup] Fatal error finalizing wallet topup:", error);
    return {
      success: false,
      alreadyProcessed: false,
      amountBDT: parsedAmount,
      trxId: cleanTrxId,
      error: error.message || "Failed to finalize wallet topup",
    };
  }
}
