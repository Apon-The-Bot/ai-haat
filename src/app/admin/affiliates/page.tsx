"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  RefreshCw, 
  Search, 
  Filter, 
  Wallet, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Edit,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Send,
  Building,
  Smartphone,
  Info
} from "lucide-react";

export default function AdminAffiliatesPage() {
  const [activeTab, setActiveTab] = useState<"payouts" | "partners" | "commissions">("payouts");
  const [payoutStatusFilter, setPayoutStatusFilter] = useState("All");
  const [partnerTierFilter, setPartnerTierFilter] = useState("All");
  const [commissionStatusFilter, setCommissionStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [summaryData, setSummaryData] = useState<any>(null);
  const [partners, setPartners] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [commissionsSummary, setCommissionsSummary] = useState<any>(null);

  // Modals state
  const [walletPayoutModalOpen, setWalletPayoutModalOpen] = useState(false);
  const [mfsPayoutModalOpen, setMfsPayoutModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [editTierModalOpen, setEditTierModalOpen] = useState(false);
  const [releaseHoldingLoading, setReleaseHoldingLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState("");

  // Selected item state for modals
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  
  // Modal inputs
  const [mfsTrxId, setMfsTrxId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [editTier, setEditTier] = useState("BRONZE");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [customRate, setCustomRate] = useState("");
  const [actionProcessing, setActionProcessing] = useState(false);

  // Fetch all admin data
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [affiliatesRes, payoutsRes, commissionsRes] = await Promise.all([
        fetch("/api/admin/affiliates"),
        fetch("/api/admin/affiliates/payouts"),
        fetch("/api/admin/affiliates/commissions"),
      ]);

      if (affiliatesRes.ok) {
        const affJson = await affiliatesRes.json();
        if (affJson.success) {
          setPartners(affJson.data || []);
          setSummaryData(affJson.summary);
        }
      }

      if (payoutsRes.ok) {
        const payJson = await payoutsRes.json();
        if (payJson.success) {
          setPayouts(payJson.data || []);
        }
      }

      if (commissionsRes.ok) {
        const commJson = await commissionsRes.json();
        if (commJson.success) {
          setCommissions(commJson.data || []);
          setCommissionsSummary(commJson.summary);
        }
      }
    } catch (err) {
      console.error("Failed to load admin affiliate data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(""), 4000);
  };

  // 1. Process Instant Wallet Payout
  const handleApproveWallet = async () => {
    if (!selectedPayout) return;
    setActionProcessing(true);
    try {
      const res = await fetch("/api/admin/affiliates/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: selectedPayout.id,
          action: "APPROVE_WALLET",
          adminNotes: "Credited instantly to user wallet balance",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Wallet payout failed");

      setWalletPayoutModalOpen(false);
      showNotification(`Successfully credited ৳${selectedPayout.amountBDT} to user's wallet!`);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to approve wallet payout");
    } finally {
      setActionProcessing(false);
    }
  };

  // 2. Complete External MFS / Bank Payout
  const handleCompleteMfs = async () => {
    if (!selectedPayout || !mfsTrxId.trim()) return;
    setActionProcessing(true);
    try {
      const res = await fetch("/api/admin/affiliates/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: selectedPayout.id,
          action: "COMPLETE_MFS",
          payoutTrxId: mfsTrxId.trim(),
          adminNotes: adminNotes.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "MFS payout completion failed");

      setMfsPayoutModalOpen(false);
      setMfsTrxId("");
      setAdminNotes("");
      showNotification(`Payout #${selectedPayout.id.slice(-6)} marked as COMPLETED (TrxID: ${mfsTrxId.trim()})`);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to complete payout");
    } finally {
      setActionProcessing(false);
    }
  };

  // 3. Reject Payout with Refund
  const handleRejectPayout = async () => {
    if (!selectedPayout || !rejectReason.trim()) return;
    setActionProcessing(true);
    try {
      const res = await fetch("/api/admin/affiliates/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: selectedPayout.id,
          action: "REJECT",
          adminNotes: rejectReason.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Payout rejection failed");

      setRejectModalOpen(false);
      setRejectReason("");
      showNotification(`Payout #${selectedPayout.id.slice(-6)} rejected and ৳${selectedPayout.amountBDT} refunded to partner.`);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to reject payout");
    } finally {
      setActionProcessing(false);
    }
  };

  // 4. Update Partner Tier / Rate
  const handleSavePartnerTier = async () => {
    if (!selectedPartner) return;
    setActionProcessing(true);
    try {
      const res = await fetch(`/api/admin/affiliates/${selectedPartner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: editTier,
          status: editStatus,
          customRatePercent: editTier === "CUSTOM" && customRate ? parseFloat(customRate) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to update partner");

      setEditTierModalOpen(false);
      showNotification(`Updated affiliate profile for ${selectedPartner.user?.name || selectedPartner.referralCode}`);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to update partner");
    } finally {
      setActionProcessing(false);
    }
  };

  // 5. Release Matured Holding Commissions
  const handleReleaseMaturedCommissions = async () => {
    setReleaseHoldingLoading(true);
    try {
      const res = await fetch("/api/admin/affiliates/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RELEASE_HOLDING", holdingDays: 7 }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to release holding commissions");

      showNotification(json.message || "Matured commissions released successfully!");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to release matured commissions");
    } finally {
      setReleaseHoldingLoading(false);
    }
  };

  // Filtered lists
  const filteredPayouts = payouts.filter((p) => {
    const statusMatch =
      payoutStatusFilter === "All" ||
      p.status.toUpperCase() === payoutStatusFilter.toUpperCase();
    const queryMatch =
      !searchQuery ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.payoutPhone?.includes(searchQuery);
    return statusMatch && queryMatch;
  });

  const filteredPartners = partners.filter((p) => {
    const tierMatch =
      partnerTierFilter === "All" ||
      p.tier.toUpperCase() === partnerTierFilter.toUpperCase();
    const queryMatch =
      !searchQuery ||
      p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.referralCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customSlug?.toLowerCase().includes(searchQuery.toLowerCase());
    return tierMatch && queryMatch;
  });

  const filteredCommissions = commissions.filter((c) => {
    const statusMatch =
      commissionStatusFilter === "All" ||
      c.status.toUpperCase() === commissionStatusFilter.toUpperCase();
    const queryMatch =
      !searchQuery ||
      c.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partnerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partnerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.referralCode?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && queryMatch;
  });

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-bold">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-orange-50 text-[#FC5C03] border border-orange-100 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Growth & Partner Subsystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Affiliate Network & Payout Operations
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            অ্যাফিলিয়েট পার্টনার, মাল্টি-টিয়ার কমিশন ও পেআউট অনুমোদন ম্যানেজমেন্ট
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button 
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-black rounded-xl text-sm font-bold shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#FC5C03]" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleReleaseMaturedCommissions}
            disabled={releaseHoldingLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-sm transition-all"
            title="Release commissions older than 7-day refund window"
          >
            <Clock className={`w-4 h-4 text-yellow-400 ${releaseHoldingLoading ? "animate-spin" : ""}`} />
            <span>Release Matured Holding (7d)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Payouts */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle className="w-16 h-16 text-amber-500" />
          </div>
          <div className="flex items-center gap-2 text-amber-600">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider">Pending Payouts Queue</span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              ৳ {summaryData?.pendingPayoutsAmount?.toLocaleString() || "0"}
            </div>
            <div className="text-xs font-bold text-amber-600 mt-0.5">
              {summaryData?.pendingPayoutsCount || 0} requests awaiting review
            </div>
          </div>
        </div>

        {/* Total Paid Out */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="flex items-center gap-2 text-emerald-600">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider">Total Commissions Paid</span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              ৳ {summaryData?.totalPaidOut?.toLocaleString() || "0"}
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-0.5">
              Completed via Wallet / MFS / Bank
            </div>
          </div>
        </div>

        {/* Total Referred GMV */}
        <div className="bg-white p-5 rounded-2xl border border-indigo-200 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-16 h-16 text-indigo-500" />
          </div>
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider">Total Referred GMV</span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              ৳ {summaryData?.totalReferredGMV?.toLocaleString() || "0"}
            </div>
            <div className="text-xs font-bold text-indigo-600 mt-0.5">
              Total Order Volume Generated
            </div>
          </div>
        </div>

        {/* Active Partners */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-sm flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-16 h-16 text-purple-500" />
          </div>
          <div className="flex items-center gap-2 text-purple-600">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider">Active Partners</span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {summaryData?.activePartnersCount || partners.length}
            </div>
            <div className="text-xs font-bold text-purple-600 mt-0.5">
              Across Bronze, Silver, Gold, Custom
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-slate-200 bg-slate-50/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab("payouts")}
            className={`px-6 py-4 text-sm font-black transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "payouts"
                ? "border-[#FC5C03] text-[#FC5C03] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Payout Requests Queue</span>
            {payouts.filter((p) => p.status === "REQUESTED").length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500 text-white">
                {payouts.filter((p) => p.status === "REQUESTED").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("partners")}
            className={`px-6 py-4 text-sm font-black transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "partners"
                ? "border-[#FC5C03] text-[#FC5C03] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Partner Directory ({partners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("commissions")}
            className={`px-6 py-4 text-sm font-black transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === "commissions"
                ? "border-[#FC5C03] text-[#FC5C03] bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Commission Ledger ({commissions.length})</span>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* TAB 1: PAYOUTS QUEUE */}
          {activeTab === "payouts" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase mr-1">Status:</span>
                  {["All", "REQUESTED", "COMPLETED", "REJECTED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setPayoutStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        payoutStatusFilter === status
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {status === "All" ? "All Statuses" : status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search partner, phone, ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FC5C03]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-black">
                      <th className="p-4 border-b border-slate-200">Payout ID / Date</th>
                      <th className="p-4 border-b border-slate-200">Partner Details</th>
                      <th className="p-4 border-b border-slate-200">Amount</th>
                      <th className="p-4 border-b border-slate-200">Method & Target</th>
                      <th className="p-4 border-b border-slate-200">Status & TrxID</th>
                      <th className="p-4 border-b border-slate-200 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredPayouts.map((payout) => {
                      const isPending = payout.status === "REQUESTED" || payout.status === "PROCESSING";
                      return (
                        <tr key={payout.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900 font-mono">#{payout.id.slice(-8)}</div>
                            <div className="text-xs text-slate-500">
                              {new Date(payout.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900">
                              {payout.user?.name || payout.affiliateProfile?.user?.name || "Partner"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {payout.user?.email || payout.affiliateProfile?.user?.email}
                            </div>
                            {payout.affiliateProfile?.referralCode && (
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                Code: {payout.affiliateProfile.referralCode}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-black text-slate-900 text-base">
                              ৳ {payout.amountBDT?.toLocaleString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-800">
                              {payout.payoutMethod === "WALLET" && <Wallet className="w-3.5 h-3.5 text-[#FC5C03]" />}
                              {payout.payoutMethod === "BANK" && <Building className="w-3.5 h-3.5 text-blue-600" />}
                              {["BKASH", "NAGAD", "ROCKET"].includes(payout.payoutMethod) && <Smartphone className="w-3.5 h-3.5 text-pink-600" />}
                              <span>{payout.payoutMethod}</span>
                            </div>
                            <div className="text-xs font-mono text-slate-600 mt-1 max-w-xs truncate">
                              {payout.payoutPhone || payout.payoutBankDetails || "Internal Wallet"}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                                payout.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : payout.status === "REJECTED"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {payout.status}
                            </span>
                            {payout.payoutTrxId && (
                              <div className="text-xs font-mono text-slate-600 mt-1">
                                TrxID: {payout.payoutTrxId}
                              </div>
                            )}
                            {payout.adminNotes && (
                              <div className="text-[11px] text-slate-500 mt-1 italic">
                                {payout.adminNotes}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-right space-x-2 whitespace-nowrap">
                            {isPending ? (
                              <>
                                {payout.payoutMethod === "WALLET" ? (
                                  <button
                                    onClick={() => {
                                      setSelectedPayout(payout);
                                      setWalletPayoutModalOpen(true);
                                    }}
                                    className="px-3.5 py-1.5 bg-[#FC5C03] hover:bg-[#E55302] text-white text-xs font-black rounded-lg transition-colors shadow-sm"
                                  >
                                    Approve Wallet
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedPayout(payout);
                                      setMfsPayoutModalOpen(true);
                                    }}
                                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-lg transition-colors shadow-sm"
                                  >
                                    Complete MFS/Bank
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedPayout(payout);
                                    setRejectModalOpen(true);
                                  }}
                                  className="px-3.5 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">
                                Reviewed by {payout.reviewedBy || "Admin"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredPayouts.length === 0 && (
                  <div className="p-12 text-center text-slate-500 font-bold text-sm">
                    No payouts matching filter criteria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PARTNER DIRECTORY */}
          {activeTab === "partners" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, ref code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FC5C03]"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-slate-400" />
                  {["All", "BRONZE", "SILVER", "GOLD", "CUSTOM"].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setPartnerTierFilter(tier)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        partnerTierFilter === tier
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-black">
                      <th className="p-4 border-b border-slate-200">Partner</th>
                      <th className="p-4 border-b border-slate-200">Referral Code / Slug</th>
                      <th className="p-4 border-b border-slate-200">Tier & Commission Rate</th>
                      <th className="p-4 border-b border-slate-200">Performance</th>
                      <th className="p-4 border-b border-slate-200">Financials (৳)</th>
                      <th className="p-4 border-b border-slate-200 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredPartners.map((partner) => {
                      const tierBadgeStyle =
                        partner.tier === "GOLD"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : partner.tier === "SILVER"
                          ? "bg-slate-200 text-slate-800 border-slate-300"
                          : partner.tier === "BRONZE"
                          ? "bg-orange-100 text-orange-800 border-orange-200"
                          : "bg-purple-100 text-purple-800 border-purple-200";

                      const rateDisplay =
                        partner.tier === "CUSTOM" && partner.customRatePercent
                          ? `${partner.customRatePercent}%`
                          : partner.tier === "GOLD"
                          ? "12%"
                          : partner.tier === "SILVER"
                          ? "8%"
                          : "5%";

                      return (
                        <tr key={partner.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{partner.user?.name || "Affiliate Partner"}</div>
                            <div className="text-xs text-slate-500">{partner.user?.email || "No email"}</div>
                            {partner.status !== "ACTIVE" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-100 text-red-700 mt-1 inline-block">
                                {partner.status}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                              {partner.referralCode}
                            </span>
                            {partner.customSlug && (
                              <div className="text-xs text-slate-500 mt-1 font-mono">
                                slug: {partner.customSlug}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${tierBadgeStyle}`}>
                                {partner.tier}
                              </span>
                              <span className="text-sm font-black text-slate-900">{rateDisplay}</span>
                            </div>
                          </td>
                          <td className="p-4 text-xs space-y-0.5">
                            <div className="text-slate-600">
                              <strong className="text-slate-900">{partner.totalClicks}</strong> Clicks
                            </div>
                            <div className="text-slate-600">
                              <strong className="text-slate-900">{partner.totalOrdersCount}</strong> Orders
                            </div>
                            <div className="text-emerald-600 font-bold">
                              {partner.totalClicks > 0
                                ? `${Math.round((partner.totalOrdersCount / partner.totalClicks) * 1000) / 10}% conv.`
                                : "0% conv."}
                            </div>
                          </td>
                          <td className="p-4 text-xs space-y-0.5">
                            <div className="text-slate-600">
                              GMV: <strong className="text-slate-900">৳ {partner.totalReferredGMVBDT?.toLocaleString()}</strong>
                            </div>
                            <div className="text-slate-600">
                              Earned: <strong className="text-emerald-600">৳ {partner.totalEarnedBDT?.toLocaleString()}</strong>
                            </div>
                            <div className="text-slate-600">
                              Available: <strong className="text-amber-600">৳ {partner.earningsBalanceBDT?.toLocaleString()}</strong>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedPartner(partner);
                                setEditTier(partner.tier);
                                setEditStatus(partner.status || "ACTIVE");
                                setCustomRate(partner.customRatePercent ? String(partner.customRatePercent) : "");
                                setEditTierModalOpen(true);
                              }}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 text-xs font-bold"
                              title="Edit Tier / Custom Rate"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredPartners.length === 0 && (
                  <div className="p-12 text-center text-slate-500 font-bold text-sm">
                    No partners found matching criteria.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: COMMISSION LEDGER */}
          {activeTab === "commissions" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase mr-1">Status:</span>
                  {["All", "PENDING", "APPROVED", "PAID", "CANCELLED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setCommissionStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        commissionStatusFilter === status
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {status === "PENDING" ? "HOLDING / PENDING" : status}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search order #, partner email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FC5C03]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-black">
                      <th className="p-4 border-b border-slate-200">Order ID / Date</th>
                      <th className="p-4 border-b border-slate-200">Affiliate Partner</th>
                      <th className="p-4 border-b border-slate-200">Order Total</th>
                      <th className="p-4 border-b border-slate-200">Commission Rate</th>
                      <th className="p-4 border-b border-slate-200">Commission Earned</th>
                      <th className="p-4 border-b border-slate-200">Status & Release</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredCommissions.map((comm) => (
                      <tr key={comm.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 font-mono">#{comm.orderNumber}</div>
                          <div className="text-xs text-slate-500">
                            {new Date(comm.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          {comm.products?.length > 0 && (
                            <div className="text-[11px] text-slate-600 max-w-xs truncate mt-0.5">
                              {comm.products.join(", ")}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{comm.partnerName}</div>
                          <div className="text-xs text-slate-500">{comm.partnerEmail}</div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            Code: {comm.referralCode}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-900">
                          ৳ {comm.orderTotalBDT?.toLocaleString()}
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                          {comm.commissionRatePercent}%
                        </td>
                        <td className="p-4 font-black text-emerald-600">
                          ৳ {comm.commissionAmountBDT?.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                              comm.status === "APPROVED" || comm.status === "PAID"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : comm.status === "CANCELLED"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {comm.status === "PENDING" ? "HOLDING" : comm.status}
                          </span>
                          {comm.status === "PENDING" && (
                            <div className="text-[10px] text-slate-500 mt-1">
                              Matures: {new Date(comm.holdingReleaseDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                              {comm.isMatured && <span className="ml-1 text-emerald-600 font-bold">(Ready)</span>}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredCommissions.length === 0 && (
                  <div className="p-12 text-center text-slate-500 font-bold text-sm">
                    No commissions found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Wallet Payout Modal */}
      {walletPayoutModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Approve Instant Wallet Payout</h2>
              <button onClick={() => setWalletPayoutModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-[#FC5C03] font-bold">
                ⚡ This will instantly credit <strong>৳ {selectedPayout.amountBDT}</strong> to the user&apos;s internal wallet balance and mark the payout as COMPLETED.
              </div>
              <div className="text-xs space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-slate-500">Partner: <strong className="text-slate-900">{selectedPayout.user?.name} ({selectedPayout.user?.email})</strong></p>
                <p className="text-slate-500">Amount: <strong className="text-slate-900 text-sm">৳ {selectedPayout.amountBDT}</strong></p>
                <p className="text-slate-500">Method: <strong className="text-slate-900">Wallet</strong></p>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setWalletPayoutModalOpen(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleApproveWallet}
                disabled={actionProcessing}
                className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#E55302] text-white font-black rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                {actionProcessing ? "Processing..." : "Confirm Wallet Credit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Manual MFS / Bank Payout Modal */}
      {mfsPayoutModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Complete External Payout</h2>
              <button onClick={() => setMfsPayoutModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-xs space-y-1.5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-slate-500">Method: <strong className="text-slate-900">{selectedPayout.payoutMethod}</strong></p>
                <p className="text-slate-500">Target: <strong className="text-slate-900 font-mono">{selectedPayout.payoutPhone || selectedPayout.payoutBankDetails}</strong></p>
                <p className="text-slate-500">Amount: <strong className="text-slate-900 text-sm">৳ {selectedPayout.amountBDT}</strong></p>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Transaction ID (TrxID) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={mfsTrxId}
                  onChange={(e) => setMfsTrxId(e.target.value)}
                  placeholder="e.g. 9JA81920XA"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#FC5C03]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Admin Notes / Proof Receipt (Optional)
                </label>
                <textarea 
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Paid via bKash Merchant API or reference notes"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none h-20 focus:outline-none focus:border-[#FC5C03]"
                />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setMfsPayoutModalOpen(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleCompleteMfs}
                disabled={!mfsTrxId.trim() || actionProcessing}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                {actionProcessing ? "Saving..." : "Mark as Completed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Reject Payout Modal */}
      {rejectModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Reject Payout Request</h2>
              <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold">
                ⚠️ Rejecting this request will automatically refund <strong>৳ {selectedPayout.amountBDT}</strong> back to the affiliate&apos;s available earnings balance.
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Invalid bKash account number or account suspended."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-500 resize-none h-24"
                />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectPayout}
                disabled={!rejectReason.trim() || actionProcessing}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                {actionProcessing ? "Rejecting..." : "Reject & Refund Balance"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit Tier / Custom Rate Modal */}
      {editTierModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Edit Partner Tier & Rate</h2>
              <button onClick={() => setEditTierModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-xs space-y-1 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-slate-500">Partner: <strong className="text-slate-900">{selectedPartner.user?.name || "Partner"}</strong></p>
                <p className="text-slate-500">Email: <strong className="text-slate-900">{selectedPartner.user?.email}</strong></p>
                <p className="text-slate-500">Code: <strong className="text-slate-900 font-mono">{selectedPartner.referralCode}</strong></p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Commission Tier</label>
                <select 
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#FC5C03]"
                >
                  <option value="BRONZE">Bronze (5% Standard)</option>
                  <option value="SILVER">Silver (8% Tier)</option>
                  <option value="GOLD">Gold (12% VIP Tier)</option>
                  <option value="CUSTOM">Custom Commission Rate (%)</option>
                </select>
              </div>

              {editTier === "CUSTOM" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Custom Commission Rate (%)
                  </label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="1"
                    max="50"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    placeholder="e.g. 15 for 15%"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#FC5C03]"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Account Status</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#FC5C03]"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING_REVIEW">PENDING REVIEW</option>
                  <option value="SUSPENDED">SUSPENDED (Payouts blocked)</option>
                </select>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={() => setEditTierModalOpen(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePartnerTier}
                disabled={actionProcessing || (editTier === "CUSTOM" && !customRate)}
                className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#E55302] text-white font-black rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                {actionProcessing ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
