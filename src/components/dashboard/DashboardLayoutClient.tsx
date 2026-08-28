"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  KeyRound,
  Wallet,
  Bell,
  LogOut,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Globe,
  Lock,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
  Mail,
  Banknote,
  LifeBuoy,
  Share2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { SafeImage } from "@/components/SafeImage";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, openLoginModal, openRegisterModal } = useAuth();
  const { formatPrice } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const isBn = language === "bn";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      name: isBn ? "ওভারভিউ" : "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: isBn ? "আমার অর্ডার" : "My Orders",
      href: "/dashboard/orders",
      icon: ShoppingBag,
    },
    {
      name: isBn ? "ডিজিটাল ভল্ট" : "Digital Vault",
      href: "/dashboard/keys",
      icon: KeyRound,
    },
    {
      name: isBn ? "ওয়ারেন্টি ক্লেইমস" : "Warranty Claims",
      href: "/dashboard/replacements",
      icon: RotateCcw,
    },
    {
      name: isBn ? "রিফান্ড রিকোয়েস্ট" : "Refund Requests",
      href: "/dashboard/refunds",
      icon: Banknote,
    },
    {
      name: isBn ? "ওয়ালেট" : "Wallet",
      href: "/dashboard/wallet",
      icon: Wallet,
    },
    {
      name: isBn ? "নোটিফিকেশন" : "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
    },
    {
      name: isBn ? "সিকিউরিটি" : "Security",
      href: "/dashboard/security",
      icon: ShieldCheck,
    },
    {
      name: isBn ? "ইমেইল প্রেফারেন্স" : "Email Preferences",
      href: "/dashboard/preferences",
      icon: Mail,
    },
    {
      name: isBn ? "সাপোর্ট ও সহায়তা" : "Support & Help",
      href: "/dashboard/support",
      icon: LifeBuoy,
    },
    {
      name: isBn ? "অ্যাফিলিয়েট প্রোগ্রাম" : "Affiliate Program",
      href: "/dashboard/affiliate",
      icon: Share2,
    },
  ];

  const isAdmin = user?.role === "ADMIN";

  // Prevent flash of login screen while checking session
  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/70">
        <div className="w-8 h-8 border-3 border-[#FC5C03] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is not logged in, show Auth Guard
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-gray-50/70">
        <div className="max-w-sm w-full bg-white rounded-3xl border border-[#E8E8EE] shadow-sm p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FC5C03]">
            <Lock className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div>
            <h1 className="text-xl font-black text-[#1A1D26] tracking-tight">
              {isBn ? "লগইন করুন" : "Customer Portal Login"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isBn ? "আপনার অ্যাকাউন্ট এক্সেস করতে লগইন করুন।" : "Please sign in to view your orders, keys, and wallet."}
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={openLoginModal}
              className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isBn ? "লগইন করুন" : "Sign In"}</span>
            </button>

            <button
              type="button"
              onClick={openRegisterModal}
              className="w-full py-2.5 bg-white text-[#1A1D26] hover:text-[#FC5C03] border border-[#E8E8EE] hover:border-[#FC5C03]/40 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isBn ? "নতুন অ্যাকাউন্ট তৈরি করুন" : "Create Account"}</span>
            </button>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/shop"
              className="text-xs text-[#7A8190] hover:text-[#FC5C03] font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>{isBn ? "শপে ফিরে যান" : "Back to Shop"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/70 py-4 sm:py-6 lg:py-8">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto space-y-4 sm:space-y-6">
        
        {/* Mobile / Tablet Horizontal Scroll Tab Bar */}
        <div className="lg:hidden bg-white p-1.5 rounded-2xl border border-[#E8E8EE] shadow-2xs overflow-x-auto no-scrollbar flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? "bg-[#FC5C03] text-white shadow-2xs"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setLanguage(language === "en" ? "bn" : "en")}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-200 shrink-0 ml-2 cursor-pointer"
          >
            <Globe className="w-3 h-3 text-[#FC5C03]" />
            <span>{language === "en" ? "বাং" : "EN"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4 sticky top-20">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl border border-[#E8E8EE] p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FC5C03] bg-[#FFF2E8] shrink-0">
                  <SafeImage
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt={user?.name || "User Avatar"}
                    aspectRatio="1/1"
                    objectFit="cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#1A1D26] truncate">
                    {user?.name || "Member"}
                  </h3>
                  <span className="text-[11px] text-[#7A8190] truncate block font-mono">
                    {user?.email || ""}
                  </span>
                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9.5px] font-bold rounded-md uppercase border border-emerald-200">
                    Verified Customer
                  </span>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <Globe className="w-3.5 h-3.5 text-[#FC5C03]" />
                  <span>Language</span>
                </div>
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      language === "en"
                        ? "bg-white text-[#FC5C03] shadow-2xs"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("bn")}
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      language === "bn"
                        ? "bg-white text-[#FC5C03] shadow-2xs"
                        : "text-gray-500 hover:text-black"
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              {/* Wallet Balance Widget */}
              <div className="p-4 bg-gradient-to-br from-[#1A1D26] to-black rounded-2xl text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">
                    {isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}
                  </span>
                  <span className="text-lg font-black text-white">
                    {formatPrice(user?.walletBalanceBDT || 0)}
                  </span>
                </div>
                <Link
                  href="/dashboard/wallet"
                  className="px-3 py-1 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {isBn ? "+ রিচার্জ" : "+ Top Up"}
                </Link>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="bg-white rounded-3xl border border-[#E8E8EE] p-2.5 shadow-2xs space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#FFF2E8] text-[#FC5C03] shadow-2xs"
                        : "text-gray-600 hover:text-[#1A1D26] hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#FC5C03]" : "text-gray-400"}`} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-gray-100 space-y-1">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-[#FC5C03]" />
                      <span>{isBn ? "এডমিন প্যানেল" : "Admin Panel"}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                )}

                <Link
                  href="/shop"
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-500 hover:text-[#FC5C03]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isBn ? "শপে ফিরে যান" : "Back to Store"}</span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isBn ? "লগআউট" : "Sign Out"}</span>
                </button>
              </div>
            </div>

          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-8 xl:col-span-9 min-w-0">
            {children}
          </main>

        </div>

      </div>
    </div>
  );
}
