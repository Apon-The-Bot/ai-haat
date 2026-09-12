"use client";

import React from 'react';
import { Search } from 'lucide-react';
import { BottomSheet } from './BottomSheet';

export interface FilterOption {
  id: string;
  label: string;
  type: 'select' | 'search' | 'dateRange' | 'chips';
  options?: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  filters: FilterOption[];
  onClear?: () => void;
  onApply?: () => void;
  activeFilterCount?: number;
}

export function MobileFilterSheet({
  isOpen,
  onClose,
  title = "Filter & Sort",
  filters,
  onClear,
  onApply,
  activeFilterCount = 0,
}: MobileFilterSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={
      <div className="flex items-center gap-2">
        {title}
        {activeFilterCount > 0 && (
          <span className="bg-[#FC5C03] text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </div>
    }>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
          {filters.map((filter) => (
            <div key={filter.id} className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {filter.label}
              </label>
              
              {filter.type === 'search' && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={filter.value || ''}
                    onChange={(e) => filter.onChange(e.target.value)}
                    placeholder={filter.placeholder || "Search..."}
                    className="block w-full pl-10 pr-3 py-2.5 min-h-[44px] border border-[#E8E8EE] rounded-xl text-sm focus:ring-[#FC5C03] focus:border-[#FC5C03] bg-white outline-none transition-colors"
                  />
                </div>
              )}

              {filter.type === 'select' && (
                <select
                  value={filter.value || ''}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="block w-full px-3 py-2.5 min-h-[44px] border border-[#E8E8EE] rounded-xl text-sm focus:ring-[#FC5C03] focus:border-[#FC5C03] bg-white outline-none appearance-none transition-colors"
                >
                  <option value="" disabled>{filter.placeholder || "Select option"}</option>
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}

              {filter.type === 'chips' && (
                <div className="flex flex-wrap gap-2">
                  {filter.options?.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => filter.onChange(opt.value)}
                      className={`px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
                        filter.value === opt.value
                          ? 'bg-[#FC5C03] text-white border-transparent'
                          : 'bg-slate-50 text-slate-700 border border-[#E8E8EE] hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {filter.type === 'dateRange' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="flex-1 px-3 py-2.5 min-h-[44px] border border-[#E8E8EE] rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#FC5C03] focus:border-[#FC5C03] bg-white"
                    placeholder="Start Date"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="date"
                    className="flex-1 px-3 py-2.5 min-h-[44px] border border-[#E8E8EE] rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#FC5C03] focus:border-[#FC5C03] bg-white"
                    placeholder="End Date"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Sticky Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E8E8EE] pb-[env(safe-area-inset-bottom,16px)]">
          <div className="flex items-center gap-3">
            {onClear && (
              <button
                onClick={onClear}
                className="px-6 py-3 min-h-[44px] text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => {
                onApply?.();
                onClose();
              }}
              className="flex-1 bg-[#FC5C03] text-white px-6 py-3 min-h-[44px] rounded-xl font-semibold text-sm hover:bg-[#e04f02] active:scale-[0.98] transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
