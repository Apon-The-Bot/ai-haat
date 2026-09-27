"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Gift,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Key,
  Clock,
  Heart,
  Eye,
  EyeOff,
  MessageCircle,
  PartyPopper,
  ArrowRight,
  Bookmark,
  Share2,
} from "lucide-react";
import { GIFT_THEMES, GiftThemeConfig } from "@/lib/gifting/product-gifting";
import { GiftTheme } from "@/types";

interface DeliveredCredential {
  id: string;
  productName?: string;
  accountType?: string;
  licenseKey?: string | null;
  accountEmail?: string | null;
  accountPassword?: string | null;
  accessUrl?: string | null;
  credentialsText?: string | null;
  instructions?: string | null;
  additionalInfo?: string | null;
  warrantyExpiresAt?: string | null;
}

interface GiftItem {
  id: string;
  productId?: string | null;
  productName: string;
  variationName?: string | null;
  quantity: number;
  priceBDT?: number;
  image?: string | null;
}

export interface GiftClaimData {
  orderNumber: string;
  senderName: string;
  recipientName: string;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  giftMessage: string;
  giftTheme: GiftTheme;
  hidePriceOnGift: boolean;
  giftWrapOpened: boolean;
  giftOpenedAt?: string | null;
  createdAt: string;
  paymentStatus: string;
  deliveryStatus: string;
  isDelivered: boolean;
  items: GiftItem[];
  deliveredCredentials: DeliveredCredential[];
}

interface GiftClaimClientProps {
  initialGift: GiftClaimData;
  token: string;
}

