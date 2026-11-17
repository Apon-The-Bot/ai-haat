import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewRefundRequest } from "@/lib/commerce/refund-review";
import { requestAdminApproval } from "@/lib/admin-approvals";
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
    const { refundId, approvedAmount, adminNotes, customerMessage, payoutTrxId, gatewayRef } = body;
    const action = body.action === "PROCESS_MANUAL" ? "COMPLETE_MANUAL" : body.action;

    if (typeof refundId !== "string" || !refundId || refundId.length > 64 ||
      !["APPROVE", "REJECT", "PROCESS_WALLET", "COMPLETE_MANUAL"].includes(action) ||
      [adminNotes, customerMessage, payoutTrxId, gatewayRef].some(
        (value) => value != null && (typeof value !== "string" || value.length > 2000)
      ) ||
      [payoutTrxId, gatewayRef].some((value) => typeof value === "string" && value.length > 191)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action !== "REJECT") {
      const refund = await prisma.refund.findUnique({ where: { id: refundId } });
      if (!refund || !["REQUESTED", "UNDER_REVIEW", "APPROVED"].includes(refund.status) ||
        (action === "APPROVE" && refund.status === "APPROVED") ||
        (action === "PROCESS_WALLET" && refund.refundMethod !== "WALLET") ||
        (action === "COMPLETE_MANUAL" && (refund.status !== "APPROVED" || refund.refundMethod === "WALLET" ||
          !payoutTrxId?.trim()))) {
        return NextResponse.json({ error: "This refund is not eligible for the selected action." }, { status: 409 });
      }
      const amount = approvedAmount ?? refund.approvedAmountBDT ?? refund.requestedAmountBDT;
      if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0.01 ||
        amount > (refund.approvedAmountBDT ?? refund.requestedAmountBDT)) {
        return NextResponse.json({ error: "Invalid refund amount." }, { status: 400 });
      }
      const approvalId = await requestAdminApproval(user, {
        kind: "REFUND",
        input: { refundId, action, approvedAmount: Math.round(amount * 100) / 100, adminNotes,
          customerMessage, payoutTrxId: payoutTrxId?.trim(), gatewayRef },
        version: refund.updatedAt.toISOString(),
      });
      return NextResponse.json({ success: true, pendingApproval: true, approvalId }, { status: 202 });
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
