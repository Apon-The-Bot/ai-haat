"use client";

import React, { useState } from "react";
import { ShieldCheck, Plus, Trash2, Check, X, Star } from "lucide-react";
import { PROOFS as initialProofs } from "@/data/proofs";
import { useToast } from "@/context/ToastContext";

export default function AdminProofsPage() {
  const { showToast } = useToast();
  const [proofList, setProofList] = useState(initialProofs);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const handleDelete = (id: string) => {
    if (confirm("আপনি কি নিশ্চিত এই প্রুফটি মুছে ফেলতে চান?")) {
      setProofList((prev) => prev.filter((p) => p.id !== id));
      showToast("প্রুফ মুছে ফেলা হয়েছে।", "success");
    }
  };

  const handleAddProof = (e: React.FormEvent) => {
    e.preventDefault();
    const newProof = {
      id: `prf-${Date.now()}`,
      orderId: orderId || `AH-${Math.floor(10000 + Math.random() * 90000)}`,
      productName,
      amountBDT: Number(amount) || 290,
      type: "Subscription",
      date: "আজকে",
      image: "https://images.unsplash.com/photo-1556742049-0a67e557224f?w=400",
      customerNote: customerNote || "ইনস্ট্যান্ট ডেলিভারি পেয়েছি। অসাধারণ সার্ভিস!",
    };

    setProofList([newProof as any, ...proofList]);
    setIsAddModalOpen(false);
    showToast("নতুন ডেলিভারি প্রুফ সফলভাবে যোগ হয়েছে!", "success");
    setOrderId("");
    setProductName("");
    setAmount("");
    setCustomerNote("");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white">কাস্টমার প্রুফ ও রিভিউ (Proofs & Reviews)</h1>
          <p className="text-xs text-slate-400">সফল ডেলিভারির প্রমাণপত্র ও কাস্টমার রিভিউ মডারেশন করুন</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ নতুন প্রুফ যুক্ত করুন</span>
        </button>
      </div>

      {/* Proofs Table */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">অর্ডার আইডি</th>
                <th className="py-3.5 px-4">প্রোডাক্ট</th>
                <th className="py-3.5 px-4">মূল্য</th>
                <th className="py-3.5 px-4">কাস্টমার মন্তব্য</th>
                <th className="py-3.5 px-4">তারিখ</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {proofList.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {p.orderId}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-200">
                    {p.productName}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[#FC5C03]">
                    ৳{p.amountBDT}
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                    "{p.customerNote}"
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {p.date}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">+ নতুন ডেলিভারি প্রুফ যোগ করুন</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddProof} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">অর্ডার নাম্বার</label>
                  <input
                    type="text"
                    placeholder="AH-89211"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">মূল্য (BDT) *</label>
                  <input
                    type="number"
                    required
                    placeholder="290"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">প্রোডাক্টের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="ChatGPT Plus (Shared Profile)"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">কাস্টমার মন্তব্য / রিভিউ *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="ইনস্ট্যান্ট ডেলিভারি পেয়েছি। সার্ভিস অসাধারণ!"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/3 py-2.5 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl"
                >
                  যোগ করুন (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
