"use client";

import React from "react";
import { Users, Tag, CheckCircle2 } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface Tier {
  minQty: number;
  maxQty?: number;
  discountPercent: number;
  labelBn: string;
}

interface TieredPricingTableProps {
  basePriceBDT: number;
  currentQuantity?: number;
}

const DEFAULT_TIERS: Tier[] = [
  { minQty: 1, maxQty: 2, discountPercent: 0, labelBn: "স্ট্যান্ডার্ড রিটেল" },
  { minQty: 3, maxQty: 4, discountPercent: 5, labelBn: "স্মল টিম ছাড় (৫%)" },
  { minQty: 5, maxQty: 9, discountPercent: 10, labelBn: "রিসেলার / বাল্ক (১০%)" },
  { minQty: 10, discountPercent: 15, labelBn: "এজেন্সি মেগা ডিল (১৫%)" },
];

export function TieredPricingTable({
  basePriceBDT,
  currentQuantity = 1,
}: TieredPricingTableProps) {
  const { formatPrice } = useCurrency();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Users className="w-4 h-4 text-[#FC5C03]" />
          <span>বাল্ক ও রিসেলার ভলিউম ডিসকাউন্ট</span>
        </div>
        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          অটোমেটিক চেকআউটে প্রযোজ্য
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {DEFAULT_TIERS.map((tier, idx) => {
          const isCurrentTier =
            currentQuantity >= tier.minQty &&
            (!tier.maxQty || currentQuantity <= tier.maxQty);

          const discountedPrice =
            tier.discountPercent > 0
              ? basePriceBDT - Math.round((basePriceBDT * tier.discountPercent) / 100)
              : basePriceBDT;

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isCurrentTier
                  ? "bg-white border-[#FC5C03] shadow-xs ring-1 ring-[#FC5C03]"
                  : "bg-white/80 border-slate-200"
              }`}
            >
              <div className="text-[11px] font-bold text-slate-500">
                {tier.maxQty ? `${tier.minQty} - ${tier.maxQty} টি` : `${tier.minQty}+ টি`}
              </div>
              <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                {formatPrice(discountedPrice)}
                <span className="text-[10px] text-slate-400 font-normal"> /প্রতিটি</span>
              </div>
              {tier.discountPercent > 0 ? (
                <div className="text-[10px] font-bold text-emerald-600 mt-1">
                  {tier.discountPercent}% ছাড়
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 mt-1">রেগুলার প্রাইস</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
