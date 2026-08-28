import React from "react";
import type { Metadata } from "next";
import { ProofsClient } from "@/components/proofs/ProofsClient";
import { SITE_URL, safeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Verified Customer Delivery Proofs & Reviews | AI Haat",
  description:
    "Explore 100% verified customer delivery proofs, transaction screenshots, and real reviews for AI subscriptions, software licenses & digital accounts in Bangladesh.",
  alternates: {
    canonical: `${SITE_URL}/proofs`,
  },
  openGraph: {
    title: "Customer Delivery Proofs & Reviews | AI Haat",
    description: "Verified customer delivery proofs and real reviews of AI subscriptions and software licenses in Bangladesh.",
    url: `${SITE_URL}/proofs`,
    siteName: "AI Haat",
    type: "website",
  },
};

export default function ProofsPage() {
  const proofsSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Haat Delivery Proofs and Customer Reviews",
    url: `${SITE_URL}/proofs`,
    description: "Verified customer delivery proofs and real reviews for AI Haat digital products.",
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
          __html: safeJsonLd(proofsSchema),
        }}
      />
      <ProofsClient />
    </>
  );
}
