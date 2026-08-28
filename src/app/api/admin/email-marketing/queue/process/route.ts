import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { processActiveCampaignBatch, processScheduledCampaigns } from "@/lib/email-marketing/queue";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Allow authorized admin or internal cron runner with CRON_SECRET or session
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    try {
      const scheduledTriggered = await processScheduledCampaigns();
      const batchResult = await processActiveCampaignBatch(undefined, 30);

      return NextResponse.json({
        success: true,
        scheduledTriggered,
        batchResult,
      });
    } catch (error: any) {
      console.error("[Email Queue Process Error]:", error);
      return NextResponse.json(
        { success: false, error: error?.message || "Failed to process email queue batch" },
        { status: 500 }
      );
    }
  }

  // Fallback to Admin MFA for manual trigger
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const scheduledTriggered = await processScheduledCampaigns();
    const batchResult = await processActiveCampaignBatch(undefined, 30);

    return NextResponse.json({
      success: true,
      scheduledTriggered,
      batchResult,
    });
  } catch (error: any) {
    console.error("[Email Queue Process Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process email queue batch" },
      { status: 500 }
    );
  }
}