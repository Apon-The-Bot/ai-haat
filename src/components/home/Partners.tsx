"use client";

import React from "react";
import { PARTNERS } from "@/data/partners";
import { ShieldCheck } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";

export function Partners() {
  return (
    <section className="py-6 sm:py-8 bg-gray-50/70 border-t border-[#E8E8EE]">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#FC5C03]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1D26]">
              অফিসিয়াল পার্টনার ও ডিজিটাল প্ল্যাটফর্ম
            </h3>
          </div>
          <span className="text-[11px] text-[#7A8190]">
            ১০০% আসল ও অনুমোদিত লাইসেন্স
          </span>
        </div>

        {/* Horizontal Boxes (Scrollable on Mobile) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {PARTNERS.map((partner) => (
            <div
              key={partner.id}
              className="flex-shrink-0 px-3.5 py-2 bg-white border border-[#E8E8EE] rounded-xl text-xs font-bold text-[#1A1D26] hover:border-[#FC5C03] shadow-2xs transition-all flex items-center gap-2"
            >
              <div className="w-4 h-4 relative shrink-0">
                <SafeImage
                  src={partner.logo}
                  alt={partner.name}
                  aspectRatio="1/1"
                  objectFit="contain"
                  sizes="16px"
                />
              </div>
              <span>{partner.name}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
