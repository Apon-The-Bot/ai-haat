"use client";

import React from "react";
import Link from "next/link";
import { Star, Zap } from "lucide-react";
import { Product } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";
import { SafeImage } from "@/components/SafeImage";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatPriceRange } = useCurrency();

  const visibleVariations = product.variations.slice(0, 2);
  const extraCount = product.variations.length - 2;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col h-full bg-white rounded-[12px] border border-[#E8E8EE] overflow-hidden hover:border-[#FC5C03]/60 hover:shadow-cardHover transition-all duration-200"
    >
      {/* 1. Square Product Thumbnail (1:1 Ratio) with SafeImage */}
      <div className="relative w-full aspect-square bg-[#F9FAFB] overflow-hidden">
        <SafeImage
          src={product.image}
          alt={product.name}
          aspectRatio="1/1"
          objectFit="cover"
          className={`group-hover:scale-105 transition-transform duration-300 ${
            product.inStock === false ? "opacity-75 grayscale-[20%]" : ""
          }`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        />

        {/* Stock Out Overlay Badge */}
        {product.inStock === false ? (
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2 py-0.5 text-[9.5px] font-black tracking-wide uppercase rounded-md shadow-xs bg-red-600 text-white">
              স্টক আউট
            </span>
          </div>
        ) : product.badge ? (
          <div className="absolute top-2 left-2 z-10">
            <span
              className={`px-2 py-0.5 text-[9.5px] font-bold tracking-wide uppercase rounded-md shadow-xs ${
                product.badge === "Best Product"
                  ? "bg-[#1A1D26] text-white"
                  : product.badge === "Best Selling"
                  ? "bg-[#FC5C03] text-white"
                  : product.badge === "Offer"
                  ? "bg-[#FE7113] text-white"
                  : "bg-gray-900 text-white"
              }`}
            >
              {product.badge}
            </span>
          </div>
        ) : null}
      </div>

      {/* Internal Content (Consistent Padding & Equal Heights) */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between gap-1.5 bg-white">
        
        {/* 3. Rating Row immediately below image */}
        <div className="flex items-center gap-1">
          <div className="flex items-center text-[#FC5C03]">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                  i < Math.floor(product.rating)
                    ? "fill-[#FC5C03] text-[#FC5C03]"
                    : "fill-[#FC5C03]/25 text-[#FC5C03]/25"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#7A8190]">
            {product.rating.toFixed(1)}
          </span>
        </div>

        {/* 4. Product Name (Max 2 Lines, Semibold, ~13-14px) */}
        <h3 className="text-[12.5px] sm:text-[13.5px] font-semibold text-[#1A1D26] leading-snug line-clamp-2 group-hover:text-[#FC5C03] transition-colors min-h-[34px] sm:min-h-[38px]">
          {product.name}
        </h3>

        {/* 5. Product Price / Range (Orange Bold) */}
        <div className="pt-0.5">
          <span className="text-[14px] sm:text-[15.5px] font-extrabold text-[#FC5C03] tracking-tight block">
            {formatPriceRange(product.minPriceBDT, product.maxPriceBDT)}
          </span>
        </div>

        {/* 6. Variation Chips (Compact 2 chips + '+N' indicator) */}
        {product.variations.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            {visibleVariations.map((v) => (
              <span
                key={v.id}
                className="inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium text-[#7A8190] bg-[#F3F4F6] hover:bg-[#FFF2E8] hover:text-[#FC5C03] rounded transition-colors truncate max-w-[78px] sm:max-w-[95px]"
                title={v.name}
              >
                {v.name.split("-")[0].trim()}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#FC5C03] bg-[#FFF2E8] rounded">
                +{extraCount}
              </span>
            )}
          </div>
        )}

        {/* 7. Subtle Metadata Line */}
        <div className="flex items-center gap-1 text-[9.5px] sm:text-[10px] text-[#7A8190] pt-1.5 border-t border-gray-100 mt-auto">
          <Zap className="w-3 h-3 text-[#FC5C03] shrink-0" />
          <span className="truncate">দ্রুত ডেলিভারি • ফুল ওয়ারেন্টি</span>
        </div>

      </div>
    </Link>
  );
}
