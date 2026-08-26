"use client";

import React, { useState } from "react";
import { Wallet, Check, X, Search, Clock, CheckCircle2, Copy } from "lucide-react";
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
      createdAt: "15 mins ago",
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
      createdAt: "Yesterday 12:30",
    },
  ]);

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const handleApprove = (id: string, userName: string, amount: number) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
    );
    showToast(`৳${amount} deposit approved for ${userName}!`, "success");
  };

  const handleReject = (id: string) => {
    if (confirm("Are you sure you want to reject this deposit request?")) {
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r))
      );
      showToast("Deposit request rejected.", "error");
    }
  };

  const filtered = requests.filter((r) => {
    const matchFilter = filter === "ALL" || r.status === filter;
    const matchSearch =
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.trxId.toLowerCase().includes(search.toLowerCase()) ||
      r.userPhone.includes(search);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Wallet Deposit Approvals</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Verify top-up payments and credit customer digital wallets instantly.</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs">
          {[
            { id: "ALL", label: "All Requests" },
            { id: "PENDING", label: `Pending (${requests.filter((r) => r.status === "PENDING").length})` },
            { id: "APPROVED", label: "Approved" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-white text-[#FC5C03] shadow-xs"
                  : "text-slate-600 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer name, phone, or TrxID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03] shadow-2xs"
        />
      </div>

      {/* Table (White Theme) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Method & Sender</th>
                <th className="py-3.5 px-4">TrxID</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {req.id}
                    <span className="text-[10px] text-slate-400 block font-normal">{req.createdAt}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{req.userName}</span>
                    <span className="text-[11px] text-slate-500">{req.userEmail}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">{req.method}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{req.senderNumber}</span>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-[#FC5C03]">
                    {req.trxId}
                  </td>

                  <td className="py-3.5 px-4 text-sm font-black text-slate-900">
                    ৳{req.amountBDT}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase ${
                        req.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : req.status === "PENDING"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${req.status === "APPROVED" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                      <span>{req.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {req.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(req.id, req.userName, req.amountBDT)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">Completed</span>
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
