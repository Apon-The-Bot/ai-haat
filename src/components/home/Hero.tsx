"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Shield, Zap, Headphones } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SafeImage } from "@/components/SafeImage";

export function Hero() {
  const demoAppTiles = [
    {
      name: "ChatGPT Plus",
      desc: "GPT-4o & Canvas",
      icon: "/images/icons/chatgpt.svg",
      slug: "chatgpt-plus",
    },
    {
      name: "Canva Pro",
      desc: "Brand Kit & AI",
      icon: "/images/icons/canva.svg",
      slug: "canva-pro",
    },
    {
      name: "CapCut Pro",
      desc: "VIP 4K Auto-Captions",
      icon: "/images/icons/capcut.svg",
      slug: "capcut-pro",
    },
    {
      name: "Google Gemini",
      desc: "1.5 Pro & 2TB Cloud",
      icon: "/images/icons/gemini.svg",
      slug: "google-gemini-advanced",
    },
    {
      name: "Microsoft 365",
      desc: "Word, Excel + 1TB",
      icon: "/images/icons/microsoft.svg",
      slug: "microsoft-365-family-seat",
    },
    {
      name: "NordVPN",
      desc: "High Speed & Security",
      icon: "/images/icons/nordvpn.svg",
      slug: "nordvpn-complete-security",
    },
  ];

  return (
    <section className="relative w-full bg-gradient-to-b from-white via-[#FFF9F5]/70 to-[#FFF2E8]/30 border-b border-[#E8E8EE] overflow-hidden">
      
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto py-8 sm:py-12 lg:py-16">
        
        {/* Two-Column on Desktop & Tablet, Single-Column on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT HERO AREA (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
            
            {/* Top-Left AI Haat Logo */}
            <div className="inline-block">
              <Logo size="lg" showSubtitle={true} />
            </div>

            {/* Headline with clean block lines and proper Bengali line-height */}
            <div>
              <h1 className="text-[23px] sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[46px] font-black text-[#1A1D26] tracking-normal space-y-2 sm:space-y-2.5">
                <span className="block leading-[1.4] sm:leading-[1.45]">
                  প্রিমিয়াম <span className="text-[#FC5C03]">ডিজিটাল প্রোডাক্টস</span>
                </span>
                <span className="block text-[#1A1D26] leading-[1.4] sm:leading-[1.45] pt-0.5 sm:pt-1">
                  এক জায়গায়, নিশ্চিন্তে
                </span>
              </h1>
              <span className="w-14 sm:w-16 h-1 sm:h-1.5 bg-[#FC5C03] rounded-full mt-3.5 sm:mt-4 block" />
            </div>

            {/* Supporting Text */}
            <p className="text-xs sm:text-sm text-[#4B5563] max-w-xl leading-relaxed pt-1.5">
              ChatGPT, Canva Pro, Microsoft 365, VPN এবং গেম টপ-আপের শতভাগ আসল সাবস্ক্রিপশন। পেমেন্টের ৫-১৫ মিনিটে অটোমেটেড দ্রুত ডেলিভারি ও ফুল রিপ্লেসমেন্ট ওয়ারেন্টি।
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <span>সব প্রোডাক্ট দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/order-tracking"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 bg-white text-[#1A1D26] hover:text-[#FC5C03] border border-[#E8E8EE] hover:border-[#FC5C03]/40 text-xs sm:text-sm font-bold rounded-lg shadow-2xs transition-all"
              >
                <span>অর্ডার ট্র্যাকিং</span>
              </Link>
            </div>

            {/* Micro Feature Chips */}
            <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-2 text-[10.5px] sm:text-[11px] font-semibold text-[#7A8190]">
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#E8E8EE] shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-[#FC5C03]" />
                <span>ইনস্ট্যান্ট ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#E8E8EE] shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-[#FC5C03]" />
                <span>১০০% রিপ্লেসমেন্ট গ্যারান্টি</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#E8E8EE] shadow-2xs">
                <Headphones className="w-3.5 h-3.5 text-[#FC5C03]" />
                <span>২৪/৭ লাইভ সাপোর্ট</span>
              </div>
            </div>

          </div>

          {/* RIGHT HERO AREA (5 Cols: 3 by 2 Product Tiles with Dedicated Crisp Icons) */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 p-3.5 bg-white/80 backdrop-blur-xs rounded-2xl border border-[#E8E8EE] shadow-sm">
              {demoAppTiles.map((tile) => (
                <Link
                  key={tile.name}
                  href={`/product/${tile.slug}`}
                  className="group flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-xl border border-[#E8E8EE] hover:border-[#FC5C03] hover:shadow-cardHover transition-all text-center"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 relative rounded-xl overflow-hidden mb-2.5 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <SafeImage
                      src={tile.icon}
                      alt={tile.name}
                      aspectRatio="1/1"
                      objectFit="contain"
                      sizes="56px"
                    />
                  </div>
                  <h4 className="text-[11.5px] sm:text-xs font-bold text-[#1A1D26] group-hover:text-[#FC5C03] transition-colors truncate w-full">
                    {tile.name}
                  </h4>
                  <span className="text-[9.5px] text-[#7A8190] truncate w-full mt-0.5">
                    {tile.desc}
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
