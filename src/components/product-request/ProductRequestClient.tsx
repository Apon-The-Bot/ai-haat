"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { trackCustomEvent } from "@/lib/analytics/client";
import {
  HelpCircle,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Sparkles,
  DollarSign,
  Calendar,
  AlertTriangle,
  User,
  Mail,
  Phone,
  MessageCircle,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  Info,
  BadgeCheck,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ProductRequestItem } from "@/types";

// Quick Preset Product Chips
const POPULAR_SUGGESTIONS = [
  { name: "Midjourney Pro", category: "AI Tools", budget: "3500", duration: "1 Month" },
  { name: "Claude 3.5 Sonnet / Team", category: "AI Tools", budget: "2400", duration: "1 Month" },
  { name: "Cursor AI Pro", category: "Developer & Coding AI", budget: "2200", duration: "1 Month" },
  { name: "GitHub Copilot Individual", category: "Developer & Coding AI", budget: "1150", duration: "1 Month" },
  { name: "Perplexity Pro", category: "AI Tools", budget: "1950", duration: "1 Year" },
  { name: "ElevenLabs Creator", category: "AI Tools", budget: "2600", duration: "1 Month" },
  { name: "Canva Pro Enterprise", category: "Design & Creative", budget: "450", duration: "1 Year" },
  { name: "Figma Professional", category: "Design & Creative", budget: "1600", duration: "1 Month" },
  { name: "JetBrains All Products Pack", category: "Developer & Coding AI", budget: "3200", duration: "1 Year" },
  { name: "Runway Gen-3 Alpha", category: "Design & Creative", budget: "2800", duration: "1 Month" },
  { name: "Adobe Creative Cloud All Apps", category: "Design & Creative", budget: "4500", duration: "1 Year" },
  { name: "ChatGPT Team Plan", category: "AI Tools", budget: "2900", duration: "1 Month" },
];

const CATEGORIES = [
  { id: "AI Tools", label: "AI Tools (এআই টুলস)", icon: "🤖" },
  { id: "Developer & Coding AI", label: "Developer & Coding (কোডিং)", icon: "💻" },
  { id: "Design & Creative", label: "Design & Creative (ডিজাইন)", icon: "🎨" },
  { id: "Software & PC Keys", label: "Software & PC Keys (লাইসেন্স)", icon: "🔑" },
  { id: "VPN & Security", label: "VPN & Security (ভিপিএন)", icon: "🛡️" },
  { id: "Cloud Storage & Productivity", label: "Cloud & Productivity (ক্লাউড)", icon: "☁️" },
  { id: "OTT Platform Subscription", label: "OTT Subscriptions (ওটিটি)", icon: "🎬" },
  { id: "Other", label: "Other / Custom (অন্যান্য)", icon: "✨" },
];

const DURATION_OPTIONS = [
  { id: "1 Month", label: "১ মাস", sub: "1 Month" },
  { id: "3 Months", label: "৩ মাস", sub: "3 Months" },
  { id: "6 Months", label: "৬ মাস", sub: "6 Months" },
  { id: "1 Year", label: "১ বছর", sub: "1 Year" },
  { id: "Lifetime", label: "লাইফটাইম", sub: "Lifetime / One-time" },
  { id: "Custom", label: "অন্যান্য", sub: "Custom / Flexible" },
];

const BUDGET_PRESETS = [
  "৳৩০০ - ৳৫০০",
  "৳৫০০ - ৳১,০০০",
  "৳১,০০০ - ৳২,৫০০",
  "৳২,৫০০ - ৳৫,০০০",
  "৳৫,০০০+",
  "আলোচনা সাপেক্ষে (Best Offer)",
];

