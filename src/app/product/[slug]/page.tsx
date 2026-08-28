import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getAllProducts } from "@/lib/products-db";
import { PRODUCTS } from "@/data/products";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { SITE_URL, safeJsonLd } from "@/lib/seo";

interface ProductPageProps {
  params: { slug: string };
}

export const dynamic = "force-dynamic";
export const revalidate = 1800; // 30 minutes

export async function generateStaticParams() {
  try {
    const products = await getAllProducts();
    const list = products && products.length > 0 ? products : PRODUCTS;
    return list.map((product) => ({
      slug: product.slug,
    }));
  } catch {
    return PRODUCTS.map((product) => ({
      slug: product.slug,
    }));
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Product Not Found | AI Haat",
      description: "The requested digital product or software subscription was not found on AI Haat.",
      robots: { index: false, follow: false },
    };
  }

  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `${SITE_URL}${product.image?.startsWith("/") ? "" : "/"}${product.image || "images/logo.png"}`;

  const cleanDescription =
    product.shortDesc ||
    product.descriptionBangla?.slice(0, 160) ||
    `${product.name} — Instant digital delivery in Bangladesh with bKash and Nagad payment.`;

  const canonicalUrl = `${SITE_URL}/product/${encodeURIComponent(product.slug)}`;

  return {
    title: `${product.name} — Buy in Bangladesh (BDT) | AI Haat`,
    description: cleanDescription,
    keywords: [
      product.name,
      `${product.name} Bangladesh`,
      `${product.name} BD price`,
      `${product.name} bKash`,
      `${product.name} Nagad`,
      `${product.category} Bangladesh`,
      "AI Subscriptions Bangladesh",
      "Digital Products BD",
      "AI Haat",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.name} — Buy Online in Bangladesh | AI Haat`,
      description: cleanDescription,
      url: canonicalUrl,
      siteName: "AI Haat",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: "website",
      locale: "bn_BD",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | AI Haat BD`,
      description: cleanDescription,
      images: [imageUrl],
      creator: "@aihaat_bd",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `${SITE_URL}${product.image?.startsWith("/") ? "" : "/"}${product.image || "images/logo.png"}`;

  const canonicalUrl = `${SITE_URL}/product/${encodeURIComponent(product.slug)}`;
  const inStock = product.inStock !== false;

  // 1. FACTUAL PRODUCT JSON-LD SCHEMA
  const hasRealRating = typeof product.rating === "number" && product.rating > 0 && typeof product.ratingCount === "number" && product.ratingCount > 0;
  const hasRealReviews = Array.isArray(product.reviews) && product.reviews.length > 0;

  const productJsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [imageUrl],
    description: product.shortDesc || product.descriptionBangla || product.name,
    sku: product.id,
    mpn: product.slug,
    brand: {
      "@type": "Brand",
      name: "AI Haat",
    },
    category: product.category,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "BDT",
      lowPrice: product.minPriceBDT || 99,
      highPrice: product.maxPriceBDT || product.minPriceBDT || 99,
      offerCount: product.variations?.length || 1,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "AI Haat",
        url: SITE_URL,
      },
    },
  };

  // Only emit aggregateRating if genuine reviews/ratings exist
  if (hasRealRating) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Only emit reviews if genuine review records exist
  if (hasRealReviews) {
    productJsonLd.review = product.reviews!.slice(0, 5).map((rev) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: rev.author,
      },
      datePublished: rev.date || "2026-08-01",
      reviewBody: rev.comment,
      reviewRating: {
        "@type": "Rating",
        ratingValue: rev.rating,
        bestRating: 5,
        worstRating: 1,
      },
    }));
  }

  // 2. BREADCRUMBLIST JSON-LD SCHEMA
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
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
        name: product.category,
        item: `${SITE_URL}/shop?category=${encodeURIComponent(product.category)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: canonicalUrl,
      },
    ],
  };

  // 3. FACTUAL FAQPAGE JSON-LD SCHEMA
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${product.name} কেনার পর ডেলিভারি পেতে কতক্ষণ সময় লাগে?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `পেমেন্ট সম্পন্ন করার মাত্র ৫ থেকে ১৫ মিনিটের মধ্যে আপনার ইমেইল ও ড্যাশবোর্ড ভল্টে ${product.name} এর অফিসিয়াল লগইন বা অ্যাক্টিভেশন তথ্য পৌঁছে দেওয়া হয়।`,
        },
      },
      {
        "@type": "Question",
        name: `${product.name} এর সাথে কী কী ওয়ারেন্টি দেওয়া হয়?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `সম্পূর্ণ মেয়াদ জুড়ে ১০০% রিপ্লেসমেন্ট ওয়ারেন্টি দেওয়া হয় (${product.info?.warranty || "ফুল মেয়াদ রিপ্লেসমেন্ট গ্যারান্টি"})।`,
        },
      },
      {
        "@type": "Question",
        name: "বিকাশ ও নগদ দিয়ে কীভাবে পেমেন্ট করবো?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI Haat চেকআউট পেজে গিয়ে বিকাশ (bKash), নগদ (Nagad), বা রকেট (Rocket) সিলেক্ট করে সরাসরি বাংলাদেশি টাকায় তাৎক্ষণিক পেমেন্ট সম্পন্ন করতে পারবেন।",
        },
      },
      {
        "@type": "Question",
        name: `${product.name} কোন কোন ডিভাইসে ব্যবহার করা যাবে?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${product.info?.deviceSupport || "Windows, Mac, Android, iOS ও Web ব্রাউজার"}-এ সরাসরি ব্যবহার করা যাবে।`,
        },
      },
    ],
  };

  return (
    <>
      {/* Schema.org Structured Data Injection using Safe Serializer */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />

      {/* Interactive Client Component */}
      <ProductDetailClient product={product} />
    </>
  );
}
