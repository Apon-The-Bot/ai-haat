import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: any = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (search.trim()) {
      where.OR = [
        { name: { contains: search } },
        { subject: { contains: search } },
        { senderName: { contains: search } },
        { fromEmail: { contains: search } },
      ];
    }

    const [campaigns, total] = await Promise.all([
      prisma.emailCampaign.findMany({
        where,
        include: {
          template: { select: { id: true, name: true, category: true } },
          segment: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.emailCampaign.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("[EmailMarketing Campaigns GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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
      isScheduled,
    } = body;

    if (!name?.trim() || !subject?.trim() || !contentHtml?.trim()) {
      return NextResponse.json(
        { success: false, error: "Campaign name, subject, and content are required." },
        { status: 400 }
      );
    }

    const status = isScheduled && scheduledAt ? "SCHEDULED" : "DRAFT";

    const campaign = await prisma.emailCampaign.create({
      data: {
        name: name.trim(),
        subject: subject.trim(),
        preheader: preheader ? preheader.trim() : null,
        senderName: senderName?.trim() || "AI Haat Offers",
        fromEmail: fromEmail?.trim() || "offers@aihaat.shop",
        replyToEmail: replyToEmail ? replyToEmail.trim() : null,
        templateId: templateId || null,
        contentHtml,
        contentText: contentText || null,
        audienceType: audienceType || "ALL_SUBSCRIBED",
        audienceFilter: audienceFilter ? (typeof audienceFilter === "string" ? audienceFilter : JSON.stringify(audienceFilter)) : null,
        segmentId: segmentId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status,
        createdBy: auth.user.email,
      },
    });

    await logAdminAudit({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      action: status === "SCHEDULED" ? "CAMPAIGN_SCHEDULE" : "CAMPAIGN_CREATE",
      targetType: "EMAIL_CAMPAIGN",
      targetId: campaign.id,
      details: { name: campaign.name, subject: campaign.subject, status },
    });

    return NextResponse.json({
      success: true,
      campaign,
      message: status === "SCHEDULED" ? "Campaign scheduled successfully." : "Campaign draft saved.",
    });
  } catch (error: any) {
    console.error("[EmailMarketing Campaigns POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create campaign" },
      { status: 500 }
    );
  }
}