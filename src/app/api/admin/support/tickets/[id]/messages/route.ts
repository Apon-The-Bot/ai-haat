import { NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { addTicketMessage } from "@/lib/commerce/support";
import { MessageSenderType, TicketStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const mfaAuth = await requireAdminMfa();
    if (mfaAuth instanceof NextResponse) return mfaAuth;
    const { user: admin } = mfaAuth;

    const { message, isInternal, attachmentUrl, newStatus } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const newMsg = await addTicketMessage({
      ticketId: params.id,
      senderId: admin.id,
      senderType: MessageSenderType.ADMIN,
      senderName: admin.name || "Admin",
      message,
      isInternal: Boolean(isInternal),
      attachmentUrl,
      newStatus: newStatus as TicketStatus | undefined,
    });

    return NextResponse.json(newMsg, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/support/tickets/[id]/messages error:", error);
    return NextResponse.json({ error: "Failed to add message" }, { status: 500 });
  }
}
