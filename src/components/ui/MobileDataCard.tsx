"use client";

import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { MobileActionMenu } from './MobileActionMenu';

export interface MobileDataCardProps {
  title: string;
  subtitle?: string;
  status?: { text: string; variant?: 'success' | 'warning' | 'error' | 'info' | 'default' };
  metadata?: Array<{ label: string; value: string | React.ReactNode }>;
  actions?: Array<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'danger'; icon?: React.ReactNode }>;
  onClick?: () => void;
  avatar?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function MobileDataCard({
  title,
  subtitle,
  status,
  metadata,
  actions,
  onClick,
  avatar,
  className = '',
  children,
}: MobileDataCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isClickable = !!onClick;

  const getStatusStyles = (variant: string = 'default') => {
    switch (variant) {
      case 'success': return 'bg-green-100 text-green-700';
      case 'warning': return 'bg-amber-100 text-amber-700';
      case 'error': return 'bg-red-100 text-red-700';
      case 'info': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const primaryAction = actions?.find(a => a.variant === 'primary') || actions?.[0];
  const secondaryActions = actions?.filter(a => a !== primaryAction) || [];

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E8E8EE] p-4 flex flex-col gap-3 shadow-2xs hover:shadow-card transition-shadow ${isClickable ? 'cursor-pointer active:scale-[0.99]' : ''} ${className}`}
      onClick={(e) => {
        if (isClickable) {
          onClick();
        }
      }}
    >
      {/* Header Row */}
      <div className="flex items-center gap-3">
        {avatar && <div className="shrink-0">{avatar}</div>}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1A1D26] truncate text-base">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 truncate">{subtitle}</p>}
        </div>
        {status && (
          <div className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyles(status.variant)}`}>
            {status.text}
          </div>
        )}
      </div>

      {/* Metadata Section */}
      {metadata && metadata.length > 0 && (
        <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-1">
          {metadata.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{item.label}</span>
              <span className="text-sm font-medium text-slate-700">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {children && <div className="mt-1">{children}</div>}

      {/* Actions Row */}
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#E8E8EE]" onClick={e => e.stopPropagation()}>
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="flex-1 flex items-center justify-center gap-2 bg-[#FC5C03] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#e04f02] active:scale-[0.98] transition-all"
            >
              {primaryAction.icon}
              {primaryAction.label}
            </button>
          )}
          
          {secondaryActions.length > 0 && (
            <>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="shrink-0 w-11 h-11 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl border border-[#E8E8EE] hover:bg-slate-100 active:scale-[0.98] transition-all"
                aria-label="More actions"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              
              <MobileActionMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                actions={secondaryActions}
                title="Actions"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
