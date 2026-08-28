"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles, Eye, FileCode } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function NewTemplatePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("PROMOTIONAL");
  const [subject, setSubject] = useState("");
  const [contentHtml, setContentHtml] = useState(`<h2>Special Offer from AI Haat!</h2>
<p>Hello {{first_name}},</p>
<p>We are excited to bring you our latest digital tool updates and exclusive discounts.</p>
<p style="text-align: center; margin: 30px 0;">
  <a href="{{site_url}}" style="background-color: #FC5C03; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px; display: inline-block;">
    Explore All Tools
  </a>
</p>`);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contentHtml.trim()) {
      showToast("Name and HTML content are required", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/email-marketing/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          subject: subject.trim() || null,
          contentHtml,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Template saved successfully!", "success");
        router.push("/admin/email-marketing/templates");
      } else {
        showToast(data.error || "Failed to save template", "error");
      }
    } catch {
      showToast("Network error saving template", "error");
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (varCode: string) => {
    setContentHtml((prev) => prev + ` ${varCode} `);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/email-marketing/templates"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Create Email Template
            </h1>
            <p className="text-xs text-slate-500">Design a reusable master broadcast layout</p>
          </div>
        </div>

        <Link
          href="/admin/email-marketing/templates"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Editor */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-5">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            Template Attributes &amp; Code
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Template Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly VIP Newsletter"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="PROMOTIONAL">Promotional</option>
                <option value="FLASH_SALE">Flash Sale</option>
                <option value="PRODUCT_UPDATE">Product Update</option>
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="WINBACK">Win-back</option>
                <option value="NEWSLETTER">Newsletter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Exciting updates from AI Haat"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Variables Bar */}
          <div>
            <span className="block text-xs font-bold text-slate-700 mb-1.5">Insert Dynamic Tags:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                "{{first_name}}",
                "{{customer_name}}",
                "{{email}}",
                "{{site_url}}",
                "{{coupon_code}}",
                "{{product_name}}",
              ].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => insertVariable(v)}
                  className="px-2 py-1 bg-slate-100 hover:bg-[#FFF2E8] hover:text-[#FC5C03] text-slate-700 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Template HTML Body *</label>
            <textarea
              rows={14}
              required
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 leading-relaxed focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Template..." : "Save Template"}</span>
            </button>
          </div>
        </div>

        {/* Right Preview */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 sticky top-20">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Eye className="w-4 h-4 text-[#FC5C03]" />
            <h3 className="text-sm font-black text-slate-900">Live Client Preview</h3>
          </div>

          <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200">
            <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200 text-xs text-slate-700">
              <div className="bg-[#0F172A] p-4 text-center border-b-2 border-[#FC5C03]">
                <div className="font-black text-white text-base">AI <span className="text-[#FC5C03]">HAAT</span></div>
              </div>
              <div
                className="p-5 space-y-3 min-h-[160px] leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: contentHtml
                    .replace(/\{\{first_name\}\}/g, "John")
                    .replace(/\{\{customer_name\}\}/g, "John Doe")
                    .replace(/\{\{coupon_code\}\}/g, "SAVE30")
                    .replace(/\{\{site_url\}\}/g, "https://aihaat.shop"),
                }}
              />
              <div className="bg-slate-900 p-3 text-center text-[10px] text-slate-400">
                <p className="margin: 0">AI Haat — Bangladesh&apos;s #1 Digital Marketplace</p>
              </div>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}