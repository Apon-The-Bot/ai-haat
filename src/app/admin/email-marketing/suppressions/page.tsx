"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldBan,
  Search,
  RefreshCw,
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  UserX,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

interface SuppressionItem {
  id: string;
  email: string;
  reason: string;
  source: string;
  createdAt: string;
}

export default function AdminSuppressionsPage() {
  const { showToast } = useToast();

  const [suppressions, setSuppressions] = useState<SuppressionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterReason, setFilterReason] = useState("ALL");

  // Add suppression modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newReason, setNewReason] = useState("ADMIN_BLOCK");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deletingItem, setDeletingItem] = useState<SuppressionItem | null>(null);

  const fetchSuppressions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/email-marketing/suppressions");
      if (res.ok) {
        const data = await res.json();
        if (data.suppressions) setSuppressions(data.suppressions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppressions();
  }, [fetchSuppressions]);

  const handleAddSuppression = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/email-marketing/suppressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim().toLowerCase(),
          reason: newReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Suppressed ${newEmail.trim()} from marketing broadcasts.`, "success");
        setShowAddModal(false);
        setNewEmail("");
        fetchSuppressions();
      } else {
        showToast(data.error || "Failed to add suppression", "error");
      }
    } catch {
      showToast("Network error adding suppression", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    try {
      const res = await fetch(`/api/admin/email-marketing/suppressions?email=${encodeURIComponent(deletingItem.email)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuppressions((prev) => prev.filter((s) => s.email !== deletingItem.email));
        showToast(`Unsuppressed ${deletingItem.email}.`, "success");
      } else {
        showToast("Failed to remove suppression", "error");
      }
    } catch {
      showToast("Error deleting suppression", "error");
    } finally {
      setDeletingItem(null);
    }
  };

  const filteredSuppressions = suppressions.filter((s) => {
    const matchesSearch = s.email.toLowerCase().includes(search.toLowerCase());
    const matchesReason = filterReason === "ALL" || s.reason === filterReason;
    return matchesSearch && matchesReason;
  });

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldBan className="w-3.5 h-3.5" />
            <span>Anti-Spam &amp; Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Suppression &amp; Unsubscribe List
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Hard global block list. Addresses in this list will NEVER receive promotional broadcasts regardless of audience conditions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Block / Suppression</span>
          </button>

          <button
            onClick={fetchSuppressions}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-bold text-emerald-900 block text-sm">Automated Opt-Out &amp; Zero-Send Protection</span>
          <p className="text-emerald-700 leading-relaxed">
            When a customer clicks <strong>&apos;1-Click Unsubscribe&apos;</strong> in any email header or footer, their address is automatically appended here in real-time. The segmentation engine guarantees they are 100% excluded before any batch dispatch.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
          {[
            { id: "ALL", label: "All Suppressions" },
            { id: "UNSUBSCRIBED", label: "Unsubscribed" },
            { id: "BOUNCED", label: "Hard Bounced" },
            { id: "COMPLAINED", label: "Spam Complaint" },
            { id: "ADMIN_BLOCK", label: "Admin Block" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterReason(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterReason === tab.id
                  ? "bg-white text-[#FC5C03] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppressed email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
          />
        </div>
      </div>

      {/* Suppressions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3.5 px-5">Suppressed Email</th>
                <th className="py-3.5 px-5">Reason</th>
                <th className="py-3.5 px-5">Source / Origin</th>
                <th className="py-3.5 px-5">Date Blocked</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSuppressions.length > 0 ? (
                filteredSuppressions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      {s.email}
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          s.reason === "UNSUBSCRIBED"
                            ? "bg-amber-100 text-amber-800"
                            : s.reason === "BOUNCED"
                            ? "bg-purple-100 text-purple-800"
                            : s.reason === "COMPLAINED"
                            ? "bg-red-100 text-red-800 font-black"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {s.reason}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                      {s.source || "UNSUBSCRIBE_LINK"}
                    </td>

                    <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setDeletingItem(s)}
                        className="px-3 py-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                      >
                        Unblock / Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No suppression records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SUPPRESSION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldBan className="w-4 h-4 text-red-600" />
                <span>Add Email Suppression</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-black font-bold">✕</button>
            </div>

            <form onSubmit={handleAddSuppression} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address to Block *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="spam@example.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Suppression Reason</label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="ADMIN_BLOCK">Admin Manual Block</option>
                  <option value="UNSUBSCRIBED">Manual Unsubscribe Request</option>
                  <option value="BOUNCED">Undeliverable / Hard Bounce</option>
                  <option value="COMPLAINED">Spam Complaint / Flag</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add to Blocklist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={confirmDelete}
        title="Unsuppress Email Address"
        message={`Are you sure you want to remove ${deletingItem?.email} from the suppression list? They will become eligible for future marketing broadcasts.`}
        confirmText="Unblock Address"
        cancelText="Cancel"
        variant="primary"
      />

    </div>
  );
}