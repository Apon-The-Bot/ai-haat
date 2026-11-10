import { requireAdminMfa, requireRecentMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { logUserActivity } from "@/lib/user-control/user-control-service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user: currentAdmin } = auth;

  // Revealing customer digital secrets requires recent Step-Up MFA verification
  const stepUp = await requireRecentMfa(5);
  if (stepUp instanceof NextResponse) return stepUp;

  try {
    const { id: userId } = await params;
    const body = await req.json();
    const { deliveredKeyId, reason } = body;

    if (!deliveredKeyId) {
      return NextResponse.json({ error: "deliveredKeyId is required" }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "A mandatory justification reason must be logged to inspect customer credentials" },
        { status: 400 }
      );
    }

    const deliveredKey = await prisma.deliveredKey.findUnique({
      where: { id: deliveredKeyId },
      include: {
        order: { select: { orderNumber: true, customerEmail: true } },
      },
    });

    if (!deliveredKey || deliveredKey.userId !== userId) {
      return NextResponse.json({ error: "Delivered key record not found for this customer" }, { status: 404 });
    }

    const secretValue = deliveredKey.credentials || "Credentials Encrypted";

    // Immutable High-Priority Audit Log
    await logAdminAudit({
      actorId: currentAdmin.id,
      actorEmail: currentAdmin.email,
      action: "CREDENTIAL_REVEALED_BY_ADMIN",
      targetType: "DELIVERED_KEY",
      targetId: deliveredKey.id,
      details: {
        userId,
        orderNumber: deliveredKey.order?.orderNumber,
        productName: deliveredKey.productName,
        accountType: deliveredKey.accountType,
        reason: reason.trim(),
        warning: "Sensitive customer digital secret revealed to administrator",
      },
    });

    // Log User Security Event
    await logUserActivity({
      userId,
      eventType: "CREDENTIAL_INSPECTED_BY_STAFF",
      category: "SECURITY",
      description: `Customer digital credential for "${deliveredKey.productName}" inspected by staff (${currentAdmin.email}). Reason: ${reason.trim()}`,
      metadata: { orderNumber: deliveredKey.order?.orderNumber },
    });

    return NextResponse.json({
      success: true,
      deliveredKeyId: deliveredKey.id,
      productName: deliveredKey.productName,
      accountType: deliveredKey.accountType,
      secretValue,
      instructions: deliveredKey.instructions || null,
      revealedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Admin Reveal Credential Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to reveal credential" }, { status: 500 });
  }
}
