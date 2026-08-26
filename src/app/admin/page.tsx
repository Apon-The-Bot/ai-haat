"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Wallet,
  Users,
  Package,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Send,
  Sparkles,
  Tag,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

export default function AdminOverviewPage() {
  const { formatPrice } = useCurrency();

  const metrics = [
    {
      title: "Total Revenue",
      value: "৳0",
      change: "",
      icon: DollarSign,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Total Orders",
      value: "0",
      change: "",
      icon: ShoppingBag,
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      title: "Pending Fulfillment",
      value: "0",
      change: "",
      icon: Clock,
      color: "text-amber-800 bg-amber-50 border-amber-200",
    },
    {
      title: "Wallet Deposits",
      value: "0 Pending",
      change: "",
      icon: Wallet,
      color: "text-[#FC5C03] bg-orange-50 border-orange-200",
    },
    {
      title: "Registered Users",
      value: "0",
      change: "",
      icon: Users,
      color: "text-purple-700 bg-purple-50 border-purple-200",
    },
    {
      title: "Active Products",
      value: "0 Items",
      change: "",
      icon: Package,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    },
  ];

  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Top Welcome Banner (White Theme) */}
      <div className="p-6 sm:p-7 bg-white rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] border border-[#FC5C03]/20 rounded-full text-[#FC5C03] text-xs font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Haat Operations Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Store Overview & Revenue Velocity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Live order queue, real-time revenue stats, wallet approval requests, and inventory health.
          </p>
        </div>

        <div className="flex gap-2.5">
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Open Order Queue</span>
          </Link>
          <Link
            href="/admin/coupons"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Coupons</span>
          </Link>
        </div>
      </div>

      {/* 6 Metric Cards (White Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 hover:border-[#FC5C03]/40 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">{m.title}</span>
                <div className={`p-2.5 rounded-xl border ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900">{m.value}</div>
                <span className="text-[11px] text-slate-500 font-semibold block mt-0.5">
                  {m.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section: Pending Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Pending Orders (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Pending Orders Requiring Fulfillment
              </h3>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#FC5C03] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingOrders.length > 0 ? (
              pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-[#FC5C03]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#FC5C03]">{order.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        {order.time}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{order.product}</h4>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      {order.customer} • TrxID: <b>{order.trxId}</b>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-sm font-black text-slate-900">
                      {formatPrice(order.amountBDT)}
                    </span>
                    <Link
                      href="/admin/orders"
                      className="px-3 py-1.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Fulfill</span>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-sm text-slate-500">No pending orders.</div>
            )}
          </div>
        </div>

        {/* Right: Quick Admin Shortcuts (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Quick Actions
          </h3>

          <div className="space-y-2">
            <Link
              href="/admin/products"
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between transition-colors block"
            >
              <span>Manage Products & Stock</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/admin/coupons"
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between transition-colors block"
            >
              <span>Create Discount Coupon</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/admin/wallet"
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between transition-colors block"
            >
              <span>Approve Wallet Deposits</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/admin/settings"
              className="w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between transition-colors block"
            >
              <span>Telegram & Email API Keys</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
