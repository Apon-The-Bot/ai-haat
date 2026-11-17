import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeamAdmin, staffRequestPrefix } from "@/lib/staff-access";
import { staffGrantKey, staffRoles, type StaffRole } from "@/lib/staff-roles";
import Link from "next/link";
import { StaffAccessForm } from "./StaffAccessForm";

type RequestSummary = {
  id: string;
  targetId: string;
  requesterId: string;
  change: "grant" | "revoke";
  reason: string;
  role?: StaffRole;
  expiresAt: number;
};

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const auth = await requireTeamAdmin();
  if (auth instanceof NextResponse) return <p>Administrator access and verified MFA are required.</p>;
  const prefixes = staffRoles.map((role) => ({ role, prefix: staffGrantKey("", role) }));
  const [pending, grants] = await Promise.all([
    prisma.siteSetting.findMany({
      where: { key: { startsWith: staffRequestPrefix } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.siteSetting.findMany({
      where: { OR: prefixes.map(({ role, prefix }) => ({
        key: { startsWith: prefix }, value: { startsWith: `${role}:` },
      })) },
      select: { key: true },
    }),
  ]);
  const requests = pending.map((row) => JSON.parse(row.value) as RequestSummary);
  const assignments = prefixes.flatMap(({ role, prefix }) => grants
    .filter((grant) => grant.key.startsWith(prefix))
    .map((grant) => ({ role, id: grant.key.slice(prefix.length) })));
  const ids = Array.from(new Set([...assignments.map(({ id }) => id), ...requests.flatMap((row) => [row.targetId, row.requesterId])]));
  const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, email: true } });
  const emails = new Map(users.map((user) => [user.id, user.email]));
  const now = Date.now();

  return (
    <div className="space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Team access</h1>
        <p className="text-sm text-muted-foreground">
          Staff use <Link className="underline" href="/staff">the staff workspace</Link> with verified MFA.
          A different administrator must review each request.
        </p>
      </header>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Request staff access change</h2>
        <p className="text-sm">Use an existing customer account and keep credentials out of reasons.</p>
        <StaffAccessForm />
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Current assignments</h2>
        {assignments.length ? (
          <ul className="list-disc pl-5">{assignments.map(({ id, role }) =>
            <li key={`${id}:${role}`}>{emails.get(id) ?? id} · {role}</li>)}</ul>
        ) : <p>No staff assignments.</p>}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Requests awaiting review</h2>
        {!requests.length && <p>No requests awaiting review.</p>}
        {requests.map((row) => (
          <article key={row.id} className="space-y-2 rounded-lg border p-4">
            <h3 className="font-medium">
              {row.change === "grant" ? "Grant" : "Revoke"} {row.role ?? "AUDITOR"} access · {emails.get(row.targetId) ?? row.targetId}
            </h3>
            <p className="text-sm">Requested by {emails.get(row.requesterId) ?? row.requesterId}</p>
            <p className="break-words">{row.reason}</p>
            {row.expiresAt <= now && <p className="text-sm">Approval expired.</p>}
            {row.requesterId === auth.user.id
              ? <p className="text-sm">Waiting for another administrator.</p>
              : <StaffAccessForm requestId={row.id} expired={row.expiresAt <= now} />}
          </article>
        ))}
      </section>
    </div>
  );
}
