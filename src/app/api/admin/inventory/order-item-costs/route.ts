import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { convertCurrencyToBDT } from "@/lib/commerce/costing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const orderItemId = searchParams.get("orderItemId");
    const orderId = searchParams.get("orderId");

    const where: any = {};
    if (orderItemId) where.orderItemId = orderItemId;
    if (orderId) where.orderItem = { orderId };

    const costs = await prisma.orderItemCost.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true, code: true } },
        orderItem: {
          select: {
            id: true,
            orderId: true,
            productName: true,
            variationName: true,
            priceBDT: true,
            quantity: true,
            order: { select: { orderNumber: true, customerEmail: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, costs });
  } catch (error: any) {
    console.error("OrderItemCosts GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const {
      orderItemId,
      supplierId,
      costAmount,
      currency,
      exchangeRateToBDT,
      reference,
      notes,
    } = await req.json();

    if (!orderItemId || costAmount === undefined || costAmount === null) {
      return NextResponse.json({ success: false, error: "OrderItem ID and Cost Amount are required." }, { status: 400 });
    }

    const orderItem = await prisma.orderItem.findUnique({ where: { id: orderItemId } });
    if (!orderItem) {
      return NextResponse.json({ success: false, error: "OrderItem not found." }, { status: 404 });
    }

    const curr = (currency || "BDT").toUpperCase();
    const fxRate = exchangeRateToBDT && Number(exchangeRateToBDT) > 0
      ? Number(exchangeRateToBDT)
      : (curr === "BDT" ? 1.0 : 120.0);

    const costBDT = convertCurrencyToBDT(Number(costAmount), curr, fxRate) || 0;

    const record = await prisma.orderItemCost.create({
      data: {
        orderItemId,
        supplierId: supplierId || null,
        costAmount: Number(costAmount),
        currency: curr,
        exchangeRateToBDT: fxRate,
        costBDT,
        reference: reference || null,
        notes: notes || null,
        recordedBy: user.email,
      },
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "ORDER_ITEM_COST_RECORDED",
      targetType: "ORDER",
      targetId: orderItemId,
      details: { orderItemId, costBDT, currency: curr, reference },
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error("OrderItemCosts POST Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Cost record ID is required." }, { status: 400 });
    }

    await prisma.orderItemCost.delete({ where: { id } });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "ORDER_ITEM_COST_DELETED",
      targetType: "ORDER",
      targetId: id,
    });

    return NextResponse.json({ success: true, message: "Cost record deleted." });
  } catch (error: any) {
    console.error("OrderItemCosts DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
