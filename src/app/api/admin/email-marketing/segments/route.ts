import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { resolveAudience } from "@/lib/email-marketing/segmentation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const segments = await prisma.emailSegment.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Compute estimated counts for each segment
    const segmentsWithCounts = await Promise.all(
      segments.map(async (s) => {
        try {
          const res = await resolveAudience({
            audienceType: "CUSTOM_SEGMENT",
            segmentId: s.id,
          });
          return {
            ...s,
            estimatedCount: res.totalEligible,
            suppressedCount: res.totalSuppressed,
          };
        } catch {
          return { ...s, estimatedCount: 0, suppressedCount: 0 };
        }
      })
    );

    return NextResponse.json({ success: true, segments: segmentsWithCounts });
  } catch (error: any) {
    console.error("[Segments GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch segments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { name, description, conditions } = body;

    if (!name?.trim() || !conditions) {
      return NextResponse.json(
        { success: false, error: "Segment name and rule conditions are required." },
        { status: 400 }
      );
    }

    const conditionsStr = typeof conditions === "string" ? conditions : JSON.stringify(conditions);

    const segment = await prisma.emailSegment.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        conditions: conditionsStr,
      },
    });

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "SEGMENT_CREATE",
      targetType: "EMAIL_SEGMENT",
      targetId: segment.id,
      details: { name: segment.name },
    });

    return NextResponse.json({ success: true, segment });
  } catch (error: any) {
    console.error("[Segments POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create segment" },
      { status: 500 }
    );
  }
}