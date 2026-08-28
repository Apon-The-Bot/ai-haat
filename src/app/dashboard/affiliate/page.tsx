"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Share2,
  Copy,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Users,
  MousePointerClick,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  Smartphone,
  QrCode,
  Download,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Percent,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";

export default function AffiliateDashboard() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const isBn = language === "bn";

  // Data States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });

  // UI States
  const [activeTab, setActiveTab] = useState<"commissions" | "payouts">("commissions");
  const [isCopied, setIsCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Payout Form State
  const [payoutMethod, setPayoutMethod] = useState<"WALLET" | "BKASH" | "NAGAD" | "ROCKET" | "BANK">("WALLET");
  const [payoutAccountType, setPayoutAccountType] = useState<"Personal" | "Merchant">("Personal");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutPhone, setPayoutPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [branchName, setBranchName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");

  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Fetch all affiliate data
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [profileRes, commissionsRes, payoutsRes] = await Promise.all([
        fetch("/api/affiliate/profile"),
        fetch(`/api/affiliate/commissions?page=${pagination.page}&limit=${pagination.limit}`),
        fetch("/api/affiliate/payout"),
      ]);

      if (profileRes.ok) {
        const pJson = await profileRes.json();
        if (pJson.success) setProfileData(pJson);
      }

      if (commissionsRes.ok) {
        const cJson = await commissionsRes.json();
        if (cJson.success) {
          setCommissions(cJson.data || []);
          if (cJson.pagination) setPagination(cJson.pagination);
        }
      }

      if (payoutsRes.ok) {
        const payJson = await payoutsRes.json();
        if (payJson.success) setPayouts(payJson.data || []);
      }
    } catch (error) {
      console.error("Failed to load affiliate dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Referral Link
  const referralCode = profileData?.profile?.referralCode || user?.id?.substring(0, 8).toUpperCase() || "AH-2026";
  const referralLink = profileData?.profile?.referralLink || `https://aihaat.shop?ref=${referralCode}`;
  const qrCodeUrl = profileData?.profile?.qrCodeUrl;

  // Stats
  const availableEarnings = profileData?.stats?.availableEarnings ?? profileData?.profile?.earningsBalanceBDT ?? 0;
  const holdingBalance = profileData?.stats?.holdingBalance ?? 0;
  const totalEarned = profileData?.stats?.totalEarned ?? profileData?.profile?.totalEarnedBDT ?? 0;
  const totalPaidOut = profileData?.stats?.totalPaid ?? profileData?.profile?.totalPaidBDT ?? 0;
  const linkClicks = profileData?.stats?.clicks ?? profileData?.profile?.totalClicks ?? 0;
  const totalReferredOrders = profileData?.stats?.conversionsCount ?? profileData?.profile?.totalOrdersCount ?? 0;
  const conversionRate = profileData?.stats?.conversionRate ?? 0;
  const totalGMV = profileData?.stats?.totalGMV ?? profileData?.profile?.totalReferredGMVBDT ?? 0;

  // Tier info
  const tierInfo = profileData?.profile?.tierInfo || {
    tier: profileData?.profile?.tier || "BRONZE",
    ratePercent: 5.0,
    nextTier: "SILVER",
    ordersNeeded: 10,
    gmvNeeded: 5000,
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSocialShare = (platform: "whatsapp" | "facebook" | "telegram" | "twitter") => {
    const text = encodeURIComponent("Check out genuine AI subscriptions & developer tools on AI Haat! Use my link:");
    const url = encodeURIComponent(referralLink);

    let shareUrl = "";
    if (platform === "whatsapp") shareUrl = `https://wa.me/?text=${text}%20${url}`;
    if (platform === "facebook") shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (platform === "telegram") shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
    if (platform === "twitter") shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

    window.open(shareUrl, "_blank");
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError("");
    const amount = Number(payoutAmount);

    if (!amount || amount < 500) {
      setPayoutError(isBn ? "সর্বনিম্ন পেআউট পরিমাণ ৳৫০০" : "Minimum payout amount is ৳500");
      return;
    }

    if (amount > availableEarnings) {
      setPayoutError(
        isBn
          ? `অপর্যাপ্ত ব্যালেন্স। আপনার বর্তমান উত্তোলনযোগ্য ব্যালেন্স ${formatPrice(availableEarnings)}`
          : `Insufficient balance. Available: ${formatPrice(availableEarnings)}`
      );
      return;
    }

    let payoutBankDetails = "";
    if (payoutMethod === "BANK") {
      if (!bankName || !accountName || !accountNumber) {
        setPayoutError(isBn ? "ব্যাংকের প্রয়োজনীয় তথ্য প্রদান করুন" : "Please fill required bank details");
        return;
      }
      payoutBankDetails = JSON.stringify({
        bankName,
        accountName,
        accountNumber,
        branchName: branchName || "N/A",
        routingNumber: routingNumber || "N/A",
      });
    }

    setPayoutSubmitting(true);
    try {
      const res = await fetch("/api/affiliate/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountBDT: amount,
          payoutMethod,
          payoutPhone: ["BKASH", "NAGAD", "ROCKET"].includes(payoutMethod)
            ? `${payoutPhone} (${payoutAccountType})`
            : undefined,
          payoutBankDetails: payoutMethod === "BANK" ? payoutBankDetails : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit payout request");
      }

      setPayoutSuccess(true);
      fetchData();
      setTimeout(() => {
        setShowPayoutModal(false);
        setPayoutSuccess(false);
        setPayoutAmount("");
        setPayoutPhone("");
        setBankName("");
        setAccountName("");
        setAccountNumber("");
      }, 2000);
    } catch (err: any) {
      setPayoutError(err.message || "Payout submission failed");
    } finally {
      setPayoutSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "APPROVED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PENDING":
      case "REQUESTED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-[#FC5C03] rounded-full text-xs font-black uppercase tracking-wider border border-orange-100 mb-2">
            <Award className="w-3.5 h-3.5" />
            {isBn ? "পার্টনার ও অ্যাফিলিয়েট নেটওয়ার্ক" : "Partner & Affiliate Program"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Share2 className="w-7 h-7 text-[#FC5C03]" />
            {isBn ? "অ্যাফিলিয়েট ড্যাশবোর্ড" : "Affiliate Dashboard"}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {isBn
              ? "রেফারেল লিংক শেয়ার করে প্রতি অর্ডারে ৫% থেকে ১২% পর্যন্ত কমিশন উপার্জন করুন।"
              : "Share your referral link and earn up to 12% lifetime commissions on every referred order."}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 self-start md:self-auto flex-wrap">
          <button
            onClick={() => fetchData()}
            disabled={refreshing}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all flex items-center gap-2"
            title="Refresh Stats"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#FC5C03]" : ""}`} />
            <span className="hidden sm:inline">{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="px-4 py-3 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <QrCode className="w-4 h-4 text-[#FC5C03]" />
            <span>{isBn ? "QR কোড" : "QR Code"}</span>
          </button>

          <button
            onClick={() => setShowPayoutModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#FC5C03] to-[#E55302] hover:brightness-110 text-white text-sm font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            <span>{isBn ? "পেআউট রিকোয়েস্ট (৳৫০০+)" : "Request Payout"}</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Earnings */}
        <div className="bg-white rounded-3xl border border-emerald-200/80 p-5 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <div className="text-emerald-600 text-xs font-black mb-1 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isBn ? "উত্তোলনযোগ্য ব্যালেন্স" : "Available for Payout"}
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {formatPrice(availableEarnings)}
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-400" />
              <span>{isBn ? "সর্বনিম্ন উত্তোলন ৳৫০০" : "Min. withdrawal ৳500"}</span>
            </div>
          </div>
        </div>

        {/* Holding / Pending Balance */}
        <div className="bg-white rounded-3xl border border-amber-200/80 p-5 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Clock className="w-16 h-16 text-amber-500" />
          </div>
          <div className="relative z-10">
            <div className="text-amber-600 text-xs font-black mb-1 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {isBn ? "রিফান্ড হোল্ডিং কমিশন" : "Holding Commissions"}
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {formatPrice(holdingBalance)}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {isBn ? "৭ দিনের রিফান্ড উইন্ডো শেষে যোগ হবে" : "Matures after 7-day refund window"}
            </div>
          </div>
        </div>

        {/* Total Commissions Earned */}
        <div className="bg-white rounded-3xl border border-indigo-200/80 p-5 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-16 h-16 text-indigo-500" />
          </div>
          <div className="relative z-10">
            <div className="text-indigo-600 text-xs font-black mb-1 uppercase tracking-wider">
              {isBn ? "মোট অর্জিত কমিশন" : "Total Lifetime Earned"}
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {formatPrice(totalEarned)}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {isBn ? `মোট উত্তোলন: ${formatPrice(totalPaidOut)}` : `Total Paid Out: ${formatPrice(totalPaidOut)}`}
            </div>
          </div>
        </div>

        {/* Clicks & Conversions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <MousePointerClick className="w-16 h-16 text-[#FC5C03]" />
          </div>
          <div className="relative z-10">
            <div className="text-slate-600 text-xs font-black mb-1 uppercase tracking-wider">
              {isBn ? "ক্লিক ও কনভার্সন" : "Clicks & Orders"}
            </div>
            <div className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
              <span>{totalReferredOrders}</span>
              <span className="text-sm font-bold text-slate-400">/ {linkClicks} clicks</span>
            </div>
            <div className="text-xs text-emerald-600 font-bold mt-2">
              {conversionRate}% {isBn ? "কনভার্সন রেট" : "Conversion Rate"}
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link & Tier Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Link & Social Sharing Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isBn ? "আপনার ব্যক্তিগত রেফারেল লিংক" : "Your Referral Link"}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn
                  ? "যে কেউ আপনার লিংক দিয়ে কিনলে স্বয়ংক্রিয়ভাবে কমিশন আপনার ব্যালেন্সে যোগ হবে।"
                  : "Any customer using your link automatically credits lifetime commissions to your account."}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#FC5C03] text-xs font-mono font-bold rounded-lg border border-orange-200 self-start sm:self-auto">
              <span>Code: {referralCode}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 overflow-x-auto whitespace-nowrap select-all">
              {referralLink}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className={`px-5 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shrink-0 ${
                  isCopied
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-[#FC5C03] text-white hover:bg-[#E55302] shadow-md"
                }`}
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isBn ? "কপি হয়েছে!" : "Copied!"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{isBn ? "কপি করুন" : "Copy Link"}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowQrModal(true)}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                title="View QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-black text-slate-400 mb-3 uppercase tracking-wider">
              {isBn ? "সোশ্যাল মিডিয়ায় শেয়ার করুন" : "Instant Social Share"}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleSocialShare("whatsapp")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs font-bold rounded-xl transition-all border border-[#25D366]/20"
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => handleSocialShare("telegram")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] text-xs font-bold rounded-xl transition-all border border-[#0088cc]/20"
              >
                <span>Telegram</span>
              </button>
              <button
                onClick={() => handleSocialShare("facebook")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] text-xs font-bold rounded-xl transition-all border border-[#1877F2]/20"
              >
                <span>Facebook</span>
              </button>
              <button
                onClick={() => handleSocialShare("twitter")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-slate-200"
              >
                <span>X / Twitter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tier Progression Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl text-white flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Award className="w-48 h-48 text-yellow-400" />
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                {isBn ? "বর্তমান পার্টনার টিয়ার" : "Commission Tier"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                {tierInfo.tier}
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-orange-400">
                {tierInfo.ratePercent}% <span className="text-lg text-slate-300 font-semibold">{isBn ? "কমিশন রেট" : "Rate"}</span>
              </div>
              {tierInfo.nextTier && (
                <p className="text-xs text-slate-400 mt-1">
                  {isBn ? `পরবর্তী টিয়ার: ${tierInfo.nextTier}` : `Next tier: ${tierInfo.nextTier}`}
                </p>
              )}
            </div>

            {tierInfo.nextTier && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Progress: {totalReferredOrders} Orders</span>
                  <span>{tierInfo.ordersNeeded} orders to go</span>
                </div>
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-[#FC5C03] via-yellow-400 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(100, Math.max(10, ((totalReferredOrders) / (totalReferredOrders + tierInfo.ordersNeeded)) * 100))}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-400">
                  {isBn
                    ? `আরও ${tierInfo.ordersNeeded} টি অর্ডার বা ৳${tierInfo.gmvNeeded} সেল সম্পন্ন হলে টিয়ার আপগ্রেড হবে।`
                    : `Reach ${tierInfo.ordersNeeded} more orders or ৳${tierInfo.gmvNeeded} GMV to unlock next tier rate.`}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{isBn ? "সেলফ-রেফারেল সম্পূর্ণ নিষিদ্ধ ও সুরক্ষিত।" : "Strict fraud guard: Self-referrals strictly blocked."}</span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
          <button
            onClick={() => setActiveTab("commissions")}
            className={`px-6 py-4 text-sm font-black transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "commissions"
                ? "border-[#FC5C03] text-[#FC5C03] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isBn ? "কমিশন ও অর্ডার হিস্ট্রি" : "Commissions Ledger"} ({commissions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`px-6 py-4 text-sm font-black transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "payouts"
                ? "border-[#FC5C03] text-[#FC5C03] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{isBn ? "পেআউট রিকোয়েস্ট হিস্ট্রি" : "Payout Requests"} ({payouts.length})</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === "commissions" && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-black">
                      <th className="p-4 border-b border-slate-200">Order ID / Date</th>
                      <th className="p-4 border-b border-slate-200">Products</th>
                      <th className="p-4 border-b border-slate-200">Order Total</th>
                      <th className="p-4 border-b border-slate-200">Rate</th>
                      <th className="p-4 border-b border-slate-200">Commission Earned</th>
                      <th className="p-4 border-b border-slate-200">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {commissions.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 font-mono">#{item.orderNumber}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(item.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs font-semibold text-slate-800 max-w-[240px] truncate">
                            {item.productNames?.length > 0 ? item.productNames.join(", ") : "AI Subscription / Product"}
                          </div>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {formatPrice(item.orderTotalBDT)}
                        </td>
                        <td className="p-4 text-slate-600 font-bold">
                          {item.commissionRatePercent}%
                        </td>
                        <td className="p-4 font-black text-emerald-600">
                          {formatPrice(item.commissionAmountBDT || item.amount)}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(item.status)}`}>
                              {item.status === "PENDING" ? (isBn ? "হোল্ডিং (রিফান্ড উইন্ডো)" : "HOLDING") : item.status}
                            </span>
                            {item.holdingReleaseDate && item.status === "PENDING" && (
                              <div className="text-[10px] text-amber-600 font-medium">
                                Matures: {new Date(item.holdingReleaseDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {commissions.length === 0 && (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <Layers className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-bold text-sm">No commissions recorded yet</p>
                    <p className="text-xs text-slate-400">Share your referral link to earn commissions on your friends orders.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "payouts" && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-black">
                      <th className="p-4 border-b border-slate-200">Payout ID / Date</th>
                      <th className="p-4 border-b border-slate-200">Method & Account</th>
                      <th className="p-4 border-b border-slate-200">Amount</th>
                      <th className="p-4 border-b border-slate-200">Transaction ID</th>
                      <th className="p-4 border-b border-slate-200">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 font-mono">#{payout.id.slice(-8)}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(payout.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-xs font-bold text-slate-800">
                            {payout.payoutMethod}
                          </div>
                          <div className="text-xs text-slate-600 mt-1 font-mono">
                            {payout.payoutPhone || payout.payoutBankDetails || "Internal Wallet"}
                          </div>
                        </td>
                        <td className="p-4 font-black text-slate-900">
                          {formatPrice(payout.amountBDT)}
                        </td>
                        <td className="p-4 text-xs font-mono text-slate-600">
                          {payout.payoutTrxId || <span className="text-slate-400">Processing</span>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(payout.status)}`}>
                            {payout.status}
                          </span>
                          {payout.adminNotes && (
                            <div className="text-[11px] text-slate-500 mt-1 italic">
                              Note: {payout.adminNotes}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {payouts.length === 0 && (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <Wallet className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-bold text-sm">No payout requests submitted</p>
                    <p className="text-xs text-slate-400">Once your available balance reaches ৳500, request a payout anytime.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">
                {isBn ? "রেফারেল QR কোড" : "Referral QR Code"}
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Affiliate QR Code" className="w-64 h-64 object-contain rounded-xl" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-slate-400">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="text-xs font-mono text-slate-600 break-all px-2">
              {referralLink}
            </div>

            <div className="flex gap-2">
              {qrCodeUrl && (
                <a
                  href={qrCodeUrl}
                  download={`aihaat-ref-${referralCode}.png`}
                  className="flex-1 py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR</span>
                </a>
              )}
              <button
                onClick={handleCopyLink}
                className="flex-1 py-3 bg-[#FC5C03] hover:bg-[#E55302] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span>{isCopied ? "Copied" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {payoutSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {isBn ? "পেআউট রিকোয়েস্ট সফল হয়েছে!" : "Payout Request Submitted!"}
                </h3>
                <p className="text-sm text-slate-600">
                  {isBn
                    ? "আপনার পেআউট রিকোয়েস্ট এডমিন পর্যালোচনার জন্য জমা হয়েছে। যাচাই শেষে দ্রুত পেমেন্ট সম্পন্ন করা হবে।"
                    : "Your payout request has been queued. Our admin team will verify and dispatch funds shortly."}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {isBn ? "পেআউট রিকোয়েস্ট জমা দিন" : "Request Affiliate Payout"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Available Balance: <strong className="text-emerald-600">{formatPrice(availableEarnings)}</strong> (Min. ৳500)
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPayoutModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handlePayoutSubmit} className="p-6 space-y-5">
                  {payoutError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{payoutError}</span>
                    </div>
                  )}

                  {/* Method Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600">
                      {isBn ? "পেআউট মেথড নির্বাচন করুন" : "Select Payout Method"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: "WALLET", label: "Instant Wallet", icon: Wallet },
                        { id: "BKASH", label: "bKash", icon: Smartphone },
                        { id: "NAGAD", label: "Nagad", icon: Smartphone },
                        { id: "ROCKET", label: "Rocket", icon: Smartphone },
                        { id: "BANK", label: "Bank Transfer", icon: Building },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = payoutMethod === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPayoutMethod(item.id as any)}
                            className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                              isSelected
                                ? "border-[#FC5C03] bg-orange-50/50 text-[#FC5C03] font-black"
                                : "border-slate-200 text-slate-600 hover:border-slate-300 font-bold"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{isBn ? "উত্তোলনের পরিমাণ (৳)" : "Withdrawal Amount (৳)"}</span>
                      <span className="text-slate-400">Min ৳500</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="500"
                        max={availableEarnings}
                        required
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        placeholder="e.g. 1500"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FC5C03]/20 focus:border-[#FC5C03]"
                      />
                      <button
                        type="button"
                        onClick={() => setPayoutAmount(String(availableEarnings))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#FC5C03] px-2 py-1 bg-orange-100 rounded-md"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  {/* MFS Account Details */}
                  {["BKASH", "NAGAD", "ROCKET"].includes(payoutMethod) && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-4">
                        <label className="text-xs font-bold text-slate-700">Account Type:</label>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="accountType"
                              checked={payoutAccountType === "Personal"}
                              onChange={() => setPayoutAccountType("Personal")}
                            />
                            <span>Personal</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="accountType"
                              checked={payoutAccountType === "Merchant"}
                              onChange={() => setPayoutAccountType("Merchant")}
                            />
                            <span>Merchant</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">
                          {payoutMethod} Mobile Number
                        </label>
                        <input
                          type="tel"
                          required
                          value={payoutPhone}
                          onChange={(e) => setPayoutPhone(e.target.value)}
                          placeholder="e.g. 017XXXXXXXX"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#FC5C03]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Bank Details */}
                  {payoutMethod === "BANK" && (
                    <div className="space-y-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Bank Name *</label>
                          <input
                            type="text"
                            required
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="e.g. Dutch-Bangla Bank"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Account Name *</label>
                          <input
                            type="text"
                            required
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder="e.g. Ahsan Habib"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Account Number *</label>
                        <input
                          type="text"
                          required
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="e.g. 115.120.XXXX"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Branch Name</label>
                          <input
                            type="text"
                            value={branchName}
                            onChange={(e) => setBranchName(e.target.value)}
                            placeholder="e.g. Gulshan Branch"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Routing Number</label>
                          <input
                            type="text"
                            value={routingNumber}
                            onChange={(e) => setRoutingNumber(e.target.value)}
                            placeholder="e.g. 09027XXXX"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {payoutMethod === "WALLET" && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                      ⚡ <strong>Instant Credit:</strong> Approved wallet payouts will instantly credit your AI Haat internal wallet with zero fees.
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={payoutSubmitting || availableEarnings < 500}
                      className="w-full py-3.5 bg-[#FC5C03] hover:bg-[#E55302] text-white text-sm font-black rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {payoutSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>{isBn ? "পেআউট রিকোয়েস্ট সাবমিট করুন" : "Submit Payout Request"}</span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
