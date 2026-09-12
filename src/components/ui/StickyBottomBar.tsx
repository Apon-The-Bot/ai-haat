"use client";

import React from 'react';

export interface StickyBottomBarProps {
  children: React.ReactNode;
  className?: string;
  showOnDesktop?: boolean;
}

/**
 * Fixed-bottom action bar component for CTAs.
 */
export function StickyBottomBar({
  children,
  className = '',
  showOnDesktop = false,
}: StickyBottomBarProps) {
  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-40 bg-white
        border-t border-[#E8E8EE] px-4 py-3
        shadow-[0_-4px_12px_rgba(0,0,0,0.08)]
        ${showOnDesktop ? '' : 'lg:hidden'}
        ${className}
      `}
      style={{
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      {children}
    </div>
  );
}
