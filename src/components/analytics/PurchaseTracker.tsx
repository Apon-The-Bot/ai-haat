"use client";

// ─── AI Haat Analytics — Purchase Event Tracker ──────────────────
// Fires client-side Purchase event ONLY after verifying order is VERIFIED in DB.
// Deduplication: sessionStorage prevents re-fire on page refresh.
// Stable event_id matches CAPI for Meta deduplication.
// NEVER fires Purchase from URL params alone.

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/analytics/client";
import { sanitizeItem } from "@/lib/analytics/sanitize";
import type { PurchaseEventData, AnalyticsItem } from "@/lib/analytics/types";

interface PurchaseTrackerProps {
  orderId: string;
  status: string;
}

interface AnalyticsOrderData {
  orderNumber: string;
  totalBDT: number;
  discountBDT: number;
  paymentStatus: string;
  paymentMethod: string;
  couponCode?: string;
  items: Array<{
    productId?: string;
    productName: string;
    variationName: string;
    priceBDT: number;
    quantity: number;
    category?: string;
  }>;
}

export default function PurchaseTracker({ orderId, status }: PurchaseTrackerProps) {
  const hasFiredRef = useRef(false);

  useEffect(() => {
    // Guard: Only attempt for completed/success status
    if (status !== "completed" && status !== "success") return;
    if (!orderId || orderId === "AH-XXXXX") return;
    if (hasFiredRef.current) return;

    // SessionStorage dedup — survives within tab session
    const dedupKey = `analytics_purchase_sent_${orderId}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(dedupKey)) {
      return;
    }

    hasFiredRef.current = true;

    // Fetch server-verified order data (NOT trusting URL params for value/items)
    fetchVerifiedOrder(orderId)
      .then((data) => {
        if (!data) return;

        // CRITICAL: Only fire if server confirms VERIFIED payment
        if (data.paymentStatus !== "VERIFIED") {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[Analytics] Purchase blocked — order "${orderId}" status is "${data.paymentStatus}", not VERIFIED`);
          }
          return;
        }

        // Build purchase event with server-authoritative data
        const items: AnalyticsItem[] = data.items.map((item, index) =>
          sanitizeItem({
            id: item.productId || "unknown",
            name: item.productName,
            variant: item.variationName,
            price: item.priceBDT,
            quantity: item.quantity,
            category: item.category,
            index,
          })
        );

        const purchaseData: PurchaseEventData = {
          transaction_id: data.orderNumber,
          value: data.totalBDT,
          currency: "BDT",
          items,
          coupon: data.couponCode || undefined,
          shipping: 0,
          tax: 0,
          event_id: `purchase_${data.orderNumber}`,
        };

        trackPurchase(purchaseData);

        // Mark as sent in sessionStorage
        try {
          sessionStorage.setItem(dedupKey, "1");
        } catch {
          // sessionStorage may be unavailable (private browsing)
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[Analytics] Purchase tracking fetch error:", err);
        }
      });
  }, [orderId, status]);

  return null; // Renders nothing
}

/**
 * Fetch analytics-safe order data from server.
 * Returns null if order not found or not verified.
 */
async function fetchVerifiedOrder(orderId: string): Promise<AnalyticsOrderData | null> {
  try {
    const res = await fetch(
      `/api/orders/analytics?orderId=${encodeURIComponent(orderId)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.order || null;
  } catch {
    return null;
  }
}
