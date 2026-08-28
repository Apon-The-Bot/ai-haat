import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, FileText, ArrowLeft } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms & Conditions & Warranty Policy | AI Haat",
  description:
    "Terms and conditions, warranty policies, and replacement rules for AI Haat digital commerce platform.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    title: "Terms & Conditions | AI Haat",
    description: "Terms and conditions, warranty policies, and service rules for AI Haat digital commerce platform.",
    url: `${SITE_URL}/terms`,
    siteName: "AI Haat",
    type: "website",
  },
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>আইনি নীতিমালা</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">শর্তাবলী ও নীতিমালা (Terms & Conditions)</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">সর্বশেষ আপডেট: আগস্ট ২০২৬</p>
        </div>

        <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">১. ভূমিকা ও সেবা ব্যবহারের সম্মতি</h2>
            <p>
              AI Haat (aihaat.shop) একটি ডিজিটাল প্রোডাক্ট ও সাবস্ক্রিপশন ই-কমার্স প্ল্যাটফর্ম। আমাদের ওয়েবসাইট ব্যবহার করে বা যেকোনো প্রোডাক্ট ক্রয়ের মাধ্যমে আপনি এই শর্তাবলীতে সম্মতি প্রদান করছেন।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">২. ডিজিটাল প্রোডাক্ট ও ডেলিভারি পদ্ধতি</h2>
            <p>
              সকল প্রোডাক্ট ডিজিটাল ফরম্যাটে (যেমন: লাইসেন্স কি, একাউন্ট ক্রেডেনশিয়াল, অ্যাক্টিভেশন লিঙ্ক) ডেলিভারি করা হয়। সফল পেমেন্টের পর আমাদের স্বয়ংক্রিয় সিস্টেম অথবা এডমিন টিম আপনার রেজিস্টার্ড ইমেইল এবং ড্যাশবোর্ড ভল্টে ডেলিভারি সম্পন্ন করবে।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">৩. ওয়ারেন্টি ও রিপ্লেসমেন্ট গ্যারান্টি</h2>
            <p>
              আমাদের সকল অফিসিয়াল সাবস্ক্রিপশন ও কী-তে প্যাকেজ অনুযায়ী সম্পূর্ণ মেয়াদের রিপ্লেসমেন্ট ওয়ারেন্টি থাকে। যদি ডেলিভারিকৃত একাউন্ট বা লাইসেন্স কিতে কোনো ত্রুটি দেখা যায়, তবে আমাদের কাস্টমার সাপোর্টে জানালে যাচাইপূর্বক দ্রুত রিপ্লেসমেন্ট প্রদান করা হবে।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">৪. ওয়ালেট ও রিফান্ড নীতি</h2>
            <p>
              ওয়ালেটে যোগকৃত ব্যালেন্স দিয়ে প্ল্যাটফর্মের যেকোনো প্রোডাক্ট ক্রয় করা যাবে। কোনো প্রোডাক্ট সরবরাহে ব্যর্থ হলে মূল্য সম্পূর্ণভাবে গ্রাহকের ওয়ালেটে বা মূল পেমেন্ট মেথডে রিফান্ড করা হবে।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">৫. একাউন্ট অপব্যবহার ও নিষিদ্ধ কার্যক্রম</h2>
            <p>
              ডেলিভারিকৃত প্রাইভেট বা শেয়ার্ড একাউন্টের পাসওয়ার্ড পরিবর্তন, প্রোফাইল পিন পরিবর্তন বা অন্য কারো সাথে অপব্যবহার করা কঠোরভাবে নিষিদ্ধ। এমন ক্ষেত্রে সংশ্লিষ্ট একাউন্টের ওয়ারেন্টি বাতিল হতে পারে।
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">৬. যোগাযোগ ও সহায়তা</h2>
            <p>
              যেকোনো জিজ্ঞাসা বা সহায়তার জন্য আমাদের WhatsApp অথবা অফিসিয়াল ইমেইলে যোগাযোগ করতে পারেন।
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
