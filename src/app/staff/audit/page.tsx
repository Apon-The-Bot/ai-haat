import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffAuditor, staffAuditTarget } from "@/lib/staff-access";
import { StaffAccessRequired } from "../access-required";

export const dynamic = "force-dynamic";

const existingAuditActions = [
  "ROLE_PROMOTED", "ROLE_DEMOTED", "USER_SESSION_REVOKED",
  "CREDENTIAL_REVEALED_BY_ADMIN", "ADMIN_STOCK_REVEAL",
];

export default async function StaffAuditPage() {
  const auth = await requireStaffAuditor();
  if (auth instanceof NextResponse) return <StaffAccessRequired path="/staff/audit" />;

  const entries = await prisma.adminAuditLog.findMany({
    where: { OR: [{ targetType: staffAuditTarget }, { action: { in: existingAuditActions } }] },
    select: { id: true, action: true, createdAt: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 50,
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Staff audit</h1>
      <p className="text-sm text-muted-foreground">
        Latest 50 access changes, session revocations and credential access events. Times are in UTC.
      </p>
      {!entries.length && <p>No events recorded.</p>}
      <ul className="divide-y">
        {entries.map((entry) => (
          <li className="flex flex-wrap justify-between gap-3 py-3" key={entry.id}>
            <span>{entry.action.replaceAll("_", " ").toLowerCase()}</span>
            <time dateTime={entry.createdAt.toISOString()}>{entry.createdAt.toISOString()}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}
