import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  setFeatureRestriction,
  SYSTEM_FEATURES,
  logUserActivity,
} from "@/lib/user-control/user-control-service";
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
    const restrictions = await prisma.userRestriction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const featureStatusList = SYSTEM_FEATURES.map((feat) => {
      const active = restrictions.find((r) => r.featureKey === feat.key && r.isRestricted);
      return {
        ...feat,
        isRestricted: Boolean(active),
        restriction: active || null,
      };
    });

    return NextResponse.json({
      success: true,
      features: featureStatusList,
      restrictions,
    });
  } catch (err: any) {
    console.error("[Admin User Restrictions GET Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to load restrictions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const { id: userId } = await params;
    const body = await req.json();
    const {
      featureKey,
      isRestricted = true,
      reason,
      adminNote,
      actionRestrictions,
      spendingLimitBDT,
      dailyLimitBDT,
      durationHours,
    } = body;

    if (!featureKey) {
      return NextResponse.json({ error: "featureKey is required" }, { status: 400 });
    }

    if (isRestricted && (!reason || !reason.trim())) {
      return NextResponse.json({ error: "A mandatory reason must be provided when restricting a feature" }, { status: 400 });
    }

    const saved = await setFeatureRestriction({
      userId,
      featureKey,
      isRestricted,
      reason: reason ? reason.trim() : "Administrative adjustment",
      adminNote,
      actionRestrictions,
      spendingLimitBDT: spendingLimitBDT !== undefined && spendingLimitBDT !== "" ? parseFloat(spendingLimitBDT) : undefined,
      dailyLimitBDT: dailyLimitBDT !== undefined && dailyLimitBDT !== "" ? parseFloat(dailyLimitBDT) : undefined,
      durationHours: durationHours ? parseInt(durationHours, 10) : undefined,
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
    });

    return NextResponse.json({
      success: true,
      message: `Feature ${featureKey} restriction ${isRestricted ? "applied" : "removed"} successfully.`,
      restriction: saved,
    });
  } catch (err: any) {
    console.error("[Admin User Restrictions POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to update feature restriction" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(req.url);
    const featureKey = searchParams.get("featureKey");

    if (!featureKey) {
      return NextResponse.json({ error: "featureKey parameter is required" }, { status: 400 });
    }

    await prisma.userRestriction.updateMany({
      where: { userId, featureKey },
      data: { isRestricted: false },
    });

    await logAdminAudit({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: "FEATURE_RESTRICTION_REMOVED",
      targetType: "USER",
      targetId: userId,
      details: { featureKey },
    });

    await logUserActivity({
      userId,
      eventType: "FEATURE_RESTRICTION_REMOVED",
      category: "ADMIN",
      description: `Restriction on ${featureKey} removed by administrator (${currentAdmin.email}).`,
    });

    return NextResponse.json({
      success: true,
      message: `Restriction on ${featureKey} has been removed.`,
    });
  } catch (err: any) {
    console.error("[Admin User Restrictions DELETE Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to remove restriction" }, { status: 500 });
  }
}
