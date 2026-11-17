import type { Query } from "./records";
import { ReconciliationView } from "./ReconciliationView";
import { requireFinanceAccess } from "./view";

export const dynamic = "force-dynamic";

export default async function ReconciliationPage({ searchParams }: { searchParams: Promise<Query> }) {
  const denied = await requireFinanceAccess();
  if (denied) return denied;
  return <ReconciliationView path="/admin/reconciliation" query={await searchParams} />;
}
