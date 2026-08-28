import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addStockItem, bulkImportStock, getStockSummary } from "@/lib/commerce/inventory";
import { StockType, StockStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") as StockStatus | null;
    const productFilter = searchParams.get("productId");

    const summary = await getStockSummary();

    const whereClause: any = {};
    if (statusFilter && statusFilter !== ("ALL" as any)) {
      whereClause.status = statusFilter;
    }
    if (productFilter && productFilter !== "ALL") {
      whereClause.productId = productFilter;
    }

    const recentStocks = await prisma.digitalStock.findMany({
      where: whereClause,
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, slug: true } },
        variation: { select: { name: true } },
        order: { select: { orderNumber: true, customerEmail: true } },
      },
    });

    const formattedRecent = recentStocks.map((s) => ({
      id: s.id,
      productId: s.productId,
      productName: s.product.name,
      variationName: s.variation?.name || "Standard",
      type: s.type,
      status: s.status,
      batchRef: s.batchRef,
      costPriceBDT: s.costPriceBDT,
      assignedOrder: s.order?.orderNumber || null,
      customerEmail: s.order?.customerEmail || null,
      deliveredAt: s.deliveredAt ? s.deliveredAt.toISOString().split("T")[0] : null,
      createdAt: s.createdAt.toISOString().split("T")[0],
    }));

    return NextResponse.json({
      success: true,
      summary,
      recentStocks: formattedRecent,
    });
  } catch (error: any) {
    console.error("[Admin Inventory GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { productId, variationId, type, payload, lines, batchRef, costPriceBDT, notes } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (Array.isArray(lines) && lines.length > 0) {
      // Bulk import with duplicate detection
      const result = await bulkImportStock({
        productId,
        variationId: variationId || null,
        type: type as StockType,
        lines,
        batchRef,
        costPriceBDT: costPriceBDT ? Number(costPriceBDT) : undefined,
        notes,
      });

      return NextResponse.json({
        success: true,
        message: `${result.importedCount} items imported. ${result.duplicateCount} duplicates skipped.`,
        details: result,
      });
    }

    if (!payload || !payload.trim()) {
      return NextResponse.json({ error: "Stock payload (license key or login) is required." }, { status: 400 });
    }

    // Single item import
    const item = await addStockItem({
      productId,
      variationId: variationId || null,
      type: type as StockType,
      payload,
      batchRef,
      costPriceBDT: costPriceBDT ? Number(costPriceBDT) : undefined,
      notes,
    });

    return NextResponse.json({
      success: true,
      message: "Stock item added successfully.",
      itemId: item.id,
    });
  } catch (error: any) {
    console.error("[Admin Inventory POST Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to add stock" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Stock item ID is required" }, { status: 400 });
    }

    const stock = await prisma.digitalStock.findUnique({ where: { id } });
    if (!stock) {
      return NextResponse.json({ error: "Stock item not found" }, { status: 404 });
    }

    if (stock.status === "DELIVERED") {
      return NextResponse.json(
        { error: "Delivered stock cannot be deleted. History must be preserved." },
        { status: 400 }
      );
    }

    await prisma.digitalStock.update({
      where: { id },
      data: { status: "INVALID" },
    });

    return NextResponse.json({ success: true, message: "Stock item marked as INVALID." });
  } catch (error: any) {
    console.error("[Admin Inventory DELETE Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to invalidate stock" }, { status: 500 });
  }
}
