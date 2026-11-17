"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deliveryWindowDays } from "@/lib/admin/delivery-sla";

type DeliverySla = {
  overdueCount: number;
  unknownCount: number;
  overdueOrders: { orderNumber: string; deadline: number }[];
  timing: { count: number; medianMinutes: number | null; p90Minutes: number | null };
  excludedTimingCount: number;
};

const countFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });
const deadlineFormat = new Intl.DateTimeFormat("en", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka",
});

function formatDuration(minutes: number | null) {
  if (minutes === null) return "—";
  return minutes >= 60 ? `${countFormat.format(minutes / 60)} hr` : `${countFormat.format(minutes)} min`;
}

export function DashboardDeliverySla() {
  const [data, setData] = useState<DeliverySla | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/admin/delivery-sla", { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Delivery SLA request failed");
        const result: DeliverySla = await response.json();
        if (!controller.signal.aborted) setData(result);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  return (
    <section aria-labelledby="delivery-sla-title" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
      <h2 id="delivery-sla-title" className="text-base font-black text-slate-900">Delivery SLA</h2>
      {failed ? (
        <div role="alert" className="text-sm text-slate-600">
          Delivery metrics are unavailable.{" "}
          <button type="button" className="font-semibold text-indigo-700 underline" onClick={() => {
            setFailed(false);
            setAttempt((current) => current + 1);
          }}>Retry</button>
        </div>
      ) : !data ? (
        <p role="status" className="text-sm text-slate-600">Loading delivery metrics…</p>
      ) : (
        <>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ["Open overdue orders", countFormat.format(data.overdueCount)],
              ["Median delivery time", formatDuration(data.timing.medianMinutes)],
              ["90th percentile delivery time", formatDuration(data.timing.p90Minutes)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-sm text-slate-600">{label}</dt>
                <dd className="mt-1 text-xl font-bold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-slate-600">
            Open deadlines use the current catalog estimates. Orders with undetermined SLA status: {data.unknownCount}.
            {" "}Timing covers payment verification to last original key delivery in the past {deliveryWindowDays} days.
            {" "}{data.timing.count} measured, {data.excludedTimingCount} excluded for missing or inconsistent timestamps.
          </p>
          {data.overdueOrders.length > 0 && (
            <ul aria-label="Oldest overdue orders" className="divide-y divide-slate-100 text-sm">
              {data.overdueOrders.map(({ orderNumber, deadline }) => (
                <li key={orderNumber} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <Link className="font-semibold text-indigo-700 hover:underline"
                    href={`/admin/orders?orderId=${encodeURIComponent(orderNumber)}`}>{orderNumber}</Link>
                  <time dateTime={new Date(deadline).toISOString()} className="text-slate-600">
                    Due {deadlineFormat.format(deadline)} (Dhaka)
                  </time>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
