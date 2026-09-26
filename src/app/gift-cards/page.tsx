"use client";

import React, { useState } from "react";
import { Gift, Sparkles, Heart, Check, ArrowRight, ShieldCheck, Mail, User } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const DENOMINATIONS = [
  { amount: 500, labelBn: "৫০০ ৳", popular: false },
  { amount: 1000, labelBn: "১,০০০ ৳", popular: true },
  { amount: 2000, labelBn: "২,০০০ ৳", popular: false },
  { amount: 5000, labelBn: "৫,০০০ ৳", popular: false },
];

export default function GiftCardsPage() {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState(user?.name || "");
  const [customMessage, setCustomMessage] = useState(
    "প্রিয় বন্ধু, তোমার ক্যারিয়ার ও ক্রিয়েটিভিটি এগিয়ে নিতে এই ডিজিটাল গিফট কার্ডটি গ্রহণ করো!"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/gift-cards/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountBDT: selectedAmount,
          recipientEmail: recipientEmail.trim() || undefined,
          recipientName: recipientName.trim() || undefined,
          senderName: senderName.trim() || undefined,
          customMessage: customMessage.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.giftCard) {
        showToast("🎉 আপনার গিফট কার্ড সফলভাবে তৈরি হয়েছে!", "success");
        // Redirect to wallet or show the code
        router.push(`/dashboard/wallet?giftcard=${data.giftCard.code}`);
      } else {
        showToast(data.error || "গিফট কার্ড তৈরি করতে সমস্যা হয়েছে।", "error");
      }
    } catch (e: any) {
      showToast("সার্ভার ত্রুটি। আবার চেষ্টা করুন।", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-[1200px] w-[calc(100%-24px)] md:w-[calc(100%-48px)] mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2E8] border border-[#FC5C03]/30 text-[#FC5C03] text-xs font-bold">
            <Gift className="w-3.5 h-3.5" />
            <span>ডিজিটাল গিফট কার্ড ও ভাউচার</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            প্রিয়জনকে উপহার দিন প্রিমিয়াম AI টুলসের স্বাধীনতা
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            ChatGPT, Claude, Canva বা Windows কী—যেকোনো ডিজিটাল প্রোডাক্ট কিনতে AI Haat গিফট কার্ড ব্যবহার করা যায়।
            ১-ক্লিকে নিজের ওয়ালেটে বা বন্ধুর ইমেইলে পাঠিয়ে দিন।
          </p>
        </div>

        {/* Gift Card Visual Preview + Configuration Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Preview Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-[#1A1D26] to-[#FC5C03] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden aspect-8/5 flex flex-col justify-between border border-orange-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs">
                  AI Haat Digital Card
                </span>
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>

              <div className="space-y-1 my-auto">
                <div className="text-xs text-white/80">ব্যালেন্স মান (Amount):</div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-white">
                  {formatPrice(selectedAmount)}
                </div>
              </div>

              <div className="flex items-end justify-between text-xs text-white/80 pt-4 border-t border-white/15">
                <div>
                  <span className="text-[10px] block opacity-70">প্রাপক (Recipient):</span>
                  <span className="font-bold text-white">{recipientName || "প্রিয় বন্ধু"}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] block opacity-70">প্রেরক (Sender):</span>
                  <span className="font-bold text-white">{senderName || "আপনার শুভাকাঙ্ক্ষী"}</span>
                </div>
              </div>
            </div>

            {/* Guarantees */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>মেয়াদ: কেনার দিন থেকে ৩৬৫ দিন (১ বছর) পর্যন্ত বৈধ</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 pl-6">
                কোডটি দিয়ে AI Haat-এর যেকোনো সাবস্ক্রিপশন, লাইসেন্স বা অ্যাকাউন্ট কেনা যাবে। কোনো অতিরিক্ত হিডেন চার্জ নেই।
              </p>
            </div>
          </div>

          {/* Right: Customization Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <form onSubmit={handlePurchase} className="space-y-6">
              {/* 1. Denomination Selector */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  ১. গিফট কার্ডের মূল্য নির্ধারণ করুন:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DENOMINATIONS.map((d) => (
                    <button
                      key={d.amount}
                      type="button"
                      onClick={() => setSelectedAmount(d.amount)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                        selectedAmount === d.amount
                          ? "bg-white border-[#FC5C03] shadow-xs ring-2 ring-[#FC5C03]"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      {d.popular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#FC5C03] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                          জনপ্রিয়
                        </span>
                      )}
                      <div className="text-base font-black text-slate-900 font-mono">
                        {d.labelBn}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Recipient Information */}
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  ২. প্রাপকের তথ্য (কার জন্য কিনছেন?):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-600 font-medium">প্রাপকের নাম (ঐচ্ছিক):</span>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="যেমন: তানভীর আহমেদ"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#FC5C03]"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-600 font-medium">প্রাপকের ইমেইল (ঐচ্ছিক):</span>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="recipient@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#FC5C03]"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Sender Info & Custom Message */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <span className="text-xs text-slate-600 font-medium">আপনার নাম (প্রেরক):</span>
                  <input
                    type="text"
                    placeholder="আপনার নাম"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#FC5C03]"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-600 font-medium">শুভেচ্ছা বার্তা (Custom Note):</span>
                  <textarea
                    rows={2}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-[#FC5C03] resize-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  মোট পরিশোধযোগ্য: <strong className="text-lg font-black text-slate-900 font-mono">{formatPrice(selectedAmount)}</strong>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#FC5C03] hover:bg-[#E04F00] text-white text-xs sm:text-sm font-black rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Gift className="w-4 h-4" />
                  <span>{isSubmitting ? "তৈরি হচ্ছে..." : "এখনই গিফট কার্ড তৈরি করুন"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
