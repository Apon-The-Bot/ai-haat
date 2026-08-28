import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { resolveAudience } from "@/lib/email-marketing/segmentation";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { audienceType, audienceFilter, segmentId, manualEmails } = body;

    const result = await resolveAudience({
      audienceType: audienceType || "ALL_SUBSCRIBED",
      audienceFilter,
      segmentId,
      manualEmails,
    });

    return NextResponse.json({
      success: true,
      totalEligible: result.totalEligible,
      totalSuppressed: result.totalSuppressed,
      sampleRecipients: result.recipients.slice(0, 10),
    });
  } catch (error: any) {
    console.error("[Segment Preview Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to calculate audience estimate" },
      { status: 500 }
    );
  }
}