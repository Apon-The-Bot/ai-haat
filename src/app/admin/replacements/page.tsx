"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Clock,
  ShieldAlert,
  X,
  User,
  Mail,
  Phone,
} from "lucide-react";

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
    { label: "সকল রিকোয়েস্ট (All)", value: "ALL" },
    { label: "পেন্ডিং (Requested)", value: "REQUESTED" },
    { label: "রিভিউতে আছে (Under Review)", value: "UNDER_REVIEW" },
    { label: "সম্পন্ন (Completed)", value: "FULFILLED" },
    { label: "বাতিলকৃত (Rejected)", value: "REJECTED" },
  ];

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/replacements");
      const data = await res.json();

      if (res.ok && data.success) {
        setRequests(Array.isArray(data.requests) ? data.requests : []);
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
    <div className="space-y-6 max-w-7xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Warranty Assurance Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            রিপ্লেসমেন্ট হাব (Replacements Hub)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            কাস্টমার ওয়ারেন্টি ক্লেইম পর্যালোচনা করুন এবং অটোমেটেড বা ম্যানুয়াল রিপ্লেসমেন্ট স্টক ডিসপ্যাচ করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchRequests()}
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
            Pending Replacements
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{kpis.pending}</span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-md">অপেক্ষমান</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Completed Replacements
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{kpis.completed}</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">সফলভাবে সম্পন্ন</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            Rejected Claims
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{kpis.rejected}</span>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-md">বাতিলকৃত</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            Replacement Rate
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{kpis.replacementRate}%</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">সাকসেস রেট</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="অর্ডার নম্বর, ইমেইল, প্রোডাক্ট সার্চ..."
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
          <p className="text-sm font-bold text-slate-800">রিপ্লেসমেন্ট ডেটা লোড হচ্ছে...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-700 bg-red-50 rounded-3xl border border-red-200">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
          <h3 className="text-base font-bold text-slate-900">কোন রিপ্লেসমেন্ট রিকোয়েস্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-500">এই ফিল্টারে বর্তমানে কোনো রিকোয়েস্ট নেই।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:border-[#FC5C03]/40 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-xl">
                    #{req.orderNumber}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                      req.status === "FULFILLED" || req.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : req.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {req.status}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                      req.isWarrantyValid
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {req.isWarrantyValid ? "Warranty Valid" : "Warranty Expired"}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  রিকোয়েস্ট তারিখ: {req.createdAt ? new Date(req.createdAt).toLocaleDateString("bn-BD") : "—"}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Customer Details */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">কাস্টমার তথ্য</span>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.customerName}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.customerEmail}</span>
                  </div>
                  {req.customerPhone && (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.customerPhone}</span>
                    </div>
                  )}
                </div>

                {/* Product & Warranty */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">প্রোডাক্ট ও ডেলিভারি</span>
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {req.productName}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    ভ্যারিয়েশন: {req.variationName || "Standard"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    মেয়াদ শেষ: <b className="text-slate-700">{req.warrantyExpiresAt || "—"}</b>
                  </div>
                </div>

                {/* Claim Reason */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">সমস্যার বিবরণ</span>
                  <div className="font-bold text-xs text-[#FC5C03]">{req.reason}</div>
                  <p className="text-xs text-slate-600 italic line-clamp-2">
                    "{req.description || "কোনো অতিরিক্ত বর্ণনা নেই"}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-1">
                {req.status === "REQUESTED" || req.status === "UNDER_REVIEW" ? (
                  <>
                    <button
                      onClick={() => handleOpenModal("REJECT", req)}
                      className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition border border-red-200 cursor-pointer"
                    >
                      প্রত্যাখ্যান করুন (Reject)
                    </button>

                    {req.isWarrantyValid ? (
                      <button
                        onClick={() => handleOpenModal("AUTO_DISPATCH", req)}
                        className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>অনুমোদন ও নতুন স্টক ডিসপ্যাচ</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenModal("WARRANTY_OVERRIDE", req)}
                        className="px-5 py-2 text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>ওয়ারেন্টি ওভাররাইড ও ডিসপ্যাচ</span>
                      </button>
                    )}
                  </>
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

      {/* Confirmation Modal */}
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
              {actionModal === "AUTO_DISPATCH" && "অনুমোদন ও ডিজিটাল স্টক ডিসপ্যাচ"}
              {actionModal === "WARRANTY_OVERRIDE" && "ওয়ারেন্টি ওভাররাইড অনুমোদন"}
              {actionModal === "REJECT" && "রিপ্লেসমেন্ট ক্লেইম প্রত্যাখ্যান"}
            </h3>

            <div className="space-y-4">
              {actionModal === "AUTO_DISPATCH" && (
                <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  ইনভেন্টরি পুল থেকে স্বয়ংক্রিয়ভাবে একটি বৈধ স্টক আইটেম <b>{selectedRequest.customerName}</b> এর ডিজিটাল ভল্টে যুক্ত হবে।
                </p>
              )}

              {actionModal === "WARRANTY_OVERRIDE" && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-800">
                    সতর্কতা: এই আইটেমের অফিসিয়াল ওয়ারেন্টি মেয়াদ শেষ। এটি অনুমোদন করতে এডমিন ওভাররাইডের কারণ উল্লেখ করতে হবে।
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">ওভাররাইডের কারণ *</label>
                    <input
                      type="text"
                      value={adminOverrideReason}
                      onChange={(e) => setAdminOverrideReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                      placeholder="e.g. লয়াল কাস্টমার খাতিরে বিশেষ অনুমোদন"
                      required
                    />
                  </div>
                </div>
              )}

              {actionModal === "REJECT" && (
                <p className="text-xs text-slate-600 bg-red-50 p-3.5 rounded-xl border border-red-100 font-medium">
                  আপনি কি নিশ্চিত যে আপনি এই রিপ্লেসমেন্ট রিকোয়েস্টটি প্রত্যাখ্যান করতে চান?
                </p>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">অভ্যন্তরীণ এডমিন নোট (ঐচ্ছিক)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                  rows={3}
                  placeholder="এডমিন অডিট নোট লিখুন..."
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
