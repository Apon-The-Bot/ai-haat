"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  Copy,
  X,
  MessageSquare,
  RefreshCw,
  Clock,
  KeyRound,
  UserCheck,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  walletBalanceBDT: number;
  totalOrders: number;
  totalSpent: number;
  isMfaEnabled: boolean;
  joinDate: string;
  createdAt: string;
}

interface CustomerDetailFull {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  walletBalanceBDT: number;
  lifetimeSpend: number;
  totalOrders: number;
  verifiedOrdersCount: number;
  isMfaEnabled: boolean;
  joinedDate: string;
  createdAt: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    totalBDT: number;
    paymentMethod: string;
    paymentStatus: string;
    deliveryStatus: string;
    items: string;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    amountBDT: number;
    type: string;
    method: string;
    trxId: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminUsersPage() {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Customer for Drawer
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetailFull | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Role Change Confirmation Modal
  const [roleModalUser, setRoleModalUser] = useState<{ id: string; name: string; currentRole: string; targetRole: string } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("pageSize", String(pageSize));

        if (roleFilter !== "ALL") {
          params.set("role", roleFilter);
        }
        if (search.trim()) {
          params.set("search", search.trim());
        }

        const res = await fetch(`/api/admin/users?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.users) {
            setUsers(data.users);
            if (data.pagination) {
              setTotalUsers(data.pagination.total);
              setTotalPages(data.pagination.totalPages || 1);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [currentPage, pageSize, roleFilter, search]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCustomerDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setCustomerDetail(data.user);
        }
      }
    } catch {
      showToast("কাস্টমার ডিটেইল লোড করা যায়নি", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeCustomerDetail = () => {
    setSelectedUserId(null);
    setCustomerDetail(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmRoleChange = async () => {
    if (!roleModalUser) return;
    setIsUpdatingRole(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: roleModalUser.id, role: roleModalUser.targetRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`User role updated to ${roleModalUser.targetRole}.`, "success");
        setUsers((prev) =>
          prev.map((u) => (u.id === roleModalUser.id ? { ...u, role: roleModalUser.targetRole } : u))
        );
        if (customerDetail && customerDetail.id === roleModalUser.id) {
          setCustomerDetail({ ...customerDetail, role: roleModalUser.targetRole });
        }
        setRoleModalUser(null);
      } else {
        showToast(data.error || "Failed to update role", "error");
      }
    } catch {
      showToast("Server error updating role", "error");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Customer Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Users & Customers
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View registered customer profiles, lifetime spends, wallet balances, order history, and access privileges.
          </p>
        </div>

        <button
          onClick={() => fetchUsers()}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
          title="Refresh users"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email address, or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#FC5C03] transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { id: "ALL", label: "All Users" },
              { id: "USER", label: "Customers" },
              { id: "ADMIN", label: "Admins" },
              { id: "RESELLER", label: "Resellers" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setRoleFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === tab.id
                    ? "bg-white text-[#FC5C03] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-500 hidden lg:block">
            Showing <strong className="text-slate-900">{users.length}</strong> of{" "}
            <strong className="text-slate-900">{totalUsers}</strong>
          </div>
        </div>
      </div>

      {/* Users Table & Mobile Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        
        {/* Mobile View: Responsive Stacked Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {users.length > 0 ? (
            users.map((u) => (
              <div
                key={u.id}
                className="p-4 space-y-3 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => openCustomerDetail(u.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                      {u.name ? u.name.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div>
                      <strong className="text-slate-900 font-bold text-sm block">{u.name}</strong>
                      <span className="text-slate-400 text-[11px] block">{u.email}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : u.role === "RESELLER"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>{u.role}</span>
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      Wallet: <strong className="text-slate-900 font-bold">{formatPrice(u.walletBalanceBDT)}</strong>
                    </span>
                    <span className="text-slate-600">
                      Spent: <strong className="text-slate-900 font-black">{formatPrice(u.totalSpent)}</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>{u.totalOrders} total order(s)</span>
                    <span>Joined: {u.joinDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={u.role}
                    onChange={(e) =>
                      setRoleModalUser({
                        id: u.id,
                        name: u.name,
                        currentRole: u.role,
                        targetRole: e.target.value,
                      })
                    }
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-hidden"
                  >
                    <option value="USER">USER</option>
                    <option value="RESELLER">RESELLER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>

                  <button
                    onClick={() => openCustomerDetail(u.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-xs">No customers found</p>
            </div>
          )}
        </div>

        {/* Desktop View: Full Data Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-4 px-5">Customer Profile</th>
                <th className="py-4 px-5">Email & Phone</th>
                <th className="py-4 px-5">Role & Security</th>
                <th className="py-4 px-5">Wallet Balance</th>
                <th className="py-4 px-5">Total Spend</th>
                <th className="py-4 px-5">Orders</th>
                <th className="py-4 px-5">Joined</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {users.length > 0 ? (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => openCustomerDetail(u.id)}
                  >
                    {/* Name & Avatar */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                          {u.name ? u.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-slate-900 block truncate max-w-[160px]">
                            {u.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {u.id.slice(0, 10)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                      <span className="text-slate-800 font-semibold block">{u.email}</span>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-mono">{u.phone}</span>
                        {u.phone && u.phone !== "N/A" && (
                          <a
                            href={`https://wa.me/88${u.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-0.5 text-[11px]"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WA</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Role & Security */}
                    <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : u.role === "RESELLER"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role === "ADMIN" && <ShieldCheck className="w-3 h-3 text-purple-600" />}
                          <span>{u.role}</span>
                        </span>
                        {u.isMfaEnabled && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            MFA Active
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Wallet Balance */}
                    <td className="py-4 px-5 font-bold text-slate-900">
                      {formatPrice(u.walletBalanceBDT)}
                    </td>

                    {/* Total Spend */}
                    <td className="py-4 px-5 font-black text-slate-900">
                      {formatPrice(u.totalSpent)}
                    </td>

                    {/* Orders Count */}
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-700">{u.totalOrders}</span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
                      {u.joinDate}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            setRoleModalUser({
                              id: u.id,
                              name: u.name,
                              currentRole: u.role,
                              targetRole: e.target.value,
                            })
                          }
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                        >
                          <option value="USER">USER</option>
                          <option value="RESELLER">RESELLER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>

