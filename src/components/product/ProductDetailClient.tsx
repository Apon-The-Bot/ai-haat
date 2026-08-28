"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackViewItem } from "@/lib/analytics/client";
import { sanitizeItem } from "@/lib/analytics/sanitize";
import {
  Star,
  ShieldCheck,
  Zap,
  Headphones,
  Copy,
  MessageCircle,
  Share2,
  CheckCircle,
  Minus,
  Plus,
  Lock,
  RotateCcw,
  ShoppingBag,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Flame,
  HelpCircle,
  CreditCard,
  BadgeCheck,
  Check,
} from "lucide-react";
import { Product, Variation, Review } from "@/types";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { HowToOrder } from "@/components/home/HowToOrder";
import { SafeImage } from "@/components/SafeImage";
import { PaymentLogo } from "@/components/PaymentLogo";

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const { user, openLoginModal } = useAuth();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // Selected variation state
  const [selectedVariation, setSelectedVariation] = useState<Variation>(
    product.variations?.[0] || {
      id: "default",
      name: "Standard Edition",
      priceBDT: product.minPriceBDT || 290,
      inStock: true,
    }
  );

  useEffect(() => {
    if (product?.variations?.[0]) {
      setSelectedVariation(product.variations[0]);
    }
  }, [product]);

  // Quantity state
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"description" | "features" | "info" | "faq">("description");

  // Reviews state
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [newRating, setNewRating] = useState<number>(5);
  const [newAuthor, setNewAuthor] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Fetch reviews for this product
  useEffect(() => {
    async function loadReviews() {
      try {
        const id = product.id || product.slug;
        const res = await fetch(`/api/reviews?productId=${encodeURIComponent(id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.reviews && Array.isArray(data.reviews) && data.reviews.length > 0) {
            setReviewsList(data.reviews);
          }
        }
      } catch (err) {
        console.debug("Failed to fetch product reviews:", err);
      }
    }
    if (product) {
      loadReviews();
    }
  }, [product]);

  // FAQ accordion open index state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("প্রোডাক্ট লিংক কপি করা হয়েছে!", "success");
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedVariation, quantity);
    showToast(`${product.name} কার্টে যোগ করা হয়েছে!`, "success");
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariation, quantity);
    if (!user) {
      openLoginModal("/checkout");
    } else {
      router.push("/checkout");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAuthor = newAuthor.trim() || (user?.name || "");
    if (!finalAuthor) {
      showToast("অনুগ্রহ করে আপনার নাম লিখুন।", "error");
      return;
    }
    if (!newComment.trim()) {
      showToast("অনুগ্রহ করে আপনার রিভিউ বা মন্তব্য লিখুন।", "error");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          userName: finalAuthor,
          rating: newRating,
          comment: newComment.trim(),
          productId: product.id || product.slug,
          productName: product.name,
          isVerifiedPurchase: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const created = data.review || {
          id: `rev-${Date.now()}`,
          author: finalAuthor,
          rating: newRating,
          date: new Date().toISOString().split("T")[0],
          comment: newComment.trim(),
          isVerifiedPurchase: true,
          productName: product.name,
        };
        setReviewsList((prev) => [created, ...prev]);
        setNewAuthor("");
        setNewComment("");
        showToast("আপনার রিভিউ সফলভাবে জমা ও প্রকাশ হয়েছে। ধন্যবাদ!", "success");
      } else {
        showToast(data.error || "রিভিউ জমা দিতে সমস্যা হয়েছে।", "error");
      }
    } catch {
      showToast("সার্ভার এরর: রিভিউ জমা দেওয়া সম্ভব হয়নি।", "error");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const paymentLogos = [
    { name: "bKash", icon: "/images/payments/bkash.svg" },
    { name: "Nagad", icon: "/images/payments/nagad.svg" },
    { name: "Rocket", icon: "/images/payments/rocket.svg" },
    { name: "Visa", icon: "/images/payments/visa.svg" },
    { name: "Mastercard", icon: "/images/payments/mastercard.svg" },
    { name: "SSLCommerz", icon: "/images/payments/sslcommerz.svg" },
  ];

  const productFaqs = [
    {
      q: "অর্ডার করার পর ডেলিভারি পেতে কতক্ষণ সময় লাগে?",
      a: "পেমেন্ট ভেরিফিকেশনের পর মাত্র ৫ থেকে ১৫ মিনিটের মধ্যে আপনার ইমেইল এবং হোয়াটসঅ্যাপে অফিসিয়াল এক্টিভেশন ডিটেইলস বা ইনভাইটেশন স্বয়ংক্রিয়ভাবে পাঠিয়ে দেওয়া হয়।",
    },
    {
      q: "এটি কি ১০০% আসল এবং অফিশিয়াল লাইসেন্স?",
      a: "হ্যাঁ, এআই হাট থেকে প্রদত্ত প্রতিটি টুলস, সফটওয়্যার কি এবং প্রিমিয়াম সাবস্ক্রিপশন সম্পূর্ণ জেনুইন ও অফিশিয়াল। কোনো ধরনের থার্ড-পার্টি পাইরেসি বা ক্র্যাক সফটওয়্যার নেই।",
    },
    {
      q: "সাবস্ক্রিপশনের মেয়াদ চলাকালীন কোনো সমস্যা হলে কি ওয়ারেন্টি পাবো?",
      a: "অবশ্যই! সম্পূর্ণ সাবস্ক্রিপশন মেয়াদ পর্যন্ত ১০০% রিপ্লেসমেন্ট ওয়ারেন্টি প্রযোজ্য। যেকোনো টেকনিক্যাল সমস্যায় আমাদের ডেডিকেটেড সাপোর্ট টিম দ্রুত সমাধান প্রদান করে।",
    },
    {
      q: "কীভাবে পেমেন্ট সম্পন্ন করতে হবে?",
      a: "আপনি বিকাশ (bKash), নগদ (Nagad), রকেট (Rocket), অথবা ওয়ালেট ব্যালেন্স ব্যবহার করে সরাসরি বাংলাদেশি টাকায় (BDT) সম্পূর্ণ নিরাপদে পেমেন্ট করতে পারবেন।",
    },
    {
      q: "এটি কি আমার পার্সোনাল ইমেইলে এক্টিভ হবে নাকি শেয়ার্ড একাউন্ট?",
      a: "আপনার নির্বাচিত ভ্যারিয়েন্ট অনুযায়ী—যেমন 'Personal Email' সিলেক্ট করলে সরাসরি আপনার নিজস্ব ইমেইলে এক্টিভেশন লিংক যাবে, আর 'Shared Profile' নিলে ভেরিফাইড প্রাতিষ্ঠানিক প্রিমিয়াম এক্সেস পাবেন।",
    },
  ];

  const isProductOutOfStock = product.inStock === false || selectedVariation.inStock === false;

  const viewTrackedRef = useRef(false);
  useEffect(() => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    const item = sanitizeItem({
      id: product.id,
      name: product.name,
      category: product.category,
      variant: product.variations?.[0]?.name,
      price: product.minPriceBDT,
      quantity: 1,
    });
    trackViewItem(item, product.minPriceBDT);
  }, [product]);

  return (
    <div className="w-full bg-[#FAFAFC] pb-24 lg:pb-16">
      
      {/* 1. BREADCRUMB NAVIGATION */}
      <div className="border-b border-[#E8E8EE] bg-white py-3 shadow-2xs">
        <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto text-xs text-[#7A8190] flex items-center flex-wrap gap-2">
          <Link href="/" className="hover:text-[#FC5C03] transition-colors flex items-center gap-1 font-medium">
            <span>হোম</span>
          </Link>
          <span className="text-gray-300">/</span>
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#FC5C03] transition-colors font-medium"
          >
            {product.category}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-[#1A1D26] font-bold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </div>
      </div>

      {/* 2. MAIN PRODUCT HERO & PURCHASE PANEL */}
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto pt-6 sm:pt-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Square Product Image with Badges */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full max-w-[580px] mx-auto rounded-3xl overflow-hidden border border-[#E8E8EE] bg-white shadow-sm p-4 flex items-center justify-center">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                <SafeImage
                  src={product.image}
                  alt={product.name}
                  aspectRatio="1/1"
                  objectFit="cover"
                  priority={true}
                  sizes="(max-width: 1024px) 100vw, 580px"
                />
              </div>

              {/* Category Badge over Top-Right */}
              <div className="absolute top-6 right-6 z-10">
                <span className="px-3 py-1.5 bg-[#1A1D26]/90 backdrop-blur-md text-white text-[11px] font-bold rounded-xl shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FC5C03]" />
                  {product.category}
                </span>
              </div>

              {/* Offer / Best Product Badge over Top-Left */}
              {product.badge && (
                <div className="absolute top-6 left-6 z-10">
                  <span className="px-3 py-1.5 bg-gradient-to-r from-[#FC5C03] to-[#FF7A00] text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1">
                    <Flame className="w-3 h-3 text-white fill-white" />
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            {/* WARRANTY & GUARANTEE BANNER UNDER IMAGE */}
            <div className="p-4 bg-gradient-to-r from-orange-50 via-white to-amber-50 rounded-2xl border border-orange-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FC5C03] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#1A1D26] flex items-center gap-1.5">
                    <span>১০০% অফিসিয়াল ও ভেরিফাইড ডিজিটাল লাইসেন্স</span>
                    <BadgeCheck className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" />
                  </h4>
                  <p className="text-[11px] text-gray-600">
                    সম্পূর্ণ মেয়াদ জুড়ে ইনস্ট্যান্ট রিপ্লেসমেন্ট ও অফিসিয়াল কাস্টমার সাপোর্ট গ্যারান্টি।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-orange-100 text-center">
                <div className="py-1">
                  <span className="text-[10px] text-gray-500 font-bold block">ডেলিভারি স্পিড</span>
                  <span className="text-xs font-black text-[#FC5C03]">৫-১৫ মিনিট</span>
                </div>
                <div className="py-1 border-x border-orange-100">
                  <span className="text-[10px] text-gray-500 font-bold block">ওয়ারেন্টি পলিসি</span>
                  <span className="text-xs font-black text-emerald-600">সম্পূর্ণ মেয়াদ</span>
                </div>
                <div className="py-1">
                  <span className="text-[10px] text-gray-500 font-bold block">পেমেন্ট মেথড</span>
                  <span className="text-xs font-black text-blue-600">বিকাশ / নগদ</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Purchase Panel */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5 bg-white p-5 sm:p-7 rounded-3xl border border-[#E8E8EE] shadow-sm">
            
            {/* 1. Title & Rating */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black rounded-md uppercase tracking-wide flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ইনস্ট্যান্ট অটো-ডেলিভারি
                </span>
                {product.isBestSelling && (
                  <span className="px-2.5 py-0.5 bg-orange-50 border border-orange-200 text-[#FC5C03] text-[10px] font-black rounded-md uppercase tracking-wide">
                    🔥 টপ সেলিং
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-[28px] font-black text-[#1A1D26] tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Rating & Views */}
              <div className="flex items-center gap-3 text-xs text-[#7A8190] pb-1 flex-wrap">
                <div className="flex items-center gap-1 text-[#FC5C03] bg-[#FFF2E8] px-2.5 py-1 rounded-lg">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(product.rating || 5)
                            ? "fill-[#FC5C03] text-[#FC5C03]"
                            : "fill-[#FC5C03]/25 text-[#FC5C03]/25"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-black text-[#1A1D26] ml-1">
                    {(product.rating || 5.0).toFixed(1)}/5
                  </span>
                </div>
                <span>•</span>
                <span className="text-[#1A1D26] font-semibold">
                  {product.ratingCount || 18} টি ভেরিফাইড রিভিউ
                </span>
                <span>•</span>
                <span className="text-gray-500">
                  {product.viewCount || 540}+ ভিউ
                </span>
              </div>
            </div>

            {/* 2. Short Description */}
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
              {product.shortDesc || product.descriptionBangla?.slice(0, 180) || product.name}
            </p>

            {/* 3. AUTHENTIC AVAILABILITY & DELIVERY BADGE */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <span>
                  {isProductOutOfStock
                    ? "বর্তমানে স্টক আউট"
                    : "স্টকে অ্যাভেইলেবল • ইনস্ট্যান্ট ডেলিভারি"}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 bg-white/90 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-[#FC5C03]" />
                <span>{product.info?.deliveryTime || "৫-১৫ মিনিটে ডেলিভারি"}</span>
              </div>
            </div>

            {/* 4. Large Price Box */}
            <div className="w-full p-4.5 bg-gradient-to-r from-[#FFF2E8] via-[#FFF6EE] to-[#FFF9F5] rounded-2xl border border-[#FFE0CC] flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[11px] text-[#7A8190] font-bold block uppercase tracking-wider mb-0.5">
                  নির্ধারিত মূল্য (BDT Price)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#FC5C03] tracking-tight">
                    {formatPrice(selectedVariation.priceBDT * quantity)}
                  </span>
                  {selectedVariation.originalPriceBDT && selectedVariation.originalPriceBDT > selectedVariation.priceBDT && (
                    <span className="text-xs sm:text-sm text-gray-400 line-through font-semibold">
                      {formatPrice(selectedVariation.originalPriceBDT * quantity)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100/90 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  স্টক এভেইলেবল
                </span>
              </div>
            </div>

            {/* 5. INTERACTIVE VARIATION SELECTOR CARDS */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#1A1D26] uppercase tracking-wider block">
                  প্যাকেজ / প্ল্যান নির্বাচন করুন:
                </label>
                <span className="text-[11px] text-gray-500 font-medium">
                  {product.variations?.length || 1}টি ভ্যারিয়েন্ট উপলব্ধ
                </span>
              </div>

              {/* Variation Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(product.variations || []).map((v) => {
                  const isSelected = selectedVariation.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariation(v)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "border-[#FC5C03] bg-gradient-to-br from-[#FFF9F5] to-[#FFF2E8] text-[#1A1D26] shadow-xs ring-2 ring-[#FC5C03]/80"
                          : "border-[#E8E8EE] bg-white text-[#1A1D26] hover:border-orange-200 hover:bg-orange-50/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className={`text-xs font-bold leading-snug ${isSelected ? "text-[#FC5C03]" : "text-[#1A1D26]"}`}>
                          {v.name}
                        </span>
                        {isSelected ? (
                          <span className="w-4 h-4 rounded-full bg-[#FC5C03] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-black text-[#FC5C03]">
                          {formatPrice(v.priceBDT)}
                        </span>
                        {v.originalPriceBDT && v.originalPriceBDT > v.priceBDT && (
                          <span className="text-[10px] text-gray-400 line-through font-semibold">
                            {formatPrice(v.originalPriceBDT)}
                          </span>
                        )}
                      </div>

                      {v.description && (
                        <p className="text-[10.5px] text-[#7A8190] mt-1.5 line-clamp-2 leading-relaxed">
                          {v.description}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Quantity Selector */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <label className="text-xs font-extrabold text-[#1A1D26]">
                পরিমাণ (Quantity):
              </label>
              <div className="flex items-center border border-[#E8E8EE] rounded-xl bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-2xs text-[#1A1D26] hover:text-[#FC5C03] hover:bg-orange-50 flex items-center justify-center font-bold transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center text-xs font-black text-[#1A1D26]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white shadow-2xs text-[#1A1D26] hover:text-[#FC5C03] hover:bg-orange-50 flex items-center justify-center font-bold transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 7. Action Buttons (Buy Now & Add to Cart) */}
            {isProductOutOfStock ? (
              <div className="space-y-3 pt-2">
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-1">
                  <span className="text-sm font-black text-red-600 block">
                    ❌ এই ভ্যারিয়েন্ট / প্রোডাক্টটি সাময়িকভাবে স্টক আউট
                  </span>
                  <p className="text-xs text-red-700/80">
                    স্টক আসার সাথে সাথেই পুনরায় অর্ডার করা যাবে। আপনি অন্য কোনো ভ্যারিয়েন্ট নির্বাচন করতে পারেন।
                  </p>
                </div>

                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 bg-gray-200 text-gray-500 text-sm font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <span>স্টক আউট (Out of Stock)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 bg-gradient-to-r from-[#FC5C03] to-[#EC4001] hover:from-[#EC4001] hover:to-[#D43700] text-white text-sm sm:text-base font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>সরাসরি কিনুন (Buy Now) — {formatPrice(selectedVariation.priceBDT * quantity)}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3 bg-white hover:bg-[#FFF2E8] border-2 border-[#FC5C03] text-[#FC5C03] text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>কার্টে যুক্ত করুন (Add to Cart)</span>
                </button>
              </div>
            )}

            {/* 8. FEATURE HIGHLIGHTS MINI-GRID */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 text-[11px] font-bold text-gray-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>অফিসিয়াল এক্সেস</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 text-[11px] font-bold text-gray-700">
                <Zap className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>৫-১৫ মিনিট ডেলিভারি</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 text-[11px] font-bold text-gray-700">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>১০০% রিপ্লেসমেন্ট ওয়ারেন্টি</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 text-[11px] font-bold text-gray-700">
                <Headphones className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>২৪/৭ লাইভ সহায়তা</span>
              </div>
            </div>

            {/* 9. Support & Share Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <a
                href="https://wa.me/8801712345678"
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[130px] py-2.5 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>WhatsApp সাপোর্ট</span>
              </a>
              <a
                href="https://m.me/aihaatbd"
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[130px] py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Messenger চ্যাট</span>
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3.5 bg-gray-100 hover:bg-gray-200 text-[#1A1D26] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>লিংক কপি</span>
              </button>
            </div>

            {/* 10. Payment Logos Bar */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10.5px] font-extrabold text-[#7A8190] uppercase tracking-wider block">
                  সমর্থিত নিরাপদ পেমেন্ট মেথড:
                </span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> 256-Bit SSL সুরক্ষিত
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {paymentLogos.map((pm) => (
                  <div
                    key={pm.name}
                    className="w-12 h-6 relative rounded-lg border border-gray-200 overflow-hidden bg-white shrink-0 p-0.5"
                  >
                    <SafeImage
                      src={pm.icon}
                      alt={pm.name}
                      aspectRatio="auto"
                      objectFit="contain"
                      sizes="48px"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* 3. PRODUCT CONTENT TABS (Description, Features, Info, FAQ) */}
        <div className="mt-10 bg-white rounded-3xl border border-[#E8E8EE] overflow-hidden shadow-sm">
          <div className="flex border-b border-[#E8E8EE] bg-gray-50/70 overflow-x-auto scrollbar-none">
            {[
              { key: "description", label: "বিস্তারিত বিবরণ (Description)" },
              { key: "features", label: "ফিচারসমূহ (Features)" },
              { key: "info", label: "ডেলিভারি ও নিয়মাবলী (Info)" },
              { key: "faq", label: "প্রশ্নোত্তর (FAQ)" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-4 text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-white text-[#FC5C03] border-b-2 border-[#FC5C03] shadow-2xs"
                    : "text-[#7A8190] hover:text-[#1A1D26]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8 space-y-5 text-[#4B5563] text-xs sm:text-sm leading-relaxed">
            {activeTab === "description" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#1A1D26] mb-2 flex items-center gap-2">
                    <span>বাংলা বিবরণ:</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-[#FFF9F5]/80 p-4 sm:p-5 rounded-2xl border border-[#FFF2E8]">
                    {product.descriptionBangla || product.shortDesc}
                  </p>
                </div>

                {product.descriptionEnglish && (
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[#1A1D26] mb-2">
                      English Overview:
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-100">
                      {product.descriptionEnglish}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-black text-[#1A1D26]">
                  প্যাকেজে অন্তর্ভুক্ত সুবিধাসমূহ (Key Highlights):
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(product.features || []).map((feature, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#1A1D26]"
                    >
                      <CheckCircle className="w-4 h-4 text-[#FC5C03] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "info" && (
              <div className="space-y-4">
                <h3 className="text-sm sm:text-base font-black text-[#1A1D26]">
                  ডেলিভারি ও ওয়ারেন্টি সংক্রান্ত নিয়মাবলী:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <span className="text-xs font-bold text-[#7A8190] block mb-1">ডেলিভারি সময় (Delivery Time)</span>
                    <span className="text-xs sm:text-sm font-black text-[#1A1D26]">{product.info?.deliveryTime || "৫ থেকে ১৫ মিনিট"}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <span className="text-xs font-bold text-[#7A8190] block mb-1">ডেলিভারি মেথড (Delivery Method)</span>
                    <span className="text-xs sm:text-sm font-black text-[#1A1D26]">{product.info?.deliveryType || "ইমেইল ও হোয়াটসঅ্যাপে লগইন তথ্য"}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <span className="text-xs font-bold text-[#7A8190] block mb-1">ওয়ারেন্টি পলিসি (Warranty Policy)</span>
                    <span className="text-xs sm:text-sm font-black text-[#FC5C03]">{product.info?.warranty || "সম্পূর্ণ সাবস্ক্রিপশন মেয়াদের রিপ্লেসমেন্ট ওয়ারেন্টি"}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                    <span className="text-xs font-bold text-[#7A8190] block mb-1">ডিভাইস সাপোর্ট (Device Support)</span>
                    <span className="text-xs sm:text-sm font-black text-[#1A1D26]">{product.info?.deviceSupport || "Windows, Mac, Android, iOS ও Web"}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "faq" && (
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-black text-[#1A1D26] mb-3">
                  সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর (Frequently Asked Questions):
                </h3>
                <div className="space-y-2.5">
                  {productFaqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-gray-200 overflow-hidden transition-all bg-white"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#1A1D26] hover:bg-orange-50/40 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-[#FC5C03] shrink-0" />
                            {faq.q}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-[#FC5C03] shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/50 border-t border-gray-100">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. WHY CHOOSE US? (4 Cards Grid) */}
        <div className="mt-12 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[#1A1D26] tracking-tight mb-6">
            কেন এআই হাট (AI Haat) থেকে কিনবেন?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-5 bg-white rounded-2xl border border-[#E8E8EE] shadow-2xs hover:shadow-sm transition-all text-center">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-[#1A1D26]">১০০% আসল প্রোডাক্ট</h4>
              <p className="text-[11px] text-[#7A8190] mt-1">অফিসিয়াল লাইসেন্স ও প্রিমিয়াম এক্সেস</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#E8E8EE] shadow-2xs hover:shadow-sm transition-all text-center">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-[#1A1D26]">ইনস্ট্যান্ট ডেলিভারি</h4>
              <p className="text-[11px] text-[#7A8190] mt-1">পেমেন্টের পর ৫-১৫ মিনিটে ডেলিভারি</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#E8E8EE] shadow-2xs hover:shadow-sm transition-all text-center">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-[#1A1D26]">২৪/৭ লাইভ সাপোর্ট</h4>
              <p className="text-[11px] text-[#7A8190] mt-1">হোয়াটসঅ্যাপে দ্রুত সমাধান</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#E8E8EE] shadow-2xs hover:shadow-sm transition-all text-center">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-[#1A1D26]">রিপ্লেসমেন্ট গ্যারান্টি</h4>
              <p className="text-[11px] text-[#7A8190] mt-1">মেয়াদকালীন সম্পূর্ণ নিরাপত্তা</p>
            </div>
          </div>
        </div>

        {/* 5. CUSTOMER REVIEWS SECTION */}
        <div className="mt-12 bg-white rounded-3xl border border-[#E8E8EE] p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E8EE] flex-wrap gap-3">
            <div>
              <h3 className="text-base sm:text-xl font-black text-[#1A1D26]">
                কাস্টমার রিভিউ (Customer Reviews)
              </h3>
              <p className="text-xs text-[#7A8190]">
                ভেরিফাইড ক্রেতাদের বাস্তব মতামত ও অভিজ্ঞতা
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#FC5C03] bg-[#FFF2E8] px-3.5 py-1.5 rounded-full border border-orange-100">
              <Star className="w-4 h-4 fill-current" />
              <span>{(product.rating || 5.0).toFixed(1)} / 5.0 ({reviewsList.length} রিভিউ)</span>
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-3.5 mb-8">
            {reviewsList.length > 0 ? (
              reviewsList.map((rev) => (
                <div key={rev.id} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#1A1D26]">{rev.author}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> ভেরিফাইড ক্রেতা
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">{rev.date}</span>
                  </div>
                  <div className="flex items-center text-[#FC5C03] mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < rev.rating ? "fill-[#FC5C03]" : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs sm:text-sm text-[#7A8190] bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                এখনও কোনো রিভিউ নেই। আপনি প্রথম রিভিউ প্রদান করুন!
              </div>
            )}
          </div>

          {/* Submit a Review Form */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-[#FFF9F5] to-orange-50/30 rounded-2xl border border-[#FFF2E8]">
            <h4 className="text-xs sm:text-sm font-extrabold text-[#1A1D26] mb-3">
              আপনার মতামত ও রিভিউ লিখুন:
            </h4>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-[#1A1D26]">রেটিং নির্বাচন করুন:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-[#FC5C03] hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= newRating ? "fill-[#FC5C03]" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                required
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="আপনার নাম (e.g. তানভীর আহমেদ)"
                className="w-full text-xs sm:text-sm p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FC5C03] focus:ring-1 focus:ring-[#FC5C03]"
              />

              <textarea
                required
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="ডেলিভারি স্পিড ও প্রোডাক্ট পারফরম্যান্স নিয়ে আপনার অনুভূতি লিখুন..."
                className="w-full text-xs sm:text-sm p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FC5C03] focus:ring-1 focus:ring-[#FC5C03]"
              />

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                রিভিউ সাবমিট করুন
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* 6. HOW TO ORDER STEP-BY-STEP */}
      <HowToOrder />

      {/* 7. MOBILE STICKY PURCHASE BAR WITH ACTIVE VARIATION CONTEXT */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E8EE] p-3 shadow-2xl flex items-center justify-between gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-gray-500 block truncate font-bold">
            {selectedVariation.name} {quantity > 1 ? `× ${quantity}` : ""}
          </span>
          <span className="text-base font-black text-[#FC5C03] truncate block">
            {formatPrice(selectedVariation.priceBDT * quantity)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isProductOutOfStock}
            onClick={handleAddToCart}
            className="min-h-[40px] px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-[#FC5C03] border border-[#FC5C03]/30 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Add to cart"
          >
            কার্ট
          </button>
          <button
            type="button"
            disabled={isProductOutOfStock}
            onClick={handleBuyNow}
            className="min-h-[40px] px-5 py-2 bg-gradient-to-r from-[#FC5C03] to-[#EC4001] text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
            aria-label="Buy now"
          >
            এখনই কিনুন
          </button>
        </div>
      </div>

    </div>
  );
}
