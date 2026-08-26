"use client";

import React, { useState } from "react";
import { Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";

export default function DashboardWalletPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

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

  const transactions = [
    {
      id: "TX-901",
      type: "DEPOSIT",
      amountBDT: 500,
      method: "bKash",
      trxId: "BL90X84Q",
      status: "APPROVED",
      date: "2026-08-25 12:30",
    },
    {
      id: "TX-902",
      type: "PURCHASE",
      amountBDT: 290,
      method: "Wallet Payment",
      trxId: "AH-89211",
      status: "APPROVED",
      date: "2026-08-25 14:15",
    },
  ];

  const handleCopyNumber = () => {
    const num = paymentNumbers[method as keyof typeof paymentNumbers].split(" ")[0];
    navigator.clipboard.writeText(num);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleSubmitRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !trxId) {
      showToast("দয়া করে টাকার পরিমাণ এবং TrxID প্রদান করুন।", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/wallet/recharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: user?.name || "Amanullah Sheikh",
          userPhone: senderNumber || "017XXXXXXXX",
          userEmail: user?.email || "customer@aihaat.com",
          amountBDT: Number(amount),
          method,
          senderNumber,
          trxId,
        }),
      });

      if (res.ok) {
        showToast("রিচার্জ রিকোয়েস্ট জমা হয়েছে! এডমিন যাচাই করে ব্যালেন্স যোগ করবেন।", "success");
        setIsRechargeModalOpen(false);
        setTrxId("");
        setSenderNumber("");
      } else {
        showToast("রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।", "error");
      }
    } catch {
      showToast("সার্ভার ত্রুটি। আবার চেষ্টা করুন।", "error");
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
            ডিজিটাল ওয়ালেট ব্যালেন্স
          </span>
          <div className="text-3xl sm:text-4xl font-black text-white mt-1">
            {formatPrice(user?.walletBalanceBDT || 500)}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            ওয়ালেটে ব্যালেন্স থাকলে যেকোনো সময় ১-ক্লিকে ইনস্ট্যান্ট অর্ডার সম্পন্ন করতে পারবেন।
          </p>
        </div>

        <button
          onClick={() => setIsRechargeModalOpen(true)}
          className="px-6 py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>টাকা রিচার্জ করুন</span>
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold text-[#1A1D26]">লেনদেনের ইতিহাস (Transactions)</h3>
          <span className="text-xs text-gray-400">সর্বশেষ লেনদেন</span>
        </div>

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
                    {tx.type === "DEPOSIT" ? `ওয়ালেট রিচার্জ (${tx.method})` : `প্রোডাক্ট ক্রয়`}
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
                  {tx.type === "DEPOSIT" ? "+" : "-"}
                  {formatPrice(tx.amountBDT)}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  অনুমোদিত
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recharge Modal */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#1A1D26]">ওয়ালেট রিচার্জ করুন</h3>
              <button
                onClick={() => setIsRechargeModalOpen(false)}
                className="text-gray-400 hover:text-black text-sm"
              >
                ✕
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "bkash", name: "bKash", color: "#D12053" },
                { id: "nagad", name: "Nagad", color: "#F7931E" },
                { id: "rocket", name: "Rocket", color: "#8C3494" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    method === m.id
                      ? "border-[#FC5C03] bg-[#FFF2E8] text-[#FC5C03]"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* Account Info Box */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">আমাদের {method.toUpperCase()} নাম্বার:</span>
                <button
                  onClick={handleCopyNumber}
                  className="text-[#FC5C03] font-bold hover:underline flex items-center gap-1 text-[11px]"
                >
                  {copiedNumber ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedNumber ? "কপি হয়েছে!" : "কপি করুন"}</span>
                </button>
              </div>
              <p className="font-mono font-bold text-sm text-[#1A1D26]">
                {paymentNumbers[method as keyof typeof paymentNumbers]}
              </p>
              <p className="text-[11px] text-gray-500">
                Send Money সম্পন্ন করে নিচের ফর্মে Transaction ID দিন।
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitRecharge} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  টাকার পরিমাণ (BDT) *
                </label>
                <input
                  type="number"
                  required
                  min="50"
                  placeholder="যেমন: 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8EE] text-xs focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  যে নাম্বার থেকে পাঠিয়েছেন (প্রেরক নাম্বার)
                </label>
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8EE] text-xs focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Transaction ID (TrxID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: BL90X84Q"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8EE] text-xs font-mono uppercase focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRechargeModalOpen(false)}
                  className="w-1/3 py-2.5 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? "পাঠানো হচ্ছে..." : "জমা দিন (Submit)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
