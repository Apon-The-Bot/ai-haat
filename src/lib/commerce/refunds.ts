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
