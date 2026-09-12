"use client";

import React from 'react';
import Link from 'next/link';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  compact?: boolean;
}

/**
 * Standardized empty state component for lists and data views.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  const IconComponent = icon ? icon : <Inbox size={compact ? 20 : 28} />;

  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${compact ? 'py-6' : 'py-12'}`}>
      <div
        className={`
          flex items-center justify-center rounded-full bg-[#FC5C03]/10 text-[#FC5C03] mb-4
          ${compact ? 'w-10 h-10' : 'w-[56px] h-[56px]'}
        `}
      >
        {IconComponent}
      </div>
      
      <h3 className={`font-bold text-[#1A1D26] ${compact ? 'text-sm' : 'text-base'}`}>
        {title}
      </h3>
      
      {description && (
        <p className={`mt-1 text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
          {description}
        </p>
      )}

      {action && (
        <div className="mt-5">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center bg-[#FC5C03] text-white rounded-xl px-5 py-2.5 font-bold hover:bg-[#FC5C03]/90 transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center bg-[#FC5C03] text-white rounded-xl px-5 py-2.5 font-bold hover:bg-[#FC5C03]/90 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
