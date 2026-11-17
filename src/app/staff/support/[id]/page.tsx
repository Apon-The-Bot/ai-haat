import Link from "next/link";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaffAccess } from "@/lib/staff-access";
import { addTicketMessage } from "@/lib/commerce/support";
import { StaffAccessRequired } from "../../access-required";
import { StaffActionForm } from "../../action-form";

async function reply(ticketId: string, data: FormData) {
  "use server";
  const auth = await requireStaffAccess("SUPPORT");
  if (auth instanceof NextResponse) return { message: "Support permission and verified MFA are required." };
  const message = data.get("message");
  if (typeof message !== "string" || !message.trim() || message.length > 4000) {
    return { message: "Enter a reply of up to 4,000 characters." };
  }
  try {
    await addTicketMessage({
      ticketId,
      senderId: auth.user.id,
      senderType: "ADMIN",
      senderName: auth.user.name || "Support",
      message,
    });
  } catch {
    return { message: "Could not send the reply. Check the latest messages before retrying." };
  }
  revalidatePath(`/staff/support/${ticketId}`);
  revalidatePath("/staff/support");
  return { message: "Reply sent.", success: true };
}

export default async function StaffTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireStaffAccess("SUPPORT");
  if (auth instanceof NextResponse) return <StaffAccessRequired path={`/staff/support/${encodeURIComponent(id)}`} />;
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    select: {
      ticketNumber: true, subject: true, status: true,
      order: { select: { orderNumber: true, paymentStatus: true, deliveryStatus: true } },
      messages: {
        where: { isInternal: false },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 100,
        select: { id: true, senderName: true, message: true, createdAt: true },
      },
    },
  });
  if (!ticket) notFound();

  return (
    <section className="space-y-4">
      <Link className="underline" href="/staff/support">Active support tickets</Link>
      <h1 className="text-2xl font-semibold">{ticket.ticketNumber} · {ticket.subject}</h1>
      <p>{ticket.status.replaceAll("_", " ")}</p>
      {ticket.order && (
        <p>Order {ticket.order.orderNumber} · Payment {ticket.order.paymentStatus} · Delivery {ticket.order.deliveryStatus}</p>
      )}
      <h2 className="font-semibold">Recent customer-visible messages</h2>
      <ul className="divide-y">
        {ticket.messages.reverse().map((message) => (
          <li key={message.id} className="space-y-1 py-3">
            <p className="text-sm">{message.senderName} · {message.createdAt.toISOString()}</p>
            <p className="whitespace-pre-wrap break-words">{message.message}</p>
          </li>
        ))}
      </ul>
      <StaffActionForm action={reply.bind(null, id)} label="Send reply">
        <label className="grid gap-1">
          Reply to customer
          <textarea name="message" required maxLength={4000} rows={4} className="rounded border bg-transparent p-2" />
        </label>
      </StaffActionForm>
    </section>
  );
}
