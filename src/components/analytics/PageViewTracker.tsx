"use client";

// ─── AI Haat Analytics — SPA Page View Tracker ──────────────────
// Fires page_view on Next.js App Router navigation changes.
// Debounces to prevent double-fire from React Strict Mode.
// Sanitizes URLs to prevent sensitive query param leakage.
// Skips /admin and /dashboard routes.

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics/client";
import { sanitizeUrl } from "@/lib/analytics/sanitize";

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Skip admin and dashboard routes — not part of commerce funnel
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
      return;
    }

    const fullUrl = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    const cleanUrl = sanitizeUrl(fullUrl);

    // Deduplicate: don't fire for same URL
    if (cleanUrl === lastTrackedRef.current) return;

    // Debounce 100ms to handle React Strict Mode double-mount
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      lastTrackedRef.current = cleanUrl;
      trackPageView(cleanUrl);
    }, 100);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname, searchParams]);

  return null; // This component renders nothing
}
