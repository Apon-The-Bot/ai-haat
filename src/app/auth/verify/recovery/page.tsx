"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function RecoveryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const callbackUrl = (searchParams?.get("callbackUrl") as string) || "/dashboard";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError("Please enter a recovery code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/security/recovery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("TOTP disabled. Please re-enroll from settings.", "success");
        router.push(callbackUrl);
      } else {
        setError(data.error || "Invalid recovery code");
        setCode("");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8E8EE] shadow-2xs p-8">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-[#1A1D26] mb-2">
            Recovery Code
            <br />
            <span className="text-xl">রিকাভারি কোড</span>
          </h1>
          <p className="text-[#4B5563] text-sm">
            Enter one of your saved recovery codes
          </p>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-yellow-800 leading-relaxed">
            রিকাভারি কোড ব্যবহার করলে আপনার TOTP নিষ্ক্রিয় হয়ে যাবে। পুনরায় সেটআপ করতে হবে। 
            (Using a recovery code will disable your current TOTP. You will need to set it up again.)
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-600 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              disabled={loading}
              className={`w-full px-4 py-3 text-center text-lg font-bold rounded-xl border-2 outline-none transition-colors ${
                error 
                  ? "border-red-300 focus:border-red-500 bg-red-50" 
                  : "border-[#E8E8EE] focus:border-[#FC5C03] bg-white"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3 px-4 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Use Recovery Code"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href={`/auth/verify?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="text-sm font-semibold text-[#7A8190] hover:text-[#1A1D26] transition-colors"
          >
            Back to TOTP / ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
