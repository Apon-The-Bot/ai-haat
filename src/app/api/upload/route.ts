import { requireAdminMfa } from '@/lib/auth-guard';
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { validateImageBuffer } from "@/lib/security/upload-validator";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds 5MB limit." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file cannot be uploaded." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Deep Magic-Byte Validation
    const magicCheck = validateImageBuffer(buffer);
    if (!magicCheck.valid) {
      return NextResponse.json({ error: magicCheck.error || "Invalid file content." }, { status: 400 });
    }

    // Determine normalized extension from verified format
    const extensionMap: Record<string, string> = {
      jpeg: ".jpg",
      png: ".png",
      webp: ".webp",
      gif: ".gif",
    };
    const safeExt = extensionMap[magicCheck.detectedFormat || ""] || ".png";

    // Create uploads directory if not exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate cryptographically random unguessable filename (No user-controlled name or path traversal)
    const randomToken = crypto.randomBytes(16).toString("hex");
    const uniqueName = `img_${Date.now()}_${randomToken}${safeExt}`;
    const filePath = path.join(uploadsDir, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueName,
    });
  } catch (error: any) {
    console.error("[Upload API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
