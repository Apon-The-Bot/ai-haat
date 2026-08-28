"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  RefreshCw,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  User,
  Hash,
  AlertCircle,
} from "lucide-react";

export default function AdminSupportQueuePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));

      const res = await fetch(`/api/admin/support/tickets?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.tickets) {
        setTickets(data.tickets);
        if (data.pagination) setPagination(data.pagination);
      } else {
        setError(data.error || "Failed to load support tickets.");
      }
    } catch (err: any) {
      console.error("Error fetching admin support tickets:", err);
      setError("Network error while loading support queue.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, categoryFilter, searchTerm, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Derived real-time KPIs
  const openTicketsCount = tickets.filter((t) => t.status === "OPEN" || t.status === "WAITING_FOR_ADMIN").length;
  const waitingAdminCount = tickets.filter((t) => t.status === "WAITING_FOR_ADMIN" || t.needsAttention).length;
  const highUrgentCount = tickets.filter((t) => t.priority === "HIGH" || t.priority === "URGENT").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length;

  const kpiCards = [
    { title: "Open Tickets", value: String(openTicketsCount), icon: LifeBuoy, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    { title: "Waiting for Admin", value: String(waitingAdminCount), icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { title: "High / Urgent Priority", value: String(highUrgentCount), icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
    { title: "Resolved / Closed", value: String(resolvedCount), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Support Operations
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            কাস্টমার সাপোর্ট অপারেশনস • Manage customer inquiries and issues.
          </p>
        </div>
        <button
          onClick={() => fetchTickets()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-50 font-bold rounded-xl shadow-sm transition-all text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`p-5 rounded-2xl border ${kpi.border} bg-white shadow-sm flex items-start justify-between`}>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.title}</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{kpi.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <Icon className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Ticket #, Email, Order #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FC5C03]/20 focus:border-[#FC5C03] transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FC5C03]/20"
          >
            <option value="">All Categories</option>
            <option value="DELIVERY">Delivery</option>
            <option value="REFUND">Refund</option>
            <option value="REPLACEMENT">Replacement</option>
            <option value="TECHNICAL">Technical</option>
            <option value="GENERAL">General</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FC5C03]/20"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FC5C03]/20"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_ADMIN">Waiting for Admin</option>
            <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* QUEUE TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            Loading real-time customer support queue...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 bg-red-50">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            {error}
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
            No support tickets match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket #</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject & Category</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900">{ticket.ticketNumber || ticket.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{ticket.customerName || ticket.user?.name || "Customer"}</p>
                          <p className="text-xs text-slate-500">{ticket.customerEmail || ticket.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{ticket.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                          {ticket.category}
                        </span>
                        {ticket.order && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                            <Hash className="w-3 h-3" />
                            {ticket.order.trxId || "Order"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          ticket.priority === "URGENT"
                            ? "bg-rose-100 text-rose-700"
                            : ticket.priority === "HIGH"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex w-max items-center gap-1.5 ${
                          ticket.status === "WAITING_FOR_ADMIN"
                            ? "bg-amber-100 text-amber-700"
                            : ticket.status === "OPEN"
                            ? "bg-indigo-100 text-indigo-700"
                            : ticket.status === "WAITING_FOR_CUSTOMER"
                            ? "bg-blue-100 text-blue-700"
                            : ticket.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {ticket.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(ticket.lastActivityAt || ticket.updatedAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/admin/support/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all"
                      >
                        <span>Open Ticket</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
