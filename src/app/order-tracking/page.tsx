import React from "react";
import type { Metadata } from "next";
import { OrderTrackingClient } from "@/components/order-tracking/OrderTrackingClient";
import { SITE_URL, safeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Track Order & Real-Time Delivery Status | AI Haat",
  description:
    "Track your AI Haat order delivery in real time using your Order ID or phone number. Instant digital fulfillment updates.",
  alternates: {
    canonical: `${SITE_URL}/order-tracking`,
  },
  openGraph: {
    title: "Order Tracking & Delivery Status | AI Haat",
    description: "Track your AI Haat order delivery in real time using your Order ID or phone number.",
    url: `${SITE_URL}/order-tracking`,
    siteName: "AI Haat",
    type: "website",
  },
};

export default function OrderTrackingPage() {
  const trackingSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Haat Order Tracking & Delivery Status",
    url: `${SITE_URL}/order-tracking`,
    description: "Real-time delivery status and tracking for AI Haat orders.",
    isPartOf: {
      "@type": "WebSite",
      name: "AI Haat",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(trackingSchema),
        }}
      />
      <OrderTrackingClient />
    </>
  );
}
