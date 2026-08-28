import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
      include: {
        template: true,
        segment: true,
        recipients: {
          take: 100,
          orderBy: { queuedAt: "desc" },
        },
        _count: {
          select: {
            recipients: true,
            eventLogs: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[Campaign GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const {
      name,
      subject,
      preheader,
      senderName,
      fromEmail,
      replyToEmail,
      templateId,
      contentHtml,
      contentText,
      audienceType,
      audienceFilter,
      segmentId,
      scheduledAt,
      status,
    } = body;

    const existing = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    // Do not modify campaigns that are already SENDING or completed
    if (existing.status === "SENDING" && status !== "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "Cannot edit a campaign that is currently broadcasting." },
        { status: 400 }
      );
    }

    const updated = await prisma.emailCampaign.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        subject: subject !== undefined ? subject.trim() : undefined,
        preheader: preheader !== undefined ? preheader : undefined,
        senderName: senderName !== undefined ? senderName.trim() : undefined,
        fromEmail: fromEmail !== undefined ? fromEmail.trim() : undefined,
        replyToEmail: replyToEmail !== undefined ? replyToEmail : undefined,
        templateId: templateId !== undefined ? templateId : undefined,
        contentHtml: contentHtml !== undefined ? contentHtml : undefined,
        contentText: contentText !== undefined ? contentText : undefined,
        audienceType: audienceType !== undefined ? audienceType : undefined,
        audienceFilter:
          audienceFilter !== undefined
            ? typeof audienceFilter === "string"
              ? audienceFilter
              : JSON.stringify(audienceFilter)
            : undefined,
        segmentId: segmentId !== undefined ? segmentId : undefined,
        scheduledAt: scheduledAt !== undefined ? (scheduledAt ? new Date(scheduledAt) : null) : undefined,
        status: status !== undefined ? status : undefined,
      },
    });

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: status === "CANCELLED" ? "CAMPAIGN_CANCEL" : "CAMPAIGN_UPDATE",
      targetType: "EMAIL_CAMPAIGN",
      targetId: updated.id,
      details: { name: updated.name, status: updated.status },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error: any) {
    console.error("[Campaign PATCH Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const existing = await prisma.emailCampaign.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    if (existing.status === "SENDING") {
      return NextResponse.json(
        { success: false, error: "Cannot delete an actively sending campaign. Cancel it first." },
        { status: 400 }
      );
    }

    await prisma.emailCampaign.delete({
      where: { id: params.id },
    });

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: "CAMPAIGN_DELETE",
      targetType: "EMAIL_CAMPAIGN",
      targetId: params.id,
      details: { name: existing.name },
    });

    return NextResponse.json({ success: true, message: "Campaign deleted successfully." });
  } catch (error: any) {
    console.error("[Campaign DELETE Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete campaign" },
      { status: 500 }
    );
  }
}