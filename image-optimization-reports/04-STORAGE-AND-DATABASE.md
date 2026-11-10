# 04 — STORAGE AND DATABASE ARCHITECTURE REPORT

## 1. Storage Architecture Strategy

A core constraint of the AI Haat production ecosystem is zero disruption to existing database schemas and production records. The system utilizes an **asset-directory encapsulation model** that decouples physical variant storage from database primary keys.

### 1.1 Directory Structure
All newly uploaded and optimized assets are stored under `public/uploads/` inside isolated, cryptographically unguessable asset folders:

```
public/
  uploads/
    asset_1794236067754_25fdb4ad8e88e55d/
      ├── manifest.json              # Full variant metadata and srcsets
      ├── original.webp              # High-fidelity master WebP
      ├── 160-low.webp               # 160px width, low quality
      ├── 160-balanced.webp          # 160px width, balanced quality
      ├── 160-high.webp              # 160px width, high quality
      ├── 320-low.webp
      ├── 320-balanced.webp
      ├── 320-high.webp
      ├── ...
      ├── 800-low.webp
      ├── 800-balanced.webp
      └── 800-high.webp
```

---

## 2. Zero-Migration Database Compatibility

### 2.1 Database Schema Preservation
The database tables (`Product`, `Category`, `Setting`, etc.) continue to store a simple string URL in their existing columns:
- `Product.imageUrl`: `/uploads/asset_1794236067754_25fdb4ad8e88e55d/original.webp`
- `Product.gallery`: `["/uploads/asset_.../original.webp", "/uploads/asset_.../original.webp"]`

### 2.2 Why This Pattern Excels:
1. **Zero Database Migrations:** No schema alteration scripts, no table locking, no Prisma push risk against production Hostinger MySQL.
2. **Absolute Backward Compatibility:** If any third-party integration, legacy webhook, or external API consumes `imageUrl`, it receives a valid, high-fidelity WebP URL that renders natively in all modern browsers.
3. **Implicit Metadata Resolution:** The `assetId` is embedded directly in the URL path (`/uploads/{assetId}/original.webp`). The frontend `AdaptiveImage` extracts this ID via regex (`/\/uploads\/([^/]+)/`) and fetches `/uploads/{assetId}/manifest.json` with zero database round-trips.

---

## 3. HTTP Caching & Edge Delivery Policy

Configured in `next.config.mjs`:

```js
async headers() {
  return [
    {
      source: "/uploads/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ];
}
```

### 3.1 Cache Benefits
- **Max-Age 1 Year (31,536,000s):** Browser and CDN edge caches store every asset variant permanently.
- **`immutable` Directive:** Informs browsers that the file content will never change. When the user navigates between pages or refreshes, the browser bypasses `304 Not Modified` revalidation requests entirely, serving assets with **0ms latency** from memory/disk cache.
- **Cache-Busting by Identity:** If an admin updates a product image, a new unique `assetId` is generated, ensuring clients never receive stale cached images.
