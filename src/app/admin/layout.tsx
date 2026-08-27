"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Wallet,
  Users,
  FileText,
  ShieldCheck,
  Settings,
  Store,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
  LogIn,
  Bell,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, openLoginModal } = useAuth();
  const { unreadCount } = useNotification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin =
    user?.role === "ADMIN" ||
    user?.email === "mdamanullahsheikhapon@gmail.com" ||
    user?.email === "admin@aihaat.com";

  const navigation = [
    {
      group: "MAIN",
      items: [
        { name: "Overview", href: "/admin", icon: LayoutDashboard },
        { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { name: "Products", href: "/admin/products", icon: Package },
        { name: "Coupons", href: "/admin/coupons", icon: Tag },
      ],
    },
    {
      group: "FINANCE & USERS",
      items: [
        { name: "Wallet Top-ups", href: "/admin/wallet", icon: Wallet },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Delivery Proofs", href: "/admin/proofs", icon: ShieldCheck },
      ],
    },
    {
      group: "CONTENT & SYSTEM",
      items: [
        { name: "Blog Posts", href: "/admin/blogs", icon: FileText },
        { name: "Site Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-3 border-[#FC5C03] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#F8FAFC]">
        <div className="max-w-xs w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Admin Login
            </h1>
          </div>
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={openLoginModal}
              className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
            <Link
              href="/"
              className="w-full py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl transition-all block"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased">
      
      {/* TOPBAR */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-black cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <Logo size="sm" showSubtitle={false} />
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-md ml-1">
              Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Push Notification & Live Alert Bell */}
          <div className="relative">
            <Link
              href="/admin/orders"
              className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-black border border-slate-200 transition-all flex items-center justify-center cursor-pointer"
              title="Live Orders & Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FC5C03] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-black text-xs font-bold rounded-xl border border-slate-200 transition-all"
          >
            <Store className="w-3.5 h-3.5 text-[#FC5C03]" />
            <span>Live Store</span>
          </Link>

          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-black text-xs font-bold rounded-xl border border-slate-200 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>User Hub</span>
          </Link>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#FC5C03] text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <span className="hidden sm:block text-xs font-bold text-slate-800">
              {user?.name || "Admin"}
            </span>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12">
        
        {/* SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 bg-white border-r border-slate-200 p-4 space-y-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          {navigation.map((group) => (
            <div key={group.group} className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-[#FFF2E8] text-[#FC5C03] shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#FC5C03]" : "text-slate-400"}`} />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="lg:col-span-9 xl:col-span-10 p-4 sm:p-6 lg:p-8 min-w-0 bg-[#F8FAFC]">
          {children}
        </main>

      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex">
          <div className="w-64 bg-white h-full p-5 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <Logo size="sm" showSubtitle={false} />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-black cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navigation.map((group) => (
                <div key={group.group} className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                    {group.group}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold ${
                          isActive
                            ? "bg-[#FFF2E8] text-[#FC5C03] font-bold"
                            : "text-slate-600 hover:text-black hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-[#FC5C03]" : "text-slate-400"}`} />
                          <span>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
