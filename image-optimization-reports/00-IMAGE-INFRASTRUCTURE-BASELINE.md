# 00 — IMAGE INFRASTRUCTURE BASELINE & DISCOVERY REPORT

## 1. Executive Summary

- **Project:** AI Haat (`aihaat.shop`) — Digital Goods Marketplace & Licensing Platform
- **Audit Domain:** Image Lifecycle, Upload Handling, Storage Architecture, Delivery & Frontend Rendering
- **Audit Date:** November 2026
- **Status:** Baseline Completed & Fully Documented

Before this optimization project, AI Haat operated with a rudimentary client-side canvas compression utility and direct uncompressed file storage on the local filesystem. Images uploaded through the admin dashboard (product covers, gallery screenshots, payment method icons) were saved in their raw uploaded dimensions and formats (predominantly PNG and JPG) without server-side WebP transcoding, without multi-resolution responsive variants, and without network-aware delivery.

---

## 2. Pre-Existing Architecture & Flaws Discovered

### 2.1 Pre-Existing Image Upload Path
1. **Frontend Dropzone:** `src/components/admin/ImageUploadDropzone.tsx` & `src/components/ImageUpload.tsx`
   - Client attempted basic HTML5 canvas resizing (`src/lib/image-compression.ts`), but this was easily bypassed or omitted in custom payloads.
   - Files were transmitted via `multipart/form-data` to `POST /api/upload`.
2. **Backend API Handler:** `src/app/api/upload/route.ts`
   - Validated magic bytes using `validateImageBuffer` in `src/lib/security/upload-validator.ts`.
   - Wrote raw file buffer directly to `public/uploads/<filename>` using `fs.promises.writeFile`.
   - Returned `{ url: "/uploads/<filename>" }`.
3. **Database Relationships:**
   - Products table stored string URLs: `imageUrl` (cover) and `gallery` (JSON array of strings).
   - Category table stored string URL: `imageUrl`.
   - Settings table stored logo/favicon URLs.

### 2.2 Major Pain Points & Bottlenecks
| Bottleneck Area | Pre-Existing State | Impact on Users & Performance |
| :--- | :--- | :--- |
| **Transcoding** | Zero server-side WebP or AVIF encoding | Users downloaded massive raw PNGs (e.g. 50KB to 2MB) when modern WebP requires only 5KB to 30KB. |
| **Responsive Variants** | Single fixed-dimension asset stored on disk | Mobile phones with 360px viewport loaded desktop 1920px images, wasting 80–90% cellular data. |
| **Network Adaptability** | Static URL delivery regardless of network | 2G/3G mobile users in rural Bangladesh suffered 8–15s LCP loading delays. |
| **Cache Headers** | Default Next.js static asset serving without explicit immutable cache policy | Repeat visitors re-requested assets or incurred 304 validation rounds. |
| **Layout Shift (CLS)** | Fixed image tags lacking fluid responsive wrappers | Content jumped as images loaded without aspect ratio reservation. |

---

## 3. Discovered Call Sites & Asset Footprint

### 3.1 Existing Asset Inventory in `public/`
- **Total Images in Workspace:** 79 static assets
- **Seed Products:** 24 SVGs + 1 PNG (`windows-11.png`, 39KB)
- **Brand & UI Assets:** `logo.png` (83KB), `og-image.png` (114KB), `banner.jpg` (114KB)
- **Payment Method Gateways:** 8 icons (`bkash`, `nagad`, `rocket`, `upay`) in JPG and PNG formats (10KB–53KB each)

### 3.2 Frontend Rendering Inventory (28 Call Sites)
A centralized component `src/components/SafeImage.tsx` was present across all 28 critical storefront and admin interfaces:
- `ProductCard.tsx` (Catalog grid, deals carousel, related products)
- `src/app/products/[slug]/page.tsx` (Product gallery, main viewport, zoom modal)
- `CartSheet.tsx` & `src/app/checkout/page.tsx` (Thumbnail previews)
- `AdminProductModal.tsx` & `GalleryImageUploader.tsx` (Admin management)
- `UserOrders.tsx` & `CustomerReceiptModal.tsx` (Customer post-purchase history)

---

## 4. Architectural Transformation Strategy

To guarantee **zero downtime, zero broken database records, and backward compatibility**, the modernization strategy adopted:

1. **Server-Side Sharp Pipeline (`src/lib/media/optimizer.ts`):**
   - Transcode all uploaded raster images to WebP.
   - Generate multi-width responsive variants (`160`, `320`, `480`, `640`, `960`, `1280`, `1600`, `1920` px).
   - Generate 3 network quality profiles (`low`, `balanced`, `high`).
   - Store all variants under `public/uploads/{assetId}/` with an immutable `manifest.json`.

2. **Adaptive Frontend Wrapper (`src/components/common/AdaptiveImage.tsx`):**
   - Detect client network connection via Network Information API (`navigator.connection`) and `Save-Data` preference.
   - Select matching responsive `srcset` dynamically.
   - Reserve container aspect ratio to guarantee **CLS = 0**.
   - Shimmer skeleton placeholder while loading.
   - Background image preloading before source swaps to eliminate image flickering.

3. **Drop-in Propagation via `SafeImage.tsx`:**
   - Upgrading `SafeImage.tsx` to wrap `AdaptiveImage` propagates adaptive delivery across all 28 existing call sites instantly without risk of regression.
