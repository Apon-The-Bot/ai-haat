import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { createSupportTicket } from "@/lib/commerce/support";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { TicketCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
      orderBy: { lastActivityAt: "desc" },
      include: {
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("GET /api/support/tickets error:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    // Rate limit: max 10 tickets per hour per user
    const rateLimit = checkRateLimit(`ticket_create_${user.id}`, 10, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfterMs);
    }

    const body = await req.json();
    const { orderId, orderItemId, productId, category, subject, message, attachmentUrl } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const ticket = await createSupportTicket({
      userId: user.id,
      customerEmail: user.email,
      customerName: user.name || "Customer",
      customerPhone: (user as any).phone || undefined,
      orderId,
      orderItemId,
      productId,
      category: category as TicketCategory || "OTHER",
      subject,
      message,
      attachmentUrl,
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("POST /api/support/tickets error:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
