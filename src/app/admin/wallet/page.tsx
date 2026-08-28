"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Copy,
  MessageSquare,
  ShieldCheck,
  User,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useCurrency } from "@/context/CurrencyContext";

interface WalletTransactionItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  currentBalance?: number;
  amountBDT: number;
  type: string;
  method: string;
  senderNumber: string;
  trxId: string;
  status: string;
  note: string;
  date: string;
  createdAt: string;
}

export default function AdminWalletPage() {
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Rejection Dialog Modal
  const [rejectingTx, setRejectingTx] = useState<WalletTransactionItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("TrxID not matching statement");
  const [isProcessingReject, setIsProcessingReject] = useState(false);

  // Manual Balance Adjustment Modal
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjUserEmail, setAdjUserEmail] = useState("");
  const [adjUserId, setAdjUserId] = useState("");
  const [adjType, setAdjType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [isSubmittingAdj, setIsSubmittingAdj] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const params = new URLSearchParams();
        params.set("all", "true");
        params.set("page", String(currentPage));
        params.set("pageSize", String(pageSize));

        if (statusFilter !== "ALL") {
          params.set("status", statusFilter);
        }
        if (search.trim()) {
          params.set("search", search.trim());
        }

        const res = await fetch(`/api/wallet/transactions?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.transactions) {
            setTransactions(data.transactions);
            if (data.pagination) {
              setTotalItems(data.pagination.total);
              setTotalPages(data.pagination.totalPages || 1);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load transactions:", err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [currentPage, pageSize, statusFilter, search]
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Sensible 30-second interval polling (instead of aggressive 4s)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTransactions(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Approve Deposit Request
  const handleApprove = async (tx: WalletTransactionItem) => {
    try {
      const res = await fetch("/api/wallet/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: tx.id,
          status: "APPROVED",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Deposit of ৳${tx.amountBDT} for ${tx.userEmail} approved!`, "success");
        fetchTransactions(true);
      } else {
        showToast(data.error || "Approval failed", "error");
      }
    } catch {
      showToast("Server error during approval", "error");
    }
  };

  // Submit Rejection
  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingTx) return;

    setIsProcessingReject(true);
    try {
      const res = await fetch("/api/wallet/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: rejectingTx.id,
          status: "REJECTED",
          note: rejectionReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Deposit request rejected.`, "info");
        setRejectingTx(null);
        fetchTransactions(true);
      } else {
        showToast(data.error || "Rejection failed", "error");
      }
    } catch {
      showToast("Server error during rejection", "error");
    } finally {
      setIsProcessingReject(false);
    }
  };

  // Submit Manual Balance Adjustment (Credit / Debit)
  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjAmount || Number(adjAmount) <= 0 || !adjReason.trim()) {
      showToast("Please enter a valid amount and audit reason.", "error");
      return;
    }

    setIsSubmittingAdj(true);
    try {
      // Find userId if given email
      let targetUserId = adjUserId;
      if (!targetUserId && adjUserEmail.trim()) {
        const userRes = await fetch(`/api/admin/users?search=${encodeURIComponent(adjUserEmail.trim())}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.users && userData.users.length > 0) {
            targetUserId = userData.users[0].id;
          }
        }
      }

      if (!targetUserId) {
        showToast("Customer not found. Please provide a valid customer email or ID.", "error");
        setIsSubmittingAdj(false);
        return;
      }

      const res = await fetch("/api/wallet/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MANUAL_ADJUSTMENT",
          userId: targetUserId,
          adjustmentType: adjType,
          amountBDT: Number(adjAmount),
          note: adjReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Wallet balance adjusted successfully!", "success");
        setIsAdjustmentModalOpen(false);
        setAdjUserEmail("");
        setAdjUserId("");
        setAdjAmount("");
        setAdjReason("");
        fetchTransactions(true);
      } else {
        showToast(data.error || "Adjustment failed", "error");
      }
    } catch {
      showToast("Server error during adjustment", "error");
    } finally {
      setIsSubmittingAdj(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Wallet className="w-3.5 h-3.5" />
            <span>Financial Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Wallet Top-Ups & Adjustments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Approve bKash/Nagad/Rocket wallet top-up requests, handle manual balance adjustments, and audit balance histories.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manual Adjustment</span>
          </button>

          <button
            onClick={() => fetchTransactions()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh transactions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by TrxID, sender phone, customer email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#FC5C03] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { id: "PENDING", label: "Pending Top-ups" },
              { id: "ALL", label: "All Records" },
              { id: "APPROVED", label: "Approved" },
              { id: "REJECTED", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-white text-[#FC5C03] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-500 hidden lg:block">
            Showing <strong className="text-slate-900">{transactions.length}</strong> of{" "}
            <strong className="text-slate-900">{totalItems}</strong>
          </div>
        </div>
      </div>

      {/* Transactions Table & Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        
        {/* Mobile View: Responsive Stacked Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 space-y-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <strong className="text-slate-900 font-bold text-sm block">{tx.userName}</strong>
                    <span className="text-slate-400 text-[11px] block">{tx.userEmail}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                      tx.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : tx.status === "REJECTED"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    <span>{tx.status}</span>
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-bold uppercase">
                      {tx.method} • {tx.senderNumber || "No Phone"}
                    </span>
                    <strong className="text-slate-900 font-black text-sm">৳{tx.amountBDT}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-mono">
                      TrxID: <strong className="text-[#FC5C03]">{tx.trxId}</strong>
                    </span>
                    <span className="text-slate-400">{tx.date}</span>
                  </div>

                  {tx.note && (
                    <p className="text-[11px] text-slate-500 pt-0.5 border-t border-slate-200/60 mt-1">
                      {tx.note}
                    </p>
                  )}
                </div>

                {tx.status === "PENDING" && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(tx)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve (৳{tx.amountBDT})</span>
                    </button>

                    <button
                      onClick={() => {
                        setRejectingTx(tx);
                        setRejectionReason("TrxID not matching statement");
                      }}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-xs">No wallet transactions found</p>
            </div>
          )}
        </div>

        {/* Desktop View: Full Data Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-4 px-5">Customer</th>
                <th className="py-4 px-5">Method & TrxID</th>
                <th className="py-4 px-5">Amount</th>
                <th className="py-4 px-5">Sender Phone</th>
                <th className="py-4 px-5">Type / Note</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Customer */}
                    <td className="py-4 px-5">
                      <span className="font-bold text-sm text-slate-900 block truncate max-w-[160px]">
                        {tx.userName}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                        {tx.userEmail}
                      </span>
                    </td>

                    {/* Method & TrxID */}
                    <td className="py-4 px-5">
                      <span className="font-bold text-xs text-slate-800 uppercase block">
                        {tx.method}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-xs font-bold text-[#FC5C03]">
                          {tx.trxId}
                        </span>
                        {tx.trxId && tx.trxId !== "N/A" && (
                          <button
                            onClick={() => handleCopy(tx.id, tx.trxId)}
                            className="text-slate-400 hover:text-slate-800 cursor-pointer"
                            title="Copy TrxID"
                          >
                            {copiedId === tx.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-5">
                      <span className="font-black text-sm text-slate-900 block">
                        ৳{tx.amountBDT}
                      </span>
                    </td>

                    {/* Sender Phone */}
                    <td className="py-4 px-5">
                      <span className="font-mono text-xs text-slate-700">
                        {tx.senderNumber || "N/A"}
                      </span>
                    </td>

                    {/* Type & Note */}
                    <td className="py-4 px-5">
                      <span className="font-semibold text-xs text-slate-800 block">
                        {tx.type}
                      </span>
                      {tx.note && (
                        <span className="text-[10.5px] text-slate-500 block truncate max-w-[200px]" title={tx.note}>
                          {tx.note}
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          tx.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : tx.status === "REJECTED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            tx.status === "APPROVED"
                              ? "bg-emerald-500"
                              : tx.status === "REJECTED"
                              ? "bg-red-500"
                              : "bg-amber-500 animate-pulse"
                          }`}
                        />
                        <span>{tx.status}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                      {tx.date}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      {tx.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(tx)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Approve deposit and credit user wallet"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => {
                              setRejectingTx(tx);
                              setRejectionReason("TrxID not matching statement");
                            }}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="Reject deposit request"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Done</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Wallet className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No wallet transactions found</p>
                      <p className="text-xs text-slate-400">Adjust filters or search parameters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-semibold text-slate-500">
            Page <strong className="text-slate-900">{currentPage}</strong> of{" "}
            <strong className="text-slate-900">{totalPages}</strong> ({totalItems} total transactions)
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* REJECTION REASON MODAL */}
      {rejectingTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span>Reject Deposit Request</span>
              </h3>
              <button
                onClick={() => setRejectingTx(null)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <strong className="text-slate-900">{rejectingTx.userName} ({rejectingTx.userEmail})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <strong className="text-slate-900">৳{rejectingTx.amountBDT}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TrxID:</span>
                  <strong className="text-[#FC5C03] font-mono">{rejectingTx.trxId}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Rejection Reason (Sent to Customer):
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this deposit is being rejected..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingTx(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingReject}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isProcessingReject ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL BALANCE ADJUSTMENT MODAL */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#FC5C03]" />
                <span>Manual Wallet Balance Adjustment</span>
              </h3>
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="space-y-4">
              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAdjType("CREDIT")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    adjType === "CREDIT"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span>Credit (+) Add Funds</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjType("DEBIT")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    adjType === "DEBIT"
                      ? "bg-white text-red-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                  <span>Debit (-) Deduct Funds</span>
                </button>
              </div>

              {/* Customer Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Customer Email or User ID *
                </label>
                <input
                  type="text"
                  required
                  value={adjUserEmail}
                  onChange={(e) => setAdjUserEmail(e.target.value)}
                  placeholder="e.g. customer@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Adjustment Amount (৳ BDT) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Audit Reason (Mandatory for audit records) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Manual cashback compensation, refund for cancelled order AH-12345"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdj}
                  className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdj ? "Applying..." : "Apply Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
