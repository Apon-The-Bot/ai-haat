import { NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const mfaAuth = await requireAdminMfa();
    if (mfaAuth instanceof NextResponse) return mfaAuth;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        order: {
          include: {
            items: true,
            timelineEvents: { orderBy: { createdAt: "desc" } }
          }
        },
        orderItem: {
          include: {
            deliveredKeys: true
          }
        },
        product: true,
        replacementRequest: true,
        refund: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("GET /api/admin/support/tickets/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const mfaAuth = await requireAdminMfa();
    if (mfaAuth instanceof NextResponse) return mfaAuth;
    const { user: admin } = mfaAuth;

    const body = await req.json();
    const { status, priority, assignedAdminId, replacementRequestId, refundId } = body;

    const existingTicket = await prisma.supportTicket.findUnique({
      where: { id: params.id }
    });

    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const updateData: any = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedAdminId !== undefined && { assignedAdminId }),
      ...(replacementRequestId !== undefined && { replacementRequestId }),
      ...(refundId !== undefined && { refundId }),
    };

    if (status === "RESOLVED" && existingTicket.status !== "RESOLVED") {
      updateData.resolvedAt = new Date();
    } else if (status === "CLOSED" && existingTicket.status !== "CLOSED") {
      updateData.closedAt = new Date();
    }

    const ticket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: updateData,
    });

    await logAdminAudit({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "SUPPORT_TICKET_UPDATE",
      targetType: "TICKET",
      targetId: ticket.id,
      details: `Updated ticket fields: ${JSON.stringify(updateData)}`,
      ipAddress: req.headers.get("x-forwarded-for") || "unknown"
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("PATCH /api/admin/support/tickets/[id] error:", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
