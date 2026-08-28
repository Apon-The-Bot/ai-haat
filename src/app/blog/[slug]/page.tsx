import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { BLOGS } from "@/data/blogs";
import { SafeImage } from "@/components/SafeImage";
import {
  BookOpen,
  Clock,
  Calendar,
  ArrowLeft,
  Share2,
  Check,
  ShoppingBag,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import { SITE_URL, safeJsonLd } from "@/lib/seo";
import { renderSafeMarkdownInline } from "@/components/blog/safe-markdown";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return BLOGS.map((blog) => ({
    slug: blog.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = BLOGS.find((b) => b.slug === params.slug);
  if (!blog) {
    return {
      title: "Blog Not Found | AI Haat",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `${SITE_URL}/blog/${blog.slug}`;
  const imageUrl = blog.image?.startsWith("http")
    ? blog.image
    : `${SITE_URL}${blog.image.startsWith("/") ? "" : "/"}${blog.image}`;

  return {
    title: `${blog.title} — AI Haat Blog`,
    description: blog.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      url: canonicalUrl,
      siteName: "AI Haat",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      type: "article",
      publishedTime: "2026-08-01T08:00:00+06:00",
      modifiedTime: "2026-08-28T08:00:00+06:00",
      authors: ["AI Haat Editorial Team"],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: [imageUrl],
      creator: "@aihaat_bd",
    },
  };
}

export default function BlogDetailPage({ params }: Props) {
  const blog = BLOGS.find((b) => b.slug === params.slug);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = BLOGS.filter((b) => b.slug !== blog.slug).slice(0, 2);
  const canonicalUrl = `${SITE_URL}/blog/${blog.slug}`;
  const imageUrl = blog.image?.startsWith("http")
    ? blog.image
    : `${SITE_URL}${blog.image.startsWith("/") ? "" : "/"}${blog.image}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    image: [imageUrl],
    datePublished: "2026-08-01T08:00:00+06:00",
    dateModified: "2026-08-28T08:00:00+06:00",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    author: {
      "@type": "Organization",
      name: "AI Haat Editorial Team",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "AI Haat",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    description: blog.excerpt,
  };

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
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="w-full bg-white py-8 sm:py-14 min-h-screen">
      {/* Schema.org Structured Data with Safe Serializer */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbsJsonLd) }}
      />

      <div className="max-w-4xl w-[calc(100%-24px)] md:w-[calc(100%-40px)] mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#FC5C03] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল ব্লগ আর্টিকেলে ফিরে যান</span>
        </Link>

        {/* Header Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider">
              {blog.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{blog.readTime}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{blog.date}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
            {blog.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            {blog.excerpt}
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
          <SafeImage
            src={blog.image}
            alt={blog.title}
            aspectRatio="16/9"
            objectFit="cover"
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-6 pt-2">
          {blog.content.split("\n\n").map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (trimmed.startsWith("# ")) {
              return null; // Skip main title as it is in header
            }
            if (trimmed.startsWith("## ")) {
              return (
                <h2 key={index} className="text-xl sm:text-2xl font-black text-slate-900 pt-4 border-b border-slate-100 pb-2">
                  {trimmed.replace("## ", "")}
                </h2>
              );
            }
            if (trimmed.startsWith("### ")) {
              return (
                <h3 key={index} className="text-lg font-bold text-slate-900 pt-2">
                  {trimmed.replace("### ", "")}
                </h3>
              );
            }
            if (trimmed.startsWith("- ")) {
              const listItems = trimmed.split("\n").map((l) => l.replace(/^[-\d.]+\s*/, ""));
              return (
                <ul key={index} className="list-disc pl-5 space-y-2 text-sm sm:text-base">
                  {listItems.map((li, idx) => (
                    <li key={idx}>
                      {renderSafeMarkdownInline(li)}
                    </li>
                  ))}
                </ul>
              );
            }
            if (trimmed === "---") {
              return <hr key={index} className="my-6 border-slate-200" />;
            }
            return (
              <p key={index} className="text-sm sm:text-base leading-relaxed text-slate-700">
                {renderSafeMarkdownInline(trimmed)}
              </p>
            );
          })}
        </div>

        {/* Call to Action Card */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-[#1A1D26] to-[#0F172A] rounded-3xl text-white space-y-4 shadow-xl border border-slate-800">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FC5C03]/20 border border-[#FC5C03]/40 rounded-full text-[#FC5C03] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Haat Official Store</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            প্রিমিয়াম এআই ও সফটওয়্যার সাবস্ক্রিপশন কিনতে চান?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            ChatGPT Plus, Claude Pro, Midjourney, Windows 11 Pro Retail Key এবং VPN সহ যেকোনো ডিজিটাল সেবা সরাসরি বিকাশ বা নগদ পেমেন্টে মুহূর্তের মধ্যে গ্রহণ করুন।
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="px-6 py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>প্রোডাক্ট ক্যাটালগ দেখুন</span>
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-slate-200">
            <h3 className="text-lg font-black text-slate-900">অন্যান্য সম্পর্কিত আর্টিকেল</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedBlogs.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="p-4 bg-slate-50 hover:bg-[#FFF2E8]/40 border border-slate-200 hover:border-[#FC5C03]/30 rounded-2xl transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#FC5C03] uppercase tracking-wider block">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#FC5C03] transition-colors leading-snug">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="pt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>{rel.readTime}</span>
                    <ChevronRight className="w-4 h-4 text-[#FC5C03] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
