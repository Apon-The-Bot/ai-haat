"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, X, Tag, ArrowRight, Clock } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";

const SESSION_STORAGE_KEY = "aihaat_hide_offer_bar_v1";
const PROMO_CODE = "AIHAAT10";

export function FloatingOfferBar() {
  const { showToast } = useToast();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const isDismissed = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!isDismissed) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setIsCopied(true);
      showToast(
        isBn
          ? `কুপন কোড "${PROMO_CODE}" সফলভাবে কপি হয়েছে! (১০% ছাড়)`
          : `Coupon code "${PROMO_CODE}" copied to clipboard! (10% OFF)`,
        "success"
      );
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch {
      // Fallback
      showToast(
        isBn
          ? `কুপন কোড: ${PROMO_CODE}`
          : `Coupon code: ${PROMO_CODE}`,
        "info"
      );
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          aria-label="Promotional banner"
          className="relative z-50 overflow-hidden bg-gradient-to-r from-[#15171E] via-[#2A1710] to-[#15171E] text-white border-b border-[#FC5C03]/30 shadow-md"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(252,92,3,0.18),transparent_70%)] pointer-events-none" />

          <div className="max-w-[1500px] mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 relative z-10 text-xs">
            
            {/* Left/Center Promotional Messaging */}
            <div className="flex-1 flex items-center justify-center sm:justify-start flex-wrap gap-x-2.5 gap-y-1">
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FC5C03] text-white font-black text-[10px] tracking-wider uppercase shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-200 animate-spin-slow" />
                {isBn ? "স্পেশাল অফার" : "FLASH SALE"}
              </span>

              {/* Offer Text */}
              <p className="font-medium text-gray-200 text-[11px] sm:text-xs">
                {isBn ? (
                  <span>
                    যেকোনো ডিজিটাল প্রোডাক্টে <strong className="text-white font-bold underline decoration-[#FC5C03]">১০% ছাড়</strong> পেতে কোড ব্যবহার করুন:
                  </span>
                ) : (
                  <span>
                    Get <strong className="text-white font-bold underline decoration-[#FC5C03]">10% OFF</strong> on all AI & software subscriptions with code:
                  </span>
                )}
              </p>

              {/* Interactive Coupon Pill Button */}
              <button
                type="button"
                onClick={handleCopyCode}
                title="Click to copy coupon code"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#FC5C03]/25 border border-white/20 hover:border-[#FC5C03] text-white font-mono font-bold text-xs tracking-wider transition-all transform active:scale-95 group shadow-inner"
              >
                <Tag className="w-3 h-3 text-[#FC5C03] group-hover:rotate-12 transition-transform" />
                <span>{PROMO_CODE}</span>
                {isCopied ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-sans font-semibold ml-1">
                    <Check className="w-3 h-3" />
                    {isBn ? "কপিকৃত!" : "COPIED!"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-300 group-hover:text-white font-sans font-medium ml-1">
                    <Copy className="w-3 h-3" />
                    <span className="hidden xs:inline">{isBn ? "কপি" : "Copy"}</span>
                  </span>
                )}
              </button>
            </div>

            {/* Right Side: Trust Badge & Dismiss Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-emerald-300 border border-emerald-400/30">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>{isBn ? "অফিসিয়াল ডিসকাউন্ট" : "Verified Coupon"}</span>
              </span>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close promotional banner"
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
