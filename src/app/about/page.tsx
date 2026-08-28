import React from "react";
import type { Metadata } from "next";
import { AboutClient } from "@/components/about/AboutClient";
import { SITE_URL, safeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us — Bangladesh's Trusted Digital Marketplace | AI Haat",
  description:
    "Learn about AI Haat's mission, authentic digital product sourcing, fast automated delivery, and 24/7 customer support in Bangladesh.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About AI Haat — Premium Digital Products Marketplace",
    description: "Bangladesh's leading platform for AI subscriptions, software licenses & digital tools.",
    url: `${SITE_URL}/about`,
    siteName: "AI Haat",
    type: "website",
  },
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About AI Haat",
    url: `${SITE_URL}/about`,
    description: "Learn about AI Haat's mission, authentic digital products, fast automated delivery, and support.",
    publisher: {
      "@type": "Organization",
      name: "AI Haat",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(aboutSchema),
        }}
      />
      <AboutClient />
    </>
  );
}
