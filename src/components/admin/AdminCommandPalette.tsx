"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "@/components/animated-icons/lucide";
import { adminNavigation } from "./admin-navigation";

type Entry = { name: string; href: string; group: string; icon: React.ComponentType<{ className?: string }>; searchText: string };

function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const next = row[j];
      row[j] = a[i - 1] === b[j - 1] ? diagonal : Math.min(row[j] + 1, row[j - 1] + 1, diagonal + 1);
      diagonal = next;
    }
  }
  return row[b.length];
}

export function AdminCommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const entries = useMemo<Entry[]>(() => adminNavigation.flatMap((group) => group.items.map((item) => ({ ...item, group: group.group, searchText: `${item.name} ${group.group} ${item.href}`.toLowerCase() }))), []);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return entries.slice(0, 8);
    return entries.map((entry) => ({ entry, score: entry.searchText.includes(term) ? 0 : Math.min(...entry.searchText.split(/\s+/).map((word) => distance(term, word))) })).filter((item) => item.score <= Math.max(2, Math.floor(term.length / 3))).sort((a, b) => a.score - b.score).slice(0, 12).map((item) => item.entry);
  }, [entries, query]);

  useEffect(() => { if (open) { setQuery(""); setSelected(0); requestAnimationFrame(() => inputRef.current?.focus()); } }, [open]);
  useEffect(() => { if (!open) return; const handler = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); if (event.key === "ArrowDown") { event.preventDefault(); setSelected((value) => Math.min(value + 1, Math.max(results.length - 1, 0))); } if (event.key === "ArrowUp") { event.preventDefault(); setSelected((value) => Math.max(value - 1, 0)); } if (event.key === "Enter" && results[selected]) window.location.href = results[selected].href; }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [open, onClose, results, selected]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-950/35 px-4 pt-[12vh] backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Search admin features" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><Search className="h-5 w-5 text-[#FC5C03]" /><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setSelected(0); }} placeholder="Search admin features…" className="min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400" aria-label="Search admin features" /><kbd className="hidden rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500 sm:inline">ESC</kbd><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close search"><X className="h-4 w-4" /></button></div><div className="max-h-[55vh] overflow-y-auto p-2">{results.length ? results.map((entry, index) => { const Icon = entry.icon; return <Link key={entry.href} href={entry.href} onClick={onClose} className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${index === selected ? "bg-orange-50" : "hover:bg-slate-50"}`}><span className="rounded-xl bg-slate-100 p-2.5 text-slate-600"><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-900">{entry.name}</span><span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">{entry.group}</span></span><ArrowRight className="h-4 w-4 text-slate-400" /></Link>; }) : <p className="px-4 py-10 text-center text-sm text-slate-500">No matching admin features.</p>}</div><div className="border-t border-slate-100 px-5 py-3 text-[11px] font-semibold text-slate-400">Use ↑ ↓ to navigate · Enter to open · Esc to close</div></div></div>;
}
