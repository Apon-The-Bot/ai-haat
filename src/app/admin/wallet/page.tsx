"use client";

import React, { useState } from "react";
import { Wallet, Check, X, Search, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function AdminWalletPage() {
  const { showToast } = useToast();

  const [requests, setRequests] = useState([
    {
      id: "REQ-101",
      userName: "Sifat Rahman",
      userEmail: "sifat.rahman@gmail.com",
      userPhone: "01711-223344",
      amountBDT: 1000,
      method: "bKash",
      senderNumber: "01711-223344",
      trxId: "BL90X84Q",
      status: "PENDING",
      createdAt: "15 মিনিট আগে",
    },
    {
      id: "REQ-100",
      userName: "Amanullah Sheikh",
      userEmail: "mdamanullahsheikhapon@gmail.com",
      userPhone: "01712-345678",
      amountBDT: 500,
      method: "bKash",
      senderNumber: "01712-345678",
      trxId: "BL883K99",
      status: "APPROVED",
      createdAt: "গতকাল 12:30",
    },
  ]);

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const handleApprove = (id: string, userName: string, amount: number) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
    );
    showToast(`৳${amount} অনুমোদন করা হয়েছে! ${userName}-এর ওয়ালেটে টাকা যুক্ত হয়েছে।`, "success");
  };

  const handleReject = (id: string) => {
    if (confirm("আপনি কি নিশ্চিত এই রিচার্জ অনুরোধটি বাতিল করতে চান?")) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r))
      );
      showToast("রিচার্জ রিকোয়েস্ট বাতিল করা হয়েছে।", "error");
    }
  };

  const filtered = requests.filter((r) => {
    const matchFilter = filter === "ALL" || r.status === filter;
    const matchSearch =
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.trxId.toLowerCase().includes(search.toLowerCase()) ||
      r.senderNumber.includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white">ওয়ালেট রিচার্জ অনুমোদন (Deposit Queue) 💳</h1>
          <p className="text-xs text-slate-400">বিকাশ ও নগদে পাঠানো TrxID যাচাই করে কাস্টমারের ওয়ালেটে ব্যালেন্স অনুমোদন করুন</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {["ALL", "PENDING", "APPROVED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === f ? "bg-[#FC5C03] text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {f === "ALL" ? "সবগুলো" : f === "PENDING" ? "পেন্ডিং (১)" : "অনুমোদিত"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">ইউজার ও ফোন</th>
                <th className="py-3.5 px-4">টাকার পরিমাণ</th>
                <th className="py-3.5 px-4">মেথড</th>
                <th className="py-3.5 px-4">প্রেরক নাম্বার</th>
                <th className="py-3.5 px-4">Transaction ID (TrxID)</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{req.userName}</span>
                    <span className="text-[10px] text-slate-500">{req.userEmail}</span>
                  </td>

                  <td className="py-3.5 px-4 text-sm font-black text-[#FC5C03]">
                    ৳{req.amountBDT}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-300">
                    {req.method}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {req.senderNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800/40">
                      {req.trxId}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        req.status === "APPROVED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                          : req.status === "REJECTED"
                          ? "bg-red-950 text-red-400 border border-red-800/40"
                          : "bg-amber-950 text-amber-400 border border-amber-800/40"
                      }`}
                    >
                      {req.status === "APPROVED"
                        ? "অনুমোদিত"
                        : req.status === "REJECTED"
                        ? "বাতিল"
                        : "পেন্ডিং"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {req.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(req.id, req.userName, req.amountBDT)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>অনুমোদন</span>
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs font-semibold">সম্পন্ন</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
