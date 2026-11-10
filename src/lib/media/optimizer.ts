import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { validateImageBuffer } from "@/lib/security/upload-validator";

export { validateImageBuffer };

export type ImageQualityProfile = "low" | "balanced" | "high";

export interface ImageVariantMeta {
  width: number;
  height: number;
  qualityProfile: ImageQualityProfile;
  format: "webp" | "gif";
  fileSize: number;
  url: string;
  fileName: string;
}

export interface ProfileSrcSetData {
  srcSet: string;
  variants: { width: number; height: number; url: string; fileSize: number }[];
}

export interface ImageManifest {
  assetId: string;
  originalFileName: string;
  originalFormat: string;
  originalWidth: number;
  originalHeight: number;
  originalFileSize: number;
  aspectRatio: number;
  hasAlpha: boolean;
  isAnimated: boolean;
  createdAt: string;
  primaryUrl: string;
  fallbackUrl: string;
  variants: ImageVariantMeta[];
  profiles: {
    low: ProfileSrcSetData;
    balanced: ProfileSrcSetData;
    high: ProfileSrcSetData;
  };
}

export interface ImageOptimizationResult {
  success: boolean;
  assetId: string;
  url: string;
  fileName: string;
  width: number;
  height: number;
  format: string;
  originalSizeKB: number;
  optimizedSizeKB: number;
  savingsPercent: number;
  manifestUrl: string;
  manifest: ImageManifest;
  error?: string;
}

// Configurable responsive width breakpoints (target widths in pixels)
export const RESPONSIVE_WIDTHS = [160, 320, 480, 640, 960, 1280, 1600, 1920] as const;

// Security limits
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_IMAGE_DIMENSION = 8192; // Max width/height in px
export const MAX_INPUT_PIXELS = 40_000_000; // 40 MP decompression bomb guard

// Quality profiles tuning
export const QUALITY_PRESETS: Record<ImageQualityProfile, { quality: number; effort: number }> = {
  low: { quality: 45, effort: 4 },      // Data Saver / 2G
  balanced: { quality: 68, effort: 4 }, // Default / 3G / Standard
  high: { quality: 82, effort: 4 },     // High Quality / 4G / Desktop
};

/**
 * Validates, normalizes, resizes, and converts an uploaded raster image buffer
 * into multi-resolution WebP variants and builds a responsive delivery manifest.
 */
