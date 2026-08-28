"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Banknote,
  RefreshCw,
  Search,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";

interface RefundRequest {
  id: string;
  orderId: string;
  orderItemId: string;
  productName: string;
  variationName: string;
  image?: string;
  requestedAmount: number;
  approvedAmount?: number | null;
  status: "REQUESTED" | "UNDER_REVIEW" | "APPROVED" | "REFUNDED" | "REJECTED";
  payoutMethod: string;
  payoutAccount?: string;
  transactionId?: string | null;
  reason: string;
  description: string;
  adminNote?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export default function RefundsPage() {
  const { language } = useLanguage();
  const { formatPrice } = useCurrency();
  const isBn = language === "bn";

  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

  const fetchRefunds = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/refunds/request");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.refunds) {
          setRefunds(data.refunds);
        }
      }
    } catch (error) {
      console.error("Failed to load refund requests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  // Derived stats
  const totalRequests = refunds.length;
  const approvedCount = refunds.filter((r) => r.status === "APPROVED" || r.status === "REFUNDED").length;
  const pendingCount = refunds.filter((r) => r.status === "REQUESTED" || r.status === "UNDER_REVIEW").length;

  const filteredRefunds = refunds.filter((r) => {
    const matchesSearch =
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.orderId.toLowerCase().includes(search.toLowerCase());

    if (filter === "PENDING") {
      return matchesSearch && (r.status === "REQUESTED" || r.status === "UNDER_REVIEW");
    }
    if (filter === "COMPLETED") {
      return matchesSearch && (r.status === "APPROVED" || r.status === "REFUNDED" || r.status === "REJECTED");
    }
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return {
          label: isBn ? "রিকোয়েস্ট করা হয়েছে" : "Requested",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
        };
      case "UNDER_REVIEW":
        return {
          label: isBn ? "রিভিউ চলছে" : "Under Review",
          className: "bg-blue-50 text-blue-700 border-blue-200",
          icon: AlertCircle,
        };
      case "APPROVED":
        return {
          label: isBn ? "অনুমোদিত" : "Approved",
          className: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: CheckCircle2,
        };
      case "REFUNDED":
        return {
          label: isBn ? "রিফান্ড সম্পন্ন" : "Refunded",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
        };
      case "REJECTED":
        return {
          label: isBn ? "বাতিল" : "Rejected",
          className: "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          className: "bg-slate-50 text-slate-700 border-slate-200",
          icon: ShieldAlert,
        };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-7 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-red-200">
            <Banknote className="w-3.5 h-3.5" />
            <span>{isBn ? "রিফান্ড সেন্টার" : "Refund Center"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1A1D26] tracking-tight">
            {isBn ? "আমার রিফান্ড রিকোয়েস্ট" : "My Refund Requests"}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A8190] mt-0.5">
            {isBn
              ? "আপনার সমস্ত রিফান্ড রিকোয়েস্ট ট্র্যাক করুন।"
              : "Track the status of your refund claims."}
          </p>
        </div>

        <button
          onClick={fetchRefunds}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E8EE] shadow-2xs">
          <div className="text-[#7A8190] text-xs font-bold mb-1">{isBn ? "মোট রিকোয়েস্ট" : "Total Requests"}</div>
          <div className="text-2xl font-black text-slate-900">{totalRequests}</div>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-2xs">
          <div className="text-emerald-700 text-xs font-bold mb-1">{isBn ? "অনুমোদিত / রিফান্ডেড" : "Approved / Refunded"}</div>
          <div className="text-2xl font-black text-emerald-900">{approvedCount}</div>
        </div>
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-2xs">
          <div className="text-amber-700 text-xs font-bold mb-1">{isBn ? "রিভিউর অপেক্ষায়" : "Pending Review"}</div>
          <div className="text-2xl font-black text-amber-900">{pendingCount}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-[#E8E8EE] p-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#7A8190] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isBn ? "অর্ডার আইডি দিয়ে খুঁজুন..." : "Search by order ID..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#FC5C03]"
          />
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {[
            { id: "ALL", label: isBn ? "সকল" : "All" },
            { id: "PENDING", label: isBn ? "পেন্ডিং" : "Pending" },
            { id: "COMPLETED", label: isBn ? "সম্পন্ন" : "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-[#1A1D26] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Refund List */}
      {filteredRefunds.length > 0 ? (
        <div className="space-y-4">
          {filteredRefunds.map((refund) => {
            const statusInfo = getStatusBadge(refund.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div
                key={refund.id}
                className="bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    {refund.image && (
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 hidden sm:block">
                        <SafeImage src={refund.image} alt={refund.productName} aspectRatio="1/1" objectFit="contain" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/dashboard/orders?orderId=${refund.orderId}`}
                          className="font-mono text-xs font-bold text-[#FC5C03] hover:underline"
                        >
                          #{refund.orderId}
                        </Link>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border flex items-center gap-1 ${statusInfo.className}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900">
                        {refund.productName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {refund.variationName}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-xs space-y-1">
                    <div className="text-slate-500 font-mono">
                      {isBn ? "তারিখ:" : "Requested:"} {new Date(refund.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">{isBn ? "রিকোয়েস্ট এমাউন্ট:" : "Requested Amount:"}</span>
                      <span className="font-black text-slate-900">{formatPrice(refund.requestedAmount)}</span>
                    </div>
                    {refund.approvedAmount != null && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-emerald-600 font-bold">{isBn ? "অনুমোদিত এমাউন্ট:" : "Approved Amount:"}</span>
                        <span className="font-black text-emerald-700">{formatPrice(refund.approvedAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200">
                      <span className="text-slate-500 font-bold">{isBn ? "মেথড:" : "Payout Method:"}</span>
                      <span className="font-mono font-medium text-slate-900">
                        {refund.payoutMethod} {refund.payoutAccount && `(${refund.payoutAccount})`}
                      </span>
                    </div>
                    {refund.transactionId && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold">{isBn ? "TrxID:" : "TrxID:"}</span>
                        <span className="font-mono font-medium text-emerald-600">{refund.transactionId}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="text-xs">
                      <span className="text-slate-500 font-bold block mb-1">Customer Reason:</span>
                      <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold mb-1">
                        {refund.reason}
                      </span>
                      <p className="text-slate-700 italic border-l-2 border-slate-300 pl-2">
                        "{refund.description}"
                      </p>
                    </div>
                    
                    {refund.adminNote && (
                      <div className="text-xs pt-2 border-t border-slate-200">
                        <span className="text-indigo-600 font-bold block mb-1">Admin Resolution Note:</span>
                        <p className="text-slate-800">
                          {refund.adminNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end border-t border-slate-100">
                  <Link
                    href={`https://wa.me/8801700000000?text=${encodeURIComponent(`Hello, I need assistance with my refund request for Order #${refund.orderId}`)}`}
                    target="_blank"
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Support</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-4 shadow-2xs">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Banknote className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">
              {isBn ? "কোনো রিফান্ড রিকোয়েস্ট নেই" : "No Refund Requests"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isBn
                ? "আপনার কোনো রিফান্ড রিকোয়েস্ট পাওয়া যায়নি।"
                : "You don't have any refund requests yet."}
            </p>
          </div>
          <Link
            href="/dashboard/keys"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <span>{isBn ? "ডিজিটাল ভল্ট দেখুন" : "View Digital Vault"}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
