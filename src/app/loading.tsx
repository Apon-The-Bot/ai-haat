import React from "react";
import { Logo } from "@/components/Logo";

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-6 bg-white">
      <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
        {/* Animated Brand Monogram */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF2E8] border border-[#FC5C03]/20 flex items-center justify-center animate-pulse">
            <Logo size="md" showSubtitle={false} />
          </div>
          {/* Circular Spinner Ring */}
          <div className="absolute -inset-2 border-2 border-transparent border-t-[#FC5C03] border-r-[#FC5C03]/40 rounded-full animate-spin" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#1A1D26] tracking-wide">
            লোড হচ্ছে...
          </h3>
          <p className="text-xs text-[#7A8190]">
            অনুগ্রহ করে একটু অপেক্ষা করুন
          </p>
        </div>

        {/* Shimmer Loading Bar */}
        <div className="w-36 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FE7113] to-[#FC5C03] w-1/2 rounded-full animate-[shimmer_1.5s_infinite_linear]" />
        </div>
      </div>
    </div>
  );
}
