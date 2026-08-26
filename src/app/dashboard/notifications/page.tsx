"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCheck, KeyRound, Wallet, Sparkles, BellOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  date: string;
  isRead: boolean;
  link: string;
}

export default function DashboardNotificationsPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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

        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-bold text-[#FC5C03] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{isBn ? "সব পড়া হয়েছে" : "Mark all as read"}</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={notif.link}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 block ${
                notif.isRead
                  ? "bg-white border-[#E8E8EE] hover:border-gray-300"
                  : "bg-[#FFF9F5] border-[#FFE4D6] hover:border-[#FC5C03]"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.type === "DELIVERY"
                    ? "bg-emerald-100 text-emerald-700"
                    : notif.type === "WALLET"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-[#FFF2E8] text-[#FC5C03]"
                }`}
              >
                {notif.type === "DELIVERY" ? (
                  <KeyRound className="w-4 h-4" />
                ) : notif.type === "WALLET" ? (
                  <Wallet className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold ${notif.isRead ? "text-[#1A1D26]" : "text-[#FC5C03]"}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 shrink-0">{notif.date}</span>
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#E8E8EE] p-8 shadow-xs max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <BellOff className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {isBn ? "কোনো নতুন নোটিফিকেশন নেই" : "No Notifications"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            {isBn
              ? "আপনার অর্ডার ডেলিভারি, ওয়ালেট রিচার্জ এবং অ্যাকাউন্টের আপডেট এখানে দেখতে পাবেন।"
              : "Order delivery alerts, wallet credits, and security updates will appear here."}
          </p>
        </div>
      )}

    </div>
  );
}
