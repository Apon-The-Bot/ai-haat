"use client";

import React from 'react';
import { BottomSheet } from './BottomSheet';

export interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface MobileActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  actions: ActionItem[];
  title?: string;
}

export function MobileActionMenu({ isOpen, onClose, actions, title }: MobileActionMenuProps) {
  const normalActions = actions.filter(a => a.variant !== 'danger');
  const dangerActions = actions.filter(a => a.variant === 'danger');

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col p-2 pb-[env(safe-area-inset-bottom,16px)]">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E8E8EE]">
          {normalActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              disabled={action.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-left text-sm font-medium transition-colors hover:bg-slate-50 active:bg-slate-100 ${
                idx !== normalActions.length - 1 ? 'border-b border-[#E8E8EE]' : ''
              } ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'text-[#1A1D26]'}`}
            >
              {action.icon && <span className="text-slate-500">{action.icon}</span>}
              {action.label}
            </button>
          ))}

          {dangerActions.length > 0 && normalActions.length > 0 && (
            <div className="h-2 bg-slate-50 border-y border-[#E8E8EE]"></div>
          )}

          {dangerActions.map((action, idx) => (
            <button
              key={`danger-${idx}`}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              disabled={action.disabled}
              className={`w-full flex items-center gap-3 px-4 py-3 min-h-[48px] text-left text-sm font-semibold transition-colors hover:bg-red-50 active:bg-red-100 ${
                idx !== dangerActions.length - 1 ? 'border-b border-red-100' : ''
              } ${action.disabled ? 'opacity-50 cursor-not-allowed text-red-300' : 'text-red-600'}`}
            >
              {action.icon && <span className="text-red-500">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>

        <div className="mt-2">
          <button
            onClick={onClose}
            className="w-full bg-white rounded-2xl border border-[#E8E8EE] px-4 py-3.5 min-h-[48px] text-center text-sm font-bold text-[#1A1D26] hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
