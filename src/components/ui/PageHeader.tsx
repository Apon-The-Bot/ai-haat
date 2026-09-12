"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  badge?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  backHref,
  backLabel = 'Back',
  badge,
  icon,
  children
}: PageHeaderProps) {
  return (
    <div className="mb-4 md:mb-6 w-full">
      {backHref && (
        <Link 
          href={backHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-[#FC5C03] mb-3 transition-colors min-h-[44px] -ml-2 px-2 rounded-lg active:bg-slate-50 md:active:bg-transparent"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel}
        </Link>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {icon && <span className="text-[#FC5C03]">{icon}</span>}
            <h1 className="text-xl md:text-2xl font-black text-[#1A1D26] truncate">
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          
          {subtitle && (
            <p className="text-sm text-slate-500 truncate mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 md:shrink-0 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {actions}
          </div>
        )}
      </div>
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}
