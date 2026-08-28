"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCheck,
  KeyRound,
  Wallet,
  Sparkles,
  BellOff,
  ShoppingBag,
  RotateCcw,
  RefreshCw,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  date: string;
  time?: string;
  isRead: boolean;
  link: string;
}

export default function DashboardNotificationsPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const markSingleAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking single read:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "DELIVERY":
        return { bg: "bg-emerald-50 text-emerald-600 border border-emerald-100", icon: KeyRound };
      case "WALLET":
        return { bg: "bg-orange-50 text-[#FC5C03] border border-orange-100", icon: Wallet };
      case "ORDER":
        return { bg: "bg-blue-50 text-blue-600 border border-blue-100", icon: ShoppingBag };
      case "REPLACEMENT":
        return { bg: "bg-purple-50 text-purple-600 border border-purple-100", icon: RotateCcw };
      default:
        return { bg: "bg-slate-50 text-slate-600 border border-slate-200", icon: Sparkles };
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-7 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-[#FFE4D6]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Activity Feed</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1A1D26] tracking-tight">
            {isBn ? "ইনবক্স ও নোটিফিকেশন" : "Notifications & Alerts"}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A8190] mt-0.5">
            {isBn
              ? "আপনার অর্ডার ডেলিভারি, ওয়ালেট রিচার্জ এবং অ্যাকাউন্টের গুরুত্বপূর্ণ আপডেট।"
              : "Real-time updates on your orders, credential deliveries, and wallet transactions."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#FC5C03] font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>{isBn ? "সব পড়া হয়েছে" : "Mark All as Read"}</span>
            </button>
          )}

          <button
            onClick={fetchNotifications}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const { bg, icon: Icon } = getNotificationIcon(notif.type);

            return (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                  notif.isRead
                    ? "bg-white border-[#E8E8EE]"
                    : "bg-[#FFF9F5] border-[#FFE4D6] shadow-2xs"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${bg}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-bold ${notif.isRead ? "text-slate-900" : "text-[#FC5C03]"}`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#FC5C03]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {notif.date} {notif.time ? `• ${notif.time}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Link
                    href={notif.link}
                    onClick={() => {
                      if (!notif.isRead) markSingleAsRead(notif.id);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-[#FFF2E8] text-slate-700 hover:text-[#FC5C03] font-bold text-xs rounded-xl transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#E8E8EE] p-8 shadow-2xs max-w-lg mx-auto space-y-3">
          <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <BellOff className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            {isBn ? "কোনো নোটিফিকেশন নেই" : "No Notifications Yet"}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            {isBn
              ? "অর্ডার ডেলিভারি, কি আপডেট ও ওয়ালেট ব্যালেন্স পরিবর্তনের নোটিফিকেশন এখানে পাওয়া যাবে।"
              : "Order delivery alerts, wallet top-up confirmations, and security updates will appear here."}
          </p>
        </div>
      )}

    </div>
  );
}
