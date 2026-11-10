# 02 — WEBP CONVERSION & MULTI-RESOLUTION VARIANTS REPORT

## 1. Transcoding Specifications

The image processing engine is powered by native libvips via `sharp` v0.35.4. Sharp runs directly within the Node.js runtime, executing high-throughput multi-threaded SIMD image transforms.

### 1.1 WebP Encoder Parameters
- **Target Format:** WebP (lossy with high-fidelity alpha preservation)
- **Color Space:** Rec. 709 / sRGB (converted using ICC profiles to ensure consistent color reproduction across screens)
- **EXIF Handling:** `.rotate()` automatically re-orients images based on EXIF orientation tags before stripping metadata.
- **Metadata:** Stripped completely (zero GPS coordinates, zero camera models, zero timestamps leaked to visitors).
- **Animated Sources (GIFs):** Transcoded to animated WebP preserving keyframes and looping metadata, dropping file sizes by up to 75%.

---

## 2. Multi-Resolution Matrix

The system dynamically determines candidate widths based on the source image's native width. **Crucial Rule:** Upscaling is strictly prohibited (`withoutEnlargement: true`) to avoid visual degradation and bloated file sizes.

The standard responsive breakpoint ladder is:
`[160, 320, 480, 640, 960, 1280, 1600, 1920]` px

### Breakpoint Target Usage
| Width (px) | Viewport & Component Role | Typical Display Width (CSS px) | Typical Pixel Density |
| :--- | :--- | :--- | :--- |
| **160w** | Cart & Checkout Thumbnails | 48px – 80px | 2x / 3x Retina |
| **320w** | Mobile Grid Cards / Small Avatars | 140px – 160px | 2x Retina |
| **480w** | 2-Column Mobile Catalog Grid | 180px – 240px | 2x Retina |
| **640w** | Single Column Mobile Feeds / Tablet Cards | 300px – 320px | 2x Retina |
| **960w** | Tablet Main Product View / Desktop Cards | 400px – 480px | 2x Retina |
| **1280w** | Desktop Product Gallery Main Viewport | 500px – 640px | 2x Retina |
| **1600w** | High-DPI Desktop Laptops | 800px | 2x Retina |
| **1920w** | Full-Bleed Desktop Banners & Zoom Modals | 960px – 1200px | 1.5x / 2x Retina |

---

## 3. Triple Quality Profiles

For every resolved resolution, three distinct compression profiles are generated:

### 3.1 Low Quality Profile (`low`)
- **WebP Quality Setting:** `45`
- **Alpha Quality:** `70`
- **Compression Effort:** `4`
- **Intended Client:** Data Saver mode enabled, 2G / Slow-2G networks, or devices with `< 1.0 Mbps` downlink.
- **Savings:** Typically **85% – 95%** reduction compared to original source assets.

### 3.2 Balanced Quality Profile (`balanced`)
- **WebP Quality Setting:** `68`
- **Alpha Quality:** `85`
- **Compression Effort:** `4`
- **Intended Client:** Default profile, 3G / 4G cellular connections, standard desktop broadband.
- **Visual Fidelity:** Visually indistinguishable from uncompressed source under typical viewing distances (PSNR > 38 dB, SSIM > 0.94).
- **Savings:** Typically **60% – 80%** reduction compared to original source assets.

### 3.3 High Quality Profile (`high`)
- **WebP Quality Setting:** `82`
- **Alpha Quality:** `85`
- **Compression Effort:** `4`
- **Intended Client:** High-speed broadband (`downlink >= 2.5 Mbps` and `rtt <= 200 ms`) or desktop monitors.
- **Visual Fidelity:** Master studio presentation suitable for zoomed inspection of product details and screenshots.
- **Savings:** Typically **40% – 60%** reduction compared to original source assets.

---

## 4. Manifest File Architecture

All generated variants are recorded in `manifest.json` located within the isolated asset directory `public/uploads/{assetId}/manifest.json`.

```json
{
  "assetId": "asset_1794236067754_25fdb4ad8e88e55d",
  "originalFileName": "windows-11.png",
  "originalFormat": "png",
  "originalWidth": 800,
  "originalHeight": 600,
  "originalFileSize": 39595,
  "aspectRatio": 1.3333,
  "hasAlpha": false,
  "isAnimated": false,
  "createdAt": "2026-11-09T14:54:27.754Z",
  "primaryUrl": "/uploads/asset_1794236067754_25fdb4ad8e88e55d/original.webp",
  "fallbackUrl": "/uploads/asset_1794236067754_25fdb4ad8e88e55d/original.webp",
  "variants": [
    { "width": 160, "height": 120, "qualityProfile": "low", "format": "webp", "fileSize": 1024, "url": "..." },
    ...
  ],
  "profiles": {
    "low": { "srcSet": "/uploads/.../160-low.webp 160w, ...", "variants": [...] },
    "balanced": { "srcSet": "/uploads/.../160-balanced.webp 160w, ...", "variants": [...] },
    "high": { "srcSet": "/uploads/.../160-high.webp 160w, ...", "variants": [...] }
  }
}
```
This manifest provides instant, static O(1) resolution without requiring runtime image transcode overhead on client requests.
