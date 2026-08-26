"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, KeyRound, Search, ExternalLink, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

export default function DashboardOrdersPage() {
  const { formatPrice } = useCurrency();
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const orders = [
    {
      id: "AH-89211",
      productName: "ChatGPT Plus (1 Month Shared)",
      variation: "1 Month Shared Profile",
      amountBDT: 290,
      paymentMethod: "bKash",
      trxId: "BL90X84Q",
      status: "DELIVERED",
      date: "2026-08-25 14:15",
      deliveredKey: "Email: user12@gptaccess.net | Pass: SmartGpt2026! | Pin: 4092",
    },
    {
      id: "AH-89204",
      productName: "Canva Pro (1 Year Personal)",
      variation: "1 Year Personal Email Activation",
      amountBDT: 499,
      paymentMethod: "Nagad",
      trxId: "NG882K19",
      status: "DELIVERED",
      date: "2026-08-20 11:35",
      deliveredKey: "Invite Link: https://canva.com/brand/join?token=AH-PRO-2026-INVITE",
    },
    {
      id: "AH-89190",
      productName: "NordVPN Ultimate (1 Year)",
      variation: "1 Year 6 Devices Dedicated",
      amountBDT: 950,
      paymentMethod: "Wallet",
      trxId: "WLT-89190",
      status: "PROCESSING",
      date: "2026-08-26 19:20",
      deliveredKey: null,
    },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === "ALL" || o.status === filter;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-[#1A1D26]">আমার অর্ডারসমূহ (My Orders)</h1>
          <p className="text-xs text-[#7A8190]">আপনার অর্ডারের বর্তমান অবস্থা এবং ইনভয়েস হিস্ট্রি</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E8E8EE] self-start sm:self-auto">
          {["ALL", "DELIVERED", "PROCESSING"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filter === f ? "bg-[#FC5C03] text-white" : "text-gray-600 hover:text-black"
              }`}
            >
              {f === "ALL" ? "সবগুলো" : f === "DELIVERED" ? "ডেলিভার্ড" : "প্রসেসিং"}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="অর্ডার নাম্বার বা প্রোডাক্টের নাম দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-[#E8E8EE] text-xs focus:outline-hidden focus:border-[#FC5C03]"
        />
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E8EE] p-8 text-center space-y-2">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500 font-bold">কোনো অর্ডার পাওয়া যায়নি।</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#E8E8EE] p-4 sm:p-5 shadow-2xs hover:border-[#FC5C03]/30 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#1A1D26]">{order.id}</span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.status === "DELIVERED" ? "ডেলিভারি সম্পন্ন" : "অর্ডার প্রসেসিং হচ্ছে"}
                  </span>
                </div>
                <span className="text-[11px] text-[#7A8190]">{order.date}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-8">
                  <h3 className="text-sm font-bold text-[#1A1D26]">{order.productName}</h3>
                  <span className="text-xs text-gray-500">{order.variation}</span>
                  <div className="flex items-center gap-2 text-[11px] text-[#7A8190] mt-1">
                    <span>মেথড: <b>{order.paymentMethod}</b></span>
                    <span>•</span>
                    <span>TrxID: <code>{order.trxId}</code></span>
                  </div>
                </div>

                <div className="sm:col-span-4 flex flex-col sm:items-end gap-2">
                  <span className="text-base font-black text-[#FC5C03]">
                    {formatPrice(order.amountBDT)}
                  </span>
                  {order.status === "DELIVERED" ? (
                    <Link
                      href="/dashboard/keys"
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>ভল্ট থেকে কি নিন</span>
                    </Link>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>৫-১৫ মিনিটের মধ্যে ডেলিভারি হবে</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
