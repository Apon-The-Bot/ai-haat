import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const event = searchParams.get("event");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);

    const where: Record<string, any> = {};
    if (campaignId) where.campaignId = campaignId;
    if (event && event !== "ALL") where.event = event;

    const [logs, total] = await Promise.all([
      prisma.emailEventLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          campaign: {
            select: { id: true, name: true, subject: true },
          },
        },
      }),
      prisma.emailEventLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error: any) {
    console.error("[Email Logs GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch email event logs" },
      { status: 500 }
    );
  }
}