"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import {
  KeyRound,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Send,
  MessageSquare,
  Search,
  ExternalLink,
  ShieldAlert,
  Download,
  User,
  Lock,
  Banknote,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Sparkles,
  Terminal,
  Zap,
  RotateCcw,
  ShoppingCart,
  Calendar,
  Layers,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";

interface ActivationGuide {
  categoryKey: string;
  categoryNameEn: string;
  categoryNameBn: string;
  badge: {
    textEn: string;
    textBn: string;
    color: "emerald" | "amber" | "blue" | "purple" | "rose";
  };
  summaryEn: string;
  summaryBn: string;
  securityWarnings: Array<{
    titleEn: string;
    titleBn: string;
    textEn: string;
    textBn: string;
    severity: "danger" | "warning" | "info";
  }>;
  setupSteps: Array<{
    stepNumber: number;
    titleEn: string;
    titleBn: string;
    instructionEn: string;
    instructionBn: string;
    codeSnippet?: string;
    actionUrl?: string;
  }>;
  troubleshootingTips: Array<{
    problemEn: string;
    problemBn: string;
    solutionEn: string;
    solutionBn: string;
  }>;
  supportNoteEn: string;
  supportNoteBn: string;
}

interface DeliveredItem {
  id: string;
  orderId: string;
  orderItemId?: string;
  productId?: string | null;
  productSlug?: string | null;
  productName: string;
  variationName: string;
  accountType: string;
  category?: string;
  productType: "LICENSE_KEY" | "ACCOUNT_CREDENTIAL" | "DOWNLOAD_LINK" | "TEXT_INSTRUCTIONS";
  image?: string;
  credentials: string;
  instructions?: string | null;
  warrantyExpiresAt?: string | null;
  isWarrantyActive: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  warrantyPercentRemaining: number;
  isLifetime: boolean;
  isExpiringSoon: boolean;
  isReplacement: boolean;
  replacedDeliveryId?: string | null;
  hasOpenReplacement: boolean;
  hasOpenRefund?: boolean;
  isRefunded?: boolean;
  purchasePrice?: number;
  deliveredAt: string;
  activationGuide?: ActivationGuide;
}

const REVEAL_AUTO_HIDE_SECONDS = 30;

