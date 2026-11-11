"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
  RefreshCw,
  Clock,
  Plus,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  Ban,
  Lock,
  Tag,
  Coins,
  SlidersHorizontal,
  UserPlus,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { BulkActionBar, BulkActionItem } from "@/components/admin/BulkActionBar";
import { ConfirmModal } from "@/components/ConfirmModal";
import { UserAvatar } from "@/components/admin/UserAvatar";

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  image: string | null;
  walletBalanceBDT: number;
  coinBalance: number;
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "RESTRICTED" | "PENDING_VERIFICATION" | "DEACTIVATED";
  statusReason: string | null;
  statusExpiresAt: string | null;
  hasRestrictions: boolean;
  restrictedFeatureCount: number;
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  isMfaEnabled: boolean;
  lastOrderDate: string | null;
  joinDate: string;
  createdAt: string;
}

interface SegmentCounts {
  ALL: number;
  ACTIVE: number;
  SUSPENDED: number;
  BANNED: number;
  RESTRICTED: number;
}

export default function AdminUsersPage() {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [activeSegment, setActiveSegment] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [segmentCounts, setSegmentCounts] = useState<SegmentCounts>({
    ALL: 0,
    ACTIVE: 0,
    SUSPENDED: 0,
    BANNED: 0,
    RESTRICTED: 0,
  });

  // Bulk Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "USER",
    initialWalletBDT: 0,
    tags: "",
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Quick Status Modal
  const [statusModalUser, setStatusModalUser] = useState<AdminUserItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<"ACTIVE" | "SUSPENDED" | "BANNED">("SUSPENDED");
  const [statusReason, setStatusReason] = useState("");
  const [suspensionHours, setSuspensionHours] = useState("24");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Quick Wallet Modal
  const [walletModalUser, setWalletModalUser] = useState<AdminUserItem | null>(null);
  const [walletAdjustmentType, setWalletAdjustmentType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [walletAmount, setWalletAmount] = useState("");
  const [walletReason, setWalletReason] = useState("");
  const [isAdjustingWallet, setIsAdjustingWallet] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        segment: activeSegment,
        role: roleFilter,
        sortBy,
        sortOrder,
      });

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setUsers(data.users || []);
        setTotalUsers(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        if (data.segmentCounts) {
          setSegmentCounts(data.segmentCounts);
        }
      } else {
        showToast(data.error || "Failed to load customers", "error");
      }
    } catch (err) {
      console.error("[Users Fetch Error]:", err);
      showToast("Error communicating with user service", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, activeSegment, roleFilter, search, sortBy, sortOrder, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Search Input Debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(users.map((u) => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkAction = async (action: string, payload?: any) => {
    if (selectedIds.length === 0) return;

    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          userIds: selectedIds,
          ...payload,
        }),
      });

      if (action === "EXPORT_CSV") {
        if (!res.ok) throw new Error("CSV Export Failed");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `AI_Haat_Selected_Users_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast("CSV export initiated successfully", "success");
        return;
      }

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Bulk operation completed", "success");
        setSelectedIds([]);
        fetchUsers();
      } else {
        showToast(data.error || "Bulk action failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Bulk action error", "error");
    }
  };

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.email) {
      showToast("Email address is required", "error");
      return;
    }

    try {
      setIsCreatingUser(true);
      const tagsArray = newUserData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newUserData,
          tags: tagsArray,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Customer created successfully", "success");
        setIsAddUserOpen(false);
        setNewUserData({ name: "", email: "", phone: "", role: "USER", initialWalletBDT: 0, tags: "" });
        fetchUsers();
      } else {
        showToast(data.error || "Failed to create customer", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Creation error", "error");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Status Change Submit Handler
  const handleStatusSubmit = async () => {
    if (!statusModalUser) return;
    if (targetStatus !== "ACTIVE" && !statusReason.trim()) {
      showToast("Reason is required", "error");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/admin/users/${statusModalUser.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          reason: statusReason.trim() || "Status restored by administrator",
          durationHours: targetStatus === "SUSPENDED" ? parseInt(suspensionHours, 10) : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Account status updated to ${targetStatus}`, "success");
        setStatusModalUser(null);
        setStatusReason("");
        fetchUsers();
      } else {
        showToast(data.error || "Status update failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Status update failed", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Wallet Adjustment Submit Handler
  const handleWalletSubmit = async () => {
    if (!walletModalUser) return;
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast("Enter a valid positive amount", "error");
      return;
    }
    if (!walletReason.trim()) {
      showToast("Mandatory financial reason required", "error");
      return;
    }

    try {
      setIsAdjustingWallet(true);
      const res = await fetch(`/api/admin/users/${walletModalUser.id}/wallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: walletAdjustmentType,
          amountBDT: amount,
          category: walletAdjustmentType === "CREDIT" ? "BONUS" : "MANUAL_ADJUSTMENT",
          reason: walletReason.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Wallet ${walletAdjustmentType === "CREDIT" ? "credited" : "debited"} successfully`, "success");
        setWalletModalUser(null);
        setWalletAmount("");
        setWalletReason("");
        fetchUsers();
      } else {
        showToast(data.error || "Wallet adjustment failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Wallet adjustment error", "error");
    } finally {
      setIsAdjustingWallet(false);
    }
  };

  const getStatusBadge = (user: AdminUserItem) => {
    switch (user.status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "SUSPENDED":
        return (
          <span
            title={user.statusReason || "Suspended"}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
          >
            <Clock className="w-3 h-3" />
            Suspended
          </span>
        );
      case "BANNED":
        return (
          <span
            title={user.statusReason || "Banned"}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
          >
            <Ban className="w-3 h-3" />
            Banned
          </span>
        );
      case "RESTRICTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Lock className="w-3 h-3" />
            Restricted ({user.restrictedFeatureCount})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {user.status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Customer Management 360°</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Centralized User Intelligence, Feature Entitlements, Wallets, and Granular Access Controls
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBulkAction("EXPORT_CSV")}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FC5C03] hover:bg-[#e05202] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic Segment Navigation Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200">
        {[
          { key: "ALL", label: "All Customers", count: segmentCounts.ALL },
          { key: "ACTIVE", label: "Active", count: segmentCounts.ACTIVE },
          { key: "SUSPENDED", label: "Suspended", count: segmentCounts.SUSPENDED },
          { key: "BANNED", label: "Banned", count: segmentCounts.BANNED },
          { key: "RESTRICTED", label: "Restricted", count: segmentCounts.RESTRICTED },
          { key: "RECENT_REGISTERED", label: "New (Last 7d)" },
          { key: "HIGH_VALUE", label: "High Value (VIP)" },
          { key: "PENDING_ORDERS", label: "Pending Orders" },
          { key: "WALLET_ACTIVITY", label: "With Wallet" },
        ].map((tab) => {
          const isActive = activeSegment === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveSegment(tab.key);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#FC5C03] text-white shadow-2xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Search and Filtering Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name, email, phone, or customer ID..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FC5C03] rounded-xl text-xs text-gray-900 outline-none transition-all"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FC5C03] rounded-xl text-xs text-gray-700 font-medium outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Customer (USER)</option>
            <option value="RESELLER">Reseller</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#FC5C03] rounded-xl text-xs text-gray-700 font-medium outline-none"
          >
            <option value="createdAt">Sort: Joined Recently</option>
            <option value="walletBalanceBDT">Sort: Highest Wallet</option>
            <option value="name">Sort: Alphabetical (A-Z)</option>
          </select>
        </div>

        <div className="md:col-span-1 flex items-center justify-end">
          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="w-full h-full py-2 flex items-center justify-center bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#FC5C03]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 4. Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-orange-50 border border-orange-200 rounded-2xl animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-orange-900">
              {selectedIds.length} user{selectedIds.length > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction("SET_STATUS", { status: "SUSPENDED", reason: "Bulk suspension" })}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Suspend Selected
            </button>
            <button
              onClick={() => handleBulkAction("SET_STATUS", { status: "ACTIVE", reason: "Bulk restored" })}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Restore Active
            </button>
            <button
              onClick={() => handleBulkAction("ASSIGN_TAG", { tag: "VIP" })}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              + Tag VIP
            </button>
            <button
              onClick={() => handleBulkAction("EXPORT_CSV")}
              className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Export Selected</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* 5. Customers Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {/* Mobile View: Responsive Stacked Cards (< md) */}
        <div className="block md:hidden divide-y divide-gray-100">
          {loading && users.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FC5C03] mb-2" />
              <p className="font-semibold text-gray-700">Loading Customer Intelligence...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="font-semibold text-gray-700">No customers found</p>
            </div>
          ) : (
            users.map((u) => {
              const isSelected = selectedIds.includes(u.id);
              return (
                <div
                  key={u.id}
                  className={`p-4 space-y-3 transition-colors ${
                    isSelected ? "bg-orange-50/40" : "hover:bg-gray-50/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectUser(u.id)}
                        className="rounded border-gray-300 text-[#FC5C03] focus:ring-[#FC5C03] mt-0.5"
                      />
                      <UserAvatar name={u.name} email={u.email} image={u.image} />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-gray-900 text-xs">{u.name || "Unnamed"}</span>
                          {getStatusBadge(u)}
                        </div>
                        <p className="text-[11px] text-gray-500">{u.email}</p>
                        {u.phone && <p className="text-[10px] text-gray-400 font-mono">{u.phone}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-xl text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Wallet Balance</span>
                      <span className="font-bold text-gray-900">৳{Number(u.walletBalanceBDT || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Spend & Orders</span>
                      <span className="font-bold text-gray-900">৳{Number(u.totalSpent || 0).toLocaleString()}</span>
                      <span className="text-gray-400 text-[10px] ml-1">({u.totalOrders} orders)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setWalletModalUser(u);
                          setWalletAmount("");
                          setWalletReason("");
                        }}
                        className="p-1.5 text-gray-500 hover:text-[#FC5C03] hover:bg-orange-50 rounded-lg transition-colors border border-gray-200"
                        title="Wallet"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setStatusModalUser(u);
                          setTargetStatus(u.status === "SUSPENDED" || u.status === "BANNED" ? "ACTIVE" : "SUSPENDED");
                        }}
                        className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-gray-200"
                        title="Status"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <Link
                      href={`/admin/users/${u.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <span>360° Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Table (md+) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={users.length > 0 && selectedIds.length === users.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-[#FC5C03] focus:ring-[#FC5C03]"
                  />
                </th>
                <th className="py-3.5 px-3">Customer Profile</th>
                <th className="py-3.5 px-3">Role & Status</th>
                <th className="py-3.5 px-3">Wallet Balance</th>
                <th className="py-3.5 px-3">Spend & Orders</th>
                <th className="py-3.5 px-3">Tags & Badges</th>
                <th className="py-3.5 px-3">Joined Date</th>
                <th className="py-3.5 pr-4 pl-3 text-right">360° Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FC5C03] mb-2" />
                    <p className="font-semibold text-gray-700">Loading Customer Intelligence...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-700">No customers found</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Try clearing your filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelected = selectedIds.includes(u.id);
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-gray-50/70 transition-colors ${
                        isSelected ? "bg-orange-50/30" : ""
                      }`}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectUser(u.id)}
                          className="rounded border-gray-300 text-[#FC5C03] focus:ring-[#FC5C03]"
                        />
                      </td>

                      {/* Customer Profile Column */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={u.name} email={u.email} image={u.image} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/admin/users/${u.id}`}
                                className="font-bold text-gray-900 hover:text-[#FC5C03] transition-colors truncate"
                              >
                                {u.name}
                              </Link>
                              {u.isMfaEnabled && (
                                <span title="2FA Enabled">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                              <span>{u.email}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(u.email);
                                  showToast("Email copied", "success");
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === "ADMIN"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : u.role === "RESELLER"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {u.role}
                          </span>
                          <div>{getStatusBadge(u)}</div>
                        </div>
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-gray-900 flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5 text-[#FC5C03]" />
                          <span>{formatPrice(u.walletBalanceBDT)}</span>
                        </div>
                        {u.coinBalance > 0 && (
                          <p className="text-[10px] font-semibold text-amber-600 flex items-center gap-1 mt-0.5">
                            <Coins className="w-3 h-3" />
                            <span>{u.coinBalance} Coins</span>
                          </p>
                        )}
                      </td>

                      {/* Spend & Orders */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-gray-900">{formatPrice(u.totalSpent)}</div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {u.totalOrders} order{u.totalOrders === 1 ? "" : "s"}
                        </p>
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {u.tags && u.tags.length > 0 ? (
                            u.tags.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700"
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-300 text-[11px]">—</span>
                          )}
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-3 text-gray-500 text-[11px] whitespace-nowrap">
                        {u.joinDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-4 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setWalletModalUser(u);
                              setWalletAdjustmentType("CREDIT");
                            }}
                            className="p-1.5 text-gray-500 hover:text-[#FC5C03] hover:bg-orange-50 rounded-lg transition-colors"
                            title="Quick Wallet Adjustment"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setStatusModalUser(u);
                              setTargetStatus(u.status === "SUSPENDED" || u.status === "BANNED" ? "ACTIVE" : "SUSPENDED");
                            }}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Account Status / Suspension"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/admin/users/${u.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                          >
                            <span>360° Profile</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100 bg-gray-50/50">
          <p className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to{" "}
            <span className="font-bold text-gray-900">
              {Math.min(currentPage * pageSize, totalUsers)}
            </span>{" "}
            of <span className="font-bold text-gray-900">{totalUsers}</span> registered customers
          </p>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-lg outline-none"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-gray-700 px-2">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FC5C03] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900 text-base">Add New Customer</h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="customer@domain.com"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                  placeholder="017xxxxxxxx"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                  >
                    <option value="USER">Customer (USER)</option>
                    <option value="RESELLER">Reseller</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Initial Wallet (BDT)</label>
                  <input
                    type="number"
                    min="0"
                    value={newUserData.initialWalletBDT}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, initialWalletBDT: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Customer Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newUserData.tags}
                  onChange={(e) => setNewUserData({ ...newUserData, tags: e.target.value })}
                  placeholder="VIP, WHOLESALE, TESTER"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-4 py-2 bg-[#FC5C03] hover:bg-[#e05202] text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isCreatingUser ? "Creating..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Quick Status Modal */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">Account Status Control</h3>
              </div>
              <button onClick={() => setStatusModalUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="font-bold text-gray-900">{statusModalUser.name}</p>
                <p className="text-gray-500 text-[11px]">{statusModalUser.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-gray-500">Current Status:</span>
                  {getStatusBadge(statusModalUser)}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Account Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none font-medium"
                >
                  <option value="ACTIVE">ACTIVE (Restore full access)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporary lock)</option>
                  <option value="BANNED">BANNED (Permanent suspension & session wipe)</option>
                </select>
              </div>

              {targetStatus === "SUSPENDED" && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Suspension Duration (Hours)</label>
                  <select
                    value={suspensionHours}
                    onChange={(e) => setSuspensionHours(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none"
                  >
                    <option value="6">6 Hours</option>
                    <option value="12">12 Hours</option>
                    <option value="24">24 Hours (1 Day)</option>
                    <option value="72">72 Hours (3 Days)</option>
                    <option value="168">168 Hours (7 Days)</option>
                    <option value="720">720 Hours (30 Days)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Mandatory Audit Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Explain why this account status is being modified..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStatusModalUser(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusSubmit}
                  disabled={isUpdatingStatus}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isUpdatingStatus ? "Updating..." : "Confirm Status Change"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Quick Wallet Adjustment Modal */}
      {walletModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900">
                <Wallet className="w-5 h-5 text-[#FC5C03]" />
                <h3 className="font-bold text-base">Adjust Customer Wallet</h3>
              </div>
              <button onClick={() => setWalletModalUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{walletModalUser.name}</p>
                  <p className="text-gray-500 text-[11px]">{walletModalUser.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Current Balance</p>
                  <p className="font-bold text-gray-900 text-sm">{formatPrice(walletModalUser.walletBalanceBDT)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWalletAdjustmentType("CREDIT")}
                  className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    walletAdjustmentType === "CREDIT"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  + Add Balance (Credit)
                </button>
                <button
                  type="button"
                  onClick={() => setWalletAdjustmentType("DEBIT")}
                  className={`py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    walletAdjustmentType === "DEBIT"
                      ? "bg-rose-50 border-rose-500 text-rose-700 shadow-2xs"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  - Deduct Balance (Debit)
                </button>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Mandatory Audit Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  placeholder="e.g. Promotional cashback / Order dispute compensation / Manual correction"
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-[#FC5C03] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setWalletModalUser(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleWalletSubmit}
                  disabled={isAdjustingWallet}
                  className="px-4 py-2 bg-[#FC5C03] hover:bg-[#e05202] text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isAdjustingWallet ? "Processing..." : "Confirm Adjustment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
