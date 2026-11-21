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
    <div className="dashboard-page space-y-6">
      <header className="dashboard-page-header">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Financial reports</p>
          <h1 className="dashboard-page-title">Financial reconciliation</h1>
          <p className="dashboard-page-description">Read-only review of order payments, refunds, and wallet entries.</p>
        </div>
        {path === "/admin/reconciliation" && <Link className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-orange-300 hover:text-orange-600" href="/admin/reports">Back to reports</Link>}
      </header>
      <div className="flex flex-wrap gap-2">
        <Link className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${!walletView ? "bg-orange-50 text-orange-700" : "text-slate-500 hover:bg-slate-100"}`} aria-current={!walletView ? "page" : undefined}
          href={recordUrl(path, { range })}>Orders, payments & refunds</Link>
        <Link className={`rounded-xl px-3.5 py-2 text-sm font-bold transition ${walletView ? "bg-orange-50 text-orange-700" : "text-slate-500 hover:bg-slate-100"}`} aria-current={walletView ? "page" : undefined}
          href={recordUrl(path, { range, view: "wallet" })}>Wallet ledger</Link>
      </div>
      <form action={path} className="dashboard-toolbar text-sm">
        {walletView && <input type="hidden" name="view" value="wallet" />}
        <label className="grid gap-1">
          Exact reference across all dates
          <input name="q" defaultValue={term} maxLength={191} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder={walletView ? "Wallet ID or transaction reference" : "Order, payment or refund reference"} />
        </label>
        <label className="grid gap-1">
          Period when browsing
          <select name="range" defaultValue={range} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400">
            {Object.entries({ TODAY: "Today", "7D": "Last 7 days", "30D": "Last 30 days", "90D": "Last 90 days", THIS_MONTH: "This month", ALL: "All time" })
              .map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
        </label>
        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600">Apply filters</button>
      </form>
      <p className="text-xs font-semibold text-slate-400">Timestamps are UTC. Linked records are included regardless of their date.</p>
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
