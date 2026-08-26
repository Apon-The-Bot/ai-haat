"use client";

import React, { useState } from "react";
import { CheckCircle2, Play, MousePointerClick, CreditCard, Send, X } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";

export function HowToOrder() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const steps = [
    {
      number: "১",
      title: "পণ্য ও প্যাকেজ নির্বাচন",
      desc: "পছন্দের সাবস্ক্রিপশন, সফটওয়্যার বা গেম টপ-আপ নির্বাচন করুন।",
      icon: MousePointerClick,
    },
    {
      number: "২",
      title: "সহজ পেমেন্ট",
      desc: "বিকাশ, নগদ বা রকেটে কোনো অতিরিক্ত চার্জ ছাড়াই দ্রুত পেমেন্ট করুন।",
      icon: CreditCard,
    },
    {
      number: "৩",
      title: "ইনস্ট্যান্ট ডেলিভারি",
      desc: "পেমেন্টের ৫-১৫ মিনিটের মধ্যে হোয়াটসঅ্যাপ ও ইমেইলে ডেলিভারি বুঝে নিন।",
      icon: Send,
    },
  ];

  return (
    <section className="py-8 sm:py-12 border-t border-[#E8E8EE] bg-white">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        
        {/* Centered Heading */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>সহজ ৩টি ধাপ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1A1D26] tracking-tight">
            অর্ডার করার সহজ নিয়ম
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            এআই হাট থেকে ডিজিটাল প্রোডাক্ট কেনা একদম সহজ এবং সম্পূর্ণ নিরাপদ।
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
          <div className="hidden md:block absolute top-7 left-16 right-16 h-[1.5px] bg-[#E8E8EE] -z-0" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative z-10 flex flex-col items-center text-center p-5 bg-white rounded-xl border border-[#E8E8EE] shadow-2xs hover:border-[#FC5C03]/40 transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-[#FC5C03] text-white font-extrabold text-xs flex items-center justify-center shadow-xs mb-3 group-hover:scale-105 transition-transform">
                  {step.number}
                </div>

                <div className="w-9 h-9 rounded-lg bg-[#FFF9F5] text-[#FC5C03] flex items-center justify-center mb-2.5">
                  <Icon className="w-4 h-4" />
                </div>

                <h3 className="text-sm font-bold text-[#1A1D26] mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Tutorial-Video Preview (~850px max width, 16:9) */}
        <div className="max-w-[850px] mx-auto">
          <div
            onClick={() => setIsVideoModalOpen(true)}
            className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#E8E8EE] cursor-pointer group bg-gray-900 shadow-md"
          >
            <SafeImage
              src="/images/brand/banner.jpg"
              alt="How to order video tutorial"
              aspectRatio="16/9"
              objectFit="cover"
              className="opacity-75 group-hover:opacity-85 group-hover:scale-102 transition-all duration-300"
              sizes="(max-width: 850px) 100vw, 850px"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#FC5C03] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
            </div>

            <div className="absolute bottom-4 left-4 text-white">
              <span className="text-[11px] font-semibold text-amber-300 block mb-0.5">ভিডিও টিউটোরিয়াল</span>
              <h4 className="text-xs sm:text-sm font-bold">
                ভিডিও দেখুন: কীভাবে অর্ডার করবেন
              </h4>
            </div>
          </div>
        </div>

      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <div className="p-3.5 flex items-center justify-between bg-gray-900 text-white">
              <h3 className="text-xs sm:text-sm font-bold">
                কীভাবে অর্ডার করবেন - এআই হাট টিউটোরিয়াল
              </h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="AI Haat Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
