import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendRefundStatusEmail } from "@/lib/email-service";
import { calculateMaxRefundableAmount } from "./warranty";
import type { ApprovalClaim } from "@/lib/admin-approvals";

async function validateRefundAmount(tx: Prisma.TransactionClient, id: string, amount: number) {
  const refund = await tx.refund.findUniqueOrThrow({
    where: { id }, include: { order: { include: { items: true } }, orderItem: true },
  });
  const orderLimit = calculateMaxRefundableAmount(refund.order);
  const itemLimit = calculateMaxRefundableAmount(refund.order, refund.orderItemId ?? undefined);
  const limit = Math.min(orderLimit, itemLimit, refund.requestedAmountBDT, refund.approvedAmountBDT ?? Infinity);
  if (refund.order.paymentStatus !== "VERIFIED" || !Number.isFinite(amount) ||
    amount <= 0 || amount > Math.round(limit * 100) / 100) {
    throw new Error("Refund amount exceeds the remaining refundable amount or is invalid.");
  }
  return refund;
}

export type RefundReview = {
  refundId: string;
  adminEmail: string;
  action: "APPROVE" | "REJECT" | "PROCESS_WALLET" | "COMPLETE_MANUAL";
  approvedAmount?: number;
  adminNotes?: string;
  customerMessage?: string;
  gatewayRef?: string;
  payoutTrxId?: string;
};

