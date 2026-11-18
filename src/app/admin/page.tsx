"use client";

import { MetricCard } from "@/components/admin/MetricCard";
import { DashboardAnalytics } from "./DashboardAnalytics";
import { DashboardRecentOrders, type RecentOrdersData } from "./DashboardRecentOrders";
import { QueueSummary } from "./operations/QueueSummary";
import { DashboardDeliverySla } from "./DashboardDeliverySla";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  KeyRound,
  Users,
  Wallet,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface DashboardStats extends RecentOrdersData {
  period: string;
  revenue: number;
  netRevenue?: number;
  cogs?: number;
  grossProfit?: number;
  grossMarginPct?: number;
  totalOrders: number;
  verifiedOrdersCount: number;
  averageOrderValue: number;
  pendingFulfillment: number;
  pendingDeposits: number;
  totalCustomers: number;
  availableStockCount: number;
  gatewayDistribution: Record<string, number>;
  dailyTrend: Array<{ date: string; revenue: number; orders: number }>;
}

export default function AdminDashboardPage() {
  const { formatPrice } = useCurrency();

  const [period, setPeriod] = useState<"TODAY" | "7D" | "30D" | "ALL">("7D");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/admin/dashboard/stats?period=${period}`);
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <div className="space-y-6 w-full pb-16">
      
      {/* Top Banner & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mission Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Admin Overview & Operations
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time analytics, revenue tracking, pending fulfillment queues, and financial health.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Period Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { id: "TODAY", label: "Today" },
              { id: "7D", label: "7 Days" },
              { id: "30D", label: "30 Days" },
              { id: "ALL", label: "All Time" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setPeriod(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === t.id
                    ? "bg-white text-[#FC5C03] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchStats()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <QueueSummary />
      <DashboardDeliverySla />

      {/* 6 High-Impact Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* KPI 1: Authoritative Verified Revenue */}
        <MetricCard label="Verified Revenue" href="/admin/orders?paymentStatus=VERIFIED" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Verified Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {formatPrice(stats?.revenue || 0)}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {stats?.verifiedOrdersCount || 0} paid orders
          </span>
        </MetricCard>

        {/* KPI 2: Total Orders */}
        <MetricCard label="Total Orders" href="/admin/orders" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {stats?.totalOrders || 0}
          </span>
          <span className="text-[11px] text-slate-400 font-semibold block">
            AOV: {formatPrice(stats?.averageOrderValue || 0)}
          </span>
        </MetricCard>

        {/* KPI 3: Pending Delivery */}
        <MetricCard label="Pending Delivery" href="/admin/orders?deliveryStatus=ORDER_PLACED" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Delivery</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-[#FC5C03] block">
            {stats?.pendingFulfillment || 0}
          </span>
          <span className="text-[11px] text-[#FC5C03] font-bold hover:underline block">
            Fulfill Orders →
          </span>
        </MetricCard>

        {/* KPI 4: Pending Wallet Approvals */}
        <MetricCard label="Wallet Requests" href="/admin/wallet" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Wallet Requests</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FC5C03] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {stats?.pendingDeposits || 0}
          </span>
          <span className="text-[11px] text-[#FC5C03] font-bold hover:underline block">
            Approve Top-ups →
          </span>
        </MetricCard>

        {/* KPI 5: Digital Stock Pool */}
        <MetricCard label="Available Vault Keys" href="/admin/inventory?status=AVAILABLE" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Available Vault Keys</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {stats?.availableStockCount || 0}
          </span>
          <span className="text-[11px] text-purple-600 font-bold hover:underline block">
            Manage Vault →
          </span>
        </MetricCard>

        {/* KPI 6: Registered Customers */}
        <MetricCard label="Customers" href="/admin/users" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Customers</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {stats?.totalCustomers || 0}
          </span>
          <span className="text-[11px] text-slate-500 font-bold hover:underline block">
            View Users →
          </span>
        </MetricCard>

      </div>

      {/* Financial Intelligence: COGS & Net Profit Margin Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Delivered COGS */}
        <MetricCard label="Delivered COGS" href="/admin/reports" className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Delivered COGS</span>
            <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">Cost of Sales</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatPrice(stats?.cogs || 0)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Acquisition cost of keys delivered to customers</p>
        </MetricCard>

        {/* Realized Gross / Net Profit */}
        <MetricCard label="Net Gross Profit" href="/admin/reports" className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent rounded-2xl border border-emerald-200/80 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Net Gross Profit</span>
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
              {stats?.grossMarginPct ?? 0}% Margin
            </span>
          </div>
          <div className={`text-2xl font-black ${(stats?.grossProfit || 0) >= 0 ? "text-emerald-700" : "text-rose-600"}`}>
            {formatPrice(stats?.grossProfit || 0)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Net revenue minus recognized COGS</p>
        </MetricCard>

        {/* Financial Truth Audit Link */}
        <MetricCard label="Financial Reports" href="/admin/reports" className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent rounded-2xl border border-blue-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Financial Reports</span>
              <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">BI Audit</span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              In-depth Batches & Inventory Costing
            </div>
            <p className="text-xs text-slate-500 mt-1">Breakdown by suppliers, batches & CSV export</p>
          </div>
          <span className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mt-3">
            Open Financial Reports →
          </span>
        </MetricCard>
      </div>

      <DashboardAnalytics stats={stats} formatPrice={formatPrice} />

      <DashboardRecentOrders stats={stats} formatPrice={formatPrice} />

    </div>
  );
}
