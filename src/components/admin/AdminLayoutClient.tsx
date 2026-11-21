"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Menu, ExternalLink, ShieldAlert, LogIn, Bell, LogOut, Mail, Search, ChevronDown, ChevronUp } from "@/components/animated-icons/lucide";
import { Logo } from "@/components/Logo";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { AdminMobileNavigation } from "./AdminMobileNavigation";
import { AdminCommandPalette } from "./AdminCommandPalette";
import { getActiveAdminHref } from "./admin-navigation";
import { useAdminNavigationPreferences } from "@/hooks/useAdminNavigationPreferences";
import { Tooltip } from "@/components/ui/Tooltip";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, openLoginModal, logout } = useAuth();
  const { unreadCount } = useNotification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mfaStatus, setMfaStatus] = useState<{ totpEnabled?: boolean; isMfaVerified?: boolean } | null>(null);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const { groups: navigation, preferences, update, toggleGroup } = useAdminNavigationPreferences();
  const sidebarExpanded = preferences.sidebarMode === "EXPANDED" || (preferences.sidebarMode === "AUTO" && isSidebarHovered);
  const expandedGroups = preferences.expandedGroups;
  const activeHref = getActiveAdminHref(pathname);

  // Authoritative admin verification: strictly check role assigned by server session
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    setMounted(true);

    if (isAdmin) {
      const checkMfa = async () => {
        try {
          const res = await fetch("/api/security/status");
          if (res.ok) {
            const data = await res.json();
            setMfaStatus(data);
          }
        } catch (error) {
          console.error("Failed to fetch MFA status", error);
        } finally {
          setMfaLoading(false);
        }
      };
      checkMfa();
    } else {
      setMfaLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!mounted || mfaLoading) {
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
              Administrator Access Required
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Please sign in with an authorized Administrator account.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={openLoginModal}
              className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login as Admin</span>
            </button>
            <Link
              href="/"
              className="w-full py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl transition-all block text-center"
            >
              Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell text-slate-900 flex flex-col font-sans antialiased">
      
      {/* TOPBAR */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsSearchOpen(true)} className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-slate-800" aria-label="Search admin features"><Search className="h-4 w-4 text-[#FC5C03]" /><span>Search</span><kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-400">⌘K</kbd></button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-black cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <Logo size="sm" showSubtitle={false} />
            <span className="px-2 py-0.5 bg-[#FFF2E8] text-[#FC5C03] border border-[#FC5C03]/20 text-[10.5px] font-black rounded-md ml-1 uppercase">
              Operations Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <Tooltip content="Open live order and support alerts">
            <Link
              href="/admin/orders"
              className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-black border border-slate-200 transition-all flex items-center justify-center cursor-pointer"
              aria-label="Live orders and alerts"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FC5C03] text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">{unreadCount}</span>}
            </Link>
          </Tooltip>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-black text-xs font-bold rounded-xl border border-slate-200 transition-all"
          >
            <Store className="w-3.5 h-3.5 text-[#FC5C03]" />
            <span>Storefront</span>
          </Link>

          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-black text-xs font-bold rounded-xl border border-slate-200 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Customer Hub</span>
          </Link>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <UserAvatar name={user?.name} email={user?.email} image={user?.avatar} />
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {user?.name || "Admin"}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 w-full flex">
        
        {/* DESKTOP SIDEBAR */}
        <aside onMouseEnter={() => setIsSidebarHovered(true)} onMouseLeave={() => setIsSidebarHovered(false)} className={`hidden lg:block shrink-0 bg-white border-r border-slate-200 p-3 space-y-5 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto transition-[width] duration-200 ${sidebarExpanded ? "w-64 xl:w-72 shadow-xl z-50" : "w-16"}`} aria-label="Admin navigation">
          {sidebarExpanded && preferences.favorites.length > 0 && <div className="space-y-1"><div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-500">Quick Access</div>{navigation.flatMap((group) => group.items.filter((item) => preferences.favorites.includes(item.href))).map((item) => { const Icon = item.icon; return <Link key={`favorite-${item.href}`} href={item.href} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"><Icon className="h-4 w-4 text-orange-500" /><span>{item.name}</span></Link>; })}</div>}
          {navigation.map((group) => (
            <div key={group.group} className="space-y-1">
              {sidebarExpanded && <button type="button" onClick={() => toggleGroup(group.group)} className="w-full text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 hover:text-slate-700">{group.group}<span className="float-right">{expandedGroups[group.group] ? "−" : "+"}</span></button>}
              {(sidebarExpanded ? expandedGroups[group.group] !== false : true) && group.items.filter((item) => !preferences.hiddenItems.includes(item.href)).map((item) => {
                const Icon = item.icon;
                const isActive = activeHref === item.href;
                return (
                  <Tooltip key={item.name} content={item.name === "Inventory Batches" ? "Manage inventory batches, stock records, and related batch operations." : item.name}>
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#FFF2E8] text-[#FC5C03] shadow-2xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`flex items-center ${sidebarExpanded ? "gap-2.5" : "justify-center w-full"}`}>
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#FC5C03]" : "text-slate-400"}`} />
                        {sidebarExpanded && <span>{item.name}</span>}
                      </div>
                      {sidebarExpanded && isActive && <span aria-hidden="true" className="absolute right-1.5 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[var(--primary-orange)]" />}
                    </Link>
                  </Tooltip>
                );
              })}
            </div>
          ))}

          {/* Bottom Logout Shortcut */}
          {sidebarExpanded && <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>}
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="admin-content flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-[var(--dashboard-bg)]">
          {mfaStatus && !mfaStatus.totpEnabled && pathname !== "/admin/mfa-setup" && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 text-amber-800">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">2FA Setup Required:</span> Two-factor authentication is mandatory for administrators to modify products, process orders, and configure settings.
                </div>
              </div>
              <Link
                href="/admin/mfa-setup"
                className="px-3.5 py-1.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 text-center"
              >
                Set Up MFA Now
              </Link>
            </div>
          )}
          {children}
        </main>

      </div>

      {isMobileMenuOpen && (
        <AdminMobileNavigation
          pathname={pathname}
          unreadCount={unreadCount}
          expandedGroups={expandedGroups}
          setExpandedGroups={(next) => update({ expandedGroups: typeof next === "function" ? next(preferences.expandedGroups) : next })}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          logout={logout}
        />
      )}

      <AdminCommandPalette open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

    </div>
  );
}
