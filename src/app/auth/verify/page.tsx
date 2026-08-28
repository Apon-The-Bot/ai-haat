"use client";

import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = (searchParams?.get("callbackUrl") as string) || "/dashboard";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    // Keep only the last character if multiple are entered
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError(null);

    // Auto-advance
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      // Move back on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    
    if (pastedData) {
      const newDigits = [...digits];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) newDigits[i] = pastedData[i];
      }
      setDigits(newDigits);
      
      // Focus the next empty input, or the last one
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const token = digits.join("");
    if (token.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/security/totp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(callbackUrl);
      } else {
        setError(data.error || "Verification failed");
        if (res.status === 429) {
          setError("Too many attempts. Please try again later.");
        }
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 p-3 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8E8EE] shadow-2xs p-5 sm:p-8">
        <div className="flex justify-center mb-6 sm:mb-8">
          <Logo size="lg" />
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-[#1A1D26] mb-2">
            Two-Step Verification
            <br />
            <span className="text-lg sm:text-xl">টু-স্টেপ ভেরিফিকেশন</span>
          </h1>
          <p className="text-[#4B5563] text-xs sm:text-sm">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-600 text-xs sm:text-sm font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-1.5 sm:gap-3" dir="ltr">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={loading}
                className={`w-9.5 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-xl border-2 transition-all outline-none ${
                  error 
                    ? "border-red-300 focus:border-red-500 bg-red-50" 
                    : "border-[#E8E8EE] focus:border-[#FC5C03] bg-white"
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || digits.join("").length !== 6}
            className="w-full py-3 px-4 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Verify Code"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href={`/auth/verify/recovery?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="text-sm font-semibold text-[#7A8190] hover:text-[#1A1D26] transition-colors"
          >
            Use Recovery Code / রিকাভারি কোড ব্যবহার করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
