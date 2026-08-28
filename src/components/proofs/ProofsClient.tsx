"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowRight,
  PackageOpen,
  Star,
  Search,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MessageSquarePlus,
  Send,
  Zap,
  Headphones,
  Sparkles,
  Filter,
  ThumbsUp,
  Award,
  Lock,
  RefreshCw,
} from "lucide-react";
import { PROOFS as initialProofs } from "@/data/proofs";
import { REVIEWS as initialReviews } from "@/data/reviews";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { SafeImage } from "@/components/SafeImage";
import { ProofItem, Review } from "@/types";

const CATEGORIES = [
  "All",
  "AI Tools",
  "Subscriptions",
  "Windows & Office",
  "VPNs",
] as const;

const POPULAR_PRODUCTS = [
  "ChatGPT Plus (GPT-4o & Canvas Access)",
  "Canva Pro Subscription (Brand Kit & AI Tools)",
  "Windows 11 Pro Retail Genuine License Key",
  "Microsoft Office 365 Pro Plus (5 Devices + 1TB)",
  "NordVPN 1 Year Dedicated Ultra Fast Servers",
  "Claude Pro (Artifacts & Claude 3.5 Sonnet)",
  "YouTube Premium (Ad-free & Background Play)",
  "Netflix Premium 4K UHD (Ultra HD Profile)",
  "Cursor AI Pro (Developer Coding Assistant)",
  "Midjourney Pro (Fast GPU Hours)",
  "Internet Download Manager (IDM Lifetime Genuine)",
  "ExpressVPN Ultra Fast Global Security",
  "Surfshark VPN Unlimited Devices Protection",
  "CapCut Pro Full Assets & Video Editing",
  "Gemini Advanced (2TB Cloud & Ultra 1.5)",
];

