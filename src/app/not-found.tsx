"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Home, ShoppingBag, ArrowRight, HelpCircle } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const popularLinks = [
    { name: "ChatGPT Plus", href: "/product/chatgpt-plus" },
    { name: "Canva Pro", href: "/product/canva-pro" },
    { name: "CapCut Pro", href: "/product/capcut-pro" },
    { name: "NordVPN", href: "/product/nordvpn-complete-security" },
    { name: "অর্ডার ট্র্যাকিং", href: "/order-tracking" },
  ];

  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center p-4 bg-gray-50/40">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-[#E8E8EE] p-6 sm:p-10 text-center shadow-lg space-y-6">
        
        {/* 404 Big Numeric Accent */}
        <div className="space-y-1">
          <span className="text-6xl sm:text-7xl font-black text-[#1A1D26] tracking-tighter block font-mono">
            4<span className="text-[#FC5C03]">0</span>4
          </span>
          <h1 className="text-lg sm:text-xl font-extrabold text-[#1A1D26]">
            পেজটি খুঁজে পাওয়া যায়নি!
          </h1>
          <p className="text-xs text-[#7A8190] leading-relaxed max-w-sm mx-auto">
            আপনি যে লিংকটি খুঁজছেন তা হয়তো সরানো হয়েছে, নাম পরিবর্তন করা হয়েছে অথবা সাময়িকভাবে অনুপলব্ধ।
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-sm mx-auto">
          <input
            type="text"
            placeholder="প্রোডাক্টের নাম লিখে খুঁজুন..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-[#FC5C03] focus:outline-hidden transition-all"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#FC5C03] text-white rounded-lg hover:bg-[#EC4001] transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Popular Shortcuts */}
        <div className="pt-2">
          <span className="text-[11px] font-bold text-gray-400 block mb-2 uppercase tracking-wider">
            জনপ্রিয় পেজসমূহ:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {popularLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-1 bg-gray-100 hover:bg-[#FFF2E8] hover:text-[#FC5C03] text-[#1A1D26] text-xs font-semibold rounded-lg transition-colors border border-gray-200"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Home & Shop Button */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>হোমপেজে ফিরে যান</span>
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1A1D26] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>সব প্রোডাক্ট ব্রাউজ করুন</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
