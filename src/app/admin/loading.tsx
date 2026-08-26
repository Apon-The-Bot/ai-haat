import React from "react";

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div className="space-y-2">
          <div className="w-48 h-6 bg-slate-800 rounded-lg" />
          <div className="w-72 h-3.5 bg-slate-800/60 rounded-md" />
        </div>
        <div className="w-28 h-9 bg-slate-800 rounded-xl" />
      </div>

      {/* Grid Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <div className="w-24 h-3 bg-slate-800 rounded-md" />
              <div className="w-8 h-8 bg-slate-800 rounded-lg" />
            </div>
            <div className="w-20 h-7 bg-slate-700 rounded-md" />
            <div className="w-32 h-3 bg-slate-800/40 rounded-md" />
          </div>
        ))}
      </div>

      {/* Content Table Skeleton */}
      <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
        <div className="w-36 h-5 bg-slate-800 rounded-md" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-900/80 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
