"use client";

import Link from "next/link";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle, ArrowRight, CheckCircle2, Clock3, LayoutDashboard,
  RefreshCw, Search, ShieldAlert, Users, WalletCards,
} from "lucide-react";

type Counts = {
  fulfillment: number; payments: number; refunds: number; replacements: number;
  support: number; stock: number; suppliers: number;
};

type DashboardData = {
  counts: Counts;
  renewalRisk: { expiring: number; expired: number; failed: number; pending: number };
  demand: { pendingRequests: number; pendingWaitlist: number; highUrgency: number };
  approvals: number;
};

const emptyCounts: Counts = { fulfillment: 0, payments: 0, refunds: 0, replacements: 0, support: 0, stock: 0, suppliers: 0 };

async function readJson(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(url);
  return response.json();
}

export default function AdminCommandCenterPage() {
  const [data, setData] = useState<DashboardData>({
    counts: emptyCounts,
    renewalRisk: { expiring: 0, expired: 0, failed: 0, pending: 0 },
    demand: { pendingRequests: 0, pendingWaitlist: 0, highUrgency: 0 },
    approvals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    const results = await Promise.allSettled([
      readJson("/api/admin/operations"),
      readJson("/api/admin/subscriptions?range=30D"),
      readJson("/api/admin/demand?range=30D"),
      readJson("/api/admin/approvals"),
    ]);
    const [operations, subscriptions, demand, approvals] = results.map((result) =>
      result.status === "fulfilled" ? result.value : null,
    );
    if (results.some((result) => result.status === "rejected")) setError(true);
    setData({
      counts: operations?.counts ?? emptyCounts,
      renewalRisk: {
        expiring: subscriptions?.summary?.expiring ?? subscriptions?.expiringCount ?? 0,
        expired: subscriptions?.summary?.expired ?? subscriptions?.expiredCount ?? 0,
        failed: subscriptions?.summary?.failedRenewal ?? subscriptions?.failedRenewalCount ?? 0,
        pending: subscriptions?.summary?.pendingRenewal ?? subscriptions?.pendingRenewalCount ?? 0,
      },
      demand: {
        pendingRequests: demand?.summary?.pendingRequests ?? demand?.pendingRequestCount ?? 0,
        pendingWaitlist: demand?.summary?.pendingWaitlist ?? demand?.pendingWaitlistCount ?? 0,
        highUrgency: demand?.summary?.highUrgency ?? demand?.highUrgencyCount ?? 0,
      },
      approvals: Array.isArray(approvals?.requests)
        ? approvals.requests.filter((request: { status?: string }) => request.status === "PENDING").length
        : approvals?.pendingCount ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const queueTotal = Object.values(data.counts).reduce((total, count) => total + count, 0);
  const attention = [
    { label: "Paid orders awaiting delivery", value: data.counts.fulfillment, href: "/admin/operations?queue=fulfillment", icon: Clock3, tone: "amber" },
    { label: "Payment verification", value: data.counts.payments, href: "/admin/operations?queue=payments", icon: WalletCards, tone: "blue" },
    { label: "Support awaiting reply", value: data.counts.support, href: "/admin/operations?queue=support", icon: Users, tone: "violet" },
    { label: "Refunds and replacements", value: data.counts.refunds + data.counts.replacements, href: "/admin/operations?queue=refunds", icon: ShieldAlert, tone: "rose" },
  ];

  return (
    <main className="min-h-full space-y-6 pb-16">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#FFF2E8] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FC5C03]"><LayoutDashboard className="h-3.5 w-3.5" /> Command Center</div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Admin Command Center</h1>
          <p className="mt-1 text-sm text-slate-500">A single read-only view of work that needs attention across the business.</p>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60">
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Refresh
        </button>
      </header>

      {error && <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"><AlertTriangle className="h-4 w-4" /> Some panels could not load. Refresh after checking the relevant page.</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {attention.map(({ label, value, href, icon: Icon, tone }) => (
          <Link key={label} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#FC5C03]/40 hover:shadow-md">
            <div className="flex items-start justify-between"><span className="text-sm font-bold text-slate-600">{label}</span><Icon className={`h-5 w-5 text-${tone}-600`} /></div>
            <div className="mt-3 text-3xl font-black text-slate-900">{loading ? "—" : value}</div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#FC5C03]">Open queue <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Panel title="Operational health" icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}>
          <Metric label="Total open work" value={queueTotal} href="/admin/operations" />
          <Metric label="Stock alerts" value={data.counts.stock} href="/admin/operations?queue=stock" />
          <Metric label="Supplier sync alerts" value={data.counts.suppliers} href="/admin/operations?queue=suppliers" />
        </Panel>
        <Panel title="Renewal risk" icon={<Clock3 className="h-5 w-5 text-amber-600" />}>
          <Metric label="Expiring in 30 days" value={data.renewalRisk.expiring} href="/admin/subscriptions?range=30D" />
          <Metric label="Expired entitlements" value={data.renewalRisk.expired} href="/admin/subscriptions?status=expired" />
          <Metric label="Failed or pending renewal" value={data.renewalRisk.failed + data.renewalRisk.pending} href="/admin/subscriptions?status=renewal-risk" />
        </Panel>
        <Panel title="Commercial signals" icon={<Search className="h-5 w-5 text-blue-600" />}>
          <Metric label="Pending product requests" value={data.demand.pendingRequests} href="/admin/demand" />
          <Metric label="Customers on waitlist" value={data.demand.pendingWaitlist} href="/admin/demand" />
          <Metric label="High urgency demand" value={data.demand.highUrgency} href="/admin/demand" />
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="Controls requiring review" icon={<ShieldAlert className="h-5 w-5 text-rose-600" />}>
          <Metric label="Pending approvals" value={data.approvals} href="/admin/approvals" />
          <Metric label="Replacements under review" value={data.counts.replacements} href="/admin/replacements" />
          <Metric label="Refunds under review" value={data.counts.refunds} href="/admin/refunds" />
        </Panel>
        <Panel title="Quick access" icon={<ArrowRight className="h-5 w-5 text-[#FC5C03]" />}>
          <Metric label="Search customers, orders and products" value="Open" href="/admin/search" />
          <Metric label="Review financial reconciliation" value="Open" href="/admin/reconciliation" />
          <Metric label="Review product launch readiness" value="Open" href="/admin/products/launch" />
        </Panel>
      </section>
    </main>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><span>{icon}</span><h2 className="font-black text-slate-900">{title}</h2></div><div className="divide-y divide-slate-100">{children}</div></section>;
}

function Metric({ label, value, href }: { label: string; value: number | string; href: string }) {
  return <Link href={href} className="flex items-center justify-between gap-4 py-3 text-sm hover:text-[#FC5C03]"><span className="text-slate-600">{label}</span><span className="inline-flex items-center gap-2 font-black text-slate-900">{value}<ArrowRight className="h-3.5 w-3.5 text-slate-400" /></span></Link>;
}
