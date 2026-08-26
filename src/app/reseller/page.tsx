"use client";

import React, { useState } from "react";
import { Users, CheckCircle2, ShieldCheck, Zap, Sparkles, Send } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function ResellerPage() {
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fbPage, setFbPage] = useState("");
  const [tier, setTier] = useState("Silver");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setName("");
      setPhone("");
      setFbPage("");
      showToast("রিসেলার আবেদন সফলভাবে জমা হয়েছে! আমাদের টিম যোগাযোগ করবে।", "success");
    }, 1000);
  };

  const tiers = [
    {
      name: "Silver Tier",
      discount: "15% - 20% OFF",
      minOrder: "৳২,০০০ / মাস",
      features: ["সব প্রোডাক্টে হোলসেল রেট", "২৪/৭ প্রায়োরিটি হোয়াটসঅ্যাপ সাপোর্ট", "ইনস্ট্যান্ট ডেলিভারি ড্যাশবোর্ড"],
    },
    {
      name: "Gold Tier",
      discount: "25% - 30% OFF",
      minOrder: "৳৫,০০০ / মাস",
      popular: true,
      features: ["হোলসেল বিশেষ মূল্যছাড়", "ডেডিকেটেড একাউন্ট ম্যানেজার", "ফ্রি রিপ্লেসমেন্ট প্রায়োরিটি", "বাল্ক অর্ডার অটোমেশন"],
    },
    {
      name: "Diamond Tier",
      discount: "35% - 40% OFF",
      minOrder: "৳১৫,০০০+ / মাস",
      features: ["সর্বোচ্চ পাইকারি ডিসকাউন্ট", "অটোমেটেড REST API এক্সেস", "কাস্টম ব্র্যান্ডিং সাপোর্ট", "ইনস্ট্যান্ট ব্যালেন্স ক্রেডিট"],
    },
  ];

  return (
    <div className="w-full bg-white py-8 sm:py-12 min-h-[75vh]">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>হোলসেল ও বিটুবি পার্টনারশিপ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D26] tracking-tight">
            এআই হাট রিসেলার প্রোগ্রাম (Reseller Program)
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            ডিজিটাল প্রোডাক্টের ব্যবসা শুরু করুন সবচেয়ে কম পাইকারি রেটে এবং সর্বোচ্চ প্রফিট মার্জিনে।
          </p>
        </div>

        {/* 3 Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-12">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between relative ${
                t.popular
                  ? "bg-[#FFF9F5] border-[#FC5C03] shadow-md ring-1 ring-[#FC5C03]"
                  : "bg-white border-[#E8E8EE] shadow-2xs hover:border-gray-300"
              }`}
            >
              {t.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#FC5C03] text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                  সবচেয়ে জনপ্রিয়
                </span>
              )}

              <div>
                <h3 className="text-base font-black text-[#1A1D26] mb-1">{t.name}</h3>
                <span className="text-xl sm:text-2xl font-black text-[#FC5C03] block mb-1">
                  {t.discount}
                </span>
                <span className="text-xs text-gray-500 font-semibold block mb-4">
                  মিনিমাম ডিপোজিট: {t.minOrder}
                </span>

                <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                  {t.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-gray-700 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#FC5C03] shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setTier(t.name.split(" ")[0])}
                className={`mt-6 w-full py-2.5 rounded-lg text-xs font-bold transition-all ${
                  t.popular
                    ? "bg-[#FC5C03] hover:bg-[#EC4001] text-white shadow-xs"
                    : "bg-gray-100 hover:bg-gray-200 text-[#1A1D26]"
                }`}
              >
                {t.name} নির্বাচন করুন
              </button>
            </div>
          ))}
        </div>

        {/* Application Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#E8E8EE] p-6 sm:p-8 shadow-2xs">
          <h3 className="text-base sm:text-lg font-black text-[#1A1D26] mb-1">
            রিসেলার হিসেবে আবেদন করুন
          </h3>
          <p className="text-xs text-[#7A8190] mb-5">
            নিচের ফর্মটি পূরণ করুন, ২৪ ঘণ্টার মধ্যে আমাদের রিপ্রেজেন্টেটিভ আপনার সাথে যোগাযোগ করবেন।
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#1A1D26] mb-1">আপনার নাম *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="পূর্ণ নাম লিখুন"
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1A1D26] mb-1">হোয়াটসঅ্যাপ নাম্বার *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D26] mb-1">ফেসবুক পেজ / শপ লিংক</label>
                <input
                  type="text"
                  value={fbPage}
                  onChange={(e) => setFbPage(e.target.value)}
                  placeholder="facebook.com/yourpage"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1D26] mb-1">নির্বাচিত টায়ার</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
              >
                <option value="Silver">Silver Tier (15-20% OFF)</option>
                <option value="Gold">Gold Tier (25-30% OFF)</option>
                <option value="Diamond">Diamond Tier (35-40% OFF)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] disabled:bg-gray-400 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-all"
            >
              {isSubmitting ? "আবেদন জমা হচ্ছে..." : "আবেদন সাবমিট করুন"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
