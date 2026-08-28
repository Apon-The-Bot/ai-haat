"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  RefreshCw,
  X,
  Sparkles,
  Zap,
  Check,
  Flame,
  Star,
  ChevronDown,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { trackViewItemList, trackSearch } from "@/lib/analytics/client";
import { sanitizeItem } from "@/lib/analytics/sanitize";

const PRICE_PRESETS = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ৳300", min: 0, max: 300 },
  { label: "৳300 - ৳700", min: 300, max: 700 },
  { label: "৳700 - ৳1,500", min: 700, max: 1500 },
  { label: "৳1,500+", min: 1500, max: Infinity },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get("category") || "All";
  const initialQuery = searchParams?.get("q") || "";

  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState(PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [displayCount, setDisplayCount] = useState<number>(24);

  // Price filtering state
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState<boolean>(false);

  // Determine highest price in catalog
  const catalogMaxPrice = useMemo(() => {
    return products.reduce((max, p) => Math.max(max, p.maxPriceBDT, p.minPriceBDT), 3000);
  }, [products]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.products && d.products.length > 0) {
          setProducts(d.products);
        }
      })
      .catch(() => {});
  }, []);

  // Sync category & search params if URL changes
  useEffect(() => {
    const cat = searchParams?.get("category");
    if (cat) setSelectedCategory(cat);
    const q = searchParams?.get("q");
    if (q !== undefined && q !== null) setSearchQuery(q);
  }, [searchParams]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    for (const cat of CATEGORIES) {
      if (cat === "All") continue;
      counts[cat] = products.filter(
        (p) => p.category === cat || (p.categories && p.categories.includes(cat))
      ).length;
    }
    return counts;
  }, [products]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter(
        (p) =>
          p.category === selectedCategory ||
          (p.categories && p.categories.includes(selectedCategory))
      );
    }

    // Instant Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const inName = p.name.toLowerCase().includes(q);
        const inCat = p.category.toLowerCase().includes(q);
        const inDesc = p.shortDesc?.toLowerCase().includes(q) || false;
        const inFeat = p.features?.some((f) => f.toLowerCase().includes(q)) || false;
        return inName || inCat || inDesc || inFeat;
      });
    }

    // Price Range Filter
    const preset = PRICE_PRESETS[selectedPresetIndex];
    if (selectedPresetIndex !== 0) {
      result = result.filter((p) => {
        const prodPrice = p.minPriceBDT;
        return prodPrice >= preset.min && prodPrice <= preset.max;
      });
    } else if (minPrice > 0 || maxPrice < catalogMaxPrice) {
      result = result.filter((p) => {
        const prodPrice = p.minPriceBDT;
        return prodPrice >= minPrice && prodPrice <= maxPrice;
      });
    }

    // Sorting
    if (sortBy === "popular") {
      result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "price-low") {
      result.sort((a, b) => a.minPriceBDT - b.minPriceBDT);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.minPriceBDT - a.minPriceBDT);
    } else if (sortBy === "newest") {
      result.reverse();
    }

    return result;
  }, [
    products,
    selectedCategory,
    searchQuery,
    selectedPresetIndex,
    minPrice,
    maxPrice,
    catalogMaxPrice,
    sortBy,
  ]);

  const visibleProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  // Analytics: Track view_item_list when visible products change
  const listTrackedRef = React.useRef<string>("");
  useEffect(() => {
    if (visibleProducts.length === 0) return;
    const listKey = `${selectedCategory}:${searchQuery}:${visibleProducts.length}`;
    if (listTrackedRef.current === listKey) return;
    listTrackedRef.current = listKey;
    try {
      const analyticsItems = visibleProducts.slice(0, 20).map((p, i) => sanitizeItem({
        id: p.id, name: p.name, category: p.category,
        price: p.minPriceBDT, quantity: 1, index: i,
        listId: "shop_catalog", listName: selectedCategory !== "All" ? selectedCategory : "Shop Catalog",
      }));
      trackViewItemList("shop_catalog", selectedCategory !== "All" ? selectedCategory : "Shop Catalog", analyticsItems);
    } catch {}
  }, [visibleProducts, selectedCategory, searchQuery]);

  // Analytics: Track search when query changes (debounced)
  const searchTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!searchQuery.trim()) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      try { trackSearch(searchQuery); } catch {}
    }, 1000); // 1s debounce to avoid firing on every keystroke
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setSortBy("popular");
    setSelectedPresetIndex(0);
    setMinPrice(0);
    setMaxPrice(catalogMaxPrice);
    setDisplayCount(24);
    router.replace("/shop");
  };

  const handlePresetSelect = (index: number) => {
    setSelectedPresetIndex(index);
    const preset = PRICE_PRESETS[index];
    setMinPrice(preset.min);
    setMaxPrice(preset.max === Infinity ? catalogMaxPrice : preset.max);
  };

  const hasActiveFilters =
    selectedCategory !== "All" ||
    searchQuery.trim() !== "" ||
    selectedPresetIndex !== 0 ||
    minPrice > 0 ||
    maxPrice < catalogMaxPrice;

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-20">
      
      {/* 1. HERO BANNER & INSTANT SEARCH HEADER */}
      <div className="w-full bg-gradient-to-b from-[#FFF2E8] via-[#FFF9F5] to-[#F8FAFC] border-b border-[#E8E8EE] pt-8 sm:pt-12 pb-8 sm:pb-10">
        <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto text-center space-y-3">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#FC5C03]/20 shadow-2xs text-[#FC5C03] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>অফিসিয়াল ও প্রিমিয়াম ডিজিটাল টুলস</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#1A1D26] tracking-tight">
            সব ডিজিটাল প্রোডাক্ট ও সাবস্ক্রিপশন
          </h1>

          <p className="text-xs sm:text-sm text-[#4B5563] max-w-xl mx-auto">
            এআই টুলস, সফটওয়্যার লাইসেন্স, ভিপিএন, ওটিটি সাবস্ক্রিপশন ও ক্লাউড স্টোরেজ — ৫ মিনিটে ইনস্ট্যান্ট ডেলিভারি ও ফুল রিপ্লেসমেন্ট ওয়ারেন্টি।
          </p>

          {/* Centered Instant Search Pill */}
          <div className="w-full max-w-[540px] mx-auto pt-2">
            <div className="relative flex items-center w-full bg-white rounded-2xl border border-[#E8E8EE] shadow-sm focus-within:border-[#FC5C03] focus-within:ring-3 focus-within:ring-[#FC5C03]/15 transition-all">
              <Search className="w-4 h-4 text-[#7A8190] ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রোডাক্ট নাম, ক্যাটাগরি বা টুল সার্চ করুন (যেমন: ChatGPT, Canva, VPN)..."
                className="w-full py-3 pl-3 pr-3 text-xs sm:text-sm text-[#1A1D26] placeholder-[#7A8190] focus:outline-none rounded-2xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-3 px-2 py-1 text-xs font-bold text-gray-400 hover:text-[#FC5C03] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. STICKY CATEGORY FILTER BAR */}
      <div className="bg-white border-b border-[#E8E8EE] sticky top-[64px] sm:top-[68px] z-30 shadow-2xs">
        <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto py-2.5">
          
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {/* Filter Label */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-[#1A1D26] shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FC5C03]" />
              <span className="hidden sm:inline">ক্যাটাগরি</span>
            </div>

            {/* Category Pills */}
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all shrink-0 whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#FC5C03] text-white shadow-xs"
                      : "bg-[#F3F4F6] text-[#7A8190] hover:text-[#1A1D26] hover:bg-[#FFF2E8]"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-200/80 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* 3. TOOLBAR: PRICE PRESETS, COUNT, SORTING, ACTIVE FILTER CHIPS */}
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto pt-6 pb-4 space-y-3">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8E8EE] shadow-2xs">
          
          {/* Left: Price Range Preset Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-gray-500 mr-1 hidden sm:inline">
              দাম ফিল্টার:
            </span>
            {PRICE_PRESETS.map((preset, idx) => {
              const isSelected = selectedPresetIndex === idx;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetSelect(idx)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    isSelected
                      ? "bg-[#1A1D26] text-white shadow-xs"
                      : "bg-gray-100 text-[#7A8190] hover:bg-gray-200 hover:text-[#1A1D26]"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}

            {/* Custom Price Range Toggle */}
            <button
              type="button"
              onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
              className="text-xs font-bold text-[#FC5C03] hover:underline px-2 py-1 flex items-center gap-1"
            >
              <span>কাস্টম রেঞ্জ</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  isPriceFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Right: Product Count & Sorting */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            <div className="text-xs font-semibold text-gray-600">
              মোট <span className="text-[#FC5C03] font-bold">{filteredProducts.length}</span> টি
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold text-[#1A1D26] bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="popular">জনপ্রিয়তা (Best Selling)</option>
                <option value="rating">সর্বোচ্চ রেটিং (Highest Rated)</option>
                <option value="price-low">দাম: কম থেকে বেশি (Price: Low-High)</option>
                <option value="price-high">দাম: বেশি থেকে কম (Price: High-Low)</option>
                <option value="newest">নতুন প্রোডাক্ট (Newest)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Custom Price Range Slider Drawer (Collapsible) */}
        {isPriceFilterOpen && (
          <div className="bg-white p-4 rounded-2xl border border-[#E8E8EE] shadow-2xs space-y-3 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs font-bold text-[#1A1D26]">
                কাস্টম প্রাইস রেঞ্জ স্লাইডার: ৳{minPrice} - ৳{maxPrice}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={maxPrice}
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(Number(e.target.value) || 0);
                    setSelectedPresetIndex(0);
                  }}
                  placeholder="Min ৳"
                  className="w-24 p-1.5 text-xs font-bold border border-gray-200 rounded-lg text-center"
                />
                <span className="text-gray-400 text-xs">থেকে</span>
                <input
                  type="number"
                  min={minPrice}
                  max={10000}
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value) || 0);
                    setSelectedPresetIndex(0);
                  }}
                  placeholder="Max ৳"
                  className="w-24 p-1.5 text-xs font-bold border border-gray-200 rounded-lg text-center"
                />
              </div>
            </div>

            {/* Slider bar */}
            <input
              type="range"
              min={0}
              max={catalogMaxPrice}
              step={50}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setSelectedPresetIndex(0);
              }}
              className="w-full accent-[#FC5C03] cursor-pointer"
            />
          </div>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="text-gray-500 font-semibold">ফিল্টার চালু:</span>
            {selectedCategory !== "All" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-lg font-bold border border-[#FC5C03]/20">
                <span>{selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="hover:text-black"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery.trim() !== "" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-[#1A1D26] rounded-lg font-bold">
                <span>&ldquo;{searchQuery}&rdquo;</span>
                <button onClick={() => setSearchQuery("")} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedPresetIndex !== 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-[#1A1D26] rounded-lg font-bold">
                <span>{PRICE_PRESETS[selectedPresetIndex].label}</span>
                <button
                  onClick={() => handlePresetSelect(0)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-red-600 hover:underline ml-auto flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>রিসেট করুন</span>
            </button>
          </div>
        )}

      </div>

      {/* 4. PRODUCT GRID */}
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 min-[330px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-[#E8E8EE] my-6 p-8 shadow-2xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1A1D26]">
                কোনো প্রোডাক্ট পাওয়া যায়নি
              </h3>
              <p className="text-xs text-[#7A8190] max-w-sm mx-auto mt-1">
                অন্য কোনো কি-ওয়ার্ড দিয়ে সার্চ করুন অথবা ফিল্টারগুলো রিসেট করুন।
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ফিল্টার রিসেট করুন</span>
            </button>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="pt-10 text-center">
            <button
              onClick={() => setDisplayCount((prev) => prev + 12)}
              className="px-6 py-3 bg-white hover:bg-[#FFF2E8] text-[#1A1D26] hover:text-[#FC5C03] border border-[#E8E8EE] hover:border-[#FC5C03]/50 text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              আরও প্রোডাক্ট লোড করুন ({filteredProducts.length - displayCount} বাকি)
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export function ShopClient() {
  return <ShopContent />;
}
