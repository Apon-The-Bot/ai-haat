"use client";

import React from "react";
import { X } from "lucide-react";

export interface BulkActionItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "danger" | "warning" | "success";
  onClick: () => void;
  disabled?: boolean;
}

interface BulkActionBarProps {
  selectedCount: number;
  totalCount?: number;
  onClearSelection: () => void;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
  actions: BulkActionItem[];
  itemName?: string;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  isAllSelected = false,
  actions,
  itemName = "item",
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 w-[95%] max-w-4xl pointer-events-none">
      <div className="pointer-events-auto bg-slate-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        
        {/* Left: Selection Counter & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 px-2.5 items-center justify-center rounded-lg bg-[#FC5C03] text-white text-xs font-black shadow-xs">
              {selectedCount}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              {selectedCount} {itemName}{selectedCount > 1 ? "s" : ""} selected
            </span>
          </div>

          {onSelectAll && totalCount && totalCount > selectedCount && (
            <button
              type="button"
              onClick={onSelectAll}
              className="text-xs text-[#FE7113] hover:text-white font-bold underline transition-colors cursor-pointer"
            >
              {isAllSelected ? "Deselect all" : `Select all ${totalCount}`}
            </button>
          )}

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <button
            type="button"
            onClick={onClearSelection}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap ml-auto">
          {actions.map((act) => {
            const Icon = act.icon;
            const isDanger = act.variant === "danger";
            const isWarning = act.variant === "warning";
            const isSuccess = act.variant === "success";

            return (
              <button
                key={act.id}
                type="button"
                onClick={act.onClick}
                disabled={act.disabled}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDanger
                    ? "bg-red-600/90 hover:bg-red-600 text-white shadow-xs hover:shadow-red-500/20"
                    : isWarning
                    ? "bg-amber-600/90 hover:bg-amber-600 text-white"
                    : isSuccess
                    ? "bg-emerald-600/90 hover:bg-emerald-600 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
