import { prisma } from "@/lib/prisma";
import { encryptCredential } from "@/lib/mfa/crypto";
import { StockType } from "@prisma/client";
import { computeStockFingerprint } from "@/lib/commerce/inventory";
import { convertCurrencyToBDT } from "@/lib/commerce/costing";
import { sendSupplierIngestionTelegramAlert } from "@/utils/telegram";

export interface IngestSupplierStockParams {
  supplierId: string;
  productId: string;
  variationId?: string | null;
  type?: StockType;
  lines?: string[];
  items?: Array<{ payload: string; costPrice?: number | null; costPriceBDT?: number | null; expiryDate?: string }>;
  batchRef?: string;
  unitCost?: number | null;
  unitCostBDT?: number | null;
  currency?: string;
  exchangeRateToBDT?: number | null;
  purchaseDate?: Date | string;
  notes?: string;
  ipAddress?: string;
  createdBy?: string;
}

import { safeEqualSecret } from "@/lib/cron-auth";

export async function validateSupplierAuth(apiKey: string, apiSecret?: string) {
  if (!apiKey || typeof apiKey !== "string") {
    return { isValid: false, error: "Missing or invalid API key" };
  }

  const supplier = await prisma.supplier.findUnique({
    where: { apiKey: apiKey.trim() }
  });

  if (!supplier || !supplier.isActive || supplier.status === "BLOCKED") {
    return { isValid: false, error: "Invalid, blocked or inactive supplier" };
  }

  // If supplier has an apiSecret configured in DB, incoming request MUST provide a valid matching secret
  if (supplier.apiSecret && supplier.apiSecret.trim()) {
    if (!apiSecret || typeof apiSecret !== "string") {
      return { isValid: false, error: "Missing required API secret (X-Supplier-Secret)" };
    }

    if (!safeEqualSecret(apiSecret.trim(), supplier.apiSecret.trim())) {
      return { isValid: false, error: "Invalid API secret" };
    }
  }

  return { isValid: true, supplier };
}

