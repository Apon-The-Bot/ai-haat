"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, X, Sparkles, ArrowRight, ShieldCheck, Zap, Scale, Star } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";

interface ToolSpec {
  id: string;
  name: string;
  slug: string;
  badge: string;
  category: "all" | "text" | "design" | "coding";
  priceBDT: number;
  monthlyBDT: string;
  rating: number;
  model: string;
  contextWindow: string;
  features: {
    voiceMode: boolean;
    imageGen: boolean;
    codeGen: boolean;
    webSearch: boolean;
    canvasArtifacts: boolean;
    fileUpload: boolean;
    deviceLimit: string;
  };
  bestForBn: string;
  bestForEn: string;
}

const COMPARISON_TOOLS: ToolSpec[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Plus (GPT-4o)",
    slug: "chatgpt-plus",
    badge: "সবচেয়ে জনপ্রিয়",
    category: "text",
    priceBDT: 290,
    monthlyBDT: "২৯০৳ / মাস",
    rating: 4.9,
    model: "GPT-4o / o1-preview",
    contextWindow: "128k Tokens",
    features: {
      voiceMode: true,
      imageGen: true,
      codeGen: true,
      webSearch: true,
      canvasArtifacts: true,
      fileUpload: true,
      deviceLimit: "সকল ডিভাইস",
    },
    bestForBn: "অলরাউন্ডার কাজ, দ্রুত সার্চ, ক্যানভাস ও ভয়েস কনভারসেশনের জন্য সেরা।",
    bestForEn: "Best all-rounder for general tasks, web search, voice mode & brainstorming.",
  },
  {
    id: "cursor",
    name: "Cursor AI Pro (Claude 3.5)",
    slug: "cursor-ai-pro-subscription",
    badge: "কোডিং ও রাইটিং কিং",
    category: "coding",
    priceBDT: 450,
    monthlyBDT: "৪৫০৳ / মাস",
    rating: 4.95,
    model: "Claude 3.5 Sonnet & GPT-4o",
    contextWindow: "200k Tokens",
    features: {
      voiceMode: false,
      imageGen: false,
      codeGen: true,
      webSearch: true,
      canvasArtifacts: true,
      fileUpload: true,
      deviceLimit: "পিসি ও ম্যাক",
    },
    bestForBn: "নিখুঁত কোডিং, জটিল কোডবেস ন্যাভিগেশন এবং সরাসরি কম্পোজার প্রম্পটিংয়ের জন্য সেরা।",
    bestForEn: "Top tier coding, flawless repo indexing, Claude 3.5 Sonnet composer and debug.",
  },
  {
    id: "midjourney",
    name: "Midjourney v6.1",
    slug: "midjourney-v6-fast-gpu-credits",
    badge: "ফটো জেনারেশনের রাজা",
    category: "design",
    priceBDT: 450,
    monthlyBDT: "৪৫০৳ / মাস",
    rating: 4.85,
    model: "v6.1 & Niji 6",
    contextWindow: "N/A (Visual)",
    features: {
      voiceMode: false,
      imageGen: true,
      codeGen: false,
      webSearch: false,
      canvasArtifacts: false,
      fileUpload: true,
      deviceLimit: "ডিসকর্ড ও ওয়েব",
    },
    bestForBn: "আল্ট্রা-রিয়েলিস্টিক ফটো, ব্র্যান্ডিং আর্ট ও থ্রিডি কনসেপ্ট আর্টের জন্য বিশ্বসেরা।",
    bestForEn: "World leader in ultra-realistic image generation, graphic design & concept art.",
  },
  {
    id: "canva",
    name: "Canva Pro",
    slug: "canva-pro",
    badge: "ডিজাইনারদের প্রথম পছন্দ",
    category: "design",
    priceBDT: 99,
    monthlyBDT: "৯৯৳ / লাইফটাইম",
    rating: 4.9,
    model: "Magic Studio AI",
    contextWindow: "N/A",
    features: {
      voiceMode: false,
      imageGen: true,
      codeGen: false,
      webSearch: false,
      canvasArtifacts: true,
      fileUpload: true,
      deviceLimit: "সকল ডিভাইস",
    },
    bestForBn: "সোশ্যাল মিডিয়া পোস্ট, পোস্টার, ব্যাকগ্রাউন্ড রিমুভ ও প্রফেশনাল প্রেজেন্টেশনের জন্য।",
    bestForEn: "Instant templates, brand kit, background removal & marketing creatives.",
  },
  {
    id: "runway",
    name: "RunwayML Gen-3 Alpha",
    slug: "runwayml-gen3-ai-video-credits",
    badge: "ভিডিও জেনারেশনের বস",
    category: "design",
    priceBDT: 650,
    monthlyBDT: "৬৫০৳ / মাস",
    rating: 4.85,
    model: "Gen-3 Alpha",
    contextWindow: "N/A (Video)",
    features: {
      voiceMode: false,
      imageGen: true,
      codeGen: false,
      webSearch: false,
      canvasArtifacts: false,
      fileUpload: true,
      deviceLimit: "ওয়েব ব্রাউজার",
    },
    bestForBn: "হাই-কোয়ালিটি সিনেমাটিক এআই ভিডিও ও মোশন কনটেন্ট তৈরির জন্য বিশ্বমানের প্ল্যাটফর্ম।",
    bestForEn: "Cinematic AI video generation, text-to-video & camera control motion.",
  },
  {
    id: "gemini",
    name: "Google Gemini Advanced",
    slug: "google-gemini-advanced",
    badge: "বিশাল ২TB স্টোরেজ",
    category: "text",
    priceBDT: 350,
    monthlyBDT: "৩৫০৳ / মাস",
    rating: 4.75,
    model: "Gemini 1.5 Pro",
    contextWindow: "1M+ Tokens",
    features: {
      voiceMode: true,
      imageGen: true,
      codeGen: true,
      webSearch: true,
      canvasArtifacts: false,
      fileUpload: true,
      deviceLimit: "গুগল ড্রাইভ ও জিমেইল",
    },
    bestForBn: "বিশাল পিডিএফ/ভিডিও বিশ্লেষণ এবং ২ টেরাবাইট গুগল ক্লাউড ড্রাইভ স্টোরেজ।",
    bestForEn: "Massive 1M token context, Google Docs/Sheets integration & 2TB Drive storage.",
  },
];

