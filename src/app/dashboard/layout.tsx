"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  KeyRound,
  Wallet,
  Bell,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Logo } from "@/components/Logo";
import { SafeImage } from "@/components/SafeImage";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = [
    { name: "ওভারভিউ (Overview)", href: "/dashboard", icon: LayoutDashboard },
    { name: "আমার অর্ডার (My Orders)", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "ডিজিটাল ভল্ট (My Keys)", href: "/dashboard/keys", icon: KeyRound },
    { name: "ওয়ালেট ও রিচার্জ (Wallet)", href: "/dashboard/wallet", icon: Wallet },
    { name: "নোটিফিকেশন (Notifications)", href: "/dashboard/notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col">
      
      {/* Top Mobile Bar */}
      <div className="lg:hidden bg-white border-b border-[#E8E8EE] px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="p-1.5 rounded-lg border border-gray-200 text-[#1A1D26]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Logo size="sm" showSubtitle={false} />
        <Link
          href="/dashboard/wallet"
          className="text-xs font-bold text-[#FC5C03] bg-[#FFF2E8] px-2.5 py-1 rounded-full border border-[#FC5C03]/20"
        >
          {formatPrice(user?.walletBalanceBDT || 500)}
        </Link>
      </div>

      <div className="flex-1 max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SIDEBAR (Desktop 3.5 Cols) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4 sticky top-20">
          
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
                  {user?.name || "Amanullah Sheikh"}
                </h3>
                <span className="text-[11px] text-[#7A8190] truncate block">
                  {user?.email || "mdamanullahsheikhapon@gmail.com"}
                </span>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md uppercase">
                  Verified Member
                </span>
              </div>
            </div>

            {/* Wallet Balance Widget */}
            <div className="p-3.5 bg-gradient-to-br from-[#1A1D26] to-black rounded-xl text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">ওয়ালেট ব্যালেন্স</span>
                <span className="text-lg font-black text-white">{formatPrice(user?.walletBalanceBDT || 500)}</span>
              </div>
              <Link
                href="/dashboard/wallet"
                className="px-2.5 py-1 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors"
              >
                + রিচার্জ
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
                  key={item.name}
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
              <Link
                href="/admin"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>👑 এডমিন প্যানেল (Admin Panel)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/shop"
                className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-500 hover:text-[#FC5C03]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>শপে ফিরে যান</span>
              </Link>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>লগআউট (Logout)</span>
              </button>
            </div>
          </div>

        </aside>

        {/* MAIN CONTENT (9 Cols) */}
        <main className="lg:col-span-9 min-w-0">
          {children}
        </main>

      </div>

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in">
          <div className="w-72 bg-white h-full p-4 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-left">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <Logo size="sm" showSubtitle={false} />
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                        isActive ? "bg-[#FFF2E8] text-[#FC5C03]" : "text-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <Link
                  href="/admin"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>এডমিন প্যানেল (Admin)</span>
                </Link>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                setIsMobileNavOpen(false);
              }}
              className="w-full py-2.5 bg-red-50 text-red-600 font-bold text-xs rounded-xl text-center"
            >
              লগআউট
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
