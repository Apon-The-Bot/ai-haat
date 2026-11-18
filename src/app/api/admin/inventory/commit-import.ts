import { Prisma } from "@prisma/client";
import { notifyWaitingCustomersForProduct } from "@/lib/commerce/stock-waitlist";
import { encryptCredential } from "@/lib/mfa/crypto";
import { prisma } from "@/lib/prisma";
import { planStockImport } from "./import-preview";

export async function commitReviewedStock(input: Record<string, unknown>) {
  const result = await prisma.$transaction(async (tx) => {
    const { validRows, preview, ...target } = await planStockImport(input, tx);
    if (preview.invalidCount || !preview.validCount) return { preview, importedCount: 0 };

    const { count } = await tx.digitalStock.createMany({
      data: validRows.map(({ value, fingerprint }) => ({
        ...target,
        fingerprint,
        payloadEncrypted: encryptCredential(value),
        status: "AVAILABLE",
      })),
    });
    return { preview, importedCount: count, target };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  if (result.target && result.importedCount) {
    const { productId, variationId } = result.target;
    notifyWaitingCustomersForProduct(productId, variationId).catch((error) => {
      console.error("[StockWaitlist] Reviewed import notification failed", error);
    });
  }
  return result;
}
