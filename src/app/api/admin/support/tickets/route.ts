import { NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { TicketStatus, TicketCategory, TicketPriority, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const mfaAuth = await requireAdminMfa();
    if (mfaAuth instanceof NextResponse) return mfaAuth;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as TicketStatus | null;
    const category = searchParams.get("category") as TicketCategory | null;
    const priority = searchParams.get("priority") as TicketPriority | null;
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: Prisma.SupportTicketWhereInput = {
      ...(status && { status }),
      ...(category && { category }),
      ...(priority && { priority }),
    };

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search } },
        { subject: { contains: search } },
        { customerEmail: { contains: search } },
        { customerName: { contains: search } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { lastActivityAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          order: { select: { id: true, trxId: true, paymentStatus: true, deliveryStatus: true } },
          // A simplified "unread indicator" approximation
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    const ticketsWithUnread = tickets.map((t) => ({
      ...t,
      // For admins, a ticket might be considered "unread" or "action needed" if the last message was from the customer and status is OPEN
      needsAttention: t.status === "OPEN" && t.messages.length > 0 && t.messages[0].senderType === "CUSTOMER",
    }));

    return NextResponse.json({
      tickets: ticketsWithUnread,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/support/tickets error:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}