                        <button
                          onClick={() => openCustomerDetail(u.id)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="View Customer Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No customers found</p>
                      <p className="text-xs text-slate-400">Adjust filters or search parameters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-semibold text-slate-500">
            Page <strong className="text-slate-900">{currentPage}</strong> of{" "}
            <strong className="text-slate-900">{totalPages}</strong> ({totalUsers} total registered users)
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CUSTOMER DETAIL DRAWER */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center font-bold text-base">
                  {customerDetail?.name ? customerDetail.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {customerDetail?.name || "Customer Profile"}
                  </h3>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Member since {customerDetail?.joinedDate}
                  </span>
                </div>
              </div>

              <button
                onClick={closeCustomerDetail}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetail || !customerDetail ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#FC5C03]" />
                  <span className="text-xs font-semibold">লোড হচ্ছে...</span>
                </div>
              ) : (
                <>
                  {/* Financial & Role Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Role</span>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10.5px] font-bold">
                        {customerDetail.role}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Wallet</span>
                      <span className="font-black text-slate-900 text-sm block">
                        {formatPrice(customerDetail.walletBalanceBDT)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Lifetime Spend</span>
                      <span className="font-black text-slate-900 text-sm block">
                        {formatPrice(customerDetail.lifetimeSpend)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Verified Orders</span>
                      <span className="font-bold text-slate-900 text-sm block">
                        {customerDetail.verifiedOrdersCount} / {customerDetail.totalOrders}
                      </span>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Email Address</span>
                        <strong className="text-slate-900 font-semibold">{customerDetail.email}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Phone Number</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <strong className="text-slate-900 font-mono">{customerDetail.phone}</strong>
                          {customerDetail.phone && customerDetail.phone !== "N/A" && (
                            <a
                              href={`https://wa.me/88${customerDetail.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] border border-emerald-200 inline-flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <ShoppingBag className="w-4 h-4 text-slate-500" />
                      <span>Recent Orders ({customerDetail.orders.length})</span>
                    </h4>

                    {customerDetail.orders.length > 0 ? (
                      <div className="space-y-2">
                        {customerDetail.orders.map((o) => (
                          <div
                            key={o.id}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <span className="font-mono font-bold text-slate-900">#{o.orderNumber || o.id}</span>
                              <span className="text-slate-500 block truncate max-w-[280px]">{o.items}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(o.createdAt).toLocaleDateString()} • {o.paymentMethod}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-900 block">{formatPrice(o.totalBDT)}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase ${
                                  o.deliveryStatus === "DELIVERED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : o.deliveryStatus === "CANCELLED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {o.deliveryStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No orders placed by this customer.</p>
                    )}
                  </div>

                  {/* Wallet Ledger */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Wallet className="w-4 h-4 text-slate-500" />
                      <span>Wallet Activity Ledger</span>
                    </h4>

                    {customerDetail.transactions.length > 0 ? (
                      <div className="space-y-2">
                        {customerDetail.transactions.map((t) => (
                          <div
                            key={t.id}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block">{t.type} via {t.method}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                TrxID: {t.trxId} • {new Date(t.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-slate-900 block">৳{t.amountBDT}</span>
                              <span
                                className={`text-[10px] font-bold ${
                                  t.status === "APPROVED"
                                    ? "text-emerald-600"
                                    : t.status === "REJECTED"
                                    ? "text-red-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {t.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No wallet transactions recorded.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={closeCustomerDetail}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM ROLE CHANGE MODAL */}
      <ConfirmModal
        isOpen={Boolean(roleModalUser)}
        onClose={() => setRoleModalUser(null)}
        onConfirm={confirmRoleChange}
        title="কাস্টমার রোল পরিবর্তন নিশ্চিতকরণ"
        message={
          roleModalUser
            ? `আপনি কি নিশ্চিতভাবে ${roleModalUser.name}-এর রোল "${roleModalUser.currentRole}" থেকে "${roleModalUser.targetRole}"-এ পরিবর্তন করতে চান?${
                roleModalUser.targetRole === "ADMIN"
                  ? " সতর্কবার্তা: এডমিন রোল দিলে উক্ত ব্যবহারকারী সম্পূর্ণ এডমিন প্যানেল এক্সেস করতে পারবেন।"
                  : ""
              }`
            : ""
        }
        confirmText="রোল আপডেট করুন"
        cancelText="বাতিল"
        variant={roleModalUser?.targetRole === "ADMIN" ? "warning" : "primary"}
        isLoading={isUpdatingRole}
      />

    </div>
  );
}
