"use client";

import React, { useState } from "react";
import { Gift, Sparkles, Heart, EyeOff, Check, PartyPopper, User, Mail, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GIFT_THEMES, QUICK_GREETINGS, GiftThemeConfig } from "@/lib/gifting/product-gifting";
import { GiftTheme } from "@/types";

export interface GiftFormData {
  isGift: boolean;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  giftMessage: string;
  giftTheme: GiftTheme;
  hidePriceOnGift: boolean;
}

interface DigitalGiftingSectionProps {
  formData: GiftFormData;
  onChange: (updates: Partial<GiftFormData>) => void;
  compact?: boolean;
}

export function DigitalGiftingSection({
  formData,
  onChange,
  compact = false,
}: DigitalGiftingSectionProps) {
  const [isOpen, setIsOpen] = useState<boolean>(formData.isGift);

  const handleToggle = (checked: boolean) => {
    setIsOpen(checked);
    onChange({ isGift: checked });
  };

  const themesList = Object.values(GIFT_THEMES) as GiftThemeConfig[];

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        formData.isGift
          ? "border-[#FC5C03]/50 bg-gradient-to-b from-[#FFF7ED] via-white to-white shadow-md shadow-[#FC5C03]/5"
          : "border-slate-200/80 bg-white hover:border-slate-300"
      }`}
    >
      {/* Header / Toggle Row */}
      <div
        onClick={() => handleToggle(!formData.isGift)}
        className="flex items-center justify-between p-4 sm:p-4.5 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              formData.isGift
                ? "bg-[#FC5C03] text-white shadow-sm shadow-[#FC5C03]/30 scale-105"
                : "bg-orange-50 text-[#FC5C03]"
            }`}
          >
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                বন্ধুকে ডিজিটাল উপহার হিসেবে পাঠান
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#FC5C03]">
                Gift
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              প্রাপক পাবেন ইন্টারেক্টিভ সারপ্রাইজ গিফট কার্ড ও আনবক্সিং লিঙ্ক 🎁
            </p>
          </div>
        </div>

        {/* Custom Toggle Switch */}
        <label
          htmlFor="gift-mode-toggle"
          onClick={(e) => e.stopPropagation()}
          className="relative inline-flex items-center cursor-pointer shrink-0 ml-2"
        >
          <input
            id="gift-mode-toggle"
            type="checkbox"
            checked={formData.isGift}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FC5C03]"></div>
        </label>
      </div>

      {/* Expanded Gift Form Details */}
      <AnimatePresence>
        {formData.isGift && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-orange-100/70 space-y-4">
              
              {/* Recipient Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                
                {/* Recipient Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#FC5C03]" />
                    <span>বন্ধুর নাম (Recipient Name) *</span>
                  </label>
                  <input
                    type="text"
                    required={formData.isGift}
                    value={formData.recipientName}
                    onChange={(e) => onChange({ recipientName: e.target.value })}
                    placeholder="উদা: Sakib Rahman"
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FC5C03] focus:ring-2 focus:ring-[#FC5C03]/10 outline-none transition-all"
                  />
                </div>

                {/* Recipient Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#FC5C03]" />
                    <span>বন্ধুর ইমেইল (Recipient Email)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) => onChange({ recipientEmail: e.target.value })}
                    placeholder="friend@gmail.com"
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FC5C03] focus:ring-2 focus:ring-[#FC5C03]/10 outline-none transition-all"
                  />
                </div>

                {/* Recipient Phone / WhatsApp */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#FC5C03]" />
                    <span>হোয়াটসঅ্যাপ নম্বর (WhatsApp for Instant Gift Link)</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.recipientPhone}
                    onChange={(e) => onChange({ recipientPhone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#FC5C03] focus:ring-2 focus:ring-[#FC5C03]/10 outline-none transition-all"
                  />
                </div>

              </div>

              {/* Theme Picker */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>ডিজিটাল গিফট কার্ড থিম নির্বাচন করুন:</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {themesList.map((theme) => {
                    const isSelected = formData.giftTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => onChange({ giftTheme: theme.id })}
                        className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? "border-[#FC5C03] ring-2 ring-[#FC5C03]/20 bg-white shadow-xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-base">{theme.emoji}</span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-[#FC5C03] text-white flex items-center justify-center text-[10px]">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div
                          className={`h-1.5 w-full rounded-full bg-gradient-to-r ${theme.gradient} mb-1.5`}
                        />
                        <span className="text-[10px] font-bold text-slate-800 line-clamp-1">
                          {theme.nameBn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Greeting Templates */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>শুভেচ্ছা বার্তা (১-ক্লিকে টেমপ্লেট নির্বাচন করুন):</span>
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {QUICK_GREETINGS.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onChange({ giftMessage: q.message })}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-[#FC5C03] hover:text-[#FC5C03] hover:bg-orange-50/50 transition-colors cursor-pointer"
                    >
                      {q.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Greeting Message Box */}
              <div>
                <textarea
                  rows={compact ? 2 : 3}
                  maxLength={300}
                  value={formData.giftMessage}
                  onChange={(e) => onChange({ giftMessage: e.target.value })}
                  placeholder="বন্ধুর জন্য একটি সুন্দর উইশিং মেসেজ লিখুন... (ঐচ্ছিক)"
                  className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 focus:border-[#FC5C03] focus:ring-2 focus:ring-[#FC5C03]/10 outline-none transition-all resize-none"
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>প্রাপক আনবক্স করার সময় এই কার্ডটি দেখতে পাবেন</span>
                  <span>{formData.giftMessage.length}/300</span>
                </div>
              </div>

              {/* Hide Price Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/60 border border-orange-100">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      উপহার গ্রহীতার থেকে মূল্য গোপন রাখুন
                    </span>
                    <p className="text-[10px] text-slate-500">
                      বন্ধুর গিফট ভিউ কার্ডে টাকার অঙ্ক শো করবে না
                    </p>
                  </div>
                </div>

                <label htmlFor="hide-price-toggle" className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="hide-price-toggle"
                    type="checkbox"
                    checked={formData.hidePriceOnGift}
                    onChange={(e) => onChange({ hidePriceOnGift: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default DigitalGiftingSection;
