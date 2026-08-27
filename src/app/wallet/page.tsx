"use client";

import React, { useState, useEffect } from "react";
import { Wallet, PlusCircle, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";

export default function WalletPage() {
  const { user, openLoginModal, refreshUser } = useAuth();
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [rechargeAmount, setRechargeAmount] = useState<number>(500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetAmounts = [100, 200, 500, 1000, 2000];

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (user?.email) {
      fetch(`/api/wallet/transactions?email=${encodeURIComponent(user.email)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.transactions) setTransactions(d.transactions);
        })
        .catch(console.error);
    }
  }, [user?.email]);

  const handleGatewayRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLoginModal("/wallet");
      return;
    }
    if (rechargeAmount < 10) {
      showToast("সর্বনিম্ন রিচার্জ ১০ টাকা।", "error");
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
          amount: rechargeAmount,
          customerName: user.name || "Customer",
          customerEmail: user.email,
          customerPhone: user.phone || "",
          metadata: {
            type: "WALLET_TOPUP",
            userId: user.id,
            email: user.email,
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
    <div className="w-full bg-[#F8FAFC] py-8 sm:py-12 min-h-[75vh]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Page Title */}
        <div className="max-w-xl mx-auto text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider">
            <Wallet className="w-3.5 h-3.5" />
            <span>Digital Wallet</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-[#1A1D26] tracking-tight">
            AI Haat Digital Wallet
          </h1>
          <p className="text-xs sm:text-sm text-[#7A8190]">
            ব্যালেন্স রিচার্জ করে যেকোনো সময় এক ক্লিকে ইনস্ট্যান্ট কেনাকাটা করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-4xl mx-auto">
          
          {/* LEFT: Balance & Recharge Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Balance Overview Card */}
            <div className="p-6 bg-[#1A1D26] rounded-2xl text-white shadow-xs border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Current Wallet Balance
                </span>
                <div className="px-2.5 py-1 bg-[#FC5C03] text-white text-[10.5px] font-black rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>

              <div>
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {formatPrice(user?.walletBalanceBDT || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-800">
                <span>{user ? user.name : "Guest User"}</span>
                <span className="text-emerald-400 font-semibold">1-Click Auto Checkout</span>
              </div>
            </div>

            {/* Recharge Section */}
            <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-[#1A1D26] pb-3 border-b border-gray-100 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#FC5C03]" />
                <span>ওয়ালেটে টাকা যোগ করুন (Add Funds)</span>
              </h3>

              <form onSubmit={handleGatewayRecharge} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1A1D26]">
                    টাকার পরিমাণ (BDT) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(Number(e.target.value))}
                    className="w-full text-base font-bold p-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-hidden focus:border-[#FC5C03]"
                  />
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {presetAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRechargeAmount(amt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          rechargeAmount === amt
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
                  <span>পেমেন্ট করুন (৳{rechargeAmount || 0})</span>
                </button>
              </form>
            </div>

          </div>

          {/* RIGHT: Transaction History (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-[#1A1D26] pb-3 border-b border-gray-100">
                Recent Transactions
              </h3>

              {transactions.length > 0 ? (
                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-[#1A1D26] block">
                          {tx.type === "DEPOSIT" ? "Deposit" : "Purchase"}
                        </span>
                        <span className="text-[10.5px] text-gray-500 font-mono">
                          {tx.trxId} • {tx.date}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-black ${
                          tx.type === "DEPOSIT" ? "text-emerald-600" : "text-slate-900"
                        }`}
                      >
                        {tx.type === "DEPOSIT" ? "+" : "-"}
                        {formatPrice(tx.amountBDT)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 space-y-1">
                  <Wallet className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs font-medium text-gray-500">এখনো কোনো লেনদেন হয়নি</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
