"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  KeyRound,
  Wallet,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const recentOrders = [
    {
      id: "AH-89211",
      productName: "ChatGPT Plus (1 Month Shared)",
      amountBDT: 290,
      status: "DELIVERED",
      date: "2026-08-25 14:15",
      hasKey: true,
    },
    {
      id: "AH-89204",
      productName: "Canva Pro (1 Year Personal)",
      amountBDT: 499,
      status: "DELIVERED",
      date: "2026-08-20 11:35",
      hasKey: true,
    },
    {
      id: "AH-89190",
      productName: "NordVPN Ultimate (1 Year)",
      amountBDT: 950,
      status: "PROCESSING",
      date: "2026-08-26 19:20",
      hasKey: false,
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-[#1A1D26] via-[#2A2E3B] to-[#1A1D26] rounded-2xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FC5C03] text-white text-[10px] font-bold rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>AI Haat Client Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            স্বাগতম, {user?.name || "Amanullah Sheikh"}! 👋
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-md">
            আপনার সকল ডিজিটাল প্রোডাক্ট, লাইসেন্স কি এবং ওয়ালেট ব্যালেন্স এক জায়গা থেকে ম্যানেজ করুন।
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/dashboard/keys"
            className="px-4 py-2.5 bg-white text-[#1A1D26] hover:bg-[#FFF2E8] hover:text-[#FC5C03] text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#FC5C03]" />
            <span>ডিজিটাল ভল্ট</span>
          </Link>
          <Link
            href="/shop"
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>শপ ব্রাউজ</span>
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Total Orders */}
        <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#7A8190] block">মোট অর্ডার</span>
            <span className="text-2xl font-black text-[#1A1D26]">৩ টি</span>
            <Link href="/dashboard/orders" className="text-[11px] text-[#FC5C03] font-bold hover:underline block mt-0.5">
              অর্ডার তালিকা →
            </Link>
          </div>
        </div>

        {/* Metric 2: Delivered Keys */}
        <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#7A8190] block">ভল্টে সংরক্ষিত কি</span>
            <span className="text-2xl font-black text-[#1A1D26]">২ টি</span>
            <Link href="/dashboard/keys" className="text-[11px] text-emerald-600 font-bold hover:underline block mt-0.5">
              ভল্ট ওপেন করুন →
            </Link>
          </div>
        </div>

        {/* Metric 3: Wallet Balance */}
        <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FC5C03] flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#7A8190] block">ওয়ালেট ব্যালেন্স</span>
            <span className="text-2xl font-black text-[#FC5C03]">
              {formatPrice(user?.walletBalanceBDT || 500)}
            </span>
            <Link href="/dashboard/wallet" className="text-[11px] text-[#FC5C03] font-bold hover:underline block mt-0.5">
              রিচার্জ করুন →
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Orders List */}
      <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FC5C03]" />
            <h3 className="text-sm font-bold text-[#1A1D26]">সাম্প্রতিক অর্ডারসমূহ</h3>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-bold text-[#FC5C03] hover:underline flex items-center gap-0.5"
          >
            <span>সব দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 divide-y divide-gray-100">
          {recentOrders.map((order) => (
            <div key={order.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#1A1D26]">{order.id}</span>
                  <span
                    className={`px-2 py-0.5 text-[9.5px] font-bold rounded-md uppercase ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.status === "DELIVERED" ? "ডেলিভার্ড" : "প্রসেসিং হচ্ছে"}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#1A1D26] mt-1">{order.productName}</h4>
                <span className="text-[10.5px] text-[#7A8190]">{order.date}</span>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-xs font-extrabold text-[#FC5C03]">
                  {formatPrice(order.amountBDT)}
                </span>
                {order.hasKey && (
                  <Link
                    href="/dashboard/keys"
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>কি দেখুন</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
