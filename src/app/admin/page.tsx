"use client";

import React from "react";
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
  AlertCircle,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

export default function AdminOverviewPage() {
  const { formatPrice } = useCurrency();

  const metrics = [
    {
      title: "মোট বিক্রয় (Total Sales)",
      value: "৳১,২৮,৪৫০",
      change: "+১৮.২% এই মাসে",
      icon: DollarSign,
      color: "text-emerald-400 bg-emerald-950/60 border-emerald-800/40",
    },
    {
      title: "মোট অর্ডার (Total Orders)",
      value: "৪১৮ টি",
      change: "আজকে ১২ টি নতুন",
      icon: ShoppingBag,
      color: "text-blue-400 bg-blue-950/60 border-blue-800/40",
    },
    {
      title: "পেন্ডিং ডেলিভারি (Pending Orders)",
      value: "৩ টি",
      change: "৫-১৫ মিনিটের টার্গেট",
      icon: Clock,
      color: "text-amber-400 bg-amber-950/60 border-amber-800/40",
    },
    {
      title: "ওয়ালেট ডিপোজিট রিকোয়েস্ট",
      value: "১ টি",
      change: "যাচাই বাকি আছে",
      icon: Wallet,
      color: "text-[#FC5C03] bg-orange-950/60 border-orange-800/40",
    },
    {
      title: "রেজিস্টার্ড ইউজার (Users)",
      value: "৮৯২ জন",
      change: "+২৪ জন এই সপ্তাহে",
      icon: Users,
      color: "text-purple-400 bg-purple-950/60 border-purple-800/40",
    },
    {
      title: "সক্রিয় প্রোডাক্টস (Active Products)",
      value: "২২ টি",
      change: "সব ইন-স্টক আছে",
      icon: Package,
      color: "text-cyan-400 bg-cyan-950/60 border-cyan-800/40",
    },
  ];

  const pendingOrders = [
    {
      id: "AH-98214",
      customer: "Sifat Rahman (01711-223344)",
      product: "ChatGPT Plus (1 Month Shared)",
      amount: 290,
      method: "bKash",
      trxId: "BL90X84Q",
      time: "10 মিনিট আগে",
    },
    {
      id: "AH-98213",
      customer: "Tanvir Ahmed (01822-334455)",
      product: "Canva Pro (1 Year Personal)",
      amount: 499,
      method: "Nagad",
      trxId: "NG882K19",
      time: "24 মিনিট আগে",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            এডমিন ড্যাশবোর্ড ওভারভিউ (Admin Overview) 👑
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            রিয়েল-টাইম বিক্রয় পরিসংখ্যান, লাইভ অর্ডার প্রসেসিং ও সাইট নিয়ন্ত্রণ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>অর্ডার ডেলিভারি করুন</span>
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>+ নতুন প্রোডাক্ট</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{m.title}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{m.value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>{m.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Orders Queue & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pending Orders (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950/80 rounded-2xl border border-slate-800 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">পেন্ডিং ডেলিভারি কিউ (Live Orders)</h3>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[#FC5C03] hover:underline flex items-center gap-1"
            >
              <span>সব দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{order.id}</span>
                    <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800/40 text-[10px] font-bold rounded-md uppercase">
                      পেন্ডিং
                    </span>
                    <span className="text-[10.5px] text-slate-400">{order.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{order.product}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{order.customer}</span>
                    <span>•</span>
                    <span>{order.method} (<code>{order.trxId}</code>)</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                  <span className="text-sm font-black text-[#FC5C03]">৳{order.amount}</span>
                  <Link
                    href={`/admin/orders?deliver=${order.id}`}
                    className="px-3 py-1.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>ডেলিভারি দিন</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Telegram & System Status (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Telegram Status Card */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-950 text-sky-400 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Telegram নোটিফিকেশন বট</h4>
                <span className="text-[10px] text-emerald-400 font-bold">● সক্রিয় ও সংযুক্ত</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              যেকোনো নতুন অর্ডার, ওয়ালেট রিচার্জ বা প্রোডাক্ট রিকোয়েস্ট আসলে সাথে সাথে আপনার টেলিগ্রাম চ্যানেলে এলার্ট যাবে।
            </p>
            <Link
              href="/admin/settings"
              className="inline-block text-xs font-bold text-sky-400 hover:underline"
            >
              টেলিগ্রাম বট সেটিংস কনফিগার করুন →
            </Link>
          </div>

          {/* Quick Links Card */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 space-y-2.5">
            <h4 className="text-xs font-bold text-white">দ্রুত এক্সেস</h4>
            <div className="space-y-1.5 text-xs">
              <Link
                href="/admin/wallet"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white"
              >
                <span>💳 রিচার্জ অনুমোদন কিউ</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-amber-900 text-amber-300 rounded-md">১ টি বাকি</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white"
              >
                <span>👥 ইউজার ও রিসেলার লিস্ট</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white"
              >
                <span>⚙️ বিকাশ/নগদ পেমেন্ট নাম্বার</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
