"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { X, ShieldCheck, Zap, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

export function AuthModal() {
  const router = useRouter();
  const { isAuthModalOpen, setIsAuthModalOpen, login, redirectCallbackUrl } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Body scroll lock on mobile
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const targetUrl = redirectCallbackUrl || "/";

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signIn("google", { callbackUrl: targetUrl });
    } catch (err) {
      console.error("Google login redirect:", err);
      setErrorMsg("Failed to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end md:items-center justify-center md:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full h-[100dvh] md:h-auto max-w-none md:max-w-md bg-white md:rounded-3xl shadow-2xl md:border md:border-[#E8E8EE] overflow-hidden flex flex-col animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        
        {/* Top Banner with Close Button */}
        <div className="bg-[#1A1D26] px-6 pt-[max(env(safe-area-inset-top,1.5rem),1.5rem)] pb-6 md:p-6 text-white text-center relative border-b border-gray-800 shrink-0">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute right-4 w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            style={{ top: 'max(env(safe-area-inset-top,1rem),1rem)' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-block bg-white px-3.5 py-1.5 rounded-full mb-3 shadow-sm mt-2 md:mt-0">
            <Logo size="sm" showSubtitle={false} />
          </div>

          <h3 className="text-xl sm:text-xl font-black text-white">
            AI Haat-এ স্বাগতম
          </h3>
          <p className="text-xs text-gray-300 mt-1.5 max-w-xs mx-auto">
            আপনার অর্ডার, ডিজিটাল ভল্ট এবং ওয়ালেট ম্যানেজ করতে গুগল দিয়ে প্রবেশ করুন
          </p>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 flex flex-col justify-center md:justify-start pb-[max(env(safe-area-inset-bottom,1.5rem),1.5rem)] md:pb-7">
          
          {errorMsg && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          {/* Prominent Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full min-h-[48px] py-3.5 px-4 bg-white hover:bg-gray-50 active:scale-[0.98] border-2 border-gray-200 hover:border-gray-400 text-gray-800 text-[15px] sm:text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-3 group cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#FC5C03] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Google দিয়ে সরাসরি সাইন ইন / সাইন আপ</span>
          </button>

          {/* Value Highlights */}
          <div className="bg-gray-50 rounded-2xl p-4 md:p-5 border border-gray-100 space-y-3">
            <div className="flex items-start gap-3 text-[13px] md:text-xs text-gray-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>১-ক্লিকে ইনস্ট্যান্ট লগইন, পাসওয়ার্ড মনে রাখার ঝামেলা নেই</span>
            </div>
            <div className="flex items-start gap-3 text-[13px] md:text-xs text-gray-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ডিজিটাল ভল্ট থেকে লাইসেন্স কি ও ক্রেডেনশিয়াল সংগ্রহ</span>
            </div>
            <div className="flex items-start gap-3 text-[13px] md:text-xs text-gray-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>ওয়ালেট ব্যালেন্স দিয়ে ৫ সেকেন্ডে অর্ডার সম্পন্ন</span>
            </div>
          </div>

          <div className="flex-1 md:hidden"></div>

          {/* Security & Privacy Footer */}
          <div className="pt-4 md:pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] md:text-[11px] text-[#7A8190] text-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>গুগল অথেন্টিকেশন দ্বারা সুরক্ষিত ও এনক্রিপ্টেড</span>
          </div>

        </div>

      </div>
    </div>
  );
}
