"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
  Users,
  FileText,
  ShieldCheck,
  Settings,
  Store,
  Menu,
  X,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "ওভারভিউ (Overview)", href: "/admin", icon: LayoutDashboard },
    { name: "প্রোডাক্টস (Products)", href: "/admin/products", icon: Package, badge: "20" },
    { name: "অর্ডার ও ডেলিভারি (Orders)", href: "/admin/orders", icon: ShoppingBag, badge: "3 New", badgeColor: "bg-[#FC5C03]" },
    { name: "ওয়ালেট অনুমোদন (Recharge)", href: "/admin/wallet", icon: Wallet, badge: "1", badgeColor: "bg-amber-500" },
    { name: "ইউজার লিস্ট (Users)", href: "/admin/users", icon: Users },
    { name: "ব্লগ পোস্ট (Blogs)", href: "/admin/blogs", icon: FileText },
    { name: "প্রুফ ও রিভিউ (Proofs)", href: "/admin/proofs", icon: ShieldCheck },
    { name: "সাইট সেটিংস (Settings)", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      
      {/* Top Navbar */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-1.5 rounded-lg border border-slate-700 text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <Logo size="sm" variant="light" showSubtitle={false} />
            <span className="hidden sm:inline-block px-2 py-0.5 bg-[#FC5C03]/20 text-[#FC5C03] text-[10px] font-bold rounded-md border border-[#FC5C03]/30 uppercase tracking-wider">
              Control Panel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>মেইন সাইটে যান</span>
          </Link>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-[#FC5C03] text-white flex items-center justify-center font-black text-xs">
              A
            </div>
            <div className="hidden sm:block text-left text-xs">
              <span className="font-bold block text-white">Amanullah Sheikh</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Super Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12">
        
        {/* SIDEBAR (Desktop 2.5 Cols) */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 bg-slate-950/60 border-r border-slate-800 p-4 space-y-1.5 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
            ম্যানেজমেন্ট মেনু
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#FC5C03] text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-md text-white ${
                      item.badgeColor || "bg-slate-700"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ক্লায়েন্ট ড্যাশবোর্ড</span>
            </Link>
          </div>
        </aside>

        {/* MAIN BODY (9.5 Cols) */}
        <main className="lg:col-span-9 xl:col-span-10 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>

      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex">
          <div className="w-72 bg-slate-950 h-full p-4 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <Logo size="sm" variant="light" showSubtitle={false} />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
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
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                        isActive ? "bg-[#FC5C03] text-white" : "text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] bg-slate-800 rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-2.5 bg-slate-800 text-center font-bold text-xs rounded-xl text-slate-200"
            >
              মেইন সাইটে ফিরে যান
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
