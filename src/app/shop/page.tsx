import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";
import { SITE_URL, safeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shop Digital Products, AI Tools & Software Subscriptions | AI Haat",
  description:
    "Browse our full catalog of premium AI tools, software subscriptions, Windows 11 keys, VPNs & digital accounts at affordable BDT prices with instant delivery in Bangladesh.",
  alternates: {
    canonical: `${SITE_URL}/shop`,
  },
  openGraph: {
    title: "Shop Digital Products & AI Tools in Bangladesh | AI Haat",
    description:
      "Browse AI subscriptions, software licenses, and digital accounts with instant automated delivery in BDT.",
    url: `${SITE_URL}/shop`,
    siteName: "AI Haat",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Haat Shop Catalog",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Digital Products & Software | AI Haat BD",
    description:
      "Explore AI tools, Windows keys, VPNs & developer subscriptions in Bangladesh.",
    images: ["/images/og-image.png"],
    creator: "@aihaat_bd",
  },
};

export default function ShopPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI Haat Digital Products Catalog",
    url: `${SITE_URL}/shop`,
    description:
      "Explore genuine AI tools, Windows keys, VPNs & developer subscriptions in Bangladesh.",
    isPartOf: {
      "@type": "WebSite",
      name: "AI Haat",
      url: SITE_URL,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: `${SITE_URL}/shop`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(collectionSchema),
        }}
      />
      <Suspense
        fallback={
          <div className="py-24 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#FC5C03] border-t-transparent rounded-full animate-spin" />
            <span>প্রোডাক্ট লোড হচ্ছে...</span>
          </div>
        }
      >
        <ShopClient />
      </Suspense>
    </>
  );
}
