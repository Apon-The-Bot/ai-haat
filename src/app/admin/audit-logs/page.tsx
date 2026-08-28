"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  X,
  Clock,
  User,
  Activity,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface AuditLogItem {
  id: string;
  actorId?: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("ALL");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Log Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("pageSize", String(pageSize));

      if (targetTypeFilter !== "ALL") {
        params.set("targetType", targetTypeFilter);
      }
      if (search.trim()) {
        params.set("search", search.trim());
      }

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
          if (data.pagination) {
            setTotalLogs(data.pagination.total);
            setTotalPages(data.pagination.totalPages || 1);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, targetTypeFilter, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-purple-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Immutable Compliance Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Admin Mutation Audit Logs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Cryptographically sanitized records of administrative mutations, role escalations, wallet adjustments, and order state transitions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
          title="Refresh logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor email, target ID, metadata..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#FC5C03] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
            {[
              { id: "ALL", label: "All Targets" },
              { id: "ORDER", label: "Orders" },
              { id: "WALLET", label: "Wallet" },
              { id: "USER", label: "Users" },
              { id: "PRODUCT", label: "Products" },
              { id: "COUPON", label: "Coupons" },
              { id: "SETTINGS", label: "Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setTargetTypeFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  targetTypeFilter === tab.id
                    ? "bg-white text-purple-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-500 hidden lg:block">
            Showing <strong className="text-slate-900">{logs.length}</strong> of{" "}
            <strong className="text-slate-900">{totalLogs}</strong>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-4 px-5">Timestamp</th>
                <th className="py-4 px-5">Administrator (Actor)</th>
                <th className="py-4 px-5">Action Performed</th>
                <th className="py-4 px-5">Target Entity</th>
                <th className="py-4 px-5">Target ID</th>
                <th className="py-4 px-5 text-right">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Timestamp */}
                    <td className="py-4 px-5 font-mono text-slate-500 text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    {/* Actor */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-purple-600" />
                        <span className="font-bold text-slate-900">{log.actorEmail}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 font-bold text-[10.5px] border border-purple-100 font-mono">
                        {log.action}
                      </span>
                    </td>

                    {/* Target Type */}
                    <td className="py-4 px-5 font-bold text-slate-700 uppercase text-[11px]">
                      {log.targetType}
                    </td>

                    {/* Target ID */}
                    <td className="py-4 px-5 font-mono text-xs text-[#FC5C03] font-bold">
                      {log.targetId}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Activity className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No audit records found</p>
                      <p className="text-xs text-slate-400">Administrative mutations will appear here automatically.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-semibold text-slate-500">
            Page <strong className="text-slate-900">{currentPage}</strong> of{" "}
            <strong className="text-slate-900">{totalPages}</strong> ({totalLogs} total audit events)
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* INSPECT LOG DETAILS MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-600" />
                <span>Audit Event Details</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Actor</span>
                  <strong className="text-slate-900">{selectedLog.actorEmail}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Action</span>
                  <strong className="text-purple-700 font-mono">{selectedLog.action}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Target Entity</span>
                  <strong className="text-slate-900">{selectedLog.targetType} ({selectedLog.targetId})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Timestamp</span>
                  <strong className="text-slate-900">{new Date(selectedLog.createdAt).toLocaleString()}</strong>
                </div>
              </div>

              <div>
                <span className="text-slate-700 font-bold block mb-1.5">Sanitized Metadata Diff (Zero Secrets):</span>
                <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
