"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Zap, ShieldCheck, CheckCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface QuickActionChip {
  labelEn: string;
  labelBn: string;
  message: string;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

const QUICK_CHIPS: QuickActionChip[] = [
  {
    labelEn: "⚡ Buy ChatGPT Plus",
    labelBn: "⚡ চ্যাটজিপিটি প্লাস কিনুন",
    message: "Hello AI Haat! I want to buy ChatGPT Plus with instant delivery. Please share pricing and payment details.",
  },
  {
    labelEn: "🔑 Windows 11 Pro Key",
    labelBn: "🔑 উইন্ডোজ ১১ প্রো কী",
    message: "Hello AI Haat! I need a Windows 11 Pro Retail License Key. Is it available for instant delivery?",
  },
  {
    labelEn: "💳 bKash / Nagad Payment",
    labelBn: "💳 বিকাশ / নগদ পেমেন্ট",
    message: "Hello AI Haat! I want to make a payment via bKash / Nagad. Please guide me.",
  },
  {
    labelEn: "🛡️ Warranty & Order Help",
    labelBn: "🛡️ ওয়ারেন্টি ও অর্ডার সহায়তা",
    message: "Hello AI Haat Support! I have a question regarding my order / warranty.",
  },
];

export function FloatingWhatsAppWidget() {
  const pathname = usePathname();
  const isProductPage = pathname?.startsWith("/product/");
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close popup if user clicks outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!WHATSAPP_NUMBER || !mounted) return null;

  const openWhatsApp = (msgText: string) => {
    const encoded = encodeURIComponent(msgText.trim());
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
    setHasInteracted(true);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) {
      openWhatsApp(
        "Hello AI Haat, I want to inquire about your digital subscriptions / need assistance."
      );
    } else {
      openWhatsApp(customMessage);
    }
  };

  return (
    <div
      ref={popupRef}
      className={`fixed ${
        isProductPage ? "bottom-20" : "bottom-5 sm:bottom-6"
      } right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-none select-none font-sans`}
    >
      {/* ================= CHAT POPUP WINDOW ================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.92, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="pointer-events-auto w-[calc(100vw-32px)] max-w-[340px] sm:max-w-[360px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2),0_4px_20px_rgba(37,211,102,0.15)] border border-emerald-100 overflow-hidden mb-3.5"
          >
            {/* Header with WhatsApp Brand Colors */}
            <div className="bg-gradient-to-r from-[#075E54] to-[#128C7E] p-4 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar with Verified & Online Status */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shadow-inner">
                      <div className="w-full h-full rounded-full bg-[#25D366] flex items-center justify-center text-white">
                        <MessageCircle className="w-5 h-5 fill-current" />
                      </div>
                    </div>
                    {/* Pulsing Online Dot */}
                    <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#25D366] border-2 border-white" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm leading-tight text-white">
                        AI Haat Support
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    </div>
                    <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      {isBn ? "সরাসরি অনলাইন • ইনস্ট্যান্ট রিপ্লাই" : "Always Online • Instant Reply"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close WhatsApp chat"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-4 bg-[#ECE5DD]/40">
              {/* Automated Welcome Bubble */}
              <div className="bg-white rounded-2xl rounded-tl-sm p-3.5 shadow-sm border border-gray-100/80 text-gray-800 text-xs leading-relaxed mb-3">
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#075E54] mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{isBn ? "AI Haat কাস্টমার কেয়ার" : "AI Haat Customer Care"}</span>
                </div>
                <p>
                  {isBn
                    ? "আসসালামু আলাইকুম! ChatGPT, Windows কী বা যেকোনো সাবস্ক্রিপশন ইনস্ট্যান্ট ডেলিভারির জন্য আমাদের সাথে হোয়াটসঅ্যাপে সরাসরি চ্যাট করুন।"
                    : "Hello! Welcome to AI Haat. Need instant help with ChatGPT Plus, Windows keys, or payment via bKash/Nagad? Tap below to chat with us!"}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-400">
                  <span>Just now</span>
                  <CheckCheck className="w-3 h-3 text-[#34B7F1]" />
                </div>
              </div>

              {/* Quick Topic Chips */}
              <div className="space-y-1.5 mb-3">
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-1">
                  {isBn ? "দ্রুত প্রশ্ন বাছাই করুন:" : "Quick Questions:"}
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {QUICK_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => openWhatsApp(chip.message)}
                      className="w-full text-left px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-gray-200/80 hover:border-emerald-300 text-xs font-semibold text-gray-700 hover:text-[#075E54] transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <span className="truncate">{isBn ? chip.labelBn : chip.labelEn}</span>
                      <Send className="w-3 h-3 text-gray-400 group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input Message Form */}
              <form onSubmit={handleCustomSubmit} className="relative mt-2">
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={
                    isBn ? "আপনার মেসেজ লিখুন..." : "Type your message..."
                  }
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white rounded-full text-xs text-gray-900 placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 shadow-inner"
                />
                <button
                  type="submit"
                  aria-label="Send via WhatsApp"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center transition-transform active:scale-95 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </form>
            </div>

            {/* Footer Assurance */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-1 text-[11px] text-gray-500 font-medium">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>{isBn ? "গড় ডেলিভারি সময়: ৫-১৫ মিনিট" : "Avg. Delivery Time: 5-15 mins"}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= FLOATING ACTION BUTTON ================= */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Teaser Tooltip when Closed (before interaction) */}
        {!isOpen && !hasInteracted && (
          <motion.button
            type="button"
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="hidden sm:flex items-center gap-2 bg-white px-3.5 py-2 rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-emerald-100 hover:border-emerald-300 text-xs font-semibold text-gray-800 transition-all hover:scale-105"
          >
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
            <span>{isBn ? "সাহায্য প্রয়োজন? চ্যাট করুন" : "Need Help? Chat with us"}</span>
          </motion.button>
        )}

        {/* The Main Circular Green WhatsApp Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setHasInteracted(true);
          }}
          aria-label="Open WhatsApp live support"
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300"
        >
          {/* Pulsating Ping Ring */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />

          {/* Icon Toggle */}
          {isOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7 fill-white text-white" />
              {/* Notification Badge Dot */}
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                1
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
