"use client";

import React, { useState } from "react";
import { Users, Search, ShieldCheck, UserCheck, Wallet, Plus, Check } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function AdminUsersPage() {
  const { showToast } = useToast();

  const [users, setUsers] = useState([
    {
      id: "usr-1",
      name: "Amanullah Sheikh",
      email: "mdamanullahsheikhapon@gmail.com",
      role: "ADMIN",
      walletBalance: 500,
      ordersCount: 3,
      joinedDate: "2026-08-20",
    },
    {
      id: "usr-2",
      name: "Sifat Rahman",
      email: "sifat.rahman@gmail.com",
      role: "USER",
      walletBalance: 1000,
      ordersCount: 5,
      joinedDate: "2026-08-22",
    },
    {
      id: "usr-3",
      name: "Tanvir Ahmed (Reseller)",
      email: "tanvir.reseller@gmail.com",
      role: "RESELLER",
      walletBalance: 3200,
      ordersCount: 14,
      joinedDate: "2026-08-15",
    },
  ]);

  const [search, setSearch] = useState("");

  const handleRoleChange = (id: string, newRole: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
    showToast(`ইউজার রোল ${newRole}-এ পরিবর্তন করা হয়েছে।`, "success");
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white">ইউজার ও রিসেলার ডিরেক্টরি (Users & Roles) 👥</h1>
          <p className="text-xs text-slate-400">সকল গ্রাহক, রিসেলার এবং এডমিন এক্সেস পরিচালনা করুন</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FC5C03]"
        />
      </div>

      {/* Table */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">ইউজার</th>
                <th className="py-3.5 px-4">ইমেইল</th>
                <th className="py-3.5 px-4">রোল (Role)</th>
                <th className="py-3.5 px-4">ওয়ালেট ব্যালেন্স</th>
                <th className="py-3.5 px-4">মোট অর্ডার</th>
                <th className="py-3.5 px-4">যোগদানের তারিখ</th>
                <th className="py-3.5 px-4 text-right">রোল পরিবর্তন</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    {u.name}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {u.email}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        u.role === "ADMIN"
                          ? "bg-purple-950 text-purple-400 border border-purple-800/40"
                          : u.role === "RESELLER"
                          ? "bg-blue-950 text-blue-400 border border-blue-800/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[#FC5C03]">
                    ৳{u.walletBalance}
                  </td>

                  <td className="py-3.5 px-4 text-slate-400">
                    {u.ordersCount} টি
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {u.joinedDate}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300"
                    >
                      <option value="USER">USER</option>
                      <option value="RESELLER">RESELLER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
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
