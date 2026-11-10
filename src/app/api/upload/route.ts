import { requireAdminMfa } from '@/lib/auth-guard';
import { NextRequest, NextResponse } from "next/server";
import { optimizeAndStoreImage, getImageManifest } from "@/lib/media/optimizer";

export const dynamic = "force-dynamic";

/**
 * Administrative Image Upload & Adaptive WebP Processing Pipeline
 * Validates, optimizes, and generates multi-resolution, multi-quality WebP variants
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file cannot be uploaded." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Execute server-side optimization & multi-variant generation pipeline
    const optimized = await optimizeAndStoreImage(buffer, file.name);

    return NextResponse.json({
      success: true,
      url: optimized.url,
      fileName: optimized.fileName,
      assetId: optimized.assetId,
      width: optimized.width,
      height: optimized.height,
      format: optimized.format,
      originalSizeKB: optimized.originalSizeKB,
      optimizedSizeKB: optimized.optimizedSizeKB,
      savingsPercent: optimized.savingsPercent,
      manifestUrl: optimized.manifestUrl,
      manifest: optimized.manifest,
    });
  } catch (error: any) {
    console.error("[Upload API Optimization Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process and optimize image" },
      { status: error?.message?.includes("exceed") || error?.message?.includes("Invalid") ? 400 : 500 }
    );
  }
}

/**
 * Manifest lookup endpoint for an uploaded asset
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const assetUrlOrId = searchParams.get("url") || searchParams.get("assetId");

  if (!assetUrlOrId) {
    return NextResponse.json({ error: "Missing asset url or id parameter" }, { status: 400 });
  }

  const manifest = await getImageManifest(assetUrlOrId);
  if (!manifest) {
    return NextResponse.json({ error: "Asset manifest not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, manifest });
}