export async function ingestSupplierStock(params: IngestSupplierStockParams) {
  const supplier = await prisma.supplier.findUnique({ where: { id: params.supplierId } });
  if (!supplier) throw new Error("Supplier not found");

  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: { productSuppliers: true }
  });
  if (!product) throw new Error("Product not found");

  let variationName: string | undefined = undefined;
  if (params.variationId) {
    const variation = await prisma.variation.findUnique({ where: { id: params.variationId } });
    if (variation) variationName = variation.name;
  }

  const currency = (params.currency || "BDT").toUpperCase();
  const exchangeRate = params.exchangeRateToBDT && params.exchangeRateToBDT > 0
    ? params.exchangeRateToBDT
    : (currency === "BDT" ? 1.0 : 120.0);

  // Preferred supplier mapping fallback for default cost if not passed in params
  const mapping = product.productSuppliers?.find(
    (m) => m.supplierId === supplier.id && (params.variationId ? m.variationId === params.variationId : !m.variationId)
  );

  let defaultEffectiveUnitCostBDT: number | null = null;
  if (params.unitCostBDT !== undefined && params.unitCostBDT !== null) {
    defaultEffectiveUnitCostBDT = Number(params.unitCostBDT);
  } else if (params.unitCost !== undefined && params.unitCost !== null) {
    defaultEffectiveUnitCostBDT = convertCurrencyToBDT(params.unitCost, currency, exchangeRate);
  } else if (mapping?.defaultCost !== undefined && mapping?.defaultCost !== null) {
    defaultEffectiveUnitCostBDT = convertCurrencyToBDT(mapping.defaultCost, mapping.currency || "BDT", exchangeRate);
  } else if (product.costPriceBDT !== null && product.costPriceBDT !== undefined) {
    defaultEffectiveUnitCostBDT = Number(product.costPriceBDT);
  }

  const random4 = Math.floor(1000 + Math.random() * 9000);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const defaultBatchRef = `BATCH-${dateStr}-${supplier.code}-${random4}`;
  const batchRefToUse = params.batchRef || defaultBatchRef;

  const purchaseDate = params.purchaseDate ? new Date(params.purchaseDate) : new Date();

  const batch = await prisma.inventoryBatch.upsert({
    where: { batchRef: batchRefToUse },
    update: {},
    create: {
      batchRef: batchRefToUse,
      supplierId: supplier.id,
      supplierName: supplier.name,
      productId: params.productId,
      variationId: params.variationId || null,
      unitCost: params.unitCost !== undefined ? params.unitCost : null,
      currency,
      exchangeRateToBDT: exchangeRate,
      unitCostBDT: defaultEffectiveUnitCostBDT,
      purchaseDate,
      status: "RECEIVED",
      createdBy: params.createdBy || null,
      notes: params.notes || "Supplier Ingestion Batch",
    }
  });

  let importedCount = 0;
  let duplicateCount = 0;
  let invalidCount = 0;
  let batchTotalCostBDT = 0;
  let hasValidCost = false;

  // Process items
  const normalizedItems: Array<{ payload: string; costPriceBDT?: number | null; expiryDate?: Date }> = [];

  if (params.lines && params.lines.length > 0) {
    for (const line of params.lines) {
      if (line.trim().length >= 3) {
        normalizedItems.push({
          payload: line.trim(),
          costPriceBDT: defaultEffectiveUnitCostBDT,
        });
      } else {
        invalidCount++;
      }
    }
  }

  if (params.items && params.items.length > 0) {
    for (const item of params.items) {
      if (item.payload.trim().length >= 3) {
        let itemCostBDT = defaultEffectiveUnitCostBDT;
        if (item.costPriceBDT !== undefined && item.costPriceBDT !== null) {
          itemCostBDT = Number(item.costPriceBDT);
        } else if (item.costPrice !== undefined && item.costPrice !== null) {
          itemCostBDT = convertCurrencyToBDT(item.costPrice, currency, exchangeRate);
        }
        normalizedItems.push({
          payload: item.payload.trim(),
          costPriceBDT: itemCostBDT,
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined
        });
      } else {
        invalidCount++;
      }
    }
  }

  const existingStocks = await prisma.digitalStock.findMany({
    where: {
      productId: params.productId,
      status: { in: ["AVAILABLE", "RESERVED", "DELIVERED"] }
    },
    select: { fingerprint: true }
  });

  const existingFingerprints = new Set(existingStocks.map(s => s.fingerprint).filter(Boolean));
  const seenInBatch = new Set<string>();

  for (const item of normalizedItems) {
    const fingerprint = computeStockFingerprint(item.payload);

    if (existingFingerprints.has(fingerprint) || seenInBatch.has(fingerprint)) {
      duplicateCount++;
      continue;
    }

    seenInBatch.add(fingerprint);

    const encrypted = encryptCredential(item.payload);
    const itemCost = item.costPriceBDT !== undefined ? item.costPriceBDT : defaultEffectiveUnitCostBDT;

    await prisma.digitalStock.create({
      data: {
        productId: params.productId,
        variationId: params.variationId || null,
        type: params.type || "LICENSE_KEY",
        payloadEncrypted: encrypted,
        fingerprint,
        batchRef: batchRefToUse,
        costPriceBDT: itemCost,
        expiryDate: item.expiryDate || null,
        status: "AVAILABLE",
        notes: params.notes || null,
        supplierId: supplier.id,
        batchId: batch.id
      }
    });

    importedCount++;
    if (itemCost !== null && itemCost !== undefined) {
      hasValidCost = true;
      batchTotalCostBDT += itemCost;
    }
    existingFingerprints.add(fingerprint);
  }

  const totalProcessed = normalizedItems.length + invalidCount;

  // Update batch counters and financials
  const finalTotalCostBDT = hasValidCost ? batchTotalCostBDT : (defaultEffectiveUnitCostBDT !== null ? defaultEffectiveUnitCostBDT * importedCount : null);
  const finalUnitCostBDT = importedCount > 0 && finalTotalCostBDT !== null ? finalTotalCostBDT / importedCount : defaultEffectiveUnitCostBDT;

  await prisma.inventoryBatch.update({
    where: { id: batch.id },
    data: {
      quantityPurchased: { increment: importedCount },
      totalCount: { increment: importedCount },
      availableCount: { increment: importedCount },
      totalCostBDT: finalTotalCostBDT !== null ? { increment: finalTotalCostBDT } : undefined,
      unitCostBDT: finalUnitCostBDT !== null ? { set: finalUnitCostBDT } : undefined,
    }
  });

  // Log webhook
  await prisma.supplierWebhookLog.create({
    data: {
      supplierId: supplier.id,
      batchRef: batchRefToUse,
      ipAddress: params.ipAddress,
      status: importedCount > 0 ? (duplicateCount > 0 ? "PARTIAL" : "SUCCESS") : "FAILED",
      itemsTotal: totalProcessed,
      itemsAdded: importedCount,
      itemsSkipped: duplicateCount + invalidCount
    }
  });

  // Telegram Alert (sanitized, no credentials)
  if (importedCount > 0) {
    await sendSupplierIngestionTelegramAlert({
      supplierName: supplier.name,
      supplierCode: supplier.code,
      productName: product.name,
      variationName,
      batchRef: batchRefToUse,
      itemsAdded: importedCount,
      itemsSkipped: duplicateCount + invalidCount,
      unitCostBDT: finalUnitCostBDT !== null ? finalUnitCostBDT : undefined
    }).catch(console.error);
  }

  return {
    success: true,
    batchId: batch.id,
    batchRef: batchRefToUse,
    totalProcessed,
    importedCount,
    duplicateCount,
    invalidCount,
    unitCostBDT: finalUnitCostBDT,
    totalCostBDT: finalTotalCostBDT,
  };
}

