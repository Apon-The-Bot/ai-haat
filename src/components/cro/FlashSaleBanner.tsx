"use client";

import React, { useState, useEffect } from "react";
import { Flame, Clock, Zap } from "lucide-react";

interface FlashSaleBannerProps {
  saleTitle?: string;
  endsAt?: Date | string;
  stockLeft?: number;
  totalStock?: number;
}

export function FlashSaleBanner({
  saleTitle = "সীমিত সময়ের ফ্ল্যাশ ডিল!",
  endsAt,
  stockLeft = 3,
  totalStock = 20,
}: FlashSaleBannerProps) {
  // Default to 6 hours from now if no endsAt provided
  const targetTime = endsAt
    ? new Date(endsAt).getTime()
    : new Date().getTime() + 6 * 60 * 60 * 1000 + 45 * 60 * 1000;

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 6, minutes: 45, seconds: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const soldPercentage = Math.min(
    95,
    Math.round(((totalStock - stockLeft) / totalStock) * 100)
  );

  return (
    <div className="rounded-2xl bg-gradient-to-r from-red-600 via-[#FC5C03] to-amber-500 text-white p-3.5 sm:p-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Flame className="w-4 h-4 fill-white text-white animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black tracking-wide uppercase">{saleTitle}</div>
            <div className="text-[11px] text-white/80">অফার শেষ হতে আর বাকি:</div>
          </div>
        </div>

        {/* Live Countdown Clock */}
        <div className="flex items-center gap-1 font-mono text-xs font-black self-start sm:self-auto">
          <div className="bg-black/30 backdrop-blur-xs px-2 py-1 rounded-md min-w-[28px] text-center">
            {String(timeLeft.hours).padStart(2, "0")}
          </div>
          <span>:</span>
          <div className="bg-black/30 backdrop-blur-xs px-2 py-1 rounded-md min-w-[28px] text-center">
            {String(timeLeft.minutes).padStart(2, "0")}
          </div>
          <span>:</span>
          <div className="bg-black/30 backdrop-blur-xs px-2 py-1 rounded-md min-w-[28px] text-center text-amber-200">
            {String(timeLeft.seconds).padStart(2, "0")}
          </div>
        </div>
      </div>

      {/* Limited Stock Urgency Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-white/90">
          <span>🔥 {soldPercentage}% বুকিং সম্পন্ন</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
            আর মাত্র {stockLeft}টি স্লট বাকি!
          </span>
        </div>
        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${soldPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
