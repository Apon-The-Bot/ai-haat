import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { ReconcileButton } from "./reconcile-button";
import { EpsTestButton } from "./test-button";

export const dynamic = "force-dynamic";

const states = ["INITIALIZING", "PENDING", "FINALIZED", "REVIEW_REQUIRED"];
const modes = ["sandbox", "live"];

export default async function EpsPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) redirect("/admin");

  const enabled = process.env.EPS_PAYMENT_ENABLED === "true";
  const mode = process.env.EPS_MODE;
  const prefix = mode === "live" ? "EPS_LIVE" : mode === "sandbox" ? "EPS_SANDBOX" : null;
  const required = ["USERNAME", "PASSWORD", "HASH_KEY", "STORE_ID", "MERCHANT_ID"];
  const missing = prefix ? required.map((key) => `${prefix}_${key}`).filter((key) => !process.env[key]?.trim()) : [];
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 191) : "";
  const state = typeof params.state === "string" && states.includes(params.state) ? params.state : undefined;
  const filterMode = typeof params.mode === "string" && modes.includes(params.mode) ? params.mode : undefined;

  const attempts = await prisma.epsPaymentAttempt.findMany({
    where: {
      state,
      mode: filterMode,
      OR: query ? [{ merchantTransactionId: query }, { reference: query }, { providerTransactionId: query },
        { settlementTransactionId: query }] : undefined,
    },
    take: 50,
    orderBy: [{ createdAt: "desc" }, { merchantTransactionId: "desc" }],
    select: {
      merchantTransactionId: true,
      providerTransactionId: true,
      settlementTransactionId: true,
      reference: true,
      amountBDT: true,
      mode: true,
      purpose: true,
      state: true,
      initializationCode: true,
    },
  }).catch(() => null);

  return (
    <section className="dashboard-page space-y-6">
      <header className="dashboard-page-header">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Payments & operations</p>
          <h1 className="dashboard-page-title">EPS Payments</h1>
          <p className="dashboard-page-description">Monitor hosted checkout attempts, gateway references, and reconciliation status.</p>
        </div>
        {prefix && <EpsTestButton />}
      </header>
      <dl className="grid gap-3 sm:grid-cols-3">
        {[['New gateway payments', enabled ? 'EPS' : 'Unavailable'], ['EPS environment', prefix ? mode : 'Unconfigured'], ['Required settings', prefix && missing.length === 0 ? 'Present' : 'Incomplete']].map(([label, value]) => <div key={label} className="dashboard-surface p-4"><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 text-lg font-black text-slate-900">{value}</dd></div>)}
      </dl>
      {missing.length > 0 && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Missing settings: {missing.join(", ")}</p>}
      <form method="get" className="dashboard-toolbar">
        <label className="grid gap-1">Payment reference
          <input name="q" defaultValue={query} maxLength={191} className="rounded-xl border border-slate-200 bg-white p-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
        </label>
        <label className="grid gap-1">Status
          <select name="state" defaultValue={state ?? ""} className="rounded-xl border border-slate-200 bg-white p-2 text-sm outline-none focus:border-orange-400">
            <option value="">All</option>
            {states.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="grid gap-1">Environment
          <select name="mode" defaultValue={filterMode ?? ""} className="rounded-xl border border-slate-200 bg-white p-2 text-sm outline-none focus:border-orange-400">
            <option value="">All</option>
            {modes.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <button type="submit" className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white transition hover:bg-orange-600">Filter attempts</button>
      </form>
      <p className="text-sm font-bold text-slate-700">Latest 50 matching payment attempts</p>
      {attempts === null ? <p className="dashboard-surface p-5 text-sm text-rose-700" role="alert">EPS payment history is unavailable. Check the database connection and migration status.</p> :
        attempts.length === 0 ? <p className="dashboard-surface p-5 text-sm text-slate-600">No matching EPS payment attempts.</p> : (
        <div className="dashboard-table-wrap">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Merchant transaction", "EPS references", "Order or wallet reference", "Purpose", "BDT", "Environment", "Status", "Action"].map(
                  (label) => <th key={label} scope="col" className="p-3">{label}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.merchantTransactionId} className="border-t border-slate-100 align-top hover:bg-orange-50/30">
                  <td className="p-3 font-mono">{attempt.merchantTransactionId}</td>
                  <td className="p-3">
                    <dl className="space-y-1 whitespace-nowrap text-xs">
                      <div><dt>Checkout</dt><dd className="font-mono">{attempt.providerTransactionId ?? "—"}</dd></div>
                      <div><dt>Settlement</dt><dd className="font-mono">{attempt.settlementTransactionId ?? "—"}</dd></div>
                    </dl>
                  </td>
                  <td className="p-3">{attempt.reference}</td>
                  <td className="p-3">{attempt.purpose}</td>
                  <td className="p-3 tabular-nums">{attempt.amountBDT.toFixed(2)}</td>
                  <td className="p-3">{attempt.mode}</td>
                  <td className="p-3">
                    {attempt.state}
                    {attempt.state === "INITIALIZING" && attempt.initializationCode && (
                      <p className="text-xs">Initialization code {attempt.initializationCode}</p>
                    )}
                  </td>
                  <td className="p-3">
                    {attempt.mode === mode && ["INITIALIZING", "PENDING"].includes(attempt.state) && (
                      <ReconcileButton id={attempt.merchantTransactionId} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
