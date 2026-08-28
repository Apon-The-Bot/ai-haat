import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { addTicketMessage } from "@/lib/commerce/support";
import { MessageSenderType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      select: { userId: true, status: true }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { message, attachmentUrl } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const newMsg = await addTicketMessage({
      ticketId: params.id,
      senderId: user.id,
      senderType: MessageSenderType.CUSTOMER,
      senderName: user.name || "Customer",
      message,
      isInternal: false,
      attachmentUrl,
      // Reopen ticket if it was closed or resolved
      newStatus: ticket.status === "CLOSED" || ticket.status === "RESOLVED" ? "OPEN" : undefined,
    });

    return NextResponse.json(newMsg, { status: 201 });
  } catch (error) {
    console.error("POST /api/support/tickets/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to add message" }, { status: 500 });
  }
}
