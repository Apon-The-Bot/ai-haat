"use client";

import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { ChevronDown, ChevronUp, LogOut, X } from "@/components/animated-icons/lucide";
import { Logo } from "@/components/Logo";
import { Tooltip } from "@/components/ui/Tooltip";
import { adminNavigation as navigation, getActiveAdminHref } from "./admin-navigation";

type Props = {
  pathname: string | null;
  unreadCount: number;
  expandedGroups: Record<string, boolean>;
  setExpandedGroups: Dispatch<SetStateAction<Record<string, boolean>>>;
  setIsMobileMenuOpen: Dispatch<SetStateAction<boolean>>;
  logout: () => void;
};

export function AdminMobileNavigation({
  pathname, unreadCount, expandedGroups, setExpandedGroups, setIsMobileMenuOpen, logout,
}: Props) {
  const activeHref = getActiveAdminHref(pathname);
  return (
    <div
      className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-150"
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <div
        className="w-72 bg-white h-full p-5 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <Logo size="sm" showSubtitle={false} />
            <Tooltip content="Close the navigation menu">
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close navigation menu" className="p-1.5 rounded-lg text-slate-500 hover:text-black cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5" /></button>
            </Tooltip>
          </div>

          {navigation.map((group) => {
            const isExpanded = expandedGroups[group.group] || false;

            return (
              <div key={group.group} className="space-y-1">
                <button
                  onClick={() => setExpandedGroups(prev => ({ ...prev, [group.group]: !prev[group.group] }))}
                  className="w-full flex items-center justify-between px-3 py-2 cursor-pointer rounded-xl hover:bg-slate-50 transition-colors min-h-[44px]"
                >
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {group.group}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="space-y-0.5 mt-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeHref === item.href;
                      const showBadge = (item.name === "Orders" || item.name === "Support Queue") && unreadCount > 0;

                      return (
                        <Tooltip key={item.name} content={item.name === "Inventory Batches" ? "Manage inventory batches, stock records, and related batch operations." : item.name}>
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`relative flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold transition-all ${
                              isActive
                                ? "bg-[#FFF2E8] text-[#FC5C03]"
                                : "text-slate-600 hover:text-black hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#FC5C03]" : "text-slate-400"}`} />
                              <span>{item.name}</span>
                            </div>
                            {showBadge && <span className="w-5 h-5 bg-[#FC5C03] text-white text-[10px] font-black rounded-full flex items-center justify-center">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                            {isActive && <span aria-hidden="true" className="absolute right-1.5 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-[var(--primary-orange)]" />}
                          </Link>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-200 mt-6">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 min-h-[44px] text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
