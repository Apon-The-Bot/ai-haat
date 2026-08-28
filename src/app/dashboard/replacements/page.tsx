"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RotateCcw,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  KeyRound,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ReplacementClaim {
  id: string;
  orderNumber: string;
  productName: string;
  accountType: string;
  originalDeliveryId: string;
  replacementDeliveryId?: string | null;
  reason: string;
  description: string;
  status: "REQUESTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "COMPLETED";
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function CustomerReplacementsPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [claims, setClaims] = useState<ReplacementClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/replacements/request");
      if (res.ok) {
        const data = await res.json();
        if (data.requests) {
          setClaims(data.requests);
        }
      }
    } catch (err) {
      console.error("Failed to load claims:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "APPROVED":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          label: isBn ? "সম্পন্ন (Replaced)" : "Completed",
        };
      case "UNDER_REVIEW":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Clock,
          label: isBn ? "যাচাই করা হচ্ছে" : "Under Review",
        };
      case "REJECTED":
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
          label: isBn ? "বাতিল (Rejected)" : "Rejected",
        };
      default:
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Clock,
          label: isBn ? "জমা হয়েছে (Requested)" : "Requested",
        };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-7 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-purple-200">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isBn ? "ওয়ারেন্টি ও সাপোর্ট" : "Warranty Protection"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1A1D26] tracking-tight">
            {isBn ? "রিপ্লেসমেন্ট ক্লেইমস ও হিস্টোরি" : "Replacement Claims"}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A8190] mt-0.5">
            {isBn
              ? "আপনার সাবমিট করা ওয়ারেন্টি রিপ্লেসমেন্ট রিকোয়েস্টের লাইভ স্ট্যাটাস ও আপডেট।"
              : "Track live status and review admin resolutions for all submitted replacement claims."}
          </p>
        </div>

        <button
          onClick={fetchClaims}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      {/* Claims List */}
      {claims.length > 0 ? (
        <div className="space-y-4">
          {claims.map((claim) => {
            const badge = getStatusBadge(claim.status);
            const Icon = badge.icon;

            return (
              <div
                key={claim.id}
                className="bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4 hover:border-[#FC5C03]/40 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-slate-900">
                      Order #{claim.orderNumber}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium font-mono">
                      Claimed: {new Date(claim.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border ${badge.bg}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Claim details */}
                <div className="space-y-2">
                  <h4 className="text-base font-black text-slate-900">
                    {claim.productName} ({claim.accountType})
                  </h4>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <span>Reason:</span>
                      <span className="font-mono text-[#FC5C03]">{claim.reason}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed italic">
                      &ldquo;{claim.description}&rdquo;
                    </p>
                  </div>

                  {/* Admin Resolution Note */}
                  {claim.adminNotes && (
                    <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Resolution / Admin Response:</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{claim.adminNotes}</p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    {claim.status === "COMPLETED" ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" />
                        <span>New credentials dispatched to your Digital Vault!</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Our support team is reviewing your claim.</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/dashboard/keys"
                      className="px-4 py-2 bg-slate-100 hover:bg-[#FFF2E8] text-slate-700 hover:text-[#FC5C03] font-bold rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{isBn ? "ভল্ট দেখুন" : "View Digital Vault"}</span>
                    </Link>

                    <Link
                      href={`https://wa.me/8801700000000?text=${encodeURIComponent(`Hello, I need an update regarding my replacement claim for Order #${claim.orderNumber}`)}`}
                      target="_blank"
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-1"
                    >
                      <span>WhatsApp Support</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8 shadow-2xs max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
            <RotateCcw className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">
              {isBn ? "কোনো রিপ্লেসমেন্ট ক্লেইম নেই" : "No Replacement Claims"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {isBn
                ? "আপনার কোনো কেনা প্রোডাক্টে সমস্যা হলে ডিজিটাল ভল্ট থেকে সরাসরি ১-ক্লিকে রিপ্লেসমেন্ট ক্লেইম করতে পারবেন।"
                : "If you ever experience issues with purchased digital subscriptions, claim full replacement warranty directly from your Digital Vault."}
            </p>
          </div>
          <Link
            href="/dashboard/keys"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <span>{isBn ? "ভল্ট ওপেন করুন" : "Open Digital Vault"}</span>
          </Link>
        </div>
      )}

      {/* Warranty Policy Explanation Card */}
      <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <strong className="text-slate-900 font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#FC5C03]" />
          <span>100% Replacement Warranty Guarantee</span>
        </strong>
        <p className="leading-relaxed">
          Every digital product purchased on AI Haat is backed by full validity replacement warranty. If credentials stop working, or your license expires prematurely, submit a claim and our operations team will inspect and issue fresh replacement credentials from our encrypted stock pools.
        </p>
      </div>

    </div>
  );
}
