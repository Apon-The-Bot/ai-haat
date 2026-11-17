import type { Prisma } from "@prisma/client";
import type { QueueEntry } from "@/app/admin/operations/queues";
import { prisma } from "@/lib/prisma";

const stockKey = (productId: string, variationId: string | null) => JSON.stringify([productId, variationId]);

export async function getStockAlerts(): Promise<QueueEntry[]> {
  const now = new Date();
  const unexpired: Prisma.DigitalStockWhereInput = {
    OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
  };
  const [products, stock, pendingItems] = await Promise.all([
    prisma.product.findMany({
      select: {
        id: true, name: true, status: true, fulfillmentType: true, lowStockThreshold: true,
        variations: { select: { id: true, name: true, fulfillmentType: true, lowStockThreshold: true } },
      },
    }),
    prisma.digitalStock.groupBy({
      by: ["productId", "variationId"],
      where: { ...unexpired, status: "AVAILABLE" },
      _count: { _all: true },
    }),
    prisma.orderItem.findMany({
      where: {
        productId: { not: null },
        fulfillmentType: "AUTO_STOCK",
        isRefunded: false,
        deliveryStatus: { notIn: ["DELIVERED", "CANCELLED"] },
        order: { paymentStatus: "VERIFIED", deliveryStatus: { notIn: ["DELIVERED", "CANCELLED"] } },
      },
      select: {
        productId: true, variationId: true, quantity: true,
        order: { select: { createdAt: true } },
        _count: {
          select: {
            digitalStocks: {
              where: {
                ...unexpired,
                status: "RESERVED",
                AND: [{ OR: [{ reservationExpiresAt: null }, { reservationExpiresAt: { gt: now } }] }],
              },
            },
          },
        },
      },
    }),
  ]);

  const available = new Map(stock.map((row) => [stockKey(row.productId, row.variationId), row._count._all]));
  const demand = new Map<string, { units: number; oldestOrder: number }>();
  for (const item of pendingItems) {
    if (!item.productId) continue;
    const units = Math.max(0, item.quantity - item._count.digitalStocks);
    if (!units) continue;
    const key = stockKey(item.productId, item.variationId);
    const previous = demand.get(key);
    const createdAt = item.order.createdAt.getTime();
    demand.set(key, {
      units: (previous?.units ?? 0) + units,
      oldestOrder: Math.min(previous?.oldestOrder ?? createdAt, createdAt),
    });
  }

  const alerts: QueueEntry[] = [];
  for (const product of products) {
    const standard = { id: null, name: "Standard", fulfillmentType: null, lowStockThreshold: null };
    const standardKey = stockKey(product.id, null);
    const variations = [...product.variations];
    const includeStandard = !variations.length || demand.has(standardKey);
    for (const variation of includeStandard ? [standard, ...variations] : variations) {
      const id = stockKey(product.id, variation.id);
      const availableUnits = available.get(id) ?? 0;
      const pending = demand.get(id);
      const waitingUnits = pending?.units ?? 0;
      const threshold = variation.lowStockThreshold ?? product.lowStockThreshold;
      const shortage = waitingUnits > availableUnits;
      const lowStock = product.status === "ACTIVE" &&
        (variation.fulfillmentType ?? product.fulfillmentType) === "AUTO_STOCK" && availableUnits <= threshold;
      if (!shortage && !lowStock) continue;

      alerts.push({
        id,
        reference: `${product.name} · ${variation.name}`,
        detail: shortage
          ? `${availableUnits} available · ${waitingUnits} unreserved paid units · ${waitingUnits - availableUnits} short`
          : `${availableUnits} available · threshold ${threshold}`,
        status: shortage ? "PAID_ORDER_SHORTAGE" : "LOW_STOCK",
        since: shortage && pending ? new Date(pending.oldestOrder).toISOString() : null,
        href: `/admin/inventory?productId=${encodeURIComponent(product.id)}`,
      });
    }
  }
  return alerts.sort((a, b) => (a.since ?? "~").localeCompare(b.since ?? "~") ||
    a.reference.localeCompare(b.reference) || a.id.localeCompare(b.id));
}

export async function getSupplierAlerts(): Promise<QueueEntry[]> {
  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true, status: "ACTIVE" },
    select: {
      id: true, name: true, code: true,
      webhookLogs: {
        take: 1,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { status: true, createdAt: true, itemsAdded: true, itemsSkipped: true },
      },
    },
  });
  return suppliers.flatMap(({ id, name, code, webhookLogs: [latest] }) => {
    if (!latest || !["FAILED", "PARTIAL"].includes(latest.status)) return [];
    return [{
      id,
      reference: `${name} · ${code}`,
      detail: `${latest.itemsAdded} added · ${latest.itemsSkipped} skipped`,
      status: latest.status === "FAILED" ? "SYNC_FAILED" : "SYNC_PARTIAL",
      since: latest.createdAt.toISOString(),
      href: "/admin/suppliers",
    }];
  }).sort((a, b) => a.since.localeCompare(b.since) || a.id.localeCompare(b.id));
}
