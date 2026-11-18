"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, PackageCheck, TriangleAlert } from "lucide-react";

type Check = { key: string; label: string; passed: boolean; severity: "error" | "warning" | "info"; message: string };
type Report = { product: { id: string; name: string; slug: string; status: string; visibility: string }; checks: Check[]; preview: any; summary: { passed: number; total: number; errors: number; warnings: number } };

export default function ProductLaunchPage() {
  const params = useSearchParams();
  const id = params?.get("id") || "";
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => { if (!id) return; fetch(`/api/admin/products/launch?id=${encodeURIComponent(id)}`).then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error); setReport(data); }).catch((err) => setError(err.message)); }, [id]);

  if (!id) return <main className="p-8"><h1 className="text-2xl font-bold">Product Launch Checklist</h1><p className="mt-2 text-slate-500">Open this page with a product id or slug.</p></main>;
  if (error) return <main className="p-8"><h1 className="text-2xl font-bold">Product Launch Checklist</h1><p className="mt-4 text-red-600">{error}</p></main>;
  if (!report) return <main className="flex min-h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></main>;
  const ready = report.summary.errors === 0;
  async function submitReview() {
    setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/admin/products/launch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, reason }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Unable to submit review.");
      setSubmitted(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to submit review."); }
    finally { setSubmitting(false); }
  }
  return <main className="min-h-screen bg-slate-50 p-6 md:p-10"><div className="mx-auto max-w-6xl space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-orange-600">Catalog operations</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Product Launch Checklist</h1><p className="mt-2 text-slate-500">Read-only readiness review for {report.product.name}.</p></div><div className="flex gap-2"><Link href={`/admin/products/edit/${report.product.id}`} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold">Edit product</Link><Link href={`/product/${report.product.slug}`} target="_blank" className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white">Storefront <ExternalLink size={15} /></Link></div></div>
    <section className={`rounded-2xl border p-5 ${ready ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}><div className="flex items-center gap-3">{ready ? <CheckCircle2 className="text-emerald-600" /> : <AlertCircle className="text-red-600" />}<div><h2 className="font-bold">{ready ? "Ready for launch review" : "Action required before launch"}</h2><p className="text-sm text-slate-600">{report.summary.passed}/{report.summary.total} checks passed · {report.summary.errors} blocking issues · {report.summary.warnings} warnings</p></div></div></section>
    {ready && <section className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="font-bold">Submit for publish approval</h2><p className="mt-1 text-sm text-slate-600">A second administrator must approve the product before it becomes active and public.</p><textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} placeholder="Why is this product ready to publish?" className="mt-3 min-h-20 w-full rounded-xl border p-3 text-sm" disabled={submitting || submitted} /><button type="button" onClick={() => void submitReview()} disabled={submitting || submitted || reason.trim().length < 3} className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{submitted ? "Review submitted" : submitting ? "Submitting..." : "Submit for approval"}</button>{submitted && <p className="mt-2 text-sm text-emerald-700" role="status">Waiting for another administrator to approve publishing.</p>}</section>}
    <section className="grid gap-3 md:grid-cols-2">{report.checks.map((check) => <div key={check.key} className="rounded-2xl border bg-white p-4 shadow-sm"><div className="flex items-start gap-3">{check.passed ? <CheckCircle2 className="mt-0.5 text-emerald-500" size={19} /> : check.severity === "warning" ? <TriangleAlert className="mt-0.5 text-amber-500" size={19} /> : <AlertCircle className="mt-0.5 text-red-500" size={19} />}<div><p className="font-semibold text-slate-900">{check.label}</p><p className="mt-1 text-sm text-slate-600">{check.message}</p></div></div></div>)}</section>
    <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-2"><PackageCheck size={20} className="text-orange-500" /><h2 className="text-lg font-bold">Storefront preview</h2></div><div className="mt-5 grid gap-6 md:grid-cols-[180px_1fr]">{report.preview.image ? <Image src={report.preview.image} alt="" width={360} height={360} className="h-44 w-full rounded-xl object-cover" unoptimized /> : <div className="flex h-44 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">No image</div>}<div><p className="text-sm text-slate-500">{report.preview.category}</p><h3 className="mt-1 text-2xl font-bold">{report.preview.name}</h3><p className="mt-2 text-lg font-semibold text-orange-600">৳{report.preview.price}</p><p className="mt-3 text-sm text-slate-600">{report.preview.shortDesc}</p><div className="mt-4 flex flex-wrap gap-2">{report.preview.variations.map((v: any) => <span key={v.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs">{v.name} · ৳{v.priceBDT}</span>)}</div></div></div></section>
  </div></main>;
}
