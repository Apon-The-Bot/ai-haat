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
  title: "AI Haat — Bangladesh's #1 Digital Products & Software Marketplace",
  description:
    "Buy genuine AI subscriptions (ChatGPT Plus, Claude Pro, Midjourney), VPNs, Windows 11 retail keys, Office 365 & developer subscriptions with instant bKash, Nagad delivery in BDT.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "AI Haat — Premium Digital Products & Software Marketplace in Bangladesh",
    description:
      "Instant delivery of verified AI subscriptions, Windows license keys, VPNs, and OTT accounts in BDT with local payment.",
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

