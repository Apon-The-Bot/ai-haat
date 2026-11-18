"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Search, Users, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { MessageSquare, ShieldAlert, Ticket, Undo2, Tag } from "lucide-react";

type Customer = { id: string; name: string | null; email: string; phone: string | null; role: string; walletBalanceBDT: number; createdAt: string; _count: { orders: number; supportTickets: number } };
type Detail = any;

const money = (value: number) => `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
const date = (value: string | null) => value ? new Date(value).toLocaleString("en-BD", { dateStyle: "medium" }) : "—";

export default function Customer360Page() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Detail>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await fetch(`/api/admin/customers?q=${encodeURIComponent(query)}`); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to load customers"); setCustomers(data.customers || []); } catch (err) { setError(err instanceof Error ? err.message : "Unable to load customers"); } finally { setLoading(false); }
  }, [query]);
  async function openCustomer(id: string) {
    setSelected({ loading: true });
    const response = await fetch(`/api/admin/customers/${id}`); const data = await response.json();
    setSelected(response.ok ? data.customer : { error: data.error || "Unable to load customer" });
  }
  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  return <div className="space-y-6">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-3"><div className="rounded-xl bg-orange-50 p-3 text-orange-600"><Users className="h-5 w-5" /></div><div><h1 className="text-xl font-bold text-gray-900">Customer 360</h1><p className="text-sm text-gray-500">Read-only view of customer activity across the business.</p></div></div></div><button onClick={loadCustomers} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"><RefreshCw className="h-4 w-4" />Refresh</button></div>
    <form onSubmit={(event) => { event.preventDefault(); loadCustomers(); }} className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or phone" className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-500" /></div><button className="rounded-xl bg-orange-600 px-5 text-sm font-semibold text-white">Search</button></form>
    {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]"><div className="space-y-2">{loading ? <p className="p-6 text-sm text-gray-500">Loading customers…</p> : customers.map((customer) => <button key={customer.id} onClick={() => openCustomer(customer.id)} className="flex w-full items-center justify-between rounded-2xl border bg-white p-4 text-left hover:border-orange-300"><div><p className="font-semibold text-gray-900">{customer.name || "Unnamed customer"}</p><p className="text-xs text-gray-500">{customer.email}{customer.phone ? ` · ${customer.phone}` : ""}</p><p className="mt-2 text-xs text-gray-500">{customer._count.orders} orders · {customer._count.supportTickets} tickets · {money(customer.walletBalanceBDT)} wallet</p></div><ChevronRight className="h-4 w-4 text-gray-400" /></button>)}{!loading && customers.length === 0 && <p className="rounded-2xl border bg-white p-6 text-sm text-gray-500">No customers found.</p>}</div><CustomerDetail detail={selected} /></div>
  </div>;
}

function CustomerDetail({ detail }: { detail: Detail }) {
  if (!detail) return <div className="rounded-2xl border border-dashed bg-white p-8 text-sm text-gray-500">Select a customer to inspect their activity.</div>;
  if (detail.loading) return <div className="rounded-2xl border bg-white p-8 text-sm text-gray-500">Loading customer profile…</div>;
  if (detail.error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">{detail.error}</div>;
  const customerQuery = encodeURIComponent(detail.email);
  return <div className="space-y-4 rounded-2xl border bg-white p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-bold">{detail.name || "Unnamed customer"}</h2><p className="text-sm text-gray-500">{detail.email} · Joined {date(detail.createdAt)}</p></div><div className="flex flex-wrap gap-2"><Link href={`/admin/email-marketing/campaigns/new?recipient=${customerQuery}`} className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100"><Tag className="h-3.5 w-3.5" />Send coupon</Link><Link href={`/admin/users/${encodeURIComponent(detail.id)}`} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"><ShieldAlert className="h-3.5 w-3.5" />Account controls</Link></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Wallet" value={money(detail.walletBalanceBDT)} /><Metric label="Coins" value={detail.coinBalance.toLocaleString()} /><Metric label="Orders" value={detail.orders.length.toString()} /><Metric label="Tickets" value={detail.supportTickets.length.toString()} /></div><Section title="Recent orders">{detail.orders.map((item: any) => <Row key={item.id} title={`${item.orderNumber} · ${money(item.totalBDT)}`} meta={`${item.paymentStatus} · ${item.deliveryStatus} · ${date(item.createdAt)}`} />)}</Section><Section title="Wallet activity">{detail.transactions.map((item: any) => <Row key={item.id} title={`${item.type} · ${money(item.amountBDT)}`} meta={`${item.status} · ${item.method} · ${date(item.createdAt)}`} />)}</Section><Section title="Support, refunds and replacements"><div className="grid gap-2 md:grid-cols-3"><div><div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-bold uppercase text-gray-500">Tickets</h3><Link href={`/admin/support?customer=${customerQuery}`} className="text-xs font-semibold text-orange-600 hover:underline">View all</Link></div>{detail.supportTickets.map((item: any) => <div key={item.id} className="border-b py-2 last:border-0"><Link href={`/admin/support/${encodeURIComponent(item.id)}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-700 hover:underline"><MessageSquare className="h-3.5 w-3.5" />{item.ticketNumber}</Link><p className="text-xs text-gray-500">{item.status} · {item.subject}</p><Link href={`/admin/support/${encodeURIComponent(item.id)}`} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900"><Ticket className="h-3 w-3" />Reply or add note</Link></div>)}</div><div><div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-bold uppercase text-gray-500">Refunds</h3><Link href={`/admin/refunds?query=${customerQuery}`} className="text-xs font-semibold text-orange-600 hover:underline">Review queue</Link></div>{detail.refunds.map((item: any) => <div key={item.id} className="border-b py-2 last:border-0"><Link href={`/admin/refunds?query=${customerQuery}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-700 hover:underline"><Undo2 className="h-3.5 w-3.5" />{money(item.requestedAmountBDT)}</Link><p className="text-xs text-gray-500">{item.status} · {item.reason}</p></div>)}{detail.refunds.length === 0 && <Link href={`/admin/refunds?query=${customerQuery}`} className="text-xs font-semibold text-orange-600 hover:underline">Open refund review</Link>}</div><div><h3 className="mb-2 text-xs font-bold uppercase text-gray-500">Replacements</h3>{detail.replacements.map((item: any) => <Row key={item.id} title={item.reason} meta={`${item.status} · ${date(item.createdAt)}`} />)}</div></div></Section><Section title="Reviews"><p className="mb-2 text-xs text-amber-700">{detail.reviewIdentity}</p>{detail.reviews.map((item: any) => <Row key={item.id} title={`${item.product?.name || "Product"} · ${item.rating}/5`} meta={`${item.status} · ${item.comment}`} />)}</Section></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 font-semibold text-gray-900">{value}</p></div>; }
function Section({ title, children }: { title: string; children: ReactNode }) { return <section className="border-t pt-4"><h3 className="mb-2 text-sm font-bold text-gray-900">{title}</h3>{children}</section>; }
function Row({ title, meta }: { title: string; meta: string }) { return <div className="border-b py-2 last:border-0"><p className="text-sm font-medium text-gray-800">{title}</p><p className="text-xs text-gray-500">{meta}</p></div>; }
