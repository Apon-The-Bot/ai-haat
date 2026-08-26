"use client";

import React, { useState } from "react";
import { HelpCircle, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function ProductRequestPage() {
  const { showToast } = useToast();

  const [productName, setProductName] = useState("");
  const [targetBudget, setTargetBudget] = useState("");
  const [contact, setContact] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setProductName("");
      setTargetBudget("");
      setContact("");
      setDetails("");
      showToast("আপনার প্রোডাক্ট রিকোয়েস্ট গ্রহণ করা হয়েছে! আমরা সোর্সিং করে জানাবো।", "success");
    }, 1000);
  };

  return (
    <div className="w-full bg-white py-8 sm:py-12 min-h-[75vh]">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>কাস্টম সোর্সিং</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D26] tracking-tight">
            প্রোডাক্ট রিকোয়েস্ট (Product Request)
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            আপনার কাঙ্ক্ষিত সফটওয়্যার বা সাবস্ক্রিপশন খুঁজে পাচ্ছেন না? আমাদের জানান, আমরা ব্যবস্থা করে দেবো।
          </p>
        </div>

        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-[#E8E8EE] p-6 sm:p-8 shadow-2xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                প্রোডাক্ট / সফটওয়্যার এর নাম *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Midjourney, GitHub Copilot, Cursor Pro..."
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                  টার্গেট বাজেট (টাকা / ডলার)
                </label>
                <input
                  type="text"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  placeholder="e.g. ৫০০ ৳ / $৫"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                  আপনার হোয়াটসঅ্যাপ বা ইমেইল *
                </label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="017XXXXXXXX / email"
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                অতিরিক্ত বিবরণ / প্রয়োজনীয়তা
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="মেয়াদ বা নির্দিষ্ট কোনো ফিচার থাকলে বিস্তারিত লিখুন..."
                className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] disabled:bg-gray-400 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "অনুরোধ জমা হচ্ছে..." : "রিকোয়েস্ট সাবমিট করুন"}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
