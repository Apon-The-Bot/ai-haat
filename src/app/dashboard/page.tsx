"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  KeyRound,
  Wallet,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";

interface RecentOrderSummary {
  id: string;
  productSummary: string;
  amountBDT: number;
  status: string;
  rawStatus: string;
  date: string;
  hasKey: boolean;
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [recentOrders, setRecentOrders] = useState<RecentOrderSummary[]>([]);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [vaultKeysCount, setVaultKeysCount] = useState(0);
  const [processingCount, setProcessingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, vaultRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/vault/credentials"),
      ]);

      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        if (oData.orders) {
          const list = oData.orders;
          setTotalOrdersCount(oData.pagination?.total || list.length);

          const processing = list.filter(
            (o: any) => o.rawDeliveryStatus === "PROCESSING" || o.rawDeliveryStatus === "PREPARING" || o.rawDeliveryStatus === "ORDER_PLACED"
          ).length;
          setProcessingCount(processing);

          setRecentOrders(
            list.slice(0, 5).map((o: any) => {
              const summary =
                Array.isArray(o.items) && o.items.length > 0
                  ? o.items.map((it: any) => `${it.productName} (${it.variationName}) × ${it.quantity}`).join(", ")
                  : "Digital Subscription";

              return {
                id: o.orderNumber || o.id,
                productSummary: summary,
                amountBDT: o.totalBDT || 0,
                status: o.deliveryStatus || "Processing",
                rawStatus: o.rawDeliveryStatus || "PROCESSING",
                date: o.date || "Recently",
                hasKey: Boolean(o.hasDeliveredKeys),
              };
            })
          );
        }
      }

      if (vaultRes.ok) {
        const vData = await vaultRes.json();
        if (vData.keys) {
          setVaultKeysCount(vData.keys.length);
        }
      }
    } catch (e) {
      console.error("Failed to load customer dashboard overview:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#1A1D26] via-[#242938] to-[#1A1D26] rounded-3xl text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FC5C03] text-white text-[10.5px] font-bold rounded-full uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>AI Haat Client Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {isBn ? `স্বাগতম, ${user?.name || "Member"}!` : `Welcome back, ${user?.name || "Member"}!`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
            {isBn
              ? "আপনার সমস্ত ডিজিটাল প্রোডাক্ট, লাইসেন্স কি, ওয়ালেট ব্যালেন্স ও ওয়ারেন্টি সেবা এক জায়গা থেকে পরিচালনা করুন।"
              : "Manage your purchased subscriptions, license keys, and 1-click wallet balance with guaranteed warranty protection."}
          </p>
        </div>

        <div className="flex gap-2.5 relative z-10 shrink-0">
          <Link
            href="/dashboard/keys"
            className="px-4 py-2.5 bg-white text-[#1A1D26] hover:bg-[#FFF2E8] hover:text-[#FC5C03] text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#FC5C03]" />
            <span>{isBn ? "ডিজিটাল ভল্ট" : "Digital Vault"}</span>
          </Link>
          <Link
            href="/shop"
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isBn ? "শপ ব্রাউজ" : "Browse Shop"}</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Orders */}
        <div className="bg-white rounded-3xl border border-[#E8E8EE] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isBn ? "মোট অর্ডার" : "Total Orders"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {totalOrdersCount}
          </span>
          <Link href="/dashboard/orders" className="text-[11px] text-[#FC5C03] font-bold hover:underline block">
            {isBn ? "অর্ডার তালিকা দেখুন →" : "View Purchases →"}
          </Link>
        </div>

        {/* Metric 2: Digital Vault Keys */}
        <div className="bg-white rounded-3xl border border-[#E8E8EE] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isBn ? "ভল্টে প্রোডাক্টস" : "Vault Products"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {vaultKeysCount}
          </span>
          <Link href="/dashboard/keys" className="text-[11px] text-emerald-600 font-bold hover:underline block">
            {isBn ? "ভল্ট ওপেন করুন →" : "Open Vault →"}
          </Link>
        </div>

        {/* Metric 3: Processing Orders */}
        <div className="bg-white rounded-3xl border border-[#E8E8EE] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isBn ? "চলমান অর্ডার" : "Processing Orders"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {processingCount}
          </span>
          <Link href="/dashboard/orders?status=PROCESSING" className="text-[11px] text-amber-600 font-bold hover:underline block">
            {isBn ? "ট্র্যাক করুন →" : "Track Status →"}
          </Link>
        </div>

        {/* Metric 4: Wallet Balance */}
        <div className="bg-white rounded-3xl border border-[#E8E8EE] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FC5C03] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-[#FC5C03] block">
            {formatPrice(user?.walletBalanceBDT || 0)}
          </span>
          <Link href="/dashboard/wallet" className="text-[11px] text-[#FC5C03] font-bold hover:underline block">
            {isBn ? "+ রিচার্জ করুন →" : "+ Top Up Funds →"}
          </Link>
        </div>

      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/dashboard/keys"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs flex items-center gap-3 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-xs font-bold text-slate-900 block">Digital Vault</strong>
            <span className="text-[10.5px] text-slate-400">Access credentials</span>
          </div>
        </Link>

        <Link
          href="/dashboard/orders"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs flex items-center gap-3 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-xs font-bold text-slate-900 block">Track Orders</strong>
            <span className="text-[10.5px] text-slate-400">View progress</span>
          </div>
        </Link>

        <Link
          href="/dashboard/wallet"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs flex items-center gap-3 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FC5C03] flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-xs font-bold text-slate-900 block">Top Up Wallet</strong>
            <span className="text-[10.5px] text-slate-400">1-click checkout</span>
          </div>
        </Link>

        <Link
          href="https://wa.me/8801700000000"
          target="_blank"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs flex items-center gap-3 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-xs font-bold text-slate-900 block">WhatsApp Help</strong>
            <span className="text-[10.5px] text-slate-400">24/7 support</span>
          </div>
        </Link>
      </div>

      {/* Recent Purchases Stream */}
      <div className="bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-7 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FC5C03]" />
            <h3 className="text-base font-black text-slate-900">
              {isBn ? "সাম্প্রতিক কেনাকাটা" : "Recent Orders"}
            </h3>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-bold text-[#FC5C03] hover:underline flex items-center gap-1"
          >
            <span>{isBn ? "সব অর্ডার দেখুন" : "View All"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 divide-y divide-slate-100">
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-600">
                {isBn ? "এখনো কোনো অর্ডার নেই" : "No orders placed yet"}
              </p>
              <Link href="/shop" className="text-xs text-[#FC5C03] font-bold mt-1 hover:underline">
                {isBn ? "মার্কেটপ্লেস ব্রাউজ করুন →" : "Explore Marketplace →"}
              </Link>
            </div>
          ) : (
            recentOrders.map((order) => {
              const isDelivered = order.rawStatus === "DELIVERED";
              return (
                <div
                  key={order.id}
                  className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">#{order.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isDelivered
                            ? "bg-emerald-100 text-emerald-800"
                            : order.rawStatus === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-slate-400">• {order.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mt-1">{order.productSummary}</h4>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="font-black text-sm text-slate-900">
                      {formatPrice(order.amountBDT)}
                    </span>
                    {isDelivered && (
                      <Link
                        href="/dashboard/keys"
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 flex items-center gap-1 transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{isBn ? "ভল্ট দেখুন" : "View Key"}</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
