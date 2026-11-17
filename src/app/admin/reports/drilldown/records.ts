import { prisma } from "@/lib/prisma";
import { descending, orderRef, pageSize, period, refundAmounts, value, type Query } from "../../reconciliation/records";

export const sources = {
  verified: { title: "Verified orders", basis: "Order creation date. Verified revenue, paid order count and gross average order value use these records." },
  orders: { title: "Placed orders", basis: "Order creation date. Includes every payment status." },
  refunds: { title: "Overview refund deductions", basis: "Refund processing date. The overview includes Refunded and Approved records and uses the requested amount when the approved amount is zero or absent." },
  claims: { title: "Refund requests", basis: "Refund creation date. Includes every refund status." },
  payouts: { title: "After-sales refund deductions", basis: "Refund creation date. The report includes Refunded and Approved records, using the requested amount when the approved amount is zero or absent." },
  stock: { title: "Delivered and replaced stock costs", basis: "Stock delivery date. Unrecorded costs contribute no amount to the overview." },
  manual: { title: "Manual fulfillment costs", basis: "Cost record creation date. These amounts contribute to Delivered COGS." },
  procurement: { title: "Procurement spend", basis: "Batch purchase date. The overview uses quantity × unit cost when total cost is zero or absent." },
} as const;

export type Source = keyof typeof sources;
const completedStatuses = ["APPROVED", "REFUNDED"] as const;

export function sourceFor(query: Query): Source {
  const source = value(query, "source");
  return Object.hasOwn(sources, source) ? source as Source : "verified";
}

export async function readDrilldown(source: Source, query: Query, offset: number) {
  const dates = period(query);
  const window = { skip: offset, take: pageSize + 1 };
  if (source === "refunds" || source === "claims" || source === "payouts") {
    const field = source === "refunds" ? "processedAt" : "createdAt";
    const productName = value(query, "product").trim().slice(0, 191);
    const refunds = await prisma.refund.findMany({
      ...window, orderBy: descending(field),
      where: {
        [field]: dates, status: source === "claims" ? undefined : { in: [...completedStatuses] },
        OR: productName ? [{ orderItem: { productName } }, {
          orderItemId: null, order: { items: { some: { productName } } },
        }] : undefined,
      },
      select: {
        id: true, status: true, refundMethod: true, ...refundAmounts, createdAt: true, processedAt: true,
        order: { select: orderRef }, orderItem: { select: { productName: true } },
      },
    });
    return refunds.map(row => ({
      id: row.id, order: row.order, date: row[field],
      detail: `${row.status} · ${row.refundMethod} · ${row.orderItem?.productName ?? "Order-level refund"}`,
      amount: source === "claims" ? row.requestedAmountBDT : row.approvedAmountBDT || row.requestedAmountBDT,
    }));
  }
  if (source === "stock") {
    const stock = await prisma.digitalStock.findMany({
      ...window, orderBy: descending("deliveredAt"),
      where: { deliveredAt: dates, status: { in: ["DELIVERED", "REPLACED"] } },
      select: { id: true, deliveredAt: true, costPriceBDT: true, status: true, order: { select: orderRef } },
    });
    return stock.map(row => ({
      id: row.id, order: row.order, date: row.deliveredAt, detail: row.status, amount: row.costPriceBDT,
    }));
  }
  if (source === "manual") {
    const costs = await prisma.orderItemCost.findMany({
      ...window, orderBy: descending("createdAt"), where: { createdAt: dates },
      select: { id: true, createdAt: true, costBDT: true, orderItem: { select: { productName: true, order: { select: orderRef } } } },
    });
    return costs.map(row => ({
      id: row.id, order: row.orderItem.order, date: row.createdAt, detail: row.orderItem.productName, amount: row.costBDT,
    }));
  }
  if (source === "procurement") {
    const batches = await prisma.inventoryBatch.findMany({
      ...window, orderBy: descending("purchaseDate"), where: { purchaseDate: dates },
      select: { id: true, batchRef: true, purchaseDate: true, status: true, totalCostBDT: true, unitCostBDT: true, totalCount: true },
    });
    return batches.map(row => ({
      id: row.id, order: null, date: row.purchaseDate, detail: `${row.batchRef} · ${row.status}`,
      amount: row.totalCostBDT || row.totalCount * (row.unitCostBDT || 0),
    }));
  }
  const day = value(query, "day");
  const date = /^\d{4}-\d{2}-\d{2}$/.test(day) ? new Date(day + "T00:00:00") : null;
  const dailyDates = date && Number.isFinite(date.getTime()) ? {
    gte: date, lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
  } : undefined;
  const orders = await prisma.order.findMany({
    ...window, orderBy: descending("createdAt"),
    where: {
      createdAt: dates, AND: dailyDates ? [{ createdAt: dailyDates }] : undefined,
      paymentStatus: source === "verified" ? "VERIFIED" : undefined,
      OR: value(query, "method") === "other" ? [{ paymentMethod: "other" }, { paymentMethod: "" }] : undefined,
      paymentMethod: value(query, "method") === "other" ? undefined : value(query, "method").slice(0, 191) || undefined,
    },
    select: { ...orderRef, createdAt: true, paymentMethod: true, paymentStatus: true, totalBDT: true },
  });
  return orders.map(row => ({
    id: row.id, order: row, date: row.createdAt, detail: `${row.paymentStatus} · ${row.paymentMethod}`, amount: row.totalBDT,
  }));
}
