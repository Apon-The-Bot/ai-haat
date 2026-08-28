import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_URL;

  const disallowRoutes = [
    "/admin",
    "/admin/",
    "/admin/*",
    "/dashboard",
    "/dashboard/",
    "/dashboard/*",
    "/api/",
    "/api/*",
    "/auth/",
    "/auth/*",
    "/checkout",
    "/checkout/",
    "/checkout/*",
    "/cart",
    "/cart/",
    "/cart/*",
    "/unsubscribe",
    "/unsubscribe/",
    "/unsubscribe/*",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/product/*",
          "/blog",
          "/blog/*",
          "/proofs",
          "/product-request",
          "/order-tracking",
          "/about",
          "/privacy",
          "/terms",
        ],
        disallow: disallowRoutes,
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/shop",
          "/product/*",
          "/blog",
          "/blog/*",
          "/proofs",
          "/product-request",
          "/order-tracking",
          "/about",
          "/privacy",
          "/terms",
        ],
        disallow: disallowRoutes,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
