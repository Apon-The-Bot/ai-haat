"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  KeyRound,
  Wallet,
  Clock,
  Plus,
  Compass,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { EmptyState } from "@/components/ui/EmptyState";

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
            list.slice(0, 3).map((o: any) => {
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

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        <div className="h-32 rounded-2xl skeleton bg-slate-200 animate-pulse"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 rounded-xl skeleton bg-slate-200 animate-pulse"></div>
          <div className="h-20 rounded-xl skeleton bg-slate-200 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-24 rounded-xl skeleton bg-slate-200 animate-pulse"></div>
          <div className="h-24 rounded-xl skeleton bg-slate-200 animate-pulse"></div>
          <div className="h-24 rounded-xl skeleton bg-slate-200 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="h-6 w-32 rounded skeleton bg-slate-200 animate-pulse mb-4"></div>
          <div className="h-24 rounded-2xl skeleton bg-slate-200 animate-pulse"></div>
          <div className="h-24 rounded-2xl skeleton bg-slate-200 animate-pulse"></div>
          <div className="h-24 rounded-2xl skeleton bg-slate-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-8">
      {/* 1. Wallet Balance Card (Prominent Dark) */}
      <div className="bg-[#1A1D26] rounded-2xl p-6 shadow-card text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Background decorative element */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FC5C03] opacity-20 rounded-full blur-3xl"></div>
        
        <div className="space-y-1 relative z-10">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-[#FC5C03]" />
            {isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {formatPrice(user?.walletBalanceBDT || 0)}
          </h2>
        </div>
        <Link 
          href="/dashboard/wallet"
          className="relative z-10 w-full sm:w-auto px-5 py-3.5 bg-[#FC5C03] hover:bg-[#E05202] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-md shadow-[#FC5C03]/20"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? "টপ আপ করুন" : "Top Up"}</span>
        </Link>
      </div>

      {/* 2. Quick Actions Row */}
      <div className="grid grid-cols-2 gap-3">
        <Link 
          href="/shop"
          className="bg-white border border-[#E8E8EE] rounded-xl p-4 shadow-2xs flex flex-col items-center justify-center gap-2.5 transition-all hover:shadow-cardHover hover:border-orange-200 active:bg-slate-50 group"
        >
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#FC5C03] group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <span className="text-[13px] font-bold text-slate-800">
            {isBn ? "শপ ব্রাউজ" : "Browse Shop"}
          </span>
        </Link>
        <Link 
          href="/order-tracking"
          className="bg-white border border-[#E8E8EE] rounded-xl p-4 shadow-2xs flex flex-col items-center justify-center gap-2.5 transition-all hover:shadow-cardHover hover:border-blue-200 active:bg-slate-50 group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <span className="text-[13px] font-bold text-slate-800">
            {isBn ? "ট্র্যাক অর্ডার" : "Track Order"}
          </span>
        </Link>
      </div>

      {/* 3. Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/dashboard/orders" className="bg-white border border-[#E8E8EE] rounded-xl p-3 shadow-2xs flex flex-col items-center sm:items-start text-center sm:text-left gap-1 transition-colors hover:shadow-cardHover active:bg-slate-50">
          <div className="text-slate-500 mb-1">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mx-auto sm:mx-0" />
          </div>
          <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">{totalOrdersCount}</span>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate w-full mt-0.5">
            {isBn ? "মোট অর্ডার" : "Total Orders"}
          </span>
        </Link>
        <Link href="/dashboard/keys" className="bg-white border border-[#E8E8EE] rounded-xl p-3 shadow-2xs flex flex-col items-center sm:items-start text-center sm:text-left gap-1 transition-colors hover:shadow-cardHover active:bg-slate-50">
          <div className="text-emerald-500 mb-1">
            <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 mx-auto sm:mx-0" />
          </div>
          <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">{vaultKeysCount}</span>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate w-full mt-0.5">
            {isBn ? "অ্যাক্টিভ কি" : "Active Keys"}
          </span>
        </Link>
        <Link href="/dashboard/orders?status=PROCESSING" className="bg-white border border-[#E8E8EE] rounded-xl p-3 shadow-2xs flex flex-col items-center sm:items-start text-center sm:text-left gap-1 transition-colors hover:shadow-cardHover active:bg-slate-50">
          <div className="text-amber-500 mb-1">
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mx-auto sm:mx-0" />
          </div>
          <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">{processingCount}</span>
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 truncate w-full mt-0.5">
            {isBn ? "প্রসেসিং" : "Processing"}
          </span>
        </Link>
      </div>

      {/* 4. Recent Orders */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[15px] font-black text-slate-900">
            {isBn ? "সাম্প্রতিক অর্ডার" : "Recent Orders"}
          </h3>
          <Link 
            href="/dashboard/orders"
            className="text-xs font-bold text-[#FC5C03] hover:underline"
          >
            {isBn ? "সব দেখুন" : "View All"}
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E8EE] shadow-2xs overflow-hidden">
            <EmptyState 
              icon={<ShoppingBag />}
              title={isBn ? "কোনো অর্ডার পাওয়া যায়নি" : "No orders placed yet"}
              description={isBn ? "মার্কেটপ্লেস ব্রাউজ করুন এবং আপনার প্রথম অর্ডার করুন" : "Browse our marketplace to place your first order."}
              action={{
                label: isBn ? "শপ ব্রাউজ করুন" : "Browse Shop",
                href: "/shop"
              }}
              compact
            />
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const isDelivered = order.rawStatus === "DELIVERED";
              const isCancelled = order.rawStatus === "CANCELLED";
              
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="block bg-white rounded-2xl border border-[#E8E8EE] p-4 shadow-2xs transition-all hover:shadow-cardHover active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-xs font-bold text-slate-500 font-mono">#{order.id}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{order.date}</span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-3">
                    {order.productSummary}
                  </h4>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                    <span className="text-[15px] font-black text-[#FC5C03]">
                      {formatPrice(order.amountBDT)}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        isDelivered
                          ? "bg-emerald-50 text-emerald-700"
                          : isCancelled
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
