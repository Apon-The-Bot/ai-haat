"use client";

import React, { useState } from "react";
import { Users, Search, ShieldCheck } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  walletBalance: number;
  ordersCount: number;
  joinedDate: string;
}

export default function AdminUsersPage() {
  const { showToast } = useToast();

  const [users, setUsers] = useState<AdminUserItem[]>([
    {
      id: "usr-1",
      name: "Amanullah Sheikh",
      email: "mdamanullahsheikhapon@gmail.com",
      role: "ADMIN",
      walletBalance: 0,
      ordersCount: 0,
      joinedDate: "2026-08-27",
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
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Users & Customers</h1>
          <p className="text-sm text-slate-500 mt-1">View registered accounts, order volume, wallet balances, and admin privileges.</p>
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
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#FC5C03] shadow-2xs"
        />
      </div>

      {/* Table (White Theme) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-xs font-bold">
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
              {filtered.length > 0 ? (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {u.name}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {u.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.role === "ADMIN"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role === "ADMIN" && <ShieldCheck className="w-3 h-3 text-purple-600" />}
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ৳{u.walletBalance.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {u.ordersCount}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {u.joinedDate}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-hidden"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No users found</p>
                      <p className="text-xs text-slate-400">Registered users will appear here.</p>
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
