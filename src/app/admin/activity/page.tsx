"use client";

import { Download, RefreshCw, Search, ShieldCheck } from "@/components/animated-icons/lucide";
import { useCallback, useEffect, useState } from "react";

type Event = { id: string; source: string; actor: string; action: string; targetType: string; targetId: string; details: unknown; createdAt: string };
type Data = { events: Event[]; pagination: { page: number; pageSize: number; total: number; totalPages: number }; filters: { actions: string[]; targetTypes: string[]; actors: string[] } };

const input = "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800";

export default function AdminActivityPage() {
  const [data, setData] = useState<Data>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [action, setAction] = useState("ALL");
  const [targetType, setTargetType] = useState("ALL");
  const [actor, setActor] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const params = useCallback((format?: string) => {
    const value = new URLSearchParams({ page: String(page), pageSize: "50", source });
    if (query) value.set("query", query); if (action !== "ALL") value.set("action", action); if (targetType !== "ALL") value.set("targetType", targetType); if (actor) value.set("actor", actor); if (from) value.set("from", from); if (to) value.set("to", to); if (format) value.set("format", format);
    return value;
  }, [page, source, query, action, targetType, actor, from, to]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await fetch(`/api/admin/activity?${params().toString()}`, { cache: "no-store" }); if (!response.ok) throw new Error(); setData(await response.json()); }
    catch { setError("Activity could not be loaded. Check your MFA session and retry."); }
    finally { setLoading(false); }
  }, [params]);

  useEffect(() => { void load(); }, [load]);
  function change(setter: (value: string) => void, value: string) { setter(value); setPage(1); }

  return <main className="space-y-6 pb-16">
    <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700"><ShieldCheck className="h-4 w-4" /> Admin activity</div><h1 className="text-3xl font-black text-slate-900">Activity Timeline</h1><p className="text-sm text-slate-500">Administrative audit events and order timeline events in one chronological view.</p></div><div className="flex gap-2"><button className={input} onClick={() => void load()} aria-label="Refresh activity"><RefreshCw className={loading ? "animate-spin" : ""} /></button><a className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white" href={`/api/admin/activity?${params("csv").toString()}`}><Download className="h-4 w-4" /> Export CSV</a></div></header>
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4"><label className="relative md:col-span-2"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input className={`${input} w-full pl-9`} value={query} onChange={(e) => change(setQuery, e.target.value)} placeholder="Search actor, order, action or details" /></label><select className={input} value={source} onChange={(e) => change(setSource, e.target.value)}><option value="all">All sources</option><option value="audit">Admin audit</option><option value="timeline">Order timeline</option></select><select className={input} value={targetType} onChange={(e) => change(setTargetType, e.target.value)}><option value="ALL">All targets</option>{data?.filters.targetTypes.map((item) => <option key={item}>{item}</option>)}</select><select className={input} value={action} onChange={(e) => change(setAction, e.target.value)}><option value="ALL">All actions</option>{data?.filters.actions.map((item) => <option key={item}>{item}</option>)}</select><select className={input} value={actor} onChange={(e) => change(setActor, e.target.value)}><option value="">All actors</option>{data?.filters.actors.map((item) => <option key={item}>{item}</option>)}</select><input aria-label="From date" type="date" className={input} value={from} onChange={(e) => change(setFrom, e.target.value)} /><input aria-label="To date" type="date" className={input} value={to} onChange={(e) => change(setTo, e.target.value)} /></section>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Time</th><th className="p-4">Source</th><th className="p-4">Actor</th><th className="p-4">Action</th><th className="p-4">Target</th><th className="p-4">Details</th></tr></thead><tbody className="divide-y divide-slate-100">{data?.events.map((event) => <tr key={`${event.source}-${event.id}`} className="hover:bg-slate-50"><td className="p-4 whitespace-nowrap text-slate-500">{new Date(event.createdAt).toLocaleString()}</td><td className="p-4"><span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700">{event.source === "ADMIN_AUDIT" ? "Admin audit" : "Order timeline"}</span></td><td className="p-4 font-semibold">{event.actor}</td><td className="p-4 font-mono text-xs">{event.action}</td><td className="p-4"><span className="font-semibold">{event.targetType}</span><span className="ml-2 font-mono text-xs text-orange-700">{event.targetId}</span></td><td className="max-w-sm truncate p-4 text-xs text-slate-600">{typeof event.details === "string" ? event.details : JSON.stringify(event.details || "")}</td></tr>)}{!loading && !data?.events.length && <tr><td colSpan={6} className="p-12 text-center text-slate-500">No activity matches these filters.</td></tr>}</tbody></table></div><footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"><span>{loading ? "Loading…" : `${data?.pagination.total ?? 0} events`}</span><div className="flex gap-2"><button className={input} disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span className="px-2 py-2">Page {page} of {data?.pagination.totalPages ?? 1}</span><button className={input} disabled={page >= (data?.pagination.totalPages ?? 1)} onClick={() => setPage((value) => value + 1)}>Next</button></div></footer></section>
  </main>;
}
