"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, RefreshCw, Star } from "lucide-react";

type SupplierScorecard = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  score: number | null;
  qualityScore: number;
  reliabilityScore: number;
  invalidRatePct: number;
  replacementRatePct: number;
  replacementRequests: number;
  completedReplacements: number;
  totalUnitsPurchased: number;
  totalProcurementSpendBDT: number;
  avgAcquisitionCostBDT: number | null;
  syncSuccessRate: number | null;
  recentSyncs: Array<{ id: string; status: string; createdAt: string; itemsAdded: number; itemsTotal: number }>;
};

const money = (value: number) => `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
const scoreTone = (score: number | null) => score === null ? "text-slate-500" : score >= 85 ? "text-emerald-600" : score >= 65 ? "text-amber-600" : "text-rose-600";

export default function SupplierScorecardPage() {
  const [suppliers, setSuppliers] = useState<SupplierScorecard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/suppliers/scorecard", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Unable to load scorecard");
      setSuppliers(data.suppliers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load scorecard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/suppliers" className="mb-3 inline-flex items-center gap-2 text-sm text-indigo-600"><ArrowLeft className="h-4 w-4" /> Suppliers</Link>
          <h1 className="text-2xl font-bold text-slate-900">Supplier Scorecard</h1>
          <p className="mt-1 text-sm text-slate-500">Read-only view of quality, sync reliability, replacement activity and acquisition cost.</p>
        </div>
        <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
      {loading && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Loading supplier performance…</div>}
      {!loading && !error && suppliers.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No suppliers found.</div>}

      {!loading && !error && suppliers.length > 0 && <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
            <th className="px-5 py-4">Supplier</th><th className="px-5 py-4">Score</th><th className="px-5 py-4">Quality</th><th className="px-5 py-4">Sync reliability</th><th className="px-5 py-4">Replacements</th><th className="px-5 py-4">Acquisition</th><th className="px-5 py-4">Recent syncs</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {suppliers.map((supplier) => <tr key={supplier.id} className="hover:bg-slate-50">
              <td className="px-5 py-4"><div className="font-semibold text-slate-900">{supplier.name}</div><div className="text-xs text-slate-500">{supplier.code} · {supplier.isActive ? "Active" : "Inactive"}</div></td>
              <td className="px-5 py-4"><div className={`flex items-center gap-1 text-xl font-bold ${scoreTone(supplier.score)}`}><Star className="h-4 w-4 fill-current" />{supplier.score ?? "—"}</div><div className="text-xs text-slate-400">out of 100</div></td>
              <td className="px-5 py-4"><div className="font-semibold text-slate-800">{supplier.qualityScore}</div><div className="text-xs text-slate-500">{supplier.invalidRatePct}% invalid · {supplier.replacementRatePct}% replaced</div></td>
              <td className="px-5 py-4"><div className="font-semibold text-slate-800">{supplier.syncSuccessRate === null ? "No history" : `${supplier.syncSuccessRate}%`}</div><div className="text-xs text-slate-500">score {supplier.reliabilityScore}</div></td>
              <td className="px-5 py-4"><div className="font-semibold text-slate-800">{supplier.replacementRequests}</div><div className="text-xs text-slate-500">{supplier.completedReplacements} approved/completed</div></td>
              <td className="px-5 py-4"><div className="font-semibold text-slate-800">{money(supplier.totalProcurementSpendBDT)}</div><div className="text-xs text-slate-500">{supplier.totalUnitsPurchased.toLocaleString()} units · {supplier.avgAcquisitionCostBDT === null ? "No cost" : `${money(supplier.avgAcquisitionCostBDT)}/unit`}</div></td>
              <td className="px-5 py-4"><div className="space-y-1">{supplier.recentSyncs.length === 0 ? <span className="text-xs text-slate-400">No sync activity</span> : supplier.recentSyncs.slice(0, 3).map((sync) => <div key={sync.id} className="flex items-center gap-1.5 text-xs"><span className={sync.status === "SUCCESS" ? "text-emerald-600" : "text-amber-600"}>{sync.status === "SUCCESS" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}</span>{sync.status} · {sync.itemsAdded}/{sync.itemsTotal}</div>)}</div></td>
            </tr>)}
          </tbody>
        </table>
      </div>}
      <p className="text-xs text-slate-400">Scores are operational indicators based on recorded stock, batches, replacement requests and the latest five webhook events. No credentials or stock payloads are exposed.</p>
    </main>
  );
}