export async function reviewRefundRequest(data: RefundReview, authorize?: ApprovalClaim) {
  const refund = await prisma.refund.findUnique({
    where: { id: data.refundId },
    include: { order: { include: { items: true } }, orderItem: true, user: true },
  });

  if (!refund) throw new Error("Refund request not found.");

  if (data.action !== "REJECT" && !authorize) throw new Error("Second-admin approval required.");

  // 1. REJECT ACTION (Atomic conditional update)
  if (data.action === "REJECT") {
    const updated = await prisma.$transaction(async (tx) => {
      const claim = await tx.refund.updateMany({
        where: {
          id: refund.id,
          status: { in: ["REQUESTED", "UNDER_REVIEW", "APPROVED", "PROCESSING"] },
        },
        data: {
          status: "REJECTED",
          adminNotes: data.adminNotes || "Refund request rejected.",
          customerMessage: data.customerMessage || data.adminNotes || "Request did not meet refund criteria.",
          reviewedBy: data.adminEmail,
          reviewedAt: new Date(),
        },
      });

      if (claim.count === 0) {
        throw new Error(`Refund has already been processed or completed.`);
      }

      return tx.refund.findUnique({ where: { id: refund.id } });
    }, { isolationLevel: "Serializable" });

    await prisma.notification.create({
      data: {
        userId: refund.userId,
        title: "রিফান্ড রিকোয়েস্ট প্রত্যাখ্যাত",
        message: `আপনার অর্ডার #${refund.order.orderNumber} এর রিফান্ড রিকোয়েস্টটি গৃহীত হয়নি।${data.customerMessage ? " কারণ: " + data.customerMessage : ""}`,
        type: "DELIVERY",
        link: "/dashboard/refunds",
      },
    }).catch(console.error);

    await sendRefundStatusEmail({
      customerName: refund.order.customerName,
      customerEmail: refund.order.customerEmail,
      orderNumber: refund.order.orderNumber,
      productName: refund.orderItem ? `${refund.orderItem.productName} (${refund.orderItem.variationName})` : "Order Refund",
      refundAmountBDT: refund.requestedAmountBDT,
      refundMethod: refund.refundMethod,
      status: "REJECTED",
      adminNotes: data.customerMessage || data.adminNotes,
    }).catch(console.error);

    return { success: true, status: "REJECTED", refund: updated };
  }

  // 2. APPROVE ACTION (Atomic conditional update)
  if (data.action === "APPROVE") {
    const rawApprovedAmount = data.approvedAmount ?? refund.requestedAmountBDT;
    const approvedAmount = Math.round(rawApprovedAmount * 100) / 100;

    const updated = await prisma.$transaction(async (tx) => {
      await authorize!(tx);
      await validateRefundAmount(tx, refund.id, approvedAmount);
      const claim = await tx.refund.updateMany({
        where: {
          id: refund.id,
          status: { in: ["REQUESTED", "UNDER_REVIEW"] },
        },
        data: {
          status: "APPROVED",
          approvedAmountBDT: approvedAmount,
          adminNotes: data.adminNotes,
          customerMessage: data.customerMessage,
          reviewedBy: data.adminEmail,
          reviewedAt: new Date(),
        },
      });

      if (claim.count === 0) {
        throw new Error(`Refund has already been reviewed or processed.`);
      }

      return tx.refund.findUnique({ where: { id: refund.id } });
    }, { isolationLevel: "Serializable" });

    await prisma.notification.create({
      data: {
        userId: refund.userId,
        title: "রিফান্ড অনুমোদিত হয়েছে",
        message: `আপনার অর্ডার #${refund.order.orderNumber} এর ৳${approvedAmount} রিফান্ড অনুমোদিত হয়েছে। শীঘ্রই পেমেন্ট সম্পন্ন হবে।`,
        type: "DELIVERY",
        link: "/dashboard/refunds",
      },
    }).catch(console.error);

    await sendRefundStatusEmail({
      customerName: refund.order.customerName,
      customerEmail: refund.order.customerEmail,
      orderNumber: refund.order.orderNumber,
      productName: refund.orderItem ? `${refund.orderItem.productName} (${refund.orderItem.variationName})` : "Order Refund",
      refundAmountBDT: approvedAmount,
      refundMethod: refund.refundMethod,
      status: "APPROVED",
      adminNotes: data.customerMessage || data.adminNotes,
    }).catch(console.error);

    return { success: true, status: "APPROVED", refund: updated };
  }

  // 3. EXECUTE REFUND (PROCESS_WALLET OR COMPLETE_MANUAL) — Atomic Database Claim & State Machine
  const rawFinalAmount = data.approvedAmount ?? refund.approvedAmountBDT ?? refund.requestedAmountBDT;
  const finalAmount = Math.round(rawFinalAmount * 100) / 100;

  if (data.action === "PROCESS_WALLET" || data.action === "COMPLETE_MANUAL") {
    if (data.action === "COMPLETE_MANUAL" && !data.payoutTrxId) {
      throw new Error("Payout transaction ID is required for manual completion.");
    }

    let walletTxId: string | null = null;
    let newWalletBalance: number | undefined = undefined;

    await prisma.$transaction(async (tx) => {
      await authorize!(tx);
      const current = await validateRefundAmount(tx, refund.id, finalAmount);
      if (data.action === "COMPLETE_MANUAL" && current.order.paymentMethod === "EPS" && !data.gatewayRef?.trim()) {
        throw new Error("EPS refund confirmation reference is required.");
      }
      if (current.refundMethod === "WALLET" ? data.action !== "PROCESS_WALLET" : data.action !== "COMPLETE_MANUAL") {
        throw new Error("Payout action does not match the refund method.");
      }
      // 1. Atomic claim of eligible refund row
      const claim = await tx.refund.updateMany({
        where: {
          id: refund.id,
          status: { in: data.action === "COMPLETE_MANUAL" ? ["APPROVED"] : ["REQUESTED", "UNDER_REVIEW", "APPROVED"] },
        },
        data: {
          status: "PROCESSING",
        },
      });

      if (claim.count === 0) {
        throw new Error(`Refund has already been processed or completed.`);
      }

      // 2. Atomic Wallet Credit if PROCESS_WALLET
      if (data.action === "PROCESS_WALLET") {
        const updatedUser = await tx.user.update({
          where: { id: refund.userId },
          data: { walletBalanceBDT: { increment: finalAmount } },
        });
        newWalletBalance = updatedUser.walletBalanceBDT;

        const wTx = await tx.walletTransaction.create({
          data: {
            userId: refund.userId,
            amountBDT: finalAmount,
            type: "REFUND",
            status: "APPROVED",
            method: "system",
            trxId: `REFUND_${refund.id}`,
            note: `Refund for order #${refund.order.orderNumber}${refund.orderItemId ? " / item" : ""}`,
          },
        });
        walletTxId = wTx.id;
      }

      // 3. Update refund record to REFUNDED
      await tx.refund.update({
        where: { id: refund.id },
        data: {
          status: "REFUNDED",
          approvedAmountBDT: finalAmount,
          payoutTrxId: data.payoutTrxId || (walletTxId ? `WAL-REF-${refund.id.slice(-6)}` : null),
          gatewayRef: data.gatewayRef || (data.action === "PROCESS_WALLET" ? "WALLET_CREDIT" : null),
          walletTransactionId: walletTxId,
          processedAt: new Date(),
          reviewedBy: data.adminEmail,
          adminNotes: data.adminNotes,
          customerMessage: data.customerMessage,
        },
      });

      // 4. Update OrderItem if applicable
      if (current.orderItemId && current.orderItem) {
        const remaining = calculateMaxRefundableAmount(current.order, current.orderItemId);
        const newRefunded = Math.round((current.orderItem.refundedBDT + finalAmount) * 100) / 100;
        const isFullyRefunded = finalAmount >= remaining - 0.01;

        await tx.orderItem.update({
          where: { id: current.orderItemId },
          data: {
            refundedBDT: newRefunded,
            isRefunded: isFullyRefunded,
          },
        });
      }

      // 5. Update Order totals
      const newOrderRefunded = Math.round((current.order.refundedBDT + finalAmount) * 100) / 100;
      const isOrderFullyRefunded = newOrderRefunded >= refund.order.totalBDT - 0.01;

      await tx.order.update({
        where: { id: refund.orderId },
        data: {
          refundedBDT: newOrderRefunded,
          refundStatus: isOrderFullyRefunded ? "FULLY_REFUNDED" : "PARTIALLY_REFUNDED",
        },
      });

      // 6. Invalidate associated DigitalStock (mark as REFUNDED)
      if (refund.orderItemId) {
        const delivery = await tx.deliveredKey.findFirst({
          where: { orderId: refund.orderId, orderItemId: refund.orderItemId },
        });
        if (delivery && delivery.stockId) {
          await tx.digitalStock.update({
            where: { id: delivery.stockId },
            data: { status: "REFUNDED" },
          });
        }
      }
    }, { isolationLevel: "Serializable" });

    await prisma.notification.create({
      data: {
        userId: refund.userId,
        title: "রিফান্ড সম্পন্ন হয়েছে",
        message: `আপনার অর্ডার #${refund.order.orderNumber} এর ৳${finalAmount} রিফান্ড ${data.action === "PROCESS_WALLET" ? "ওয়ালেটে যুক্ত হয়েছে।" : "সম্পন্ন হয়েছে।"}`,
        type: data.action === "PROCESS_WALLET" ? "WALLET" : "DELIVERY",
        link: data.action === "PROCESS_WALLET" ? "/dashboard/wallet" : "/dashboard/refunds",
      },
    }).catch(console.error);

    await sendRefundStatusEmail({
      customerName: refund.order.customerName,
      customerEmail: refund.order.customerEmail,
      orderNumber: refund.order.orderNumber,
      productName: refund.orderItem ? `${refund.orderItem.productName} (${refund.orderItem.variationName})` : "Order Refund",
      refundAmountBDT: finalAmount,
      refundMethod: data.action === "PROCESS_WALLET" ? "WALLET" : refund.refundMethod,
      status: "REFUNDED",
      payoutTrxId: data.payoutTrxId,
      walletBalanceBDT: newWalletBalance,
      adminNotes: data.customerMessage || data.adminNotes,
    }).catch(console.error);

    return { success: true, status: "REFUNDED" };
  }

  throw new Error("Invalid review action.");
}
