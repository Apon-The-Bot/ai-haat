import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { queueCampaignRecipients, processActiveCampaignBatch } from "@/lib/email-marketing/queue";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status === "SENDING") {
      return NextResponse.json(
        { success: false, error: "This campaign is already broadcasting." },
        { status: 400 }
      );
    }

    // 1. Enqueue all recipients
    const { totalQueued } = await queueCampaignRecipients(campaign.id);

    if (totalQueued === 0) {
      return NextResponse.json({
        success: true,
        message: "No eligible recipients found matching audience criteria (or all matching contacts are suppressed).",
        totalQueued: 0,
      });
    }

    // 2. Trigger processing of the first batch immediately
    const batchResult = await processActiveCampaignBatch(campaign.id, 25);

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "CAMPAIGN_SEND",
      targetType: "EMAIL_CAMPAIGN",
      targetId: campaign.id,
      details: {
        name: campaign.name,
        totalQueued,
        firstBatchSent: batchResult.sent,
        firstBatchFailed: batchResult.failed,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Broadcast initiated! ${totalQueued} recipients queued. Initial batch dispatched.`,
      totalQueued,
      initialBatch: batchResult,
    });
  } catch (error: any) {
    console.error("[Campaign Send Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to start broadcast" },
      { status: 500 }
    );
  }
}