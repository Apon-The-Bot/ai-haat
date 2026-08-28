"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Search,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Wallet,
  CreditCard,
  User,
  Mail,
  Phone,
  X,
  Sparkles,
} from "lucide-react";

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
    { label: "সকল রিফান্ড (All)", value: "ALL" },
    { label: "রিকোয়েস্টেড (Requested)", value: "REQUESTED" },
    { label: "রিভিউতে (Under Review)", value: "UNDER_REVIEW" },
    { label: "অনুমোদিত (Approved)", value: "APPROVED" },
    { label: "রিফান্ড সম্পন্ন (Refunded)", value: "REFUNDED" },
    { label: "বাতিলকৃত (Rejected)", value: "REJECTED" },
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
        setRefunds(Array.isArray(data.refunds) ? data.refunds : []);
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
    <div className="space-y-6 max-w-7xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Financial Safeguard Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            রিফান্ড ম্যানেজমেন্ট (Refund Management)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আইটেম ও অর্ডার লেভেল রিফান্ড রিভিউ করুন, ১-ক্লিকে কাস্টমার ওয়ালেটে বা ম্যানুয়াল MFS মাধ্যমে রিফান্ড দিন।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchRefunds()}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Pending Refund Requests
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{kpis.pending}</span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-md">অপেক্ষমান</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Total Refunded (BDT)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">৳{kpis.totalRefunded.toLocaleString()}</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">রিফান্ডেড</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            Wallet Refunds Count
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{kpis.walletCount}</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">ওয়ালেট রিফান্ড</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
            Manual MFS Pending
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{kpis.manualPending}</span>
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-md">MFS অপেক্ষমান</span>
          </div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex overflow-x-auto space-x-1.5 w-full sm:w-auto pb-1 sm:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.value
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="অর্ডার নম্বর, ইমেইল সার্চ করুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#FC5C03]"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FC5C03]" />
          <p className="text-sm font-bold text-slate-800">রিফান্ড রিকোয়েস্ট লোড হচ্ছে...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-700 bg-red-50 rounded-3xl border border-red-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : refunds.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
          <h3 className="text-base font-bold text-slate-900">কোন রিফান্ড রিকোয়েস্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500">এই ফিল্টারে বর্তমানে কোনো রিফান্ড রিকোয়েস্ট নেই।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {refunds.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:border-[#FC5C03]/40 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                    #{req.order?.orderNumber || req.orderId}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      req.status === "REFUNDED"
                        ? "bg-emerald-100 text-emerald-800"
                        : req.status === "APPROVED"
                        ? "bg-blue-100 text-blue-800"
                        : req.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {req.status}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                    পদ্ধতি: {req.refundMethod}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  তারিখ: {req.createdAt ? new Date(req.createdAt).toLocaleDateString("bn-BD") : "—"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Customer Details */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">কাস্টমার তথ্য</span>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.user?.name || "Customer"}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.user?.email}</span>
                  </div>
                  {req.payoutPhone && (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>MFS: {req.payoutPhone}</span>
                    </div>
                  )}
                </div>

                {/* Product & Reason */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">প্রোডাক্ট ও কারণ</span>
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {req.orderItem?.productName || "Entire Order"}
                  </div>
                  <div className="text-xs text-[#FC5C03] font-bold">
                    কারণ: {req.reason}
                  </div>
                  <p className="text-xs text-slate-600 italic line-clamp-2">
                    "{req.description || "কোন অতিরিক্ত বিবরণ নেই"}"
                  </p>
                </div>

                {/* Financial Summary */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">টাকা ও আর্থিক বিবরণ</span>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500 font-medium">ক্লেইমকৃত টাকা:</span>
                    <span className="font-mono font-bold text-amber-600">৳{req.requestedAmountBDT}</span>
                  </div>
                  {req.approvedAmountBDT !== null && req.approvedAmountBDT !== undefined && (
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-500 font-medium">অনুমোদিত টাকা:</span>
                      <span className="font-mono font-bold text-emerald-600">৳{req.approvedAmountBDT}</span>
                    </div>
                  )}
                  {req.payoutTrxId && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      TrxID: <b>{req.payoutTrxId}</b>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-1 flex-wrap">
                {req.status === "REQUESTED" || req.status === "UNDER_REVIEW" ? (
                  <>
                    <button
                      onClick={() => handleOpenModal("WALLET", req)}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#FC5C03] hover:bg-[#EC4001] rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>১-ক্লিক ইনস্ট্যান্ট ওয়ালেট রিফান্ড</span>
                    </button>

                    <button
                      onClick={() => handleOpenModal("MANUAL", req)}
                      className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                    >
                      ম্যানুয়াল MFS পে-আউট
                    </button>

                    <button
                      onClick={() => handleOpenModal("APPROVE", req)}
                      className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200 cursor-pointer"
                    >
                      অনুমোদন
                    </button>

                    <button
                      onClick={() => handleOpenModal("REJECT", req)}
                      className="px-3.5 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition border border-red-200 cursor-pointer"
                    >
                      প্রত্যাখ্যান
                    </button>
                  </>
                ) : req.status === "APPROVED" ? (
                  <button
                    onClick={() => handleOpenModal("MANUAL", req)}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    পে-আউট সম্পন্ন করুন
                  </button>
                ) : (
                  <div className="text-xs font-bold text-slate-500 bg-slate-100 px-4 py-2 rounded-xl">
                    স্ট্যাটাস: {req.status}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation & Processing Modal */}
      {actionModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-slate-100 space-y-5 relative">
            <button
              onClick={() => setActionModal(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-900">
              {actionModal === "WALLET" && "ইনস্ট্যান্ট ওয়ালেট রিফান্ড নিশ্চিতকরণ"}
              {actionModal === "MANUAL" && "ম্যানুয়াল MFS রিফান্ড প্রসেস"}
              {actionModal === "APPROVE" && "রিফান্ড রিকোয়েস্ট অনুমোদন"}
              {actionModal === "REJECT" && "রিফান্ড রিকোয়েস্ট প্রত্যাখ্যান"}
            </h3>

            <div className="space-y-4">
              {actionModal === "WALLET" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed font-medium">
                    আপনি কি নিশ্চিত যে আপনি <b>৳{selectedRequest.requestedAmountBDT}</b> সরাসরি কাস্টমারের ওয়ালেটে জমা করতে চান? এটি সাথে সাথে ব্যালেন্স আপডেট করবে।
                  </p>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">অনুমোদিত টাকা (BDT):</label>
                    <input
                      type="number"
                      value={modalAmount}
                      onChange={(e) => setModalAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}

              {actionModal === "MANUAL" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">MFS Transaction ID (TrxID) *</label>
                    <input
                      type="text"
                      value={modalPayoutTrxId}
                      onChange={(e) => setModalPayoutTrxId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                      placeholder="e.g. 9K2848194X"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">প্রেরক নাম্বার / গেটওয়ে রেফারেন্স</label>
                    <input
                      type="text"
                      value={modalGatewayRef}
                      onChange={(e) => setModalGatewayRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                      placeholder="e.g. 017XXXXXXXX"
                    />
                  </div>
                </div>
              )}

              {actionModal === "REJECT" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">প্রত্যাখ্যানের কারণ (কাস্টমারকে জানানো হবে) *</label>
                  <textarea
                    value={modalCustomerMessage}
                    onChange={(e) => setModalCustomerMessage(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                    rows={3}
                    placeholder="কেন রিফান্ড বাতিল করা হয়েছে তা ব্যাখ্যা করুন..."
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">অভ্যন্তরীণ এডমিন নোট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={modalAdminNotes}
                  onChange={(e) => setModalAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  placeholder="অভ্যন্তরীণ অডিট মেমো..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActionModal(null)}
                disabled={submitting}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                onClick={handleAction}
                disabled={submitting}
                className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl transition shadow-xs cursor-pointer ${
                  actionModal === "REJECT"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#FC5C03] hover:bg-[#EC4001]"
                }`}
              >
                {submitting ? "প্রসেসিং..." : "নিশ্চিত করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
