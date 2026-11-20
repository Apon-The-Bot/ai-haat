"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Box, Command, Headphones, Search, ShoppingBag, UserRound, X } from "@/components/animated-icons/lucide";
import { Loader2 } from "lucide-react";

type Scope = "all" | "orders" | "users" | "tickets" | "products";
type Result = { type: string; id: string; title: string; subtitle: string; meta: string; href: string; timestamp: string | null };

const scopes: { value: Scope; label: string }[] = [
  { value: "all", label: "All" },
  { value: "orders", label: "Orders" },
  { value: "users", label: "Users" },
  { value: "tickets", label: "Tickets" },
  { value: "products", label: "Products" },
];

const icons = { order: ShoppingBag, user: UserRound, ticket: Headphones, product: Box };

export default function AdminSearchPage() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [results, setResults] = useState<Result[]>([]);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); inputRef.current?.focus(); }
      if (event.key === "Escape") { setQuery(""); setResults([]); inputRef.current?.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setSelected(0);
    if (query.trim().length < 2) { setResults([]); setLoading(false); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}&scope=${scope}`, { signal: controller.signal });
        const data = await response.json();
        if (response.ok && data.success) setResults(data.results || []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally { setLoading(false); }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, scope]);

  const moveSelection = (direction: number) => setSelected((current) => Math.max(0, Math.min(Math.max(results.length - 1, 0), current + direction)));

  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FC5C03]">Admin workspace</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Global Search</h1>
        <p className="mt-2 text-sm text-slate-500">Orders, customers, support tickets and products from one keyboard-friendly search.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input ref={inputRef} autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); moveSelection(1); } if (event.key === "ArrowUp") { event.preventDefault(); moveSelection(-1); } if (event.key === "Enter" && results[selected]) window.location.href = results[selected].href; }} placeholder="Search order number, email, ticket, SKU or product..." aria-label="Search admin records" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-24 text-base outline-none transition focus:border-[#FC5C03] focus:ring-4 focus:ring-[#FC5C03]/10" />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2 text-xs text-slate-400">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X className="h-4 w-4" /></button> : <span className="hidden items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 sm:flex"><Command className="h-3 w-3" /> K</span>}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Search scope">
          {scopes.map((item) => <button key={item.value} type="button" role="tab" aria-selected={scope === item.value} onClick={() => setScope(item.value)} className={`rounded-lg px-3 py-2 text-sm font-bold transition ${scope === item.value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{item.label}</button>)}
        </div>
      </section>

      {query.trim().length < 2 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500"><Search className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 text-sm">Type at least two characters to search.</p><p className="mt-1 text-xs">Use ↑ ↓ to move and Enter to open a result.</p></div> : results.length === 0 && !loading ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500"><p className="text-sm font-semibold">No matching records found.</p><p className="mt-1 text-xs">Try an order number, customer email, ticket number or product name.</p></div> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" role="listbox" aria-label="Search results">
        {results.map((result, index) => { const Icon = icons[result.type as keyof typeof icons] || Search; return <Link key={`${result.type}-${result.id}`} href={result.href} role="option" aria-selected={selected === index} onMouseEnter={() => setSelected(index)} className={`flex items-center gap-4 border-b border-slate-100 px-5 py-4 transition last:border-0 ${selected === index ? "bg-orange-50" : "hover:bg-slate-50"}`}><span className="rounded-xl bg-slate-100 p-3 text-slate-600"><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-900">{result.title}</span><span className="mt-1 block truncate text-xs text-slate-500">{result.subtitle}</span></span><span className="hidden text-right text-xs font-semibold text-slate-500 sm:block">{result.meta}</span><ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /></Link>; })}
      </div>}
    </main>
  );
}
