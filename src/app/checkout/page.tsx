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
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { SafeImage } from "@/components/SafeImage";

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

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast("আপনার কার্ট খালি!", "error");
      return;
    }

    if (!fullName || !email || !phone) {
      showToast("দয়া করে নাম, ইমেইল এবং মোবাইল নাম্বার পূরণ করুন।", "error");
      return;
    }

    if (paymentMethod !== "wallet" && paymentMethod !== "card") {
      if (!senderNumber || !trxId) {
        showToast("দয়া করে পেমেন্ট প্রেরক নাম্বার ও Transaction ID লিখুন।", "error");
        return;
      }
    }

    setIsSubmitting(true);

    const orderNum = `AH-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNum,
          customerName: fullName,
          customerPhone: phone,
          customerEmail: email,
          items: items.map((i) => ({
            productName: i.product.name,
            variationName: i.selectedVariation.name,
            priceBDT: i.selectedVariation.priceBDT,
            quantity: i.quantity,
          })),
          totalBDT: subtotalBDT,
          paymentMethod,
          senderNumber,
          trxId,
          notes,
        }),
      });
    } catch (e) {
      console.error("Order API error:", e);
    } finally {
      setCreatedOrderId(orderNum);
      setIsSubmitting(false);
      setIsSuccessModalOpen(true);
      clearCart();
    }
  };

  const paymentAccounts = {
    bkash: { number: "01712-345678", type: "Personal (Send Money)", charge: "0%" },
    nagad: { number: "01800-000000", type: "Merchant / Personal", charge: "0%" },
    rocket: { number: "01900-112233-4", type: "Personal", charge: "0%" },
  };

  return (
    <div className="w-full bg-gray-50/50 py-6 sm:py-10 min-h-screen pb-20">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#7A8190] hover:text-[#FC5C03] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>শপিং চালিয়ে যান</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>২৫৬-বিট এনক্রিপ্টেড সুরক্ষিত চেকআউট</span>
          </div>
        </div>

        {items.length > 0 ? (
          <form onSubmit={handlePlaceOrder}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* LEFT COLUMN: Customer Information & Payment (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Customer Details Card */}
                <div className="bg-white rounded-xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#E8E8EE]">
                    <span className="w-6 h-6 rounded-full bg-[#FC5C03] text-white text-xs font-black flex items-center justify-center">১</span>
                    <h2 className="text-sm sm:text-base font-bold text-[#1A1D26]">
                      গ্রাহকের বিবরণ ও ডেলিভারি তথ্য
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                        পূর্ণ নাম (Full Name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="আপনার পূর্ণ নাম লিখুন"
                        className="w-full text-xs p-2.5 bg-gray-50/50 border border-[#E8E8EE] rounded-lg focus:outline-none focus:border-[#FC5C03] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                        ইমেইল অ্যাড্রেস *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ডেলিভারির জন্য সক্রিয় জিমেইল"
                        className="w-full text-xs p-2.5 bg-gray-50/50 border border-[#E8E8EE] rounded-lg focus:outline-none focus:border-[#FC5C03] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                        হোয়াটসঅ্যাপ / মোবাইল নাম্বার *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full text-xs p-2.5 bg-gray-50/50 border border-[#E8E8EE] rounded-lg focus:outline-none focus:border-[#FC5C03] focus:bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#1A1D26] mb-1">
                        অতিরিক্ত তথ্য / গেম প্লেয়ার আইডি (যদি প্রযোজ্য হয়)
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="গেম টপ-আপের জন্য Player UID অথবা টেলিগ্রাম ইউজারনেম লিখুন..."
                        className="w-full text-xs p-2.5 bg-gray-50/50 border border-[#E8E8EE] rounded-lg focus:outline-none focus:border-[#FC5C03] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment Method Card */}
                <div className="bg-white rounded-xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#E8E8EE]">
                    <span className="w-6 h-6 rounded-full bg-[#FC5C03] text-white text-xs font-black flex items-center justify-center">২</span>
                    <h2 className="text-sm sm:text-base font-bold text-[#1A1D26]">
                      পেমেন্ট মেথড নির্বাচন করুন
                    </h2>
                  </div>

                  {/* Payment Selectors */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "bkash", name: "bKash", color: "border-[#D12053]" },
                      { id: "nagad", name: "Nagad", color: "border-[#F7941D]" },
                      { id: "rocket", name: "Rocket", color: "border-[#8C3494]" },
                      { id: "wallet", name: "AI Haat Wallet", color: "border-[#FC5C03]" },
                    ].map((pm) => {
                      const isSelected = paymentMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setPaymentMethod(pm.id as any)}
                          className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                            isSelected
                              ? `bg-[#FFF2E8] border-[#FC5C03] ring-1 ring-[#FC5C03] text-[#FC5C03] font-bold`
                              : "bg-gray-50 border-[#E8E8EE] text-[#1A1D26] hover:border-gray-300"
                          }`}
                        >
                          <Smartphone className="w-4 h-4" />
                          <span className="text-xs">{pm.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Payment Instructions */}
                  {paymentMethod !== "wallet" && paymentMethod !== "card" && (
                    <div className="p-4 bg-[#FFF9F5] rounded-xl border border-[#FFF2E8] space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-[#1A1D26]">
                        <span>
                          {paymentMethod.toUpperCase()} নাম্বার:{" "}
                          <span className="text-[#FC5C03] font-mono text-sm">
                            {paymentAccounts[paymentMethod as "bkash" | "nagad" | "rocket"].number}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              paymentAccounts[paymentMethod as "bkash" | "nagad" | "rocket"].number
                            );
                            showToast("নাম্বার কপি করা হয়েছে!", "success");
                          }}
                          className="px-2 py-1 bg-white border border-[#E8E8EE] rounded text-[11px] font-bold hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3 text-gray-500" />
                          <span>কপি</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-[#4B5563] leading-relaxed">
                        ১. আপনার বিকাশ/নগদ/রকেট অ্যাপ থেকে উপরের নাম্বারে <strong>{formatPrice(subtotalBDT)}</strong> Send Money করুন।
                        <br />
                        ২. পেমেন্ট সফল হলে নিচের ঘরে প্রেরক নাম্বার এবং Transaction ID (TrxID) লিখে &ldquo;অর্ডার নিশ্চিত করুন&rdquo; চাপুন।
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-[#1A1D26] mb-1">
                            আপনার প্রেরক নাম্বার *
                          </label>
                          <input
                            type="tel"
                            required
                            value={senderNumber}
                            onChange={(e) => setSenderNumber(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#1A1D26] mb-1">
                            Transaction ID (TrxID) *
                          </label>
                          <input
                            type="text"
                            required
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            placeholder="e.g. BL90X84Q"
                            className="w-full text-xs p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "wallet" && (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <span className="font-bold block">এআই হাট ওয়ালেট পেমেন্ট</span>
                      <p>
                        আপনার বর্তমান ওয়ালেট ব্যালেন্স: <strong>{formatPrice(user?.walletBalanceBDT || 0)}</strong>
                      </p>
                      {(user?.walletBalanceBDT || 0) < subtotalBDT && (
                        <p className="text-red-600 font-bold pt-1">
                          অপর্যাপ্ত ব্যালেন্স! ওয়ালেট রিচার্জ করুন অথবা বিকাশ/নগদে পেমেন্ট করুন।
                        </p>
                      )}
                    </div>
                  )}

                </div>

              </div>

              {/* RIGHT COLUMN: Order Summary (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
                  <h3 className="text-sm sm:text-base font-bold text-[#1A1D26] pb-3 border-b border-[#E8E8EE]">
                    অর্ডার সামারি ({items.length} টি আইটেম)
                  </h3>

                  {/* Item List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-gray-100 pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
                          <SafeImage
                            src={item.product.image}
                            alt={item.product.name}
                            aspectRatio="1/1"
                            objectFit="cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#1A1D26] truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-[10px] text-[#7A8190] block truncate">
                            {item.selectedVariation.name} × {item.quantity}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#FC5C03]">
                          {formatPrice(item.selectedVariation.priceBDT * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-1.5 pt-3 border-t border-gray-100 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>সাবটোটাল</span>
                      <span className="font-bold text-[#1A1D26]">{formatPrice(subtotalBDT)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>ডেলিভারি ফি</span>
                      <span className="font-bold text-emerald-600">ফ্রি (০ ৳)</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#1A1D26] pt-2 border-t border-gray-200">
                      <span>সর্বমোট প্রদেয়</span>
                      <span className="text-[#FC5C03] text-lg font-black">
                        {formatPrice(subtotalBDT)}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#FC5C03] hover:bg-[#EC4001] disabled:bg-gray-400 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>অর্ডার প্রসেস হচ্ছে...</span>
                    ) : (
                      <span>অর্ডার নিশ্চিত করুন (Place Order)</span>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-1 text-[11px] text-[#7A8190]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>১০০% স্যাটিসফ্যাকশন ও ইনস্ট্যান্ট ডেলিভারি</span>
                  </div>
                </div>
              </div>

            </div>
          </form>
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-[#E8E8EE] max-w-lg mx-auto p-8 shadow-2xs space-y-4">
            <h2 className="text-lg font-bold text-[#1A1D26]">চেকআউট করার মতো কোনো আইটেম নেই</h2>
            <p className="text-xs text-[#7A8190]">
              দয়া করে শপ থেকে আপনার পছন্দের ডিজিটাল প্রোডাক্ট নির্বাচন করুন।
            </p>
            <Link
              href="/shop"
              className="inline-block px-5 py-2.5 bg-[#FC5C03] text-white text-xs font-bold rounded-lg shadow-xs"
            >
              শপ পেজে যান
            </Link>
          </div>
        )}

      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-gray-100 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#1A1D26]">
                অর্ডার সফলভাবে সম্পন্ন হয়েছে!
              </h3>
              <p className="text-xs text-[#7A8190] mt-1">
                আপনার অর্ডার আইডি: <strong className="text-[#FC5C03] font-mono text-sm">{createdOrderId}</strong>
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl text-left text-xs space-y-1.5 border border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-500">গ্রাহকের নাম:</span>
                <span className="font-bold text-[#1A1D26]">{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ইমেইল:</span>
                <span className="font-bold text-[#1A1D26]">{email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">পেমেন্ট মেথড:</span>
                <span className="font-bold uppercase text-[#FC5C03]">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ডেলিভারি সময়:</span>
                <span className="font-bold text-emerald-600">৫ থেকে ১৫ মিনিট</span>
              </div>
            </div>

            <p className="text-[11px] text-[#4B5563]">
              আপনার ইমেইল ও হোয়াটসঅ্যাপে লগইন ডিটেইলস এবং ইনভয়েস পাঠানো হচ্ছে।
            </p>

            <div className="flex gap-2 pt-2">
              <Link
                href={`/order-tracking?orderId=${createdOrderId}`}
                className="flex-1 py-2.5 bg-[#FC5C03] text-white text-xs font-bold rounded-lg text-center"
              >
                অর্ডার ট্র্যাক করুন
              </Link>
              <Link
                href="/"
                className="flex-1 py-2.5 bg-gray-100 text-[#1A1D26] text-xs font-bold rounded-lg text-center hover:bg-gray-200"
              >
                হোমে ফিরুন
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
