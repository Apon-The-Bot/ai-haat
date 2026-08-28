"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Inbox,
  RefreshCw,
  ArrowLeft,
  Search,
  Eye,
  MousePointer,
  Send,
  CheckCircle2,
  AlertTriangle,
  UserX,
  Radio,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface LogEntry {
  id: string;
  campaignId: string | null;
  campaignName?: string | null;
  email: string;
  event: string;
  ipAddress: string | null;
  userAgent: string | null;
  url: string | null;
  metadataJson: string | null;
  createdAt: string;
}

export default function AdminEmailLogsPage() {
  const { showToast } = useToast();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("ALL");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLogs = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (selectedEvent !== "ALL") params.set("event", selectedEvent);

      const res = await fetch(`/api/admin/email-marketing/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs) setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [search, selectedEvent]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Real-time polling
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const eventTypes = [
    { id: "ALL", label: "All Events" },
    { id: "CLICKED", label: "🖱️ Clicks" },
    { id: "OPENED", label: "👁️ Opens" },
    { id: "SENT", label: "📤 Sent" },
    { id: "DELIVERED", label: "🟢 Delivered" },
    { id: "UNSUBSCRIBED", label: "🚫 Unsubscribed" },
    { id: "FAILED", label: "⚠️ Failed" },
  ];

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Inbox className="w-3.5 h-3.5" />
            <span>Audit &amp; Diagnostics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Live Email Event Stream
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time delivery, pixel open, link redirect, unsubscribe, and delivery error audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              autoRefresh
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? "animate-pulse text-emerald-600" : ""}`} />
            <span>{autoRefresh ? "Live Stream ON" : "Paused"}</span>
          </button>

          <button
            onClick={() => fetchLogs()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
          {eventTypes.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedEvent(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedEvent === tab.id
                  ? "bg-white text-[#FC5C03] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter by email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
          />
        </div>
      </div>

      {/* Logs Stream Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">Event</th>
                <th className="py-3.5 px-5">Recipient Email</th>
                <th className="py-3.5 px-5">Campaign / Context</th>
                <th className="py-3.5 px-5">Diagnostics &amp; Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.length > 0 ? (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleTimeString()} • {new Date(l.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase ${
                          l.event === "CLICKED"
                            ? "bg-amber-100 text-amber-900 font-black"
                            : l.event === "OPENED"
                            ? "bg-purple-100 text-purple-800"
                            : l.event === "DELIVERED" || l.event === "SENT"
                            ? "bg-emerald-100 text-emerald-800"
                            : l.event === "UNSUBSCRIBED"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {l.event === "CLICKED" && <MousePointer className="w-3 h-3 text-amber-600" />}
                        {l.event === "OPENED" && <Eye className="w-3 h-3 text-purple-600" />}
                        {l.event === "SENT" && <Send className="w-3 h-3 text-emerald-600" />}
                        {l.event === "DELIVERED" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {l.event === "UNSUBSCRIBED" && <UserX className="w-3 h-3 text-red-600" />}
                        {l.event === "FAILED" && <AlertTriangle className="w-3 h-3 text-red-600" />}
                        <span>{l.event}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      {l.email}
                    </td>

                    <td className="py-3.5 px-5">
                      {l.campaignId ? (
                        <Link
                          href={`/admin/email-marketing/campaigns/${l.campaignId}`}
                          className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{l.campaignName || "View Campaign"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-400">Direct / System</span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                      {l.url && (
                        <span className="block truncate max-w-xs text-amber-700 font-bold" title={l.url}>
                          🔗 {l.url}
                        </span>
                      )}
                      {l.ipAddress && (
                        <span className="text-slate-400 block text-[10px]">
                          IP: {l.ipAddress} {l.userAgent ? `• ${l.userAgent.slice(0, 30)}...` : ""}
                        </span>
                      )}
                      {l.metadataJson && !l.url && (
                        <span className="text-slate-400 block truncate max-w-xs" title={l.metadataJson}>
                          {l.metadataJson}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No email tracking event records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}