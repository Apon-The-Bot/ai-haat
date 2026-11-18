import Link from "next/link";
import { pageNumber, pageSize, readOrders, readWallet, value, type Query } from "./records";
import { linkStyle, money, Pagination, RecordTable, recordUrl, timestamp } from "./view";

export async function ReconciliationView({ query, path }: {
  query: Query;
  path: "/admin/reconciliation" | "/staff/finance";
}) {
  const orderUrl = (id: string) => recordUrl(path, { q: id });
  const walletUrl = (id: string) => recordUrl(path, { view: "wallet", q: id });
  const walletView = value(query, "view") === "wallet";
  const page = pageNumber(query);
  const offset = (page - 1) * pageSize;
  const range = value(query, "range") || "30D";
  const term = value(query, "q");
  const walletRows = walletView ? await readWallet(query, offset) : [];
  const orders = walletView ? [] : await readOrders(query, offset);

  return (
    <div className="space-y-5">
      {path === "/admin/reconciliation" && <Link className={linkStyle} href="/admin/reports">Financial reports</Link>}
      <div>
        <h1 className="text-2xl font-bold">Financial reconciliation</h1>
        <p className="text-sm text-slate-600">Read-only review of order payment records, refunds, and wallet entries. External settlement requires the provider’s statement.</p>
      </div>
      <nav aria-label="Reconciliation views" className="flex gap-4">
        <Link className={linkStyle} aria-current={!walletView ? "page" : undefined}
          href={recordUrl(path, { range })}>Orders, payments & refunds</Link>
        <Link className={linkStyle} aria-current={walletView ? "page" : undefined}
          href={recordUrl(path, { range, view: "wallet" })}>Wallet ledger</Link>
      </nav>
      <form action={path} className="flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4 text-sm">
        {walletView && <input type="hidden" name="view" value="wallet" />}
        <label className="grid gap-1">
          Exact reference across all dates
          <input name="q" defaultValue={term} maxLength={191} className="rounded border px-3 py-2"
            placeholder={walletView ? "Wallet ID or transaction reference" : "Order, payment or refund reference"} />
        </label>
        <label className="grid gap-1">
          Period when browsing
          <select name="range" defaultValue={range} className="rounded border px-3 py-2">
            {Object.entries({ TODAY: "Today", "7D": "Last 7 days", "30D": "Last 30 days", "90D": "Last 90 days", THIS_MONTH: "This month", ALL: "All time" })
              .map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Apply</button>
      </form>
      <p className="text-xs text-slate-600">Timestamps are UTC. Linked records are included regardless of their date.</p>
      {walletView ? (
        <RecordTable headings={["Wallet entry", "Created (UTC)", "Type / method", "Status", "Amount", "Linked order"]}
          rows={walletRows.slice(0, pageSize).map(row => [
            row.id, <><div>{row.trxId || "No reference"}</div><small>{row.id}</small></>,
            timestamp(row.createdAt), `${row.type} / ${row.method}`, row.status, money(row.amountBDT),
            row.order ? <Link className={linkStyle} href={orderUrl(row.order.id)}>{row.order.orderNumber}</Link> : "—",
          ])} />
      ) : (
        <RecordTable headings={["Order / placed (UTC)", "Payment record", "Payment check", "Refund total", "Refund records"]}
          rows={orders.slice(0, pageSize).map(order => [
            order.id, <><Link className={linkStyle} href={orderUrl(order.id)}>{order.orderNumber}</Link><div>{timestamp(order.createdAt)}</div></>,
            <><div>{money(order.totalBDT)} · {order.paymentStatus}</div><div>{order.paymentMethod} · {order.trxId || "No reference"}</div></>,
            <><div>{order.paymentCheck}</div>
            {order.gateway && <div>{money(order.gateway.amount)} · {order.gateway.reference}<br />
              {order.gateway.actor} · {timestamp(order.gateway.date)}</div>}
            {order.wallet && <Link className={linkStyle} href={walletUrl(order.wallet.id)}>
              Ledger debit {money(order.wallet.amountBDT)} · {order.wallet.status}
            </Link>}</>,
            <><div>Order {money(order.refundedBDT)}</div><div>Recorded {money(order.recordedRefunds)}</div>
              <div>{order.refundCheck ? "Matches" : "Review recorded total or missing amount"}</div></>,
            order.refunds.length ? <details open={Boolean(term)}>
              <summary>{order.refunds.length} refund record(s)</summary>
              <ul className="space-y-3 pt-2">{order.refunds.map(refund => <li key={refund.id}>
                <div>{refund.status} · {refund.refundMethod} · {money(refund.approvedAmountBDT)}</div>
                <div>Requested {money(refund.requestedAmountBDT)} · Processed {timestamp(refund.processedAt)}</div>
                <div>{refund.check}</div>
                {refund.payoutTrxId && <div>Payout reference {refund.payoutTrxId}</div>}
                {refund.gatewayRef && <div>Gateway reference {refund.gatewayRef}</div>}
                {refund.credit && <Link className={linkStyle} href={walletUrl(refund.credit.id)}>
                  Ledger credit {money(refund.credit.amountBDT)} · {refund.credit.status}
                </Link>}
              </li>)}</ul>
            </details> : "—",
          ])} />
      )}
      <Pagination path={path} query={query} page={page} more={(walletView ? walletRows.length : orders.length) > pageSize} />
    </div>
  );
}
