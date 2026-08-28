import React from "react";
import type { Metadata } from "next";
import { BlogListClient } from "@/components/blog/BlogListClient";
import { SITE_URL, safeJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tech Blog, Software Guides & AI Tutorials | AI Haat",
  description:
    "Explore in-depth tutorials, comparisons, and activation guides for AI subscriptions, Windows software, VPNs & developer tools in Bangladesh.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "AI Haat Tech Blog & Guides",
    description:
      "Articles, tutorials & tips on AI tools, software subscriptions & developer productivity in Bangladesh.",
    url: `${SITE_URL}/blog`,
    siteName: "AI Haat",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Haat Blog",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Haat Tech Blog | Software & AI Guides",
    description:
      "Tutorials and guides for digital software, VPNs & AI subscriptions in Bangladesh.",
    images: ["/images/og-image.png"],
    creator: "@aihaat_bd",
  },
};

export default function BlogPage() {
  const blogListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "AI Haat Tech Blog",
    url: `${SITE_URL}/blog`,
    description:
      "Tech guides, software activation tutorials, and AI tool comparisons in Bangladesh.",
    publisher: {
      "@type": "Organization",
      name: "AI Haat",
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
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
          name: "Blog",
          item: `${SITE_URL}/blog`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(blogListSchema),
        }}
      />
      <BlogListClient />
    </>
  );
}
