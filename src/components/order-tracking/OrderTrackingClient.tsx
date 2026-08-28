"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ShieldCheck,
  AlertCircle,
  MessageCircle,
  Copy,
  ExternalLink,
  Lock,
  RefreshCw,
  Sparkles,
  Check,
  CreditCard,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { SafeImage } from "@/components/SafeImage";

interface TrackedOrderItem {
  id?: string;
  productId?: string;
  productName: string;
  variationName?: string;
  quantity: number;
  priceBDT: number;
  image?: string | null;
  deliveryStatus?: string;
  fulfillmentType?: string;
}

interface TimelineEvent {
  id: string;
  status: string;
  actor?: string;
  note?: string;
  createdAt: string;
}

interface TrackedOrder {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: TrackedOrderItem[];
  totalBDT: number;
  subtotalBDT: number;
  discountBDT?: number;
  paymentMethod: string;
  trxId?: string;
  paymentStatus: string;
  rawPaymentStatus?: string;
  deliveryStatus: string;
  rawDeliveryStatus?: string;
  timelineEvents?: TimelineEvent[];
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams?.get("orderId") || searchParams?.get("query") || searchParams?.get("phone") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [supportWhatsapp, setSupportWhatsapp] = useState("+8801700000000");
  const [copiedId, setCopiedId] = useState(false);

  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isBn = language === "bn";

