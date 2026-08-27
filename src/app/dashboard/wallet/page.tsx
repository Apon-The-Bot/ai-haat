"use client";

import React, { useState, useEffect } from "react";
import { Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, Copy, Check, X, Zap, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { PaymentLogo } from "@/components/PaymentLogo";

export default function DashboardWalletPage() {
  const { user, refreshUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isBn = language === "bn";

  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [topupTab, setTopupTab] = useState<"GATEWAY" | "MANUAL">("GATEWAY");
  const [method, setMethod] = useState("bkash");
  const [amount, setAmount] = useState("500");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const presetAmounts = ["100", "200", "500", "1000", "2000"];

  const paymentNumbers = {
    bkash: "017XXXXXXXX (Send Money / Personal)",
    nagad: "017XXXXXXXX (Send Money / Personal)",
    rocket: "017XXXXXXXX-4 (Send Money / Personal)",
    upay: "017XXXXXXXX (Send Money / Personal)",
  };

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

  const handleCopyNumber = () => {
    const num = paymentNumbers[method as keyof typeof paymentNumbers].split(" ")[0];
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // 1. Automated Gateway Top-up Flow
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
        showToast(data.error || "পেমেন্ট গেটওয়ে চালু করতে ব্যর্থ হয়েছে।", "error");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Top-up gateway redirect error:", err);
      showToast("গেটওয়ে সংযোগ ব্যর্থ হয়েছে।", "error");
      setIsSubmitting(false);
    }
  };

  // 2. Manual TrxID Submission Flow
  const handleSubmitManualRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !trxId) {
      showToast(isBn ? "দয়া করে টাকার পরিমাণ এবং TrxID প্রদান করুন।" : "Please provide amount and TrxID.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/wallet/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user?.name || "Customer",
          userPhone: senderNumber || user?.phone || "",
          userEmail: user?.email || "",
          amountBDT: Number(amount),
          method,
          senderNumber,
          trxId,
        }),
      });

      if (res.ok) {
        showToast(
          isBn
            ? "রিচার্জ রিকোয়েস্ট জমা হয়েছে! এডমিন যাচাই করে ব্যালেন্স যোগ করবেন।"
            : "Top-up request submitted! Admin will verify and credit your balance shortly.",
          "success"
        );
        setIsRechargeModalOpen(false);
        setTrxId("");
        setSenderNumber("");
        fetchTransactions();
      } else {
        showToast(isBn ? "রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।" : "Failed to submit request.", "error");
      }
    } catch {
      showToast(isBn ? "সার্ভার ত্রুটি। আবার চেষ্টা করুন।" : "Server error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Wallet Balance Hero Card */}
      <div className="bg-gradient-to-br from-[#1A1D26] via-[#232733] to-[#15171E] rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Wallet className="w-3.5 h-3.5 text-[#FC5C03]" />
            <span>{isBn ? "ডিজিটাল ওয়ালেট ব্যালেন্স" : "Digital Wallet Balance"}</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            {formatPrice(user?.walletBalanceBDT || 0)}
          </div>
          <p className="text-xs text-gray-300 mt-2 max-w-md leading-relaxed">
            {isBn
              ? "ওয়ালেটে ব্যালেন্স থাকলে যেকোনো সময় ১-ক্লিকে ইনস্ট্যান্ট সাবস্ক্রিপশন অর্ডার সম্পন্ন করতে পারবেন।"
              : "Enjoy instant 1-click checkout for all digital subscriptions using wallet funds."}
          </p>
        </div>

        <button
          onClick={() => setIsRechargeModalOpen(true)}
          className="px-6 py-3.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isBn ? "টাকা রিচার্জ করুন" : "Top Up Wallet"}</span>
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-[#1A1D26]">
              {isBn ? "লেনদেনের ইতিহাস" : "Recent Transactions"}
            </h3>
            <p className="text-xs text-gray-400">
              {isBn ? "আপনার ওয়ালেটের সকল ডিপোজিট ও কেনাকাটার তালিকা" : "All wallet deposits and purchase history."}
            </p>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3 divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      tx.type === "DEPOSIT"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-red-50 text-red-600 border border-red-100"
                    }`}
                  >
                    {tx.type === "DEPOSIT" ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1D26]">
                      {tx.type === "DEPOSIT"
                        ? isBn
                          ? "ওয়ালেট রিচার্জ (Deposit)"
                          : "Wallet Top-up"
                        : isBn
                        ? "প্রোডাক্ট ক্রয় (Purchase)"
                        : "Product Purchase"}
                    </h4>
                    <span className="text-[10.5px] text-gray-400 block font-mono">
                      {tx.date} • TrxID: {tx.trxId}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-black ${
                      tx.type === "DEPOSIT" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "DEPOSIT" ? "+" : "-"}
                    {formatPrice(tx.amountBDT)}
                  </div>
                  <span
                    className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      tx.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : tx.status === "PENDING"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 space-y-2">
            <Wallet className="w-10 h-10 mx-auto text-gray-300" />
            <p className="text-xs font-bold text-gray-600">
              {isBn ? "এখনো কোনো লেনদেন হয়নি" : "No transactions found"}
            </p>
            <p className="text-[11px] text-gray-400">
              {isBn
                ? "টাকা রিচার্জ করলে বা অর্ডার করলে এখানে হিস্ট্রি দেখতে পাবেন।"
                : "Top up your wallet to start purchasing subscriptions instantly."}
            </p>
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FC5C03] flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-[#1A1D26]">
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

            {/* Top-up Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setTopupTab("GATEWAY")}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  topupTab === "GATEWAY"
                    ? "bg-white text-[#FC5C03] shadow-xs"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isBn ? "ইনস্ট্যান্ট গেটওয়ে" : "Instant Gateway"}</span>
              </button>
              <button
                type="button"
                onClick={() => setTopupTab("MANUAL")}
                className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  topupTab === "MANUAL"
                    ? "bg-white text-[#FC5C03] shadow-xs"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{isBn ? "ম্যানুয়াল Send Money" : "Manual Send Money"}</span>
              </button>
            </div>

            {/* Amount Selection */}
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
              <div className="flex gap-2 flex-wrap pt-1">
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

            {/* TAB 1: AUTOMATED GATEWAY */}
            {topupTab === "GATEWAY" && (
              <form onSubmit={handleGatewayTopup} className="space-y-4 pt-2 border-t border-slate-100">
                <div className="bg-[#FFF9F5] rounded-2xl p-4 border border-[#FFE4D6] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FC5C03]">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>১০০% অটোমেটিক ও ইনস্ট্যান্ট ব্যালেন্স যোগ</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    নিচের বাটনে ক্লিক করলে বিকাশ, নগদ, রকেট, উপায় বা কার্ড দিয়ে পেমেন্ট করার সরাসরি গেটওয়ে আসবে। পেমেন্ট সফল হলে আপনার একাউন্টে <b>স্বয়ংক্রিয়ভাবে</b> ব্যালেন্স যোগ হয়ে যাবে।
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  <span>{isBn ? `৳${amount || 0} পেমেন্ট গেটওয়েতে রিচার্জ করুন` : `Pay ৳${amount || 0} via Gateway`}</span>
                </button>
              </form>
            )}

            {/* TAB 2: MANUAL SEND MONEY */}
            {topupTab === "MANUAL" && (
              <form onSubmit={handleSubmitManualRecharge} className="space-y-4 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-4 gap-2">
                  {(["bkash", "nagad", "rocket", "upay"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        method === m
                          ? "border-[#FC5C03] bg-[#FFF2E8]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <PaymentLogo method={m} width={48} height={20} />
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">প্রাপক নম্বর (Send Money):</span>
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      className="text-[#FC5C03] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {copiedNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedNumber ? "কপি হয়েছে!" : "কপি করুন"}</span>
                    </button>
                  </div>
                  <div className="font-mono font-bold text-[#1A1D26] text-xs">
                    {paymentNumbers[method as keyof typeof paymentNumbers]}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                      {isBn ? "প্রেরক নম্বর (Sender Number) *" : "Sender Phone Number *"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-xs p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#FC5C03]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                      {isBn ? "ট্রানজেকশন আইডি (TrxID) *" : "Transaction ID (TrxID) *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g. BL9A8K72"
                      className="w-full text-xs p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#FC5C03]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{isBn ? "রিকোয়েস্ট জমা দিন" : "Submit Request"}</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
