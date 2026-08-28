"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Zap, ShoppingBag, AlertCircle } from "lucide-react";
import { Product, Variation } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { SafeImage } from "@/components/SafeImage";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { user, openLoginModal } = useAuth();

  const [selectedVariation, setSelectedVariation] = useState<Variation>(
    product.variations?.[0] || {
      id: "default",
      name: "Standard",
      priceBDT: product.minPriceBDT || 0,
      inStock: true,
    }
  );

  const isOutOfStock = product.inStock === false || selectedVariation?.inStock === false;
  const isLowStock = !isOutOfStock && product.badge === "Limited Stock";

  // Calculate discount percentage
  const origPrice = selectedVariation?.originalPriceBDT || (product.maxPriceBDT > product.minPriceBDT ? product.maxPriceBDT : 0);
  const currentPrice = selectedVariation?.priceBDT || product.minPriceBDT;
  const discountPercent = origPrice > currentPrice ? Math.round(((origPrice - currentPrice) / origPrice) * 100) : 0;

  const hasMultiplePrices = product.minPriceBDT !== product.maxPriceBDT && !selectedVariation?.priceBDT;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, selectedVariation, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, selectedVariation, 1);
    if (!user) {
      openLoginModal("/checkout");
    } else {
      router.push("/checkout");
    }
  };

  const handleSelectVariation = (e: React.MouseEvent, v: Variation) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedVariation(v);
  };

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl border border-[#E8E8EE] overflow-hidden hover:border-[#FC5C03]/60 hover:shadow-cardHover transition-all duration-200">
      <Link href={`/product/${product.slug}`} className="flex flex-col h-full">
        {/* 1. Square Product Thumbnail (1:1 Ratio) */}
        <div className="relative w-full aspect-square bg-[#F9FAFB] overflow-hidden">
          <SafeImage
            src={product.image}
            alt={product.name}
            aspectRatio="1/1"
            objectFit="cover"
            className={`group-hover:scale-105 transition-transform duration-300 ${
              isOutOfStock ? "opacity-75 grayscale-[25%]" : ""
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />

          {/* Badges on Top Left */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
            {isOutOfStock ? (
              <span className="px-2 py-0.5 text-[9.5px] font-black tracking-wide uppercase rounded-md shadow-xs bg-red-600 text-white">
                স্টক আউট
              </span>
            ) : product.badge ? (
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
            ) : null}
          </div>

          {/* Discount Pill on Top Right */}
          {discountPercent > 0 && !isOutOfStock && (
            <div className="absolute top-2 right-2 z-10">
              <span className="px-2 py-0.5 text-[9.5px] font-black tracking-wide rounded-md shadow-xs bg-emerald-600 text-white">
                -{discountPercent}% OFF
              </span>
            </div>
          )}
        </div>

        {/* 2. Internal Content Area */}
        <div className="p-3 flex-1 flex flex-col justify-between gap-1.5 bg-white">
          
          {/* Rating & Stock Indicator Row */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1">
              <div className="flex items-center text-[#FC5C03]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                      i < Math.floor(product.rating || 5)
                        ? "fill-[#FC5C03] text-[#FC5C03]"
                        : "fill-[#FC5C03]/25 text-[#FC5C03]/25"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#7A8190]">
                {(product.rating || 5.0).toFixed(1)}
              </span>
            </div>

            {/* Stock Indicator Status */}
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-red-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <span>স্টক আউট</span>
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-600">
                <AlertCircle className="w-2.5 h-2.5" />
                <span>সীমিত স্টক</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden min-[360px]:inline">ইনস্ট্যান্ট ডেলিভারি</span>
              </span>
            )}
          </div>

          {/* Product Name with Strict 2-Line Clamp & Stable Min-Height */}
          <h3 className="text-[12.5px] sm:text-[13.5px] font-bold text-[#1A1D26] leading-snug line-clamp-2 group-hover:text-[#FC5C03] transition-colors min-h-[36px] sm:min-h-[40px]">
            {product.name}
          </h3>

          {/* Product Price Row */}
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-[14px] sm:text-[15.5px] font-extrabold text-[#FC5C03] tracking-tight">
              {hasMultiplePrices ? `৳${product.minPriceBDT} থেকে` : formatPrice(currentPrice)}
            </span>
            {origPrice > currentPrice && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatPrice(origPrice)}
              </span>
            )}
          </div>

          {/* Variation Selector Badges */}
          {product.variations && product.variations.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              {product.variations.slice(0, 3).map((v) => {
                const isSelected = selectedVariation.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => handleSelectVariation(e, v)}
                    className={`px-2 py-1 text-[9.5px] sm:text-[10px] font-medium rounded transition-all truncate max-w-[95px] cursor-pointer ${
                      isSelected
                        ? "bg-[#FC5C03] text-white font-bold shadow-2xs"
                        : "bg-[#F3F4F6] text-[#7A8190] hover:bg-[#FFF2E8] hover:text-[#FC5C03]"
                    }`}
                    title={v.name}
                    aria-label={`Select ${v.name}`}
                  >
                    {v.name.split("-")[0].trim()}
                  </button>
                );
              })}
              {product.variations.length > 3 && (
                <span className="inline-block px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#FC5C03] bg-[#FFF2E8] rounded">
                  +{product.variations.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 1-Click Action Buttons with Safe Touch Targets >= 38px */}
          <div className="pt-2 border-t border-gray-100 mt-auto flex items-center gap-1.5">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 min-h-[38px] py-1.5 px-2 bg-gray-50 hover:bg-[#FFF2E8] text-[#1A1D26] hover:text-[#FC5C03] border border-[#E8E8EE] hover:border-[#FC5C03]/40 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Add to Cart"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>কার্ট</span>
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="flex-1 min-h-[38px] py-1.5 px-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white rounded-xl text-[11px] sm:text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="1-Click Buy Now"
              aria-label={`Buy ${product.name} now`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>কিনুন</span>
            </button>
          </div>

        </div>
      </Link>
    </div>
  );
}
