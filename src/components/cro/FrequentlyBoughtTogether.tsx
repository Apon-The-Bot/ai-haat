"use client";

import React, { useState } from "react";
import { Plus, Check, ShoppingBag, Sparkles, Tag } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Product, Variation } from "@/types";

interface BundleCompanion {
  id: string;
  name: string;
  slug: string;
  image: string;
  priceBDT: number;
  originalPriceBDT: number;
  category: string;
}

interface FrequentlyBoughtTogetherProps {
  primaryProduct: Product;
  selectedVariation?: Variation;
  bundleDiscountPercent?: number;
}

// Curated companion recommendations by category
const COMPANION_SUGGESTIONS: Record<string, BundleCompanion[]> = {
  ai: [
    {
      id: "comp-canva",
      name: "Canva Pro Subscription (Brand Kit & AI)",
      slug: "canva-pro",
      image: "/images/products/canva-pro.svg",
      priceBDT: 99,
      originalPriceBDT: 150,
      category: "Graphics",
    },
    {
      id: "comp-vpn",
      name: "NordVPN Complete Security (2-Year)",
      slug: "nordvpn-complete-security",
      image: "/images/products/nordvpn.svg",
      priceBDT: 450,
      originalPriceBDT: 600,
      category: "VPN",
    },
  ],
  software: [
    {
      id: "comp-office",
      name: "Microsoft Office 365 ProPlus",
      slug: "office-365",
      image: "/images/products/office-365.svg",
      priceBDT: 350,
      originalPriceBDT: 500,
      category: "Productivity",
    },
    {
      id: "comp-win11",
      name: "Windows 11 Pro Retail Key",
      slug: "windows-11-pro-retail-key",
      image: "/images/products/windows-11.svg",
      priceBDT: 450,
      originalPriceBDT: 650,
      category: "OS",
    },
  ],
};

export function FrequentlyBoughtTogether({
  primaryProduct,
  selectedVariation,
  bundleDiscountPercent = 10,
}: FrequentlyBoughtTogetherProps) {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  const companions =
    COMPANION_SUGGESTIONS[primaryProduct.category] || COMPANION_SUGGESTIONS.ai;
  const companion = companions[0]; // Choose top companion for 2-item high-converting combo

  const [includeCompanion, setIncludeCompanion] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  if (!companion) return null;

  const primaryPrice = selectedVariation?.priceBDT || primaryProduct.minPriceBDT;
  const companionPrice = companion.priceBDT;

  const rawTotal = includeCompanion ? primaryPrice + companionPrice : primaryPrice;
  const bundleDiscount = includeCompanion
    ? Math.round((rawTotal * bundleDiscountPercent) / 100)
    : 0;
  const finalTotal = rawTotal - bundleDiscount;

  const handleAddBundleToCart = () => {
    setIsAdding(true);

    // 1. Add primary product
    const primaryVariation: Variation =
      selectedVariation ||
      primaryProduct.variations?.[0] ||
      ({
        id: "default",
        name: "Standard",
        priceBDT: primaryProduct.minPriceBDT,
        inStock: true,
      } as Variation);

    addToCart(primaryProduct, primaryVariation, 1);

    // 2. Add companion product if selected
    if (includeCompanion) {
      const mockCompanionProduct: any = {
        id: companion.id,
        name: companion.name,
        slug: companion.slug,
        image: companion.image,
        minPriceBDT: companion.priceBDT,
        maxPriceBDT: companion.priceBDT,
        regularPriceBDT: companion.originalPriceBDT,
        category: companion.category,
        productType: "SUBSCRIPTION",
        inStock: true,
      };

      const companionVariation: Variation = {
        id: "default",
        name: "Standard",
        priceBDT: companion.priceBDT,
        inStock: true,
      } as Variation;

      addToCart(mockCompanionProduct, companionVariation, 1);
    }

    showToast(
      includeCompanion
        ? `🎉 বান্ডেলটি ${bundleDiscountPercent}% ছাড়সহ কার্টে যোগ করা হয়েছে!`
        : `প্রোডাক্টটি কার্টে যোগ করা হয়েছে!`,
      "success"
    );

    setTimeout(() => setIsAdding(false), 500);
  };

  return (
    <div className="rounded-3xl border border-orange-200/80 bg-gradient-to-br from-[#FFF9F5] to-white p-5 sm:p-6 space-y-5 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FC5C03] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              Frequently Bought Together (কম্বো অফার)
            </h3>
            <p className="text-xs text-slate-500">
              একসাথে কিনুন এবং অতিরিক্ত {bundleDiscountPercent}% ছাড় উপভোগ করুন!
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-[#FFF2E8] border border-[#FC5C03]/30 text-[#FC5C03] font-bold text-xs whitespace-nowrap">
          {bundleDiscountPercent}% OFF
        </span>
      </div>

      {/* Visual Product Combo Cards */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        {/* Primary Product */}
        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-200/80 w-full sm:w-auto flex-1">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative">
            <SafeImage
              src={primaryProduct.image || "/images/placeholder.svg"}
              alt={primaryProduct.name}
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{primaryProduct.name}</h4>
            <div className="text-xs font-mono font-bold text-slate-700">
              {formatPrice(primaryPrice)}
            </div>
          </div>
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        </div>

        {/* Plus Sign */}
        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 font-bold">
          <Plus className="w-4 h-4" />
        </div>

        {/* Companion Product */}
        <div
          onClick={() => setIncludeCompanion(!includeCompanion)}
          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer w-full sm:w-auto flex-1 ${
            includeCompanion
              ? "bg-white border-orange-300 shadow-xs ring-1 ring-[#FC5C03]/20"
              : "bg-slate-50/80 border-slate-200 opacity-60"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative">
            <SafeImage
              src={companion.image}
              alt={companion.name}
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">{companion.name}</h4>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="font-bold text-[#FC5C03]">{formatPrice(companion.priceBDT)}</span>
              <span className="line-through text-slate-400 text-[10px]">
                {formatPrice(companion.originalPriceBDT)}
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={includeCompanion}
            onChange={(e) => setIncludeCompanion(e.target.checked)}
            className="w-4 h-4 accent-[#FC5C03] rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Pricing Summary & 1-Click Bundle Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-200/60">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-500 font-medium">কম্বো মোট মূল্য:</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
              {formatPrice(finalTotal)}
            </span>
            {bundleDiscount > 0 && (
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                সেভিংস: {formatPrice(bundleDiscount)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddBundleToCart}
          disabled={isAdding}
          className="w-full sm:w-auto px-6 py-3 bg-[#FC5C03] hover:bg-[#E04F00] text-white text-xs font-black rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{includeCompanion ? "কম্বো একসাথে কার্টে যোগ করুন" : "কার্টে যোগ করুন"}</span>
        </button>
      </div>
    </div>
  );
}
