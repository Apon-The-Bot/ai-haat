import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-32 bg-gray-200/70 rounded-2xl" />

      {/* 3 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl border border-gray-200/60" />
        ))}
      </div>

      {/* Orders List Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200/60 p-5 space-y-4">
        <div className="w-40 h-5 bg-gray-200 rounded-md" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-50 rounded-xl border border-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
