"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCheck, KeyRound, Wallet, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardNotificationsPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      title: "Order Delivered Successfully",
      message: "Credentials for your ChatGPT Plus (Order #AH-89211) are now available in your Digital Vault.",
      type: "DELIVERY",
      date: "Aug 25, 2026 14:15",
      isRead: false,
      link: "/dashboard/keys",
    },
    {
      id: "notif-2",
      title: "Wallet Top-up Approved",
      message: "Your bKash deposit of ৳500 (TrxID: BL90X84Q) has been credited to your wallet.",
      type: "WALLET",
      date: "Aug 25, 2026 12:30",
      isRead: true,
      link: "/dashboard/wallet",
    },
    {
      id: "notif-3",
      title: "Welcome to AI Haat",
      message: "Enjoy instant 1-click delivery and replacement warranty on all software subscriptions.",
      type: "SYSTEM",
      date: "Aug 20, 2026 10:00",
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
          <h1 className="text-lg sm:text-xl font-black text-[#1A1D26]">
            {isBn ? "ইনবক্স ও নোটিফিকেশন" : "Notifications"}
          </h1>
          <p className="text-xs text-[#7A8190]">
            {isBn ? "আপনার অর্ডার ও অ্যাকাউন্টের লাইভ আপডেট" : "Live account and order delivery updates."}
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="text-xs font-bold text-[#FC5C03] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>{isBn ? "সব পড়া হয়েছে" : "Mark all as read"}</span>
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
                <Link
                  href={n.link}
                  className="inline-block mt-2 text-xs font-bold text-[#FC5C03] hover:underline"
                >
                  {isBn ? "বিস্তারিত দেখুন →" : "View Details →"}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
