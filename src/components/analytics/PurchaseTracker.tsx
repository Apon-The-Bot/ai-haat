"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/analytics/client";
import { sanitizeItem } from "@/lib/analytics/sanitize";
import { useAnalytics } from "./AnalyticsProvider";

interface OrderAnalytics {
  orderNumber: string;
  totalBDT: number;
  paymentStatus: string;
  eventId: string;
  items: Array<{ productId?: string; variationId?: string; productName: string; variationName: string; priceBDT: number; quantity: number }>;
}

export default function PurchaseTracker({ orderId, status }: { orderId: string; status: string }) {
  const { isEnabled, metaReady } = useAnalytics();
  useEffect(() => {
    if (!isEnabled || !orderId || status !== "completed") return;
    const abort = new AbortController();
    async function send() {
      try {
        const response = await fetch(`/api/orders/analytics?orderId=${encodeURIComponent(orderId)}`, { signal: abort.signal, cache: "no-store" });
        if (!response.ok) return;
        const { order, meta } = await response.json() as {
          order: OrderAnalytics; meta?: { pixelId: string; data: object };
        };
        if (abort.signal.aborted || order.paymentStatus !== "VERIFIED") return;
        const key = `aihaat_purchase_${order.eventId}`;
        if (sessionStorage.getItem(key) === "meta") return;
        const sent = trackPurchase({
          transaction_id: order.orderNumber, value: order.totalBDT, currency: "BDT", event_id: order.eventId,
          shipping: 0, tax: 0,
          items: order.items.map((item) => sanitizeItem({
            ...item, id: item.productId, variant: item.variationName, price: item.priceBDT,
          })),
        }, metaReady ? meta : undefined, !sessionStorage.getItem(key));
        sessionStorage.setItem(key, sent ? "meta" : "seen");
      } catch {
        // Optional advertising and analytics never affect checkout.
      }
    }
    void send();
    return () => abort.abort();
  }, [isEnabled, metaReady, orderId, status]);
  return null;
}
