"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Zap,
  CheckCircle2,
  Copy,
  ArrowLeft,
  Smartphone,
  Phone,
  Tag,
  X,
  Check,
  MessageSquare,
  Share2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { SafeImage } from "@/components/SafeImage";
import { validateCoupon } from "@/data/coupons";
import { Coupon } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalBDT, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "rocket" | "wallet" | "card">("bkash");
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [notes, setNotes] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [hasWhatsAppDelivery, setHasWhatsAppDelivery] = useState(false);
  const [hasMessengerDelivery, setHasMessengerDelivery] = useState(false);
  const [orderSummaryText, setOrderSummaryText] = useState("");

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountBDT, setDiscountBDT] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    const cartItemsFormatted = items.map((i) => ({
      slug: i.product.slug,
      priceBDT: i.selectedVariation.priceBDT,
      quantity: i.quantity,
    }));

    const result = validateCoupon(couponCodeInput, cartItemsFormatted);

    if (result.isValid && result.coupon) {
      setAppliedCoupon(result.coupon);
      setDiscountBDT(result.discountBDT);
      setCouponError("");
      showToast(result.message, "success");
    } else {
      setCouponError(result.message);
      showToast(result.message, "error");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountBDT(0);
    setCouponCodeInput("");
    setCouponError("");
    showToast("Coupon removed", "info");
  };

  const finalTotalBDT = Math.max(0, subtotalBDT - discountBDT);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }

    if (!fullName || !email || !phone) {
      showToast("Please provide your name, email, and phone number.", "error");
      return;
    }

    if (paymentMethod !== "wallet" && (!senderNumber || !trxId)) {
      showToast("Please enter sender number and Transaction ID (TrxID).", "error");
      return;
    }

    setIsSubmitting(true);

    const orderNum = `AH-${Math.floor(10000 + Math.random() * 90000)}`;
    const isWa = items.some((i) => i.product.deliveryMethod === "WHATSAPP");
    const isMsg = items.some((i) => i.product.deliveryMethod === "MESSENGER");
    const summary = items.map((i) => i.product.name).join(", ");
    setHasWhatsAppDelivery(isWa);
    setHasMessengerDelivery(isMsg);
    setOrderSummaryText(summary);

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderNum,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            variationId: i.selectedVariation.id,
            variationName: i.selectedVariation.name,
            priceBDT: i.selectedVariation.priceBDT,
            quantity: i.quantity,
          })),
          subtotalBDT,
          discountBDT,
          couponCode: appliedCoupon?.code || null,
          totalBDT: finalTotalBDT,
          paymentMethod,
          senderNumber,
          trxId,
          notes,
        }),
      });
    } catch (e) {
      console.error("Order save simulated:", e);
    }

    setCreatedOrderId(orderNum);
    setIsSubmitting(false);
    setIsSuccessModalOpen(true);
    clearCart();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E8EE]">
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="p-2 rounded-xl bg-white border border-[#E8E8EE] text-[#7A8190] hover:text-[#1A1D26] hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-[#1A1D26]">Secure Checkout</h1>
              <p className="text-xs text-[#7A8190]">Instant delivery to your digital vault & email</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        {items.length > 0 ? (
          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Customer Info & Payment (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Customer Contact Details */}
                <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm sm:text-base font-bold text-[#1A1D26] pb-3 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center text-xs font-black">
                      1
                    </span>
                    <span>Account & Delivery Details</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Your Name"
                        className="w-full text-xs p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#FC5C03]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full text-xs p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#FC5C03]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                        WhatsApp / Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+8801XXXXXXXXX"
                        className="w-full text-xs p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#FC5C03]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment Method */}
                <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm sm:text-base font-bold text-[#1A1D26] pb-3 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center text-xs font-black">
                      2
                    </span>
                    <span>Select Payment Method</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: "bkash", name: "bKash", color: "border-[#E2136E]", bg: "bg-[#FFF0F6]" },
                      { id: "nagad", name: "Nagad", color: "border-[#F7941D]", bg: "bg-[#FFF7ED]" },
                      { id: "rocket", name: "Rocket", color: "border-[#8C3494]", bg: "bg-[#FAF5FF]" },
                      { id: "wallet", name: "Wallet Balance", color: "border-[#FC5C03]", bg: "bg-[#FFF2E8]" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                          paymentMethod === m.id
                            ? `${m.color} ${m.bg} shadow-xs font-bold`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-xs block text-[#1A1D26] font-bold">{m.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Manual Instructions for bKash/Nagad */}
                  {paymentMethod !== "wallet" && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="text-xs text-slate-700 space-y-1">
                        <p className="font-bold text-slate-900">
                          Send Money to our official number: <span className="font-mono text-[#FC5C03]">01XXXXXXXXX</span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Go to your {paymentMethod.toUpperCase()} app &gt; Send Money &gt; Enter Amount ({formatPrice(finalTotalBDT)}) &gt; Put your TrxID below.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Your {paymentMethod.toUpperCase()} Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={senderNumber}
                            onChange={(e) => setSenderNumber(e.target.value)}
                            placeholder="017XXXXXXXX"
                            className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:border-[#FC5C03]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Transaction ID (TrxID) *
                          </label>
                          <input
                            type="text"
                            required
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                            placeholder="e.g. BL90X84Q"
                            className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:border-[#FC5C03]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* RIGHT COLUMN: Order Summary (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-5">
                  <h3 className="text-base font-bold text-[#1A1D26] pb-3 border-b border-gray-100">
                    Order Summary ({items.length} {items.length === 1 ? "Item" : "Items"})
                  </h3>

                  {/* Items List */}
                  <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.selectedVariation.id}`} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-[#1A1D26]">{item.product.name}</h4>
                          <span className="text-[11px] text-gray-500 block">
                            {item.selectedVariation.name} × {item.quantity}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {formatPrice(item.selectedVariation.priceBDT * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotalBDT)}</span>
                    </div>

                    {discountBDT > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount ({appliedCoupon?.code})</span>
                        <span>-{formatPrice(discountBDT)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-base font-black text-[#1A1D26] pt-2 border-t border-gray-100">
                      <span>Total Amount</span>
                      <span className="text-[#FC5C03]">{formatPrice(finalTotalBDT)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#FC5C03] hover:bg-[#EC4001] disabled:bg-gray-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Place Order ({formatPrice(finalTotalBDT)})</span>
                    )}
                  </button>
                </div>

              </div>

            </div>
          </form>
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-[#E8E8EE] max-w-lg mx-auto p-8 shadow-2xs space-y-4">
            <h2 className="text-lg font-bold text-[#1A1D26]">Your Cart is Empty</h2>
            <Link href="/shop" className="inline-block px-5 py-2.5 bg-[#FC5C03] text-white text-xs font-bold rounded-xl">Browse Shop</Link>
          </div>
        )}

      </div>

      {/* SUCCESS MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 text-center shadow-2xl border border-gray-100 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-black text-[#1A1D26]">Order Placed!</h3>
              <p className="text-xs text-[#7A8190] mt-1">
                Order ID: <strong className="text-[#FC5C03] font-mono text-sm">{createdOrderId}</strong>
              </p>
            </div>

            {/* If product has WhatsApp Delivery */}
            {hasWhatsAppDelivery && (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Next Step: Contact on WhatsApp</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    This product requires WhatsApp contact to complete setup. Click below to message our team with your Order ID.
                  </p>
                </div>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hello, I have placed Order #${createdOrderId}. Please activate my order.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            )}

            {/* If product has Messenger Delivery */}
            {hasMessengerDelivery && (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Next Step: Contact on Messenger</span>
                  </div>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    This product requires Messenger contact to complete setup. Click below to message our Facebook page with your Order ID.
                  </p>
                </div>

                <a
                  href={`https://m.me/aihaat.shop`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Chat on Messenger</span>
                </a>
              </div>
            )}

            {/* If standard Email & Vault Delivery */}
            {!hasWhatsAppDelivery && !hasMessengerDelivery && (
              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                Your order is being processed. Account credentials and license keys will appear in your <b>Digital Vault</b> and your Email within 5-15 minutes.
              </p>
            )}

            <div className="flex gap-2.5 pt-2">
              <Link href="/dashboard/keys" className="flex-1 py-2.5 bg-[#FC5C03] text-white text-xs font-bold rounded-xl text-center">Digital Vault</Link>
              <Link href="/dashboard/orders" className="flex-1 py-2.5 bg-gray-100 text-gray-800 text-xs font-bold rounded-xl text-center">Orders</Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
