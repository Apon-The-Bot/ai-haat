import { prisma } from "@/lib/prisma";
import { TicketCategory, TicketPriority, TicketStatus, MessageSenderType } from "@prisma/client";
import { sendSupportTicketTelegramAlert, sendSupportReplyTelegramAlert } from "@/utils/telegram";
import { sendTicketCreatedEmail, sendAdminReplyEmail, sendTicketResolvedEmail } from "@/lib/email-service";

function generateTicketNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `TKT-${year}${month}${day}-${random}`;
}

/**
 * Calculates smart ticket priority based on category, problem keywords, and order status.
 */
export function calculateTicketPriority(params: {
  category: TicketCategory;
  subject: string;
  message: string;
  order?: any;
}): TicketPriority {
  const { category, subject, message, order } = params;
  const text = `${subject} ${message}`.toLowerCase();

  // High priority categories
  if (
    category === TicketCategory.PAYMENT ||
    category === TicketCategory.REPLACEMENT ||
    category === TicketCategory.REFUND
  ) {
    return TicketPriority.HIGH;
  }

  // Undelivered or failed order priority
  if (order && order.paymentStatus === "VERIFIED" && order.deliveryStatus !== "DELIVERED") {
    return TicketPriority.HIGH;
  }

  // Keyword urgency detection
  if (
    text.includes("urgent") ||
    text.includes("emergency") ||
    text.includes("locked") ||
    text.includes("password wrong") ||
    text.includes("not working") ||
    text.includes("জরুরি") ||
    text.includes("কাজ করছে না")
  ) {
    return TicketPriority.HIGH;
  }

  return TicketPriority.NORMAL;
}

/**
 * Creates a new customer support ticket with order linking and notifications.
 */
export async function createSupportTicket(data: {
  userId: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  orderId?: string;
  orderItemId?: string;
  productId?: string;
  category: TicketCategory;
  subject: string;
  message: string;
  attachmentUrl?: string;
}) {
  let matchedOrder: any = null;

  // 1. Verify Order Ownership if orderId is provided
  if (data.orderId) {
    matchedOrder = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { items: true },
    });

    if (!matchedOrder) {
      throw new Error("Specified order was not found");
    }

    // Enforce ownership: must match userId or customerEmail
    if (matchedOrder.userId !== data.userId && matchedOrder.customerEmail.toLowerCase() !== data.customerEmail.toLowerCase()) {
      throw new Error("Unauthorized: You do not have permission to attach this order to a support ticket");
    }

    // Verify OrderItem ownership if provided
    if (data.orderItemId) {
      const itemExists = matchedOrder.items.some((i: any) => i.id === data.orderItemId);
      if (!itemExists) {
        throw new Error("Unauthorized: Specified order item does not belong to this order");
      }
    }
  }

  // 2. Prevent duplicate open tickets for identical subject & item within 1 hour
  const existingOpen = await prisma.supportTicket.findFirst({
    where: {
      userId: data.userId,
      orderId: data.orderId || undefined,
      orderItemId: data.orderItemId || undefined,
      status: { in: [TicketStatus.OPEN, TicketStatus.WAITING_FOR_ADMIN, TicketStatus.WAITING_FOR_CUSTOMER] },
      subject: data.subject.trim(),
    },
  });

  if (existingOpen) {
    throw new Error(`An open ticket (#${existingOpen.ticketNumber}) already exists for this issue.`);
  }

  // 3. Determine Smart Priority
  const priority = calculateTicketPriority({
    category: data.category,
    subject: data.subject,
    message: data.message,
    order: matchedOrder,
  });

  const ticketNumber = generateTicketNumber();

  // 4. Create SupportTicket and Initial SupportMessage atomically
  const ticket = await prisma.$transaction(async (tx) => {
    const createdTicket = await tx.supportTicket.create({
      data: {
        ticketNumber,
        userId: data.userId,
        customerEmail: data.customerEmail,
        customerName: data.customerName || "Customer",
        customerPhone: data.customerPhone || matchedOrder?.customerPhone || null,
        orderId: data.orderId || null,
        orderItemId: data.orderItemId || null,
        productId: data.productId || null,
        category: data.category,
        priority,
        status: TicketStatus.OPEN,
        subject: data.subject.trim(),
        messages: {
          create: {
            senderId: data.userId,
            senderType: MessageSenderType.CUSTOMER,
            senderName: data.customerName || "Customer",
            message: data.message.trim(),
            attachmentUrl: data.attachmentUrl || null,
            isInternal: false,
          },
        },
      },
      include: {
        messages: true,
        order: { select: { orderNumber: true } },
      },
    });

    // In-app customer notification
    await tx.notification.create({
      data: {
        userId: data.userId,
        title: "🎫 Support Ticket Created",
        message: `Your ticket #${ticketNumber} has been received. Our team will assist you shortly.`,
        type: "SYSTEM",
        link: `/dashboard/support/${createdTicket.id}`,
      },
    });

    return createdTicket;
  });

  // 5. Fire-and-forget Telegram Alert (Sanitized — strictly zero credentials)
  sendSupportTicketTelegramAlert({
    ticketNumber: ticket.ticketNumber,
    customerName: data.customerName || "Customer",
    customerEmail: data.customerEmail,
    category: data.category,
    priority: ticket.priority,
    subject: ticket.subject,
    orderNumber: ticket.order?.orderNumber || undefined,
  }).catch((err) => console.warn("[Support] Telegram alert error:", err));

  // 6. Fire-and-forget Customer Confirmation Email
  sendTicketCreatedEmail(data.customerEmail, {
    customerName: data.customerName || "Customer",
    ticketNumber: ticket.ticketNumber,
    category: data.category,
    subject: ticket.subject,
    orderNumber: ticket.order?.orderNumber || undefined,
  }).catch((err) => console.warn("[Support] Email error:", err));

  return ticket;
}