/**
 * Get factual performance analytics per supplier
 */
export async function getSupplierPerformanceMetrics(supplierId?: string) {
  const whereSupplier: any = supplierId ? { id: supplierId } : {};

  const suppliers = await prisma.supplier.findMany({
    where: whereSupplier,
    include: {
      batches: {
        orderBy: { createdAt: "desc" }
      },
      digitalStocks: {
        select: {
          id: true,
          status: true,
          costPriceBDT: true,
          assignedOrderId: true,
          replacementRequests: { select: { id: true, status: true } }
        }
      },
      productSuppliers: {
        include: {
          product: { select: { id: true, name: true } },
          variation: { select: { id: true, name: true } }
        }
      }
    }
  });

  return suppliers.map((sup) => {
    const totalUnits = sup.digitalStocks.length;
    const availableUnits = sup.digitalStocks.filter((s) => s.status === "AVAILABLE").length;
    const reservedUnits = sup.digitalStocks.filter((s) => s.status === "RESERVED").length;
    const deliveredUnits = sup.digitalStocks.filter((s) => s.status === "DELIVERED").length;
    const replacedUnits = sup.digitalStocks.filter((s) => s.status === "REPLACED").length;
    const invalidUnits = sup.digitalStocks.filter((s) => s.status === "INVALID").length;
    const expiredUnits = sup.digitalStocks.filter((s) => s.status === "EXPIRED").length;

    // Financial spend from batches
    const totalProcurementSpendBDT = sup.batches.reduce(
      (sum, b) => sum + (b.totalCostBDT || ((b.totalCount || 0) * (b.unitCostBDT || 0))),
      0
    );

    // Available Inventory Valuation
    const availableInventoryValueBDT = sup.digitalStocks
      .filter((s) => s.status === "AVAILABLE" && s.costPriceBDT !== null)
      .reduce((sum, s) => sum + Number(s.costPriceBDT || 0), 0);

    // Average unit acquisition cost
    const stocksWithCost = sup.digitalStocks.filter((s) => s.costPriceBDT !== null);
    const avgAcquisitionCostBDT = stocksWithCost.length > 0
      ? Math.round((stocksWithCost.reduce((sum, s) => sum + Number(s.costPriceBDT || 0), 0) / stocksWithCost.length) * 100) / 100
      : (sup.batches.length > 0 && sup.batches[0].unitCostBDT !== null ? sup.batches[0].unitCostBDT : null);

    // Factual Quality Indicators
    const invalidRatePct = totalUnits > 0
      ? Math.round((invalidUnits / totalUnits) * 1000) / 10
      : 0;

    const replacementRatePct = deliveredUnits + replacedUnits > 0
      ? Math.round((replacedUnits / (deliveredUnits + replacedUnits)) * 1000) / 10
      : 0;

    const lastPurchaseDate = sup.batches.length > 0 && sup.batches[0].purchaseDate
      ? sup.batches[0].purchaseDate.toISOString()
      : (sup.createdAt.toISOString());

    return {
      id: sup.id,
      name: sup.name,
      code: sup.code,
      contactName: sup.contactName,
      contactEmail: sup.contactEmail,
      contactPhone: sup.contactPhone,
      telegram: sup.telegram,
      website: sup.website,
      status: sup.status || (sup.isActive ? "ACTIVE" : "INACTIVE"),
      isActive: sup.isActive,
      notes: sup.notes,
      productsMappedCount: sup.productSuppliers.length,
      productMappings: sup.productSuppliers,
      activeBatchesCount: sup.batches.filter((b) => (b.availableCount || 0) > 0).length,
      totalBatchesCount: sup.batches.length,
      totalUnitsPurchased: totalUnits,
      availableUnits,
      reservedUnits,
      deliveredUnits,
      replacedUnits,
      invalidUnits,
      expiredUnits,
      totalProcurementSpendBDT: Math.round(totalProcurementSpendBDT * 100) / 100,
      availableInventoryValueBDT: Math.round(availableInventoryValueBDT * 100) / 100,
      avgAcquisitionCostBDT,
      invalidRatePct,
      replacementRatePct,
      lastPurchaseDate,
      createdAt: sup.createdAt.toISOString(),
    };
  });
}
