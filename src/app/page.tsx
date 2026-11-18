import React from "react";
import type { Metadata } from "next";
import { HomePageClient } from "@/components/home/HomePageClient";
import {
  SITE_URL,
  safeJsonLd,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Haat — AI Tools, Software & Digital Products in Bangladesh",
  description:
    "Find AI tools, software subscriptions, VPNs and digital products for work, learning and creating in Bangladesh. Pay in BDT and access your order from your account.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
        title: "AI Haat — Find Your Next Digital Upgrade",
        description:
          "AI tools, software subscriptions and digital products for Bangladesh-based creators, students, developers and teams.",
    url: SITE_URL,
    siteName: "AI Haat",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Haat Marketplace Bangladesh",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Haat — Premium Digital Products & Software Marketplace",
    description:
      "Buy ChatGPT Plus, Claude, Midjourney, Windows keys & developer tools in Bangladesh with instant delivery in BDT.",
    images: ["/images/og-image.png"],
    creator: "@aihaat_bd",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Schema.org Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(ORGANIZATION_SCHEMA),
        }}
      />

      {/* Schema.org WebSite Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(WEBSITE_SCHEMA),
        }}
      />

      {/* Main Interactive Homepage */}
      <HomePageClient />
    </>
  );
}

