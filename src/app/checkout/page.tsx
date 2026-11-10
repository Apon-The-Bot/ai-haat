import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout/CheckoutPageClient";
import { requireAuth } from "@/lib/auth-guard";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Secure Checkout | AI Haat",
  description: "Instant express checkout for AI subscriptions and software licenses via bKash, Nagad & Rocket in BDT.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) {
    if (auth.status !== 401) redirect("/dashboard");
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(await searchParams)) {
      if (typeof value === "string") query.set(key, value);
      else value?.forEach((entry) => query.append(key, entry));
    }
    const callback = query.size ? `/checkout?${query}` : "/checkout";
    redirect(`/login?callbackUrl=${encodeURIComponent(callback)}`);
  }
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
