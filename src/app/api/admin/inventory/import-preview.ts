import { Prisma, StockType } from "@prisma/client";
import { computeStockFingerprint } from "@/lib/commerce/inventory";
import { prisma } from "@/lib/prisma";

export class StockImportValidationError extends Error {}

export async function planStockImport(input: Record<string, unknown>, db: Prisma.TransactionClient = prisma) {
  const { productId, variationId, type, lines, costPriceBDT, batchRef, notes } = input;
  if (typeof productId !== "string" || !productId.trim()) throw new StockImportValidationError("Select a product.");
  if (variationId != null && typeof variationId !== "string") throw new StockImportValidationError("Invalid variation.");
  if (type !== undefined && !Object.values(StockType).some((value) => value === type)) {
    throw new StockImportValidationError("Invalid stock type.");
  }
  if (costPriceBDT != null && (
    !["number", "string"].includes(typeof costPriceBDT) ||
    !Number.isFinite(Number(costPriceBDT)) || Number(costPriceBDT) < 0
  )) throw new StockImportValidationError("Unit cost must be a non-negative number.");
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 1000) {
    throw new StockImportValidationError("Provide between 1 and 1,000 lines per import.");
  }
  if ((batchRef != null && typeof batchRef !== "string") || (notes != null && typeof notes !== "string")) {
    throw new StockImportValidationError("Invalid batch reference or notes.");
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { variations: { select: { id: true } } },
  });
  if (!product) throw new StockImportValidationError("Product not found.");
  if (variationId && !product.variations.some((variation) => variation.id === variationId)) {
    throw new StockImportValidationError("This variation does not belong to the selected product.");
  }
  if (product.variations.length && !variationId) {
    throw new StockImportValidationError("Select a variation for this product.");
  }

  const rows = lines.map((line: unknown) => {
    const value = typeof line === "string" ? line.trim() : null;
    return {
      value,
      fingerprint: value && value.length >= 3 && value.length <= 4000
        ? computeStockFingerprint(value)
        : null,
    };
  });
  const fingerprints = Array.from(new Set(rows.flatMap(({ fingerprint }) => fingerprint ? [fingerprint] : [])));
  const existing = fingerprints.length ? await db.digitalStock.findMany({
    where: {
      productId,
      fingerprint: { in: fingerprints },
      status: { in: ["AVAILABLE", "RESERVED", "DELIVERED"] },
    },
    select: { fingerprint: true },
  }) : [];
  const stored = new Set(existing.map(({ fingerprint }) => fingerprint));
  const seen = new Set<string>();
  const issues: { row: number; reason: string }[] = [];
  const validRows: { value: string; fingerprint: string }[] = [];
  let duplicateCount = 0;
  let invalidCount = 0;

  rows.forEach(({ value, fingerprint }, index) => {
    if (value === "") return;
    const row = index + 1;
    if (!fingerprint || !value) {
      invalidCount++;
      issues.push({ row, reason: "Payload must be text with 3–4,000 characters." });
    } else if (stored.has(fingerprint) || seen.has(fingerprint)) {
      duplicateCount++;
      issues.push({ row, reason: stored.has(fingerprint) ? "Already in stock" : "Repeated in this import" });
    } else {
      validRows.push({ value, fingerprint });
      seen.add(fingerprint);
    }
  });

  return {
    productId,
    variationId: variationId || null,
    type: (type ?? StockType.LICENSE_KEY) as StockType,
    batchRef: batchRef || null,
    notes: notes || null,
    costPriceBDT: costPriceBDT == null ? null : Number(costPriceBDT),
    validRows,
    preview: { validCount: validRows.length, duplicateCount, invalidCount, issues },
  };
}
