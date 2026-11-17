import { NextResponse } from "next/server";
import { requireStaffAccess } from "@/lib/staff-access";
import { ReconciliationView } from "@/app/admin/reconciliation/ReconciliationView";
import type { Query } from "@/app/admin/reconciliation/records";
import { StaffAccessRequired } from "../access-required";

export default async function StaffFinancePage({ searchParams }: { searchParams: Promise<Query> }) {
  const auth = await requireStaffAccess("FINANCE");
  if (auth instanceof NextResponse) return <StaffAccessRequired path="/staff/finance" />;
  return <ReconciliationView path="/staff/finance" query={await searchParams} />;
}
