"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS, CATEGORIES } from "@/data/products";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialQuery = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<string>("default");
  const [displayCount, setDisplayCount] = useState<number>(18);

  // Sync category param if URL changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get("q");
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Category Filter
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter(
        (p) =>
          p.category === selectedCategory || p.categories.includes(selectedCategory)
      );
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDesc.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.minPriceBDT - b.minPriceBDT);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.minPriceBDT - a.minPriceBDT);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "popular") {
      result.sort((a, b) => b.viewCount - a.viewCount);
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  const visibleProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  const handleResetFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setSortBy("default");
    setDisplayCount(18);
  };

  return (
    <div className="w-full bg-white pb-16">
      
      {/* 1. SHOP HEADER BANNER (Soft Orange Gradient, 200px - 240px) */}
      <div className="w-full bg-gradient-to-b from-[#FFF2E8] via-[#FFF9F5]/80 to-white border-b border-[#E8E8EE] py-8 sm:py-10">
        <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto text-center">
          
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D26] tracking-tight mb-1.5">
            সব ডিজিটাল প্রোডাক্ট
          </h1>
          
          <p className="text-xs sm:text-sm text-[#4B5563] max-w-xl mx-auto mb-5">
            সফটওয়্যার, এআই টুলস, ভিপিএন, ওটিটি সাবস্ক্রিপশন ও গেম টপ-আপের বিশাল সমাহার।
          </p>

          {/* Centered Search Pill (Full width on mobile, max 450px on desktop) */}
          <div className="w-full max-w-[450px] mx-auto relative px-2">
            <div className="relative flex items-center w-full bg-white rounded-full border border-[#E8E8EE] shadow-sm focus-within:border-[#FC5C03] focus-within:ring-2 focus-within:ring-[#FC5C03]/15 transition-all">
              <Search className="w-4 h-4 text-[#7A8190] ml-3.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রোডাক্ট সার্চ করুন..."
                className="w-full py-2 pl-2.5 pr-3 text-xs sm:text-sm text-[#1A1D26] placeholder-[#7A8190] focus:outline-none rounded-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mr-3 text-xs text-gray-400 hover:text-gray-600"
                >
                  ক্লিয়ার
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. CATEGORY FILTER BAR (Single Horizontal Scrollable Line on Mobile) */}
      <div className="bg-white border-b border-[#E8E8EE] sticky top-[64px] sm:top-[68px] z-30 shadow-2xs">
        <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto py-2.5">
          
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {/* Filter Icon */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-[#1A1D26] shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FC5C03]" />
              <span className="hidden sm:inline">ক্যাটাগরি</span>
            </div>

            {/* Category Pills */}
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all shrink-0 whitespace-nowrap ${
                    isActive
                      ? "bg-[#FC5C03] text-white shadow-xs"
                      : "text-[#7A8190] hover:text-[#1A1D26] hover:bg-[#FFF2E8]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* 3. PRODUCT COUNT & SORT ROW */}
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto pt-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Left: Product Count */}
        <div className="text-xs sm:text-sm font-semibold text-[#1A1D26]">
          মোট <span className="text-[#FC5C03] font-bold">{filteredProducts.length}</span> টি প্রোডাক্ট পাওয়া গেছে
          {selectedCategory !== "All" && (
            <span className="text-gray-500 font-normal ml-1">
              ({selectedCategory})
            </span>
          )}
        </div>

        {/* Right: Sorting Dropdown */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold text-[#1A1D26] bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#FC5C03]"
          >
            <option value="default">ডিফল্ট সাজানো</option>
            <option value="popular">জনপ্রিয়তা অনুযায়ী</option>
            <option value="rating">সর্বোচ্চ রেটিং</option>
            <option value="price-low">দাম: কম থেকে বেশি</option>
            <option value="price-high">দাম: বেশি থেকে কম</option>
          </select>
        </div>

      </div>

      {/* 4. SHOP PRODUCT GRID (Responsive Breakpoints) */}
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 min-[330px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-gray-50 rounded-2xl border border-dashed border-[#E8E8EE] my-4">
            <h3 className="text-base font-bold text-[#1A1D26] mb-1">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
            <p className="text-xs text-[#7A8190] max-w-sm mx-auto mb-5">
              অন্য কি-ওয়ার্ড দিয়ে সার্চ করুন অথবা ক্যাটাগরি ফিল্টার পরিবর্তন করুন।
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FC5C03] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-[#EC4001] transition-all"
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
              className="px-6 py-2.5 bg-white text-[#1A1D26] hover:text-[#FC5C03] border border-[#E8E8EE] hover:border-[#FC5C03] text-xs font-bold rounded-lg shadow-2xs transition-all"
            >
              আরও প্রোডাক্ট লোড করুন ({filteredProducts.length - displayCount} বাকি)
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-500">প্রোডাক্ট লোড হচ্ছে...</div>}>
      <ShopContent />
    </Suspense>
  );
}