export function ComparisonView() {
  const [activeTab, setActiveTab] = useState<"all" | "text" | "design" | "coding">("all");

  const filteredTools =
    activeTab === "all"
      ? COMPARISON_TOOLS
      : COMPARISON_TOOLS.filter((t) => t.category === activeTab);

  return (
    <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF2E8] border border-[#FC5C03]/30 text-[#FC5C03] text-xs font-bold">
          <Scale className="w-3.5 h-3.5" />
          <span>স্মার্ট এআই টুলস কম্প্যারিজন গাইড</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
          কোন AI টুলটি আপনার জন্য সবচেয়ে সেরা?
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          ChatGPT, Claude, Midjourney নাকি Canva? সহজে সিদ্ধান্ত নিতে এক নজরে ফিচার, প্রাইস ও
          সুবিধা-অসুবিধাগুলোর তুলনামূলক বিশ্লেষণ দেখে নিন।
        </p>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          {[
            { id: "all", label: "সবগুলো টুলস" },
            { id: "text", label: "✍️ টেক্সট ও কোডিং (ChatGPT vs Claude)" },
            { id: "design", label: "🎨 ফটো ও গ্রাফিক্স (Midjourney vs Canva)" },
            { id: "coding", label: "💻 ডেভেলপার টুলস" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#FC5C03] text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between hover:shadow-lg hover:border-[#FC5C03]/40 transition-all duration-300 relative group"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="px-3 py-1 bg-amber-50 text-amber-900 text-xs font-bold rounded-lg border border-amber-200">
                {tool.badge}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{tool.rating}</span>
              </div>
            </div>

            {/* Title & Price */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xl font-black text-slate-900 group-hover:text-[#FC5C03] transition-colors">
                {tool.name}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {tool.monthlyBDT}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">{tool.bestForBn}</p>
            </div>

            {/* Specifications Matrix */}
            <div className="border-t border-b border-slate-100 py-4 my-2 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">মূল মডেল:</span>
                <span className="font-bold text-slate-900">{tool.model}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">কনটেক্সট উইন্ডো:</span>
                <span className="font-bold text-slate-900">{tool.contextWindow}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">ডিভাইস সাপোর্ট:</span>
                <span className="font-bold text-slate-900">{tool.features.deviceLimit}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">কোড জেনারেশন:</span>
                {tool.features.codeGen ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <X className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">ছবি তৈরি (Image Gen):</span>
                {tool.features.imageGen ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <X className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">ভয়েস ও রিয়েলটাইম চ্যাট:</span>
                {tool.features.voiceMode ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <X className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">ক্যানভাস / আর্টফ্যাক্টস:</span>
                {tool.features.canvasArtifacts ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <X className="w-4 h-4 text-slate-300" />
                )}
              </div>
            </div>

            {/* CTA Buy Button */}
            <div className="pt-4">
              <Link
                href={`/product/${tool.slug}`}
                className="w-full py-3 bg-slate-900 hover:bg-[#FC5C03] text-white text-xs font-bold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>সাবস্ক্রিপশন কিনুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>১০০% অথেনটিক ও গ্যারান্টিযুক্ত ডেলিভারি</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-black">সরাসরি বিকাশ ও নগদে কিনুন</h4>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
            কোনো ইন্টারন্যাশনাল ডুয়াল কারেন্সি কার্ডের ঝামেলা ছাড়াই বাংলাদেশের যেকোনো পেমেন্ট দিয়ে
            ইনস্ট্যান্ট অ্যাক্টিভেশন নিন।
          </p>
        </div>
        <Link
          href="/shop"
          className="px-6 py-3.5 bg-[#FC5C03] hover:bg-[#E04F00] text-white text-xs font-black rounded-2xl transition-all shadow-md shrink-0 flex items-center gap-2"
        >
          <span>সকল প্রোডাক্ট দেখুন</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
