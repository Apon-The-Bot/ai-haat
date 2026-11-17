import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStockAlerts, getSupplierAlerts } from "@/app/api/admin/operations/alerts";
import { deliveryPromiseMinutes, pendingDeadline } from "@/lib/admin/delivery-sla";

export type AutomatedAlertKind = "LOW_STOCK" | "FAILED_PAYMENT" | "DELAYED_DELIVERY" | "SUPPLIER_SYNC" | "UNUSUAL_REFUND";

export type AutomatedAlert = {
  id: string;
  kind: AutomatedAlertKind;
  title: string;
  detail: string;
  severity: "high" | "medium";
  since: string | null;
  href: string;
};

const headers = { "Cache-Control": "private, no-store" };
export { headers as automatedAlertHeaders };

function fromQueue(kind: "LOW_STOCK" | "SUPPLIER_SYNC", rows: Awaited<ReturnType<typeof getStockAlerts>>) {
  return rows.map((row): AutomatedAlert => ({
    id: `${kind}:${row.id}`,
    kind,
    title: kind === "LOW_STOCK" ? "Low stock" : "Supplier sync issue",
    detail: `${row.reference} · ${row.detail}`,
    severity: row.status.includes("SHORTAGE") || row.status === "SYNC_FAILED" ? "high" : "medium",
    since: row.since,
    href: row.href,
  }));
}

async function failedPayments(since: Date): Promise<AutomatedAlert[]> {
  const rows = await prisma.order.findMany({
    where: { paymentStatus: "FAILED", createdAt: { gte: since } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: 50,
    select: { id: true, orderNumber: true, paymentMethod: true, totalBDT: true, createdAt: true },
  });
  return rows.map((row) => ({
    id: `FAILED_PAYMENT:${row.id}`, kind: "FAILED_PAYMENT" as const,
    title: "Failed payment", detail: `${row.orderNumber} · ${row.paymentMethod} · BDT ${row.totalBDT.toFixed(2)}`,
    severity: "high" as const, since: row.createdAt.toISOString(), href: `/admin/orders?orderId=${encodeURIComponent(row.orderNumber)}`,
  }));
}

async function delayedDeliveries(now: Date): Promise<AutomatedAlert[]> {
  const open = await prisma.order.findMany({
    where: { paymentStatus: "VERIFIED", deliveryStatus: { in: ["ORDER_PLACED", "PREPARING", "PROCESSING"] } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 50,
    select: { id: true, orderNumber: true, timelineEvents: { where: { status: "PAYMENT_VERIFIED" }, orderBy: { createdAt: "asc" }, take: 1, select: { createdAt: true } }, items: { where: { isRefunded: false, deliveryStatus: { in: ["ORDER_PLACED", "PREPARING", "PROCESSING"] } }, select: { productId: true } } },
  });
  const productIds = Array.from(new Set(open.flatMap((row) => row.items.flatMap((item) => item.productId ? [item.productId] : []))));
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, deliveryTime: true } });
  const promises = new Map(products.map((product) => [product.id, deliveryPromiseMinutes(product.deliveryTime)]));
  return open.flatMap((row) => {
    const status = pendingDeadline(row.timelineEvents[0]?.createdAt, row.items.map((item) => item.productId ? promises.get(item.productId) ?? null : null), now);
    return status?.overdue ? [{ id: `DELAYED_DELIVERY:${row.id}`, kind: "DELAYED_DELIVERY" as const, title: "Delayed delivery", detail: `${row.orderNumber} · overdue since ${new Date(status.deadline).toLocaleString("en-GB")}`, severity: "high" as const, since: new Date(status.deadline).toISOString(), href: `/admin/orders?orderId=${encodeURIComponent(row.orderNumber)}` }] : [];
  });
}

async function unusualRefunds(since: Date): Promise<AutomatedAlert[]> {
  const groups = await prisma.refund.groupBy({ by: ["userId"], where: { createdAt: { gte: since }, status: { in: ["REQUESTED", "UNDER_REVIEW", "APPROVED", "PROCESSING", "REFUNDED"] } }, _count: { _all: true }, _sum: { requestedAmountBDT: true } });
  const suspicious = groups.filter((group) => group._count._all >= 3);
  const users = await prisma.user.findMany({ where: { id: { in: suspicious.map((group) => group.userId) } }, select: { id: true, name: true, email: true } });
  const names = new Map(users.map((user) => [user.id, user.name || user.email]));
  return suspicious.map((group) => ({ id: `UNUSUAL_REFUND:${group.userId}`, kind: "UNUSUAL_REFUND" as const, title: "Unusual refund activity", detail: `${names.get(group.userId) || "Customer"} · ${group._count._all} refunds · BDT ${(group._sum.requestedAmountBDT || 0).toFixed(2)} requested`, severity: "medium" as const, since: since.toISOString(), href: `/admin/customers/${encodeURIComponent(group.userId)}` }));
}

export async function getAutomatedAlerts() {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [stock, suppliers, payments, deliveries, refunds] = await Promise.all([getStockAlerts(), getSupplierAlerts(), failedPayments(since), delayedDeliveries(new Date()), unusualRefunds(since)]);
  const alerts = [...fromQueue("LOW_STOCK", stock), ...fromQueue("SUPPLIER_SYNC", suppliers), ...payments, ...deliveries, ...refunds].sort((a, b) => (a.since || "").localeCompare(b.since || ""));
  return { alerts, generatedAt: new Date().toISOString(), windowDays: 30 };
}
