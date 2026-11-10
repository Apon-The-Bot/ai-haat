"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { trackMeta } from "@/lib/analytics/meta-browser";
import { useAnalytics } from "./AnalyticsProvider";

export default function RegistrationTracker() {
  const { data } = useSession();
  const pathname = usePathname();
  const { metaReady } = useAnalytics();
  const registrationAt = (data?.user as { registrationAt?: number } | undefined)?.registrationAt;
  useEffect(() => {
    if (!metaReady || !registrationAt || Date.now() - registrationAt > 10 * 60_000) return;
    try {
      const key = `meta_registration_${registrationAt}`;
      if (!sessionStorage.getItem(key) && trackMeta("CompleteRegistration")) sessionStorage.setItem(key, "1");
    } catch {
      // Registration still succeeds when storage is unavailable.
    }
  }, [metaReady, pathname, registrationAt]);
  return null;
}
