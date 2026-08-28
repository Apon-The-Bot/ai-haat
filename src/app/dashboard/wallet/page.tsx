"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, X, Zap, RefreshCw, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";

function WalletContent() {
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isBn = language === "bn";

  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [amount, setAmount] = useState("500");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const presetAmounts = ["100", "200", "500", "1000", "2000"];

  const [transactions, setTransactions] = useState<
    Array<{
      id: string;
      type: string;
      amountBDT: number;
      method: string;
      trxId: string;
      status: string;
      date: string;
      note?: string;
    }>
  >([]);

  const fetchTransactions = useCallback(async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await fetch("/api/wallet/transactions");
      if (res.ok) {
        const data = await res.json();
        if (data.transactions) {
          setTransactions(data.transactions);
        }
      }
    } catch (e) {
      console.debug("Fetch wallet txs error:", e);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchTransactions();
    refreshUser();
    // 30s background sync
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, [fetchTransactions, refreshUser]);

  // Handle return status from payment gateway
  useEffect(() => {
    const topupStatus = searchParams?.get("topup");
    const topupAmount = searchParams?.get("amount");

    if (topupStatus === "success") {
      refreshUser();
      fetchTransactions();
      showToast(
        isBn
          ? `৳${topupAmount || ""} ওয়ালেটে সফলভাবে যোগ হয়েছে!`
          : `৳${topupAmount || ""} successfully added to your wallet!`,
        "success"
      );
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    } else if (topupStatus === "cancelled") {
      showToast(
        isBn ? "পেমেন্ট বাতিল করা হয়েছে।" : "Payment was cancelled.",
        "info"
      );
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    } else if (topupStatus === "failed") {
      showToast(
        isBn ? "পেমেন্ট ব্যর্থ হয়েছে।" : "Payment failed. Please try again.",
        "error"
      );
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [searchParams, fetchTransactions, isBn, refreshUser, showToast]);

  // Direct Gateway Top-up
  const handleGatewayTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      showToast(isBn ? "সর্বনিম্ন ১০ টাকা রিচার্জ করা যাবে।" : "Minimum top-up is 10 BDT.", "error");
      return;
    }

    setIsSubmitting(true);
    const topupOrderId = `WT-${Date.now().toString().slice(-6)}`;

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: topupOrderId,
          amount: numAmount,
          customerName: user?.name || "Customer",
          customerEmail: user?.email || "",
          customerPhone: user?.phone || "",
          metadata: {
            type: "WALLET_TOPUP",
            userId: user?.id,
            email: user?.email,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.pp_url) {
        window.location.href = data.pp_url;
      } else {
        showToast(data.error || data.message || "পেমেন্ট গেটওয়ে চালু করতে ব্যর্থ হয়েছে।", "error");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Top-up gateway redirect error:", err);
      showToast("গেটওয়ে সংযোগ ব্যর্থ হয়েছে।", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Wallet Balance Hero Card */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#1A1D26] via-[#242938] to-[#1A1D26] rounded-3xl text-white shadow-xs border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#FC5C03] bg-[#FC5C03]/15 px-2.5 py-0.5 rounded-full border border-[#FC5C03]/30">
              Digital 1-Click Wallet
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {formatPrice(user?.walletBalanceBDT || 0)}
          </div>
          <p className="text-xs text-slate-300 max-w-md">
            {isBn
              ? "যেকোনো ডিজিটাল সাবস্ক্রিপশন কিনতে ইনস্ট্যান্ট ১-ক্লিক পেমেন্ট করুন। কোনো অতিরিক্ত ফি ছাড়াই।"
              : "Enjoy instant 1-click checkout for all digital software and subscriptions with zero payment fees."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={() => setIsRechargeModalOpen(true)}
            className="px-6 py-3.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isBn ? "টাকা যোগ করুন" : "Top Up Wallet"}</span>
          </button>

          <button
            onClick={() => {
              fetchTransactions();
              refreshUser();
            }}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors cursor-pointer"
            title="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Transactions History Table */}
      <div className="bg-white rounded-3xl border border-[#E8E8EE] shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">
              {isBn ? "লেনদেনের ইতিহাস" : "Transaction Ledger"}
            </h3>
            <p className="text-xs text-slate-500">
              {isBn ? "ওয়ালেট রিচার্জ, পার্চেজ ও রিফান্ড হিস্টোরি।" : "All deposits, purchases, and refund records."}
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-400">
            {transactions.length} records
          </span>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isDeposit = tx.type === "DEPOSIT";
              return (
                <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isDeposit
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                        {isDeposit
                          ? isBn
                            ? "ওয়ালেট রিচার্জ (Deposit)"
                            : "Wallet Top-up Deposit"
                          : isBn
                          ? "প্রোডাক্ট কেনাকাটা (Purchase)"
                          : "Product Purchase"}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {tx.method.toUpperCase()} • Ref: {tx.trxId} • {tx.date}
                      </span>
                      {tx.note && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">{tx.note}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-black block ${
                        isDeposit ? "text-emerald-600" : "text-slate-900"
                      }`}
                    >
                      {isDeposit ? "+" : "-"}
                      {formatPrice(tx.amountBDT)}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        tx.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : tx.status === "REJECTED"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Wallet className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {isBn ? "এখনো কোনো লেনদেন হয়নি" : "No Wallet Transactions Found"}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isBn
                ? "ওয়ালেটে টাকা যোগ করে দ্রুত সাবস্ক্রিপশন কেনাকাটা শুরু করুন।"
                : "Top up your wallet to start purchasing digital subscriptions instantly."}
            </p>
          </div>
        )}
      </div>

      {/* TOP-UP MODAL */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FC5C03] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {isBn ? "ওয়ালেট রিচার্জ করুন" : "Add Funds to Wallet"}
                </h3>
              </div>
              <button
                onClick={() => setIsRechargeModalOpen(false)}
                className="text-slate-400 hover:text-black p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGatewayTopup} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  {isBn ? "টাকার পরিমাণ (BDT) *" : "Enter Amount (BDT) *"}
                </label>
                <input
                  type="number"
                  min="10"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full text-base font-bold p-3 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-[#FC5C03]"
                />
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        amount === amt
                          ? "bg-[#FFF2E8] border-[#FC5C03] text-[#FC5C03]"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <span className="px-1.5 py-0.5 bg-pink-50 text-[#E2136E] border border-pink-200 text-[9.5px] font-bold rounded">bKash</span>
                <span className="px-1.5 py-0.5 bg-orange-50 text-[#F7941D] border border-orange-200 text-[9.5px] font-bold rounded">Nagad</span>
                <span className="px-1.5 py-0.5 bg-purple-50 text-[#8C3494] border border-purple-200 text-[9.5px] font-bold rounded">Rocket</span>
                <span className="px-1.5 py-0.5 bg-blue-50 text-[#002D62] border border-blue-200 text-[9.5px] font-bold rounded">Upay</span>
                <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 text-[9.5px] font-bold rounded">Cards</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span>{isBn ? `পেমেন্ট করুন (৳${amount || 0})` : `Pay ৳${amount || 0} via Gateway`}</span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardWalletPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading wallet...</div>}>
      <WalletContent />
    </Suspense>
  );
}
