"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Event = { id: string; createdAt: string; label: string; actor?: string | null };
type LegacyEvent = {
  id: string; createdAt: string; status: string; note?: string | null; actorEmail?: string | null;
};
type Case = { id: string; status: string; createdAt: string; reviewedAt?: string | null };
type Investigation = {
  createdAt: string;
  paymentStatus: string;
  deliveryStatus: string;
  refundStatus: string | null;
  refundedBDT: number;
  assigneeId: string | null;
  admins: { id: string; name: string | null; email: string }[];
  items: {
    id: string; productName: string; variationName: string; deliveryStatus: string;
    fulfillmentType: string; warrantyDaysAtPurchase: number; refundWindowDaysAtPurchase: number;
    refundAllowedAtPurchase: boolean; replacementAllowedAtPurchase: boolean;
  }[];
  activity: { id: string; action: string; details: string | null; actorEmail: string | null; createdAt: string }[];
  supportTickets: { id: string; ticketNumber: string; status: string; createdAt: string }[];
  refunds: (Case & { requestedAmountBDT: number; approvedAmountBDT: number | null; processedAt: string | null })[];
  replacements: Case[];
  deliveredKeys: { id: string; deliveredAt: string; isReplacement: boolean }[];
};

function buildTimeline(data: Investigation, legacy: LegacyEvent[]): Event[] {
  const events: Event[] = [{ id: "created", createdAt: data.createdAt, label: "Order created" }];
  for (const event of legacy) {
    events.push({ ...event, label: event.note || event.status, actor: event.actorEmail });
  }
  for (const entry of data.activity) {
    const admin = data.admins.find(({ id }) => id === entry.details);
    const label = entry.action === "ORDER_INTERNAL_NOTE"
      ? `Internal note · ${entry.details}`
      : entry.details ? `Assigned to ${admin?.name || admin?.email || "former administrator"}` : "Assignment removed";
    events.push({ ...entry, label, actor: entry.actorEmail });
  }
  for (const key of data.deliveredKeys) {
    events.push({ id: `key-${key.id}`, createdAt: key.deliveredAt, label: key.isReplacement ? "Replacement delivered" : "Item delivered" });
  }
  for (const ticket of data.supportTickets) {
    events.push({ ...ticket, label: `Support ticket ${ticket.ticketNumber} opened` });
  }
  for (const [kind, cases] of [["Refund", data.refunds], ["Replacement", data.replacements]] as const) {
    for (const item of cases) {
      events.push({ ...item, label: `${kind} requested` });
      if (item.reviewedAt) events.push({ id: `review-${item.id}`, createdAt: item.reviewedAt, label: `${kind} reviewed` });
    }
  }
  for (const refund of data.refunds) {
    if (refund.processedAt) events.push({ id: `processed-${refund.id}`, createdAt: refund.processedAt, label: "Refund processed" });
  }
  return events.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

const input = "rounded-lg border border-slate-300 px-3 py-2 text-sm";
const button = "rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50";

export function OrderInvestigation({ id, legacy }: { id: string; legacy: LegacyEvent[] }) {
  const [data, setData] = useState<Investigation>();
  const [assignee, setAssignee] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const url = `/api/admin/orders/${encodeURIComponent(id)}/investigation`;

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load investigation. Check your admin session and retry.");
        return response.json() as Promise<Investigation>;
      })
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setAssignee(result.assigneeId ?? "");
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("Could not load investigation. Check your admin session and retry.");
      });
    return () => controller.abort();
  }, [url, revision]);

  async function save(change: { action: "assign"; assigneeId: string | null } | { action: "note"; note: string }) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(change),
      });
      if (!response.ok) throw new Error("Save failed");
      if (change.action === "note") setNote("");
      setData(undefined);
      setRevision((count) => count + 1);
    } catch {
      setError("Could not save this change. Refresh the investigation before retrying.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Order investigation" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-900">
      <h4 className="font-bold">Order investigation</h4>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {error && <button type="button" className={button} onClick={() => { setError(""); setRevision((count) => count + 1); }}>Refresh investigation</button>}
      {!data && !error && <p role="status">Loading investigation…</p>}
      {data && <>
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div><dt className="font-semibold">Payment</dt><dd>{data.paymentStatus}</dd></div>
          <div><dt className="font-semibold">Delivery</dt><dd>{data.deliveryStatus}</dd></div>
          <div><dt className="font-semibold">Refund</dt><dd>{data.refundStatus ?? (data.refunds.length ? "See requests" : "No request")} · ৳{data.refundedBDT} refunded</dd></div>
        </dl>
        <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => {
          event.preventDefault();
          void save({ action: "assign", assigneeId: assignee || null });
        }}>
          <label className="grid gap-1">Assigned administrator
            <select className={input} value={assignee} disabled={busy} onChange={(event) => setAssignee(event.target.value)}>
              <option value="">Unassigned</option>
              {data.assigneeId && !data.admins.some(({ id }) => id === data.assigneeId) &&
                <option value={data.assigneeId}>Former administrator</option>}
              {data.admins.map((admin) => <option key={admin.id} value={admin.id}>{admin.name || admin.email}</option>)}
            </select>
          </label>
          <button className={button} disabled={busy || assignee === (data.assigneeId ?? "")}>Save assignment</button>
        </form>
        <div>
          <h5 className="font-semibold">Linked support tickets</h5>
          {data.supportTickets.length ? <ul className="mt-1 space-y-1">
            {data.supportTickets.map((ticket) => <li key={ticket.id}>
              <Link className="text-orange-800 underline" href={`/admin/support/${encodeURIComponent(ticket.id)}`}>{ticket.ticketNumber}</Link> · {ticket.status}
            </li>)}
          </ul> : <p>No linked tickets.</p>}
        </div>
        <details>
          <summary className="cursor-pointer font-semibold">Purchase policy and related requests</summary>
          <ul className="mt-2 space-y-2">
            {data.items.map((item) => <li key={item.id}>
              <strong>{item.productName} · {item.variationName}</strong>
              <p>{item.deliveryStatus} · {item.fulfillmentType}</p>
              <p>Warranty {item.warrantyDaysAtPurchase} days · {item.refundAllowedAtPurchase ? `Refund window ${item.refundWindowDaysAtPurchase} days` : "Refund unavailable"} · {item.replacementAllowedAtPurchase ? "Replacement eligible" : "Replacement unavailable"}</p>
            </li>)}
            {data.refunds.map((refund) => <li key={refund.id}>
              Refund {refund.status} · ৳{refund.requestedAmountBDT} requested{refund.approvedAmountBDT !== null && ` · ৳${refund.approvedAmountBDT} approved`}
            </li>)}
            {data.replacements.map((replacement) => <li key={replacement.id}>Replacement {replacement.status}</li>)}
          </ul>
        </details>
        <form className="grid gap-2" onSubmit={(event) => {
          event.preventDefault();
          void save({ action: "note", note: note.trim() });
        }}>
          <label className="grid gap-1">Internal note
            <textarea className={input} value={note} rows={3} maxLength={2000} disabled={busy} onChange={(event) => setNote(event.target.value)} placeholder="Record findings without passwords or license keys" />
          </label>
          <button className={`${button} justify-self-start`} disabled={busy || !note.trim()}>Add note</button>
        </form>
        <h5 className="font-semibold">Timeline</h5>
        <ol className="space-y-2">
          {buildTimeline(data, legacy).map((event) => <li key={event.id} className="border-l-2 border-orange-300 pl-3">
            <p className="whitespace-pre-wrap break-words">{event.label}</p>
            <p className="text-xs text-slate-600">
              <time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString()}</time>
              {event.actor && ` · ${event.actor}`}
            </p>
          </li>)}
        </ol>
      </>}
    </section>
  );
}
