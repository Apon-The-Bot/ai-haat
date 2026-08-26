"use client";

import React, { useState } from "react";
import { Bell, CheckCheck, ShoppingBag, KeyRound, Wallet, Sparkles } from "lucide-react";

export default function DashboardNotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "অর্ডার ডেলিভারি সম্পন্ন হয়েছে! 🎉",
      message: "আপনার ChatGPT Plus (Order #AH-89211) এর লগইন ক্রেডেনশিয়াল ডিজিটাল ভল্টে যোগ করা হয়েছে।",
      type: "DELIVERY",
      date: "2026-08-25 14:15",
      isRead: false,
      link: "/dashboard/keys",
    },
    {
      id: "notif-2",
      title: "ওয়ালেট রিচার্জ সফল! ৳৫০০ যোগ হয়েছে",
      message: "আপনার bKash TrxID (BL90X84Q) যাচাই করে ওয়ালেটে ৫০০ টাকা ক্রেডিট করা হয়েছে।",
      type: "WALLET",
      date: "2026-08-25 12:30",
      isRead: true,
      link: "/dashboard/wallet",
    },
    {
      id: "notif-3",
      title: "AI Haat-এ আপনাকে স্বাগতম!",
      message: "নিরাপদে ও দ্রুত যেকোনো এআই টুলস এবং প্রিমিয়াম সফটওয়্যার উপভোগ করুন।",
      type: "SYSTEM",
      date: "2026-08-20 10:00",
      isRead: true,
      link: "/shop",
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-[#1A1D26]">ইনবক্স ও নোটিফিকেশন (Notifications)</h1>
          <p className="text-xs text-[#7A8190]">আপনার অর্ডার ও অ্যাকাউন্টের সকল লাইভ আপডেট</p>
        </div>

        <button
          onClick={markAllAsRead}
          className="text-xs font-bold text-[#FC5C03] hover:underline flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>সব পড়া হয়েছে</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-3.5 ${
              n.isRead
                ? "bg-white border-[#E8E8EE]"
                : "bg-[#FFF9F5] border-[#FC5C03]/30 shadow-2xs"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                n.type === "DELIVERY"
                  ? "bg-emerald-100 text-emerald-700"
                  : n.type === "WALLET"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-orange-100 text-[#FC5C03]"
              }`}
            >
              {n.type === "DELIVERY" ? (
                <KeyRound className="w-4 h-4" />
              ) : n.type === "WALLET" ? (
                <Wallet className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-[#1A1D26]">{n.title}</h4>
                <span className="text-[10px] text-[#7A8190] shrink-0">{n.date}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
              {n.link && (
                <a
                  href={n.link}
                  className="inline-block mt-2 text-xs font-bold text-[#FC5C03] hover:underline"
                >
                  বিস্তারিত দেখুন →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
