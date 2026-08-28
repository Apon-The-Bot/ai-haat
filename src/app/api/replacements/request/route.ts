import { requireAuth } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createReplacementRequest } from "@/lib/commerce/replacements";
import { isSameOriginMutation } from "@/lib/security/csrf";
import { getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const userEmailClean = user.email.toLowerCase().trim();
    const requests = await prisma.replacementRequest.findMany({
      where: {
        OR: [
          { userId: user.id },
          { user: { email: userEmailClean } },
          { order: { customerEmail: userEmailClean } },
        ],
      },
      include: {
        order: { select: { orderNumber: true, id: true } },
        originalDelivery: { select: { id: true, productName: true, accountType: true } },
        replacementDelivery: { select: { id: true, productName: true, accountType: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = requests.map((r) => ({
      id: r.id,
      orderNumber: r.order.orderNumber || r.order.id,
      productName: r.originalDelivery?.productName || "Digital Product",
      accountType: r.originalDelivery?.accountType || "Subscription",
      originalDeliveryId: r.originalDeliveryId,
      replacementDeliveryId: r.replacementDeliveryId,
      reason: r.reason,
      description: r.description,
      status: r.status,
      adminNotes: r.adminNotes || null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      requests: formatted,
    });
  } catch (error: any) {
    console.error("[Replacement GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch replacement claims" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "Cross-site request forgery blocked" }, { status: 403 });
  }

  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  const clientIp = getClientIp(req);
  const limiter = checkRateLimit(`replacement_req:${user.id || clientIp}`, 5, 10 * 60 * 1000);
  if (!limiter.allowed) {
    return rateLimitResponse(limiter.retryAfterMs, "Too many replacement requests. Please wait.");
  }

  try {
    const body = await req.json();
    const { orderId, orderItemId, originalDeliveryId, reason, description } = body;

    if (!orderId || !originalDeliveryId || !reason || !description) {
      return NextResponse.json(
        { error: "Order ID, Delivery ID, Reason, and Description are required." },
        { status: 400 }
      );
    }

    const result = await createReplacementRequest({
      userId: user.id,
      orderId: orderId.trim(),
      orderItemId: orderItemId?.trim() || undefined,
      originalDeliveryId: originalDeliveryId.trim(),
      reason: reason.trim(),
      description: description.trim(),
      autoFulfillIfAvailable: true,
    });

    return NextResponse.json({
      success: true,
      autoReplaced: result.autoReplaced,
      status: result.status,
      message: result.message,
      claimId: result.request.id,
      newDeliveryId: result.newDelivery?.id,
    });
  } catch (error: any) {
    console.error("[Replacement Request POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to submit replacement claim" },
      { status: 400 }
    );
  }
}
