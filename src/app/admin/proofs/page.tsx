"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Plus, Trash2, Check, X, Star, RefreshCw } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function AdminProofsPage() {
  const { showToast } = useToast();
  const [proofList, setProofList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingProofId, setDeletingProofId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchProofs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/proofs");
      if (res.ok) {
        const data = await res.json();
        if (data.proofs) {
          setProofList(data.proofs);
        }
      }
    } catch (err) {
      console.error("Failed to load proofs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
  }, []);

  const confirmDelete = async () => {
    if (!deletingProofId) return;
    try {
      const res = await fetch(`/api/admin/proofs?id=${encodeURIComponent(deletingProofId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProofList((prev) => prev.filter((p) => p.id !== deletingProofId));
        showToast("ডেলিভারি প্রুফ সফলভাবে মুছে ফেলা হয়েছে।", "success");
      }
    } catch {
      showToast("Failed to delete proof", "error");
    } finally {
      setDeletingProofId(null);
    }
  };

  const handleAddProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !amount) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/proofs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId.trim() || undefined,
          productName: productName.trim(),
          amountBDT: Number(amount),
          customerNote: customerNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.proof) {
        showToast("New delivery proof published and saved to database!", "success");
        setIsAddModalOpen(false);
        setOrderId("");
        setProductName("");
        setAmount("");
        setCustomerNote("");
        fetchProofs();
      } else {
        showToast(data.error || "Failed to create proof", "error");
      }
    } catch {
      showToast("Server error creating proof", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Social Proof & Trust</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Delivery Proofs & Reviews</h1>
          <p className="text-sm text-slate-500 mt-0.5">Publish and manage verified customer delivery proofs and testimonials with privacy protection.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Delivery Proof</span>
          </button>

          <button
            onClick={fetchProofs}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Grid of Proofs */}
      {proofList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proofList.map((proof) => (
            <div
              key={proof.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs relative group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#FC5C03]">{proof.orderId}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{proof.date}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{proof.productName}</h4>
                  <span className="text-xs font-bold text-emerald-600">৳{proof.amountBDT}</span>
                </div>

                <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                  &ldquo;{proof.customerNote}&rdquo;
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                <button
                  onClick={() => setDeletingProofId(proof.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete Proof"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-700 text-sm">No delivery proofs published yet</p>
          <p className="text-xs text-slate-400 mt-0.5">Click &apos;+ Add Delivery Proof&apos; above to publish verified reviews.</p>
        </div>
      )}

      {/* Add Proof Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Verified Customer Proof</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProof} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. ChatGPT Plus 1 Month"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="AH-XXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount (৳ BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="290"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Review Note
                </label>
                <textarea
                  rows={3}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Instant delivery received within 5 minutes..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Publishing..." : "Publish Proof"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deletingProofId)}
        onClose={() => setDeletingProofId(null)}
        onConfirm={confirmDelete}
        title="ডেলিভারি প্রুফ মুছে ফেলা নিশ্চিতকরণ"
        message="আপনি কি নিশ্চিতভাবে এই কাস্টমার রিভিউ ও প্রুফটি মুছে ফেলতে চান?"
        confirmText="মুছে ফেলুন"
        cancelText="বাতিল"
        variant="danger"
      />

    </div>
  );
}
