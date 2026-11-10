# 04 — PERFORMANCE & BOTTLENECK INVESTIGATION

This report assesses runtime performance, bundle optimization, caching strategies, database query patterns, and resource efficiency across frontend and backend boundaries.

---

## 1. Performance Summary & Scoring

| Subsystem | Performance Score | Primary Bottleneck / Risk |
| :--- | :---: | :--- |
| **Frontend Assets & Bundles** | **7.0 / 10** | Unoptimized `<img>` tags in admin/marketing; lucide-react full icon import overhead; Next.js 15 partial prerendering opportunities. |
| **HTTP Caching & Headers** | **4.0 / 10** | Global `no-store, no-cache, max-age=0` applied across `/:path*` in `next.config.mjs`, disabling browser and edge caching. |
| **Backend & API Response Times**| **5.5 / 10** | Synchronous disk I/O (`fs.readFileSync`/`writeFileSync`) in order and wallet APIs; unindexed Prisma relations. |
| **Database Query Efficiency** | **6.0 / 10** | Missing foreign key indexes on `Variation.productId` and `ProductRequest.status`; lack of pagination on some analytics views. |
| **Async Processing & Queuing** | **4.5 / 10** | Cron jobs executed over synchronous HTTP requests; absence of a persistent background queue (e.g. BullMQ / Redis). |

---

## 2. Identified Bottlenecks & Architectural Inefficiencies

### 2.1 Overly Restrictive Global `no-store` Cache Header
In `next.config.mjs#L74-L76`:
```javascript
{
  source: "/:path*",
  headers: [
    // ...
    {
      key: "Cache-Control",
      value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    },
  ],
}
```
- **Analysis:** This rule matches every request not caught by `_next/static` or `/images`. It forces browser and proxy caches to completely bypass local caching for all static HTML pages, public marketing pages (`/about`, `/privacy`, `/terms`, `/shop`), public product assets, and public API responses.
- **Impact:**
  - Browser cannot cache previously rendered public pages. Every back/forward navigation triggers full round-trips to the origin server.
  - Server CPU utilization increases under moderate crawl/traffic surges.
  - LCP (Largest Contentful Paint) and TTFB (Time to First Byte) degrade across 3G/4G mobile networks in Bangladesh.
- **Remediation:** Scope `no-store` strictly to authenticated customer and admin routes:
  - Public marketing pages: `public, max-age=60, s-maxage=3600, stale-while-revalidate=86400`
  - Dynamic product pages: Incremental Static Regeneration (`revalidate = 60`)
  - Private dashboards & admin APIs: `private, no-cache, no-store, must-revalidate`

---

### 2.2 Synchronous File System I/O in Request Lifecycles
In `src/lib/orders-db.ts#L62-L80` and `src/lib/wallet-db.ts`:
```typescript
export function getAllOrders(): StoredOrder[] {
  ensureDir();
  try {
    const raw = fs.readFileSync(ordersFile, "utf-8"); // SYNCHRONOUS BLOCKING DISK READ
    return JSON.parse(raw) as StoredOrder[];
  } catch {
    return [];
  }
}

export function saveOrder(order: StoredOrder): StoredOrder {
  // ...
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), "utf-8"); // SYNCHRONOUS BLOCKING WRITE
  return order;
}
```
- **Analysis:** Node.js executes on a single-threaded event loop. When `fs.readFileSync` or `fs.writeFileSync` is called during `POST /api/orders` (called on line 694 of `orders/route.ts`), the Node event loop is blocked while disk IO reads and parses the entire `orders.json` file.
- **Impact:** As order history grows (e.g., thousands of orders), JSON file size exceeds tens of megabytes. Parsing and writing a 10MB JSON string synchronously freezes the event loop for 50–200ms per checkout request, starving other concurrent user requests and causing latency spikes.
- **Remediation:** Remove legacy `data/*.json` filesystem syncing entirely. Rely exclusively on MySQL via Prisma with asynchronous database queries.

---

### 2.3 Unoptimized `<img>` Elements vs Next.js Image Optimization
During the ESLint build validation, the following unoptimized `<img>` tags were flagged:
- `src/app/admin/email-marketing/campaigns/new/page.tsx:1106`
- `src/app/admin/email-marketing/campaigns/[id]/edit/page.tsx:451`
- `src/app/dashboard/affiliate/page.tsx:697`
- `src/components/admin/GalleryImageUploader.tsx:83`
- `src/components/admin/ImageUploadDropzone.tsx:143, 151`

- **Analysis:** Standard HTML `<img>` elements bypass the Next.js Sharp-based image optimization pipeline. Large marketing banners and uploaded product screenshots are served in their original uncompressed resolution, consuming excess bandwidth and delaying rendering.
- **Remediation:** Replace all `<img>` tags with `<Image />` from `next/image` or the custom `<SafeImage />` wrapper component with explicit `width`, `height`, and `placeholder="blur"` attributes.

---

### 2.4 Sequential Awaits in Admin Dashboard Stats
In `src/app/api/admin/dashboard/stats/route.ts`:
The endpoint aggregates counts and sums across orders, delivered keys, users, products, and support tickets.
- **Analysis:** Several database queries are awaited sequentially rather than in parallel using `Promise.all()`.
- **Measurement:** Running 5 individual queries sequentially with an average 15ms database latency results in ~75ms TTFB, whereas executing them concurrently with `Promise.all()` reduces total query time to ~20ms.
- **Remediation:** Group non-dependent aggregate queries into `Promise.all([ prisma.order.count(...), prisma.user.count(...), ... ])`.
