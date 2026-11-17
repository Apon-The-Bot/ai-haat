"use client";

import Link from "next/link";
import { useOperationsData } from "./useOperationsData";
import { queues, type Assignment, type Queue, type QueueEntry } from "./queues";

const ageLabels: Record<Queue, string> = {
  support: "Age since last ticket activity",
  fulfillment: "Age since order creation",
  payments: "Age since order creation",
  refunds: "Age since request creation",
  replacements: "Age since request creation",
  stock: "Paid shortages first, with age since the oldest affected order",
  suppliers: "Age since latest failed or partial sync",
};

const actionLabels: Record<Queue, string> = {
  support: "Open ticket",
  fulfillment: "Open order",
  payments: "Open order",
  refunds: "Open refunds",
  replacements: "Open replacements",
  stock: "Open inventory",
  suppliers: "Open suppliers",
};

function age(since: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(since)) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours}h ${minutes % 60}m` : `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export function QueueList({ queue, page, assignment }: { queue: Queue; page: number; assignment: Assignment }) {
  const filters = new URLSearchParams({ queue, page: String(page) });
  if (queue === "support") filters.set("assignment", assignment);
  const { data, error, refresh } = useOperationsData<{ entries: QueueEntry[]; hasNext: boolean }>(`?${filters}`);

  function pageHref(next: number) {
    const params = new URLSearchParams(filters);
    params.set("page", String(next));
    return `?${params}`;
  }

  return (
    <section aria-label={queues[queue].label} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">
          {ageLabels[queue]}
        </p>
        <button type="button" onClick={refresh} className="text-sm font-semibold text-slate-700 underline">Refresh</button>
      </div>
      {error && <p role="alert" className="text-sm text-rose-700">Could not refresh this queue.</p>}
      {!data && !error && <p role="status" className="text-sm text-slate-600">Loading queue…</p>}
      {data?.entries.length === 0 && <p className="text-sm text-slate-600">No items match this view.</p>}
      {!!data?.entries.length && (
        <ul className="divide-y divide-slate-100">
          {data.entries.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold text-slate-900">{entry.reference}</p>
                <p className="text-sm text-slate-600">{entry.detail} · {entry.status.replaceAll("_", " ")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {entry.assignment && (
                  <span className="text-slate-600">
                    {{ mine: "Assigned to you", assigned: "Assigned", unassigned: "Unassigned" }[entry.assignment]}
                  </span>
                )}
                {entry.since && (
                  <time dateTime={entry.since} title={entry.since} className="rounded-md bg-amber-50 px-2 py-1 font-semibold tabular-nums text-amber-900">
                    {age(entry.since)}
                  </time>
                )}
                <Link href={entry.href} aria-label={`Open workspace for ${entry.reference}`} className="font-semibold text-slate-800 underline">
                  {actionLabels[queue]}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      {(page > 1 || data?.hasNext) && (
        <nav aria-label="Queue pagination" className="flex items-center gap-4 text-sm">
          {page > 1 && <Link href={pageHref(page - 1)} className="font-semibold underline">Previous</Link>}
          <span>Page {page}</span>
          {data?.hasNext && <Link href={pageHref(page + 1)} className="font-semibold underline">Next</Link>}
        </nav>
      )}
    </section>
  );
}
