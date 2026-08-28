import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: "asc" },
        },
        order: {
          select: {
            id: true,
            trxId: true,
            paymentStatus: true,
            deliveryStatus: true,
          }
        },
        orderItem: true,
        product: {
          select: {
            id: true,
            name: true,
            category: true,
          }
        }
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("GET /api/support/tickets/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}
