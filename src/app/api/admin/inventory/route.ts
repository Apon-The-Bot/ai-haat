import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addStockItem, bulkImportStock } from "@/lib/commerce/inventory";
import { Prisma, StockType, StockStatus } from "@prisma/client";
import { planStockImport, StockImportValidationError } from "./import-preview";
import { commitReviewedStock } from "./commit-import";
import { getVariationStock } from "./variation-stock";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") as StockStatus | null;
    const productFilter = searchParams.get("productId");
    const variationFilter = searchParams.get("variationId");

    const summary = await getVariationStock();

    const whereClause: any = {};
    if (statusFilter && statusFilter !== ("ALL" as any)) {
      whereClause.status = statusFilter;
    }
    if (productFilter && productFilter !== "ALL") {
      whereClause.productId = productFilter;
    }
    if (variationFilter !== null) whereClause.variationId = variationFilter || null;

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

  let reviewed = false;
  try {
    const body = await req.json();
    reviewed = body?.dryRun === true || body?.reviewedImport === true;
    const { productId, variationId, type, payload, lines, batchRef, costPriceBDT, notes } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    if (body.dryRun === true) {
      const { preview } = await planStockImport(body);
      return NextResponse.json({ success: true, preview });
    }

    if (body.reviewedImport === true) {
      try {
        const { importedCount, preview } = await commitReviewedStock(body);
        if (!importedCount) {
          return NextResponse.json({ success: false, error: "Review the import rows again.", preview }, { status: 400 });
        }
        return NextResponse.json({
          success: true,
          details: { importedCount, duplicateCount: preview.duplicateCount, invalidCount: preview.invalidCount },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          const conflict = error.code === "P2034";
          return NextResponse.json({
            success: false,
            error: conflict ? "Stock changed during import. Preview again before retrying." : "Could not save stock.",
          }, { status: conflict ? 409 : 500 });
        }
        throw error;
      }
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
    if (reviewed) {
      const validation = error instanceof StockImportValidationError;
      return NextResponse.json({
        success: false,
        error: validation ? error.message : "Could not process stock import.",
      }, { status: validation ? 400 : 500 });
    }
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
