import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { setUserTags } from "@/lib/user-control/user-control-service";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { id: userId } = await params;
    const tags = await prisma.userTag.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      tags: tags.map((t) => t.tag),
    });
  } catch (err: any) {
    console.error("[Admin User Tags GET Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load tags" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const { id: userId } = await params;
    const body = await req.json();
    const { tags } = body;

    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: "Tags must be an array of strings" }, { status: 400 });
    }

    const updatedTags = await setUserTags(userId, tags, currentAdmin.id);

    await logAdminAudit({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: "USER_TAGS_UPDATED",
      targetType: "USER",
      targetId: userId,
      details: { tags },
    });

    return NextResponse.json({
      success: true,
      message: "Customer tags updated successfully.",
      tags: updatedTags.map((t) => t.tag),
    });
  } catch (err: any) {
    console.error("[Admin User Tags PUT Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update tags" }, { status: 500 });
  }
}
