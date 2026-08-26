"use client";

import React, { useState } from "react";
import { Wallet, Check, X, Search, Clock, CheckCircle2, Copy } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface WalletRequest {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  amountBDT: number;
  method: string;
  senderNumber: string;
  trxId: string;
  status: string;
  createdAt: string;
}

export default function AdminWalletPage() {
  const { showToast } = useToast();

  const [requests, setRequests] = useState<WalletRequest[]>([]);
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
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Wallet Top-up Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review manual bKash/Nagad wallet deposit proofs and approve customer balance.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: "ALL", label: `All (${requests.length})` },
            { id: "PENDING", label: `Pending (${requests.filter((r) => r.status === "PENDING").length})` },
            { id: "APPROVED", label: `Approved (${requests.filter((r) => r.status === "APPROVED").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, TrxID, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
          />
        </div>

        <div className="text-sm font-semibold text-slate-500 hidden sm:block">
          Showing <strong className="text-slate-900">{filtered.length}</strong> deposit requests
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-xs font-bold">
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
              {filtered.length > 0 ? (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {req.id}
                      <span className="text-xs text-slate-400 block font-normal">{req.createdAt}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{req.userName}</span>
                      <span className="text-xs text-slate-500">{req.userEmail}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{req.method}</span>
                      <span className="text-xs text-slate-500 font-mono">{req.senderNumber}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-[#FC5C03]">
                      {req.trxId}
                    </td>

                    <td className="py-3.5 px-4 text-base font-black text-slate-900">
                      ৳{req.amountBDT}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          req.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : req.status === "PENDING"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${req.status === "APPROVED" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        <span>{req.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {req.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req.id, req.userName, req.amountBDT)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
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
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Wallet className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No deposit requests</p>
                      <p className="text-xs text-slate-400">Customer wallet top-up proofs will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
