"use client";

import React, { useState, useEffect } from "react";
import { Coins, Sparkles, Gift, ArrowRight, Copy, Check, Clock, ShieldCheck, Tag } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { COIN_REWARD_TIERS, CoinRewardTier } from "@/lib/loyalty/coins";

export function RewardsClubView() {
  const { showToast } = useToast();
  const [data, setData] = useState<{
    coinBalance: number;
    lifetimeCoinsEarned: number;
    transactions: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingTierId, setClaimingTierId] = useState<string | null>(null);
  const [claimedCoupon, setClaimedCoupon] = useState<{
    code: string;
    discountBDT: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchLoyalty = async () => {
    try {
      const res = await fetch("/api/loyalty");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyalty();
  }, []);

  const handleClaim = async (tier: CoinRewardTier) => {
    if ((data?.coinBalance || 0) < tier.coinsCost) {
      showToast(`আপনার পর্যাপ্ত কয়েন নেই (${tier.coinsCost} কয়েন প্রয়োজন)।`, "error");
      return;
    }

    setClaimingTierId(tier.id);
    try {
      const res = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: tier.id }),
      });
      const json = await res.json();

      if (json.success && json.couponCode) {
        setClaimedCoupon({ code: json.couponCode, discountBDT: json.discountBDT });
        showToast("🎉 অভিনন্দন! আপনার ডিসকাউন্ট কুপন তৈরি হয়েছে!", "success");
        fetchLoyalty();
      } else {
        showToast(json.error || "কুপন ক্লেইম করতে সমস্যা হয়েছে।", "error");
      }
    } catch (e: any) {
      showToast("কুপন ক্লেইম করতে ব্যর্থ হয়েছে।", "error");
    } finally {
      setClaimingTierId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("কুপন কোড কপি করা হয়েছে!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500 space-y-2">
        <div className="w-6 h-6 border-2 border-[#FC5C03] border-t-transparent rounded-full animate-spin mx-auto" />
        <span>রিওয়ার্ডস ক্লাব লোড হচ্ছে...</span>
      </div>
    );
  }

  const balance = data?.coinBalance || 0;

  return (
    <div className="space-y-8">
      {/* 1. HERO COIN BALANCE CARD */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 relative overflow-hidden shadow-lg border border-amber-500/20">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Haat Loyalty Rewards Club</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{balance.toLocaleString()}</span>
              <span className="text-amber-400 text-lg sm:text-2xl font-bold">কয়েন</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              মোট আজীবন অর্জিত কয়েন: <strong>{(data?.lifetimeCoinsEarned || 0).toLocaleString()}</strong> টি •
              প্রতি ১০০৳ অর্ডারে পান ১০টি কয়েন!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 space-y-1 text-xs text-slate-200 sm:max-w-[240px]">
            <strong className="text-amber-300 block font-bold">💡 কীভাবে কয়েন কাজ করে?</strong>
            <p className="text-[11px] leading-relaxed text-slate-300">
              অর্ডার সম্পন্ন হলে স্বয়ংক্রিয়ভাবে কয়েন জমা হবে। কয়েন দিয়ে নিচের রিওয়ার্ড স্টোর থেকে ডিসকাউন্ট
              কুপন তৈরি করুন।
            </p>
          </div>
        </div>
      </div>

      {/* 2. CLAIMED COUPON MODAL / TOAST NOTIFICATION */}
      {claimedCoupon && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-emerald-100 to-teal-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              🎉 আপনার নতুন রিওয়ার্ড কুপন
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-900">
              {claimedCoupon.code}
            </div>
            <p className="text-xs text-emerald-700">
              পরবর্তী কেনাকাটায় চেকআউটে এই কোডটি দিয়ে {claimedCoupon.discountBDT} ৳ সরাসরি ছাড় নিন!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(claimedCoupon.code)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "কপি হয়েছে!" : "কোড কপি করুন"}</span>
            </button>
            <button
              onClick={() => setClaimedCoupon(null)}
              className="px-3 py-2.5 bg-white hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 transition-all cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* 3. REWARDS STORE (COINS TO COUPON CLAIM TIERS) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">কয়েন রিডিম স্টোর (Claim Coupons)</h3>
          <p className="text-xs text-slate-500">আপনার কয়েন ব্যয় করে সাথে সাথে ডিসকাউন্ট ভাউচার সংগ্রহ করুন।</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COIN_REWARD_TIERS.map((tier) => {
            const canAfford = balance >= tier.coinsCost;
            const isClaiming = claimingTierId === tier.id;

            return (
              <div
                key={tier.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  canAfford
                    ? "bg-white border-amber-300 shadow-sm hover:border-[#FC5C03] hover:shadow-md"
                    : "bg-slate-50/70 border-slate-200 opacity-70"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                      {tier.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      মিনিমাম অর্ডার: {tier.minOrderBDT}৳
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900">{tier.nameBn}</h4>
                  <div className="text-2xl font-black text-[#FC5C03] font-mono">
                    {tier.discountBDT} ৳ ছাড়
                  </div>
                </div>

                <button
                  onClick={() => handleClaim(tier)}
                  disabled={!canAfford || isClaiming}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                    canAfford
                      ? "bg-[#FC5C03] hover:bg-[#E04F00] text-white shadow-2xs"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>
                    {isClaiming
                      ? "তৈরি হচ্ছে..."
                      : canAfford
                      ? `${tier.coinsCost} কয়েন দিয়ে ক্লেম করুন`
                      : `আরও ${tier.coinsCost - balance} কয়েন লাগবে`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. RECENT COIN TRANSACTIONS LEDGER */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-900">কয়েন ট্রানজেকশন হিস্ট্রি</h3>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          {data?.transactions && data.transactions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.transactions.map((tx: any) => (
                <div key={tx.id} className="p-4 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800">{tx.description}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(tx.createdAt).toLocaleString("bn-BD")}</span>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-black text-sm ${
                      tx.amount > 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} কয়েন
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              এখনো কোনো কয়েন ট্রানজেকশন রেকর্ড নেই। প্রথম অর্ডারে কয়েন অর্জন করুন!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
