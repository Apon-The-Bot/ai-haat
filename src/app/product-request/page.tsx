import React from "react";
import type { Metadata } from "next";
import { ProductRequestClient } from "@/components/product-request/ProductRequestClient";
import { SITE_URL, safeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Request Custom Software or AI Subscription | AI Haat",
  description:
    "Cannot find what you need? Submit a custom software or AI tool pre-order request on AI Haat. Fastest delivery at the best price in Bangladesh.",
  alternates: {
    canonical: `${SITE_URL}/product-request`,
  },
  openGraph: {
    title: "Request Custom Software & AI Tools | AI Haat",
    description: "Submit custom software and subscription requests for instant sourcing in Bangladesh.",
    url: `${SITE_URL}/product-request`,
    siteName: "AI Haat",
    type: "website",
  },
};

export default function ProductRequestPage() {
  const requestSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Haat Custom Product & Pre-Order Request Hub",
    url: `${SITE_URL}/product-request`,
    description: "Request custom digital products, software tools, or subscriptions in Bangladesh.",
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
          __html: safeJsonLd(requestSchema),
        }}
      />
      <ProductRequestClient />
    </>
  );
}
