"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Bell, Shield, ArrowLeft, Save, Loader2, CheckCircle2, Info } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function CustomerPreferencesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [promotionalConsent, setPromotionalConsent] = useState(true);
  const [productUpdateConsent, setProductUpdateConsent] = useState(true);
  const [newsletterConsent, setNewsletterConsent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      try {
        setLoading(true);
        const res = await fetch("/api/user/preferences");
        if (res.ok) {
          const data = await res.json();
          if (data.preferences) {
            setPromotionalConsent(data.preferences.promotionalConsent ?? true);
            setProductUpdateConsent(data.preferences.productUpdateConsent ?? true);
            setNewsletterConsent(data.preferences.newsletterConsent ?? true);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadPreferences();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promotionalConsent,
          productUpdateConsent,
          newsletterConsent,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Your email preferences have been updated successfully!", "success");
      } else {
        showToast(data.error || "Failed to update preferences", "error");
      }
    } catch {
      showToast("Network error updating preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[850px] mx-auto pb-16">
      
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Email &amp; Communication Preferences</h1>
          <p className="text-xs text-slate-500">
            Control which promotional emails and announcements you receive for {user?.email || "your account"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
        
        {/* ESSENTIAL TRANSACTIONAL NOTICE */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <strong className="text-emerald-900 font-bold block">Digital Order &amp; Delivery Emails (Always Active)</strong>
            <p className="text-emerald-700 leading-relaxed">
              Order confirmation, digital access keys, account credentials, and receipts are critical service messages delivered directly to ensure your purchases function properly.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Marketing &amp; Discovery Channels</h3>

          {/* Promotional */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <strong className="text-sm font-bold text-slate-900 block">Promotional Offers &amp; Discounts</strong>
              <p className="text-xs text-slate-500 mt-0.5">Receive exclusive discount coupons and seasonal flash offers from offers@aihaat.shop.</p>
            </div>
            <input
              type="checkbox"
              checked={promotionalConsent}
              onChange={(e) => setPromotionalConsent(e.target.checked)}
              className="w-5 h-5 accent-[#FC5C03] rounded-md cursor-pointer mt-1"
            />
          </div>

          {/* Product Updates */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <strong className="text-sm font-bold text-slate-900 block">Product Updates &amp; Restock Alerts</strong>
              <p className="text-xs text-slate-500 mt-0.5">Get notified when new AI tools or high-demand subscription stocks become available.</p>
            </div>
            <input
              type="checkbox"
              checked={productUpdateConsent}
              onChange={(e) => setProductUpdateConsent(e.target.checked)}
              className="w-5 h-5 accent-[#FC5C03] rounded-md cursor-pointer mt-1"
            />
          </div>

          {/* Weekly Digest */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <strong className="text-sm font-bold text-slate-900 block">Weekly AI Haat Digest</strong>
              <p className="text-xs text-slate-500 mt-0.5">Weekly curated recommendations, tool comparisons, and tech updates.</p>
            </div>
            <input
              type="checkbox"
              checked={newsletterConsent}
              onChange={(e) => setNewsletterConsent(e.target.checked)}
              className="w-5 h-5 accent-[#FC5C03] rounded-md cursor-pointer mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving || loading}
            className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Preferences</span>
          </button>
        </div>

      </form>
    </div>
  );
}