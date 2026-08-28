import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewRefundRequest } from "@/lib/commerce/refunds";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query = searchParams.get("query") || searchParams.get("search");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    if (query) {
      where.OR = [
        { order: { orderNumber: { contains: query } } },
        { order: { customerEmail: { contains: query } } },
        { orderItem: { productName: { contains: query } } }
      ];
    }

    const refunds = await prisma.refund.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true } },
        orderItem: { select: { productName: true, variationName: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, refunds });
  } catch (error) {
    console.error("[Admin Refunds GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch refunds" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { refundId, action, approvedAmount, adminNotes, customerMessage, payoutTrxId, gatewayRef } = body;

    if (!refundId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await reviewRefundRequest({
      refundId,
      adminEmail: user.email,
      action,
      approvedAmount,
      adminNotes,
      customerMessage,
      payoutTrxId,
      gatewayRef
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: `REFUND_${action}`,
      targetType: "REFUND",
      targetId: refundId,
      details: {
        approvedAmount,
        payoutTrxId
      }
    });

    return NextResponse.json({ success: true, refund: result });
  } catch (error: any) {
    console.error("[Admin Refunds POST Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to process refund" }, { status: 400 });
  }
}
