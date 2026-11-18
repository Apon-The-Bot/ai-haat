import type { Prisma } from "@prisma/client";
import { decryptCredential } from "@/lib/mfa/crypto";
import { approvalDigest } from "@/lib/admin-approvals";

export function stockVersion(rows: { id: string; updatedAt: Date }[]) {
  return approvalDigest(rows.map(({ id, updatedAt }) => [id, updatedAt]));
}

export async function approvedStockExport(tx: Prisma.TransactionClient, stockIds: string[], version: string) {
  const items = await tx.digitalStock.findMany({
    where: { id: { in: stockIds } },
    include: {
      product: { select: { name: true, slug: true } },
      variation: { select: { name: true } },
      order: { select: { orderNumber: true, customerEmail: true } },
    },
    orderBy: { id: "asc" },
  });

  if (items.length !== stockIds.length || stockVersion(items) !== version) {
    throw new Error("Stock changed since submission. Request a new export.");
  }
  return items.map((item) => {
    let plaintextPayload = "";
    try {
      plaintextPayload = decryptCredential(item.payloadEncrypted);
    } catch {
      plaintextPayload = "[Encrypted/Unreadable]";
    }

    return {
      id: item.id,
      productName: item.product.name,
      variationName: item.variation?.name || "Standard",
      type: item.type,
      status: item.status,
      batchRef: item.batchRef || "",
      costPriceBDT: item.costPriceBDT !== null && item.costPriceBDT !== undefined ? item.costPriceBDT : "",
      credentialOrPayload: plaintextPayload,
      assignedOrder: item.order?.orderNumber || "",
      customerEmail: item.order?.customerEmail || "",
      deliveredAt: item.deliveredAt ? item.deliveredAt.toISOString() : "",
      createdAt: item.createdAt.toISOString(),
    };
  });
}
