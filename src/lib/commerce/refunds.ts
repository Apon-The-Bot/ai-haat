import { prisma } from "@/lib/prisma";
import { sendRefundTelegramAlert } from "@/utils/telegram";
import { sendRefundStatusEmail } from "@/lib/email-service";
import { calculateRefundEligibility, calculateMaxRefundableAmount } from "./warranty";
import { RefundStatus, RefundMethod } from "@prisma/client";

export async function createRefundRequest(data: {
  userId: string;
  orderId: string;
  orderItemId?: string | null;
  reason: string;
  description?: string | null;
  refundMethod: RefundMethod;
  payoutPhone?: string | null;
}) {
  const cleanDescription = typeof data.description === "string" ? data.description.trim() : "";
  const cleanReason = typeof data.reason === "string" ? data.reason.trim() : "";
  const cleanPayoutPhone = typeof data.payoutPhone === "string" ? data.payoutPhone.trim() : null;

  if (!cleanReason) {
    throw new Error("Refund reason is required.");
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: data.orderId }, { orderNumber: data.orderId }],
      userId: data.userId,
    },
    include: { items: true },
  });

  if (!order) {
    throw new Error("Order not found or unauthorized.");
  }

  let orderItem = null;
  if (data.orderItemId) {
    orderItem = order.items.find((i) => i.id === data.orderItemId);
    if (!orderItem) {
      throw new Error("Specified order item not found in this order.");
    }
  }

  const eligibility = calculateRefundEligibility(order, orderItem);
  if (!eligibility.isEligible) {
    throw new Error(eligibility.reason || "This order/item is not eligible for refund.");
  }

  const rawMaxRefundable = calculateMaxRefundableAmount(
    {
      totalBDT: order.totalBDT,
      subtotalBDT: order.subtotalBDT,
      discountBDT: order.discountBDT,
      items: order.items,
      refundedBDT: order.refundedBDT,
    },
    data.orderItemId || undefined
  );

  const maxRefundable = Math.round(rawMaxRefundable * 100) / 100;

  if (maxRefundable <= 0) {
    throw new Error("Maximum refundable amount is zero.");
  }

  const existingRequest = await prisma.refund.findFirst({
    where: {
      orderId: order.id,
      orderItemId: data.orderItemId || null,
      status: { in: ["REQUESTED", "UNDER_REVIEW", "PROCESSING", "APPROVED"] },
    },
  });

  if (existingRequest) {
    throw new Error("A refund request is already processing for this item/order.");
  }

  const refund = await prisma.refund.create({
    data: {
      userId: data.userId,
      orderId: order.id,
      orderItemId: data.orderItemId || null,
      reason: cleanReason,
      description: cleanDescription,
      refundMethod: data.refundMethod,
      payoutPhone: cleanPayoutPhone,
      requestedAmountBDT: maxRefundable,
      status: "REQUESTED",
    },
  });

  await prisma.notification.create({
    data: {
      userId: data.userId,
      title: "রিফান্ড রিকোয়েস্ট গ্রহণ করা হয়েছে",
      message: `আপনার অর্ডার #${order.orderNumber} এর রিফান্ড রিকোয়েস্ট এডমিন টিমে পাঠানো হয়েছে।`,
      type: "DELIVERY",
      link: "/dashboard/refunds",
    },
  }).catch(console.error);

  await prisma.orderTimelineEvent.create({
    data: {
      orderId: order.id,
      status: "REFUND_REQUESTED",
      actor: "CUSTOMER",
      note: `Refund requested for ৳${maxRefundable}. Reason: ${cleanReason}`,
    },
  }).catch(console.error);

  // Send Telegram Alert (sanitized, no credentials)
  await sendRefundTelegramAlert({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    productName: orderItem ? `${orderItem.productName} (${orderItem.variationName})` : "Entire Order",
    amountBDT: maxRefundable,
    refundMethod: data.refundMethod,
    reason: cleanReason,
    description: cleanDescription,
    payoutPhone: cleanPayoutPhone || undefined,
  }).catch(console.error);

  // Send email to customer
  await sendRefundStatusEmail({
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    orderNumber: order.orderNumber,
    productName: orderItem ? `${orderItem.productName} (${orderItem.variationName})` : "Order Refund",
    refundAmountBDT: maxRefundable,
    refundMethod: data.refundMethod,
    status: "REQUESTED",
  }).catch(console.error);

  return refund;
}

export async function reviewRefundRequest(data: {
  refundId: string;
  adminEmail: string;
  action: "APPROVE" | "REJECT" | "PROCESS_WALLET" | "COMPLETE_MANUAL";
  approvedAmount?: number;
  adminNotes?: string;
  customerMessage?: string;
  gatewayRef?: string;
  payoutTrxId?: string;
}) {
  const refund = await prisma.refund.findUnique({
    where: { id: data.refundId },
    include: { order: { include: { items: true } }, orderItem: true, user: true },
  });

  if (!refund) throw new Error("Refund request not found.");

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
    });

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
    const rawApprovedAmount = data.approvedAmount || refund.requestedAmountBDT;
    const approvedAmount = Math.round(rawApprovedAmount * 100) / 100;

    const updated = await prisma.$transaction(async (tx) => {
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
    });

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
  const rawFinalAmount = data.approvedAmount || refund.approvedAmountBDT || refund.requestedAmountBDT;
  const finalAmount = Math.round(rawFinalAmount * 100) / 100;

  if (data.action === "PROCESS_WALLET" || data.action === "COMPLETE_MANUAL") {
    if (data.action === "COMPLETE_MANUAL" && !data.payoutTrxId) {
      throw new Error("Payout transaction ID is required for manual completion.");
    }

    let walletTxId: string | null = null;
    let newWalletBalance: number | undefined = undefined;

    await prisma.$transaction(async (tx) => {
      // 1. Atomic claim of eligible refund row
      const claim = await tx.refund.updateMany({
        where: {
          id: refund.id,
          status: { in: ["REQUESTED", "UNDER_REVIEW", "APPROVED"] },
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
      if (refund.orderItemId && refund.orderItem) {
        const itemMaxRefundable = calculateMaxRefundableAmount(
          {
            totalBDT: refund.order.totalBDT,
            subtotalBDT: refund.order.subtotalBDT,
            discountBDT: refund.order.discountBDT,
            items: refund.order.items,
            refundedBDT: refund.order.refundedBDT,
          },
          refund.orderItemId
        );

        const newRefunded = Math.round(((refund.orderItem.refundedBDT || 0) + finalAmount) * 100) / 100;
        const isFullyRefunded = newRefunded >= itemMaxRefundable - 0.01;

        await tx.orderItem.update({
          where: { id: refund.orderItemId },
          data: {
            refundedBDT: newRefunded,
            isRefunded: isFullyRefunded,
          },
        });
      }

      // 5. Update Order totals
      const newOrderRefunded = Math.round(((refund.order.refundedBDT || 0) + finalAmount) * 100) / 100;
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
          }).catch(() => {});
        }
      }
    });

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
