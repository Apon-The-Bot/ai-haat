import { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products-db";
import { PRODUCTS, CATEGORIES } from "@/data/products";
import { BLOGS } from "@/data/blogs";
import { prisma } from "@/lib/prisma";

import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const now = new Date();

  // 1. Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/proofs`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/product-request`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/order-tracking`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // 2. Category Filter Pages
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.filter((c) => c !== "All").map((cat) => ({
    url: `${baseUrl}/shop?category=${encodeURIComponent(cat)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  // 3. Dynamic Products
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const dbProducts = await getAllProducts();
    const productsList = dbProducts && dbProducts.length > 0 ? dbProducts : PRODUCTS;

    const seenSlugs = new Set<string>();
    productRoutes = productsList
      .filter((p) => {
        if (!p.slug || seenSlugs.has(p.slug)) return false;
        seenSlugs.add(p.slug);
        return p.inStock !== false;
      })
      .map((p) => ({
        url: `${baseUrl}/product/${encodeURIComponent(p.slug)}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: p.isFeatured || p.isBestProduct || p.isBestSelling ? 0.9 : 0.8,
      }));
  } catch (err) {
    console.warn("[Sitemap Product Fetch Error, fallback to static PRODUCTS]:", err);
    productRoutes = PRODUCTS.map((p) => ({
      url: `${baseUrl}/product/${encodeURIComponent(p.slug)}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: p.isFeatured || p.isBestProduct ? 0.9 : 0.8,
    }));
  }

  // 4. Dynamic Blogs
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const dbBlogs = await prisma.blog.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    if (dbBlogs && dbBlogs.length > 0) {
      const seenBlogSlugs = new Set<string>();
      blogRoutes = dbBlogs
        .filter((b) => {
          if (!b.slug || seenBlogSlugs.has(b.slug)) return false;
          seenBlogSlugs.add(b.slug);
          return true;
        })
        .map((b) => ({
          url: `${baseUrl}/blog/${encodeURIComponent(b.slug)}`,
          lastModified: b.updatedAt || b.createdAt || now,
          changeFrequency: "weekly",
          priority: 0.7,
        }));
    } else {
      blogRoutes = BLOGS.map((b) => ({
        url: `${baseUrl}/blog/${encodeURIComponent(b.slug)}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (err) {
    console.warn("[Sitemap Blog Fetch Error, fallback to static BLOGS]:", err);
    blogRoutes = BLOGS.map((b) => ({
      url: `${baseUrl}/blog/${encodeURIComponent(b.slug)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}
