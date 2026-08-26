"use client";

import React, { useState } from "react";
import { Users, Search, ShieldCheck } from "lucide-react";
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
      name: "Tanvir Ahmed",
      email: "tanvir.user@gmail.com",
      role: "USER",
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
    showToast(`User role updated to ${newRole}.`, "success");
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Users & Customers</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">View registered accounts, order volume, wallet balances, and admin privileges.</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer name or email address..."
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
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Wallet Balance</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Member Since</th>
                <th className="py-3.5 px-4 text-right">Assign Role</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {u.name}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {u.email}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        u.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-[#FC5C03]">
                    ৳{u.walletBalance}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    {u.ordersCount} {u.ordersCount === 1 ? "Order" : "Orders"}
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {u.joinedDate}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 cursor-pointer shadow-2xs"
                    >
                      <option value="USER">USER</option>
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
