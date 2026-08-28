import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Secure Checkout | AI Haat",
  description: "Instant express checkout for AI subscriptions and software licenses via bKash, Nagad & Rocket in BDT.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-[#FC5C03] border-t-transparent rounded-full animate-spin" />
          <span>চেকআউট পেজ লোড হচ্ছে...</span>
        </div>
      }
    >
      <CheckoutPageClient />
    </Suspense>
  );
}
