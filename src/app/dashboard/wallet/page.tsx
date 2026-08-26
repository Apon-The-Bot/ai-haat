"use client";

import React, { useState } from "react";
import { Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, Copy, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";

export default function DashboardWalletPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isBn = language === "bn";

  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [method, setMethod] = useState("bkash");
  const [amount, setAmount] = useState("500");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const paymentNumbers = {
    bkash: "01712-345678 (Send Money / Personal)",
    nagad: "01823-456789 (Send Money / Personal)",
    rocket: "01934-567890-4 (Send Money / Personal)",
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

  const handleCopyNumber = () => {
    const num = paymentNumbers[method as keyof typeof paymentNumbers].split(" ")[0];
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmitRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !trxId) {
      showToast(isBn ? "দয়া করে টাকার পরিমাণ এবং TrxID প্রদান করুন।" : "Please provide amount and TrxID.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/wallet/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user?.name || "",
          userPhone: senderNumber || "",
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
      <div className="bg-gradient-to-br from-[#1A1D26] via-[#232733] to-[#15171E] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">
            {isBn ? "ডিজিটাল ওয়ালেট ব্যালেন্স" : "Digital Wallet Balance"}
          </span>
          <div className="text-3xl sm:text-4xl font-black text-white mt-1">
            {formatPrice(user?.walletBalanceBDT || 0)}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {isBn
              ? "ওয়ালেটে ব্যালেন্স থাকলে যেকোনো সময় ১-ক্লিকে ইনস্ট্যান্ট অর্ডার সম্পন্ন করতে পারবেন।"
              : "Enjoy instant 1-click checkout for all digital subscriptions using wallet funds."}
          </p>
        </div>

        <button
          onClick={() => setIsRechargeModalOpen(true)}
          className="px-6 py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isBn ? "টাকা রিচার্জ করুন" : "Top Up Wallet"}</span>
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-[#1A1D26]">
            {isBn ? "লেনদেনের ইতিহাস" : "Recent Transactions"}
          </h3>
          <span className="text-xs text-gray-400">
            {isBn ? "সর্বশেষ লেনদেন" : "Latest activity"}
          </span>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3 divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === "DEPOSIT"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
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
                        ? isBn ? `ওয়ালেট রিচার্জ (${tx.method})` : `Wallet Deposit (${tx.method})`
                        : isBn ? "প্রোডাক্ট ক্রয়" : "Product Purchase"}
                    </h4>
                    <div className="flex items-center gap-2 text-[10.5px] text-[#7A8190]">
                      <span>TrxID: <code>{tx.trxId}</code></span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-black block ${
                      tx.type === "DEPOSIT" ? "text-emerald-600" : "text-[#1A1D26]"
                    }`}
                  >
                    {tx.type === "DEPOSIT" ? `+${formatPrice(tx.amountBDT)}` : `-${formatPrice(tx.amountBDT)}`}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-600 mb-0.5">{isBn ? "এখনো কোনো ট্রানজেকশন নেই" : "No Transactions Yet"}</p>
            <p>{isBn ? "ওয়ালেট রিচার্জ বা পারচেজ হিস্টোরি এখানে দেখতে পাবেন।" : "Wallet deposit and purchase history will appear here."}</p>
          </div>
        )}
      </div>

      {/* Top-up Recharge Modal */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#1A1D26]">
                {isBn ? "ওয়ালেট রিচার্জ (Top Up)" : "Top Up Wallet"}
              </h3>
              <button
                onClick={() => setIsRechargeModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRecharge} className="space-y-4">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D26] mb-1.5">
                  {isBn ? "পেমেন্ট মাধ্যম সিলেক্ট করুন" : "Select Payment Method"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["bkash", "nagad", "rocket"].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                        method === m
                          ? "border-[#FC5C03] bg-[#FFF2E8] text-[#FC5C03]"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Copy Box */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block">
                    {method.toUpperCase()} {isBn ? "নাম্বার (Send Money)" : "Number (Send Money)"}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1A1D26]">
                    {paymentNumbers[method as keyof typeof paymentNumbers]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#FC5C03] hover:bg-[#FFF2E8] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNumber ? (isBn ? "কপি হয়েছে" : "Copied") : (isBn ? "কপি" : "Copy")}</span>
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                  {isBn ? "টাকার পরিমাণ (BDT)" : "Amount (BDT)"}
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              {/* Sender Phone */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                  {isBn ? "আপনার বিকাশ/নগদ নাম্বার" : "Sender Phone Number"}
                </label>
                <input
                  type="text"
                  required
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              {/* TrxID */}
              <div>
                <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                  Transaction ID (TrxID) *
                </label>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g. BL90X84Q"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs uppercase font-mono focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSubmitting
                  ? isBn ? "প্রসেস হচ্ছে..." : "Submitting..."
                  : isBn ? "রিচার্জ রিকোয়েস্ট পাঠান" : "Submit Top-Up Request"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
