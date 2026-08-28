import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { reviewAffiliatePayout } from "@/lib/commerce/affiliates";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");

    const whereClause: any = statusFilter ? { status: statusFilter } : {};

    const payouts = await prisma.affiliatePayoutRequest.findMany({
      where: whereClause,
      include: {
        affiliateProfile: {
          include: {
            user: { select: { name: true, email: true, phone: true } }
          }
        },
        user: { select: { name: true, email: true, phone: true } }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: payouts });
  } catch (error: any) {
    console.error("GET /api/admin/affiliates/payouts error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;
    const body = await req.json();
    const { payoutId, action, payoutTrxId, adminNotes } = body;

    if (!payoutId || !action) {
      return NextResponse.json(
        { error: "payoutId and action are required" },
        { status: 400 }
      );
    }

    const result = await reviewAffiliatePayout({
      payoutId,
      adminEmail: user.email,
      action,
      payoutTrxId,
      adminNotes,
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "REVIEW_AFFILIATE_PAYOUT",
      targetType: "WALLET",
      targetId: payoutId,
      details: { action, payoutTrxId, adminNotes },
    }).catch(err => console.error("Failed to log audit for payout review", err));

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("POST /api/admin/affiliates/payouts error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
