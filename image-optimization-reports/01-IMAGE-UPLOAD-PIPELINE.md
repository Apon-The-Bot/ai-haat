# 01 — IMAGE UPLOAD PIPELINE ARCHITECTURE REPORT

## 1. Pipeline Overview

The AI Haat image upload pipeline has been upgraded from a passive file-saving mechanism to a resilient, asynchronous, server-side media processing pipeline. Every uploaded image is received via `POST /api/upload`, strictly validated against binary magic bytes, decoded through `sharp`, resized across responsive breakpoints, converted to modern WebP with three network quality profiles, saved to isolated asset directories, and cataloged via an immutable JSON manifest.

```
[Client / Admin Browser]
       │
       ▼ (multipart/form-data)
[POST /api/upload Route Handler]
       │
       ├─► 1. Binary Magic-Byte Verification (validateImageBuffer)
       │      ├─ JPEG (FF D8 FF)
       │      ├─ PNG (89 50 4E 47 0D 0A 1A 0A)
       │      ├─ WebP (RIFF....WEBP)
       │      ├─ GIF (GIF87a / GIF89a)
       │      └─ Explicitly Rejects: SVG, XML, HTML, Scripts, Malformed Headers
       │
       ├─► 2. Decompression Bomb & Resource Limits
       │      ├─ Max File Size: 10 MB
       │      ├─ Max Width / Height: 8,192 px
       │      └─ Max Input Pixels: 40,000,000 px
       │
       ├─► 3. Sharp Normalization Engine
       │      ├─ Auto-orient EXIF metadata (.rotate())
       │      ├─ Normalize color space to sRGB (.toColorspace('srgb'))
       │      └─ Strip GPS, camera metadata, and sensitive EXIF tags
       │
       ├─► 4. Multi-Resolution & Profile Transcoding
       │      ├─ Breakpoints: [160, 320, 480, 640, 960, 1280, 1600, 1920] px
       │      ├─ Constraint: No upscaling beyond source image bounds
       │      └─ Profiles: Low (q=45), Balanced (q=68), High (q=82)
       │
       ├─► 5. Atomic Disk Storage
       │      ├─ Path: public/uploads/{assetId}/
       │      ├─ Assets: original.webp, {width}-{profile}.webp
       │      └─ Metadata: manifest.json
       │
       ▼
[Response JSON: url, assetId, manifestUrl, savingsPercent, manifest]
```

---

## 2. API Endpoint Specification

### 2.1 `POST /api/upload`
- **Authentication:** Admin session check or authenticated user context.
- **Request Format:** `multipart/form-data` with form field `file`.
- **Response Format:**
```json
{
  "url": "/uploads/asset_1794236067754_25fdb4ad8e88e55d/original.webp",
  "assetId": "asset_1794236067754_25fdb4ad8e88e55d",
  "fileName": "original.webp",
  "width": 800,
  "height": 600,
  "format": "webp",
  "originalSizeKB": 128,
  "optimizedSizeKB": 7,
  "savingsPercent": 95,
  "manifestUrl": "/uploads/asset_1794236067754_25fdb4ad8e88e55d/manifest.json",
  "manifest": {
    "assetId": "asset_1794236067754_25fdb4ad8e88e55d",
    "aspectRatio": 1.3333,
    "hasAlpha": false,
    "profiles": {
      "low": { "srcSet": "...", "variants": [...] },
      "balanced": { "srcSet": "...", "variants": [...] },
      "high": { "srcSet": "...", "variants": [...] }
    }
  }
}
```

### 2.2 `GET /api/upload?url=<asset_url_or_id>`
- **Purpose:** Allows frontend components to query the delivery manifest of any previously stored asset on demand.
- **Caching:** Edge-cached with `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`.
- **Response:** Complete `ImageManifest` JSON object or `{ "error": "Manifest not found" }` (404).

---

## 3. Error Handling and Resilience

1. **Empty / Missing File:** Returns `400 Bad Request` with descriptive Bengali and English error message.
2. **Unsupported Format / Executable SVG:** Returns `400 Bad Request` (`SVG and scriptable image formats are not allowed for security reasons`).
3. **Buffer Overflows / Decompression Bombs:** Aborts immediately at the Sharp input parser level before allocating unmanageable heap memory.
4. **Filesystem IO Failures:** Returns `500 Internal Server Error` and logs context without leaking internal server directory paths to the client.