export function GiftClaimClient({ initialGift, token }: GiftClaimClientProps) {
  const [gift, setGift] = useState<GiftClaimData>(initialGift);
  const [isUnwrapped, setIsUnwrapped] = useState<boolean>(initialGift.giftWrapOpened);
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const themeConfig: GiftThemeConfig = GIFT_THEMES[gift.giftTheme] || GIFT_THEMES.neon;

  const triggerConfettiExplosion = () => {
    // 1. Center blast
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#FC5C03", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"],
    });

    // 2. Side cannons
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 250);
  };

  const handleUnwrap = async () => {
    setIsOpening(true);
    triggerConfettiExplosion();

    // Mark as opened via API in background
    try {
      fetch(`/api/gift/claim/${token}`, { method: "POST" });
    } catch {
      // Ignore background network errors
    }

    setTimeout(() => {
      setIsUnwrapped(true);
      setIsOpening(false);
      // Extra celebratory burst
      triggerConfettiExplosion();
    }, 900);
  };

  const copyToClipboard = (text: string, keyId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const thankYouWhatsAppUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hey ${gift.senderName}! I just unwrapped your digital gift from AI Haat (${gift.items[0]?.productName || "Digital Product"}). Thank you so much! ❤️🎁`
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] py-8 sm:py-14 px-4 sm:px-6 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Decorative ambient background glowing circles */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-tr ${themeConfig.gradient} pointer-events-none`}
      />
      <div
        className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 bg-gradient-to-tr ${themeConfig.gradient} pointer-events-none`}
      />

      <div className="w-full max-w-xl mx-auto relative z-10">

        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-800 hover:text-[#FC5C03] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FC5C03] flex items-center justify-center text-white font-black text-xs shadow-xs">
              AI
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900">
              AI Haat Digital Gifting
            </span>
          </Link>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-white/80 border border-slate-200/80 shadow-2xs text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>১০০% অফিসিয়াল ডিজিটাল ডেলিভারি</span>
          </span>
        </div>

        {/* Main Interactive Stage Card */}
        <AnimatePresence mode="wait">
          {!isUnwrapped ? (
            /* ================= STAGE 1: WRAPPED MYSTERY BOX ================= */
            <motion.div
              key="wrapped-stage"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20, transition: { duration: 0.3 } }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden"
            >
              {/* Top Accent Gradient Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${themeConfig.gradient}`}
              />

              {/* Theme Badge */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 mb-6">
                <span>{themeConfig.emoji}</span>
                <span>{themeConfig.nameBn}</span>
              </div>

              {/* 3D-Styled Wrapped Gift Box Illustration */}
              <div className="relative my-4 flex items-center justify-center">
                <motion.div
                  animate={
                    isOpening
                      ? { rotate: [0, -10, 10, -15, 15, 0], scale: [1, 1.1, 1.25] }
                      : { y: [0, -6, 0] }
                  }
                  transition={
                    isOpening
                      ? { duration: 0.8, ease: "easeInOut" }
                      : { repeat: Infinity, duration: 3, ease: "easeInOut" }
                  }
                  className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl p-1 flex items-center justify-center shadow-xl cursor-pointer"
                  onClick={handleUnwrap}
                >
                  {/* Outer Gift Container */}
                  <div
                    className={`w-full h-full rounded-3xl bg-gradient-to-tr ${themeConfig.gradient} p-1 shadow-inner relative flex items-center justify-center`}
                  >
                    {/* Vertical Ribbon */}
                    <div className="absolute top-0 bottom-0 w-8 bg-white/30 backdrop-blur-xs border-x border-white/40" />
                    {/* Horizontal Ribbon */}
                    <div className="absolute left-0 right-0 h-8 bg-white/30 backdrop-blur-xs border-y border-white/40" />

                    {/* Ribbon Bow on Top */}
                    <div className="absolute -top-3 w-14 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center border border-white">
                      <span className="text-xl">🎀</span>
                    </div>

                    {/* Big Center Icon */}
                    <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/95 shadow-md flex items-center justify-center">
                      <Gift className="w-10 h-10 text-[#FC5C03] animate-pulse" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Greeting Announcement */}
              <div className="space-y-2 mt-6">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  🎉 আপনার জন্য একটি বিশেষ উপহার এসেছে!
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                  প্রিয় <strong className="text-slate-900 font-bold">{gift.recipientName}</strong>,
                  আপনাকে একটি ডিজিটাল সারপ্রাইজ উপহার পাঠিয়েছেন{" "}
                  <strong className="text-[#FC5C03] font-bold">{gift.senderName}</strong>!
                </p>
              </div>

              {/* Action Button: Unwrap */}
              <div className="mt-8">
                <button
                  type="button"
                  disabled={isOpening}
                  onClick={handleUnwrap}
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2.5 mx-auto cursor-pointer ${
                    isOpening
                      ? "bg-slate-400 cursor-wait"
                      : "bg-[#FC5C03] hover:bg-[#E04F00] hover:scale-105 active:scale-95 shadow-[#FC5C03]/30"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{isOpening ? "আনবক্স হচ্ছে..." : "🎁 উপহারটি খুলুন (Tap to Unwrap)"}</span>
                </button>
                <p className="text-[11px] text-slate-400 mt-2">
                  ট্যাপ করলে লাইসেন্স কী ও অ্যাক্টিভেশন ক্রেডেনশিয়াল আনলক হবে
                </p>
              </div>
            </motion.div>
          ) : (
            /* ================= STAGE 2: UNWRAPPED REVEALED GIFT ================= */
            <motion.div
              key="unwrapped-stage"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="space-y-4"
            >
              {/* 1. Personalized Greeting Message Card */}
              <div className={`rounded-3xl p-6 sm:p-7 shadow-xl border border-white/20 relative overflow-hidden ${themeConfig.cardBg}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{themeConfig.emoji}</span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold opacity-90">
                        {gift.senderName} এর পক্ষ থেকে বিশেষ বার্তা
                      </h3>
                      <p className="text-[10px] opacity-75">
                        প্রেরণ করা হয়েছে: {new Date(gift.createdAt).toLocaleDateString("bn-BD", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs">
                    Gift Card
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 my-2">
                  <p className="text-xs sm:text-sm font-medium leading-relaxed italic">
                    "{gift.giftMessage}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] opacity-80 pt-2">
                  <span>প্রাপক: <strong>{gift.recipientName}</strong></span>
                  <span>প্রেরক: <strong>{gift.senderName}</strong></span>
                </div>
              </div>

              {/* 2. Gifted Product Details Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#FC5C03]" />
                    <span>উপহারপ্রাপ্ত প্রোডাক্টসমূহ ({gift.items.length})</span>
                  </h4>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      gift.isDelivered
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>{gift.isDelivered ? "ইনস্ট্যান্ট ডেলিভারি সক্রিয়" : "প্রস্তুত হচ্ছে..."}</span>
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  {gift.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Gift className="w-6 h-6 text-[#FC5C03]" />
                          )}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {item.productName}
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            প্যাকেজ: {item.variationName || "অফিসিয়াল সংস্করণ"} • পরিমাণ: {item.quantity}
                          </p>
                        </div>
                      </div>

                      {!gift.hidePriceOnGift && item.priceBDT !== undefined && (
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-slate-900">
                            ৳{item.priceBDT}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 3. Digital Delivery Vault (Credentials & Activation) */}
                <div className="pt-2">
                  {gift.isDelivered && gift.deliveredCredentials.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-[#FC5C03]" />
                          <span>ডিজিটাল লাইসেন্স কী / অ্যাকাউন্ট ডিটেইলস</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ১-ক্লিকে কপি করুন
                        </span>
                      </div>

                      {gift.deliveredCredentials.map((cred, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-4 rounded-2xl bg-slate-950 text-white space-y-3 shadow-md border border-slate-800"
                        >
                          {/* Product header if present */}
                          {cred.productName && (
                            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                              <span className="font-bold text-white">{cred.productName}</span>
                              {cred.accountType && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                                  {cred.accountType}
                                </span>
                              )}
                            </div>
                          )}

                          {/* License Key */}
                          {cred.licenseKey && (
                            <div>
                              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                                <span>অ্যাক্টিভেশন লাইসেন্স কী:</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(cred.licenseKey || "", `key_${cred.id}`)}
                                  className="text-[#FC5C03] hover:text-orange-400 flex items-center gap-1 font-bold cursor-pointer"
                                >
                                  {copiedKey === `key_${cred.id}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">কপি হয়েছে!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>কপি</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="font-mono text-xs sm:text-sm bg-slate-900 px-3 py-2 rounded-xl text-emerald-400 border border-slate-800 select-all break-all">
                                {cred.licenseKey}
                              </div>
                            </div>
                          )}

                          {/* Email & Password */}
                          {cred.accountEmail && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              <div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                  <span>লগইন ইমেইল:</span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(cred.accountEmail || "", `email_${cred.id}`)}
                                    className="text-xs text-[#FC5C03] cursor-pointer"
                                  >
                                    {copiedKey === `email_${cred.id}` ? "✓" : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                                <div className="font-mono text-xs bg-slate-900 px-3 py-1.5 rounded-lg text-slate-200 select-all truncate border border-slate-800">
                                  {cred.accountEmail}
                                </div>
                              </div>

                              {cred.accountPassword && (
                                <div>
                                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                                    <span>পাসওয়ার্ড:</span>
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility(cred.id)}
                                        className="text-slate-400 hover:text-white cursor-pointer"
                                      >
                                        {showPassword[cred.id] ? (
                                          <EyeOff className="w-3 h-3" />
                                        ) : (
                                          <Eye className="w-3 h-3" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(cred.accountPassword || "", `pass_${cred.id}`)}
                                        className="text-xs text-[#FC5C03] cursor-pointer"
                                      >
                                        {copiedKey === `pass_${cred.id}` ? "✓" : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="font-mono text-xs bg-slate-900 px-3 py-1.5 rounded-lg text-amber-300 select-all border border-slate-800">
                                    {showPassword[cred.id]
                                      ? cred.accountPassword
                                      : "••••••••••••"}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Fallback raw credentials text */}
                          {!cred.licenseKey && !cred.accountEmail && cred.credentialsText && (
                            <div>
                              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                                <span>অ্যাক্সেস তথ্য / ক্রেডেনশিয়ালস:</span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(cred.credentialsText || "", `cred_${cred.id}`)}
                                  className="text-[#FC5C03] hover:text-orange-400 flex items-center gap-1 font-bold cursor-pointer"
                                >
                                  {copiedKey === `cred_${cred.id}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">কপি হয়েছে!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>কপি</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="font-mono text-xs bg-slate-900 p-3 rounded-xl text-emerald-400 border border-slate-800 select-all whitespace-pre-wrap break-all">
                                {cred.credentialsText}
                              </pre>
                            </div>
                          )}

                          {/* Access URL */}
                          {cred.accessUrl && (
                            <div className="pt-1">
                              <a
                                href={cred.accessUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 underline"
                              >
                                <span>অফিশিয়াল পোর্টালে লগইন করুন</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}

                          {/* Extra info / Instructions */}
                          {(cred.instructions || cred.additionalInfo) && (
                            <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
                              💡 <strong>নির্দেশনা:</strong> {cred.instructions || cred.additionalInfo}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Still processing placeholder */
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center space-y-2">
                      <Clock className="w-6 h-6 text-amber-600 mx-auto animate-spin" />
                      <h5 className="text-xs font-bold text-amber-900">
                        ডিজিটাল ভল্ট প্রস্তুত হচ্ছে...
                      </h5>
                      <p className="text-[11px] text-amber-700 leading-relaxed max-w-sm mx-auto">
                        আপনার উপহারের ডিজিটাল অ্যাক্সেস প্রস্তুত হচ্ছে। কিছুক্ষণের মধ্যে পেজটি অটো রিফ্রেশ হবে এবং লাইসেন্স কী শো করবে।
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Action Buttons (Thank You & Explore) */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
                  <a
                    href={thankYouWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{gift.senderName} কে ধন্যবাদ পাঠান</span>
                  </a>

                  <Link
                    href="/shop"
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <span>অন্যান্য প্রোডাক্ট দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Permanent Link Advice Banner */}
              <div className="text-center text-[11px] text-slate-500 py-2">
                <span>📌 এই গিফট লিঙ্কটি নিরাপদ রাখুন। পরবর্তীতে যেকোনো সময় এখানে এসে আপনার অ্যাক্সেস দেখতে পারবেন।</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
export default GiftClaimClient;
