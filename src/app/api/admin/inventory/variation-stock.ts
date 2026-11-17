import { prisma } from "@/lib/prisma";

export async function getVariationStock() {
  const now = new Date();
  const [products, stock, expired, backlog] = await Promise.all([
    prisma.product.findMany({
      select: { id: true, name: true, variations: { select: { id: true, name: true }, orderBy: { name: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.digitalStock.groupBy({
      by: ["productId", "variationId", "status"],
      _count: { _all: true },
    }),
    prisma.digitalStock.groupBy({
      by: ["productId", "variationId"],
      where: { status: "AVAILABLE", expiryDate: { lte: now } },
      _count: { _all: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "variationId"],
      where: {
        productId: { not: null },
        fulfillmentType: "AUTO_STOCK",
        isRefunded: false,
        deliveryStatus: { notIn: ["DELIVERED", "CANCELLED"] },
        order: { paymentStatus: "VERIFIED", deliveryStatus: { notIn: ["DELIVERED", "CANCELLED"] } },
      },
      _sum: { quantity: true },
    }),
  ]);

  const key = (productId: string | null, variationId: string | null) => JSON.stringify([productId, variationId]);
  const counts = new Map<string, Partial<Record<(typeof stock)[number]["status"], number>>>();
  for (const row of stock) {
    const id = key(row.productId, row.variationId);
    const statuses = counts.get(id) ?? {};
    statuses[row.status] = row._count._all;
    counts.set(id, statuses);
  }
  const expiredCounts = new Map(expired.map((row) => [key(row.productId, row.variationId), row._count._all]));
  const waitingCounts = new Map(backlog.map((row) => [key(row.productId, row.variationId), row._sum.quantity ?? 0]));

  return products.flatMap((product) => {
    const standardKey = key(product.id, null);
    const variations: { id: string | null; name: string }[] = [...product.variations];
    if (!variations.length || counts.has(standardKey) || waitingCounts.has(standardKey)) {
      variations.unshift({ id: null, name: "Standard" });
    }
    return variations.map((variation) => {
      const id = key(product.id, variation.id);
      const status = counts.get(id) ?? {};
      const expiredAvailable = expiredCounts.get(id) ?? 0;
      const availableCount = Math.max(0, (status.AVAILABLE ?? 0) - expiredAvailable);
      const reservedCount = status.RESERVED ?? 0;
      const deliveredCount = status.DELIVERED ?? 0;
      const totalCount = Object.values(status).reduce((sum, count) => sum + count, 0);
      return {
        productId: product.id,
        productName: product.name,
        variationId: variation.id,
        variationName: variation.name,
        availableCount,
        reservedCount,
        deliveredCount,
        invalidCount: (status.INVALID ?? 0) + (status.REPLACED ?? 0),
        unavailableCount: Math.max(0, totalCount - availableCount - reservedCount - deliveredCount),
        waitingPaidUnits: waitingCounts.get(id) ?? 0,
        totalCount,
        lowStockAlert: availableCount <= 5,
      };
    });
  });
}
