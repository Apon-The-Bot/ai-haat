"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowLeft,
  X,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { validateCoupon } from "@/data/coupons";
import { Coupon } from "@/types";
import { PaymentLogo } from "@/components/PaymentLogo";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalBDT, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user, openLoginModal, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<"gateway" | "wallet">("gateway");
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [hasWhatsAppDelivery, setHasWhatsAppDelivery] = useState(false);
  const [hasMessengerDelivery, setHasMessengerDelivery] = useState(false);
  const [orderSummaryText, setOrderSummaryText] = useState("");

  // Populate customer info if logged in
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || "");
      if (!email) setEmail(user.email || "");
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

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

    // Direct Login check
    if (!user) {
      openLoginModal("/checkout");
      return;
    }

    if (items.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }

    if (!fullName || !email || !phone) {
      showToast("Please provide your name, email, and phone number.", "error");
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

    // Save order in backend
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderNum,
          orderNumber: orderNum,
          customerName: fullName,
          customerEmail: email,
          customerPhone: phone,
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
          trxId: paymentMethod === "wallet" ? `WAL-${orderNum}` : "GATEWAY_PENDING",
          notes,
        }),
      });
    } catch (e) {
      console.error("Order save:", e);
    }

    // A. Wallet Payment Flow
    if (paymentMethod === "wallet") {
      const currentBal = user.walletBalanceBDT || 0;
      if (currentBal < finalTotalBDT) {
        showToast(`ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই (ব্যালেন্স: ৳${currentBal})।`, "error");
        setIsSubmitting(false);
        return;
      }

      try {
        const wRes = await fetch("/api/wallet/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderNum,
            amountBDT: finalTotalBDT,
            customerEmail: user.email,
          }),
        });

        const wData = await wRes.json();
        if (!wRes.ok || !wData.success) {
          showToast(wData.error || "পেমেন্ট ব্যর্থ হয়েছে।", "error");
          setIsSubmitting(false);
          return;
        }

        refreshUser();
        clearCart();
        window.location.href = `/checkout/success?orderId=${encodeURIComponent(orderNum)}&status=completed&trxId=WAL-${encodeURIComponent(orderNum)}`;
        return;
      } catch (err) {
        console.error("Wallet checkout error:", err);
        showToast("ত্রুটি হয়েছে।", "error");
        setIsSubmitting(false);
        return;
      }
    }

    // B. Automated Gateway Flow
    if (paymentMethod === "gateway") {
      try {
        const res = await fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderNum,
            amount: finalTotalBDT,
            customerName: fullName,
            customerEmail: email,
            customerPhone: phone,
            metadata: {
              deliveryMethod: isWa ? "WHATSAPP" : isMsg ? "MESSENGER" : "EMAIL",
            },
          }),
        });

        const data = await res.json();

        if (data.success && data.pp_url) {
          clearCart();
          window.location.href = data.pp_url;
          return;
        } else {
          showToast(data.error || "গেটওয়ে সংযোগ ব্যর্থ হয়েছে।", "error");
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("Gateway redirect error:", err);
        showToast("গেটওয়ে সংযোগ ব্যর্থ হয়েছে।", "error");
        setIsSubmitting(false);
        return;
      }
    }

    setCreatedOrderId(orderNum);
    setIsSubmitting(false);
    setIsSuccessModalOpen(true);
    clearCart();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 sm:py-12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 space-y-6">
        
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
              <h1 className="text-lg sm:text-2xl font-black text-[#1A1D26]">Checkout</h1>
              <p className="text-xs text-[#7A8190]">Instant digital delivery to email & dashboard</p>
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
              <div className="lg:col-span-7 space-y-5">
                
                {/* 1. Customer Contact Details */}
                <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-[#1A1D26] pb-3 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center text-[11px] font-black">
                      1
                    </span>
                    <span>Customer Details</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full text-xs p-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#FC5C03]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                        Email Address (Delivery Destination) *
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
                <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-3.5">
                  <h3 className="text-sm font-bold text-[#1A1D26] pb-3 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center text-[11px] font-black">
                      2
                    </span>
                    <span>Payment Method</span>
                  </h3>

                  <div className="space-y-2.5">
                    {/* Option A: Automated Gateway */}
                    <div
                      onClick={() => setPaymentMethod("gateway")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        paymentMethod === "gateway"
                          ? "border-[#FC5C03] bg-[#FFF9F5] shadow-xs"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#FC5C03] text-white flex items-center justify-center shrink-0">
                          <Zap className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[#1A1D26]">
                              পেমেন্ট গেটওয়ে (Online Payment)
                            </span>
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase bg-[#FC5C03] text-white rounded-full">
                              Instant Auto
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="px-1.5 py-0.5 bg-pink-50 text-[#E2136E] border border-pink-200 text-[9.5px] font-bold rounded">bKash</span>
                            <span className="px-1.5 py-0.5 bg-orange-50 text-[#F7941D] border border-orange-200 text-[9.5px] font-bold rounded">Nagad</span>
                            <span className="px-1.5 py-0.5 bg-purple-50 text-[#8C3494] border border-purple-200 text-[9.5px] font-bold rounded">Rocket</span>
                            <span className="px-1.5 py-0.5 bg-blue-50 text-[#002D62] border border-blue-200 text-[9.5px] font-bold rounded">Upay</span>
                            <span className="px-1.5 py-0.5 bg-slate-50 text-slate-700 border border-slate-200 text-[9.5px] font-bold rounded">Cards</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-[#FC5C03]">
                        {paymentMethod === "gateway" && <div className="w-2.5 h-2.5 rounded-full bg-[#FC5C03]" />}
                      </div>
                    </div>

                    {/* Option B: Wallet Balance */}
                    {user && (
                      <div
                        onClick={() => setPaymentMethod("wallet")}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          paymentMethod === "wallet"
                            ? "border-[#FC5C03] bg-[#FFF2E8] shadow-xs"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#1A1D26] text-[#FC5C03] flex items-center justify-center font-black text-sm shrink-0">
                            ৳
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-[#1A1D26] block">Wallet Balance</span>
                            <span className="text-[11px] text-gray-500">
                              Available: {formatPrice(user?.walletBalanceBDT || 0)}
                            </span>
                          </div>
                        </div>

                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 border-[#FC5C03]">
                          {paymentMethod === "wallet" && <div className="w-2.5 h-2.5 rounded-full bg-[#FC5C03]" />}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Order Summary (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                
                <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-[#1A1D26] pb-3 border-b border-gray-100">
                    Order Summary ({items.length} {items.length === 1 ? "Item" : "Items"})
                  </h3>

                  {/* Items List */}
                  <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={`${item.product.id}-${item.selectedVariation.id}`} className="py-2.5 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-[#1A1D26]">{item.product.name}</h4>
                          <span className="text-[10.5px] text-gray-500 block">
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

                    <div className="flex justify-between text-sm sm:text-base font-black text-[#1A1D26] pt-2 border-t border-gray-100">
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
                    ) : paymentMethod === "gateway" ? (
                      <span className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span>পেমেন্ট করুন ({formatPrice(finalTotalBDT)})</span>
                      </span>
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
            <h2 className="text-base font-bold text-[#1A1D26]">Your Cart is Empty</h2>
            <Link href="/shop" className="inline-block px-5 py-2.5 bg-[#FC5C03] text-white text-xs font-bold rounded-xl">Browse Shop</Link>
          </div>
        )}

      </div>

      {/* SUCCESS MODAL (for manual / wallet orders) */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 text-center shadow-2xl border border-gray-100 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1A1D26]">Order Placed Successfully!</h3>
              <p className="text-xs text-gray-500 font-mono mt-1">Order #{createdOrderId}</p>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your order has been verified. Digital credentials will be sent to your email and dashboard vault.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/dashboard/keys"
                className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-colors"
              >
                Go to Digital Vault
              </Link>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="w-full py-2.5 text-xs text-gray-500 hover:text-black font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