const URGENCY_LEVELS = [
  {
    id: "NORMAL",
    label: "সাধারণ (Normal)",
    timeframe: "১-২ দিনের মধ্যে",
    color: "border-green-300 bg-green-50 text-green-800",
    badgeColor: "bg-green-100 text-green-700",
    dot: "bg-green-500",
    icon: Clock,
  },
  {
    id: "HIGH",
    label: "দ্রুত (High)",
    timeframe: "আজকের মধ্যেই",
    color: "border-amber-300 bg-amber-50 text-amber-800",
    badgeColor: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    icon: Zap,
  },
  {
    id: "URGENT",
    label: "অতি জরুরী (Urgent)",
    timeframe: "১-৩ ঘণ্টার মধ্যে",
    color: "border-red-300 bg-red-50 text-red-800",
    badgeColor: "bg-red-100 text-red-700",
    dot: "bg-red-500",
    icon: AlertTriangle,
  },
];

const FAQ_ITEMS = [
  {
    q: "রিকোয়েস্ট সাবমিট করার পর কতক্ষণ সময়ের মধ্যে রেসপন্স পাবো?",
    a: "আমাদের ডেডিকেটেড সোর্সিং টিম সাধারণত ১ থেকে ৩ ঘণ্টার মধ্যে (সকাল ৯টা থেকে রাত ১২টা পর্যন্ত) আপনার হোয়াটসঅ্যাপ বা ইমেইলে প্রোডাক্টের প্রাপ্যতা, প্রাইসিং কোটেশন ও পেমেন্ট লিংক পাঠিয়ে দেয়।",
  },
  {
    q: "পেমেন্ট কখন ও কীভাবে পরিশোধ করতে হবে?",
    a: "রিকোয়েস্ট সাবমিট করার জন্য কোনো অগ্রিম ফি নেই। আমাদের টিম প্রোডাক্ট কনফার্ম করে কোটেশন পাঠানোর পর আপনি bKash, Nagad, Rocket, বা ডেবিট/ক্রেডিট কার্ডের মাধ্যমে পেমেন্ট সম্পন্ন করতে পারবেন।",
  },
  {
    q: "আমি কি আমার নিজের পার্সোনাল ইমেইলে সাবস্ক্রিপশন নিতে পারবো?",
    a: "হ্যাঁ! আপনি ফর্মের 'নোট / স্পেশাল রিকোয়ারমেন্ট' বক্সে উল্লেখ করে দিতে পারেন যে আপনি পার্সোনাল মেইলে ইনভাইটেশন চান নাকি শেয়ার্ড প্রোফাইল চান। আমরা আপনার পছন্দ অনুযায়ী সেরা প্যাকেজ অফার করবো।",
  },
  {
    q: "কাস্টম প্রোডাক্টের কোনো ওয়ারেন্টি বা সাপোর্ট থাকবে?",
    a: "অবশ্যই। AI Haat-এর সকল প্রোডাক্ট ও সাবস্ক্রিপশন ১০০% জেনুইন এবং পুরো মেয়াদের রিপ্লেসমেন্ট ওয়ারেন্টি সাপোর্ট অন্তর্ভুক্ত থাকে। যেকোনো সমস্যায় দ্রুত সাপোর্ট পাওয়া যায়।",
  },
];

