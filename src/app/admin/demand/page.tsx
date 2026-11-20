"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Search, Users, Package, ClipboardList, AlertTriangle } from "@/components/animated-icons/lucide";
import { type LucideIcon } from "lucide-react";

type Report = {
  summary: { productRequests: number; pendingProductRequests: number; pendingWaitlist: number; distinctWaitlistProducts: number; urgentRequests: number };
  productRequests: Array<{ id: string; productName: string; category: string; status: string; urgency: string; targetBudget: string | null; contact: string; createdAt: string }>;
  requestByStatus: Record<string, number>;
  requestByCategory: Array<{ category: string; count: number }>;
  productDemand: Array<{ productId: string; productName: string; slug: string; pendingWaitlist: number; notifiedWaitlist: number; productRequestCount: number; variations: Array<{ variation: string; count: number }>; inStock: boolean; latestDemandAt: string }>;
};

const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const summaryCards: Array<[string, keyof Report["summary"], LucideIcon]> = [
  ["Product requests", "productRequests", ClipboardList],
  ["Pending requests", "pendingProductRequests", Users],
  ["Pending waitlist", "pendingWaitlist", Package],
  ["Demanded products", "distinctWaitlistProducts", Package],
  ["High urgency", "urgentRequests", AlertTriangle],
];

export default function DemandReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [range, setRange] = useState("90D");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/demand?range=${range}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Report could not be loaded");
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Report could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { void load(); }, [load]);

  const requests = useMemo(() => (report?.productRequests || []).filter((request) => {
    const matchesStatus = status === "ALL" || request.status === status;
    const text = `${request.productName} ${request.category} ${request.contact}`.toLowerCase();
    return matchesStatus && text.includes(query.toLowerCase());
  }), [query, report, status]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="text-sm font-semibold text-orange-600">Demand intelligence</p><h1 className="text-3xl font-black text-slate-900">Demand & Waitlist</h1><p className="mt-1 text-sm text-slate-600">Product requests and stock demand in one read-only report.</p></div>
        <div className="flex items-center gap-2"><select value={range} onChange={(event) => setRange(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="30D">Last 30 days</option><option value="90D">Last 90 days</option><option value="365D">Last year</option></select><button onClick={() => void load()} className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700" aria-label="Refresh report"><RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /></button></div>
      </div>
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summaryCards.map(([label, field, Icon]) => <div className={cardClass} key={field}><Icon className="h-5 w-5 text-orange-600" /><p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{report?.summary[field] || 0}</p></div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className={cardClass}><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-black text-slate-900">Product demand by item</h2><p className="text-xs text-slate-500">Waitlist subscribers plus custom product requests.</p></div><Link href="/admin/inventory" className="text-xs font-bold text-orange-600">Open inventory</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="px-2 py-3">Product</th><th className="px-2 py-3">Pending waitlist</th><th className="px-2 py-3">Requests</th><th className="px-2 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{report?.productDemand.map((item) => <tr key={item.productId}><td className="px-2 py-3"><p className="font-bold text-slate-900">{item.productName}</p><p className="text-xs text-slate-500">{item.variations.slice(0, 3).map((v) => `${v.variation} (${v.count})`).join(" · ")}</p></td><td className="px-2 py-3 font-bold text-amber-700">{item.pendingWaitlist}</td><td className="px-2 py-3 font-bold text-slate-700">{item.productRequestCount}</td><td className="px-2 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${item.inStock ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{item.inStock ? "In stock" : "Out of stock"}</span></td></tr>)}{!loading && !report?.productDemand.length && <tr><td colSpan={4} className="px-2 py-8 text-center text-sm text-slate-500">No waitlist demand found.</td></tr>}</tbody></table></div></section>
        <section className={cardClass}><h2 className="text-lg font-black text-slate-900">Request breakdown</h2><div className="mt-4 space-y-3">{Object.entries(report?.requestByStatus || {}).map(([key, value]) => <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2" key={key}><span className="text-sm font-semibold text-slate-600">{key.replace("_", " ")}</span><span className="font-black text-slate-900">{value}</span></div>)}</div><div className="mt-5 border-t border-slate-100 pt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Top categories</p>{report?.requestByCategory.slice(0, 5).map((item) => <div className="flex justify-between py-1 text-sm" key={item.category}><span>{item.category}</span><strong>{item.count}</strong></div>)}</div></section>
      </div>
      <section className={cardClass}><div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-lg font-black text-slate-900">Custom product requests</h2><p className="text-xs text-slate-500">Read-only customer demand queue for sourcing decisions.</p></div><div className="flex gap-2"><div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product or contact" className="rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-sm" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="ALL">All statuses</option>{Object.keys(report?.requestByStatus || {}).map((item) => <option key={item} value={item}>{item}</option>)}</select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="px-2 py-3">Requested product</th><th className="px-2 py-3">Category</th><th className="px-2 py-3">Urgency</th><th className="px-2 py-3">Budget</th><th className="px-2 py-3">Status</th><th className="px-2 py-3">Received</th></tr></thead><tbody className="divide-y divide-slate-100">{requests.map((request) => <tr key={request.id}><td className="px-2 py-3 font-bold text-slate-900">{request.productName}</td><td className="px-2 py-3 text-slate-600">{request.category}</td><td className="px-2 py-3"><span className={request.urgency === "URGENT" || request.urgency === "HIGH" ? "font-bold text-rose-600" : "text-slate-600"}>{request.urgency}</span></td><td className="px-2 py-3 text-slate-600">{request.targetBudget || "—"}</td><td className="px-2 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{request.status}</span></td><td className="px-2 py-3 text-slate-500">{new Date(request.createdAt).toLocaleDateString("en-GB")}</td></tr>)}{!loading && !requests.length && <tr><td colSpan={6} className="px-2 py-8 text-center text-sm text-slate-500">No matching product requests.</td></tr>}</tbody></table></div></section>
    </div>
  );
}
