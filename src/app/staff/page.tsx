import Link from "next/link";
import { NextResponse } from "next/server";
import { requireStaffAccess } from "@/lib/staff-access";
import type { StaffRole } from "@/lib/staff-roles";
import { StaffAccessRequired } from "./access-required";

const destinations: Record<StaffRole, { href: string; label: string }> = {
  AUDITOR: { href: "/staff/audit", label: "Audit events" },
  SUPPORT: { href: "/staff/support", label: "Support tickets" },
  FULFILLMENT: { href: "/staff/fulfillment", label: "Paid orders awaiting delivery" },
  FINANCE: { href: "/staff/finance", label: "Financial reconciliation" },
};

export default async function StaffPage() {
  const auth = await requireStaffAccess();
  if (auth instanceof NextResponse) return <StaffAccessRequired path="/staff" />;
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Your tools</h1>
      <ul className="space-y-3">
        {auth.roles.map((role) => (
          <li key={role}><Link className="underline" href={destinations[role].href}>{destinations[role].label}</Link></li>
        ))}
      </ul>
    </section>
  );
}
