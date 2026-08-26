"use client";

import React from "react";
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
  ExternalLink,
  ChevronRight,
  Globe,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { SafeImage } from "@/components/SafeImage";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const isBn = language === "bn";

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
      name: isBn ? "ওয়ালেট" : "Wallet",
      href: "/dashboard/wallet",
      icon: Wallet,
    },
    {
      name: isBn ? "নোটিফিকেশন" : "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
    },
  ];

  const isAdmin = user?.role === "ADMIN" || user?.email === "mdamanullahsheikhapon@gmail.com";

  return (
    <div className="min-h-screen bg-gray-50/70 py-4 sm:py-6 lg:py-8">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto space-y-4 sm:space-y-6">
        
        {/* Mobile / Tablet Horizontal Tab Bar */}
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

          {/* Mobile Language Switcher Inside Tab Bar */}
          <button
            onClick={() => setLanguage(language === "en" ? "bn" : "en")}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-200 shrink-0 ml-2"
          >
            <Globe className="w-3 h-3 text-[#FC5C03]" />
            <span>{language === "en" ? "বাং" : "EN"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* DESKTOP SIDEBAR (3.5 Cols) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4 sticky top-20">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 shadow-2xs space-y-3.5">
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
                    {user?.name || "Rhythm Khan"}
                  </h3>
                  <span className="text-[11px] text-[#7A8190] truncate block">
                    {user?.email || "rhythmkhan04@gmail.com"}
                  </span>
                  <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md uppercase">
                    Verified Member
                  </span>
                </div>
              </div>

              {/* Language Preference Inside User Profile Card */}
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
              <div className="p-3.5 bg-gradient-to-br from-[#1A1D26] to-black rounded-xl text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold block uppercase">
                    {isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}
                  </span>
                  <span className="text-lg font-black text-white">
                    {formatPrice(user?.walletBalanceBDT || 500)}
                  </span>
                </div>
                <Link
                  href="/dashboard/wallet"
                  className="px-3 py-1 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  {isBn ? "+ রিচার্জ" : "+ Top Up"}
                </Link>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="bg-white rounded-2xl border border-[#E8E8EE] p-2.5 shadow-2xs space-y-1">
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
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isBn ? "লগআউট" : "Logout"}</span>
                </button>
              </div>
            </div>

          </aside>

          {/* MAIN CONTENT (8.5 Cols) */}
          <main className="lg:col-span-8 xl:col-span-9 min-w-0">
            {children}
          </main>

        </div>

      </div>
    </div>
  );
}