export function ProofsClient() {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();
  const { user } = useAuth();

  // Proofs state
  const [proofs, setProofs] = useState<ProofItem[]>(initialProofs);
  const [loadingProofs, setLoadingProofs] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Lightbox state
  const [activeProofIndex, setActiveProofIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(false);
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");

  // Review Form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [authorName, setAuthorName] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>(POPULAR_PRODUCTS[0]);
  const [customProduct, setCustomProduct] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"proofs" | "reviews">("proofs");

  // Auto-fill author name from session
  useEffect(() => {
    if (user?.name && !authorName) {
      setAuthorName(user.name);
    }
  }, [user, authorName]);

  // Fetch Proofs from API
  const fetchProofs = useCallback(async () => {
    try {
      setLoadingProofs(true);
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/proofs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.proofs && Array.isArray(data.proofs)) {
          setProofs(data.proofs);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch dynamic proofs, using seed:", err);
    } finally {
      setLoadingProofs(false);
    }
  }, [selectedCategory, searchQuery]);

  // Fetch Reviews from API
  const fetchReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      const res = await fetch("/api/reviews?status=APPROVED");
      if (res.ok) {
        const data = await res.json();
        if (data.reviews && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch dynamic reviews, using seed:", err);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Filtered proofs based on search and category
  const filteredProofs = useMemo(() => {
    let list = proofs;

    if (selectedCategory !== "All") {
      list = list.filter((p) => {
        const cat = p.category || "";
        if (selectedCategory === "AI Tools") {
          return (
            cat === "AI Tools" ||
            p.productName.toLowerCase().includes("chatgpt") ||
            p.productName.toLowerCase().includes("claude") ||
            p.productName.toLowerCase().includes("gemini") ||
            p.productName.toLowerCase().includes("midjourney") ||
            p.productName.toLowerCase().includes("cursor") ||
            p.productName.toLowerCase().includes("ai")
          );
        }
        if (selectedCategory === "Subscriptions") {
          return (
            cat === "Subscriptions" ||
            p.productName.toLowerCase().includes("canva") ||
            p.productName.toLowerCase().includes("netflix") ||
            p.productName.toLowerCase().includes("youtube") ||
            p.productName.toLowerCase().includes("spotify") ||
            p.productName.toLowerCase().includes("capcut") ||
            p.type === "Subscription"
          );
        }
        if (selectedCategory === "Windows & Office") {
          return (
            cat === "Windows & Office" ||
            p.productName.toLowerCase().includes("windows") ||
            p.productName.toLowerCase().includes("office") ||
            p.productName.toLowerCase().includes("microsoft") ||
            p.productName.toLowerCase().includes("idm") ||
            p.type === "License Key"
          );
        }
        if (selectedCategory === "VPNs") {
          return (
            cat === "VPNs" ||
            p.productName.toLowerCase().includes("vpn") ||
            p.productName.toLowerCase().includes("nord") ||
            p.productName.toLowerCase().includes("express") ||
            p.productName.toLowerCase().includes("surfshark")
          );
        }
        return cat === selectedCategory;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.orderId.toLowerCase().includes(q) ||
          p.productName.toLowerCase().includes(q) ||
          p.customerNote.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    return list;
  }, [proofs, selectedCategory, searchQuery]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    if (ratingFilter === "ALL") return reviews;
    return reviews.filter((r) => r.rating === ratingFilter);
  }, [reviews, ratingFilter]);

  // Overall reviews stats
  const reviewStats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) return { avg: 5.0, count: 0, counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };

    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = Number((sum / total).toFixed(1));

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });

    return { avg, count: total, counts };
  }, [reviews]);

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setActiveProofIndex(index);
    setZoomLevel(1);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setActiveProofIndex(null);
    setZoomLevel(1);
    document.body.style.overflow = "unset";
  }, []);

  const nextProof = useCallback(() => {
    if (activeProofIndex === null) return;
    setZoomLevel(1);
    setActiveProofIndex((prev) =>
      prev !== null && prev < filteredProofs.length - 1 ? prev + 1 : 0
    );
  }, [activeProofIndex, filteredProofs.length]);

  const prevProof = useCallback(() => {
    if (activeProofIndex === null) return;
    setZoomLevel(1);
    setActiveProofIndex((prev) =>
      prev !== null && prev > 0 ? prev - 1 : filteredProofs.length - 1
    );
  }, [activeProofIndex, filteredProofs.length]);

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const resetZoom = () => setZoomLevel(1);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeProofIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextProof();
      if (e.key === "ArrowLeft") prevProof();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeProofIndex, closeLightbox, nextProof, prevProof]);

  // Handle Review Submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalAuthor = authorName.trim();
    if (!finalAuthor) {
      showToast("অনুগ্রহ করে আপনার নাম লিখুন।", "error");
      return;
    }

    if (!comment.trim()) {
      showToast("অনুগ্রহ করে আপনার মূল্যবান মতামত বা অভিজ্ঞতা লিখুন।", "error");
      return;
    }

    const prodName =
      selectedProduct === "Other" && customProduct.trim()
        ? customProduct.trim()
        : selectedProduct;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          userName: finalAuthor,
          rating,
          comment: comment.trim(),
          productName: prodName,
          productId: prodName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          isVerifiedPurchase: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("আপনার রিভিউ সফলভাবে প্রকাশ করা হয়েছে! ধন্যবাদ।", "success");
        if (data.review) {
          setReviews((prev) => [data.review, ...prev]);
        }
        setComment("");
        setOrderNumber("");
        setIsFormOpen(false);
      } else {
        showToast(data.error || "রিভিউ জমা দিতে সমস্যা হয়েছে।", "error");
      }
    } catch {
      showToast("সার্ভার এরর: রিভিউ জমা দিতে ব্যর্থ হয়েছে।", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentProof =
    activeProofIndex !== null && filteredProofs[activeProofIndex]
      ? filteredProofs[activeProofIndex]
      : null;

  const ratingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return "⭐⭐⭐⭐⭐ অসাধারণ! (Excellent)";
      case 4:
        return "⭐⭐⭐⭐ খুব ভালো (Very Good)";
      case 3:
        return "⭐⭐⭐ সন্তোষজনক (Good)";
      case 2:
        return "⭐⭐ সাধারণ (Fair)";
      case 1:
        return "⭐ প্রত্যাশিত নয় (Poor)";
      default:
        return "";
    }
  };

  return (
    <div className="w-full bg-[#FAFBFD] min-h-screen pb-20">
      
      {/* 1. BREADCRUMB */}
      <div className="border-b border-[#E8E8EE] bg-white py-2.5">
        <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto text-xs text-[#7A8190] flex items-center flex-wrap gap-1.5">
          <Link href="/" className="hover:text-[#FC5C03] transition-colors">
            হোম
          </Link>
          <span>&gt;</span>
          <span className="text-[#1A1D26] font-bold">
            ডেলিভারি প্রমাণপত্র ও কাস্টমার রিভিউ
          </span>
        </div>
      </div>

      {/* 2. HERO HEADER */}
      <div className="bg-white border-b border-[#E8E8EE] pt-8 sm:pt-12 pb-8">
        <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto text-center max-w-3xl">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-black uppercase tracking-wider mb-3 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#FC5C03]" />
            <span>১০০% ভেরিফাইড ডেলিভারি প্রুফ ও রিয়েল রিভিউ</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#1A1D26] tracking-tight leading-snug">
            কাস্টমার পেমেন্ট ও ডেলিভারি প্রমাণপত্র
          </h1>

          <p className="text-xs sm:text-sm text-[#4B5563] mt-2.5 leading-relaxed max-w-2xl mx-auto">
            AI Haat থেকে প্রতিদিন সফলভাবে ডেলিভারি হওয়া ডিজিটাল প্রোডাক্টের রিয়েল-টাইম স্ক্রিনশট, অর্ডার প্রমাণপত্র ও সম্মানিত গ্রাহকদের সরাসরি রিভিউ।
          </p>

          {/* Core Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8">
            <div className="p-3 sm:p-4 bg-[#FAFBFD] rounded-2xl border border-[#E8E8EE] flex flex-col items-center text-center shadow-2xs hover:border-[#FC5C03]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#1A1D26]">১০০% আসল প্রোডাক্ট</span>
              <span className="text-[11px] text-[#7A8190] mt-0.5">অফিশিয়াল লাইসেন্স কি</span>
            </div>

            <div className="p-3 sm:p-4 bg-[#FAFBFD] rounded-2xl border border-[#E8E8EE] flex flex-col items-center text-center shadow-2xs hover:border-[#FC5C03]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#1A1D26]">৫-১৫ মিনিটে ডেলিভারি</span>
              <span className="text-[11px] text-[#7A8190] mt-0.5">ইনস্ট্যান্ট ভল্ট এক্সেস</span>
            </div>

            <div className="p-3 sm:p-4 bg-[#FAFBFD] rounded-2xl border border-[#E8E8EE] flex flex-col items-center text-center shadow-2xs hover:border-[#FC5C03]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#1A1D26]">রিপ্লেসমেন্ট ওয়ারেন্টি</span>
              <span className="text-[11px] text-[#7A8190] mt-0.5">ফুল মেয়াদের গ্যারান্টি</span>
            </div>

            <div className="p-3 sm:p-4 bg-[#FAFBFD] rounded-2xl border border-[#E8E8EE] flex flex-col items-center text-center shadow-2xs hover:border-[#FC5C03]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="text-xs font-black text-[#1A1D26]">২৪/৭ লাইভ সাপোর্ট</span>
              <span className="text-[11px] text-[#7A8190] mt-0.5">হোয়াটসঅ্যাপ হেল্পডেস্ক</span>
            </div>
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-around flex-wrap gap-4 text-left sm:text-center">
            <div>
              <div className="text-lg sm:text-2xl font-black text-[#FC5C03]">৫,২০০+</div>
              <div className="text-[11px] font-bold text-[#7A8190]">সফল ডেলিভারি</div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-200" />
            <div>
              <div className="text-lg sm:text-2xl font-black text-[#1A1D26] flex items-center justify-center gap-1">
                <span>৪.৯</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 inline" />
              </div>
              <div className="text-[11px] font-bold text-[#7A8190]">কাস্টমার রেটিং ({reviewStats.count}+ রিভিউ)</div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-200" />
            <div>
              <div className="text-lg sm:text-2xl font-black text-emerald-600">৯৯.৮%</div>
              <div className="text-[11px] font-bold text-[#7A8190]">সন্তুষ্টির হার</div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-200" />
            <div>
              <div className="text-lg sm:text-2xl font-black text-blue-600">&lt; ৮ মিনিট</div>
              <div className="text-[11px] font-bold text-[#7A8190]">গড় ডেলিভারি স্পিড</div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto pt-8">
        
        {/* Navigation Switcher Tabs & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E8EE]">
          
          {/* Main Section Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("proofs")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "proofs"
                  ? "bg-white text-[#FC5C03] shadow-xs"
                  : "text-[#7A8190] hover:text-[#1A1D26]"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ডেলিভারি প্রুফ গ্যালারি ({filteredProofs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-white text-[#FC5C03] shadow-xs"
                  : "text-[#7A8190] hover:text-[#1A1D26]"
              }`}
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>কাস্টমার রিভিউ ({reviews.length})</span>
            </button>
          </div>

          {/* Write a Review Button */}
          <button
            onClick={() => {
              setIsFormOpen((prev) => !prev);
              if (!isFormOpen && activeTab !== "reviews") {
                setActiveTab("reviews");
              }
            }}
            className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{isFormOpen ? "রিভিউ ফর্ম বন্ধ করুন" : "+ আপনার রিভিউ প্রদান করুন"}</span>
          </button>
        </div>

        {/* 4. CUSTOMER REVIEW SUBMISSION FORM (COLLAPSIBLE / MODAL PANEL) */}
        {isFormOpen && (
          <div className="my-6 p-6 sm:p-8 bg-white rounded-3xl border-2 border-[#FC5C03]/30 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-[11px] font-bold text-[#FC5C03] uppercase tracking-wider block">
                  সরাসরি ফিডব্যাক দিন
                </span>
                <h3 className="text-lg sm:text-xl font-black text-[#1A1D26]">
                  আপনার অভিজ্ঞতা ও রিভিউ শেয়ার করুন
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-black text-[#1A1D26] mb-1.5">
                  সার্ভিস ও ডেলিভারি রেটিং দিন *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(rating)}
                      className="p-1 text-amber-400 hover:scale-115 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-100 text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#FC5C03] ml-3">
                    {ratingLabel(hoverRating || rating)}
                  </span>
                </div>
              </div>

              {/* Name & Product Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-[#1A1D26] mb-1.5">
                    আপনার নাম / ইউজারনেম *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. তানভীর আহমেদ"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1A1D26] focus:border-[#FC5C03] focus:bg-white focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#1A1D26] mb-1.5">
                    ক্রয়কৃত প্রোডাক্ট সিলেক্ট করুন *
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1A1D26] focus:border-[#FC5C03] focus:bg-white focus:outline-hidden transition-all"
                  >
                    {POPULAR_PRODUCTS.map((prod) => (
                      <option key={prod} value={prod}>
                        {prod}
                      </option>
                    ))}
                    <option value="Other">অন্যান্য প্রোডাক্ট (লিখুন)</option>
                  </select>
                </div>
              </div>

              {selectedProduct === "Other" && (
                <div>
                  <label className="block text-xs font-black text-[#1A1D26] mb-1.5">
                    প্রোডাক্টের নাম লিখুন *
                  </label>
                  <input
                    type="text"
                    required
                    value={customProduct}
                    onChange={(e) => setCustomProduct(e.target.value)}
                    placeholder="e.g. GitHub Copilot Pro 1 Year"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1A1D26] focus:border-[#FC5C03] focus:bg-white focus:outline-hidden transition-all"
                  />
                </div>
              )}

              {/* Order ID & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-[#1A1D26] mb-1.5">
                    অর্ডার নাম্বার (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. AH-84920"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1A1D26] focus:border-[#FC5C03] focus:bg-white focus:outline-hidden transition-all"
                  />
                </div>

                <div className="flex items-center">
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-[11px] font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>আপনার রিভিউটি ভেরিফাইড পারচেজ হিসেবে সরাসরি প্রদর্শিত হবে।</span>
                  </div>
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-xs font-black text-[#1A1D26] mb-1.5">
                  আপনার রিভিউ ও ডেলিভারি অভিজ্ঞতা *
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="ডেলিভারি স্পিড, প্রোডাক্টের এক্টিভেশন ও সাপোর্ট নিয়ে আপনার অনুভূতি লিখুন..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1A1D26] focus:border-[#FC5C03] focus:bg-white focus:outline-hidden transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#4B5563] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "সাবমিট হচ্ছে..." : "রিভিউ সাবমিট করুন"}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* 5. TAB 1: DELIVERY PROOFS GALLERY */}
        {activeTab === "proofs" && (
          <div className="space-y-6 pt-6">
            
            {/* Filter Tabs & Search Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? "bg-[#FC5C03] text-white shadow-xs"
                          : "bg-white border border-[#E8E8EE] text-[#4B5563] hover:border-[#FC5C03]/50 hover:text-[#1A1D26]"
                      }`}
                    >
                      <span>{cat === "All" ? "সবগুলো (All)" : cat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="অর্ডার নাম্বার বা প্রোডাক্ট খুঁজুন..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-[#E8E8EE] rounded-xl text-xs text-[#1A1D26] placeholder:text-slate-400 focus:border-[#FC5C03] focus:outline-hidden shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>

            {/* Proofs Count indicator */}
            <div className="flex items-center justify-between text-xs text-[#7A8190] px-1">
              <span>
                মোট <strong className="text-[#1A1D26]">{filteredProofs.length}</strong> টি ভেরিফাইড ডেলিভারি প্রুফ প্রদর্শিত হচ্ছে
              </span>
              {selectedCategory !== "All" && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="text-[#FC5C03] hover:underline font-bold"
                >
                  ফিল্টার রিসেট করুন
                </button>
              )}
            </div>

            {/* Proof Cards Grid */}
            {filteredProofs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredProofs.map((proof, idx) => (
                  <div
                    key={proof.id || proof.orderId}
                    className="bg-white rounded-2xl border border-[#E8E8EE] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#FC5C03]/40 transition-all flex flex-col group"
                  >
                    {/* Card Top Header */}
                    <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                            অর্ডার নাম্বার
                          </span>
                          <span className="text-xs font-black text-[#1A1D26] font-mono">
                            #{proof.orderId}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-emerald-100/80 text-emerald-800 text-[10px] font-black rounded-lg flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ভেরিফাইড ডেলিভারি</span>
                      </span>
                    </div>

                    {/* Card Middle: Product Info & Image Preview */}
                    <div className="p-4 sm:p-5 flex-1 space-y-4">
                      
                      <div className="flex items-start gap-3.5">
                        <div
                          onClick={() => openLightbox(idx)}
                          className="w-14 h-14 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                        >
                          <SafeImage
                            src={proof.image}
                            alt={proof.productName}
                            aspectRatio="1/1"
                            objectFit="cover"
                            sizes="56px"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Maximize2 className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md inline-block mb-1">
                            {proof.category || proof.type}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-[#1A1D26] truncate leading-tight">
                            {proof.productName}
                          </h4>
                          <span className="text-xs font-black text-[#FC5C03] block mt-0.5">
                            {formatPrice(proof.amountBDT)}
                          </span>
                        </div>
                      </div>

                      {/* Customer Note Quote Box */}
                      <div className="p-3.5 bg-[#FFF9F5] rounded-xl border border-[#FFF2E8] text-xs text-[#4B5563] italic leading-relaxed relative">
                        <span className="text-lg font-serif text-[#FC5C03] leading-none absolute top-2 left-2 opacity-40">&ldquo;</span>
                        <p className="pl-3">{proof.customerNote}</p>
                      </div>

                    </div>

                    {/* Card Bottom Actions */}
                    <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{proof.date}</span>
                      </div>

                      <button
                        onClick={() => openLightbox(idx)}
                        className="text-xs font-black text-[#FC5C03] hover:text-[#EC4001] flex items-center gap-1 cursor-pointer"
                      >
                        <span>প্রুফ জুম দেখুন</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 max-w-md mx-auto p-8 space-y-4">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  কোনো প্রমাণপত্র পাওয়া যায়নি
                </h3>
                <p className="text-xs text-slate-500">
                  আপনার সিলেক্ট করা ক্যাটাগরি বা সার্চের সাথে মিল রয়েছে এমন কোনো ডেলিভারি প্রুফ মেলেনি।
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  সব প্রুফ দেখুন
                </button>
              </div>
            )}

          </div>
        )}

        {/* 6. TAB 2: VERIFIED CUSTOMER REVIEWS FEED */}
        {activeTab === "reviews" && (
          <div className="space-y-8 pt-6">
            
            {/* Reviews Summary Rating Card */}
            <div className="bg-white rounded-3xl border border-[#E8E8EE] p-6 sm:p-8 shadow-2xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
                
                {/* Score Column */}
                <div className="md:col-span-4 text-center md:text-left md:border-r border-slate-200 md:pr-8">
                  <span className="text-4xl sm:text-5xl font-black text-[#1A1D26] tracking-tight">
                    {reviewStats.avg}
                  </span>
                  <div className="flex items-center justify-center md:justify-start text-amber-400 gap-1 my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-[#4B5563]">
                    {reviewStats.count} জন ভেরিফাইড ক্রেতার মতামতের ভিত্তিতে
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>১০০% অনুমোদিত ও ভেরিফাইড ফিডব্যাক</span>
                  </div>
                </div>

                {/* Star Progress Breakdown Column */}
                <div className="md:col-span-8 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewStats.counts[star] || 0;
                    const pct = reviewStats.count > 0 ? Math.round((count / reviewStats.count) * 100) : 0;
                    return (
                      <button
                        key={star}
                        onClick={() => setRatingFilter(ratingFilter === star ? "ALL" : star)}
                        className={`w-full flex items-center gap-3 text-xs p-1 rounded-lg transition-colors cursor-pointer ${
                          ratingFilter === star ? "bg-amber-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-1 w-14 font-bold text-[#1A1D26]">
                          <span>{star}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </div>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="w-12 text-right text-[11px] text-[#7A8190] font-mono font-bold">
                          {count} ({pct}%)
                        </div>
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Filter Pills for Reviews */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7A8190] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> ফিল্টার:
                </span>
                <button
                  onClick={() => setRatingFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    ratingFilter === "ALL"
                      ? "bg-[#1A1D26] text-white"
                      : "bg-white border border-slate-200 text-[#4B5563]"
                  }`}
                >
                  সবগুলো ({reviews.length})
                </button>
                {[5, 4, 3].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingFilter(star)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      ratingFilter === star
                        ? "bg-amber-500 text-white"
                        : "bg-white border border-slate-200 text-[#4B5563]"
                    }`}
                  >
                    <span>{star} স্টার</span>
                    <Star className="w-3 h-3 fill-current" />
                  </button>
                ))}
              </div>

              <span className="text-xs text-[#7A8190]">
                প্রদর্শিত রিভিউ: <strong className="text-[#1A1D26]">{filteredReviews.length}</strong>
              </span>
            </div>

            {/* Reviews Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-5 rounded-2xl border border-[#E8E8EE] shadow-2xs hover:border-[#FC5C03]/30 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FC5C03] to-amber-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
                          {rev.author?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-black text-[#1A1D26]">
                              {rev.author}
                            </h4>
                            {rev.isVerifiedPurchase && (
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-md flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> ভেরিফাইড বায়ার
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{rev.date}</span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-100 text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Product Tag */}
                    {rev.productName && (
                      <div className="inline-block px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200/80 rounded-lg text-[11px] font-bold">
                        🛍️ {rev.productName}
                      </div>
                    )}

                    {/* Comment */}
                    <p className="text-xs text-[#334155] leading-relaxed pt-1">
                      {rev.comment}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      স্বীকৃত কাস্টমার পারচেজ
                    </span>
                    <span className="text-[#FC5C03] font-bold">AI Haat Certified</span>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* 7. FULL-SCREEN LIGHTBOX & RECEIPT ZOOM MODAL */}
      {activeProofIndex !== null && currentProof && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          
          {/* Top Controls Bar */}
          <div className="absolute top-4 left-4 right-4 z-60 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-mono font-bold">
                {activeProofIndex + 1} / {filteredProofs.length}
              </span>
              <span className="text-xs font-bold text-slate-300 hidden sm:inline">
                #{currentProof.orderId} - {currentProof.productName}
              </span>
            </div>

            {/* Zoom & Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={zoomIn}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={zoomOut}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetZoom}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={closeLightbox}
                className="p-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white rounded-xl transition-colors cursor-pointer ml-2"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Previous Button */}
          <button
            onClick={prevProof}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-60 p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all cursor-pointer backdrop-blur-md hidden sm:flex items-center justify-center"
            title="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Navigation Next Button */}
          <button
            onClick={nextProof}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-60 p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all cursor-pointer backdrop-blur-md hidden sm:flex items-center justify-center"
            title="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Center Content Card */}
          <div className="max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700 relative z-55 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  AI HAAT DIGITAL DISPATCH RECEIPT
                </span>
                <span className="text-sm font-black font-mono text-[#FC5C03]">
                  #{currentProof.orderId}
                </span>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ভেরিফাইড ডেলিভারি
              </span>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Image with Interactive Zoom */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                <div
                  className="w-full h-full relative transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                >
                  <SafeImage
                    src={currentProof.image}
                    alt={currentProof.productName}
                    aspectRatio="16/9"
                    objectFit="contain"
                    sizes="(max-width: 640px) 100vw, 600px"
                  />
                </div>
              </div>

              {/* Receipt Details Table */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">প্রোডাক্টের নাম:</span>
                  <span className="font-bold text-slate-900">{currentProof.productName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">পরিশোধিত মূল্য:</span>
                  <span className="font-black text-[#FC5C03] text-sm">
                    {formatPrice(currentProof.amountBDT)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">ডেলিভারি ধরন:</span>
                  <span className="font-bold text-slate-800">{currentProof.type}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">তারিখ ও সময়:</span>
                  <span className="font-bold text-slate-800">{currentProof.date}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">ওয়ারেন্টি স্ট্যাটাস:</span>
                  <span className="font-bold text-emerald-600">১০০% অ্যাক্টিভ ওয়ারেন্টি</span>
                </div>
              </div>

              {/* Customer Testimonial Quote */}
              <div className="p-4 bg-[#FFF9F5] rounded-2xl border border-[#FFF2E8]">
                <span className="text-[10px] font-bold text-[#FC5C03] uppercase tracking-wider block mb-1">
                  ক্রেতার সরাসরি রিভিউ:
                </span>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  &ldquo;{currentProof.customerNote}&rdquo;
                </p>
              </div>

            </div>

            {/* Modal Bottom CTA */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3">
              <Link
                href="/shop"
                onClick={closeLightbox}
                className="w-full py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl text-center shadow-xs transition-colors"
              >
                এই প্রোডাক্টটি কিনুন
              </Link>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
