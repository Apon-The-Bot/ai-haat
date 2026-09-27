"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Gift,
  Sparkles,
  Users,
  Wallet,
  Coins,
  Copy,
  Check,
  Share2,
  Award,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Zap,
  Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";

interface MilestoneItem {
  id: string;
  titleEn: string;
  titleBn: string;
  descEn: string;
  descBn: string;
  requiredCount: number;
  rewardType: "COINS" | "WALLET_CASH" | "VIP_BADGE";
  rewardValue: number;
  rewardBadgeText: string;
  isClaimed: boolean;
  isReady: boolean;
  progress: number;
  progressPercent: number;
}

interface ReferralData {
  referralCode: string;
  customSlug?: string | null;
  totalClicks: number;
  convertedOrdersCount: number;
  totalEarnedBDT: number;
  earningsBalanceBDT: number;
  walletBalanceBDT: number;
  coinBalance: number;
  milestones: MilestoneItem[];
  recentReferrals: Array<{
    id: string;
    maskedName: string;
    orderTotalBDT: number;
    commissionAmountBDT: number;
    status: string;
    date: string;
  }>;
}

export function ReferralHubClient() {
  const { user, openLoginModal } = useAuth();
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isBn = language === "bn";

  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchReferralData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/referrals/me");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      }
    } catch (e) {
      console.error("Failed to load referral data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    } else {
      setLoading(false);
    }
  }, [user, fetchReferralData]);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://aihaat.shop";
  const refCode = data?.referralCode || "AIHAAT";
  const shareUrl = `${origin}?ref=${refCode}`;

  const copyToClipboard = (text: string, type: "link" | "code") => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      if (type === "link") {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        showToast(isBn ? "রেফারেল লিঙ্ক কপি করা হয়েছে!" : "Referral link copied!", "success");
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        showToast(isBn ? "রেফারেল কোড কপি করা হয়েছে!" : "Referral code copied!", "success");
      }
    } catch {
      showToast(text, "info");
    }
  };

  const handleClaimMilestone = async (milestoneId: string) => {
    try {
      setClaimingId(milestoneId);
      const res = await fetch("/api/referrals/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId }),
      });
      const json = await res.json();

      if (json.success) {
        showToast(json.message || "🎉 অভিনন্দন! রিওয়ার্ড গ্রহণ করা হয়েছে!", "success");
        // Trigger celebratory confetti dynamically
        try {
          const confetti = (await import("canvas-confetti")).default;
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {
          // SSR-safe fallback
        }
        fetchReferralData();
      } else {
        showToast(json.error || "রিওয়ার্ড ক্লেইম করতে ব্যর্থ হয়েছে।", "error");
      }
    } catch (err: any) {
      showToast("ক্লেইম করতে সমস্যা হয়েছে।", "error");
    } finally {
      setClaimingId(null);
    }
  };

  const viralWhatsAppMessage = encodeURIComponent(
    `দোস্ত! AI Haat থেকে যেকোনো AI টুলস (ChatGPT Plus, Midjourney, Canva Pro) কিনলে আমার রেফারেল কোড ব্যবহারে পাবি ৫০ টাকা ইনস্ট্যান্ট ছাড়! 🔥\n\nলিংক: ${shareUrl}\nকুপন কোড: ${refCode} 🎁✨`
  );

  const viralFacebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  if (!user) {
    return (
      <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-orange-50 text-[#FC5C03] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Gift className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900">
          {isBn ? "Give ৳৫০, Get ৳৫০ প্রোগ্রামে অংশ নিন" : "Join Give ৳50, Get ৳50 Program"}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {isBn
            ? "বন্ধুদের রেফার করে ফ্রি এআই সাবস্ক্রিপশন, ৫০০ কয়েন ও ওয়ালেট ক্যাশব্যাক পেতে লগইন অথবা ফ্রি অ্যাকাউন্ট তৈরি করুন।"
            : "Login or create an account to get your personal referral link and unlock free AI tools & cash bonuses."}
        </p>
        <button
          onClick={() => openLoginModal("/dashboard/referrals")}
          className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
        >
          {isBn ? "লগইন করে রেফারেল লিঙ্ক নিন" : "Login to Get Referral Link"}
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#FC5C03] border-t-transparent rounded-full animate-spin mx-auto" />
        <span className="text-xs text-slate-500 font-bold">
          {isBn ? "রেফারেল হাব লোড হচ্ছে..." : "Loading referral hub..."}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. HERO CELEBRATION CARD */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white p-6 sm:p-10 overflow-hidden shadow-xl border border-orange-500/20">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#FC5C03]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FC5C03]/20 border border-[#FC5C03]/40 rounded-full text-xs font-black uppercase tracking-wider text-[#FF8540]">
              <Sparkles className="w-3.5 h-3.5 text-[#FC5C03]" />
              <span>{isBn ? "ভাইরাল রেফারেল অ্যান্ড রিওয়ার্ডস প্রোগ্রাম" : "Viral Referral & Milestone Rewards"}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {isBn ? (
                <>
                  বন্ধুকে দিন <span className="text-amber-400">৳৫০ ছাড়</span>, আপনি পান{" "}
                  <span className="text-[#FC5C03]">৳৫০ ক্যাশব্যাক</span>!
                </>
              ) : (
                <>
                  Give <span className="text-amber-400">৳50 Off</span>, Get{" "}
                  <span className="text-[#FC5C03]">৳50 Cashback</span>!
                </>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {isBn
                ? "আপনার রেফারেল কোড বা লিংক ব্যবহারে বন্ধু প্রথম অর্ডারে পাবে ৫০ টাকা ছাড়, আর প্রতিটি সফল অর্ডারে আপনার ওয়ালেটে জমা হবে ৫০ টাকা ক্যাশ যা দিয়ে সাইটের যেকোনো ডিজিটাল টুলস ফ্রিতে কিনতে পারবেন!"
                : "Your friend saves ৳50 on their first order using your referral code, and you get ৳50 wallet cash on every order to buy free AI tools!"}
            </p>
          </div>

          {/* Quick Code Badge */}
          <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl space-y-2 text-center sm:text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {isBn ? "আপনার ব্যক্তিগত কুপন কোড:" : "Your Referral Code:"}
            </span>
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 tracking-wider">
                {refCode}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(refCode, "code")}
                className="p-2 bg-white/20 hover:bg-[#FC5C03] text-white rounded-xl transition-colors cursor-pointer"
                title="Copy Referral Code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isBn ? "রেফার করা বন্ধু" : "Friends Joined"}</span>
            <Users className="w-4 h-4 text-[#FC5C03]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {data?.convertedOrdersCount || 0} <span className="text-xs font-bold text-slate-400">{isBn ? "জন" : "users"}</span>
          </div>
          <span className="text-[10.5px] text-emerald-600 font-bold block">
            {isBn ? "সফলভাবে অর্ডার সম্পন্ন" : "Completed Orders"}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isBn ? "মোট অর্জিত ক্যাশব্যাক" : "Total Cash Earned"}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {formatPrice(data?.totalEarnedBDT || 0)}
          </div>
          <span className="text-[10.5px] text-slate-500 block">
            {isBn ? "রেফারেল কমিশন ও বোনাস" : "Referral Earnings"}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#FC5C03]">
            {formatPrice(data?.walletBalanceBDT || 0)}
          </div>
          <span className="text-[10.5px] text-slate-500 block">
            {isBn ? "টুলস ক্রয়ে ব্যবহারযোগ্য" : "Available to spend"}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{isBn ? "রিওয়ার্ড কয়েন" : "Reward Coins"}</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500">
            {(data?.coinBalance || 0).toLocaleString()}
          </div>
          <span className="text-[10.5px] text-slate-500 block">
            {isBn ? "কুপন রিডিমে ব্যবহার্য" : "For discount coupons"}
          </span>
        </div>
      </div>

      {/* 3. 1-CLICK SOCIAL SHARING CENTER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#FC5C03]" />
              <span>{isBn ? "১-ক্লিকে বন্ধুদের ইনভাইট করুন" : "1-Click Social Sharing"}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isBn
                ? "নিচের লিংকটি শেয়ার করলেই স্বয়ংক্রিয়ভাবে আপনার রেফারেল কোড সক্রিয় হবে।"
                : "Share this link on social media to start generating referral income immediately."}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-800 select-all overflow-x-auto whitespace-nowrap">
            {shareUrl}
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(shareUrl, "link")}
            className="px-5 py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? (isBn ? "কপি হয়েছে!" : "Copied!") : (isBn ? "লিঙ্ক কপি করুন" : "Copy Link")}</span>
          </button>
        </div>

        {/* Quick Social Channels */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
            {isBn ? "সোশ্যাল মিডিয়ায় সরাসরি পাঠান:" : "Direct Social Forwarding:"}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <a
              href={`https://api.whatsapp.com/send?text=${viralWhatsAppMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <span>WhatsApp-এ শেয়ার করুন</span>
            </a>
            <a
              href={viralFacebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <span>Facebook-এ পোস্ট করুন</span>
            </a>
            <button
              type="button"
              onClick={() => copyToClipboard(`https://m.me/share?link=${encodeURIComponent(shareUrl)}`, "link")}
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <span>মেসেঞ্জার ও অন্যান্য চ্যাট</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. GAMIFIED MILESTONE REWARDS ROADMAP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>{isBn ? "মাইলস্টোন রিওয়ার্ডস রোডম্যাপ" : "Milestone Rewards Roadmap"}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isBn
                ? "টার্গেট পূরণ করে আকর্ষণীয় ফ্রি উপহার ও বিশেষ ক্যাশ বোনাস ক্লেইম করুন।"
                : "Hit referral milestones to unlock free subscriptions and cash prizes."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data?.milestones || []).map((m, idx) => {
            const isFinished = m.isClaimed;
            const canClaim = m.isReady;

            return (
              <div
                key={m.id}
                className={`p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between space-y-4 ${
                  isFinished
                    ? "bg-slate-50 border-slate-200 opacity-90"
                    : canClaim
                    ? "bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white border-amber-300 shadow-md ring-2 ring-amber-400/40"
                    : "bg-white border-slate-200 shadow-2xs"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-orange-100 text-[#FC5C03] font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isFinished
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : canClaim
                          ? "bg-amber-100 text-amber-800 border-amber-300 animate-pulse font-black"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {isFinished
                        ? isBn ? "সম্পন্ন ✅" : "Claimed ✅"
                        : canClaim
                        ? isBn ? "আনলকড! ক্লেইম করুন 🔥" : "Ready to Claim! 🔥"
                        : isBn ? "লকড 🔒" : "Locked 🔒"}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900">{isBn ? m.titleBn : m.titleEn}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{isBn ? m.descBn : m.descEn}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>{isBn ? "প্রগ্রেস:" : "Progress:"}</span>
                      <span>
                        {m.progress} / {m.requiredCount} {isBn ? "জন" : "friends"}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FC5C03] to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${m.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Claim Button */}
                  {canClaim ? (
                    <button
                      type="button"
                      disabled={claimingId === m.id}
                      onClick={() => handleClaimMilestone(m.id)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-[#FC5C03] hover:from-amber-600 hover:to-[#EC4001] text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {claimingId === m.id ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>ক্লেইম হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{m.rewardBadgeText} ক্লেইম করুন</span>
                        </>
                      )}
                    </button>
                  ) : isFinished ? (
                    <div className="w-full py-2 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                      রিওয়ার্ড গ্রহণ সম্পন্ন
                    </div>
                  ) : (
                    <div className="w-full py-2 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-xl">
                      আরও {m.requiredCount - m.progress} জন বন্ধু বাকি
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RECENT REFERRAL HISTORY FEED */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{isBn ? "রেফারেল হিস্টোরি ও অর্ডার লগ" : "Recent Referral Activity"}</span>
        </h3>

        {data?.recentReferrals && data.recentReferrals.length > 0 ? (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {data.recentReferrals.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FC5C03] font-black flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 font-bold block">{item.maskedName}</strong>
                    <span className="text-slate-400 text-[11px]">{item.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 block">
                    +{formatPrice(item.commissionAmountBDT || 50)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            {isBn
              ? "এখনও কোনো বন্ধু আপনার লিংকে অর্ডার করেনি। উপরের লিঙ্কটি শেয়ার করে ইনভাইট শুরু করুন!"
              : "No referral orders yet. Share your link to start earning rewards!"}
          </div>
        )}
      </div>

      {/* 6. HOW IT WORKS ACCORDION */}
      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3 text-xs">
        <h4 className="font-black text-slate-900 flex items-center gap-1.5 text-sm">
          <Info className="w-4 h-4 text-[#FC5C03]" />
          <span>{isBn ? "রেফারেল প্রোগ্রাম সম্পর্কিত প্রয়োজনীয় তথ্য" : "How Give ৳50, Get ৳50 Works"}</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600 pt-1">
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <strong className="font-bold text-slate-900 block">১. বন্ধু কীভাবে ছাড় পাবে?</strong>
            <p>আপনার রেফারেল লিংকে ক্লিক করে অথবা চেকআউটে আপনার কোডটি কুপন হিসেবে দিলে বন্ধু প্রথম অর্ডারে ৫০ টাকা ছাড় পাবে (সর্বনিম্ন ১৫০ টাকার অর্ডারে)।</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <strong className="font-bold text-slate-900 block">২. আপনি কখন ক্যাশ পাবেন?</strong>
            <p>বন্ধুর অর্ডারটি সফলভাবে পেমেন্ট ও ডেলিভারি সম্পন্ন হওয়ার সাথে সাথে ৫০ টাকা আপনার এআই হাট ওয়ালেট ব্যালেন্সে ক্রেডিট হবে।</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <strong className="font-bold text-slate-900 block">৩. ওয়ালেট ব্যালেন্স কীভাবে খরচ করবেন?</strong>
            <p>ওয়ালেট ব্যালেন্স দিয়ে সাইটের যেকোনো প্রিমিয়াম এআই সাবস্ক্রিপশন ১-ক্লিকে বিনামূল্যে বা ডিসকাউন্টে সরাসরি কেনা যায়।</p>
          </div>
        </div>
      </div>

    </div>
  );
}
