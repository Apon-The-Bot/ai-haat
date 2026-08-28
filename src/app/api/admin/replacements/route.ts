import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewReplacementRequest } from "@/lib/commerce/replacements";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const requests = await prisma.replacementRequest.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        order: { select: { orderNumber: true, createdAt: true } },
        orderItem: { select: { productName: true, variationName: true } },
        originalDelivery: {
          select: {
            id: true,
            productName: true,
            accountType: true,
            warrantyExpiresAt: true,
            deliveredAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = requests.map((r) => {
      const isWarrantyValid = r.originalDelivery.warrantyExpiresAt
        ? new Date(r.originalDelivery.warrantyExpiresAt) >= new Date()
        : true;

      return {
        id: r.id,
        orderId: r.orderId,
        orderNumber: r.order.orderNumber,
        customerName: r.user.name || "Customer",
        customerEmail: r.user.email,
        customerPhone: r.user.phone,
        productName: r.originalDelivery.productName,
        variationName: r.originalDelivery.accountType,
        reason: r.reason,
        description: r.description,
        status: r.status,
        adminNotes: r.adminNotes,
        isWarrantyValid,
        warrantyExpiresAt: r.originalDelivery.warrantyExpiresAt
          ? r.originalDelivery.warrantyExpiresAt.toISOString().split("T")[0]
          : "N/A",
        deliveredAt: r.originalDelivery.deliveredAt.toISOString().split("T")[0],
        createdAt: r.createdAt.toISOString().split("T")[0],
      };
    });

    return NextResponse.json({
      success: true,
      requests: formatted,
    });
  } catch (error: any) {
    console.error("[Admin Replacements GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch replacements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { requestId, action, adminNotes, replacementStockId, adminOverride } = body;

    if (!requestId || !action || (action !== "APPROVE" && action !== "REJECT")) {
      return NextResponse.json(
        { error: "Valid requestId and action (APPROVE/REJECT) are required." },
        { status: 400 }
      );
    }

    const result = await reviewReplacementRequest({
      requestId,
      adminEmail: user.email,
      action,
      adminNotes,
      replacementStockId,
      adminOverride,
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: `REPLACEMENT_${action}`,
      targetType: "REPLACEMENT",
      targetId: requestId,
      details: {
        adminOverride,
        replacementStockId,
      },
    });

    return NextResponse.json({
      success: true,
      message: action === "APPROVE" ? "Replacement approved and fulfilled." : "Replacement request rejected.",
      result,
    });
  } catch (error: any) {
    console.error("[Admin Replacement Review Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process replacement" },
      { status: 400 }
    );
  }
}
