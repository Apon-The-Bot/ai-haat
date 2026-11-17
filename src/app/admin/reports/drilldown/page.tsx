import Link from "next/link";
import { pageNumber, pageSize, period, value, type Query } from "../../reconciliation/records";
import { linkStyle, money, orderUrl, Pagination, RecordTable, recordUrl, requireFinanceAccess, timestamp } from "../../reconciliation/view";
import { readDrilldown, sourceFor, sources } from "./records";

export const dynamic = "force-dynamic";
const path = "/admin/reports/drilldown";

export default async function ReportDrilldown({ searchParams }: { searchParams: Promise<Query> }) {
  const denied = await requireFinanceAccess();
  if (denied) return denied;
  const query = await searchParams;
  const page = pageNumber(query);
  const source = sourceFor(query);
  const dates = period(query);
  const day = value(query, "day");
  const method = value(query, "method");
  const refundSource = source === "refunds" || source === "claims" || source === "payouts";
  const rows = await readDrilldown(source, query, (page - 1) * pageSize);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4">
        <Link className={linkStyle} href="/admin/reports">Financial reports</Link>
        <Link className={linkStyle} href="/admin/reconciliation">Reconciliation</Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold">{sources[source].title}</h1>
        <p className="text-sm text-slate-600">{sources[source].basis}</p>
        <p className="mt-1 text-sm text-slate-600">
          {dates ? `${timestamp(dates.gte)} to ${timestamp(dates.lte ?? null)} UTC` : "All time"}
          {day && ` · Day ${day}`}{method && ` · Method ${method}`}
        </p>
        <Link
          className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          href={recordUrl("/api/admin/reports/export", query, { type: "DRILLDOWN", page: undefined })}
        >
          Download filtered CSV
        </Link>
      </div>
      <nav aria-label="Report record sources" className="flex flex-wrap gap-x-4 gap-y-2">
        {Object.entries(sources).map(([key, entry]) => (
          <Link key={key} className={linkStyle} aria-current={key === source ? "page" : undefined}
            href={recordUrl(path, query, { source: key, page: undefined, day: undefined, method: undefined, product: undefined })}>{entry.title}</Link>
        ))}
      </nav>
      {refundSource && (
        <form action={path} className="flex flex-wrap items-end gap-3 text-sm">
          {["source", "range", "from", "to"].map(key => (
            <input key={key} name={key} type="hidden" value={key === "source" ? source : value(query, key)} />
          ))}
          <label className="grid gap-1">
            Exact product name at purchase
            <input name="product" defaultValue={value(query, "product")} maxLength={191} className="rounded border px-3 py-2" />
          </label>
          <button className="rounded bg-slate-900 px-4 py-2 text-white">Filter refunds</button>
          <p className="basis-full text-slate-600">Order-level refunds include the full refund amount if the order contains the product.</p>
        </form>
      )}
      <RecordTable headings={["Record", "Order", "Date (UTC)", "Detail", "Amount"]}
        rows={rows.slice(0, pageSize).map(row => [
          row.id, row.id,
          row.order ? <Link className={linkStyle} href={orderUrl(row.order.id)}>{row.order.orderNumber}</Link> : "—",
          timestamp(row.date), row.detail, money(row.amount),
        ])} />
      <Pagination path={path} query={query} page={page} more={rows.length > pageSize} />
    </div>
  );
}
