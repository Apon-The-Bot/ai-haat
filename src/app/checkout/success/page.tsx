"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  XCircle,
  KeyRound,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Mail,
  Copy,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import PurchaseTracker from "@/components/analytics/PurchaseTracker";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId") || "AH-XXXXX";
  const status = (searchParams?.get("status") || "completed").toLowerCase();
  const trxId = searchParams?.get("trxId") || "";
  const { language } = useLanguage();
  const { showToast } = useToast();
  const isBn = language === "bn";

  const isCompleted = status === "completed" || status === "success";
  const isPending = status === "pending";

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    showToast(isBn ? "অর্ডার আইডি কপি করা হয়েছে!" : "Order ID copied!", "success");
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 bg-gray-50/70">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-[#E8E8EE] shadow-sm p-6 sm:p-10 text-center space-y-6">
        
        {/* Status Icon */}
        <div
          className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-xs ${
            isCompleted
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : isPending
              ? "bg-amber-50 text-amber-600 border border-amber-100"
              : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          ) : isPending ? (
            <Clock className="w-10 h-10 stroke-[2.2]" />
          ) : (
            <XCircle className="w-10 h-10 stroke-[2.2]" />
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D26] tracking-tight">
            {isCompleted
              ? isBn
                ? "পেমেন্ট সফল হয়েছে!"
                : "Payment Successful!"
              : isPending
              ? isBn
                ? "পেমেন্ট প্রসেসিংয়ে আছে"
                : "Payment is Processing"
              : isBn
              ? "পেমেন্ট ব্যর্থ হয়েছে"
              : "Payment Failed"}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A8190] leading-relaxed max-w-md mx-auto">
            {isCompleted
              ? isBn
                ? "আপনার অর্ডারটি গ্রহণ করা হয়েছে। ৫-১৫ মিনিটের মধ্যে আপনার ডিজিটাল ভল্ট এবং ইমেইলে প্রোডাক্ট ডেলিভারি করা হবে।"
                : "Thank you for your order! Your digital credentials and keys will be delivered to your Digital Vault and email within 5-15 minutes."
              : isBn
              ? "আপনার ট্রানজেকশনটি যাচাই করা হচ্ছে। শীঘ্রই স্ট্যাটাস আপডেট পাবেন।"
              : "We are verifying your transaction. You will receive an update shortly."}
          </p>
        </div>

        {/* Order Details Card */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#7A8190] font-semibold">
              {isBn ? "অর্ডার আইডি:" : "Order ID:"}
            </span>
            <div className="flex items-center gap-1.5 font-mono font-black text-[#1A1D26] bg-white px-2.5 py-1 rounded-lg border border-gray-200">
              <span>{orderId}</span>
              <button
                type="button"
                onClick={copyOrderId}
                className="hover:text-[#FC5C03] transition-colors cursor-pointer"
                title="Copy Order ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {trxId && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-[#7A8190] font-semibold">
                {isBn ? "ট্রানজেকশন রেফারেন্স:" : "Transaction Ref:"}
              </span>
              <span className="font-mono text-[11px] font-bold text-gray-700">
                {trxId}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-[#7A8190] font-semibold">
              {isBn ? "ডেলিভারি মাধ্যম:" : "Delivery:"}
            </span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{isBn ? "ইমেইল ও ডিজিটাল ভল্ট" : "Email & Vault"}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard/keys"
            className="w-full sm:w-auto px-6 py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isBn ? "ডিজিটাল ভল্ট দেখুন" : "View Digital Vault"}</span>
          </Link>

          <Link
            href={`/order-tracking?orderId=${encodeURIComponent(orderId)}`}
            className="w-full sm:w-auto px-6 py-3 bg-white text-[#1A1D26] hover:text-[#FC5C03] border border-[#E8E8EE] hover:border-[#FC5C03]/40 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>{isBn ? "অর্ডার ট্র্যাকিং" : "Track Order"}</span>
          </Link>
        </div>

        {/* WhatsApp Fast Support & Back to store */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <a
            href={`https://wa.me/8801712345678?text=${encodeURIComponent(
              `Hello AI Haat Support! I have a question regarding my Order ID: ${orderId}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold"
          >
            <span>💬 সহায়তার জন্য হোয়াটসঅ্যাপ</span>
          </a>

          <Link
            href="/shop"
            className="text-[#7A8190] hover:text-[#FC5C03] font-semibold inline-flex items-center gap-1 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isBn ? "আরো কেনাকাটা করুন" : "Continue Shopping"}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <PurchaseTracker orderId={orderId} status={status} />
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/70">
          <div className="w-8 h-8 border-3 border-[#FC5C03] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
