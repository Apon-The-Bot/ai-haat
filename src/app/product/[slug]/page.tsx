"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import { PRODUCTS, getProductBySlug } from "@/data/products";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { HowToOrder } from "@/components/home/HowToOrder";
import { SafeImage } from "@/components/SafeImage";
import { PaymentLogo } from "@/components/PaymentLogo";
import { useProducts } from "@/context/ProductsContext";
import { Variation, Review } from "@/types";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { getProductBySlug } = useProducts();
  const product = getProductBySlug(slug) || PRODUCTS.find((p) => p.slug === slug) || PRODUCTS[0];
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [selectedVariation, setSelectedVariation] = useState<Variation>(
    product?.variations?.[0] || {
      id: "default",
      name: "Standard Edition",
      priceBDT: product?.minPriceBDT || 290,
      inStock: true,
    }
  );

  React.useEffect(() => {
    if (product?.variations?.[0]) {
      setSelectedVariation(product.variations[0]);
    }
  }, [product]);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"description" | "features" | "info">("description");

  // Reviews State
  const [reviewsList, setReviewsList] = useState<Review[]>(product.reviews || []);
  const [newRating, setNewRating] = useState<number>(5);
  const [newAuthor, setNewAuthor] = useState<string>("");
  const [newComment, setNewComment] = useState<string>("");

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("প্রোডাক্ট লিংক কপি করা হয়েছে!", "success");
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedVariation, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariation, quantity);
    router.push("/checkout");
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAuthor.trim() && newComment.trim()) {
      const createdReview: Review = {
        id: `rev-${Date.now()}`,
        author: newAuthor.trim(),
        rating: newRating,
        date: new Date().toISOString().split("T")[0],
        comment: newComment.trim(),
        isVerifiedPurchase: true,
      };
      setReviewsList((prev) => [createdReview, ...prev]);
      setNewAuthor("");
      setNewComment("");
      showToast("আপনার রিভিউ জমা হয়েছে। ধন্যবাদ!", "success");
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

  return (
    <div className="w-full bg-white pb-24 lg:pb-16">
      
      {/* 1. BREADCRUMB */}
      <div className="border-b border-[#E8E8EE] bg-gray-50/50 py-2.5">
        <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto text-xs text-[#7A8190] flex items-center flex-wrap gap-1.5">
          <Link href="/" className="hover:text-[#FC5C03] transition-colors">
            হোম
          </Link>
          <span>&gt;</span>
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#FC5C03] transition-colors"
          >
            {product.category}
          </Link>
          <span>&gt;</span>
          <span className="text-[#1A1D26] font-semibold truncate max-w-xs sm:max-w-md">
            {product.name}
          </span>
        </div>
      </div>

      {/* 2. MAIN PRODUCT AREA (Two-Column Desktop, Stacked Mobile) */}
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto pt-6 sm:pt-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Square Product Image (~48% Width) */}
          <div className="lg:col-span-6">
            <div className="relative aspect-square w-full max-w-[580px] mx-auto rounded-2xl overflow-hidden border border-[#E8E8EE] bg-gray-50 shadow-2xs">
              <SafeImage
                src={product.image}
                alt={product.name}
                aspectRatio="1/1"
                objectFit="cover"
                priority={true}
                sizes="(max-width: 1024px) 100vw, 580px"
              />

              {/* Category Badge over Top-Right */}
              <div className="absolute top-3 right-3 z-10">
                <span className="px-2.5 py-1 bg-[#1A1D26]/90 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg shadow-xs">
                  {product.category}
                </span>
              </div>

              {/* Offer Badge */}
              {product.badge && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 bg-[#FC5C03] text-white text-[11px] font-extrabold uppercase tracking-wider rounded-lg shadow-xs">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Purchase Panel (~52% Width) */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-4.5">
            
            {/* 1. Product Title (24px to 32px) */}
            <h1 className="text-xl sm:text-2xl lg:text-[28px] font-black text-[#1A1D26] tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* 2. Rating & View Count Row */}
            <div className="flex items-center gap-2.5 text-xs text-[#7A8190] pb-0.5">
              <div className="flex items-center gap-1 text-[#FC5C03]">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating)
                          ? "fill-[#FC5C03] text-[#FC5C03]"
                          : "fill-[#FC5C03]/25 text-[#FC5C03]/25"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-[#1A1D26] ml-1">
                  {product.rating.toFixed(1)}/5
                </span>
              </div>
              <span>•</span>
              <span className="text-[#7A8190]">
                {product.ratingCount} টি রিভিউ
              </span>
              <span>•</span>
              <span className="text-[#7A8190]">
                {product.viewCount}+ ভিউ
              </span>
            </div>

            {/* 3. Large Price Box */}
            <div className="w-full p-4 bg-gradient-to-r from-[#FFF2E8] to-[#FFF9F5] rounded-xl border border-[#FFF2E8] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#7A8190] font-bold block uppercase tracking-wider mb-0.5">
                  নির্ধারিত মূল্য
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#FC5C03] tracking-tight">
                  {formatPrice(selectedVariation.priceBDT * quantity)}
                </span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md">
                  <CheckCircle className="w-3.5 h-3.5" />
                  স্টক এভেইলেবল
                </span>
              </div>
            </div>

            {/* 4. "Select Version" Label & 5. Variation Option Cards */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-[#1A1D26] uppercase tracking-wider block">
                প্যাকেজ / প্ল্যান নির্বাচন করুন:
              </label>

              {/* Variation Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variations.map((v) => {
                  const isSelected = selectedVariation.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariation(v)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? "border-[#FC5C03] bg-[#FFF2E8] text-[#FC5C03] shadow-2xs ring-1 ring-[#FC5C03]"
                          : "border-[#E8E8EE] bg-white text-[#1A1D26] hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className={`text-xs font-bold leading-tight ${isSelected ? "text-[#FC5C03]" : "text-[#1A1D26]"}`}>
                          {v.name}
                        </span>
                        {isSelected && (
                          <span className="w-3.5 h-3.5 rounded-full bg-[#FC5C03] text-white flex items-center justify-center shrink-0">
                            <CheckCircle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-xs font-black text-[#FC5C03]">
                          {formatPrice(v.priceBDT)}
                        </span>
                        {v.originalPriceBDT && v.originalPriceBDT > v.priceBDT && (
                          <span className="text-[10px] text-gray-400 line-through font-semibold">
                            {formatPrice(v.originalPriceBDT)}
                          </span>
                        )}
                      </div>
                      {v.description && (
                        <p className="text-[10px] text-[#7A8190] mt-1 line-clamp-1">
                          {v.description}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Quantity Selector */}
            <div className="flex items-center gap-3 pt-1">
              <label className="text-xs font-bold text-[#1A1D26]">
                পরিমাণ (Quantity):
              </label>
              <div className="flex items-center border border-[#E8E8EE] rounded-lg bg-gray-50 p-0.5">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded bg-white shadow-2xs text-[#1A1D26] hover:text-[#FC5C03] flex items-center justify-center font-bold"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-[#1A1D26]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded bg-white shadow-2xs text-[#1A1D26] hover:text-[#FC5C03] flex items-center justify-center font-bold"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 7. Buy Now & 8. Add to Cart Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>সরাসরি কিনুন (Buy Now) - {formatPrice(selectedVariation.priceBDT * quantity)}</span>
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-2.5 bg-white hover:bg-[#FFF2E8] border border-[#FC5C03] text-[#FC5C03] text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>কার্টে যুক্ত করুন (Add to Cart)</span>
              </button>
            </div>

            {/* 9. AI Haat Verification Banner */}
            <div className="p-3 bg-gray-50 rounded-xl border border-[#E8E8EE] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FC5C03] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-[#1A1D26]">
                  এআই হাট অথেনটিক ডিজিটাল সেলার
                </h4>
                <p className="text-gray-600 text-[11px]">
                  ১০০% আসল লাইসেন্স ও সম্পূর্ণ মেয়াদ রিপ্লেসমেন্ট ওয়ারেন্টি।
                </p>
              </div>
            </div>

            {/* 10. Trust Cards (3 Cards) */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 bg-gray-50/70 rounded-xl border border-[#E8E8EE]">
                <Lock className="w-3.5 h-3.5 text-[#FC5C03] mx-auto mb-1" />
                <span className="text-[10.5px] font-bold text-[#1A1D26] block">নিরাপদ পেমেন্ট</span>
              </div>
              <div className="p-2.5 bg-gray-50/70 rounded-xl border border-[#E8E8EE]">
                <Zap className="w-3.5 h-3.5 text-[#FC5C03] mx-auto mb-1" />
                <span className="text-[10.5px] font-bold text-[#1A1D26] block">দ্রুত ডেলিভারি</span>
              </div>
              <div className="p-2.5 bg-gray-50/70 rounded-xl border border-[#E8E8EE]">
                <Headphones className="w-3.5 h-3.5 text-[#FC5C03] mx-auto mb-1" />
                <span className="text-[10.5px] font-bold text-[#1A1D26] block">২৪/৭ সাপোর্ট</span>
              </div>
            </div>

            {/* Accepted Payments Strip */}
            <div className="px-3 py-2 bg-white rounded-xl border border-[#E8E8EE] flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-gray-600">পেমেন্ট মেথড:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <PaymentLogo method="bkash" width={48} height={18} className="border border-pink-100 shadow-2xs" />
                <PaymentLogo method="nagad" width={48} height={18} className="border border-orange-100 shadow-2xs" />
                <PaymentLogo method="rocket" width={48} height={18} className="border border-purple-100 shadow-2xs" />
                <PaymentLogo method="upay" width={48} height={18} className="border border-blue-100 shadow-2xs" />
              </div>
            </div>

            {/* 11. Contact Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href="https://wa.me/8801712345678"
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[120px] py-2 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp এ চ্যাট</span>
              </a>
              <a
                href="https://m.me/aihaatbd"
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[120px] py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Messenger</span>
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-[#1A1D26] font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>লিংক কপি</span>
              </button>
            </div>

            {/* 12. Payment Logos */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[10px] font-bold text-[#7A8190] uppercase tracking-wider block mb-1.5">
                সমর্থিত পেমেন্ট মেথড:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {paymentLogos.map((pm) => (
                  <div
                    key={pm.name}
                    className="w-12 h-6 relative rounded border border-gray-200 overflow-hidden bg-white shrink-0"
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

        {/* 3. PRODUCT CONTENT TABS (Description, Features, Info) */}
        <div className="mt-8 bg-white rounded-xl border border-[#E8E8EE] overflow-hidden shadow-2xs">
          <div className="flex border-b border-[#E8E8EE] bg-gray-50/70 overflow-x-auto scrollbar-none">
            {[
              { key: "description", label: "বিস্তারিত বিবরণ (Description)" },
              { key: "features", label: "ফিচারসমূহ (Features)" },
              { key: "info", label: "ডেলিভারি ও নিয়মাবলী (Info)" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-[#FC5C03] border-b-2 border-[#FC5C03]"
                    : "text-[#7A8190] hover:text-[#1A1D26]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-7 space-y-4 text-[#4B5563] text-xs sm:text-sm leading-relaxed">
            {activeTab === "description" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1A1D26] mb-1.5">
                    বাংলা বিবরণ:
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-[#FFF9F5]/70 p-3.5 rounded-lg border border-[#FFF2E8]">
                    {product.descriptionBangla}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1A1D26] mb-1.5">
                    English Overview:
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {product.descriptionEnglish}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "features" && (
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-[#1A1D26]">
                  প্যাকেজে অন্তর্ভুক্ত সুবিধাসমূহ:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-2 text-xs font-semibold text-[#1A1D26]"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#FC5C03] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "info" && (
              <div className="space-y-3">
                <h3 className="text-sm sm:text-base font-bold text-[#1A1D26]">
                  ডেলিভারি ও ওয়ারেন্টি সংক্রান্ত নিয়মাবলী:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-xs font-bold text-[#7A8190] block mb-0.5">ডেলিভারি সময়</span>
                    <span className="text-xs font-bold text-[#1A1D26]">{product.info.deliveryTime}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-xs font-bold text-[#7A8190] block mb-0.5">ডেলিভারি মেথড</span>
                    <span className="text-xs font-bold text-[#1A1D26]">{product.info.deliveryType}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-xs font-bold text-[#7A8190] block mb-0.5">ওয়ারেন্টি পলিসি</span>
                    <span className="text-xs font-bold text-[#FC5C03]">{product.info.warranty}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-xs font-bold text-[#7A8190] block mb-0.5">ডিভাইস সাপোর্ট</span>
                    <span className="text-xs font-bold text-[#1A1D26]">{product.info.deviceSupport}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. WHY CHOOSE US? (4 Cards) */}
        <div className="mt-10 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-[#1A1D26] tracking-tight mb-5">
            কেন এআই হাট থেকে কিনবেন?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-[#E8E8EE] shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#1A1D26]">১০০% আসল প্রোডাক্ট</h4>
              <p className="text-[10px] text-[#7A8190] mt-0.5">অফিসিয়াল লাইসেন্স ও ইনভাইটেশন</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#E8E8EE] shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center mx-auto mb-2">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#1A1D26]">ইনস্ট্যান্ট ডেলিভারি</h4>
              <p className="text-[10px] text-[#7A8190] mt-0.5">পেমেন্টের পর ৫-১৫ মিনিটে ডেলিভারি</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#E8E8EE] shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center mx-auto mb-2">
                <Headphones className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#1A1D26]">২৪/৭ লাইভ সাপোর্ট</h4>
              <p className="text-[10px] text-[#7A8190] mt-0.5">হোয়াটসঅ্যাপে দ্রুত সমাধান</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-[#E8E8EE] shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center mx-auto mb-2">
                <RotateCcw className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-[#1A1D26]">রিপ্লেসমেন্ট গ্যারান্টি</h4>
              <p className="text-[10px] text-[#7A8190] mt-0.5">মেয়াদকালীন সম্পূর্ণ নিরাপত্তা</p>
            </div>
          </div>
        </div>

        {/* 5. CUSTOMER REVIEW SECTION */}
        <div className="mt-10 bg-white rounded-xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8EE]">
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1A1D26]">
                কাস্টমার রিভিউ (Customer Reviews)
              </h3>
              <p className="text-xs text-[#7A8190]">
                ভেরিফাইড ক্রেতাদের অভিজ্ঞতা
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#FC5C03] bg-[#FFF2E8] px-2.5 py-1 rounded-full">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating.toFixed(1)} / 5</span>
            </div>
          </div>

          {/* Review Items */}
          <div className="space-y-3 mb-6">
            {reviewsList.length > 0 ? (
              reviewsList.map((rev) => (
                <div key={rev.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#1A1D26]">{rev.author}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded flex items-center gap-0.5">
                          <CheckCircle className="w-2.5 h-2.5" /> ভেরিফাইড
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center text-[#FC5C03] mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-2.5 h-2.5 ${
                          i < rev.rating ? "fill-[#FC5C03]" : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#4B5563] leading-relaxed">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[#7A8190]">
                এখনও কোনো রিভিউ নেই। প্রথম রিভিউ প্রদান করুন!
              </div>
            )}
          </div>

          {/* Write a Review */}
          <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#FFF2E8]">
            <h4 className="text-xs font-bold text-[#1A1D26] mb-2.5">
              আপনার মতামত ও রিভিউ লিখুন
            </h4>
            <form onSubmit={handleReviewSubmit} className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1A1D26]">রেটিং:</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-0.5 text-[#FC5C03]"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
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
                placeholder="আপনার নাম (e.g. তানভীর)"
                className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
              />

              <textarea
                required
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="ডেলিভারি স্পিড ও প্রোডাক্ট পারফরম্যান্স নিয়ে আপনার অনুভূতি লিখুন..."
                className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                রিভিউ সাবমিট করুন
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* 6. HOW TO ORDER SECTION */}
      <HowToOrder />

      {/* 7. MOBILE STICKY PURCHASE BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E8E8EE] p-2.5 shadow-2xl flex items-center justify-between gap-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        <div>
          <span className="text-[10px] text-[#7A8190] block">মোট মূল্য:</span>
          <span className="text-sm font-black text-[#FC5C03]">
            {formatPrice(selectedVariation.priceBDT * quantity)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="px-3 py-2 bg-gray-100 text-[#FC5C03] border border-[#FC5C03]/30 rounded-lg text-xs font-bold"
          >
            কার্ট
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            className="px-4 py-2 bg-[#FC5C03] text-white rounded-lg text-xs font-bold shadow-sm"
          >
            এখনই কিনুন
          </button>
        </div>
      </div>

    </div>
  );
}
