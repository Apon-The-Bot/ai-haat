"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Bell, Clock3, RefreshCw, RotateCcw } from "lucide-react";

type DeskData = {
  summary: { expiring: number; expired: number; failedRenewals: number; pendingRenewals: number; reminderEvents: number };
  expiring: Array<{ id: string; productName: string; accountType: string; warrantyExpiresAt: string | null; orderId: string; order: { orderNumber: string; customerName: string; customerEmail: string }; orderItem: { variationName: string } | null; reminder: { stage: string; createdAt: string } | null }>;
  renewalFailures: Array<{ id: string; orderNumber: string; customerName: string; customerEmail: string; totalBDT: number; paymentMethod: string; paymentStatus: string; createdAt: string; renewedFromOrderId: string | null }>;
};

const cards: Array<{ Icon: typeof Clock3; label: string; key: keyof DeskData["summary"] }> = [
  { Icon: Clock3, label: "Expiring", key: "expiring" },
  { Icon: AlertTriangle, label: "Expired", key: "expired" },
  { Icon: RotateCcw, label: "Failed renewals", key: "failedRenewals" },
  { Icon: RotateCcw, label: "Pending renewals", key: "pendingRenewals" },
  { Icon: Bell, label: "Sent reminders", key: "reminderEvents" },
] as const;

const date = (value: string | null) => value ? new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

export default function SubscriptionDeskPage() {
  const [window, setWindow] = useState("30");
  const [data, setData] = useState<DeskData | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { const response = await fetch(`/api/admin/subscriptions?window=${window}`); if (response.ok) setData(await response.json()); } finally { setLoading(false); } }, [window]);
  useEffect(() => { load(); }, [load]);
  const summary = data?.summary;

  return <div className="space-y-6 pb-14">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-5">
      <div><p className="text-xs font-bold uppercase tracking-widest text-[#FC5C03]">Customer retention</p><h1 className="text-3xl font-black text-slate-900">Subscription Desk</h1><p className="mt-1 text-sm text-slate-600">Monitor expiring entitlements, renewal risk, and reminder delivery.</p></div>
      <div className="flex gap-2"><select value={window} onChange={(event) => setWindow(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"><option value="7">Next 7 days</option><option value="30">Next 30 days</option><option value="all">All upcoming</option><option value="expired">Expired</option></select><button onClick={load} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600" aria-label="Refresh"><RefreshCw className={loading ? "animate-spin" : ""} size={18} /></button></div>
    </header>
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">{cards.map(({ Icon, label, key }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><Icon size={18} className="text-[#FC5C03]" /><p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="text-2xl font-black text-slate-900">{summary?.[key] ?? "—"}</p></div>)}</section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-black text-slate-900">Expiring entitlements</h2><p className="text-xs text-slate-500">Delivered subscriptions and licenses within the selected window.</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Product</th><th className="px-5 py-3">Expires</th><th className="px-5 py-3">Reminder</th><th className="px-5 py-3">Order</th></tr></thead><tbody className="divide-y divide-slate-100">{data?.expiring.map((item) => <tr key={item.id}><td className="px-5 py-3"><p className="font-semibold text-slate-900">{item.order.customerName}</p><p className="text-xs text-slate-500">{item.order.customerEmail}</p></td><td className="px-5 py-3"><p className="font-semibold">{item.productName}</p><p className="text-xs text-slate-500">{item.orderItem?.variationName || item.accountType}</p></td><td className="px-5 py-3">{date(item.warrantyExpiresAt)}</td><td className="px-5 py-3">{item.reminder ? <span className="text-emerald-700">Sent {item.reminder.stage}</span> : <span className="text-amber-700">Not recorded</span>}</td><td className="px-5 py-3"><Link className="font-mono text-[#FC5C03] hover:underline" href={`/admin/orders?orderId=${encodeURIComponent(item.order.orderNumber)}`}>{item.order.orderNumber}</Link></td></tr>)}{!loading && !data?.expiring.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No matching entitlements.</td></tr>}</tbody></table></div></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-black text-slate-900">Renewal risk</h2><p className="text-xs text-slate-500">Failed and pending renewal orders requiring follow-up.</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{data?.renewalFailures.map((order) => <tr key={order.id}><td className="px-5 py-3"><Link className="font-mono text-[#FC5C03] hover:underline" href={`/admin/orders?orderId=${encodeURIComponent(order.orderNumber)}`}>{order.orderNumber}</Link></td><td className="px-5 py-3">{order.customerName}<p className="text-xs text-slate-500">{order.customerEmail}</p></td><td className="px-5 py-3 font-semibold">৳{order.totalBDT.toFixed(2)}</td><td className="px-5 py-3"><span className={order.paymentStatus === "FAILED" ? "text-rose-700" : "text-amber-700"}>{order.paymentStatus}</span></td><td className="px-5 py-3">{date(order.createdAt)}</td></tr>)}{!loading && !data?.renewalFailures.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No failed or pending renewals.</td></tr>}</tbody></table></div></section>
  </div>;
}