  // Fetch support settings (e.g. WhatsApp number)
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.whatsapp) {
          setSupportWhatsapp(data.whatsapp);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = useCallback(async (queryToSearch?: string) => {
    const q = (queryToSearch !== undefined ? queryToSearch : searchQuery).trim();
    if (!q) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders?query=${encodeURIComponent(q)}&tracking=true`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders(data.orders);
          setSelectedOrderIndex(0);
          return;
        }
      }
    } catch (e) {
      console.error("[Order Tracking Fetch Error]:", e);
    } finally {
      setLoading(false);
    }

    setOrders([]);
  }, [searchQuery]);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.replace(`/order-tracking?orderId=${encodeURIComponent(searchQuery.trim())}`);
    handleSearch();
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    showToast(isBn ? "অর্ডার আইডি কপি করা হয়েছে!" : "Order ID copied to clipboard!", "success");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const currentOrder = orders[selectedOrderIndex] || null;

  // Calculate timeline step (1 to 4)
  const getTimelineStep = (order: TrackedOrder) => {
    const rawDelivery = (order.rawDeliveryStatus || order.deliveryStatus || "").toUpperCase();
    const rawPayment = (order.rawPaymentStatus || order.paymentStatus || "").toUpperCase();

    if (rawDelivery === "DELIVERED") return 4;
    if (rawDelivery === "PREPARING" || rawDelivery === "PROCESSING") {
      return rawPayment === "VERIFIED" || rawPayment === "COMPLETED" ? 3 : 2;
    }
    if (rawPayment === "VERIFIED" || rawPayment === "COMPLETED") return 2;
    return 1;
  };

  const currentStep = currentOrder ? getTimelineStep(currentOrder) : 1;
  const isCancelled = currentOrder?.rawDeliveryStatus === "CANCELLED" || currentOrder?.deliveryStatus === "Cancelled";

  // Clean WhatsApp phone number for link
  const cleanPhone = supportWhatsapp.replace(/[^0-9]/g, "");
  const whatsappUrl = currentOrder
    ? `https://wa.me/${cleanPhone || "8801700000000"}?text=${encodeURIComponent(
        `Hello AI Haat Support, I need assistance with my Order #${currentOrder.orderNumber}`
      )}`
    : `https://wa.me/${cleanPhone || "8801700000000"}?text=${encodeURIComponent(
        "Hello AI Haat Support, I have a question regarding my order."
      )}`;

  const timelineSteps = [
    {
      step: 1,
      key: "ORDER_PLACED",
      titleBn: "অর্ডার গ্রহণ",
      titleEn: "Order Placed",
      descBn: "সিস্টেমে অর্ডার সফলভাবে নথিভুক্ত হয়েছে",
      descEn: "Order successfully registered in our system",
      icon: Package,
    },
    {
      step: 2,
      key: "PAYMENT_VERIFIED",
      titleBn: "পেমেন্ট ভেরিফাইড",
      titleEn: "Payment Verified",
      descBn: "পেমেন্ট গেটওয়ে বা ম্যানুয়াল যাচাই সম্পন্ন",
      descEn: "Payment confirmed and security check passed",
      icon: CheckCircle2,
    },
    {
      step: 3,
      key: "PREPARING",
      titleBn: "ডেলিভারি প্রস্তুতকরণ",
      titleEn: "License Preparation",
      descBn: "ডিজিটাল লাইসেন্স ও একাউন্ট প্রস্তুত করা হচ্ছে",
      descEn: "Allocating digital key & preparing account",
      icon: Sparkles,
    },
    {
      step: 4,
      key: "DELIVERED",
      titleBn: "ডেলিভারি সম্পন্ন",
      titleEn: "Delivered to Vault",
      descBn: "আপনার ডিজিটাল ভল্ট ও ইমেইলে ডেলিভারি সম্পন্ন",
      descEn: "Dispatched to your secure Digital Vault & email",
      icon: Truck,
    },
  ];

  return (
    <div className="w-full bg-[#F8FAFC] py-8 sm:py-14 min-h-[75vh]">
      <div className="max-w-5xl w-[calc(100%-24px)] md:w-[calc(100%-40px)] mx-auto space-y-8">
        
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFF2E8] text-[#FC5C03] border border-[#FFE0CC] rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Truck className="w-3.5 h-3.5 animate-pulse text-[#FC5C03]" />
            <span>{isBn ? "লাইভ ট্র্যাকিং সিস্টেম" : "Live Order Tracker"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#1A1D26] tracking-tight">
            {isBn ? "অর্ডার ট্র্যাকিং ও ডেলিভারি স্ট্যাটাস" : "Order Tracking & Delivery Status"}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            {isBn
              ? "আপনার অর্ডার আইডি (e.g. AH-XXXXX) অথবা চেকআউটে ব্যবহৃত ফোন নাম্বার দিয়ে লাইভ স্ট্যাটাস জানুন।"
              : "Track real-time fulfillment status, progress timeline, and delivery updates by Order ID or Customer Phone."}
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={onSearchSubmit} className="relative">
            <div className="flex flex-col sm:flex-row gap-2.5 p-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:border-[#FC5C03]/40 transition-all focus-within:border-[#FC5C03] focus-within:ring-2 focus-within:ring-[#FC5C03]/15">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isBn ? "অর্ডার আইডি (e.g. AH-84920) বা মোবাইল নাম্বার লিখুন..." : "Enter Order ID (e.g. AH-84920) or Phone Number..."}
                  className="w-full pl-11 pr-4 py-3 bg-transparent text-xs sm:text-sm font-semibold text-[#1A1D26] placeholder-[#94A3B8] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setOrders([]);
                      setSearched(false);
                    }}
                    className="mr-2 text-xs font-bold text-gray-400 hover:text-gray-600 px-2 py-1 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-3 bg-[#FC5C03] hover:bg-[#EC4001] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isBn ? "খোঁজা হচ্ছে..." : "Searching..."}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{isBn ? "ট্র্যাক করুন" : "Track Order"}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Helper Chips */}
          <div className="flex items-center justify-center gap-2 mt-2.5 text-[11px] text-[#64748B]">
            <span className="font-medium">{isBn ? "টিপস:" : "Tip:"}</span>
            <span className="text-[#94A3B8]">
              {isBn
                ? "অর্ডার আইডি না থাকলে আপনার বিকাশ/নগদ পেমেন্টে ব্যবহৃত ফোন নাম্বার দিয়েও ট্র্যাক করতে পারবেন।"
                : "You can track using your full 11-digit phone number or Order ID."}
            </span>
          </div>
        </div>

        {/* Results Container */}
        {searched && (
          <div className="space-y-6">
            {orders.length > 0 && currentOrder ? (
              <div className="space-y-6">
                
                {/* Multiple Orders Selector Tab (When searching by Phone) */}
                {orders.length > 1 && (
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-[#1A1D26] flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-[#FC5C03]" />
                        <span>
                          {isBn
                            ? `এই নাম্বারে ${orders.length} টি অর্ডার পাওয়া গেছে:`
                            : `Found ${orders.length} orders associated with this inquiry:`}
                        </span>
                      </span>
                      <span className="text-[11px] text-[#64748B] font-medium">
                        {isBn ? "অর্ডার সিলেক্ট করুন" : "Select order"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {orders.map((ord, idx) => {
                        const isSelected = idx === selectedOrderIndex;
                        const isDeliv = ord.rawDeliveryStatus === "DELIVERED" || ord.deliveryStatus === "Delivered";
                        return (
                          <button
                            key={ord.id || ord.orderNumber}
                            type="button"
                            onClick={() => setSelectedOrderIndex(idx)}
                            className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? "bg-[#FFF9F5] border-[#FC5C03] shadow-xs ring-1 ring-[#FC5C03]"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100/70"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 w-full">
                              <span className="font-mono font-bold text-xs text-[#1A1D26]">
                                #{ord.orderNumber || ord.id}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isDeliv
                                    ? "bg-emerald-100 text-emerald-800"
                                    : ord.rawDeliveryStatus === "CANCELLED"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {ord.deliveryStatus}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                              <span>{ord.date}</span>
                              <span className="font-extrabold text-[#1A1D26]">{formatPrice(ord.totalBDT)}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Main Order Card */}
                <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-gray-100">
                  
                  {/* Top Order Meta Header */}
                  <div className="p-5 sm:p-7 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                          {isBn ? "অর্ডার নাম্বার" : "Order Number"}
                        </span>
                        <div className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors">
                          <span className="font-mono font-black text-sm text-[#1A1D26]">
                            #{currentOrder.orderNumber || currentOrder.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyOrderId(currentOrder.orderNumber || currentOrder.id)}
                            className="text-gray-500 hover:text-[#FC5C03] transition-colors cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[#64748B] flex items-center gap-2">
                        <span>{isBn ? "অর্ডারের তারিখ:" : "Placed on:"} <strong className="text-[#1A1D26]">{currentOrder.date}</strong></span>
                        {currentOrder.customerPhone && (
                          <>
                            <span>•</span>
                            <span>{isBn ? "ফোন:" : "Phone:"} <strong className="text-[#1A1D26] font-mono">{currentOrder.customerPhone}</strong></span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-1.5 text-xs font-bold text-blue-700">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        <span>{currentOrder.paymentMethod.toUpperCase()} ({currentOrder.paymentStatus})</span>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${
                          isCancelled
                            ? "bg-red-50 text-red-700 border-red-200"
                            : currentStep === 4
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-[#FFF9F5] text-[#FC5C03] border-[#FFE0CC]"
                        }`}
                      >
                        {isCancelled ? (
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                        ) : currentStep === 4 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-[#FC5C03] animate-spin" />
                        )}
                        <span>{currentOrder.deliveryStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cancelled Banner (If order was cancelled) */}
                  {isCancelled && (
                    <div className="p-4 sm:p-5 bg-red-50 border-l-4 border-red-500 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <h4 className="font-bold text-red-900">
                          {isBn ? "এই অর্ডারটি বাতিল করা হয়েছে" : "This order has been cancelled"}
                        </h4>
                        <p className="text-red-700">
                          {isBn
                            ? "অর্ডারটি কোনো ত্রুটি বা অনুরোধের কারণে বাতিল করা হয়েছে। যদি আপনার পেমেন্ট কাটা হয়ে থাকে, তবে অনুগ্রহ করে আমাদের সাপোর্ট টিমের সাথে হোয়াটসঅ্যাপে যোগাযোগ করুন।"
                            : "This order was cancelled. If your payment was deducted, please reach out to our WhatsApp support team immediately."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Visual Order Progress Stepper */}
                  {!isCancelled && (
                    <div className="p-5 sm:p-8 bg-slate-50/50 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs sm:text-sm font-black text-[#1A1D26] uppercase tracking-wider flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#FC5C03]" />
                          <span>{isBn ? "লাইভ ফুলফিলমেন্ট টাইমলাইন" : "Live Fulfillment Progress"}</span>
                        </h3>
                        <span className="text-[11px] font-bold px-2.5 py-1 bg-white border border-gray-200 rounded-full text-[#64748B] shadow-2xs">
                          {currentStep === 4
                            ? isBn ? "✅ ডেলিভারি সম্পন্ন" : "✅ Delivery Complete"
                            : isBn ? "⏱️ প্রত্যাশিত সময়: ৫-১৫ মিনিট" : "⏱️ Estimated: 5-15 Mins"}
                        </span>
                      </div>

                      {/* Stepper Component */}
                      <div className="relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden sm:block absolute top-6 left-12 right-12 h-1 bg-gray-200 -z-0">
                          <div
                            className="h-full bg-[#FC5C03] transition-all duration-500 rounded-full"
                            style={{
                              width: `${
                                currentStep === 1
                                  ? 0
                                  : currentStep === 2
                                  ? 33.33
                                  : currentStep === 3
                                  ? 66.66
                                  : 100
                              }%`,
                            }}
                          />
                        </div>

                        {/* Steps Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
                          {timelineSteps.map((st) => {
                            const isCompleted = currentStep >= st.step;
                            const isCurrent = currentStep === st.step;
                            const Icon = st.icon;

                            return (
                              <div
                                key={st.step}
                                className={`flex sm:flex-col items-center gap-3 sm:gap-2 sm:text-center p-3 sm:p-2 rounded-2xl transition-all ${
                                  isCurrent
                                    ? "bg-white sm:bg-transparent shadow-xs sm:shadow-none border sm:border-0 border-[#FFE0CC]"
                                    : ""
                                }`}
                              >
                                {/* Step Icon Circle */}
                                <div
                                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                                    isCompleted
                                      ? "bg-[#FC5C03] text-white shadow-md shadow-[#FC5C03]/20"
                                      : "bg-white text-gray-400 border border-gray-200"
                                  } ${isCurrent ? "ring-4 ring-[#FC5C03]/20 animate-pulse" : ""}`}
                                >
                                  <Icon className="w-5 h-5 stroke-[2.2]" />
                                </div>

                                {/* Step Text Details */}
                                <div className="space-y-0.5 flex-1 sm:flex-initial">
                                  <div className="flex items-center sm:justify-center gap-1">
                                    <h4
                                      className={`text-xs font-black tracking-tight ${
                                        isCompleted ? "text-[#1A1D26]" : "text-gray-400"
                                      }`}
                                    >
                                      {isBn ? st.titleBn : st.titleEn}
                                    </h4>
                                    {isCompleted && currentStep > st.step && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 hidden sm:inline" />
                                    )}
                                  </div>
                                  <p className="text-[10px] text-[#64748B] sm:max-w-[140px] sm:mx-auto leading-tight">
                                    {isBn ? st.descBn : st.descEn}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Itemized Purchased Products List */}
                  <div className="p-5 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-black text-[#1A1D26] uppercase tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#FC5C03]" />
                        <span>{isBn ? "ক্রয়কৃত প্রোডাক্ট বিবরণী" : "Itemized Order Breakdown"}</span>
                      </h3>
                      <span className="text-[11px] font-bold text-[#64748B]">
                        {currentOrder.items.length} {isBn ? "টি আইটেম" : "Item(s)"}
                      </span>
                    </div>

                    <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                      {currentOrder.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-4 bg-white hover:bg-gray-50/70 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                              <SafeImage
                                src={item.image || "/images/placeholders/aihaat-placeholder.svg"}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-[#1A1D26] truncate">
                                {item.productName}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                                {item.variationName && (
                                  <span className="bg-gray-100 px-2 py-0.5 rounded-md font-semibold text-gray-700">
                                    {item.variationName}
                                  </span>
                                )}
                                <span>{isBn ? "পরিমাণ:" : "Qty:"} <strong className="text-[#1A1D26]">{item.quantity}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs sm:text-sm font-black text-[#1A1D26]">
                              {formatPrice(item.priceBDT * (item.quantity || 1))}
                            </div>
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              {isBn ? "ভল্ট ডেলিভারি" : "Vault Dispatch"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Financial Summary */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
                      <div className="flex justify-between text-[#64748B]">
                        <span>{isBn ? "সাবটোটাল (Subtotal):" : "Subtotal:"}</span>
                        <span className="font-semibold text-[#1A1D26]">
                          {formatPrice(currentOrder.subtotalBDT || currentOrder.totalBDT)}
                        </span>
                      </div>
                      {Boolean(currentOrder.discountBDT && currentOrder.discountBDT > 0) && (
                        <div className="flex justify-between text-emerald-600">
                          <span>{isBn ? "ডিসকাউন্ট / কুপন:" : "Discount / Coupon:"}</span>
                          <span className="font-bold">-{formatPrice(currentOrder.discountBDT || 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
                        <span className="font-bold text-[#1A1D26]">{isBn ? "সর্বমোট প্রদেয়:" : "Total Amount:"}</span>
                        <span className="text-base font-black text-[#FC5C03]">
                          {formatPrice(currentOrder.totalBDT)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity / Timeline Event Logs (If Available) */}
                  {Array.isArray(currentOrder.timelineEvents) && currentOrder.timelineEvents.length > 0 && (
                    <div className="p-5 sm:p-7 space-y-3 bg-slate-50/40">
                      <h4 className="text-xs font-bold text-[#1A1D26] uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{isBn ? "অর্ডার অ্যাক্টিভিটি লগ" : "Order Activity Log"}</span>
                      </h4>
                      <div className="space-y-2">
                        {currentOrder.timelineEvents.map((evt) => (
                          <div
                            key={evt.id}
                            className="p-3 bg-white rounded-xl border border-gray-200 text-xs flex items-start justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-[#1A1D26] block">
                                {evt.note || evt.status}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {isBn ? "আপডেট বাই:" : "Source:"} {evt.actor || "SYSTEM"}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 shrink-0">
                              {new Date(evt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secure Digital Vault Notice Card */}
                  <div className="p-5 sm:p-7 bg-gradient-to-br from-slate-900 via-slate-800 to-[#1A1D26] text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="space-y-2 max-w-xl">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>{isBn ? "সিকিউর ভল্ট প্রটেকশন" : "End-to-End Vault Security"}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {isBn
                            ? "ক্রেডেনশিয়াল ও লাইসেন্স কী এক্সেস করতে ভল্টে প্রবেশ করুন"
                            : "Access your Keys & Credentials in the Digital Vault"}
                        </h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {isBn
                            ? "আপনার ব্যক্তিগত অ্যাকাউন্ট ও পাসওয়ার্ডের সুরক্ষার জন্য পাবলিক ট্র্যাকিং লিংকে কোনো ক্রেডেনশিয়াল প্রকাশ করা হয় না। লাইসেন্স কী ও ইনস্টলেশন গাইড দেখতে আপনার সুরক্ষিত ডিজিটাল ভল্টে লগইন করুন।"
                            : "To protect your sensitive credentials and passwords, decrypted keys are never exposed on public URLs. Access your keys and submit warranty claims directly in your Digital Vault."}
                        </p>
                      </div>

                      <div className="shrink-0 flex flex-col gap-2">
                        <Link
                          href="/dashboard/keys"
                          className="px-6 py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs sm:text-sm font-black rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>{isBn ? "ডিজিটাল ভল্ট ওপেন করুন" : "Open Digital Vault"}</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                        <p className="text-[10px] text-slate-400 text-center">
                          {isBn ? "গেস্ট ইউজাররা চেকআউট ইমেইল দিয়ে লগইন করুন" : "Guest users can sign in with checkout email"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Direct WhatsApp Support Button Card */}
                  <div className="p-5 sm:p-6 bg-[#F0FDF4] border-t border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs shrink-0">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {isBn ? "অর্ডার নিয়ে কোনো প্রশ্ন বা জরুরি সাহায্য লাগবে?" : "Need instant help with this order?"}
                        </h4>
                        <p className="text-xs text-slate-600">
                          {isBn
                            ? "আমাদের ডেডিকেটেড সাপোর্ট টিম হোয়াটসঅ্যাপে সার্বক্ষণিক প্রস্তুত।"
                            : "Chat directly with our support team on WhatsApp for 5-minute response."}
                        </p>
                      </div>
                    </div>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{isBn ? "WhatsApp এ কথা বলুন" : "Chat on WhatsApp"}</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  </div>

                </div>

              </div>
            ) : (
              /* Not Found State */
              <div className="bg-white rounded-3xl border border-dashed border-[#E2E8F0] p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center mx-auto shadow-2xs">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-[#1A1D26]">
                    {isBn ? "কোনো অর্ডার পাওয়া যায়নি" : "No Order Found"}
                  </h3>
                  <p className="text-xs text-[#64748B] leading-relaxed max-w-md mx-auto">
                    {isBn
                      ? `"${searchQuery}" এর সাথে সম্পর্কিত কোনো অর্ডার পাওয়া যায়নি। অনুগ্রহ করে আপনার অর্ডার আইডি (e.g. AH-XXXXX) অথবা সঠিক ফোন নাম্বার চেক করুন।`
                      : `We couldn't locate any order matching "${searchQuery}". Please verify your Order ID or phone number.`}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{isBn ? "হোয়াটসঅ্যাপ সাপোর্টে সহায়তা নিন" : "Ask WhatsApp Support"}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearched(false);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1A1D26] text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    {isBn ? "আবার চেষ্টা করুন" : "Try Another Search"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initial Guidance Section (Before Search) */}
        {!searched && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-4xl mx-auto">
            <div className="p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FC5C03] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-[#1A1D26]">
                {isBn ? "ইনস্ট্যান্ট ভল্ট ডেলিভারি" : "Instant Vault Dispatch"}
              </h3>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                {isBn
                  ? "পেমেন্ট নিশ্চিত হওয়ার পর ৫-১৫ মিনিটের মধ্যে আপনার ডিজিটাল ভল্ট ও ইমেইলে প্রোডাক্ট ডেলিভারি হয়।"
                  : "Automatic license delivery to your secure vault within 5 to 15 minutes of payment."}
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-[#1A1D26]">
                {isBn ? "নিরাপদ ক্রেডেনশিয়াল ভল্ট" : "Secured Credentials"}
              </h3>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                {isBn
                  ? "আপনার গোপনীয়তা রক্ষার্থে একাউন্ট ক্রেডেনশিয়াল ও পাসওয়ার্ড সুরক্ষিত ডিজিটাল ভল্টে সংরক্ষিত থাকে।"
                  : "All private passwords and license keys are encrypted and stored in your Digital Vault."}
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-[#1A1D26]">
                {isBn ? "২৪/৭ সরাসরি হোয়াটসঅ্যাপ সাপোর্ট" : "24/7 WhatsApp Support"}
              </h3>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                {isBn
                  ? "অর্ডার বা অ্যাক্টিভেশনে কোনো সমস্যা হলে সরাসরি হোয়াটসঅ্যাপে তাৎক্ষণিক সহায়তা পাবেন।"
                  : "Direct live assistance via WhatsApp if you experience any issues with order fulfillment."}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export function OrderTrackingClient() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center bg-[#F8FAFC] min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#FC5C03] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}

