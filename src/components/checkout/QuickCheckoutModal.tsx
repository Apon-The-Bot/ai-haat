"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Zap,
  ShieldCheck,
  CreditCard,
  Wallet,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  AlertCircle,
  Lock,
  Mail,
  MessageCircle,
  Gift,
  Copy,
} from "lucide-react";
import { useQuickCheckout } from "@/context/QuickCheckoutContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { SafeImage } from "@/components/SafeImage";
import { Variation } from "@/types";
import { getAttribution } from "@/lib/analytics/attribution";
import { DigitalGiftingSection, GiftFormData } from "@/components/checkout/DigitalGiftingSection";

export function QuickCheckoutModal() {
  const router = useRouter();
  const {
    isOpen,
    product,
    selectedVariation,
    initialQuantity,
    closeQuickCheckout,
    setSelectedVariation,
  } = useQuickCheckout();
  const { formatPrice } = useCurrency();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"gateway" | "wallet">("gateway");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"EMAIL" | "WHATSAPP">("EMAIL");
  const [deliveryHandle, setDeliveryHandle] = useState("");
  const [notes, setNotes] = useState("");

  // Coupon
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountBDT: number;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [giftData, setGiftData] = useState<GiftFormData>({
    isGift: false,
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    giftMessage: "",
    giftTheme: "neon",
    hidePriceOnGift: true,
  });
  const [successOrder, setSuccessOrder] = useState<{
    orderId: string;
    orderNumber: string;
    paidViaWallet: boolean;
    giftClaimToken?: string | null;
    recipientName?: string | null;
    recipientPhone?: string | null;
  } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-populate user data on open or login
  useEffect(() => {
    if (user && isOpen) {
      setFullName((prev) => prev || user.name || "");
      setEmail((prev) => prev || user.email || "");
      setPhone((prev) => prev || user.phone || "");
    }
  }, [user, isOpen]);

  // Reset state when opening a new product
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity > 0 ? initialQuantity : 1);
      setAppliedCoupon(null);
      setCouponCode("");
      setShowCouponInput(false);
      setSuccessOrder(null);
      setIsSubmitting(false);

      // Default to wallet if user has balance
      if (user && (user.walletBalanceBDT || 0) > 0) {
        setPaymentMethod("wallet");
      } else {
        setPaymentMethod("gateway");
      }
    }
  }, [isOpen, product, user, initialQuantity]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        closeQuickCheckout();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, closeQuickCheckout]);

  if (!isOpen || !product) return null;

  const unitPrice = selectedVariation?.priceBDT ?? product.minPriceBDT ?? 0;
  const subtotalBDT = unitPrice * quantity;
  const couponDiscountBDT = appliedCoupon?.discountBDT ?? 0;
  const totalBDT = Math.max(0, subtotalBDT - couponDiscountBDT);

  const isCurrentOutOfStock =
    product.inStock === false ||
    (selectedVariation ? selectedVariation.inStock === false : false);

  const walletBalance = Number(user?.walletBalanceBDT || 0);
  const canPayWithWallet = user && walletBalance >= totalBDT;

  // Coupon Validation Handler
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    setIsValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          items: [
            {
              productId: product.id,
              variationId: selectedVariation?.id === "default" ? null : selectedVariation?.id,
              priceBDT: unitPrice,
              quantity,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.isValid) {
        showToast(data.error || "অবৈধ অথবা মেয়াদোত্তীর্ণ কুপন কোড।", "error");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: cleanCode,
          discountBDT: data.quote?.discountBDT || data.coupon?.discountBDT || 0,
        });
        showToast(`কুপন "${cleanCode}" সফলভাবে প্রয়োগ করা হয়েছে!`, "success");
      }
    } catch {
      showToast("কুপন যাচাই করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // 1-Click Order Submission Handler
  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isCurrentOutOfStock) {
      showToast("দুঃখিত, নির্বাচিত অপশনটি বর্তমানে স্টক আউট।", "error");
      return;
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/[^\d+]/g, "");

    if (!cleanName) {
      showToast("অনুগ্রহ করে আপনার পুরো নাম প্রদান করুন।", "error");
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      showToast("অনুগ্রহ করে একটি সঠিক ইমেইল প্রদান করুন।", "error");
      return;
    }
    const digitsOnly = cleanPhone.replace(/\D/g, "");
    if (!cleanPhone || digitsOnly.length < 11) {
      showToast("অনুগ্রহ করে একটি সঠিক ১১ ডিজিটের মোবাইল নাম্বার প্রদান করুন (যেমন: 017XXXXXXXX)।", "error");
      return;
    }

    if (paymentMethod === "wallet" && !canPayWithWallet) {
      showToast(
        `ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই (বর্তমান: ${formatPrice(walletBalance)}, প্রয়োজন: ${formatPrice(totalBDT)})। বিকাশ/নগদ সিলেক্ট করুন।`,
        "error"
      );
      return;
    }

    if (giftData.isGift && !giftData.recipientName.trim()) {
      showToast("দয়া করে উপহার প্রাপক বন্ধুর নাম লিখুন।", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const effectiveHandle = deliveryMethod === "WHATSAPP" ? deliveryHandle.trim() || cleanPhone : cleanEmail;
      const combinedNotes = [
        notes.trim() ? `Note: ${notes.trim()}` : "",
        `[1-Click Express Buy] Preferred Delivery: ${deliveryMethod} (${effectiveHandle})`,
        giftData.isGift ? `[GIFT ORDER for ${giftData.recipientName.trim()}]` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      // 1. Create Order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: cleanName,
          customerEmail: cleanEmail,
          customerPhone: cleanPhone,
          items: [
            {
              productId: product.id,
              productName: product.name,
              name: product.name,
              variationId: selectedVariation?.id === "default" ? null : (selectedVariation?.id || null),
              variationName: selectedVariation?.name || "Standard",
              priceBDT: unitPrice,
              quantity,
              image: product.image,
            },
          ],
          subtotalBDT,
          discountBDT: couponDiscountBDT,
          couponCode: appliedCoupon?.code || null,
          totalBDT,
          paymentMethod,
          senderNumber: paymentMethod === "wallet" ? "WALLET" : "GATEWAY",
          trxId: paymentMethod === "wallet" ? "WAL_QUICK_PENDING" : "GATEWAY_QUICK_PENDING",
          notes: combinedNotes,
          // Direct Product Gifting
          isGift: giftData.isGift,
          recipientName: giftData.isGift ? giftData.recipientName.trim() : null,
          recipientEmail: giftData.isGift ? giftData.recipientEmail.trim() : null,
          recipientPhone: giftData.isGift ? giftData.recipientPhone.trim() : null,
          giftMessage: giftData.isGift ? giftData.giftMessage.trim() : null,
          giftTheme: giftData.isGift ? giftData.giftTheme : "neon",
          hidePriceOnGift: giftData.isGift ? giftData.hidePriceOnGift : true,
          ...getAttribution(),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        showToast(orderData.error || "অর্ডার তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
        setIsSubmitting(false);
        return;
      }

      const createdId = orderData.order?.orderNumber || orderData.order?.id;

      // 2. Process Payment
      if (paymentMethod === "wallet") {
        // Direct instant debit via wallet
        const walletPayRes = await fetch("/api/wallet/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: createdId }),
        });

        const walletData = await walletPayRes.json();
        if (!walletPayRes.ok || !walletData.success) {
          showToast(walletData.error || "ওয়ালেট থেকে পেমেন্ট কাটতে সমস্যা হয়েছে।", "error");
          setIsSubmitting(false);
          return;
        }

        // Refresh user's wallet balance in auth context
        if (refreshUser) refreshUser();

        setSuccessOrder({
          orderId: createdId,
          orderNumber: createdId,
          paidViaWallet: true,
          giftClaimToken: orderData.giftClaimToken,
          recipientName: giftData.recipientName,
          recipientPhone: giftData.recipientPhone,
        });
        showToast("অর্ডার সফলভাবে সম্পন্ন ও ভল্টে যুক্ত হয়েছে!", "success");
      } else {
        // Online Gateway (bKash / Nagad)
        const gatewayRes = await fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: createdId,
            paymentMethod: "gateway",
          }),
        });

        const gatewayData = await gatewayRes.json();
        if (gatewayRes.ok && gatewayData.paymentUrl) {
          window.location.href = gatewayData.paymentUrl;
        } else {
          // Fallback to success page
          router.push(`/checkout/success?orderId=${encodeURIComponent(createdId)}`);
          closeQuickCheckout();
        }
      }
    } catch (err: any) {
      console.error("[Quick Checkout Error]:", err);
      showToast("নেটওয়ার্ক সমস্যার কারণে অর্ডার প্রসেস করা যায়নি।", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => {
        if (!isSubmitting) closeQuickCheckout();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Top Decorative Gradient Brand Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-[#FC5C03] to-amber-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FC5C03] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5">
                <span>১-ক্লিক এক্সপ্রেস বাই (Quick Buy)</span>
              </h2>
              <p className="text-[11px] text-slate-500">তাৎক্ষণিক অটো-ডেলিভারি • ১০০% অফিসিয়াল ওয়ারেন্টি</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeQuickCheckout}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close Quick Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {successOrder ? (
            /* SUCCESS VIEW (Wallet Paid) */
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">অর্ডার সফলভাবে সম্পন্ন হয়েছে!</h3>
                <p className="text-xs font-mono text-[#FC5C03] font-bold">অর্ডার #{successOrder.orderNumber}</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto pt-1">
                  আপনার ওয়ালেট থেকে {formatPrice(totalBDT)} সফলভাবে পরিশোধ করা হয়েছে। আপনার লাইসেন্স বা লগইন তথ্য ডিজিটাল ভল্টে
                  যুক্ত হয়েছে।
                </p>
              </div>

              {/* Gift Share Box if gift claim token exists */}
              {successOrder.giftClaimToken && (
                <div className="p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 rounded-2xl border border-purple-200 text-left space-y-3 max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                    <Gift className="w-4 h-4 text-purple-600" />
                    <span>🎁 উপহারের লিঙ্ক প্রস্তুত!</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {successOrder.recipientName ? `${successOrder.recipientName}-এর জন্য` : "বন্ধুর জন্য"} উপহারটি প্রস্তুত। নিচের লিঙ্কটি কপি করে অথবা হোয়াটসঅ্যাপে সরাসরি পাঠিয়ে দিন:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== "undefined" ? `${window.location.origin}/gift/${successOrder.giftClaimToken}` : `/gift/${successOrder.giftClaimToken}`}
                      className="flex-1 bg-white border border-purple-200 rounded-xl px-3 py-2 text-[11px] font-mono text-purple-900 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/gift/${successOrder.giftClaimToken}`;
                        navigator.clipboard.writeText(url);
                        showToast("উপহারের লিঙ্ক কপি করা হয়েছে!", "success");
                      }}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>কপি</span>
                    </button>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🎁 আপনার জন্য একটি বিশেষ উপহার পাঠানো হয়েছে! উপহারটি আনবক্স করুন: ${typeof window !== "undefined" ? window.location.origin : "https://aihaat.shop"}/gift/${successOrder.giftClaimToken}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp-এ শেয়ার করুন</span>
                    </a>
                    <Link
                      href={`/gift/${successOrder.giftClaimToken}`}
                      onClick={closeQuickCheckout}
                      target="_blank"
                      className="py-2 px-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>প্রিভিউ</span>
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 max-w-xs mx-auto pt-2">
                <Link
                  href="/dashboard/vault"
                  onClick={closeQuickCheckout}
                  className="flex-1 py-3 px-4 bg-[#FC5C03] hover:bg-[#E04F00] text-white text-xs font-bold rounded-xl transition-all shadow-xs text-center"
                >
                  ডিজিটাল ভল্ট দেখুন →
                </Link>
                <button
                  type="button"
                  onClick={closeQuickCheckout}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          ) : (
            /* ORDER FORM VIEW */
            <form onSubmit={handleQuickSubmit} className="space-y-5">
              {/* 1. Product Summary Card */}
              <div className="flex gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 items-center">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    aspectRatio="1/1"
                    objectFit="cover"
                    className="w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {product.category || "Digital Product"}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-black text-[#FC5C03] font-mono">{formatPrice(unitPrice)}</span>
                    {selectedVariation?.name && selectedVariation.name !== "Standard" && (
                      <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-[#FC5C03] rounded-md font-semibold truncate max-w-[140px]">
                        {selectedVariation.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Variation Pills (if product has multiple options) */}
              {product.variations && product.variations.length > 1 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">প্ল্যান বা মেয়াদ বেছে নিন:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variations.map((v: Variation) => {
                      const isSelected = selectedVariation?.id === v.id;
                      const isVarOutOfStock = v.inStock === false;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariation(v)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                              : isVarOutOfStock
                              ? "bg-slate-50 text-slate-400 border-dashed border-slate-300"
                              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span>{v.name}</span>
                          <span
                            className={`font-mono text-[11px] ${
                              isSelected ? "text-orange-300" : "text-slate-500"
                            }`}
                          >
                            {formatPrice(v.priceBDT)}
                          </span>
                          {isVarOutOfStock && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md font-semibold">
                              স্টক শেষ
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Quantity Selector */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200">
                <span className="text-xs font-bold text-slate-700">পরিমাণ (Quantity):</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isSubmitting}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-black text-slate-900 font-mono min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={quantity >= 20 || isSubmitting}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 4. Customer Information */}
              <div className="space-y-3 pt-1">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>ক্রেতার তথ্য (Customer Info):</span>
                  {user && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      অ্যাকাউন্ট সংযুক্ত
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      আপনার নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="পুরো নাম লিখুন"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FC5C03]/20 focus:border-[#FC5C03]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      মোবাইল নাম্বার <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="০১৭XXXXXXXX"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FC5C03]/20 focus:border-[#FC5C03]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    ইমেইল এড্রেস (ডেলিভারির জন্য) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FC5C03]/20 focus:border-[#FC5C03]"
                  />
                </div>

                {/* Delivery Preference */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    ডেলিভারির মাধ্যম বেছে নিন:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("EMAIL")}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                        deliveryMethod === "EMAIL"
                          ? "border-[#FC5C03] bg-orange-50/60 text-[#FC5C03] ring-1 ring-[#FC5C03]"
                          : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>ইমেইল ও ভল্ট</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliveryMethod("WHATSAPP");
                        if (!deliveryHandle && phone) setDeliveryHandle(phone);
                      }}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                        deliveryMethod === "WHATSAPP"
                          ? "border-[#FC5C03] bg-orange-50/60 text-[#FC5C03] ring-1 ring-[#FC5C03]"
                          : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>হোয়াটসঅ্যাপ</span>
                    </button>
                  </div>
                  {deliveryMethod === "WHATSAPP" && (
                    <div className="pt-1 animate-in fade-in duration-150">
                      <input
                        type="tel"
                        placeholder="আপনার WhatsApp নম্বর (যদি মোবাইল নম্বর থেকে আলাদা হয়)"
                        value={deliveryHandle}
                        onChange={(e) => setDeliveryHandle(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FC5C03]/20 focus:border-[#FC5C03]"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        অ্যাকাউন্টের লগইন তথ্য সরাসরি এই WhatsApp নম্বরে পাঠিয়ে দেওয়া হবে।
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Digital Gifting Section */}
              <DigitalGiftingSection
                compact
                formData={giftData}
                onChange={(updates) => setGiftData((prev) => ({ ...prev, ...updates }))}
              />

              {/* 5. Payment Method Selector */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-800 block">পেমেন্ট মেথড নির্বাচন করুন:</label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Gateway Option */}
                  <label
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === "gateway"
                        ? "border-[#FC5C03] bg-orange-50/50 ring-1 ring-[#FC5C03]"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="quickPaymentMethod"
                        value="gateway"
                        checked={paymentMethod === "gateway"}
                        onChange={() => setPaymentMethod("gateway")}
                        className="accent-[#FC5C03]"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900">বিকাশ / নগদ / রকেট</div>
                        <div className="text-[10px] text-slate-500">অনলাইন ইনস্ট্যান্ট গেটওয়ে</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white text-slate-600 rounded border border-slate-200">
                      Auto
                    </span>
                  </label>

                  {/* Wallet Option */}
                  <label
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === "wallet"
                        ? "border-[#FC5C03] bg-orange-50/50 ring-1 ring-[#FC5C03]"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="quickPaymentMethod"
                        value="wallet"
                        checked={paymentMethod === "wallet"}
                        onChange={() => setPaymentMethod("wallet")}
                        className="accent-[#FC5C03]"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>এআই হাট ওয়ালেট</span>
                          {user && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                canPayWithWallet
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {formatPrice(walletBalance)}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {canPayWithWallet ? "১-ক্লিকে তাৎক্ষণিক ডেবিট" : "পর্যাপ্ত ব্যালেন্স নেই"}
                        </div>
                      </div>
                    </div>
                    <Wallet className="w-4 h-4 text-[#FC5C03]" />
                  </label>
                </div>
              </div>

              {/* 6. Coupon Code (Accordion) */}
              <div className="pt-1">
                {!showCouponInput && !appliedCoupon ? (
                  <button
                    type="button"
                    onClick={() => setShowCouponInput(true)}
                    className="text-xs font-bold text-[#FC5C03] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>কুপন কোড আছে?</span>
                  </button>
                ) : appliedCoupon ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      কুপন: {appliedCoupon.code} (-{formatPrice(appliedCoupon.discountBDT)})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode("");
                      }}
                      className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="কুপন কোড লিখুন"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 uppercase font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                    >
                      {isValidatingCoupon ? "..." : "প্রয়োগ"}
                    </button>
                  </div>
                )}
              </div>

              {/* 7. Price Breakdown Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>সাবটোটাল ({quantity} টি):</span>
                  <span className="font-mono text-slate-900">{formatPrice(subtotalBDT)}</span>
                </div>
                {couponDiscountBDT > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>কুপন ছাড়:</span>
                    <span className="font-mono">-{formatPrice(couponDiscountBDT)}</span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="text-[#FC5C03] font-mono text-base">{formatPrice(totalBDT)}</span>
                </div>
              </div>

              {/* 8. 1-Click Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || isCurrentOutOfStock}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 via-[#FC5C03] to-[#E04F00] hover:opacity-95 text-white font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>অর্ডার প্রসেস হচ্ছে...</span>
                  </div>
                ) : isCurrentOutOfStock ? (
                  <span>❌ এই অপশনটি বর্তমানে স্টক আউট</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    <span>
                      {paymentMethod === "wallet"
                        ? `⚡ ওয়ালেট থেকে ${formatPrice(totalBDT)} দিয়ে কিনুন`
                        : `⚡ ${formatPrice(totalBDT)} দিয়ে এখনই কিনুন (বিকাশ/নগদ)`}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>২৫৬-বিট এনক্রিপশন • ১০০% নিরাপদ ট্রানজেকশন</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
