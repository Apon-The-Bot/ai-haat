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
  MoreHorizontal,
  X,
  Gift,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { SafeImage } from "@/components/SafeImage";

/**
 * Bottom navigation tab definition
 */
interface BottomNavTab {
  name: string;
  nameBn: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Match additional paths as active */
  matchPaths?: string[];
}

/**
 * "More" menu item definition — items that live in the More bottom sheet
 */
interface MoreMenuItem {
  name: string;
  nameBn: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, openLoginModal, openRegisterModal } = useAuth();
  const { formatPrice } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const isBn = language === "bn";
  const [mounted, setMounted] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when More sheet is open
  useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMoreOpen]);

  // ──── BOTTOM NAVIGATION TABS (5 primary tabs) ────
  const bottomTabs: BottomNavTab[] = [
    {
      name: "Home",
      nameBn: "হোম",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Orders",
      nameBn: "অর্ডার",
      href: "/dashboard/orders",
      icon: ShoppingBag,
    },
    {
      name: "Vault",
      nameBn: "ভল্ট",
      href: "/dashboard/keys",
      icon: KeyRound,
    },
    {
      name: "Wallet",
      nameBn: "ওয়ালেট",
      href: "/dashboard/wallet",
      icon: Wallet,
    },
    {
      name: "More",
      nameBn: "আরও",
      href: "#more",
      icon: MoreHorizontal,
    },
  ];

  // ──── "MORE" MENU ITEMS ────
  const moreItems: MoreMenuItem[] = [
    { name: "Give ৳50, Get ৳50", nameBn: "রেফার ও রিওয়ার্ডস (৳৫০)", href: "/dashboard/referrals", icon: Gift },
    { name: "Warranty Claims", nameBn: "ওয়ারেন্টি ক্লেইমস", href: "/dashboard/replacements", icon: RotateCcw },
    { name: "Refund Requests", nameBn: "রিফান্ড রিকোয়েস্ট", href: "/dashboard/refunds", icon: Banknote },
    { name: "Notifications", nameBn: "নোটিফিকেশন", href: "/dashboard/notifications", icon: Bell },
    { name: "Security", nameBn: "সিকিউরিটি", href: "/dashboard/security", icon: ShieldCheck },
    { name: "Email Preferences", nameBn: "ইমেইল প্রেফারেন্স", href: "/dashboard/preferences", icon: Mail },
    { name: "Support & Help", nameBn: "সাপোর্ট ও সহায়তা", href: "/dashboard/support", icon: LifeBuoy },
    { name: "Affiliate Program", nameBn: "অ্যাফিলিয়েট প্রোগ্রাম", href: "/dashboard/affiliate", icon: Share2 },
  ];

  // Full nav items for desktop sidebar (all items combined)
  const allNavItems = [
    { name: isBn ? "ওভারভিউ" : "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: isBn ? "আমার অর্ডার" : "My Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { name: isBn ? "ডিজিটাল ভল্ট" : "Digital Vault", href: "/dashboard/keys", icon: KeyRound },
    { name: isBn ? "রেফার ও রিওয়ার্ডস (৳৫০)" : "Give ৳50, Get ৳50", href: "/dashboard/referrals", icon: Gift },
    { name: isBn ? "ওয়ারেন্টি ক্লেইমস" : "Warranty Claims", href: "/dashboard/replacements", icon: RotateCcw },
    { name: isBn ? "রিফান্ড রিকোয়েস্ট" : "Refund Requests", href: "/dashboard/refunds", icon: Banknote },
    { name: isBn ? "ওয়ালেট" : "Wallet", href: "/dashboard/wallet", icon: Wallet },
    { name: isBn ? "নোটিফিকেশন" : "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: isBn ? "সিকিউরিটি" : "Security", href: "/dashboard/security", icon: ShieldCheck },
    { name: isBn ? "ইমেইল প্রেফারেন্স" : "Email Preferences", href: "/dashboard/preferences", icon: Mail },
    { name: isBn ? "সাপোর্ট ও সহায়তা" : "Support & Help", href: "/dashboard/support", icon: LifeBuoy },
    { name: isBn ? "অ্যাফিলিয়েট প্রোগ্রাম" : "Affiliate Program", href: "/dashboard/affiliate", icon: Share2 },
  ];

  const adminEmails = [
    "mdamanullahsheikhapon@gmail.com",
    "seratul.alim@gmail.com",
    "seratulalimkhanrhythm@gmail.com",
    "admin@aihaat.com",
  ];
  const userEmail = user?.email?.toLowerCase().trim() || "";
  const isAdmin = user?.role === "ADMIN" || (userEmail !== "" && adminEmails.includes(userEmail));

  // Check if a tab is active (matches current path)
  const isTabActive = (tab: BottomNavTab) => {
    if (!pathname) return false;
    if (tab.href === "#more") {
      return moreItems.some((m) => pathname === m.href || pathname.startsWith(m.href + "/"));
    }
    if (tab.href === "/dashboard" && pathname === "/dashboard") return true;
    if (tab.href !== "/dashboard" && pathname.startsWith(tab.href)) return true;
    return tab.matchPaths?.some((p) => pathname.startsWith(p)) || false;
  };

  // ──── LOADING STATE ────
  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/70">
        <div className="w-8 h-8 border-3 border-[#FC5C03] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ──── AUTH GUARD ────
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
      {/* Main content area — add bottom padding on mobile for bottom nav */}
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto space-y-4 sm:space-y-6 pb-20 lg:pb-0">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ═══════════════════════════════════════════
              DESKTOP SIDEBAR (unchanged — visible lg+)
              ═══════════════════════════════════════════ */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4 sticky top-20">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl border border-[#E8E8EE] p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FC5C03] bg-[#FFF2E8] shrink-0">
                    <SafeImage
                      src={user.avatar}
                      alt={user.name || "User Avatar"}
                      aspectRatio="1/1"
                      objectFit="cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FE7113] to-[#FC5C03] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs border-2 border-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : "U")}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#1A1D26] truncate">
                    {user?.name || "Member"}
                  </h3>
                  <span className="text-[11px] text-[#7A8190] truncate block font-mono">
                    {user?.email || ""}
                  </span>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 text-[9.5px] font-bold rounded-md uppercase border ${
                    isAdmin
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    {isAdmin ? "Verified Administrator" : "Verified Customer"}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-2 border-t border-gray-100">
                  <Link
                    href="/admin"
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-between shadow-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#FC5C03]" />
                      <span>Admin Control Panel</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}

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
                    {isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}
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
              {allNavItems.map((item) => {
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

          {/* ═══════════════════════════════════════════
              MAIN CONTENT AREA
              ═══════════════════════════════════════════ */}
          <main className="lg:col-span-8 xl:col-span-9 min-w-0">
            {children}
          </main>

        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION (visible below lg breakpoint)
          ═══════════════════════════════════════════════════════ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E8EE] shadow-up-md"
        style={{ paddingBottom: "max(4px, env(safe-area-inset-bottom, 0px))" }}
        role="navigation"
        aria-label={isBn ? "প্রধান নেভিগেশন" : "Main navigation"}
      >
        <div className="flex items-center justify-around px-1 pt-1">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab);
            const isMore = tab.href === "#more";

            return (
              <button
                key={tab.href}
                type="button"
                onClick={() => {
                  if (isMore) {
                    setIsMoreOpen(true);
                  } else {
                    window.location.href = tab.href;
                  }
                }}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[56px] rounded-xl transition-colors cursor-pointer touch-action-manipulation ${
                  active
                    ? "text-[#FC5C03]"
                    : "text-gray-400 active:text-gray-600"
                }`}
                aria-label={isBn ? tab.nameBn : tab.name}
                aria-current={active && !isMore ? "page" : undefined}
              >
                <Icon className={`w-5 h-5 ${active ? "text-[#FC5C03]" : ""}`} />
                <span className={`text-[10px] font-bold leading-none ${
                  active ? "text-[#FC5C03]" : "text-gray-500"
                }`}>
                  {isBn ? tab.nameBn : tab.name}
                </span>
                {active && !isMore && (
                  <span className="w-1 h-1 rounded-full bg-[#FC5C03] mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════
          "MORE" BOTTOM SHEET (mobile only)
          ═══════════════════════════════════════════════════════ */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 sheet-backdrop animate-fade-in"
            onClick={() => setIsMoreOpen(false)}
          />
          
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-slide-up shadow-up-md"
            style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))" }}
            role="dialog"
            aria-modal="true"
            aria-label={isBn ? "আরও অপশন" : "More options"}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
              <h3 className="text-base font-black text-[#1A1D26]">
                {isBn ? "আরও অপশন" : "More Options"}
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="px-3 py-2 space-y-0.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (pathname?.startsWith(item.href + "/") ?? false);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all min-h-touch ${
                      isActive
                        ? "bg-[#FFF2E8] text-[#FC5C03]"
                        : "text-gray-700 active:bg-gray-50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-[#FC5C03]" : "text-gray-400"}`} />
                    <span>{isBn ? item.nameBn : item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Links */}
            <div className="px-3 pt-2 pb-1 border-t border-gray-100 space-y-0.5">
              {/* Language Toggle */}
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                  <Globe className="w-4 h-4 text-[#FC5C03]" />
                  <span>{isBn ? "ভাষা" : "Language"}</span>
                </div>
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      language === "en" ? "bg-white text-[#FC5C03] shadow-2xs" : "text-gray-500"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("bn")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      language === "bn" ? "bg-white text-[#FC5C03] shadow-2xs" : "text-gray-500"
                    }`}
                  >
                    বাং
                  </button>
                </div>
              </div>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold bg-slate-900 text-white min-h-touch"
                >
                  <ShieldCheck className="w-5 h-5 text-[#FC5C03]" />
                  <span>{isBn ? "এডমিন প্যানেল" : "Admin Panel"}</span>
                </Link>
              )}

              <Link
                href="/shop"
                onClick={() => setIsMoreOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-500 hover:text-[#FC5C03]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isBn ? "শপে ফিরে যান" : "Back to Store"}</span>
              </Link>

              <button
                type="button"
                onClick={() => { setIsMoreOpen(false); logout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isBn ? "লগআউট" : "Sign Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
