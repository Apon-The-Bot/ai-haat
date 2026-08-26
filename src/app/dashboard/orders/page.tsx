"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, KeyRound, Search, Clock, PackageOpen } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";

interface CustomerOrder {
  id: string;
  productName: string;
  variation: string;
  amountBDT: number;
  paymentMethod: string;
  trxId: string;
  status: string;
  date: string;
  deliveredKey?: string | null;
}

export default function DashboardOrdersPage() {
  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === "ALL" || o.status === filter;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1A1D26]">
            {isBn ? "আমার অর্ডারসমূহ" : "My Orders"}
          </h1>
          <p className="text-xs text-[#7A8190] mt-0.5">
            {isBn
              ? "আপনার সমস্ত সাম্প্রতিক কেনাকাটা ও ডেলিভারি স্ট্যাটাস।"
              : "Track purchase history, live order statuses, and access keys."}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-xl border border-[#E8E8EE] self-start sm:self-auto">
          {["ALL", "PROCESSING", "DELIVERED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filter === tab
                  ? "bg-white text-[#FC5C03] shadow-xs"
                  : "text-[#7A8190] hover:text-[#1A1D26]"
              }`}
            >
              {tab === "ALL" ? (isBn ? "সকল" : "All") : tab === "PROCESSING" ? (isBn ? "চলমান" : "Processing") : (isBn ? "সম্পন্ন" : "Delivered")}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#E8E8EE] p-4 sm:p-5 shadow-2xs space-y-3 hover:border-[#FC5C03]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#FC5C03]">{order.id}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{order.date}</span>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase self-start sm:self-auto ${
                    order.status === "DELIVERED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${order.status === "DELIVERED" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                  <span>{order.status}</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[#1A1D26]">{order.productName}</h4>
                  <span className="text-xs text-gray-500">{order.variation}</span>
                  <div className="text-xs text-gray-400 mt-1">
                    <span>{order.paymentMethod}</span> • <span className="font-mono">{order.trxId}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-sm sm:text-base font-black text-[#FC5C03] block">
                    {formatPrice(order.amountBDT)}
                  </span>
                  {order.status === "DELIVERED" && (
                    <Link
                      href="/dashboard/keys"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline mt-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{isBn ? "ভল্টে কি দেখুন" : "View Key in Vault"}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#E8E8EE] p-8 shadow-xs max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <PackageOpen className="w-8 h-8 text-[#FC5C03]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#1A1D26]">
              {isBn ? "কোনো অর্ডার নেই" : "No Orders Placed Yet"}
            </h3>
            <p className="text-xs text-[#7A8190] leading-relaxed max-w-sm mx-auto">
              {isBn
                ? "আপনার কেনা সমস্ত সাবস্ক্রিপশনের বিবরণ ও অর্ডার ট্র্যাকিং হিস্টোরি এখানে দেখতে পাবেন।"
                : "You haven't placed any orders yet. Browse our marketplace to purchase premium digital tools."}
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isBn ? "শপ ব্রাউজ করুন" : "Browse Marketplace"}</span>
          </Link>
        </div>
      )}

    </div>
  );
}
