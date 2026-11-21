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
  const required = ["USERNAME", "PASSWORD", "HASH_KEY", "STORE_ID", "MERCHANT_ID", "CHECKOUT_ORIGIN"];
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
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">EPS Payments</h1>
      <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-3">
        <div><dt>New gateway payments</dt><dd className="font-medium">{enabled ? "EPS" : "PipraPay"}</dd></div>
        <div><dt>EPS environment</dt><dd className="font-medium">{prefix ? mode : "Unconfigured"}</dd></div>
        <div><dt>Required settings</dt><dd className="font-medium">{prefix && missing.length === 0 ? "Present" : "Incomplete"}</dd></div>
      </dl>
      {missing.length > 0 && <p className="break-words text-sm">Missing settings: {missing.join(", ")}</p>}
      {prefix && <EpsTestButton />}
      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1">Payment reference
          <input name="q" defaultValue={query} maxLength={191} className="rounded border bg-transparent p-2" />
        </label>
        <label className="grid gap-1">Status
          <select name="state" defaultValue={state ?? ""} className="rounded border bg-transparent p-2">
            <option value="">All</option>
            {states.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <label className="grid gap-1">Environment
          <select name="mode" defaultValue={filterMode ?? ""} className="rounded border bg-transparent p-2">
            <option value="">All</option>
            {modes.map((value) => <option key={value}>{value}</option>)}
          </select>
        </label>
        <button type="submit" className="rounded border px-3 py-2">Filter attempts</button>
      </form>
      <p>Latest 50 matching payment attempts</p>
      {attempts === null ? <p role="alert">EPS payment history is unavailable. Check the database connection and migration status.</p> :
        attempts.length === 0 ? <p>No matching EPS payment attempts.</p> : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                {["Merchant transaction", "EPS references", "Order or wallet reference", "Purpose", "BDT", "Environment", "Status", "Action"].map(
                  (label) => <th key={label} scope="col" className="p-3">{label}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.merchantTransactionId} className="border-t">
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
