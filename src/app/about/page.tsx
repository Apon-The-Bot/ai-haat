"use client";

import React from "react";
import { ShieldCheck, Zap, Headphones, RotateCcw, MapPin, Mail, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function AboutPage() {
  return (
    <div className="w-full bg-white py-8 sm:py-12 min-h-[75vh]">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-block mb-3">
            <Logo size="lg" showSubtitle={true} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D26] tracking-tight">
            আমাদের সম্পর্কে (About AI Haat)
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-2 leading-relaxed">
            এআই হাট বাংলাদেশের একটি নির্ভরযোগ্য ডিজিটাল প্রোডাক্ট ও সফটওয়্যার মার্কেটপ্লেস। আমাদের মূল লক্ষ্য সুলভ মূল্যে শতভাগ আসল ডিজিটাল সাবস্ক্রিপশন ও প্রিমিয়াম টুলস সহজে গ্রাহকের কাছে পৌঁছে দেওয়া।
          </p>
        </div>

        {/* 4 Core Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-12">
          <div className="p-5 bg-gray-50/70 rounded-xl border border-[#E8E8EE] space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1D26]">১০০% জেনুইন সার্ভিস</h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              আমরা সরাসরি অফিসিয়াল চ্যানেল থেকে লাইসেন্স ও সাবস্ক্রিপশন প্রদান করি।
            </p>
          </div>

          <div className="p-5 bg-gray-50/70 rounded-xl border border-[#E8E8EE] space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1D26]">দ্রুততম ডেলিভারি</h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              পেমেন্ট কনফার্মেশনের ৫ থেকে ১৫ মিনিটের মধ্যে সক্রিয় ক্রেডেনশিয়াল পৌঁছে যায়।
            </p>
          </div>

          <div className="p-5 bg-gray-50/70 rounded-xl border border-[#E8E8EE] space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1D26]">ফুল ওয়ারেন্টি</h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              সম্পূর্ণ মেয়াদের জন্য ইন্সট্যান্ট রিপ্লেসমেন্ট এবং সমাধান গ্যারান্টি।
            </p>
          </div>

          <div className="p-5 bg-gray-50/70 rounded-xl border border-[#E8E8EE] space-y-2">
            <div className="w-9 h-9 rounded-lg bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1D26]">২৪/৭ সাপোর্ট</h3>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              যেকোনো প্রয়োজনে আমাদের অভিজ্ঞ সাপোর্ট টিম হোয়াটসঅ্যাপে সক্রিয় থাকে।
            </p>
          </div>
        </div>

        {/* Office Location & Contact Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E8E8EE] p-6 sm:p-8 shadow-2xs space-y-4 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-black text-[#1A1D26] pb-2 border-b border-gray-100">
            যোগাযোগের ঠিকানা ও তথ্য
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-700">
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-[#1A1D26]">
                <MapPin className="w-4 h-4 text-[#FC5C03]" />
                <span>অফিস লোকেশন</span>
              </div>
              <p className="text-gray-500">মিরপুর ডিওএইচএস, ঢাকা - ১২১৬, বাংলাদেশ</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-[#1A1D26]">
                <Mail className="w-4 h-4 text-[#FC5C03]" />
                <span>ইমেইল যোগাযোগ</span>
              </div>
              <p className="text-gray-500">support@aihaat.com</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-[#1A1D26]">
                <Phone className="w-4 h-4 text-[#FC5C03]" />
                <span>হোয়াটসঅ্যাপ হেল্পলাইন</span>
              </div>
              <p className="text-gray-500">+880 1712-345678</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
