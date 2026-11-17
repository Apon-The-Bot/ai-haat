"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Draft = {
  name: string;
  type: string;
  range: string;
  frequency: string;
  recipients: string;
};

const initialDraft: Draft = { name: "", type: "SALES", range: "30D", frequency: "WEEKLY", recipients: "" };

export default function ScheduledReportsPage() {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("aihaat-admin-report-draft");
    if (stored) {
      try { setDraft({ ...initialDraft, ...JSON.parse(stored) }); } catch { /* Ignore an invalid local draft. */ }
    }
  }, []);

  const update = (key: keyof Draft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const saveDraft = () => {
    window.localStorage.setItem("aihaat-admin-report-draft", JSON.stringify(draft));
    setSaved(true);
  };
  const previewUrl = `/api/admin/reports/export?type=${encodeURIComponent(draft.type)}&range=${encodeURIComponent(draft.range)}`;

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/reports" className="text-sm text-slate-500 hover:text-slate-900">← Reports</Link>
          <h1 className="mt-2 text-2xl font-black text-slate-900">Scheduled report draft</h1>
          <p className="mt-1 text-sm text-slate-600">Prepare a recurring CSV report for review. This page saves a local draft only.</p>
        </div>
        <Link href={previewUrl} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">Download preview</Link>
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">Draft name<input value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="Weekly sales report" className="rounded-xl border border-slate-200 px-3 py-2 font-normal" /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">Report<select value={draft.type} onChange={(event) => update("type", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 font-normal"><option value="SALES">Sales</option><option value="PRODUCTS">Products</option><option value="CUSTOMERS">Customers</option><option value="PAYMENTS">Payments</option><option value="COUPONS">Coupons</option><option value="PROFIT">Profit</option><option value="SUPPLIERS">Suppliers</option><option value="PROCUREMENT">Procurement</option></select></label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">Period<select value={draft.range} onChange={(event) => update("range", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 font-normal"><option value="TODAY">Today</option><option value="7D">Last 7 days</option><option value="30D">Last 30 days</option><option value="90D">Last 90 days</option><option value="THIS_MONTH">This month</option><option value="ALL">All time</option></select></label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">Frequency<select value={draft.frequency} onChange={(event) => update("frequency", event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 font-normal"><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option></select></label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">Recipients<input value={draft.recipients} onChange={(event) => update("recipients", event.target.value)} placeholder="finance@example.com" className="rounded-xl border border-slate-200 px-3 py-2 font-normal" /></label>
        </div>
        <div className="flex items-center gap-3"><button type="button" onClick={saveDraft} className="rounded-xl bg-[#FC5C03] px-4 py-2 text-sm font-bold text-white">Save draft</button>{saved && <span className="text-sm text-emerald-600">Draft saved on this device.</span>}</div>
      </section>
      <p className="text-xs text-slate-500">Scheduling and delivery are intentionally not activated by this draft. Review the report and connect it to an approved scheduler when the delivery policy is finalized.</p>
    </main>
  );
}
