"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  KeyRound,
  Wallet,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [recentOrders, setRecentOrders] = useState<{id:string;productName:string;amountBDT:number;status:string;date:string;hasKey:boolean}[]>([]);

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
            {isBn ? `স্বাগতম, ${user?.name || "Member"}!` : `Welcome back, ${user?.name || "Member"}!`}
          </h1>
          <p className="text-xs text-gray-300 mt-1 max-w-md">
            {isBn
              ? "আপনার সমস্ত ডিজিটাল প্রোডাক্ট, লাইসেন্স কি এবং ওয়ালেট এক জায়গা থেকে নিয়ন্ত্রণ করুন।"
              : "Manage your active subscriptions, license keys, and wallet balance from one place."}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/dashboard/keys"
            className="px-4 py-2.5 bg-white text-[#1A1D26] hover:bg-[#FFF2E8] hover:text-[#FC5C03] text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#FC5C03]" />
            <span>{isBn ? "ডিজিটাল ভল্ট" : "Digital Vault"}</span>
          </Link>
          <Link
            href="/shop"
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isBn ? "শপ ব্রাউজ" : "Browse Shop"}</span>
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
            <span className="text-xs font-bold text-[#7A8190] block">
              {isBn ? "মোট অর্ডার" : "Total Orders"}
            </span>
            <span className="text-2xl font-black text-[#1A1D26]">{recentOrders.length}</span>
            <Link href="/dashboard/orders" className="text-[11px] text-[#FC5C03] font-bold hover:underline block mt-0.5">
              {isBn ? "অর্ডার তালিকা →" : "View Orders →"}
            </Link>
          </div>
        </div>

        {/* Metric 2: Delivered Keys */}
        <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#7A8190] block">
              {isBn ? "ভল্টে সংরক্ষিত কি" : "Keys in Vault"}
            </span>
            <span className="text-2xl font-black text-[#1A1D26]">0</span>
            <Link href="/dashboard/keys" className="text-[11px] text-emerald-600 font-bold hover:underline block mt-0.5">
              {isBn ? "ভল্ট ওপেন করুন →" : "Open Vault →"}
            </Link>
          </div>
        </div>

        {/* Metric 3: Wallet Balance */}
        <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FC5C03] flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#7A8190] block">
              {isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}
            </span>
            <span className="text-2xl font-black text-[#FC5C03]">
              {formatPrice(user?.walletBalanceBDT || 0)}
            </span>
            <Link href="/dashboard/wallet" className="text-[11px] text-[#FC5C03] font-bold hover:underline block mt-0.5">
              {isBn ? "রিচার্জ করুন →" : "Top Up →"}
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Orders List */}
      <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FC5C03]" />
            <h3 className="text-sm font-bold text-[#1A1D26]">
              {isBn ? "সাম্প্রতিক অর্ডারসমূহ" : "Recent Orders"}
            </h3>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-bold text-[#FC5C03] hover:underline flex items-center gap-0.5"
          >
            <span>{isBn ? "সব দেখুন" : "View All"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 divide-y divide-gray-100">
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center">
              <ShoppingBag className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-bold text-gray-500">{isBn ? "এখনো কোনো অর্ডার নেই" : "No orders yet"}</p>
            </div>
          ) : (
            recentOrders.map((order) => (
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
                      {order.status === "DELIVERED" ? (isBn ? "ডেলিভার্ড" : "Delivered") : (isBn ? "প্রসেসিং" : "Processing")}
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
                      <span>{isBn ? "কি দেখুন" : "View Keys"}</span>
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
