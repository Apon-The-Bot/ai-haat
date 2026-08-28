"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search, ShieldCheck, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function AdminRefundsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states for modals
  const [modalAmount, setModalAmount] = useState("");
  const [modalAdminNotes, setModalAdminNotes] = useState("");
  const [modalCustomerMessage, setModalCustomerMessage] = useState("");
  const [modalPayoutTrxId, setModalPayoutTrxId] = useState("");
  const [modalGatewayRef, setModalGatewayRef] = useState("");

  const tabs = [
    { label: "All", value: "ALL" },
    { label: "Requested", value: "REQUESTED" },
    { label: "Under Review", value: "UNDER_REVIEW" },
    { label: "Approved", value: "APPROVED" },
    { label: "Refunded", value: "REFUNDED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (activeTab !== "ALL") params.set("status", activeTab);
      if (searchQuery.trim()) params.set("query", searchQuery.trim());

      const res = await fetch(`/api/admin/refunds?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setRefunds(data.refunds || []);
      } else {
        setError(data.error || "Failed to load refund requests.");
      }
    } catch (err: any) {
      console.error("Error fetching refunds:", err);
      setError("Network error while loading refunds.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  // Derived real-time KPIs
  const kpis = {
    pending: refunds.filter((r) => r.status === "REQUESTED" || r.status === "UNDER_REVIEW").length,
    totalRefunded: refunds
      .filter((r) => r.status === "REFUNDED")
      .reduce((sum, r) => sum + (r.approvedAmountBDT || r.requestedAmountBDT || 0), 0),
    walletCount: refunds.filter((r) => r.refundMethod === "WALLET" && r.status === "REFUNDED").length,
    manualPending: refunds.filter((r) => r.refundMethod !== "WALLET" && r.status === "APPROVED").length,
  };

  const handleOpenModal = (type: string, req: any) => {
    setSelectedRequest(req);
    setActionModal(type);
    setModalAmount(String(req.approvedAmountBDT || req.requestedAmountBDT || 0));
    setModalAdminNotes("");
    setModalCustomerMessage("");
    setModalPayoutTrxId("");
    setModalGatewayRef("");
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionModal) return;
    try {
      setSubmitting(true);
      let action = "APPROVE";
      if (actionModal === "REJECT") action = "REJECT";
      if (actionModal === "WALLET") action = "PROCESS_WALLET";
      if (actionModal === "MANUAL") action = "PROCESS_MANUAL";

      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundId: selectedRequest.id,
          action,
          approvedAmount: Number(modalAmount) || selectedRequest.requestedAmountBDT,
          adminNotes: modalAdminNotes,
          customerMessage: modalCustomerMessage,
          payoutTrxId: modalPayoutTrxId,
          gatewayRef: modalGatewayRef,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionModal(null);
        await fetchRefunds();
      } else {
        alert(data.error || "Failed to perform action.");
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
            Refund Management <span className="text-sm font-normal text-gray-500 ml-2">রিফান্ড ম্যানেজমেন্ট</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Review, approve, and process item-level and order-level refund requests.</p>
        </div>
        <button
          onClick={() => fetchRefunds()}
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
          <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Pending Refund Requests</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{kpis.pending}</p>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Total Refunded (BDT)</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">৳ {kpis.totalRefunded.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Wallet Refunds Count</p>
          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{kpis.walletCount}</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Manual MFS Pending</p>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{kpis.manualPending}</p>
        </div>
      </div>

      {/* Tabs and Search */}
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
          Loading real-time refund requests...
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          {error}
        </div>
      ) : refunds.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
          No refund requests found in this view.
        </div>
      ) : (
        <div className="space-y-4">
          {refunds.map((req) => (
            <div key={req.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{req.order?.orderNumber || req.orderId}</span>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        req.status === "REFUNDED"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "APPROVED"
                          ? "bg-blue-100 text-blue-800"
                          : req.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{req.user?.name || "Customer"}</p>
                  <p className="text-xs text-gray-500">{req.user?.email}</p>
                  <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Product / Reason</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{req.orderItem?.productName || "Entire Order"}</p>
                  {req.orderItem?.variationName && <p className="text-xs text-gray-500">{req.orderItem.variationName}</p>}
                  <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                    <p><span className="text-gray-500 font-medium">Reason:</span> {req.reason}</p>
                    {req.description && <p className="mt-1 text-gray-600 dark:text-gray-300">{req.description}</p>}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">Financial Details</p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <span className="text-gray-500">Requested:</span>
                    <span className="text-right font-bold text-amber-600">৳ {req.requestedAmountBDT}</span>
                    {req.approvedAmountBDT !== null && req.approvedAmountBDT !== undefined && (
                      <>
                        <span className="text-gray-500">Approved:</span>
                        <span className="text-right font-bold text-emerald-600">৳ {req.approvedAmountBDT}</span>
                      </>
                    )}
                    <span className="text-gray-500">Method:</span>
                    <span className="text-right font-medium">{req.refundMethod}</span>
                  </div>
                  {req.payoutPhone && <p className="text-xs text-gray-500">MFS: {req.payoutPhone}</p>}
                </div>

                <div className="flex flex-col gap-2 justify-center">
                  {req.status === "REQUESTED" || req.status === "UNDER_REVIEW" ? (
                    <>
                      <button
                        onClick={() => handleOpenModal("WALLET", req)}
                        className="w-full px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition"
                      >
                        1-Click Instant Wallet Refund
                      </button>
                      <button
                        onClick={() => handleOpenModal("MANUAL", req)}
                        className="w-full px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition border border-indigo-200"
                      >
                        Manual MFS Refund
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal("APPROVE", req)}
                          className="flex-1 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition border border-emerald-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenModal("REJECT", req)}
                          className="flex-1 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition border border-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </>
                  ) : req.status === "APPROVED" ? (
                    <button
                      onClick={() => handleOpenModal("MANUAL", req)}
                      className="w-full px-3 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition"
                    >
                      Complete Payout
                    </button>
                  ) : (
                    <div className="text-center py-2 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded">
                      Refund {req.status.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation & Processing Modal */}
      {actionModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              {actionModal === "WALLET" && "Confirm Instant Wallet Refund"}
              {actionModal === "MANUAL" && "Process Manual MFS Refund"}
              {actionModal === "APPROVE" && "Approve Refund Request"}
              {actionModal === "REJECT" && "Reject Refund Request"}
            </h3>

            <div className="space-y-4">
              {actionModal === "WALLET" && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Are you sure you want to refund <strong>৳ {selectedRequest.requestedAmountBDT}</strong> directly to the customer's wallet? This action credits the user wallet and updates the order status atomically.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Approved Amount (BDT)</label>
                    <input
                      type="number"
                      value={modalAmount}
                      onChange={(e) => setModalAmount(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
              )}

              {actionModal === "MANUAL" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">MFS Transaction ID (TrxID)</label>
                    <input
                      type="text"
                      value={modalPayoutTrxId}
                      onChange={(e) => setModalPayoutTrxId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                      placeholder="e.g. 9K2848194X"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sender Number / Gateway Ref</label>
                    <input
                      type="text"
                      value={modalGatewayRef}
                      onChange={(e) => setModalGatewayRef(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                      placeholder="e.g. 017XXXXXXXX"
                    />
                  </div>
                </div>
              )}

              {actionModal === "REJECT" && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Rejection Reason (Visible to Customer)</label>
                  <textarea
                    value={modalCustomerMessage}
                    onChange={(e) => setModalCustomerMessage(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                    rows={3}
                    placeholder="Please explain why the refund was rejected..."
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Internal Admin Note</label>
                <input
                  type="text"
                  value={modalAdminNotes}
                  onChange={(e) => setModalAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Optional internal audit memo..."
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
