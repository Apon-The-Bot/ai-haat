"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search, ShieldCheck, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function AdminReplacementsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states for modals
  const [adminNotes, setAdminNotes] = useState("");
  const [adminOverrideReason, setAdminOverrideReason] = useState("");

  const tabs = [
    { label: "All", value: "ALL" },
    { label: "Requested", value: "REQUESTED" },
    { label: "Under Review", value: "UNDER_REVIEW" },
    { label: "Completed", value: "FULFILLED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/replacements");
      const data = await res.json();

      if (res.ok && data.success) {
        setRequests(data.requests || []);
      } else {
        setError(data.error || "Failed to load replacement requests.");
      }
    } catch (err: any) {
      console.error("Error fetching replacements:", err);
      setError("Network error while loading replacements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Derived real-time KPIs
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "REQUESTED" || r.status === "UNDER_REVIEW").length;
  const completedCount = requests.filter((r) => r.status === "FULFILLED" || r.status === "COMPLETED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;
  const replacementRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : "0.0";

  const kpis = {
    pending: pendingCount,
    completed: completedCount,
    rejected: rejectedCount,
    replacementRate,
  };

  const filteredRequests = requests.filter((req) => {
    const matchesTab =
      activeTab === "ALL" ||
      req.status === activeTab ||
      (activeTab === "FULFILLED" && (req.status === "FULFILLED" || req.status === "COMPLETED"));

    const cleanQuery = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !cleanQuery ||
      req.orderNumber?.toLowerCase().includes(cleanQuery) ||
      req.customerEmail?.toLowerCase().includes(cleanQuery) ||
      req.customerName?.toLowerCase().includes(cleanQuery) ||
      req.productName?.toLowerCase().includes(cleanQuery);

    return matchesTab && matchesQuery;
  });

  const handleOpenModal = (type: string, req: any) => {
    setSelectedRequest(req);
    setActionModal(type);
    setAdminNotes("");
    setAdminOverrideReason("");
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionModal) return;
    try {
      setSubmitting(true);
      const isApprove = actionModal === "AUTO_DISPATCH" || actionModal === "WARRANTY_OVERRIDE";
      const action = isApprove ? "APPROVE" : "REJECT";

      const res = await fetch("/api/admin/replacements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          action,
          adminNotes: actionModal === "WARRANTY_OVERRIDE" ? `[Override: ${adminOverrideReason}] ${adminNotes}` : adminNotes,
          adminOverride: actionModal === "WARRANTY_OVERRIDE",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionModal(null);
        await fetchRequests();
      } else {
        alert(data.error || "Failed to process replacement.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Replacements Hub <span className="text-sm font-normal text-gray-500 ml-2">রিপ্লেসমেন্ট হাব</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Review warranty claims and dispatch replacement digital licenses.</p>
        </div>
        <button
          onClick={() => fetchRequests()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Pending Replacements</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{kpis.pending}</p>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Completed Replacements</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{kpis.completed}</p>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Rejected Claims</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{kpis.rejected}</p>
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Replacement Rate</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{kpis.replacementRate}%</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex overflow-x-auto space-x-2 w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-md text-sm whitespace-nowrap font-medium transition ${
                activeTab === tab.value
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64 relative">
          <input
            type="text"
            placeholder="Search Order, Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
          Loading real-time replacement claims...
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          {error}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
          No replacement requests found in this view.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{req.orderNumber}</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        req.status === "FULFILLED" || req.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{req.customerName}</p>
                  <p className="text-xs text-gray-500">{req.customerEmail}</p>
                  {req.customerPhone && <p className="text-xs text-gray-500">{req.customerPhone}</p>}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Product & Delivery</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                    {req.productName} {req.variationName ? `(${req.variationName})` : ""}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Delivered: {req.deliveredAt}</p>
                  <p className="text-xs">
                    <span className="text-gray-500">Warranty:</span>
                    <span className={`ml-1 font-semibold ${req.isWarrantyValid ? "text-emerald-600" : "text-rose-600"}`}>
                      {req.isWarrantyValid ? "Valid" : "Expired"} (Expires: {req.warrantyExpiresAt})
                    </span>
                  </p>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Claim Reason</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{req.reason}</p>
                  {req.description && <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{req.description}"</p>}
                </div>

                <div className="flex flex-col gap-2 justify-center">
                  {req.status === "REQUESTED" || req.status === "UNDER_REVIEW" ? (
                    <>
                      {req.isWarrantyValid ? (
                        <button
                          onClick={() => handleOpenModal("AUTO_DISPATCH", req)}
                          className="w-full px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition"
                        >
                          Approve & Auto-Dispatch
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenModal("WARRANTY_OVERRIDE", req)}
                          className="w-full px-3 py-2 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition border border-amber-300"
                        >
                          Warranty Override & Dispatch
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenModal("REJECT", req)}
                        className="w-full px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition border border-red-200"
                      >
                        Reject Claim
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-2 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded">
                      Claim {req.status.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {actionModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              {actionModal === "AUTO_DISPATCH" && "Approve & Auto-Dispatch"}
              {actionModal === "WARRANTY_OVERRIDE" && "Warranty Override & Dispatch"}
              {actionModal === "REJECT" && "Reject Replacement Claim"}
            </h3>

            <div className="space-y-4">
              {actionModal === "AUTO_DISPATCH" && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  This will atomically claim an active stock license and dispatch it to <strong>{selectedRequest.customerName}</strong>'s Digital Vault.
                </p>
              )}

              {actionModal === "WARRANTY_OVERRIDE" && (
                <div className="space-y-3">
                  <p className="text-xs text-amber-600 font-semibold bg-amber-50 dark:bg-amber-900/30 p-2 rounded">
                    Notice: This item's warranty period is expired. Providing a replacement requires an administrative override justification.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Override Justification *</label>
                    <input
                      type="text"
                      value={adminOverrideReason}
                      onChange={(e) => setAdminOverrideReason(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                      placeholder="e.g. Approved by management for loyal customer"
                      required
                    />
                  </div>
                </div>
              )}

              {actionModal === "REJECT" && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to reject this replacement claim?
                </p>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Notes (Audit Log)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                  rows={2}
                  placeholder="Optional internal notes..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setActionModal(null)}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
