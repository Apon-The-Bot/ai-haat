"use client";

import React from "react";
import { CheckCircle2, MousePointerClick, CreditCard, Send } from "lucide-react";

export function HowToOrder() {

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

        {/* Instant Digital Delivery & Support Info Card */}
        <div className="max-w-[1000px] mx-auto bg-gradient-to-r from-[#1A1D26] via-[#242936] to-[#1A1D26] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FC5C03]/20 text-[#FC5C03] text-xs font-bold rounded-full border border-[#FC5C03]/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>১০০% নিরাপদ ও নির্ভরযোগ্য</span>
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                অর্ডার পরবর্তী ইনস্ট্যান্ট ডেলিভারি যেভাবে পাবেন:
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই আপনার অর্ডারটি স্বয়ংক্রিয়ভাবে ভেরিফাই হবে এবং ৫ থেকে ১৫ মিনিটের মধ্যে আপনার ড্যাশবোর্ডের <strong className="text-white font-bold">ডিজিটাল ভল্ট</strong> ও ইমেইলে সমস্ত ক্রেডেনশিয়াল পৌঁছে যাবে। কোনো সমস্যা হলে আমাদের হেল্পলাইন রয়েছে সার্বক্ষণিক সহায়তায়।
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2.5">
              <a
                href="/shop"
                className="w-full py-3 px-4 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs sm:text-sm font-bold rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>প্রোডাক্ট অর্ডার করুন</span>
              </a>
              <a
                href="/order-tracking"
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold rounded-xl text-center border border-white/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>অর্ডার স্ট্যাটাস দেখুন</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
