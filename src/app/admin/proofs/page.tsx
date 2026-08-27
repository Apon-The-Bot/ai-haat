"use client";

import React, { useState } from "react";
import { ShieldCheck, Plus, Trash2, Check, X, Star } from "lucide-react";
import { PROOFS as initialProofs } from "@/data/proofs";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function AdminProofsPage() {
  const { showToast } = useToast();
  const [proofList, setProofList] = useState(initialProofs);
  const [deletingProofId, setDeletingProofId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const confirmDelete = () => {
    if (!deletingProofId) return;
    setProofList((prev) => prev.filter((p) => p.id !== deletingProofId));
    showToast("ডেলিভারি প্রুফ সফলভাবে মুছে ফেলা হয়েছে।", "success");
    setDeletingProofId(null);
  };

  const handleAddProof = (e: React.FormEvent) => {
    e.preventDefault();
    const newProof = {
      id: `prf-${Date.now()}`,
      orderId: orderId || `AH-${Math.floor(10000 + Math.random() * 90000)}`,
      productName,
      amountBDT: Number(amount) || 290,
      type: "Subscription",
      date: "Today",
      image: "https://images.unsplash.com/photo-1556742049-0a67e557224f?w=400",
      customerNote: customerNote || "Instant delivery received within 5 minutes. Excellent support!",
    };

    setProofList([newProof as any, ...proofList]);
    setIsAddModalOpen(false);
    showToast("New delivery proof published!", "success");
    setOrderId("");
    setProductName("");
    setAmount("");
    setCustomerNote("");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Delivery Proofs & Reviews</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Publish and manage verified customer delivery screenshots and reviews.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Delivery Proof</span>
        </button>
      </div>

      {/* Grid of Proofs (White Theme) */}
      {proofList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proofList.map((proof) => (
            <div
              key={proof.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs relative group"
            >
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

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
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
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
          <div className="max-w-xs mx-auto space-y-2">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 text-sm">No delivery proofs published yet</p>
            <p className="text-xs text-slate-400">Click &apos;+ Add Delivery Proof&apos; above to publish verified customer reviews.</p>
          </div>
        </div>
      )}

      {/* Add Proof Modal (White Theme) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Verified Customer Proof</h3>
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
                  Customer Feedback / Review Note
                </label>
                <textarea
                  rows={3}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Instant delivery received within 5 minutes..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Publish Proof
              </button>
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
