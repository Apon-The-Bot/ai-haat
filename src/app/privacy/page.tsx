import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy | AI Haat",
  description:
    "Privacy and data protection policy for AI Haat digital commerce platform in Bangladesh. 100% encrypted and secure.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | AI Haat",
    description: "Privacy and data protection policy for AI Haat digital commerce platform.",
    url: `${SITE_URL}/privacy`,
    siteName: "AI Haat",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="w-full bg-white py-10 sm:py-16 min-h-[75vh]">
      <div className="max-w-4xl w-[calc(100%-24px)] md:w-[calc(100%-40px)] mx-auto space-y-8">
        
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#FC5C03] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>হোমপেইজে ফিরে যান</span>
        </Link>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>গোপনীয়তা সুরক্ষা</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">গোপনীয়তা নীতিমালা (Privacy Policy)</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">সর্বশেষ আপডেট: আগস্ট ২০২৬</p>
        </div>

        <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">১. সংগৃহীত তথ্যাবলী</h2>
            <p>
              অর্ডার প্রসেসিং ও অ্যাকাউন্ট নিরাপত্তার জন্য আমরা গ্রাহকের নাম, ইমেইল অ্যাড্রেস, ফোন নম্বর এবং পেমেন্ট ট্রানজেকশন রেফারেন্স সংগ্রহ করি। আমরা কোনো ব্যাংক কার্ডের সংবেদনশীল পিন বা সিভিভি আমাদের সার্ভারে সংরক্ষণ করি না।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">২. তথ্যের নিরাপত্তা ও এনক্রিপশন</h2>
            <p>
              AI Haat-এ গ্রাহকদের পাসওয়ার্ড এবং ডিজিটাল লাইসেন্স কি-সমূহ ইন্ডাস্ট্রি-স্ট্যান্ডার্ড <b>AES-256-GCM</b> এনক্রিপশন অ্যালগরিদম দ্বারা সুরক্ষিত থাকে। টু-ফ্যাক্টর অথেনটিকেশন (TOTP MFA) এর মাধ্যমে প্রতিটি একাউন্টের সর্বোচ্চ নিরাপত্তা নিশ্চিত করা হয়।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">৩. তৃতীয় পক্ষের সাথে তথ্য শেয়ারিং</h2>
            <p>
              আমরা কোনো অবস্থাতেই গ্রাহকের ব্যক্তিগত তথ্য বা ইমেইল কোনো তৃতীয় পক্ষের বিজ্ঞাপনদাতা বা এজেন্সির কাছে বিক্রি বা প্রকাশ করি না। শুধুমাত্র পেমেন্ট ভেরিফিকেশন ও ট্রানজেকশনাল ইমেইল পাঠানোর প্রয়োজনে অথরাইজড গেটওয়ের সাথে প্রয়োজনীয় ডাটা শেয়ার করা হয়।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">৪. কুকিজ ও সেশন ডাটা</h2>
            <p>
              লগইন সেশন বজায় রাখতে এবং শপিং কার্টের আইটেম সংরক্ষণ করতে সিকিউর HttpOnly কুকিজ ব্যবহৃত হয়।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">৫. আপনার অধিকার</h2>
            <p>
              যেকোনো সময় আপনি আপনার ড্যাশবোর্ড থেকে আপনার একাউন্টের তথ্য দেখতে ও পরিবর্তন করতে পারবেন অথবা একাউন্ট মুছে ফেলার অনুরোধ করতে পারবেন।
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
