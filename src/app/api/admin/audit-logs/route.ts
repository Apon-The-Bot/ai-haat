import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const actionFilter = searchParams.get("action");
    const targetTypeFilter = searchParams.get("targetType");
    const query = searchParams.get("query") || searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10)));

    const whereClause: any = {};

    if (actionFilter && actionFilter !== "ALL") {
      whereClause.action = actionFilter;
    }

    if (targetTypeFilter && targetTypeFilter !== "ALL") {
      whereClause.targetType = targetTypeFilter;
    }

    if (query && query.trim()) {
      const clean = query.trim();
      whereClause.OR = [
        { actorEmail: { contains: clean } },
        { targetId: { contains: clean } },
        { details: { contains: clean } },
      ];
    }

    const total = await prisma.adminAuditLog.count({ where: whereClause });
    const totalPages = Math.ceil(total / pageSize);
    const skip = (page - 1) * pageSize;

    const logs = await prisma.adminAuditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    const formatted = logs.map((l) => {
      let parsedDetails: any = null;
      try {
        if (l.details) parsedDetails = JSON.parse(l.details);
      } catch {
        parsedDetails = l.details;
      }

      return {
        id: l.id,
        actorId: l.actorId,
        actorEmail: l.actorEmail || "Admin",
        action: l.action,
        targetType: l.targetType,
        targetId: l.targetId || "N/A",
        details: parsedDetails,
        ipAddress: l.ipAddress || "N/A",
        createdAt: l.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      logs: formatted,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("[Admin Audit Logs GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
