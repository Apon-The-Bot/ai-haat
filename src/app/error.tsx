"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, MessageSquare } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center p-4 bg-gray-50/50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8E8EE] p-6 sm:p-8 text-center shadow-lg space-y-6">
        
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-[#1A1D26]">
            কিছু একটা সমস্যা হয়েছে!
          </h2>
          <p className="text-xs text-[#7A8190] leading-relaxed">
            পেজটি রেন্ডার করার সময় অপ্রত্যাশিত একটি সমস্যা দেখা দিয়েছে। আপনি পুনরায় চেষ্টা করতে পারেন অথবা হোমপেজে ফিরে যেতে পারেন।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>পুনরায় চেষ্টা করুন</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1A1D26] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>হোমপেজ</span>
          </Link>
        </div>

        {/* Support Help Link */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
          <MessageSquare className="w-3.5 h-3.5 text-[#FC5C03]" />
          <span>সমস্যা সমাধান না হলে আমাদের <a href="https://wa.me/8801712345678" target="_blank" rel="noreferrer" className="text-[#FC5C03] font-bold hover:underline">হোয়াটসঅ্যাপে</a> জানান।</span>
        </div>

      </div>
    </div>
  );
}
