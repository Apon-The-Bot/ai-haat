"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, X, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";

export default function DashboardWalletPage() {
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isBn = language === "bn";

  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [amount, setAmount] = useState("500");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetAmounts = ["100", "200", "500", "1000", "2000"];

  const [transactions, setTransactions] = useState<Array<{
    id: string;
    type: string;
    amountBDT: number;
    method: string;
    trxId: string;
    status: string;
    date: string;
  }>>([]);

  const fetchTransactions = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch(`/api/wallet/transactions?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.transactions) {
          setTransactions(data.transactions);
        }
      }
    } catch (e) {
      console.debug("Fetch wallet txs error:", e);
    }
  };

  useEffect(() => {
    fetchTransactions();
    refreshUser();
    const interval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(interval);
  }, [user?.email, refreshUser]);

  // Handle return status from payment gateway
  useEffect(() => {
    const topupStatus = searchParams.get("topup");
    const topupAmount = searchParams.get("amount");

    if (topupStatus === "success") {
      refreshUser();
      fetchTransactions();
      showToast(
        isBn
          ? `৳${topupAmount || ""} ওয়ালেটে সফলভাবে যোগ হয়েছে!`
          : `৳${topupAmount || ""} successfully added to your wallet!`,
        "success"
      );
    } else if (topupStatus === "cancelled") {
      showToast(
        isBn ? "পেমেন্ট বাতিল করা হয়েছে।" : "Payment was cancelled.",
        "info"
      );
    } else if (topupStatus === "failed") {
      showToast(
        isBn ? "পেমেন্ট ব্যর্থ হয়েছে।" : "Payment failed. Please try again.",
        "error"
      );
    }
  }, [searchParams]);

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
    <div className="space-y-6">
      
      {/* Wallet Balance Hero Card */}
      <div className="p-6 sm:p-8 bg-[#1A1D26] rounded-2xl text-white shadow-xs border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#FC5C03] bg-[#FC5C03]/10 px-2 py-0.5 rounded-md">
              Digital Wallet Balance
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {formatPrice(user?.walletBalanceBDT || 0)}
          </div>
          <p className="text-xs text-gray-400">
            {isBn
              ? "যেকোনো ডিজিটাল সাবস্ক্রিপশন কিনতে ইনস্ট্যান্ট ১-ক্লিক পেমেন্ট করুন।"
              : "Enjoy instant 1-click checkout for all digital subscriptions using wallet funds."}
          </p>
        </div>

        <button
          onClick={() => setIsRechargeModalOpen(true)}
          className="px-6 py-3.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isBn ? "টাকা যোগ করুন" : "Top Up Wallet"}</span>
        </button>
      </div>

      {/* Transactions History Table */}
      <div className="bg-white rounded-2xl border border-[#E8E8EE] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1A1D26]">
              {isBn ? "সাম্প্রতিক লেনদেনসমূহ" : "Recent Transactions"}
            </h3>
            <p className="text-xs text-[#7A8190]">
              {isBn ? "ওয়ালেট রিচার্জ ও পার্চেজ হিস্টোরি।" : "All wallet deposits and purchase history."}
            </p>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === "DEPOSIT"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {tx.type === "DEPOSIT" ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#1A1D26] block">
                      {tx.type === "DEPOSIT"
                        ? isBn
                          ? "ওয়ালেট রিচার্জ (Deposit)"
                          : "Wallet Top-up"
                        : isBn
                        ? "প্রোডাক্ট কেনাকাটা (Purchase)"
                        : "Product Purchase"}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      {tx.method.toUpperCase()} • {tx.trxId} • {tx.date}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs sm:text-sm font-black block ${
                      tx.type === "DEPOSIT" ? "text-emerald-600" : "text-slate-900"
                    }`}
                  >
                    {tx.type === "DEPOSIT" ? "+" : "-"}
                    {formatPrice(tx.amountBDT)}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      tx.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700"
                        : tx.status === "REJECTED"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400 space-y-2">
            <Wallet className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs font-medium text-gray-500">
              {isBn ? "এখনো কোনো লেনদেন হয়নি" : "No transactions found"}
            </p>
            <p className="text-[11px] text-gray-400">
              {isBn
                ? "ওয়ালেটে টাকা যোগ করে দ্রুত সাবস্ক্রিপশন কেনাকাটা শুরু করুন।"
                : "Top up your wallet to start purchasing subscriptions instantly."}
            </p>
          </div>
        )}
      </div>

      {/* TOP-UP MODAL (Super Clean & Minimalist) */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FC5C03] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#1A1D26]">
                  {isBn ? "ওয়ালেট রিচার্জ করুন" : "Add Funds to Wallet"}
                </h3>
              </div>
              <button
                onClick={() => setIsRechargeModalOpen(false)}
                className="text-gray-400 hover:text-black p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleGatewayTopup} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1A1D26]">
                  {isBn ? "টাকার পরিমাণ (BDT) *" : "Enter Amount (BDT) *"}
                </label>
                <input
                  type="number"
                  min="10"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full text-base font-bold p-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-hidden focus:border-[#FC5C03]"
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
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
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
