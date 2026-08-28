"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  Mail,
  Send,
  ShieldAlert,
  Smartphone,
  Eye,
  Layers,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface NotificationDelivery {
  id: string;
  channel: string;
  recipient: string;
  status: string;
  providerMessageId: string | null;
  error: string | null;
  sentAt: string | null;
}

interface NotificationEventItem {
  id: string;
  eventType: string;
  entityType: string | null;
  entityId: string | null;
  recipientEmail: string | null;
  recipientPhone: string | null;
  channels: string[];
  status: string;
  attempts: number;
  maxAttempts: number;
  nextAttemptAt: string | null;
  processedAt: string | null;
  lastError: string | null;
  errorCategory: string | null;
  priority: string;
  payload: any;
  deliveries: NotificationDelivery[];
  createdAt: string;
}

interface KPI {
  total: number;
  sent: number;
  pending: number;
  failed: number;
}

export default function AdminNotificationLogsPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<NotificationEventItem[]>([]);
  const [kpi, setKpi] = useState<KPI>({ total: 0, sent: 0, pending: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<NotificationEventItem | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/notifications", window.location.origin);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEvents(data.events || []);
          if (data.kpi) setKpi(data.kpi);
        }
      } else {
        showToast("Failed to load notification logs", "error");
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
      showToast("Error loading notification logs", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleManualRetry = async (eventId: string) => {
    try {
      setRetryingId(eventId);
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Notification retry dispatched successfully", "success");
        fetchEvents();
      } else {
        showToast(data.error || "Retry failed", "error");
      }
    } catch (err) {
      console.error("Manual retry error:", err);
      showToast("Retry failed to connect", "error");
    } finally {
      setRetryingId(null);
    }
  };

  const filteredEvents = events.filter((e) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      e.eventType.toLowerCase().includes(q) ||
      (e.recipientEmail && e.recipientEmail.toLowerCase().includes(q)) ||
      (e.entityId && e.entityId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notification Outbox & Delivery Logs</h1>
              <p className="text-sm text-gray-500">Inspect real-time transactional email, in-app alerts, Telegram dispatches & retries</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchEvents()}
            className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-200 transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Events</p>
            <p className="text-xl font-bold text-gray-900">{kpi.total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent Successfully</p>
            <p className="text-xl font-bold text-emerald-600">{kpi.sent}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending / In-Flight</p>
            <p className="text-xl font-bold text-amber-600">{kpi.pending}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Failed Dispatches</p>
            <p className="text-xl font-bold text-rose-600">{kpi.failed}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by event type, email or order..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="SENT">Sent</option>
            <option value="RETRY_WAIT">Retry Wait</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/75 text-xs uppercase font-semibold text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Channels</th>
                <th className="px-6 py-4 text-center">Attempts</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 font-mono text-xs">{ev.eventType}</div>
                    {ev.entityId && <span className="text-[11px] text-gray-400 font-mono">ID: {ev.entityId}</span>}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-700">
                    {ev.recipientEmail || ev.recipientPhone || "System / Admin"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {ev.channels.map((ch) => (
                        <span
                          key={ch}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-xs">
                    {ev.attempts} / {ev.maxAttempts}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        ev.status === "SENT"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : ev.status === "FAILED"
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          ev.status === "SENT" ? "bg-emerald-500" : ev.status === "FAILED" ? "bg-rose-500" : "bg-amber-500"
                        }`}
                      ></span>
                      {ev.status}
                    </span>
                    {ev.lastError && (
                      <div className="text-[11px] text-rose-500 truncate max-w-xs mt-0.5">
                        {ev.lastError}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(ev.createdAt).toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedEvent(ev)}
                        className="p-1.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                        title="View Deliveries & Payload"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(ev.status === "FAILED" || ev.status === "RETRY_WAIT") && (
                        <button
                          onClick={() => handleManualRetry(ev.id)}
                          disabled={retryingId === ev.id}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 transition-colors"
                          title="Retry Notification"
                        >
                          <RotateCcw className={`w-4 h-4 ${retryingId === ev.id ? "animate-spin" : ""}`} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No notification events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EVENT DETAIL MODAL --- */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Event Detail: {selectedEvent.eventType}</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Event ID:</span>
                  <div className="font-mono font-bold text-gray-900">{selectedEvent.id}</div>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className="font-bold text-gray-900">{selectedEvent.status}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Channel Deliveries</h4>
                <div className="space-y-2">
                  {selectedEvent.deliveries.map((d) => (
                    <div key={d.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{d.channel}</span> to <span className="font-mono text-gray-600">{d.recipient}</span>
                        {d.providerMessageId && <div className="text-gray-400 text-[10px]">ID: {d.providerMessageId}</div>}
                        {d.error && <div className="text-rose-600 text-[10px] mt-0.5">{d.error}</div>}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.status === "SENT" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  ))}
                  {selectedEvent.deliveries.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No channel delivery logs recorded yet.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Sanitized Event Payload</h4>
                <pre className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed max-h-48">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
