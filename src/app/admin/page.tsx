"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  KeyRound,
  Users,
  Wallet,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Plus,
  Send,
  AlertCircle,
  Tag,
  CheckCircle2,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";

interface DashboardStats {
  period: string;
  revenue: number;
  totalOrders: number;
  verifiedOrdersCount: number;
  averageOrderValue: number;
  pendingFulfillment: number;
  pendingDeposits: number;
  totalCustomers: number;
  availableStockCount: number;
  gatewayDistribution: Record<string, number>;
  dailyTrend: Array<{ date: string; revenue: number; orders: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalBDT: number;
    paymentMethod: string;
    paymentStatus: string;
    deliveryStatus: string;
    itemsSummary: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

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

  const maxDailyRevenue = stats?.dailyTrend ? Math.max(...stats.dailyTrend.map((d) => d.revenue), 1000) : 1000;

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-16">
      
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

      {/* 6 High-Impact Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* KPI 1: Authoritative Verified Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
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
        </div>

        {/* KPI 2: Total Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
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
        </div>

        {/* KPI 3: Pending Delivery */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Delivery</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-[#FC5C03] block">
            {stats?.pendingFulfillment || 0}
          </span>
          <Link href="/admin/orders?deliveryStatus=ORDER_PLACED" className="text-[11px] text-[#FC5C03] font-bold hover:underline block">
            Fulfill Orders →
          </Link>
        </div>

        {/* KPI 4: Pending Wallet Approvals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Wallet Requests</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FC5C03] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {stats?.pendingDeposits || 0}
          </span>
          <Link href="/admin/wallet" className="text-[11px] text-[#FC5C03] font-bold hover:underline block">
            Approve Top-ups →
          </Link>
        </div>

        {/* KPI 5: Digital Stock Pool */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Available Vault Keys</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {stats?.availableStockCount || 0}
          </span>
          <Link href="/admin/inventory" className="text-[11px] text-purple-600 font-bold hover:underline block">
            Manage Vault →
          </Link>
        </div>

        {/* KPI 6: Registered Customers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Customers</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {stats?.totalCustomers || 0}
          </span>
          <Link href="/admin/users" className="text-[11px] text-slate-500 font-bold hover:underline block">
            View Users →
          </Link>
        </div>

      </div>

      {/* Visual Analytics & Gateway Velocity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 7-Day Revenue & Velocity Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Revenue & Sales Velocity Trend</h3>
              <p className="text-xs text-slate-500">Daily verified volume over the selected window</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg font-mono">
              7 Days Velocity
            </span>
          </div>

          {/* Bar / Trend Chart */}
          <div className="pt-4">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 border-b border-slate-100 pb-3">
              {stats?.dailyTrend && stats.dailyTrend.map((day, idx) => {
                const heightPercent = Math.max(8, Math.round((day.revenue / maxDailyRevenue) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      ৳{day.revenue} ({day.orders} orders)
                    </div>

                    <div className="w-full max-w-[36px] bg-slate-100 rounded-xl overflow-hidden h-36 flex items-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-[#FC5C03] to-[#FF8540] rounded-xl transition-all group-hover:brightness-110"
                      />
                    </div>
                    <span className="text-[10.5px] font-semibold text-slate-500 font-mono text-center truncate max-w-full">
                      {day.date.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Payment Gateway Distribution & Quick Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Gateways Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-900">Gateway Distribution</h3>
            
            <div className="space-y-3">
              {stats?.gatewayDistribution && Object.keys(stats.gatewayDistribution).length > 0 ? (
                Object.entries(stats.gatewayDistribution).map(([gw, vol]) => {
                  const percent = stats.revenue > 0 ? Math.round((vol / stats.revenue) * 100) : 0;
                  return (
                    <div key={gw} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800 uppercase">{gw}</span>
                        <span className="font-mono text-slate-500">{formatPrice(vol)} ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percent}%` }}
                          className="h-full bg-[#FC5C03] rounded-full"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No payment transactions in this period.</p>
              )}
            </div>
          </div>

          {/* Quick Operational Shortcuts */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/products/new"
                className="p-3 bg-slate-50 hover:bg-[#FFF2E8] hover:text-[#FC5C03] rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-[#FC5C03]" />
                <span>Add Product</span>
              </Link>

              <Link
                href="/admin/inventory"
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-2"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>Import Stock</span>
              </Link>

              <Link
                href="/admin/coupons"
                className="p-3 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-2"
              >
                <Tag className="w-3.5 h-3.5 text-purple-600" />
                <span>New Coupon</span>
              </Link>

              <Link
                href="/admin/reports"
                className="p-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 transition-colors flex items-center gap-2"
              >
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Sales Reports</span>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Orders Stream */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#FC5C03]" />
            <h3 className="text-base font-black text-slate-900">Recent Customer Purchases</h3>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#FC5C03] hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 divide-y divide-slate-100">
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.map((o) => (
              <div key={o.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">#{o.orderNumber || o.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        o.deliveryStatus === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-800"
                          : o.deliveryStatus === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.deliveryStatus}
                    </span>
                    <span className="text-slate-400">• {new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mt-1">{o.itemsSummary || "Digital Subscription"}</h4>
                  <span className="text-slate-400">Customer: {o.customerName} ({o.customerEmail})</span>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="font-black text-sm text-slate-900">{formatPrice(o.totalBDT)}</span>
                  <Link
                    href={`/admin/orders?orderId=${o.orderNumber || o.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                  >
                    View Order
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">No orders found.</p>
          )}
        </div>
      </div>

    </div>
  );
}
