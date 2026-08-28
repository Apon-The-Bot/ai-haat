"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowLeft,
  X,
  ExternalLink,
  MessageCircle,
  Mail,
  Smartphone,
  Wallet,
  Tag,
  CreditCard,
  Lock,
  Clock,
  AlertCircle,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { SafeImage } from "@/components/SafeImage";
import { COUPONS } from "@/data/coupons";
import { Coupon } from "@/types";
import { trackBeginCheckout, trackAddPaymentInfo } from "@/lib/analytics/client";
import { sanitizeItem } from "@/lib/analytics/sanitize";
import { getAttribution } from "@/lib/analytics/attribution";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotalBDT, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user, openLoginModal, refreshUser } = useAuth();
  const { showToast } = useToast();

  // Form State
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "gateway">("gateway");
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [deliveryMethod, setDeliveryMethod] = useState<"EMAIL" | "WHATSAPP" | "MESSENGER">("EMAIL");
  const [deliveryHandle, setDeliveryHandle] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal State
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountBDT: number;
    discountType?: string;
    discountValue?: number;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Populate customer info if logged in
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || "");
      if (!email) setEmail(user.email || "");
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Set default payment method to wallet if user has sufficient funds
  useEffect(() => {
    if (user && (user.walletBalanceBDT || 0) >= subtotalBDT && subtotalBDT > 0) {
      setPaymentMethod("wallet");
    }
  }, [user, subtotalBDT]);

  // Analytics: Track begin_checkout once on mount
  const checkoutTrackedRef = useRef(false);
  useEffect(() => {
    if (checkoutTrackedRef.current || items.length === 0) return;
    checkoutTrackedRef.current = true;
    try {
      const analyticsItems = items.map((i) => sanitizeItem({
        id: i.product.id,
        name: i.product.name,
        category: i.product.category,
        variant: i.selectedVariation.name,
        price: i.selectedVariation.priceBDT,
        quantity: i.quantity,
      }));
      trackBeginCheckout(analyticsItems, subtotalBDT, appliedCoupon?.code);
    } catch {}
  }, [items, subtotalBDT, appliedCoupon]);

  // Analytics: Track payment method selection
  const lastTrackedMethodRef = useRef<string>("");
  useEffect(() => {
    if (lastTrackedMethodRef.current === paymentMethod) return;
    if (items.length === 0) return;
    lastTrackedMethodRef.current = paymentMethod;
    try {
      const label = paymentMethod === "wallet" ? "Wallet" : "Gateway";
      const analyticsItems = items.map((i) => sanitizeItem({
        id: i.product.id,
        name: i.product.name,
        category: i.product.category,
        variant: i.selectedVariation.name,
        price: i.selectedVariation.priceBDT,
        quantity: i.quantity,
      }));
      trackAddPaymentInfo(label, analyticsItems, subtotalBDT);
    } catch {}
  }, [paymentMethod, items, subtotalBDT]);

  // Lifecycle Abandoned Cart Intent Tracking
  useEffect(() => {
    if (!email || !email.includes("@") || items.length === 0) return;
    const timeout = setTimeout(() => {
      fetch("/api/cart/abandon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          name: fullName.trim() || undefined,
          items: items.map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            variationId: i.selectedVariation.id,
            variationName: i.selectedVariation.name,
            priceBDT: i.selectedVariation.priceBDT,
            quantity: i.quantity,
            image: i.product.image,
          })),
          subtotalBDT,
          appliedCoupon: appliedCoupon?.code,
        }),
      }).catch(() => {});
    }, 1500);

    return () => clearTimeout(timeout);
  }, [email, phone, fullName, items, subtotalBDT, appliedCoupon]);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = couponCodeInput.trim().toUpperCase();
    if (!cleanCode) return;
    if (items.length === 0) return;

    setIsValidatingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          items: items.map((i) => ({
            productId: i.product.id,
            variationId: i.selectedVariation.id,
            productName: i.product.name,
            variationName: i.selectedVariation.name,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid && data.coupon) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountBDT: data.coupon.discountBDT || 0,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
        });
        setCouponError("");
        showToast(
          `কুপন "${data.coupon.code}" সফলভাবে যুক্ত হয়েছে! ৳${data.coupon.discountBDT} ছাড়।`,
          "success"
        );
      } else {
        setCouponError(data.error || "কুপন কোডটি সঠিক নয় বা শর্ত পূরণ করেনি।");
        showToast(data.error || "অবৈধ কুপন কোড", "error");
      }
    } catch {
      // Local fallback
      const found = COUPONS.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);
      if (found) {
        let disc = 0;
        if (found.discountType === "PERCENTAGE") {
          disc = Math.round((subtotalBDT * found.discountValue) / 100);
          if (found.maxDiscountBDT) disc = Math.min(disc, found.maxDiscountBDT);
        } else {
          disc = Math.min(found.discountValue, subtotalBDT);
        }
        if (subtotalBDT >= found.minOrderBDT) {
          setAppliedCoupon({
            code: found.code,
            discountBDT: disc,
            discountType: found.discountType,
            discountValue: found.discountValue,
          });
          setCouponError("");
          showToast(`কুপন "${found.code}" যুক্ত হয়েছে! ৳${disc} ছাড়।`, "success");
        } else {
          setCouponError(`এই কুপনের জন্য সর্বনিম্ন অর্ডার ৳${found.minOrderBDT} প্রয়োজন।`);
          showToast(`সর্বনিম্ন অর্ডার ৳${found.minOrderBDT} প্রয়োজন।`, "error");
        }
      } else {
        setCouponError("কুপন কোডটি সঠিক নয়।");
        showToast("কুপন কোডটি সঠিক নয়।", "error");
      }
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponError("");
    showToast("কুপন রিমুভ করা হয়েছে", "info");
  };

  const discountBDT = appliedCoupon ? appliedCoupon.discountBDT : 0;
  const finalTotalBDT = Math.max(0, subtotalBDT - discountBDT);

  const walletBalance = user?.walletBalanceBDT || 0;
  const hasEnoughWalletBalance = user ? walletBalance >= finalTotalBDT : false;
  const walletShortage = Math.max(0, finalTotalBDT - walletBalance);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Direct Login check
    if (!user) {
      openLoginModal("/checkout");
      return;
    }

    if (items.length === 0) {
      showToast("আপনার কার্ট খালি!", "error");
      return;
    }

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/[\s-]/g, "").trim();

    if (!cleanFullName || !cleanEmail || !cleanPhone) {
      showToast("দয়া করে আপনার নাম, ইমেইল ও মোবাইল নাম্বার দিন।", "error");
      return;
    }

    // Bangladesh phone validation
    if (!/^(\+?88)?01[3-9]\d{8}$/.test(cleanPhone)) {
      showToast("অনুগ্রহ করে সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01700000000)।", "error");
      return;
    }

    if (deliveryMethod === "WHATSAPP" && !cleanPhone && !deliveryHandle.trim()) {
      showToast("দয়া করে আপনার হোয়াটসঅ্যাপ নাম্বার প্রদান করুন।", "error");
      return;
    }

    if (deliveryMethod === "MESSENGER" && !deliveryHandle.trim()) {
      showToast("দয়া করে আপনার ফেসবুক প্রোফাইল লিংক বা ইউজারনেম দিন।", "error");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const effectiveDeliveryHandle =
      deliveryMethod === "WHATSAPP"
        ? deliveryHandle.trim() || cleanPhone
        : deliveryMethod === "MESSENGER"
        ? deliveryHandle.trim()
        : cleanEmail;

    const fullOrderNotes = [
      notes.trim() ? `Note: ${notes.trim()}` : "",
      `Preferred Delivery: ${deliveryMethod} (${effectiveDeliveryHandle})`,
    ]
      .filter(Boolean)
      .join(" | ");

    let realOrderId = "";

    // 2. Save order in backend and receive authoritative Order Number
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: cleanFullName,
          customerEmail: cleanEmail,
          customerPhone: cleanPhone,
          items: items.map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            name: i.product.name,
            variationId: i.selectedVariation.id,
            variationName: i.selectedVariation.name,
            priceBDT: i.selectedVariation.priceBDT,
            quantity: i.quantity,
            image: i.product.image,
          })),
          subtotalBDT,
          discountBDT,
          couponCode: appliedCoupon?.code || null,
          totalBDT: finalTotalBDT,
          paymentMethod,
          senderNumber: paymentMethod === "wallet" ? "WALLET" : "GATEWAY",
          trxId: paymentMethod === "wallet" ? "WAL_PENDING" : "GATEWAY_PENDING",
          notes: fullOrderNotes,
          // Marketing Attribution
          ...getAttribution(),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        showToast(orderData.error || "অর্ডার তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
        setIsSubmitting(false);
        return;
      }

      realOrderId = orderData.order?.orderNumber || orderData.order?.id;
      if (!realOrderId) {
        showToast("অর্ডার আইডি পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।", "error");
        setIsSubmitting(false);
        return;
      }
    } catch (e) {
      console.error("[Order Save Error]:", e);
      showToast("নেটওয়ার্ক সমস্যার কারণে অর্ডার তৈরি করা যায়নি।", "error");
      setIsSubmitting(false);
      return;
    }

    // 3. EXPRESS WALLET PAYMENT FLOW
    if (paymentMethod === "wallet") {
      if (!hasEnoughWalletBalance) {
        showToast(
          `ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই (বর্তমান: ৳${walletBalance}, প্রয়োজন: ৳${finalTotalBDT})।`,
          "error"
        );
        setIsSubmitting(false);
        return;
      }

      try {
        const wRes = await fetch("/api/wallet/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: realOrderId,
            amountBDT: finalTotalBDT,
            customerEmail: user.email,
          }),
        });

        const wData = await wRes.json();
        if (!wRes.ok || !wData.success) {
          showToast(wData.error || "ওয়ালেট পেমেন্ট ব্যর্থ হয়েছে।", "error");
          setIsSubmitting(false);
          return;
        }

        refreshUser();
        clearCart();
        window.location.href = `/checkout/success?orderId=${encodeURIComponent(
          realOrderId
        )}&status=completed&trxId=WAL-${encodeURIComponent(realOrderId)}`;
        return;
      } catch (err) {
        console.error("Wallet checkout error:", err);
        showToast("ওয়ালেট পেমেন্টে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
        setIsSubmitting(false);
        return;
      }
    }

    // 4. AUTOMATED PIPRAPAY GATEWAY FLOW (bKash, Nagad, Rocket, Cards)
    if (paymentMethod === "gateway") {
      try {
        const res = await fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: realOrderId,
            amount: finalTotalBDT,
            customerName: cleanFullName,
            customerEmail: cleanEmail,
            customerPhone: cleanPhone,
            metadata: {
              deliveryMethod,
              deliveryDestination: effectiveDeliveryHandle,
              userId: user.id,
            },
          }),
        });

        const data = await res.json();

        if (data.success && data.pp_url) {
          clearCart();
          window.location.href = data.pp_url;
          return;
        } else {
          showToast(
            data.message || data.error || "অনলাইন পেমেন্ট গেটওয়ে সংযোগ ব্যর্থ হয়েছে।",
            "error"
          );
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("Gateway redirect error:", err);
        showToast("অনলাইন পেমেন্ট গেটওয়েতে সংযোগ করতে পারছে না।", "error");
        setIsSubmitting(false);
        return;
      }
    }

    setCreatedOrderId(realOrderId);
    setIsSubmitting(false);
    setIsSuccessModalOpen(true);
    clearCart();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E8EE]">
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="p-2 rounded-xl bg-white border border-[#E8E8EE] text-[#7A8190] hover:text-[#1A1D26] hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#1A1D26] tracking-tight">
                অর্ডার চেকআউট (Order Checkout)
              </h1>
              <p className="text-xs text-[#7A8190]">
                ইনস্ট্যান্ট অটো-ডেলিভারি • ১০০% রিপ্লেসমেন্ট ওয়ারেন্টি • ২৫৬-বিট এনক্রিপশন
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted & Verified</span>
          </div>
        </div>

        {items.length > 0 ? (
          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* LEFT COLUMN: Customer Info, Delivery Selector, Payment Method (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Customer Details (Auto-prefilled from session) */}
                <div className="bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-7 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-sm sm:text-base font-bold text-[#1A1D26] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center text-xs font-black">
                        1
                      </span>
                      <span>ক্রেতার তথ্য (Customer Details)</span>
                    </h3>
                    {user ? (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        লগইন অ্যাকাউন্ট তথ্য সংযুক্ত
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openLoginModal("/checkout")}
                        className="text-xs font-bold text-[#FC5C03] hover:underline"
                      >
                        দ্রুত লগইন করুন →
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1.5">
                        পুরো নাম (Full Name) *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="আপনার পুরো নাম লিখুন"
                        className="w-full text-xs sm:text-sm p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FC5C03] focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1.5">
                        ইমেইল অ্যাড্রেস (Delivery Email) *
                      </label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full text-xs sm:text-sm p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FC5C03] focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-[#1A1D26]">
                          মোবাইল / WhatsApp নাম্বার *
                        </label>
                        <span className="text-[10.5px] text-gray-400 font-medium">যেমন: 01700000000</span>
                      </div>
                      <input
                        type="tel"
                        required
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full text-xs sm:text-sm p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FC5C03] focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Delivery Destination Selector (Email, WhatsApp, Messenger) */}
                <div className="bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-7 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-sm sm:text-base font-bold text-[#1A1D26] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center text-xs font-black">
                        2
                      </span>
                      <span>ডিজিটাল ডেলিভারি মাধ্যম (Delivery Destination)</span>
                    </h3>
                    <span className="text-[11px] font-bold text-[#FC5C03] bg-[#FFF2E8] px-2 py-0.5 rounded-full">
                      ইনস্ট্যান্ট ডেলিভারি
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    অর্ডার সম্পন্ন হওয়ার পর লাইসেন্স কি, লগইন ইনফো ও ইনভয়েস কোন মাধ্যমে পেতে চান সিলেক্ট করুন:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Option A: Email */}
                    <div
                      onClick={() => setDeliveryMethod("EMAIL")}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 text-left ${
                        deliveryMethod === "EMAIL"
                          ? "border-[#FC5C03] bg-[#FFF9F5] shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FC5C03] flex items-center justify-center">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-[#FC5C03]">
                          {deliveryMethod === "EMAIL" && (
                            <div className="w-2 h-2 rounded-full bg-[#FC5C03]" />
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#1A1D26] block">
                          ইমেইল ও ভল্ট
                        </span>
                        <span className="text-[10.5px] text-gray-500">
                          ইনবক্স ও ড্যাশবোর্ড
                        </span>
                      </div>
                    </div>

                    {/* Option B: WhatsApp */}
                    <div
                      onClick={() => setDeliveryMethod("WHATSAPP")}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 text-left ${
                        deliveryMethod === "WHATSAPP"
                          ? "border-[#FC5C03] bg-[#FFF9F5] shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-[#FC5C03]">
                          {deliveryMethod === "WHATSAPP" && (
                            <div className="w-2 h-2 rounded-full bg-[#FC5C03]" />
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#1A1D26] block">
                          হোয়াটসঅ্যাপ
                        </span>
                        <span className="text-[10.5px] text-gray-500">
                          সরাসরি WhatsApp মেসেজ
                        </span>
                      </div>
                    </div>

                    {/* Option C: Messenger */}
                    <div
                      onClick={() => setDeliveryMethod("MESSENGER")}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 text-left ${
                        deliveryMethod === "MESSENGER"
                          ? "border-[#FC5C03] bg-[#FFF9F5] shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center border-[#FC5C03]">
                          {deliveryMethod === "MESSENGER" && (
                            <div className="w-2 h-2 rounded-full bg-[#FC5C03]" />
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#1A1D26] block">
                          মেসেঞ্জার
                        </span>
                        <span className="text-[10.5px] text-gray-500">
                          Facebook Messenger
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic delivery destination input if WhatsApp or Messenger */}
                  {deliveryMethod === "WHATSAPP" && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                        হোয়াটসঅ্যাপ ডেলিভারি নাম্বার (যদি মোবাইল নাম্বারের চেয়ে ভিন্ন হয়):
                      </label>
                      <input
                        type="tel"
                        value={deliveryHandle}
                        onChange={(e) => setDeliveryHandle(e.target.value)}
                        placeholder={phone || "+8801XXXXXXXXX"}
                        className="w-full text-xs p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FC5C03]"
                      />
                    </div>
                  )}

                  {deliveryMethod === "MESSENGER" && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                        ফেসবুক প্রোফাইল লিংক বা ইউজারনেম:
                      </label>
                      <input
                        type="text"
                        value={deliveryHandle}
                        onChange={(e) => setDeliveryHandle(e.target.value)}
                        placeholder="facebook.com/username অথবা আপনার ইউজারনেম"
                        className="w-full text-xs p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FC5C03]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                      বিশেষ নির্দেশনা / কাস্টম নোট (ঐচ্ছিক):
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="অর্ডারের সাথে কোনো বিশেষ নোট দিতে চাইলে লিখুন..."
                      className="w-full text-xs p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FC5C03]"
                    />
                  </div>
                </div>

                {/* 3. Payment Method: Express Wallet vs Automated Gateway */}
                <div className="bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-7 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-sm sm:text-base font-bold text-[#1A1D26] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center text-xs font-black">
                        3
                      </span>
                      <span>পেমেন্ট মেথড নির্বাচন (Payment Method)</span>
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* OPTION 1: EXPRESS 1-CLICK WALLET CHECKOUT */}
                    <div
                      onClick={() => {
                        if (user) setPaymentMethod("wallet");
                        else openLoginModal("/checkout");
                      }}
                      className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "wallet"
                          ? "border-[#FC5C03] bg-[#FFF9F5] shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-[#1A1D26] text-[#FC5C03] flex items-center justify-center shrink-0 shadow-xs font-black text-base">
                            ৳
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-[#1A1D26]">
                                AI Haat Wallet (Express 1-Click Pay)
                              </span>
                              <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-[#1A1D26] text-[#FC5C03] rounded-full">
                                Fastest
                              </span>
                            </div>

                            {user ? (
                              <div className="pt-1 text-xs">
                                <span className="text-gray-500">
                                  বর্তমান ব্যালেন্স:{" "}
                                  <strong className="text-[#1A1D26]">
                                    {formatPrice(walletBalance)}
                                  </strong>
                                </span>
                                {hasEnoughWalletBalance ? (
                                  <span className="text-emerald-600 font-bold ml-2">
                                    (পর্যাপ্ত ব্যালেন্স আছে ✓)
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-bold ml-2">
                                    (৳{walletShortage} কম আছে)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 pt-1">
                                ওয়ালেট ব্যালেন্স ব্যবহারের জন্য লগইন করুন।
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-[#FC5C03]">
                          {paymentMethod === "wallet" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FC5C03]" />
                          )}
                        </div>
                      </div>

                      {/* Insufficient balance warning + top up link */}
                      {user && paymentMethod === "wallet" && !hasEnoughWalletBalance && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                              অর্ডার সম্পন্ন করতে আরো ৳{walletShortage} ব্যালেন্স রিচার্জ করুন।
                            </span>
                          </div>
                          <Link
                            href="/wallet"
                            target="_blank"
                            className="px-3 py-1 bg-[#1A1D26] text-white rounded-lg font-bold hover:bg-black transition-colors shrink-0 flex items-center gap-1"
                          >
                            <PlusCircle className="w-3 h-3 text-[#FC5C03]" />
                            <span>রিচার্জ করুন</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* OPTION 2: AUTOMATED PIPRAPAY GATEWAY */}
                    <div
                      onClick={() => setPaymentMethod("gateway")}
                      className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "gateway"
                          ? "border-[#FC5C03] bg-[#FFF9F5] shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-[#FC5C03] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Zap className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-[#1A1D26]">
                                অনলাইন পেমেন্ট গেটওয়ে (PipraPay Automated)
                              </span>
                              <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-[#FC5C03] text-white rounded-full">
                                Instant Auto
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 pt-0.5">
                              bKash, Nagad, Rocket, Upay, Visa, MasterCard ও ইন্টারনেট ব্যাংকিং।
                            </p>

                            {/* Method Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap pt-2">
                              <span className="px-2 py-0.5 bg-pink-50 text-[#E2136E] border border-pink-200 text-[10px] font-bold rounded-md">
                                bKash
                              </span>
                              <span className="px-2 py-0.5 bg-orange-50 text-[#F7941D] border border-orange-200 text-[10px] font-bold rounded-md">
                                Nagad
                              </span>
                              <span className="px-2 py-0.5 bg-purple-50 text-[#8C3494] border border-purple-200 text-[10px] font-bold rounded-md">
                                Rocket
                              </span>
                              <span className="px-2 py-0.5 bg-blue-50 text-[#002D62] border border-blue-200 text-[10px] font-bold rounded-md">
                                Upay
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold rounded-md">
                                Cards & Banks
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-[#FC5C03]">
                          {paymentMethod === "gateway" && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#FC5C03]" />
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Order Summary, Coupon Validation & CTA (5 Cols) */}
              <div className="lg:col-span-5 space-y-5 sticky top-[80px]">
                
                <div className="bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-7 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-base font-black text-[#1A1D26]">
                      অর্ডার সামারি ({items.length} {items.length === 1 ? "Item" : "Items"})
                    </h3>
                    <Link
                      href="/cart"
                      className="text-xs font-bold text-[#FC5C03] hover:underline"
                    >
                      এডিট কার্ট
                    </Link>
                  </div>

                  {/* Itemized Order List */}
                  <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.selectedVariation.id}`}
                        className="py-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-11 h-11 relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                            <SafeImage
                              src={item.product.image}
                              alt={item.product.name}
                              aspectRatio="1/1"
                              objectFit="cover"
                              sizes="44px"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#1A1D26] truncate">
                              {item.product.name}
                            </h4>
                            <span className="text-[10.5px] text-gray-500 block truncate">
                              {item.selectedVariation.name} × {item.quantity}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-slate-900 shrink-0">
                          {formatPrice(item.selectedVariation.priceBDT * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Validation Input in Checkout */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="block text-xs font-bold text-[#1A1D26] mb-1.5">
                      কুপন ডিসকাউন্ট কোড
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          placeholder="PROMO CODE"
                          className="w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-[#FC5C03]"
                        />
                      </div>
                      {appliedCoupon ? (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="px-3 py-2 bg-red-100 text-red-700 text-xs font-bold rounded-xl hover:bg-red-200 transition-colors cursor-pointer"
                        >
                          রিমুভ
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isValidatingCoupon || !couponCodeInput.trim()}
                          onClick={() => handleApplyCoupon()}
                          className="px-4 py-2 bg-[#1A1D26] hover:bg-black disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          {isValidatingCoupon ? "..." : "এপ্লাই"}
                        </button>
                      )}
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-red-500 font-semibold mt-1">
                        {couponError}
                      </p>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-2 border-t border-gray-100 space-y-2.5 text-xs sm:text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>সাবটোটাল</span>
                      <span className="font-bold text-[#1A1D26]">{formatPrice(subtotalBDT)}</span>
                    </div>

                    {discountBDT > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          <span>কুপন ছাড় ({appliedCoupon?.code})</span>
                        </span>
                        <span>-{formatPrice(discountBDT)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span>ডেলিভারি চার্জ</span>
                      <span className="font-bold text-emerald-600 uppercase text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                        ফ্রি
                      </span>
                    </div>

                    <div className="flex justify-between text-sm sm:text-base font-black text-[#1A1D26] pt-3 border-t border-gray-200">
                      <span>সর্বমোট প্রদেয় মূল্য</span>
                      <span className="text-[#FC5C03] text-xl">{formatPrice(finalTotalBDT)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#FC5C03] hover:bg-[#EC4001] disabled:bg-gray-400 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : paymentMethod === "wallet" ? (
                      <span className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        <span>১-ক্লিক ওয়ালেট পে ({formatPrice(finalTotalBDT)})</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span>পেমেন্ট ও অর্ডার সম্পন্ন করুন ({formatPrice(finalTotalBDT)})</span>
                      </span>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>সকল ট্রানজেকশন ১০০% নিরাপদ ও এনক্রিপ্টেড</span>
                    </p>
                  </div>

                </div>

              </div>

            </div>
          </form>
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#E8E8EE] max-w-lg mx-auto p-8 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-[#1A1D26]">আপনার কার্ট বর্তমানে খালি</h2>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              প্রোডাক্ট শপে যান
            </Link>
          </div>
        )}

      </div>

      {/* SUCCESS MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1A1D26]">
                অর্ডার সফলভাবে গ্রহণ করা হয়েছে!
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-1">Order #{createdOrderId}</p>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              আপনার অর্ডারটি সিস্টেমে যুক্ত হয়েছে। ৫ থেকে ১৫ মিনিটের মধ্যে আপনার ডিজিটাল ভল্ট ও {deliveryMethod === "EMAIL" ? "ইমেইলে" : deliveryMethod === "WHATSAPP" ? "হোয়াটসঅ্যাপে" : "মেসেঞ্জারে"} ডেলিভারি করা হবে।
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href="/dashboard/keys"
                className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                ডিজিটাল ভল্ট দেখুন
              </Link>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-black font-semibold cursor-pointer"
              >
                হোমপেজে ফিরে যান
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CheckoutPageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <div className="w-7 h-7 border-3 border-[#FC5C03] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