/**
 * Adds a message to an existing support ticket. Handles customer replies vs admin replies vs internal notes.
 */
export async function addTicketMessage(data: {
  ticketId: string;
  senderId: string;
  senderType: "CUSTOMER" | "ADMIN" | "SYSTEM";
  senderName: string;
  message: string;
  isInternal?: boolean;
  attachmentUrl?: string;
  newStatus?: TicketStatus;
}) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: data.ticketId },
    include: { user: true, order: true },
  });

  if (!ticket) {
    throw new Error("Support ticket not found");
  }

  // Customer cannot create internal notes
  const isInternal = data.senderType === "ADMIN" ? Boolean(data.isInternal) : false;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Create message
    const msg = await tx.supportMessage.create({
      data: {
        ticketId: data.ticketId,
        senderId: data.senderId,
        senderType: data.senderType as MessageSenderType,
        senderName: data.senderName,
        message: data.message.trim(),
        isInternal,
        attachmentUrl: data.attachmentUrl || null,
      },
    });

    // 2. Update ticket status and lastActivityAt
    const updateData: any = {
      lastActivityAt: new Date(),
    };

    if (data.senderType === "CUSTOMER") {
      // Reopen or set waiting for admin
      if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
        updateData.status = TicketStatus.OPEN;
      } else {
        updateData.status = TicketStatus.WAITING_FOR_ADMIN;
      }
    } else if (data.senderType === "ADMIN" && !isInternal) {
      updateData.status = data.newStatus || TicketStatus.WAITING_FOR_CUSTOMER;
      if (data.newStatus === TicketStatus.RESOLVED) {
        updateData.resolvedAt = new Date();
      } else if (data.newStatus === TicketStatus.CLOSED) {
        updateData.closedAt = new Date();
      }
    }

    await tx.supportTicket.update({
      where: { id: data.ticketId },
      data: updateData,
    });

    // 3. In-App Notification (Customer receives notice if Admin replies publicly)
    if (data.senderType === "ADMIN" && !isInternal) {
      await tx.notification.create({
        data: {
          userId: ticket.userId,
          title: "💬 Support Response Received",
          message: `Our support team has replied to your ticket #${ticket.ticketNumber}.`,
          type: "SYSTEM",
          link: `/dashboard/support/${ticket.id}`,
        },
      });
    }

    return msg;
  });

  // 4. Notifications & Alerts
  if (data.senderType === "CUSTOMER") {
    // Alert admin of customer reply
    sendSupportReplyTelegramAlert({
      ticketNumber: ticket.ticketNumber,
      customerName: data.senderName,
      messageSnippet: data.message.slice(0, 150),
      orderNumber: ticket.order?.orderNumber || undefined,
    }).catch((err) => console.warn("[Support] Telegram reply alert error:", err));
  } else if (data.senderType === "ADMIN" && !isInternal) {
    // Notify customer of public admin reply
    sendAdminReplyEmail(ticket.customerEmail, {
      customerName: ticket.customerName || "Customer",
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      adminReplySnippet: data.message.slice(0, 300),
    }).catch((err) => console.warn("[Support] Admin reply email error:", err));
  }

  return result;
}

/**
 * Updates status of a support ticket (e.g. mark RESOLVED or CLOSED).
 */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  adminId?: string,
  adminEmail?: string
) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) throw new Error("Ticket not found");

  const updateData: any = {
    status,
    lastActivityAt: new Date(),
  };

  if (status === TicketStatus.RESOLVED) {
    updateData.resolvedAt = new Date();
  } else if (status === TicketStatus.CLOSED) {
    updateData.closedAt = new Date();
  }

  const updated = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: updateData,
  });

  // In-app notification on resolution
  if (status === TicketStatus.RESOLVED) {
    await prisma.notification.create({
      data: {
        userId: ticket.userId,
        title: "✅ Ticket Resolved",
        message: `Your support ticket #${ticket.ticketNumber} has been marked as resolved.`,
        type: "SYSTEM",
        link: `/dashboard/support/${ticket.id}`,
      },
    }).catch(() => null);

    sendTicketResolvedEmail(ticket.customerEmail, {
      customerName: ticket.customerName || "Customer",
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
    }).catch(() => null);
  }

  return updated;
}

/**
 * Connects a support ticket to an existing Replacement Request.
 */
export async function linkTicketToReplacement(ticketId: string, replacementRequestId: string) {
  return prisma.supportTicket.update({
    where: { id: ticketId },
    data: { replacementRequestId },
  });
}

/**
 * Connects a support ticket to an existing Refund record.
 */
export async function linkTicketToRefund(ticketId: string, refundId: string) {
  return prisma.supportTicket.update({
    where: { id: ticketId },
    data: { refundId },
  });
}
