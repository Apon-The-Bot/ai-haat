# 13 — TECHNICAL SEO & WEB DISCOVERABILITY AUDIT

This report audits crawlability, indexability, metadata completeness, Open Graph configurations, structured data, and Core Web Vitals across the public e-commerce storefront.

---

## 1. Technical SEO Inventory & Health Check

| SEO Element | Status | Implementation Details |
| :--- | :---: | :--- |
| **Robots.txt** | 🟢 Good | `src/app/robots.ts` cleanly disallows `/admin/**`, `/dashboard/**`, `/api/**`, `/checkout/**`, `/cart/**`. |
| **XML Sitemap** | 🟡 Acceptable | `src/app/sitemap.ts` dynamically indexes shop, products, categories, blogs; misses `/compare`, `/gift-cards`, `/wallet`. |
| **Metadata & Open Graph** | 🟢 Good | `src/lib/seo.ts` generates dynamic metadata with Bangla keywords, OG images, and canonical URLs. |
| **Structured Data (JSON-LD)**| 🟢 Good | `ProductJsonLd` component injects Schema.org `Product`, `AggregateRating`, and `Offer` data. |
| **URL Canonicalization** | 🟢 Good | Strict canonical tags generated using `SITE_URL = "https://aihaat.shop"`. |

---

## 2. SEO Findings & Recommendations

### 2.1 Missing Routes in Dynamic XML Sitemap
- **Affected File:** `src/app/sitemap.ts`
- **Observation:**
  While the sitemap includes core static routes and fetches dynamic products and blogs from MySQL, newer public feature pages are omitted:
  - `/compare` (AI Tool Comparison Matrix — high value commercial search intent)
  - `/gift-cards` (Digital Gift Cards & Vouchers)
  - `/wallet` (Digital Wallet Information & Top-up)
- **Remediation:** Add `/compare`, `/gift-cards`, and `/wallet` to `staticRoutes` in `sitemap.ts`.

---

### 2.2 Dynamic Execution Overhead on `sitemap.xml`
- In `src/app/sitemap.ts#L9-L10`:
  ```typescript
  export const dynamic = "force-dynamic";
  export const revalidate = 3600; // Cache sitemap for 1 hour
  ```
- **Analysis:** Next.js disables `revalidate` when `dynamic = "force-dynamic"` is declared. Every crawler request to `https://aihaat.shop/sitemap.xml` queries the database for all active products and published blogs.
- **Remediation:** Remove `dynamic = "force-dynamic"` and allow ISR (`revalidate = 3600`) to cache the sitemap XML for 1 hour, reducing database load during intensive Googlebot crawls.
