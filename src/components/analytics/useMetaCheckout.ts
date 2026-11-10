"use client";

import { useEffect, useRef } from "react";
import { canTrackMeta, isMetaBrowserUrl, trackMeta } from "@/lib/analytics/meta-browser";
import { useAnalytics } from "./AnalyticsProvider";

export function useMetaCheckout(active: boolean, items: Array<{
  productId: string; variationId?: string | null; quantity: number;
}>, coupon?: string) {
  const { metaReady } = useAnalytics();
  const sent = useRef(false);
  const request = JSON.stringify({ items, coupon });
  const hasItems = items.length > 0;
  useEffect(() => {
    if (!active) {
      sent.current = false;
      return;
    }
    if (!metaReady || !hasItems || sent.current || !canTrackMeta("InitiateCheckout") ||
      !isMetaBrowserUrl(new URL(window.location.href))) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/analytics/checkout", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: request, signal: controller.signal,
        });
        if (!response.ok) return;
        const { data } = await response.json();
        if (!controller.signal.aborted) sent.current = trackMeta("InitiateCheckout", data);
      } catch {
        // Checkout remains available if an analytics quote fails.
      }
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [active, hasItems, metaReady, request]);
}
