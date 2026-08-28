import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRefundRequest } from "@/lib/commerce/refunds";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const claims = await prisma.refund.findMany({
      where: {
        OR: [
          { userId: user.id },
          { order: { customerEmail: user.email.toLowerCase() } }
        ]
      },
      include: {
        order: { select: { orderNumber: true } },
        orderItem: { select: { productName: true, variationName: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, refunds: claims });
  } catch (error) {
    console.error("[Refunds GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch refunds" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { orderId, orderItemId, reason, description, refundMethod, payoutPhone } = body;

    if (!orderId || !reason || !refundMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await createRefundRequest({
      userId: user.id,
      orderId: String(orderId).trim(),
      orderItemId: orderItemId && typeof orderItemId === "string" ? orderItemId.trim() : null,
      reason: String(reason).trim(),
      description: typeof description === "string" ? description : "",
      refundMethod,
      payoutPhone: payoutPhone && typeof payoutPhone === "string" ? payoutPhone.trim() : null,
    });

    return NextResponse.json({ success: true, refundId: result.id });
  } catch (error: any) {
    console.error("[Refunds POST Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to submit request" }, { status: 400 });
  }
}
