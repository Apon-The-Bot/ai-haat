import Link from "next/link";
import { NextResponse } from "next/server";
import { requireStaffAccess } from "@/lib/staff-access";
import { prisma } from "@/lib/prisma";
import { StaffAccessRequired } from "../access-required";
import { Pagination } from "@/app/admin/reconciliation/view";
import { pageNumber, pageSize, type Query } from "@/app/admin/reconciliation/records";

export default async function StaffSupportPage({ searchParams }: { searchParams: Promise<Query> }) {
  const auth = await requireStaffAccess("SUPPORT");
  if (auth instanceof NextResponse) return <StaffAccessRequired path="/staff/support" />;
  const page = pageNumber(await searchParams);
  const tickets = await prisma.supportTicket.findMany({
    where: { status: { in: ["OPEN", "WAITING_FOR_ADMIN", "WAITING_FOR_CUSTOMER"] } },
    select: { id: true, ticketNumber: true, subject: true, status: true, priority: true },
    orderBy: [{ lastActivityAt: "asc" }, { id: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize + 1,
  });
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Active support tickets</h1>
      {!tickets.length && <p>No tickets on this page.</p>}
      <ul className="divide-y">
        {tickets.slice(0, pageSize).map((ticket) => (
          <li className="py-3" key={ticket.id}>
            <Link className="underline" href={`/staff/support/${encodeURIComponent(ticket.id)}`}>
              {ticket.ticketNumber} · {ticket.subject}
            </Link>
            <p className="text-sm">{ticket.priority} · {ticket.status.replaceAll("_", " ")}</p>
          </li>
        ))}
      </ul>
      <Pagination path="/staff/support" page={page} query={{}} more={tickets.length > pageSize} />
    </section>
  );
}
