"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-red-950/60 text-red-400 border border-red-800/50 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-white">
            এডমিন প্যানেলে ত্রুটি দেখা দিয়েছে
          </h2>
          <p className="text-xs text-slate-400">
            {error.message || "সার্ভার রেসপন্স করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>রিলোড দিন</span>
          </button>

          <Link
            href="/admin"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>এডমিন হোম</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
