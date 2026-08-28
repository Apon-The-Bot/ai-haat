import { NextRequest, NextResponse } from "next/server";
import { processActiveCampaignBatch, processScheduledCampaigns } from "@/lib/email-marketing/queue";

import { isCronAuthorized } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  const authorized = isCronAuthorized(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized: Invalid or missing Bearer CRON_SECRET" }, { status: 401 });
  }

  try {
    const scheduledTriggered = await processScheduledCampaigns();
    const batchResult = await processActiveCampaignBatch(undefined, 50);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      scheduledTriggered,
      batch: batchResult,
    });
  } catch (error: any) {
    console.error("[Cron Email Queue Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Cron job failed" },
      { status: 500 }
    );
  }
}