"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, CheckCircle2, Clock, Truck, Package, ShieldCheck, AlertCircle } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("orderId") || "";

  const [orderQuery, setOrderQuery] = useState(initialId);
  const [searched, setSearched] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = (idToSearch?: string) => {
    const q = idToSearch || orderQuery;
    if (!q.trim()) return;

    setSearched(true);
    // Simulate real lookup
    if (q.toUpperCase().startsWith("AH-") || q.length >= 4) {
      setOrderData({
        orderId: q.toUpperCase().startsWith("AH-") ? q.toUpperCase() : `AH-${q}`,
        productName: "ChatGPT Plus (1 Month Shared)",
        customerEmail: "user@example.com",
        customerPhone: "017XXXXXXXX",
        amountBDT: 290,
        paymentStatus: "PAID",
        paymentMethod: "bKash",
        orderDate: "2026-08-25 14:30",
        currentStep: 3, // 1: Order Placed, 2: Payment Verified, 3: Processing Delivery, 4: Delivered
        credentialDetails: "আপনার ইমেইল ও হোয়াটসঅ্যাপে লগইন তথ্য সফলভাবে পাঠানো হয়েছে।",
      });
    } else {
      setOrderData(null);
    }
  };

  return (
    <div className="w-full bg-white py-8 sm:py-12 min-h-[70vh]">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>লাইভ ট্র্যাকিং</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D26] tracking-tight">
            অর্ডার ট্র্যাকিং (Order Tracking)
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            আপনার অর্ডার আইডি বা মোবাইল নাম্বার দিয়ে অর্ডারের সর্বশেষ অবস্থা জানুন।
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-md mx-auto mb-10">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7A8190] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="অর্ডার আইডি দিন (e.g. AH-89211)"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-[#E8E8EE] rounded-lg text-xs font-semibold text-[#1A1D26] focus:outline-none focus:border-[#FC5C03] focus:bg-white"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
            >
              ট্র্যাক করুন
            </button>
          </div>
        </div>

        {/* Tracking Result */}
        {searched && (
          <div className="max-w-2xl mx-auto">
            {orderData ? (
              <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-7 shadow-2xs space-y-6">
                
                {/* Status Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#7A8190] uppercase tracking-wider block">
                      অর্ডার আইডি
                    </span>
                    <span className="text-base font-black text-[#1A1D26] font-mono">
                      {orderData.orderId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      পেমেন্ট সম্পন্ন ({orderData.paymentMethod})
                    </span>
                  </div>
                </div>

                {/* Progress Steps Timeline */}
                <div className="py-2">
                  <div className="grid grid-cols-4 gap-2 text-center relative">
                    {[
                      { step: 1, label: "অর্ডার গ্রহণ", icon: Package },
                      { step: 2, label: "পেমেন্ট ভেরিফাইড", icon: CheckCircle2 },
                      { step: 3, label: "ডেলিভারি প্রস্তুত", icon: Clock },
                      { step: 4, label: "ডেলিভারি সম্পন্ন", icon: Truck },
                    ].map((st) => {
                      const isComplete = orderData.currentStep >= st.step;
                      const Icon = st.icon;
                      return (
                        <div key={st.step} className="flex flex-col items-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 transition-colors ${
                              isComplete
                                ? "bg-[#FC5C03] text-white shadow-xs"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[10px] sm:text-xs font-bold ${
                              isComplete ? "text-[#1A1D26]" : "text-gray-400"
                            }`}
                          >
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Summary Details */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-xs border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500">প্রোডাক্ট নাম:</span>
                    <span className="font-bold text-[#1A1D26]">{orderData.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">অর্ডারের সময়:</span>
                    <span className="font-bold text-[#1A1D26]">{orderData.orderDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">মূল্য:</span>
                    <span className="font-extrabold text-[#FC5C03]">{formatPrice(orderData.amountBDT)}</span>
                  </div>
                </div>

                {/* Delivery Notice */}
                <div className="p-3.5 bg-[#FFF9F5] rounded-xl border border-[#FFF2E8] flex items-start gap-2.5 text-xs text-[#4B5563]">
                  <ShieldCheck className="w-4 h-4 text-[#FC5C03] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#1A1D26] block">ডেলিভারি স্ট্যাটাস:</span>
                    <p>{orderData.credentialDetails}</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-[#E8E8EE] space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="text-sm font-bold text-[#1A1D26]">অর্ডার পাওয়া যায়নি</h3>
                <p className="text-xs text-[#7A8190] max-w-xs mx-auto">
                  দয়া করে সঠিক অর্ডার নাম্বার লিখুন অথবা আমাদের হোয়াটসঅ্যাপ সাপোর্টে যোগাযোগ করুন।
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-gray-500">লোড হচ্ছে...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