export async function optimizeAndStoreImage(
  buffer: Buffer,
  originalFileName: string = "image"
): Promise<ImageOptimizationResult> {
  // 1. Basic sanity checks
  if (!buffer || buffer.length === 0) {
    throw new Error("Empty image buffer provided.");
  }

  if (buffer.length > MAX_UPLOAD_SIZE) {
    throw new Error(`Image file size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds 10MB limit.`);
  }

  // 2. Security magic-byte inspection (Rejects SVG, XML, HTML, and scriptable payloads)
  const magicCheck = validateImageBuffer(buffer);
  if (!magicCheck.valid) {
    throw new Error(magicCheck.error || "Invalid file content. Real image format signature required.");
  }

  const detectedFormat = magicCheck.detectedFormat || "jpeg";

  // 3. Sharp initialization with decompression bomb protection
  const imageInstance = sharp(buffer, {
    limitInputPixels: MAX_INPUT_PIXELS,
    animated: detectedFormat === "gif",
  });

  const metadata = await imageInstance.metadata();
  const rawWidth = metadata.width || 0;
  const rawHeight = metadata.height || 0;

  if (rawWidth === 0 || rawHeight === 0) {
    throw new Error("Unable to decode image dimensions. Corrupted image file.");
  }

  if (rawWidth > MAX_IMAGE_DIMENSION || rawHeight > MAX_IMAGE_DIMENSION) {
    throw new Error(`Image dimensions (${rawWidth}x${rawHeight}) exceed maximum allowed limit of ${MAX_IMAGE_DIMENSION}px.`);
  }

  const isAnimated = Boolean(metadata.pages && metadata.pages > 1);
  const hasAlpha = Boolean(metadata.hasAlpha);
  const aspectRatio = Number((rawWidth / rawHeight).toFixed(4));

  // 4. Generate cryptographically unguessable asset ID and directory
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  const assetId = `asset_${Date.now()}_${randomSuffix}`;
  const uploadsBaseDir = path.join(process.cwd(), "public", "uploads");
  const assetDir = path.join(uploadsBaseDir, assetId);

  if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
  }

  const generatedVariants: ImageVariantMeta[] = [];

  // Helper to safely write file to asset directory
  const saveVariant = async (
    fileName: string,
    width: number,
    height: number,
    qualityProfile: ImageQualityProfile,
    data: Buffer,
    format: "webp" | "gif" = "webp"
  ): Promise<ImageVariantMeta> => {
    const filePath = path.join(assetDir, fileName);
    await fs.promises.writeFile(filePath, data);
    const meta: ImageVariantMeta = {
      width,
      height,
      qualityProfile,
      format,
      fileSize: data.length,
      url: `/uploads/${assetId}/${fileName}`,
      fileName,
    };
    generatedVariants.push(meta);
    return meta;
  };

  // 5. Generate Master High-Fidelity WebP (Original Dimensions)
  let masterWebpBuffer: Buffer;
  if (isAnimated) {
    // Retain animation in WebP where supported
    masterWebpBuffer = await sharp(buffer, { animated: true })
      .webp({ quality: QUALITY_PRESETS.balanced.quality, effort: 4 })
      .toBuffer();
    // Also save original gif for ultimate fallback
    await fs.promises.writeFile(path.join(assetDir, "original.gif"), buffer);
  } else {
    masterWebpBuffer = await sharp(buffer)
      .rotate() // auto-orient EXIF
      .toColorspace("srgb") // normalize color space
      .webp({ quality: QUALITY_PRESETS.high.quality, effort: 4, alphaQuality: 85 })
      .toBuffer();
  }

  const primaryOriginalMeta = await saveVariant(
    "original.webp",
    rawWidth,
    rawHeight,
    "high",
    masterWebpBuffer,
    "webp"
  );

  // 6. Multi-Resolution & Multi-Quality Variants Generation
  // Filter target widths: never upscale beyond rawWidth!
  const targetWidths: number[] = RESPONSIVE_WIDTHS.filter((w) => w < rawWidth);
  // Ensure the original width is included as the highest tier if not already present
  if (!targetWidths.includes(rawWidth)) {
    targetWidths.push(rawWidth);
  }

  const profiles: ImageQualityProfile[] = ["low", "balanced", "high"];

  // Process variants sequentially to maintain bounded CPU and memory consumption
  for (const width of targetWidths) {
    const targetHeight = Math.max(1, Math.round(width / aspectRatio));

    for (const profile of profiles) {
      // If this is the raw width and high quality, masterWebpBuffer is already saved as original.webp
      if (width === rawWidth && profile === "high") {
        const copyFileName = `${width}-${profile}.webp`;
        await saveVariant(copyFileName, width, targetHeight, profile, masterWebpBuffer, "webp");
        continue;
      }

      const { quality, effort } = QUALITY_PRESETS[profile];

      let variantBuffer: Buffer;
      if (isAnimated) {
        variantBuffer = await sharp(buffer, { animated: true })
          .resize({ width, height: targetHeight, fit: "inside", withoutEnlargement: true })
          .webp({ quality, effort })
          .toBuffer();
      } else {
        variantBuffer = await sharp(buffer)
          .rotate()
          .toColorspace("srgb")
          .resize({ width, height: targetHeight, fit: "inside", withoutEnlargement: true })
          .webp({ quality, effort, alphaQuality: profile === "low" ? 70 : 85 })
          .toBuffer();
      }

      const fileName = `${width}-${profile}.webp`;
      await saveVariant(fileName, width, targetHeight, profile, variantBuffer, "webp");
    }
  }

  // 7. Assemble Profile-Specific Source Sets for Adaptive Delivery
  const buildProfileData = (profile: ImageQualityProfile): ProfileSrcSetData => {
    const profileVariants = generatedVariants
      .filter((v) => v.qualityProfile === profile)
      .sort((a, b) => a.width - b.width);

    const srcSet = profileVariants.map((v) => `${v.url} ${v.width}w`).join(", ");

    return {
      srcSet,
      variants: profileVariants.map((v) => ({
        width: v.width,
        height: v.height,
        url: v.url,
        fileSize: v.fileSize,
      })),
    };
  };

  const manifest: ImageManifest = {
    assetId,
    originalFileName: path.basename(originalFileName),
    originalFormat: detectedFormat,
    originalWidth: rawWidth,
    originalHeight: rawHeight,
    originalFileSize: buffer.length,
    aspectRatio,
    hasAlpha,
    isAnimated,
    createdAt: new Date().toISOString(),
    primaryUrl: primaryOriginalMeta.url,
    fallbackUrl: `/uploads/${assetId}/original.webp`,
    variants: generatedVariants,
    profiles: {
      low: buildProfileData("low"),
      balanced: buildProfileData("balanced"),
      high: buildProfileData("high"),
    },
  };

  // Write manifest.json to asset directory
  const manifestPath = path.join(assetDir, "manifest.json");
  await fs.promises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  // Calculate overall savings on the balanced original or typical mobile variant
  const balancedVariant = generatedVariants.find((v) => v.qualityProfile === "balanced" && v.width <= 640) || primaryOriginalMeta;
  const originalSizeKB = Math.round(buffer.length / 1024);
  const optimizedSizeKB = Math.round(balancedVariant.fileSize / 1024);
  const savingsPercent = originalSizeKB > 0 ? Math.max(0, Math.round(((originalSizeKB - optimizedSizeKB) / originalSizeKB) * 100)) : 0;

  return {
    success: true,
    assetId,
    url: primaryOriginalMeta.url,
    fileName: primaryOriginalMeta.fileName,
    width: rawWidth,
    height: rawHeight,
    format: "webp",
    originalSizeKB,
    optimizedSizeKB,
    savingsPercent,
    manifestUrl: `/uploads/${assetId}/manifest.json`,
    manifest,
  };
}

/**
 * Reads an existing image manifest from disk given an asset ID or public URL.
 * Returns null if the image was not created through the optimizer or manifest is missing.
 */
export async function getImageManifest(assetUrlOrId: string): Promise<ImageManifest | null> {
  try {
    if (!assetUrlOrId) return null;

    let assetId = assetUrlOrId;
    if (assetUrlOrId.includes("/uploads/")) {
      const match = assetUrlOrId.match(/\/uploads\/([^/]+)/);
      if (match && match[1]) {
        assetId = match[1];
      }
    }

    const manifestPath = path.join(process.cwd(), "public", "uploads", assetId, "manifest.json");
    if (!fs.existsSync(manifestPath)) {
      return null;
    }

    const raw = await fs.promises.readFile(manifestPath, "utf-8");
    return JSON.parse(raw) as ImageManifest;
  } catch (err) {
    return null;
  }
}
