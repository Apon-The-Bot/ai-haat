"use client";

import React from 'react';

export interface StatusBadgeProps {
  status: string;
  variant?: 'order' | 'payment' | 'delivery' | 'default';
  size?: 'sm' | 'md';
}

/**
 * Status badge component used across order, payment, delivery statuses.
 */
export function StatusBadge({ status, variant = 'default', size = 'md' }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');
  const displayStatus = status.replace(/_/g, ' ').toUpperCase();

  const successStates = ['DELIVERED', 'VERIFIED', 'COMPLETED', 'ACTIVE', 'PAID'];
  const warningStates = ['PENDING', 'PROCESSING', 'PREPARING', 'ORDER_PLACED', 'UNDER_REVIEW', 'REQUESTED'];
  const errorStates = ['FAILED', 'CANCELLED', 'REJECTED', 'EXPIRED', 'SUSPENDED'];
  const infoStates = ['REFUNDED', 'REPLACED'];

  let colorClasses = 'bg-slate-50 text-slate-600 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (successStates.includes(normalizedStatus)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (warningStates.includes(normalizedStatus)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (errorStates.includes(normalizedStatus)) {
    colorClasses = 'bg-red-50 text-red-700 border-red-200';
    dotColor = 'bg-red-500';
  } else if (infoStates.includes(normalizedStatus)) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
  }

  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-md font-bold border uppercase tracking-wider ${sizeClasses} ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`} aria-hidden="true" />
      {displayStatus}
    </span>
  );
}
