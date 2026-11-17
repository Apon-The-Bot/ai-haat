"use client";

import Link from "next/link";
import { queues, queueKeys, type QueueCounts } from "./queues";
import { useOperationsData } from "./useOperationsData";

export function QueueSummary() {
  const { data, error, refresh } = useOperationsData<{ counts: QueueCounts }>();

  return (
    <section aria-labelledby="needs-attention" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="needs-attention" className="font-bold text-slate-900">Needs attention</h2>
          <p className="text-sm text-slate-600">Open work across all dates</p>
        </div>
        <button type="button" onClick={refresh} className="text-sm font-semibold text-slate-700 underline">
          Refresh queues
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-rose-700">Could not refresh queue counts.</p>}
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {queueKeys.map((queue) => (
          <li key={queue}>
            <Link href={`/admin/operations?queue=${queue}`} className="flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50 p-3 hover:border-orange-500">
              <span className="text-2xl font-bold tabular-nums text-slate-900">{data?.counts[queue] ?? "—"}</span>
              <span className="text-sm font-medium text-slate-700">{queues[queue].label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