export default function DigitalKeysPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isBn = language === "bn";

  const [keys, setKeys] = useState<DeliveredItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "EXPIRING" | "REPLACEMENT" | "LICENSE" | "ACCOUNT">("ALL");

  // Credential unveil & auto-masking timer state (shoulder-surfing protection)
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<Record<string, number>>({});
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // Expanded activation guide accordion state
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({});

  // Replacement modal state
  const [selectedItemForReplacement, setSelectedItemForReplacement] = useState<DeliveredItem | null>(null);
  const [replacementReason, setReplacementReason] = useState("LOGIN_FAILED");
  const [replacementDesc, setReplacementDesc] = useState("");
  const [submittingReplacement, setSubmittingReplacement] = useState(false);
  const [replacementResult, setReplacementResult] = useState<{
    success: boolean;
    autoReplaced?: boolean;
    message?: string;
    newDeliveryId?: string;
  } | null>(null);
  const [replacementError, setReplacementError] = useState("");

  // Refund modal state
  const [selectedItemForRefund, setSelectedItemForRefund] = useState<DeliveredItem | null>(null);
  const [refundReason, setRefundReason] = useState("LOGIN_FAILED");
  const [refundDesc, setRefundDesc] = useState("");
  const [refundMethod, setRefundMethod] = useState("WALLET");
  const [refundPayoutAccount, setRefundPayoutAccount] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState(false);
  const [refundError, setRefundError] = useState("");

  const fetchVault = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/vault/credentials");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.keys) {
          setKeys(data.keys);
        }
      }
    } catch (error) {
      console.error("Failed to load digital vault:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  // Clean up all countdown timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach((t) => clearInterval(t));
    };
  }, []);

  // 1. One-click Copy Handler with Toast
  const handleCopy = (id: string, text: string, label = "Credentials") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(
      isBn ? `${label} ক্লিপবোর্ডে কপি হয়েছে!` : `${label} copied to clipboard!`,
      "success"
    );
  };

  // 2. Unveil Toggle with 30s Shoulder-Surfing Auto-Hide Countdown
  const toggleKeyReveal = (itemId: string) => {
    const isCurrentlyRevealed = !!revealedKeys[itemId];

    if (isCurrentlyRevealed) {
      // Re-mask immediately
      if (timerRefs.current[itemId]) {
        clearInterval(timerRefs.current[itemId]);
        delete timerRefs.current[itemId];
      }
      setRevealedKeys((prev) => ({ ...prev, [itemId]: false }));
      setRevealedFields((prev) => ({ ...prev, [`${itemId}-p`]: false }));
      setTimerSecondsLeft((prev) => ({ ...prev, [itemId]: 0 }));
      showToast(isBn ? "ক্রেডেনশিয়াল গোপন করা হয়েছে" : "Credentials masked", "info");
    } else {
      // Reveal and start 30s auto-hide countdown
      setRevealedKeys((prev) => ({ ...prev, [itemId]: true }));
      setRevealedFields((prev) => ({ ...prev, [`${itemId}-p`]: true }));
      setTimerSecondsLeft((prev) => ({ ...prev, [itemId]: REVEAL_AUTO_HIDE_SECONDS }));

      if (timerRefs.current[itemId]) {
        clearInterval(timerRefs.current[itemId]);
      }

      timerRefs.current[itemId] = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          const current = prev[itemId] || 0;
          if (current <= 1) {
            clearInterval(timerRefs.current[itemId]);
            delete timerRefs.current[itemId];
            setRevealedKeys((r) => ({ ...r, [itemId]: false }));
            setRevealedFields((f) => ({ ...f, [`${itemId}-p`]: false }));
            showToast(
              isBn ? "নিরাপত্তার স্বার্থে ক্রেডেনশিয়াল পুনরায় মাস্ক করা হয়েছে (30s)" : "Credentials automatically re-masked for security (30s)",
              "info"
            );
            return { ...prev, [itemId]: 0 };
          }
          return { ...prev, [itemId]: current - 1 };
        });
      }, 1000);
    }
  };

  // Toggle specific sub-field reveal (e.g. password only)
  const toggleFieldReveal = (fieldKey: string) => {
    setRevealedFields((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  // 3. Single-item Credential Export as .txt
  const handleExportTextFile = (item: DeliveredItem) => {
    const parsed = parseCredentials(item.credentials);
    const dateFormatted = new Date(item.deliveredAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const warrantyExpiryText = item.isLifetime
      ? "Lifetime Activation Warranty"
      : item.warrantyExpiresAt
      ? new Date(item.warrantyExpiresAt).toLocaleDateString("en-US", { dateStyle: "long" })
      : "Standard Term Warranty";

    const content = `=====================================================
AI HAAT SECURE DIGITAL VAULT - PRODUCT CREDENTIALS
https://aihaat.shop
=====================================================

Product Name   : ${item.productName}
Plan / Variant : ${item.variationName}
Account Type   : ${item.accountType}
Order Reference: #${item.orderId}
Delivery Date  : ${dateFormatted}
Warranty Status: ${item.isWarrantyActive ? "ACTIVE" : "EXPIRED"} (${warrantyExpiryText})
${item.isReplacement ? "Note           : [Warranty Replacement Issue]\n" : ""}
-----------------------------------------------------
CREDENTIAL ACCESS DETAILS
-----------------------------------------------------
${parsed.username ? `Email / User   : ${parsed.username}\n` : ""}${
      parsed.password ? `Password / PIN : ${parsed.password}\n` : ""
    }${parsed.licenseKey ? `License Key    : ${parsed.licenseKey}\n` : ""}${
      parsed.extraLines.length > 0
        ? `Extra Details  :\n${parsed.extraLines.join("\n")}\n`
        : ""
    }
-----------------------------------------------------
FULL CREDENTIAL PAYLOAD:
${item.credentials}

-----------------------------------------------------
ACTIVATION & USAGE INSTRUCTIONS:
${item.instructions || "Log in using the provided credentials on the official platform."}
${
  item.activationGuide?.securityWarnings && item.activationGuide.securityWarnings.length > 0
    ? `\nSECURITY POLICY & GUIDELINES:\n${item.activationGuide.securityWarnings
        .map((w) => `- ${w.titleEn}: ${w.textEn}`)
        .join("\n")}`
    : ""
}

=====================================================
Need support or warranty replacement?
Visit: https://aihaat.shop/dashboard/keys
Support WhatsApp: +8801700000000
=====================================================
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeSlug = (item.productSlug || item.productName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    link.href = url;
    link.download = `AIHAAT-Credentials-${item.orderId}-${safeSlug}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(isBn ? "ক্রেডেনশিয়াল .txt ফাইল ডাউনলোড হয়েছে!" : "Credentials exported as .txt successfully!", "success");
  };

  // Toggle guide accordion
  const toggleGuide = (id: string) => {
    setExpandedGuides((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to parse credentials lines
  const parseCredentials = (raw: string) => {
    if (!raw) return { username: "", password: "", licenseKey: "", extraLines: [], raw: "" };
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    let username = "";
    let password = "";
    let licenseKey = "";
    const extraLines: string[] = [];

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.startsWith("user:") || lower.startsWith("email:") || lower.startsWith("username:")) {
        username = line.substring(line.indexOf(":") + 1).trim();
      } else if (lower.startsWith("pass:") || lower.startsWith("password:") || lower.startsWith("pin:")) {
        password = line.substring(line.indexOf(":") + 1).trim();
      } else if (lower.startsWith("key:") || lower.startsWith("license:") || lower.startsWith("code:") || lower.startsWith("serial:")) {
        licenseKey = line.substring(line.indexOf(":") + 1).trim();
      } else if (lines.length === 1 && !line.includes(":") && line.length > 10) {
        licenseKey = line;
      } else {
        extraLines.push(line);
      }
    }

    return { username, password, licenseKey, extraLines, raw };
  };

  // Replacement modal triggers
  const handleOpenReplacementModal = (item: DeliveredItem) => {
    setSelectedItemForReplacement(item);
    setReplacementReason("LOGIN_FAILED");
    setReplacementDesc("");
    setReplacementError("");
    setReplacementResult(null);
  };

  const handleSubmitReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForReplacement || !replacementDesc.trim()) {
      setReplacementError(isBn ? "অনুগ্রহ করে সমস্যার বিবরণ লিখুন।" : "Please provide a description of the issue.");
      return;
    }

    setSubmittingReplacement(true);
    setReplacementError("");

    try {
      const res = await fetch("/api/replacements/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedItemForReplacement.orderId,
          orderItemId: selectedItemForReplacement.orderItemId,
          originalDeliveryId: selectedItemForReplacement.id,
          reason: replacementReason,
          description: replacementDesc.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReplacementResult({
          success: true,
          autoReplaced: data.autoReplaced,
          message: data.message,
          newDeliveryId: data.newDeliveryId,
        });

        showToast(
          data.autoReplaced
            ? isBn
              ? "ইনস্ট্যান্ট রিপ্লেসমেন্ট সফল! নতুন কি ভল্টে যোগ করা হয়েছে।"
              : "Instant auto-replacement fulfilled! New credentials added to your vault."
            : isBn
            ? "রিপ্লেসমেন্ট ক্লেইম সফলভাবে জমা হয়েছে!"
            : "Replacement claim submitted successfully!",
          "success"
        );

        setTimeout(() => {
          setSelectedItemForReplacement(null);
          setReplacementResult(null);
          fetchVault();
        }, 2200);
      } else {
        setReplacementError(data.error || "Failed to submit replacement claim.");
      }
    } catch {
      setReplacementError("Network error. Please try again.");
    } finally {
      setSubmittingReplacement(false);
    }
  };

  // Refund modal triggers
  const handleOpenRefundModal = (item: DeliveredItem) => {
    setSelectedItemForRefund(item);
    setRefundReason("LOGIN_FAILED");
    setRefundDesc("");
    setRefundMethod("WALLET");
    setRefundPayoutAccount("");
    setRefundError("");
    setRefundSuccess(false);
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForRefund || !refundDesc.trim()) {
      setRefundError(isBn ? "অনুগ্রহ করে সমস্যার বিবরণ লিখুন।" : "Please provide a description of the issue.");
      return;
    }
    if (refundMethod !== "WALLET" && !refundPayoutAccount.trim()) {
      setRefundError(isBn ? "অনুগ্রহ করে পেআউট অ্যাকাউন্ট নম্বর দিন।" : "Please provide a payout account number.");
      return;
    }

    setSubmittingRefund(true);
    setRefundError("");

    try {
      const res = await fetch("/api/refunds/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedItemForRefund.orderId,
          orderItemId: selectedItemForRefund.orderItemId,
          reason: refundReason,
          description: refundDesc.trim(),
          payoutMethod: refundMethod,
          payoutAccount: refundMethod === "WALLET" ? undefined : refundPayoutAccount.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRefundSuccess(true);
        showToast(
          isBn ? "রিফান্ড রিকোয়েস্ট সফলভাবে জমা হয়েছে!" : "Refund request submitted successfully!",
          "success"
        );
        setTimeout(() => {
          setSelectedItemForRefund(null);
          setRefundSuccess(false);
          fetchVault();
        }, 1800);
      } else {
        setRefundError(data.error || "Failed to submit refund claim.");
      }
    } catch {
      setRefundError("Network error. Please try again.");
    } finally {
      setSubmittingRefund(false);
    }
  };

  // Filter keys
  const filteredKeys = keys.filter((k) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      k.productName.toLowerCase().includes(searchLower) ||
      k.orderId.toLowerCase().includes(searchLower) ||
      k.accountType.toLowerCase().includes(searchLower) ||
      (k.variationName && k.variationName.toLowerCase().includes(searchLower)) ||
      (k.category && k.category.toLowerCase().includes(searchLower));

    if (filter === "ACTIVE") return matchesSearch && k.isWarrantyActive;
    if (filter === "EXPIRING") return matchesSearch && k.isWarrantyActive && k.isExpiringSoon;
    if (filter === "REPLACEMENT") return matchesSearch && k.isReplacement;
    if (filter === "LICENSE") return matchesSearch && k.productType === "LICENSE_KEY";
    if (filter === "ACCOUNT") return matchesSearch && k.productType === "ACCOUNT_CREDENTIAL";
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      
      {/* 1. Header Card with Security Shield & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-gradient-to-br from-white via-slate-50 to-[#FFF7F2] rounded-3xl border border-[#E8E8EE] p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FC5C03]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBn ? "AES-256 এনক্রিপ্টেড ডিজিটাল ভল্ট" : "AES-256 Encrypted Digital Vault"}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 text-[#FC5C03] text-[11px] font-bold rounded-full border border-orange-200">
              <Zap className="w-3 h-3 text-[#FC5C03]" />
              <span>{isBn ? "অটো ওয়ারেন্টি রিপ্লেসমেন্ট" : "Instant Warranty Automation"}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D26] tracking-tight">
            {isBn ? "ডিজিটাল প্রোডাক্ট ও লাইসেন্স ভল্ট" : "My Digital Products & Vault"}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A8190] max-w-xl leading-relaxed">
            {isBn
              ? "আপনার ক্রয়কৃত সকল ডিজিটাল সফটওয়্যার লাইসেন্স, প্রিমিয়াম অ্যাকাউন্ট লগইন, রিয়েল-টাইম ওয়ারেন্টি ও ইনস্ট্যান্ট রিপ্লেসমেন্ট সুবিধা।"
              : "Access delivered credentials securely, track live warranty coverage, read setup guides, and request 1-click warranty replacements."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 self-start md:self-auto flex-wrap">
          <button
            onClick={fetchVault}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FC5C03]" : ""}`} />
            <span>{isBn ? "রিফ্রেশ" : "Refresh Vault"}</span>
          </button>
          <Link
            href="/shop"
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#E04F00] text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{isBn ? "নতুন প্রোডাক্ট কিনুন" : "Browse Shop"}</span>
          </Link>
        </div>
      </div>

      {/* 2. Search, Filter & Quick Statistics Bar */}
      <div className="bg-white rounded-2xl border border-[#E8E8EE] p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#7A8190] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={isBn ? "প্রোডাক্টের নাম, অর্ডার আইডি বা টাইপ খুঁজুন..." : "Search by product, order #ID, or plan..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03] focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: isBn ? "সকল পণ্য" : "All Products", count: keys.length },
            { id: "ACTIVE", label: isBn ? "সক্রিয় ওয়ারেন্টি" : "Active Warranty", count: keys.filter((k) => k.isWarrantyActive).length },
            { id: "EXPIRING", label: isBn ? "মেয়াদ শেষ প্রায় (<৩ দিন)" : "Expiring (<3d)", count: keys.filter((k) => k.isWarrantyActive && k.isExpiringSoon).length },
            { id: "REPLACEMENT", label: isBn ? "রিপ্লেসমেন্ট" : "Replaced", count: keys.filter((k) => k.isReplacement).length },
            { id: "LICENSE", label: isBn ? "লাইসেন্স কি" : "License Keys", count: keys.filter((k) => k.productType === "LICENSE_KEY").length },
            { id: "ACCOUNT", label: isBn ? "অ্যাকাউন্ট" : "Accounts", count: keys.filter((k) => k.productType === "ACCOUNT_CREDENTIAL").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filter === tab.id
                  ? "bg-[#1A1D26] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filter === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Vault Items Listing */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-5 w-48 bg-slate-200 rounded-md" />
                <div className="h-5 w-24 bg-slate-200 rounded-md" />
              </div>
              <div className="h-20 bg-slate-100 rounded-2xl" />
              <div className="h-10 bg-slate-100 rounded-xl w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredKeys.length > 0 ? (
        <div className="space-y-6">
          {filteredKeys.map((item) => {
            const parsed = parseCredentials(item.credentials);
            const isItemRevealed = !!revealedKeys[item.id];
            const isPassRevealed = !!revealedFields[`${item.id}-p`] || isItemRevealed;
            const secondsLeft = timerSecondsLeft[item.id] || 0;
            const isGuideExpanded = !!expandedGuides[item.id];
            const guide = item.activationGuide;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl border transition-all duration-200 relative overflow-hidden shadow-sm hover:shadow-md ${
                  item.isExpiringSoon
                    ? "border-amber-300 ring-1 ring-amber-200/60"
                    : item.isWarrantyActive
                    ? "border-[#E8E8EE] hover:border-[#FC5C03]/40"
                    : "border-slate-200 bg-slate-50/50"
                }`}
              >
                {/* Visual Status Indicator Top Stripe */}
                <div
                  className={`h-1.5 w-full ${
                    item.isExpiringSoon
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse"
                      : item.isWarrantyActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-slate-300"
                  }`}
                />

                <div className="p-5 sm:p-7 space-y-5">
                  
                  {/* CARD HEADER: Product Title, Order Ref, Badges & Warranty Meter */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-start gap-4">
                      {item.image ? (
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 p-1 shrink-0 overflow-hidden hidden sm:flex items-center justify-center">
                          <SafeImage src={item.image} alt={item.productName} aspectRatio="1/1" objectFit="contain" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#FFF2E8] border border-[#FFE4D6] text-[#FC5C03] shrink-0 hidden sm:flex items-center justify-center font-bold shadow-inner">
                          <KeyRound className="w-7 h-7" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/dashboard/orders?orderId=${item.orderId}`}
                            className="font-mono text-xs font-bold text-[#FC5C03] hover:underline bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200"
                          >
                            #{item.orderId}
                          </Link>

                          {item.isReplacement && (
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md border border-blue-200 flex items-center gap-1">
                              <RotateCcw className="w-3 h-3 text-blue-600" />
                              <span>Replacement Issue</span>
                            </span>
                          )}

                          {item.hasOpenReplacement && (
                            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-md border border-amber-200 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                              <span>Warranty Claim In Review</span>
                            </span>
                          )}

                          {item.isRefunded && (
                            <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-md border border-red-200">
                              Item Refunded
                            </span>
                          )}

                          {guide?.badge && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md border border-slate-200">
                              {guide.badge.textEn}
                            </span>
                          )}
                        </div>

                        <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                          {item.productName}
                        </h2>

                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span>
                            Plan: <strong className="text-slate-800 font-bold">{item.variationName}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Type: <span className="font-mono text-slate-700">{item.accountType}</span>
                          </span>
                          <span>•</span>
                          <span className="text-[11px] text-slate-400">
                            Delivered: {new Date(item.deliveredAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* REAL-TIME WARRANTY COUNTDOWN & EXPIRY BADGE */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 sm:p-3.5 space-y-2 min-w-[240px]">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold flex items-center gap-1 text-slate-700">
                          <ShieldCheck className={`w-3.5 h-3.5 ${item.isExpiringSoon ? "text-amber-500" : item.isWarrantyActive ? "text-emerald-600" : "text-red-500"}`} />
                          <span>{isBn ? "ওয়ারেন্টি স্ট্যাটাস:" : "Warranty Status:"}</span>
                        </span>
                        
                        <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                          item.isExpiringSoon
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : item.isWarrantyActive
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-red-100 text-red-800 border border-red-300"
                        }`}>
                          {item.isLifetime
                            ? "Lifetime"
                            : item.isWarrantyActive
                            ? `${item.daysRemaining}d ${item.hoursRemaining % 24}h Left`
                            : "Expired"}
                        </span>
                      </div>

                      {/* Visual Progress Bar */}
                      {!item.isLifetime && item.warrantyExpiresAt && (
                        <div className="space-y-1">
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                item.isExpiringSoon
                                  ? "bg-amber-500"
                                  : item.isWarrantyActive
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${item.warrantyPercentRemaining}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>Delivered: {new Date(item.deliveredAt).toLocaleDateString()}</span>
                            <span>Expires: {new Date(item.warrantyExpiresAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}

                      {/* Renew CTA Button if Expiring or Expired */}
                      {(item.isExpiringSoon || !item.isWarrantyActive) && (
                        <Link
                          href={item.productSlug ? `/products/${item.productSlug}` : `/shop?search=${encodeURIComponent(item.productName)}`}
                          className="w-full mt-1 px-3 py-1.5 bg-[#FC5C03] hover:bg-[#E04F00] text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>{isBn ? "সাবস্ক্রিপশন রিনিউ করুন" : "Renew Subscription"}</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* SECURE CREDENTIAL UNVEILING & SHOULDER-SURFING SHIELD */}
                  <div className="space-y-3">
                    
                    {/* Unveil Action Toolbar & 30s Countdown Timer */}
                    <div className="flex items-center justify-between gap-3 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-200/70 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleKeyReveal(item.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                            isItemRevealed
                              ? "bg-slate-900 text-white hover:bg-black"
                              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {isItemRevealed ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isBn ? "গোপন করুন (Mask)" : "Mask All"}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-[#FC5C03]" />
                              <span>{isBn ? "দেখান (Reveal)" : "Reveal Credentials"}</span>
                            </>
                          )}
                        </button>

                        {/* 30s Shoulder-Surfing Active Timer Indicator */}
                        {isItemRevealed && secondsLeft > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>Auto-mask in {secondsLeft}s</span>
                          </span>
                        )}
                      </div>

                      {/* Export / Copy All Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(item.id, item.credentials, "All credentials")}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Copy Full Credentials Block"
                        >
                          <Copy className="w-3 h-3 text-[#FC5C03]" />
                          <span className="hidden sm:inline">{isBn ? "সব কপি" : "Copy All"}</span>
                        </button>

                        <button
                          onClick={() => handleExportTextFile(item)}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Download as .txt"
                        >
                          <Download className="w-3 h-3 text-emerald-600" />
                          <span className="hidden sm:inline">Export .txt</span>
                        </button>
                      </div>
                    </div>

                    {/* CREDENTIALS PRESENTATION (Structured Account vs License Key) */}
                    {parsed.username || parsed.password ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Username Box */}
                        {parsed.username && (
                          <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-bold flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-[#FC5C03]" />
                                <span>{isBn ? "ইমেইল / ইউজারনেম:" : "Email / Username:"}</span>
                              </span>
                              <button
                                onClick={() => handleCopy(item.id + "-u", parsed.username, "Username")}
                                className="text-slate-600 hover:text-[#FC5C03] p-1 cursor-pointer transition-colors"
                                title="Copy Username"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-sm font-mono font-bold text-slate-900 break-all select-all">
                              {parsed.username}
                            </p>
                          </div>
                        )}

                        {/* Password Box */}
                        {parsed.password && (
                          <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-bold flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{isBn ? "পাসওয়ার্ড / পিন:" : "Password / PIN:"}</span>
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => toggleFieldReveal(`${item.id}-p`)}
                                  className="text-slate-600 hover:text-slate-900 p-1 cursor-pointer"
                                  title={isPassRevealed ? "Hide Password" : "Show Password"}
                                >
                                  {isPassRevealed ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-[#FC5C03]" />}
                                </button>
                                <button
                                  onClick={() => handleCopy(item.id + "-p", parsed.password, "Password")}
                                  className="text-slate-600 hover:text-[#FC5C03] p-1 cursor-pointer transition-colors"
                                  title="Copy Password"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm font-mono font-bold text-slate-900 select-all">
                              {isPassRevealed ? parsed.password : "••••••••••••••••"}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* License Key / Raw Payload Block */}
                    {(parsed.licenseKey || (!parsed.username && !parsed.password)) && (
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-emerald-400 space-y-2">
                        <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isBn ? "লাইসেন্স কি / ডিজিটাল ক্রেডেনশিয়াল" : "Digital License Key / Credentials"}</span>
                          </span>
                          <button
                            onClick={() => handleCopy(item.id, item.credentials, "License Key")}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{isBn ? "কপি কি" : "Copy Key"}</span>
                          </button>
                        </div>
                        <pre className="font-mono text-xs sm:text-sm whitespace-pre-wrap break-all select-all leading-relaxed pt-1">
                          {isItemRevealed ? item.credentials : item.credentials.replace(/./g, "•").slice(0, 32)}
                        </pre>
                      </div>
                    )}

                    {/* Specific Custom Instructions from Order Note */}
                    {item.instructions && (
                      <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-900 space-y-1">
                        <strong className="font-bold flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isBn ? "বিশেষ ডেলিভারি নির্দেশিকা:" : "Order Delivery Instructions:"}</span>
                        </strong>
                        <p className="leading-relaxed whitespace-pre-wrap text-blue-950">{item.instructions}</p>
                      </div>
                    )}

                  </div>

                  {/* 4. INTERACTIVE PRODUCT ACTIVATION & SETUP GUIDES ACCORDION */}
                  {guide && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden transition-all">
                      <button
                        onClick={() => toggleGuide(item.id)}
                        className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#FC5C03]" />
                          <span>{isBn ? (guide.categoryNameBn || "অ্যাক্টিভেশন নির্দেশিকা ও সুরক্ষা নিয়মাবলী") : "Activation Guide & Security Rules"}</span>
                          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                            ({guide.categoryNameEn})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <span className="text-[11px]">{isGuideExpanded ? (isBn ? "সংক্ষেপ করুন" : "Hide") : (isBn ? "বিস্তারিত দেখুন" : "View Steps")}</span>
                          {isGuideExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isGuideExpanded && (
                        <div className="p-4 sm:p-5 pt-2 border-t border-slate-200/80 space-y-4 bg-white">
                          
                          {/* Security Warning Callouts */}
                          {guide.securityWarnings && guide.securityWarnings.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                <span>{isBn ? "জরুরি নিরাপত্তা নির্দেশনা" : "Security & Warranty Rules"}</span>
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {guide.securityWarnings.map((w, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-xl text-xs space-y-0.5 border ${
                                      w.severity === "danger"
                                        ? "bg-red-50 text-red-900 border-red-200"
                                        : w.severity === "warning"
                                        ? "bg-amber-50 text-amber-900 border-amber-200"
                                        : "bg-blue-50 text-blue-900 border-blue-200"
                                    }`}
                                  >
                                    <strong className="font-bold block flex items-center gap-1">
                                      {w.severity === "danger" ? "⛔" : "⚠️"} {isBn ? w.titleBn : w.titleEn}
                                    </strong>
                                    <p className="text-[11px] leading-relaxed opacity-90">
                                      {isBn ? w.textBn : w.textEn}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Step-by-Step Walkthrough */}
                          {guide.setupSteps && guide.setupSteps.length > 0 && (
                            <div className="space-y-2.5">
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#FC5C03]" />
                                <span>{isBn ? "ধাপে ধাপে সেটআপ নির্দেশিকা" : "Step-by-Step Setup Guide"}</span>
                              </h4>
                              <div className="space-y-2">
                                {guide.setupSteps.map((step) => (
                                  <div key={step.stepNumber} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <span className="w-5 h-5 rounded-full bg-[#1A1D26] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                      {step.stepNumber}
                                    </span>
                                    <div className="space-y-1 flex-1 text-xs">
                                      <h5 className="font-bold text-slate-900">{isBn ? step.titleBn : step.titleEn}</h5>
                                      <p className="text-slate-600 leading-relaxed">{isBn ? step.instructionBn : step.instructionEn}</p>
                                      {step.codeSnippet && (
                                        <div className="mt-1.5 p-2 bg-slate-900 rounded-lg text-emerald-400 font-mono text-[11px] flex items-center justify-between gap-2 overflow-x-auto">
                                          <code>{step.codeSnippet}</code>
                                          <button
                                            onClick={() => handleCopy(item.id + "-code-" + step.stepNumber, step.codeSnippet || "", "Code Snippet")}
                                            className="p-1 hover:text-white cursor-pointer"
                                            title="Copy Snippet"
                                          >
                                            <Copy className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Troubleshooting Tips */}
                          {guide.troubleshootingTips && guide.troubleshootingTips.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                💡 {isBn ? "সাধারণ সমস্যার সমাধান (Troubleshooting)" : "Troubleshooting Common Issues"}
                              </h4>
                              <div className="space-y-2 text-xs">
                                {guide.troubleshootingTips.map((tip, idx) => (
                                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                                    <strong className="font-bold text-slate-900 block">Q: {isBn ? tip.problemBn : tip.problemEn}</strong>
                                    <p className="text-slate-600 text-[11px] leading-relaxed">A: {isBn ? tip.solutionBn : tip.solutionEn}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. CARD FOOTER: Warranty Claim CTA, Refund & Live WhatsApp Support */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-slate-500 font-medium">
                      {isBn ? "ওয়ারেন্টি সেবা অথবা সরাসরি সহায়তার জন্য নিচের বাটন ব্যবহার করুন।" : "Need assistance or warranty replacement? Claim self-service below."}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                      
                      {/* 1-Click Warranty Claim / Replacement Button */}
                      <button
                        onClick={() => handleOpenReplacementModal(item)}
                        disabled={item.hasOpenReplacement || !item.isWarrantyActive || item.isRefunded}
                        className="px-3.5 py-2 bg-[#FFF2E8] hover:bg-[#FFE4D6] text-[#FC5C03] border border-[#FC5C03]/30 rounded-xl font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                        title={!item.isWarrantyActive ? "Warranty expired" : item.hasOpenReplacement ? "Claim pending" : "Claim Warranty Replacement"}
                      >
                        <Zap className="w-3.5 h-3.5 text-[#FC5C03]" />
                        <span>
                          {item.hasOpenReplacement
                            ? isBn ? "ক্লেইম প্রক্রিয়াধীন" : "Claim Under Review"
                            : !item.isWarrantyActive
                            ? isBn ? "ওয়ারেন্টি মেয়াদোত্তীর্ণ" : "Warranty Expired"
                            : isBn ? "ওয়ারেন্টি রিপ্লেসমেন্ট ক্লেইম" : "Claim Replacement"}
                        </span>
                      </button>

                      {/* Request Refund Button */}
                      <button
                        onClick={() => handleOpenRefundModal(item)}
                        disabled={item.hasOpenRefund || item.isRefunded}
                        className="px-3.5 py-2 bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Banknote className="w-3.5 h-3.5 text-red-500" />
                        <span>{item.hasOpenRefund ? (isBn ? "রিফান্ড রিভিউতে" : "Refund Requested") : isBn ? "রিফান্ড ক্লেইম" : "Request Refund"}</span>
                      </button>

                      {/* WhatsApp Support Link */}
                      <Link
                        href={`https://wa.me/8801700000000?text=${encodeURIComponent(`Hello AI Haat Support, I need assistance with my Order #${item.orderId} (${item.productName})`)}`}
                        target="_blank"
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <span>WhatsApp Help</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-4 shadow-2xs">
          <div className="w-16 h-16 bg-[#FFF2E8] text-[#FC5C03] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <KeyRound className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-black text-slate-900">
              {isBn ? "কোনো ডিজিটাল লাইসেন্স বা কি পাওয়া যায়নি" : "No Digital Products Found"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isBn
                ? "আপনার কেনা ডিজিটাল প্রোডাক্ট, লাইসেন্স কি এবং সাবস্ক্রিপশন লগইন অর্ডার ডেলিভারি হওয়ার সাথে সাথেই এখানে স্বয়ংক্রিয়ভাবে জমা হবে।"
                : "Your purchased digital software licenses, keys, and subscription logins will appear here securely upon order fulfillment."}
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <span>{isBn ? "শপ ব্রাউজ করুন" : "Browse Marketplace"}</span>
          </Link>
        </div>
      )}

      {/* 6. SELF-SERVICE WARRANTY REPLACEMENT CLAIM MODAL */}
      {selectedItemForReplacement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItemForReplacement(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] text-xs font-bold rounded-full border border-[#FFE4D6]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isBn ? "সেলফ-সার্ভিস ওয়ারেন্টি ক্লেইম" : "Self-Service Warranty Claim"}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {isBn ? "লাইসেন্স কি / অ্যাকাউন্ট রিপ্লেসমেন্ট" : "Claim Replacement Key"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {selectedItemForReplacement.productName} — Order #{selectedItemForReplacement.orderId}
              </p>
            </div>

            {replacementResult ? (
              <div className={`p-6 rounded-2xl text-center space-y-3 border ${
                replacementResult.autoReplaced
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-blue-50 border-blue-200 text-blue-900"
              }`}>
                <CheckCircle2 className={`w-12 h-12 mx-auto ${replacementResult.autoReplaced ? "text-emerald-600" : "text-blue-600"}`} />
                <h4 className="text-base font-black">
                  {replacementResult.autoReplaced
                    ? (isBn ? "🎉 ইনস্ট্যান্ট অটো-রিপ্লেসমেন্ট সম্পন্ন!" : "🎉 Instant Replacement Fulfilled!")
                    : (isBn ? "রিপ্লেসমেন্ট রিকোয়েস্ট জমা হয়েছে" : "Claim Submitted for Review")}
                </h4>
                <p className="text-xs leading-relaxed opacity-90">
                  {replacementResult.message || (
                    replacementResult.autoReplaced
                      ? "A fresh license key / credential has been instantly dispatched to your Digital Vault."
                      : "Our admin team is reviewing your warranty claim and will dispatch replacement credentials shortly."
                  )}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReplacement} className="space-y-4">
                {replacementError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{replacementError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {isBn ? "সমস্যার ধরন (Reason):" : "Issue Type (Reason):"}
                  </label>
                  <select
                    value={replacementReason}
                    onChange={(e) => setReplacementReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                  >
                    <option value="LOGIN_FAILED">Login Failed / Password Invalid</option>
                    <option value="ACCOUNT_LOCKED">Account Locked / 2FA Challenge Prompt</option>
                    <option value="LICENSE_INVALID">License Key Invalid / Already Redeemed</option>
                    <option value="SUBSCRIPTION_STOPPED">Subscription Terminated Prematurely</option>
                    <option value="WRONG_CREDENTIALS">Incorrect Plan / Edition Delivered</option>
                    <option value="OTHER">Other Technical Problem</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {isBn ? "সমস্যার বিস্তারিত বিবরণ (Description):" : "Describe the Issue (Description):"}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={replacementDesc}
                    onChange={(e) => setReplacementDesc(e.target.value)}
                    placeholder={isBn ? "সমস্যা বা এরর মেসেজের বিস্তারিত বিবরণ দিন..." : "Provide details of the error message or issue experienced..."}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03] resize-none font-medium"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <Zap className="w-3 h-3 text-[#FC5C03]" />
                    <span>Instant Stock Dispatch Automation</span>
                  </div>
                  <p>
                    If replacement stock is available in our pool, your new key will be auto-delivered instantly!
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submittingReplacement}
                  className="w-full py-3 bg-[#FC5C03] hover:bg-[#EC4001] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingReplacement ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isBn ? "রিপ্লেসমেন্ট ক্লেইম জমা দিন" : "Submit Replacement Claim"}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 7. REFUND REQUEST MODAL */}
      {selectedItemForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItemForRefund(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
                <Banknote className="w-3.5 h-3.5" />
                <span>{isBn ? "রিফান্ড ক্লেইম" : "Refund Request"}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {isBn ? "রিফান্ডের আবেদন করুন" : "Request Refund"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {selectedItemForRefund.productName} — Order #{selectedItemForRefund.orderId}
              </p>
            </div>

            {refundSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">
                  {isBn ? "রিফান্ড রিকোয়েস্ট জমা হয়েছে!" : "Refund Request Submitted!"}
                </h4>
                <p className="text-xs text-emerald-700">
                  Our finance team will review your claim and process the refund shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRefund} className="space-y-4">
                {refundError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{refundError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {isBn ? "রিফান্ড মেথড:" : "Refund Method:"}
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                  >
                    <option value="WALLET">Wallet Balance (Instant credit to AI Haat Wallet)</option>
                    <option value="BKASH">bKash (Personal)</option>
                    <option value="NAGAD">Nagad (Personal)</option>
                    <option value="ROCKET">Rocket</option>
                  </select>
                </div>

                {refundMethod !== "WALLET" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {isBn ? "পেআউট অ্যাকাউন্ট নম্বর:" : "Payout Account Number:"}
                    </label>
                    <input
                      type="text"
                      required
                      value={refundPayoutAccount}
                      onChange={(e) => setRefundPayoutAccount(e.target.value)}
                      placeholder="e.g. 017XXXXXXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {isBn ? "সমস্যার কারণ:" : "Reason for Refund:"}
                  </label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                  >
                    <option value="LOGIN_FAILED">Login Failed / Invalid</option>
                    <option value="PRODUCT_DEFECT">Product Defect / Not Working</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="DELIVERY_DELAY">Delivery Delayed</option>
                    <option value="WRONG_PURCHASE">Wrong Item Purchased</option>
                    <option value="OTHER">Other Reason</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {isBn ? "বিবরণ:" : "Describe the Issue:"}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={refundDesc}
                    onChange={(e) => setRefundDesc(e.target.value)}
                    placeholder="Provide details about why you need a refund..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="w-full py-3 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingRefund ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isBn ? "রিফান্ড আবেদন জমা দিন" : "Submit Refund Request"}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
