"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Mail, ArrowRight, Loader2, Info } from "lucide-react";
import { Logo } from "@/components/Logo";

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const emailParam = (searchParams?.get("email") as string) || "";

  const [email, setEmail] = useState(emailParam);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setUnsubscribed(true);
    } catch {
      setUnsubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-2xs text-center space-y-6">
      <div className="flex justify-center">
        <Logo size="lg" />
      </div>

      {unsubscribed ? (
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Successfully Unsubscribed</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong>{email}</strong> has been removed from AI Haat&apos;s promotional marketing broadcast list.
          </p>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500 text-left flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Important transactional emails (e.g. your purchased digital credentials, receipt confirmations) will still be delivered safely to your inbox.
            </span>
          </div>

          <div className="pt-2">
            <Link
              href="/shop"
              className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
            >
              <span>Return to AI Haat Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUnsubscribe} className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FC5C03] flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Unsubscribe from Marketing</h1>
            <p className="text-xs text-slate-500 mt-1">
              Opt out of promotional newsletters, flash sales, and discount emails.
            </p>
          </div>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@gmail.com"
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#FC5C03] font-mono text-center"
          />

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm 1-Click Unsubscribe"}
          </button>
        </form>
      )}
    </div>
  );
}

export function UnsubscribeClient() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs font-bold text-slate-400">Loading...</div>}>
        <UnsubscribeForm />
      </Suspense>
    </div>
  );
}