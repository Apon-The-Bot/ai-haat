import React, { Suspense } from "react";
import type { Metadata } from "next";
import { UnsubscribeClient } from "@/components/unsubscribe/UnsubscribeClient";

export const metadata: Metadata = {
  title: "Email Preferences & Unsubscribe | AI Haat",
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-[#FC5C03] border-t-transparent rounded-full animate-spin" />
          <span>লোড হচ্ছে...</span>
        </div>
      }
    >
      <UnsubscribeClient />
    </Suspense>
  );
}
