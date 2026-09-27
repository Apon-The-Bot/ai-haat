"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Gift,
  Sparkles,
  Check,
  Copy,
  X,
  MessageCircle,
  ExternalLink,
  Flame,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useCurrency } from "@/context/CurrencyContext";

interface ShareToEarnBannerProps {
  productName: string;
  productSlug: string;
  onApplyCoupon?: (code: string) => void;
  compact?: boolean;
}

export function ShareToEarnBanner({
  productName,
  productSlug,
  onApplyCoupon,
  compact = false,
}: ShareToEarnBannerProps) {
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  const couponCode = "SHARE30";
  const discountAmount = 30;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aihaat_share30_unlocked");
      if (stored === "true") {
        setIsUnlocked(true);
      }
    }
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://aihaat.shop";
  const productUrl = `${origin}/product/${productSlug}`;

  const triggerUnlock = async () => {
    setIsUnlocked(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("aihaat_share30_unlocked", "true");
    }

    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch {
      // SSR-safe fallback
    }

    showToast("🎉 অভিনন্দন! ৳৩০ ডিসকাউন্ট কোড আনলক হয়েছে!", "success");
  };

  const handleShareClick = (platform: "whatsapp" | "facebook" | "telegram" | "copy") => {
    const text = `Hey! AI Haat-এ দারুণ এই এআই টুলটি পেলাম: ${productName} 🔥\nচেক করুন: ${productUrl}`;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, "_blank");
    } else if (platform === "telegram") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(text)}`, "_blank");
    } else if (platform === "copy") {
      try {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(productUrl);
        } else {
          const textarea = document.createElement("textarea");
          textarea.value = productUrl;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
        showToast("প্রোডাক্ট লিঙ্ক কপি করা হয়েছে!", "success");
      } catch {
        showToast(productUrl, "info");
      }
    }

    // Trigger instant reward unlock
    triggerUnlock();
  };

  const handleCopyCode = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(couponCode);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = couponCode;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("কুপন কোড 'SHARE30' কপি করা হয়েছে!", "success");
    } catch {
      showToast(couponCode, "info");
    }

    if (onApplyCoupon) {
      onApplyCoupon(couponCode);
    }
  };

  return (
    <>
      {/* ─── BANNER CONTAINER ─── */}
      <div
        className={`rounded-2xl border transition-all ${
          isUnlocked
            ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-emerald-200 p-3 sm:p-4 shadow-2xs"
            : "bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border-purple-200 p-3 sm:p-4 shadow-2xs"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                isUnlocked
                  ? "bg-emerald-600 text-white"
                  : "bg-gradient-to-tr from-purple-600 to-pink-500 text-white"
              }`}
            >
              {isUnlocked ? <Check className="w-5 h-5" /> : <Gift className="w-5 h-5" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  {isUnlocked
                    ? `৳${discountAmount} ছাড় সক্রিয় হয়েছে!`
                    : `বন্ধুদের সাথে শেয়ার করে ৳${discountAmount} ছাড় আনলক করুন!`}
                </span>
                <span
                  className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    isUnlocked
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-purple-100 text-purple-800 border border-purple-200"
                  }`}
                >
                  {isUnlocked ? "UNLOCKED" : "SHARE & SAVE"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {isUnlocked
                  ? `চেকআউটে '${couponCode}' ব্যবহারে ৳${discountAmount} ছাড় পাবেন।`
                  : "হোয়াটসঅ্যাপ বা ফেসবুকে ১-ক্লিকে শেয়ার করলেই ইনস্ট্যান্ট ডিসকাউন্ট।"
                }
              </p>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="shrink-0">
            {isUnlocked ? (
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "কপি হয়েছে!" : `কুপন: ${couponCode}`}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>ছাড় আনলক</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── INTERACTIVE SHARE & UNLOCK MODAL ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 relative">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2 text-center pt-2">
              <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-pink-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                বন্ধুদের সাথে শেয়ার করে ৳{discountAmount} ছাড় পান!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                যেকোনো সোশ্যাল মিডিয়া বা বন্ধুদের চ্যাটে এই প্রোডাক্টের লিংক শেয়ার করলেই সাথে সাথে কুপন কোড আনলক হবে।
              </p>
            </div>

            {/* Product Summary Box */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FC5C03] font-bold flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="text-xs font-bold text-slate-900 truncate block">
                  {productName}
                </strong>
                <span className="text-[11px] text-slate-500 truncate block font-mono">
                  {productUrl}
                </span>
              </div>
            </div>

            {/* Social Share Buttons Grid */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleShareClick("whatsapp")}
                className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp-এ শেয়ার করুন ও ছাড় নিন</span>
              </button>

              <button
                type="button"
                onClick={() => handleShareClick("facebook")}
                className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Facebook-এ শেয়ার করুন</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleShareClick("telegram")}
                  className="py-2.5 px-3 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/20 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Telegram</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleShareClick("copy")}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>লিঙ্ক কপি করুন</span>
                </button>
              </div>
            </div>

            {/* Unlocked Reward State (If already clicked) */}
            {isUnlocked && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2 animate-in fade-in">
                <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>কুপন আনলক সম্পন্ন হয়েছে!</span>
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-3 py-1 bg-white font-mono font-black text-sm text-emerald-700 rounded-lg border border-emerald-300">
                    {couponCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? "কপি হয়েছে!" : "কপি"}
                  </button>
                </div>
              </div>
            )}

            <p className="text-[10px] text-center text-slate-400">
              *সর্বনিম্ন ১০০ টাকার অর্ডারে এই ৩০ টাকা ছাড় প্রযোজ্য।
            </p>
          </div>
        </div>
      )}
    </>
  );
}
