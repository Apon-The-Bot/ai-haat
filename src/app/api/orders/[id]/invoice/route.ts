import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { generateOrderInvoicePDF } from "@/lib/invoicing/pdf-generator";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Ownership check: If order has userId, verify caller is owner or admin
    if (order.userId) {
      const auth = await requireAuth();
      if (auth instanceof NextResponse) {
        return auth;
      }
      if (auth.user.id !== order.userId && auth.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized access to invoice" }, { status: 403 });
      }
    } else {
      // Guest order verification: verify caller email matches if provided
      const emailParam = req.nextUrl.searchParams.get("email");
      if (emailParam && emailParam.toLowerCase().trim() !== order.customerEmail.toLowerCase().trim()) {
        return NextResponse.json({ error: "Unauthorized access to invoice" }, { status: 403 });
      }
    }

    const pdfBuffer = await generateOrderInvoicePDF({
      orderId: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || undefined,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      trxId: order.trxId || undefined,
      items: order.items.map((it) => ({
        name: it.productName,
        variation: it.variationName,
        quantity: it.quantity,
        unitPriceBDT: it.priceBDT,
        totalBDT: it.priceBDT * it.quantity,
      })),
      subtotalBDT: order.subtotalBDT,
      discountBDT: order.discountBDT,
      totalBDT: order.totalBDT,
    });

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${order.orderNumber}.pdf"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    console.error("Invoice generation error:", err);
    return NextResponse.json({ error: "Failed to generate invoice PDF" }, { status: 500 });
  }
}
