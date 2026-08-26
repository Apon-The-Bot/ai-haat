"use client";

import React, { useState } from "react";
import { Wallet, ArrowDownRight, ArrowUpRight, ShieldCheck, CreditCard, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";

export default function WalletPage() {
  const { user, rechargeWallet } = useAuth();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [rechargeAmount, setRechargeAmount] = useState<number>(500);
  const [selectedMethod, setSelectedMethod] = useState<"bkash" | "nagad" | "rocket">("bkash");
  const [trxId, setTrxId] = useState("");
  const [isRecharging, setIsRecharging] = useState(false);

  const handleRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (rechargeAmount < 50) {
      showToast("সর্বনিম্ন রিচার্জ ৫০ টাকা।", "error");
      return;
    }
    if (!trxId.trim()) {
      showToast("দয়া করে Transaction ID লিখুন।", "error");
      return;
    }

    setIsRecharging(true);
    setTimeout(() => {
      rechargeWallet(rechargeAmount);
      setIsRecharging(false);
      setTrxId("");
      showToast(`আপনার ওয়ালেটে ${formatPrice(rechargeAmount)} সফলভাবে যুক্ত হয়েছে!`, "success");
    }, 1000);
  };

  const presetAmounts = [100, 300, 500, 1000, 2000, 5000];

  const dummyTransactions = [
    { id: "tx-1", title: "bKash ওয়ালেট রিচার্জ", date: "2026-08-25 14:10", amount: 500, type: "CREDIT" },
    { id: "tx-2", title: "ChatGPT Plus ক্রয়", date: "2026-08-25 14:15", amount: -290, type: "DEBIT" },
    { id: "tx-3", title: "Nagad ওয়ালেট রিচার্জ", date: "2026-08-20 11:30", amount: 1000, type: "CREDIT" },
    { id: "tx-4", title: "Canva Pro ১ বছর ক্রয়", date: "2026-08-20 11:35", amount: -499, type: "DEBIT" },
  ];

  return (
    <div className="w-full bg-white py-8 sm:py-12 min-h-[75vh]">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        
        {/* Page Title */}
        <div className="max-w-xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Wallet className="w-3.5 h-3.5" />
            <span>ডিজিটাল ওয়ালেট</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D26] tracking-tight">
            এআই হাট ওয়ালেট (AI Haat Wallet)
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            ব্যালেন্স রিচার্জ করে যেকোনো সময় এক ক্লিকে ইনস্ট্যান্ট কেনাকাটা করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start max-w-5xl mx-auto">
          
          {/* LEFT: Balance Card & Recharge Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Balance Overview Card */}
            <div className="p-6 bg-gradient-to-br from-[#1A1D26] to-black rounded-2xl text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    বর্তমান ব্যালেন্স (Wallet Balance)
                  </span>
                  <div className="px-2.5 py-1 bg-[#FC5C03] text-white text-[11px] font-black rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>সুরক্ষিত</span>
                  </div>
                </div>

                <div>
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {formatPrice(user?.walletBalanceBDT || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
                  <span>ইউজার: {user?.name || "Customer"}</span>
                  <span className="text-emerald-400 font-semibold">অটো ইনস্ট্যান্ট চেকআউট সক্রিয়</span>
                </div>
              </div>
            </div>

            {/* Recharge Section */}
            <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-[#1A1D26] pb-3 border-b border-gray-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FC5C03]" />
                <span>ওয়ালেট ব্যালেন্স রিচার্জ করুন</span>
              </h3>

              <form onSubmit={handleRecharge} className="space-y-4">
                {/* Select Method */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1D26] mb-1.5">
                    পেমেন্ট মেথড নির্বাচন করুন:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "bkash", name: "bKash" },
                      { id: "nagad", name: "Nagad" },
                      { id: "rocket", name: "Rocket" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          selectedMethod === m.id
                            ? "bg-[#FFF2E8] border-[#FC5C03] text-[#FC5C03]"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Amounts */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1D26] mb-1.5">
                    টাকার পরিমাণ নির্বাচন করুন:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {presetAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRechargeAmount(amt)}
                        className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          rechargeAmount === amt
                            ? "bg-[#FC5C03] text-white border-[#FC5C03]"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount & TrxID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                      কাস্টম পরিমাণ (টাকা) *
                    </label>
                    <input
                      type="number"
                      required
                      min={50}
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(Number(e.target.value))}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                      Transaction ID (TrxID) *
                    </label>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g. TR8912KL"
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRecharging}
                  className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] disabled:bg-gray-400 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-all"
                >
                  {isRecharging ? "রিচার্জ ভেরিফাই হচ্ছে..." : "ব্যালেন্স রিচার্জ কনফার্ম করুন"}
                </button>
              </form>
            </div>

          </div>

          {/* RIGHT: Transaction History (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-[#1A1D26] pb-3 border-b border-gray-100 flex items-center justify-between">
                <span>সাম্প্রতিক ট্রানজেকশন হিস্ট্রি</span>
                <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
              </h3>

              <div className="space-y-2.5 max-h-96 overflow-y-auto divide-y divide-gray-100">
                {dummyTransactions.map((tx) => (
                  <div key={tx.id} className="pt-2.5 first:pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === "CREDIT"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {tx.type === "CREDIT" ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1A1D26]">{tx.title}</h4>
                        <span className="text-[10px] text-gray-400">{tx.date}</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-extrabold ${
                        tx.type === "CREDIT" ? "text-emerald-600" : "text-[#1A1D26]"
                      }`}
                    >
                      {tx.type === "CREDIT" ? "+" : ""}
                      {formatPrice(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
