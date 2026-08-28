import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { ingestSupplierStock } from "@/lib/commerce/suppliers";
import { convertCurrencyToBDT } from "@/lib/commerce/costing";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;

    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const supplierId = searchParams.get("supplierId");

    const where: any = {};
    if (productId && productId !== "ALL") where.productId = productId;
    if (supplierId && supplierId !== "ALL") where.supplierId = supplierId;

    const batches = await prisma.inventoryBatch.findMany({
      where,
      orderBy: { purchaseDate: "desc" },
      include: {
        product: { select: { id: true, name: true, minPriceBDT: true } },
        variation: { select: { id: true, name: true, priceBDT: true } },
        supplier: { select: { id: true, name: true, code: true } },
        _count: {
          select: { digitalStocks: true }
        }
      }
    });

    const formattedBatches = batches.map((batch) => {
      const totalCount = batch.totalCount || batch.quantityPurchased || 0;
      const unitCostBDT = batch.unitCostBDT !== null ? batch.unitCostBDT : null;
      const unitPriceBDT = batch.variation?.priceBDT || batch.product?.minPriceBDT || 0;
      const totalCostBDT = batch.totalCostBDT !== null
        ? batch.totalCostBDT
        : (unitCostBDT !== null ? totalCount * unitCostBDT : null);
      
      const margin = unitCostBDT !== null ? unitPriceBDT - unitCostBDT : null;
      const marginPct = unitCostBDT !== null && unitPriceBDT > 0
        ? Math.round(((unitPriceBDT - unitCostBDT) / unitPriceBDT) * 1000) / 10
        : null;

      return {
        id: batch.id,
        batchRef: batch.batchRef,
        productId: batch.productId,
        productName: batch.product?.name || "Unknown Product",
        variationId: batch.variationId,
        variationName: batch.variation?.name || "Standard",
        supplierId: batch.supplierId,
        supplierName: batch.supplier?.name || batch.supplierName || "Direct / Internal",
        supplierCode: batch.supplier?.code || null,
        totalCount,
        quantityPurchased: batch.quantityPurchased || totalCount,
        availableCount: batch.availableCount || 0,
        deliveredCount: batch.deliveredCount || 0,
        replacedCount: batch.replacedCount || 0,
        refundedCount: batch.refundedCount || 0,
        expiredCount: batch.expiredCount || 0,
        invalidCount: (batch.replacedCount || 0) + (batch.refundedCount || 0),
        currency: batch.currency || "BDT",
        exchangeRateToBDT: batch.exchangeRateToBDT || 1.0,
        unitCost: batch.unitCost,
        totalCost: batch.totalCost,
        unitCostBDT,
        totalCostBDT,
        ingestedValueBDT: totalCostBDT,
        unitPriceBDT,
        margin,
        marginPct,
        status: batch.status || (batch.availableCount > 0 ? "ACTIVE" : "DEPLETED"),
        isLocked: batch.isLocked,
        purchaseDate: batch.purchaseDate ? batch.purchaseDate.toISOString() : batch.createdAt.toISOString(),
        expiryDate: batch.expiryDate ? batch.expiryDate.toISOString() : null,
        createdAt: batch.createdAt.toISOString(),
        notes: batch.notes,
      };
    });

    const totalBatches = batches.length;
    const totalIngestedValue = formattedBatches.reduce((acc, b) => acc + (b.totalCostBDT || 0), 0);
    const deliveredStockValue = formattedBatches.reduce((acc, b) => acc + ((b.deliveredCount || 0) * (b.unitCostBDT || 0)), 0);
    const availableStockValue = formattedBatches.reduce((acc, b) => acc + ((b.availableCount || 0) * (b.unitCostBDT || 0)), 0);
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const expiringSoonCount = formattedBatches.filter(b => b.expiryDate && new Date(b.expiryDate) <= threeDaysLater && new Date(b.expiryDate) > now).length;

    return NextResponse.json({ 
      success: true, 
      batches: formattedBatches,
      data: formattedBatches,
      kpi: {
        totalBatches,
        totalIngestedValue: Math.round(totalIngestedValue * 100) / 100,
        availableStockValue: Math.round(availableStockValue * 100) / 100,
        deliveredStockValue: Math.round(deliveredStockValue * 100) / 100,
        expiringSoonCount
      }
    });
  } catch (error: any) {
    console.error("Admin Inventory Batches GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const body = await req.json();
    const {
      supplierId,
      productId,
      variationId,
      batchRef,
      quantity,
      unitCost,
      currency,
      exchangeRateToBDT,
      purchaseDate,
      lines,
      notes,
    } = body;

    if (!supplierId || !productId) {
      return NextResponse.json({ success: false, error: "Supplier ID and Product ID are required." }, { status: 400 });
    }

    const curr = (currency || "BDT").toUpperCase();
    const fxRate = exchangeRateToBDT && Number(exchangeRateToBDT) > 0
      ? Number(exchangeRateToBDT)
      : (curr === "BDT" ? 1.0 : 120.0);

    const unitCostBDT = unitCost !== undefined && unitCost !== null
      ? convertCurrencyToBDT(Number(unitCost), curr, fxRate)
      : null;

    if (Array.isArray(lines) && lines.length > 0) {
      // Ingest batch with credentials
      const result = await ingestSupplierStock({
        supplierId,
        productId,
        variationId: variationId || null,
        batchRef,
        unitCost: unitCost !== undefined && unitCost !== null ? Number(unitCost) : null,
        unitCostBDT,
        currency: curr,
        exchangeRateToBDT: fxRate,
        purchaseDate: purchaseDate || new Date(),
        lines,
        notes,
        createdBy: user.email,
      });

      await logAdminAudit({
        actorId: user.id,
        actorEmail: user.email,
        action: "INVENTORY_BATCH_CREATE_WITH_STOCK",
        targetType: "INVENTORY",
        targetId: result.batchId,
        details: { batchRef: result.batchRef, importedCount: result.importedCount, unitCostBDT }
      });

      return NextResponse.json({ success: true, result });
    }

    // Create empty / received batch without immediate credentials
    const cleanQty = quantity ? Number(quantity) : 0;
    const totalCostBDT = unitCostBDT !== null ? unitCostBDT * cleanQty : null;

    const random4 = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const generatedRef = batchRef || `BATCH-${dateStr}-MANUAL-${random4}`;

    const batch = await prisma.inventoryBatch.create({
      data: {
        batchRef: generatedRef,
        supplierId,
        productId,
        variationId: variationId || null,
        quantityPurchased: cleanQty,
        totalCount: cleanQty,
        availableCount: cleanQty,
        unitCost: unitCost !== undefined && unitCost !== null ? Number(unitCost) : null,
        totalCost: unitCost !== undefined && unitCost !== null ? Number(unitCost) * cleanQty : null,
        currency: curr,
        exchangeRateToBDT: fxRate,
        unitCostBDT,
        totalCostBDT,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        status: "RECEIVED",
        createdBy: user.email,
        notes: notes || null,
      },
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "INVENTORY_BATCH_CREATE",
      targetType: "INVENTORY",
      targetId: batch.id,
      details: { batchRef: batch.batchRef, quantity: cleanQty, unitCostBDT, totalCostBDT }
    });

    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    console.error("Admin Inventory Batches POST Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const {
      id,
      unitCost,
      currency,
      exchangeRateToBDT,
      unitCostBDT,
      notes,
      adminReason,
      updateUnsoldStockOnly,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Batch ID is required" }, { status: 400 });
    }

    const batch = await prisma.inventoryBatch.findUnique({
      where: { id },
      include: {
        digitalStocks: {
          select: { id: true, status: true, costPriceBDT: true }
        }
      }
    });

    if (!batch) {
      return NextResponse.json({ success: false, error: "Batch not found" }, { status: 404 });
    }

    const consumedStocks = batch.digitalStocks.filter((s) => s.status === "DELIVERED" || s.status === "REPLACED");
    const hasConsumedStock = consumedStocks.length > 0;

    // If stock has been consumed, require an explicit reason for cost correction
    if (hasConsumedStock && (!adminReason || adminReason.trim().length < 5)) {
      return NextResponse.json({
        success: false,
        error: "This batch contains delivered inventory. A valid justification reason (at least 5 characters) is required for financial cost correction.",
        requiresReason: true,
        consumedCount: consumedStocks.length,
      }, { status: 400 });
    }

    const curr = (currency || batch.currency || "BDT").toUpperCase();
    const fxRate = exchangeRateToBDT !== undefined && Number(exchangeRateToBDT) > 0
      ? Number(exchangeRateToBDT)
      : (batch.exchangeRateToBDT || 1.0);

    let newUnitCostBDT: number | null = null;
    if (unitCostBDT !== undefined && unitCostBDT !== null) {
      newUnitCostBDT = Number(unitCostBDT);
    } else if (unitCost !== undefined && unitCost !== null) {
      newUnitCostBDT = convertCurrencyToBDT(Number(unitCost), curr, fxRate);
    } else {
      newUnitCostBDT = batch.unitCostBDT;
    }

    const totalQty = batch.totalCount || batch.quantityPurchased || 0;
    const newTotalCostBDT = newUnitCostBDT !== null ? newUnitCostBDT * totalQty : null;

    // Update batch record
    const updatedBatch = await prisma.inventoryBatch.update({
      where: { id },
      data: {
        currency: curr,
        exchangeRateToBDT: fxRate,
        unitCost: unitCost !== undefined ? (unitCost !== null ? Number(unitCost) : null) : batch.unitCost,
        unitCostBDT: newUnitCostBDT,
        totalCostBDT: newTotalCostBDT,
        notes: notes !== undefined ? notes : batch.notes,
      }
    });

    // Update DigitalStock cost basis if requested or for available stocks
    if (newUnitCostBDT !== null) {
      const stockWhere: any = { batchId: id };
      if (updateUnsoldStockOnly) {
        stockWhere.status = { in: ["AVAILABLE", "RESERVED"] };
      }
      await prisma.digitalStock.updateMany({
        where: stockWhere,
        data: { costPriceBDT: newUnitCostBDT }
      });
    }

    // Audit Log the cost correction
    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "INVENTORY_BATCH_COST_CORRECTION",
      targetType: "INVENTORY",
      targetId: batch.id,
      details: {
        batchRef: batch.batchRef,
        previousUnitCostBDT: batch.unitCostBDT,
        newUnitCostBDT,
        consumedCount: consumedStocks.length,
        adminReason: adminReason || "Admin cost update",
      }
    });

    return NextResponse.json({ success: true, batch: updatedBatch });
  } catch (error: any) {
    console.error("Admin Inventory Batches PATCH Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
