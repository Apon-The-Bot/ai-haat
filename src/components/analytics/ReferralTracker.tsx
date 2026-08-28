"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";

export default function ReferralTracker() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (!searchParams) return;

    const ref = searchParams.get("ref");
    const aff = searchParams.get("aff");
    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");

    let referralCode = ref || aff;
    if (!referralCode && utmSource?.startsWith("aff_")) {
      referralCode = utmSource.substring(4);
    }

    if (referralCode) {
      // Set cookie (30 days)
      const date = new Date();
      date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
      document.cookie = `aihaat_ref=${referralCode};expires=${date.toUTCString()};path=/;SameSite=Lax`;

      // Fire and forget click tracking
      fetch("/api/affiliate/click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referralCode,
          landingPage: pathname,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      }).catch((err) => console.error("Failed to track referral click", err));
    }
  }, [searchParams, pathname]);

  return null;
}