export function ProductRequestClient() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  // Active Tab: "form" or "history"
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");

  // Form States
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("AI Tools");
  const [budgetBDT, setBudgetBDT] = useState("");
  const [duration, setDuration] = useState("1 Month");
  const [urgency, setUrgency] = useState("NORMAL");
  const [notes, setNotes] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<ProductRequestItem | null>(null);

  // User's previous requests
  const [myRequests, setMyRequests] = useState<ProductRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Auto-fill user information if authenticated
  useEffect(() => {
    if (user) {
      if (user.name && !customerName) setCustomerName(user.name);
      if (user.email && !customerEmail) setCustomerEmail(user.email);
      if (user.phone && !customerPhone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Fetch previous requests for authenticated user
  const fetchMyRequests = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingRequests(true);
      const res = await fetch("/api/product-request");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.requests)) {
          setMyRequests(data.requests);
        }
      }
    } catch (err) {
      console.warn("Failed to load user requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchMyRequests();
    }
  }, [activeTab, fetchMyRequests]);

  // Handle Preset Suggestion Click
  const handlePresetSelect = (item: (typeof POPULAR_SUGGESTIONS)[0]) => {
    setProductName(item.name);
    setCategory(item.category);
    setBudgetBDT(item.budget);
    setDuration(item.duration);
    showToast(`নির্বাচিত হয়েছে: ${item.name}`, "info");
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim()) {
      showToast("দয়া করে প্রোডাক্ট বা টুলের নাম লিখুন", "error");
      return;
    }

    if (!customerPhone.trim() && !customerEmail.trim()) {
      showToast("যোগাযোগের জন্য হোয়াটসঅ্যাপ নাম্বার বা ইমেইল প্রদান করুন", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/product-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName.trim(),
          category,
          budgetBDT: budgetBDT.trim(),
          duration,
          urgency,
          notes: notes.trim(),
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedData(data.request);
        showToast("আপনার প্রোডাক্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!", "success");

        // Trigger celebratory confetti
        if (typeof window !== "undefined") {
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {
            // Ignore confetti errors
          }
        }

        // Analytics: Track product request submission
        try {
          trackCustomEvent("product_request_submitted", { category, urgency });
        } catch {}
      } else {
        showToast(data.error || "রিকোয়েস্ট জমা করতে ব্যর্থ হয়েছে", "error");
      }
    } catch (err) {
      showToast("সার্ভার ত্রুটি: অনুগ্রহ করে আবার চেষ্টা করুন", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProductName("");
    setBudgetBDT("");
    setNotes("");
    setDuration("1 Month");
    setUrgency("NORMAL");
    setSubmittedData(null);
  };

  // Construct WhatsApp Link for fast follow-up
  const whatsappUrl = useMemo(() => {
    if (!submittedData) return "https://wa.me/8801800000000";
    const text = `হ্যালো AI Haat টিম, আমি এইমাত্র একটি কাস্টম প্রোডাক্ট রিকোয়েস্ট করেছি।
🆔 Request ID: ${submittedData.id}
📦 প্রোডাক্ট: ${submittedData.productName}
🏷️ ক্যাটাগরি: ${submittedData.category || "N/A"}
⏳ মেয়াদ: ${submittedData.duration || "N/A"}
💰 বাজেট: ${submittedData.budgetBDT ? `৳${submittedData.budgetBDT}` : "আলোচনা সাপেক্ষে"}
⚡ জরুরী অবস্থা: ${submittedData.urgency || "Normal"}

অনুগ্রহ করে দ্রুত প্রাইজ এবং অ্যাভেইলেবিলিটি কোটেশন দিন। ধন্যবাদ!`;

    return `https://wa.me/8801800000000?text=${encodeURIComponent(text)}`;
  }, [submittedData]);

  return (
    <div className="w-full bg-[#FAFBFD] py-8 sm:py-12 min-h-[85vh]">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        
        {/* ================= HEADER SECTION ================= */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFF2E8] border border-[#FFD9C2] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>কাস্টম সোর্সিং ও প্রি-অর্ডার পোর্টাল</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#1A1D26] tracking-tight">
            প্রোডাক্ট রিকোয়েস্ট ও কাস্টম হাব
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6275] mt-2 leading-relaxed">
            আপনার কাঙ্ক্ষিত সফটওয়্যার, এআই টুল বা প্রিমিয়াম সাবস্ক্রিপশন শপে খুঁজে পাচ্ছেন না? রিকোয়েস্ট করুন, আমরা ব্যবস্থা করে দেবো।
          </p>

          {/* Tab Switcher if User is Logged In */}
          {user && (
            <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl mt-5 border border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab("form")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "form"
                    ? "bg-white text-[#FC5C03] shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                নতুন রিকোয়েস্ট (New Request)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "history"
                    ? "bg-white text-[#FC5C03] shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>আমার রিকোয়েস্টসমূহ</span>
                {myRequests.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#FC5C03] text-white text-[10px] rounded-full font-black">
                    {myRequests.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ================= GUARANTEE TRUST BAR ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10 max-w-5xl mx-auto">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E8E8EE] flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-[#FC5C03] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1A1D26]">১-৩ ঘণ্টায় রেসপন্স</h4>
              <p className="text-[11px] text-gray-500">দ্রুত সোর্সিং ও কোটেশন</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E8E8EE] flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1A1D26]">সেরা মূল্যের গ্যারান্টি</h4>
              <p className="text-[11px] text-gray-500">বাংলাদেশে সবচেয়ে সাশ্রয়ী</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E8E8EE] flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1A1D26]">১০০% জেনুইন ও নিরাপদ</h4>
              <p className="text-[11px] text-gray-500">ফুল ওয়ারেন্টি রিপ্লেসমেন্ট</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#E8E8EE] flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1A1D26]">লোকাল পেমেন্ট সাপোর্ট</h4>
              <p className="text-[11px] text-gray-500">bKash, Nagad, Cards</p>
            </div>
          </div>
        </div>

        {/* ================= TAB 1: SUCCESS STATE / CONFIRMATION SCREEN ================= */}
        {submittedData && activeTab === "form" ? (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-emerald-200 p-6 sm:p-10 shadow-sm text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-2">
              রিকোয়েস্ট আইডি: {submittedData.id}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-[#1A1D26] mb-2">
              আপনার রিকোয়েস্ট সফলভাবে জমা হয়েছে!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mb-6">
              আমাদের প্রোডাক্ট সোর্সিং টিম আপনার তথ্যাবলী যাচাই করে পরবর্তী ১ থেকে ৩ ঘণ্টার মধ্যে সেরা মূল্যের কোটেশন নিয়ে যোগাযোগ করবে।
            </p>

            {/* Request Summary Receipt */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200 text-left mb-6 space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-xs text-gray-500 font-medium">প্রোডাক্ট / টুল:</span>
                <span className="text-xs font-bold text-[#1A1D26]">{submittedData.productName}</span>
              </div>

              {submittedData.category && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">ক্যাটাগরি:</span>
                  <span className="text-xs font-semibold text-gray-800">{submittedData.category}</span>
                </div>
              )}

              {submittedData.duration && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">সাবস্ক্রিপশন মেয়াদ:</span>
                  <span className="text-xs font-semibold text-gray-800">{submittedData.duration}</span>
                </div>
              )}

              {submittedData.budgetBDT && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-xs text-gray-500 font-medium">টার্গেট বাজেট:</span>
                  <span className="text-xs font-bold text-[#FC5C03]">৳{submittedData.budgetBDT}</span>
                </div>
              )}

              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-xs text-gray-500 font-medium">জরুরী অবস্থা:</span>
                <span className="text-xs font-bold text-gray-800">
                  {submittedData.urgency === "URGENT" ? "🔴 অতি জরুরী (১-৩ ঘণ্টা)" : submittedData.urgency === "HIGH" ? "🟡 দ্রুত (আজকের মধ্যেই)" : "🟢 সাধারণ"}
                </span>
              </div>

              {submittedData.customerPhone && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">যোগাযোগ নাম্বার:</span>
                  <span className="text-xs font-semibold text-gray-800">{submittedData.customerPhone}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp এ সরাসরি যোগাযোগ করুন</span>
              </a>

              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>আরেকটি রিকোয়েস্ট করুন</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link
                href="/shop"
                className="text-xs font-bold text-[#FC5C03] hover:underline inline-flex items-center gap-1"
              >
                <span>রেডি প্রোডাক্ট দেখতে শপ ব্রাউজ করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : activeTab === "history" ? (
          /* ================= TAB 2: USER'S PREVIOUS REQUESTS ================= */
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-[#1A1D26]">আমার পূর্ববর্তী রিকোয়েস্টসমূহ</h3>
              <button
                onClick={fetchMyRequests}
                disabled={loadingRequests}
                className="p-2 text-gray-500 hover:text-[#FC5C03] hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-colors"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-4 h-4 ${loadingRequests ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loadingRequests ? (
              <div className="bg-white rounded-2xl border border-[#E8E8EE] p-12 text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FC5C03] mb-3" />
                <p className="text-xs text-gray-500 font-medium">রিকোয়েস্ট হিস্টোরি লোড হচ্ছে...</p>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8E8EE] p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-orange-50 text-[#FC5C03] flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#1A1D26] mb-1">কোনো রিকোয়েস্ট পাওয়া যায়নি</h4>
                <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
                  আপনি এখনো কোনো কাস্টম প্রোডাক্ট বা সাবস্ক্রিপশন সোর্সিং রিকোয়েস্ট করেননি।
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className="px-4 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                >
                  এখনই রিকোয়েস্ট করুন
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => {
                  const isPending = req.status === "PENDING";
                  const isInProgress = req.status === "IN_PROGRESS";
                  const isFulfilled = req.status === "FULFILLED";

                  return (
                    <div
                      key={req.id}
                      className="bg-white rounded-xl border border-[#E8E8EE] p-4 sm:p-5 shadow-2xs hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono text-gray-400">#{req.id.slice(0, 10)}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isFulfilled
                                ? "bg-green-100 text-green-700"
                                : isInProgress
                                ? "bg-blue-100 text-blue-700"
                                : isPending
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isFulfilled
                              ? "✅ সম্পন্ন হয়েছে"
                              : isInProgress
                              ? "🔄 সোর্সিং চলছে"
                              : isPending
                              ? "⏳ যাচাই করা হচ্ছে"
                              : "❌ অনুপলব্ধ"}
                          </span>
                          {req.urgency && (
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {req.urgency}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm sm:text-base font-black text-[#1A1D26]">
                          {req.productName}
                        </h4>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          {req.category && <span>ক্যাটাগরি: <b className="text-gray-700">{req.category}</b></span>}
                          {req.duration && <span>মেয়াদ: <b className="text-gray-700">{req.duration}</b></span>}
                          {(req.budgetBDT || req.targetBudget) && (
                            <span>বাজেট: <b className="text-[#FC5C03]">৳{req.budgetBDT || req.targetBudget}</b></span>
                          )}
                        </div>

                        {req.notes && (
                          <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-100 mt-1">
                            "{req.notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                        <span className="text-[11px] text-gray-400">
                          {new Date(req.createdAt).toLocaleDateString("bn-BD", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>

                        <a
                          href={`https://wa.me/8801800000000?text=${encodeURIComponent(
                            `হ্যালো, আমার রিকোয়েস্ট #${req.id} (${req.productName}) এর সর্বশেষ আপডেট জানতে চাই।`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#25D366] hover:underline flex items-center gap-1 mt-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>হোয়াটসঅ্যাপ আপডেট</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ================= TAB 1: INTERACTIVE REQUEST BUILDER ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
            
            {/* LEFT COLUMN: BUILDER FORM (7 Columns) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-8 shadow-2xs space-y-6">
              
              {/* Popular Chips Bar */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1D26] mb-2.5">
                  <Zap className="w-3.5 h-3.5 text-[#FC5C03]" />
                  <span>জনপ্রিয় টুলস (দ্রুত সিলেক্ট করুন):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SUGGESTIONS.map((preset) => {
                    const isSelected = productName === preset.name;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                          isSelected
                            ? "bg-[#FFF2E8] border-[#FC5C03] text-[#FC5C03] font-bold shadow-2xs"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. PRODUCT NAME */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1D26] mb-1.5">
                    ১. প্রোডাক্ট বা টুলের নাম <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Midjourney Pro, Cursor AI, GitHub Copilot..."
                      className="w-full text-xs sm:text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FC5C03] focus:bg-white font-medium text-gray-900 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* 2. CATEGORY SELECTOR */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1D26] mb-1.5">
                    ২. ক্যাটাগরি নির্বাচন করুন
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => {
                      const active = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                            active
                              ? "bg-[#FFF2E8] border-[#FC5C03] text-[#FC5C03] font-bold shadow-2xs ring-1 ring-[#FC5C03]/30"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                            {cat.id}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. SUBSCRIPTION DURATION */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1D26] mb-1.5">
                    ৩. সাবস্ক্রিপশন মেয়াদ (Subscription Duration)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {DURATION_OPTIONS.map((opt) => {
                      const active = duration === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDuration(opt.id)}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            active
                              ? "bg-[#FC5C03] border-[#FC5C03] text-white font-bold shadow-2xs"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className="text-xs font-bold">{opt.label}</div>
                          <div className={`text-[9px] ${active ? "text-orange-100" : "text-gray-400"}`}>
                            {opt.id}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. EXPECTED BUDGET RANGE */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-[#1A1D26]">
                      ৪. টার্গেট বাজেট (টাকা / BDT)
                    </label>
                    <span className="text-[11px] text-gray-400 font-medium">ঐচ্ছিক (আলোচনা সাপেক্ষে)</span>
                  </div>

                  <div className="relative mb-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                      ৳
                    </span>
                    <input
                      type="text"
                      value={budgetBDT}
                      onChange={(e) => setBudgetBDT(e.target.value)}
                      placeholder="e.g. ৫০০, ১২০০, ২৫০০..."
                      className="w-full text-xs sm:text-sm pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FC5C03] focus:bg-white font-semibold text-gray-900"
                    />
                  </div>

                  {/* Budget Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {BUDGET_PRESETS.map((preset) => {
                      const cleanPreset = preset.replace(/[^0-9]/g, "");
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setBudgetBDT(preset)}
                          className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                            budgetBDT === preset
                              ? "bg-[#FFF2E8] border-[#FC5C03] text-[#FC5C03] font-bold"
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. URGENCY LEVEL */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1D26] mb-1.5">
                    ৫. জরুরী অবস্থা (Urgency Level)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {URGENCY_LEVELS.map((lvl) => {
                      const active = urgency === lvl.id;
                      const IconComp = lvl.icon;
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setUrgency(lvl.id)}
                          className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                            active
                              ? `${lvl.color} font-bold shadow-2xs ring-1 ring-black/5`
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${lvl.dot}`} />
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold">{lvl.label}</div>
                            <div className="text-[10px] opacity-80">{lvl.timeframe}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. SPECIFIC NOTES / REQUIREMENTS */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1D26] mb-1.5">
                    ৬. অতিরিক্ত বিবরণ বা নির্দিষ্ট রিকোয়ারমেন্ট
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="যেমন: নিজের পার্সোনাল মেইলে ইনভাইট চান নাকি শেয়ার্ড অ্যাকাউন্ট, কোনো নির্দিষ্ট প্ল্যান বা সিট সংখ্যা থাকলে লিখুন..."
                    className="w-full text-xs sm:text-sm p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FC5C03] focus:bg-white text-gray-900 transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* 7. CONTACT INFORMATION */}
                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1D26]">
                    <Phone className="w-3.5 h-3.5 text-[#FC5C03]" />
                    <span>৭. যোগাযোগের তথ্য (Contact Information)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        আপনার নাম
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="আপনার নাম লিখুন"
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        WhatsApp / মোবাইল নাম্বার <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        ইমেইল অ্যাড্রেস
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="name@email.com"
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#FC5C03]"
                      />
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#FC5C03] hover:bg-[#EC4001] disabled:bg-gray-400 text-white text-xs sm:text-sm font-black rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>রিকোয়েস্ট প্রসেসিং হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>কাস্টম রিকোয়েস্ট সাবমিট করুন (Submit Request)</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: LIVE PREVIEW & GUARANTEE CARD (5 Columns) */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
              
              {/* LIVE PREVIEW CARD */}
              <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#FC5C03]" />
                    <h3 className="text-xs font-black text-[#1A1D26] uppercase tracking-wider">
                      লাইভ রিকোয়েস্ট প্রিভিউ
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-[#FFF2E8] text-[#FC5C03] font-bold rounded-full">
                    Pre-Order
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">টুল / প্রোডাক্ট:</span>
                    <div className="text-base font-black text-[#1A1D26]">
                      {productName.trim() || <span className="text-gray-300 italic font-normal">টুলের নাম লিখুন...</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-400 block font-semibold">ক্যাটাগরি</span>
                      <span className="font-bold text-gray-800 line-clamp-1">{category}</span>
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-400 block font-semibold">মেয়াদ</span>
                      <span className="font-bold text-gray-800">{duration}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-400 block font-semibold">টার্গেট বাজেট</span>
                      <span className="font-black text-[#FC5C03]">
                        {budgetBDT ? (budgetBDT.startsWith("৳") ? budgetBDT : `৳${budgetBDT}`) : "আলোচনা সাপেক্ষে"}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <span className="text-[10px] text-gray-400 block font-semibold">জরুরী অবস্থা</span>
                      <span className="font-bold text-gray-800">
                        {urgency === "URGENT" ? "🔴 ১-৩ ঘণ্টা" : urgency === "HIGH" ? "🟡 আজকের মধ্যেই" : "🟢 সাধারণ"}
                      </span>
                    </div>
                  </div>

                  {notes && (
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs">
                      <span className="text-[10px] text-gray-400 block font-semibold">নোট / বিবরণ</span>
                      <p className="text-gray-700 italic line-clamp-2 mt-0.5">"{notes}"</p>
                    </div>
                  )}

                  {customerPhone && (
                    <div className="text-[11px] text-gray-500 pt-2 border-t border-gray-100 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>যোগাযোগ: <b className="text-gray-700">{customerPhone}</b></span>
                    </div>
                  )}
                </div>
              </div>

              {/* GUARANTEE & SERVICE NOTICE */}
              <div className="bg-[#FFF8F4] border border-[#FFDEC9] rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FC5C03]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>AI Haat সোর্সিং নিশ্চয়তা (Guarantee)</span>
                </div>
                
                <ul className="text-xs text-gray-700 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span><b>কোনো অগ্রিম চার্জ নেই</b> — প্রোডাক্ট কোটেশন পাওয়ার পর পছন্দ হলে অর্ডার কনফার্ম করবেন।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span><b>১০০% অফিসিয়াল ইনভাইটেশন / লাইসেন্স কি</b> — আন-অফিসিয়াল ক্র্যাক বা মেয়াদহীন টুল দেওয়া হয় না।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span><b>ফুল টাইম রিপ্লেসমেন্ট সাপোর্ট</b> — মেয়াদের মধ্যে যেকোনো সমস্যায় সাথে সাথে সমাধান।</span>
                  </li>
                </ul>
              </div>

              {/* DIRECT WHATSAPP SUPPORT HELPLINE */}
              <div className="bg-white border border-[#E8E8EE] rounded-2xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-2">জরুরী কোনো বিষয়ে সরাসরি কথা বলতে চান?</p>
                <a
                  href="https://wa.me/8801800000000?text=Hello%20AI%20Haat%20Team%2C%20I%20have%20a%20custom%20product%20inquiry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-600 text-transparent" />
                  <span>হোয়াটসঅ্যাপে হেল্পলাইন সাপোর্ট (24/7)</span>
                </a>
              </div>

            </div>

          </div>
        )}

        {/* ================= FAQ ACCORDION SECTION ================= */}
        <div className="max-w-4xl mx-auto mt-16 sm:mt-20">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-[#1A1D26]">
              সাধারণ জিজ্ঞাসা (Frequently Asked Questions)
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              কাস্টম প্রোডাক্ট সোর্সিং এবং প্রি-অর্ডার সংক্রান্ত প্রয়োজনীয় উত্তর
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="bg-white rounded-xl border border-[#E8E8EE] overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#1A1D26] hover:text-[#FC5C03] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-[#FC5C03]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
