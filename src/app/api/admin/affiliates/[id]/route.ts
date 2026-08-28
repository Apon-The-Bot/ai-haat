import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;

    const { user } = auth;
    const affiliateId = params.id;
    const body = await req.json();
    const { tier, customRatePercent, status } = body;

    const updated = await prisma.affiliateProfile.update({
      where: { id: affiliateId },
      data: {
        ...(tier && { tier }),
        ...(customRatePercent !== undefined && { customRatePercent }),
        ...(status && { status })
      }
    });

    // Log admin audit
    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "UPDATE_AFFILIATE",
      targetType: "USER",
      targetId: affiliateId,
      details: { tier, customRatePercent, status },
    }).catch(err => console.error("Audit log error:", err));

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH /api/admin/affiliates/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
