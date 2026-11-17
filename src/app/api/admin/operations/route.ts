import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { isQueue, queues, type Queue, type QueueEntry } from "@/app/admin/operations/queues";
import { getStockAlerts, getSupplierAlerts } from "./alerts";

export const dynamic = "force-dynamic";

const pageSize = 25;
const responseHeaders = { "Cache-Control": "private, no-store" };
const fulfillment: Prisma.OrderWhereInput = {
  paymentStatus: "VERIFIED",
  deliveryStatus: { in: ["ORDER_PLACED", "PREPARING", "PROCESSING"] },
};
const payments: Prisma.OrderWhereInput = { paymentStatus: "PENDING", deliveryStatus: { not: "CANCELLED" } };
const refunds: Prisma.RefundWhereInput = { status: { in: ["REQUESTED", "UNDER_REVIEW"] } };
const replacements: Prisma.ReplacementRequestWhereInput = { status: { in: ["REQUESTED", "UNDER_REVIEW"] } };
const support: Prisma.SupportTicketWhereInput = { status: { in: ["OPEN", "WAITING_FOR_ADMIN"] } };

async function summary() {
  const [deliveryCount, paymentCount, refundCount, replacementCount, supportCount, stockAlerts, supplierAlerts] = await Promise.all([
    prisma.order.count({ where: fulfillment }),
    prisma.order.count({ where: payments }),
    prisma.refund.count({ where: refunds }),
    prisma.replacementRequest.count({ where: replacements }),
    prisma.supportTicket.count({ where: support }),
    getStockAlerts(),
    getSupplierAlerts(),
  ]);
  return {
    fulfillment: deliveryCount, payments: paymentCount, refunds: refundCount,
    replacements: replacementCount, support: supportCount,
    stock: stockAlerts.length, suppliers: supplierAlerts.length,
  };
}

async function list(queue: Queue, page: number, assignment: string | null, userId: string): Promise<QueueEntry[]> {
  const paging = { skip: (page - 1) * pageSize, take: pageSize + 1 };
  const orderBy = [{ createdAt: "asc" }, { id: "asc" }] as const;
  const href = queues[queue].href;

  if (queue === "stock" || queue === "suppliers") {
    const alerts = await (queue === "stock" ? getStockAlerts() : getSupplierAlerts());
    return alerts.slice(paging.skip, paging.skip + paging.take);
  }

  if (queue === "support") {
    const rows = await prisma.supportTicket.findMany({
      ...paging,
      orderBy: [{ lastActivityAt: "asc" }, { id: "asc" }],
      where: {
        ...support,
        ...(assignment === "mine" && { assignedAdminId: userId }),
        ...(assignment === "unassigned" && { assignedAdminId: null }),
      },
      select: { id: true, ticketNumber: true, status: true, priority: true, lastActivityAt: true, assignedAdminId: true },
    });
    return rows.map((row) => ({
      id: row.id,
      reference: row.ticketNumber,
      status: row.status,
      detail: `${row.priority.toLowerCase()} priority`,
      since: row.lastActivityAt.toISOString(),
      assignment: row.assignedAdminId === userId ? "mine" : row.assignedAdminId ? "assigned" : "unassigned",
      href: `/admin/support/${encodeURIComponent(row.id)}`,
    }));
  }

  if (queue === "refunds" || queue === "replacements") {
    const select = {
      id: true, status: true, reason: true, createdAt: true, order: { select: { orderNumber: true } },
    } as const;
    const rows = queue === "refunds"
      ? await prisma.refund.findMany({ ...paging, where: refunds, orderBy: [...orderBy], select })
      : await prisma.replacementRequest.findMany({ ...paging, where: replacements, orderBy: [...orderBy], select });
    return rows.map((row) => ({
      id: row.id, reference: row.order.orderNumber, detail: row.reason.replaceAll("_", " "),
      status: row.status, since: row.createdAt.toISOString(), href,
    }));
  }

  const rows = await prisma.order.findMany({
    ...paging,
    where: queue === "payments" ? payments : fulfillment,
    orderBy: [...orderBy],
    select: { id: true, orderNumber: true, paymentMethod: true, totalBDT: true, paymentStatus: true, deliveryStatus: true, createdAt: true },
  });
  if (!rows.length) return [];

  const latestAssignments = await prisma.adminAuditLog.findMany({
    where: { targetType: "ORDER", action: "ORDER_ASSIGNMENT", targetId: { in: rows.map((row) => row.id) } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    distinct: ["targetId"],
    select: { targetId: true, details: true },
  });
  const assignees = new Map(latestAssignments.map((entry) => [entry.targetId, entry.details]));
  return rows.map((row) => ({
    id: row.id, reference: row.orderNumber,
    detail: `${row.paymentMethod} · BDT ${row.totalBDT.toFixed(2)}`,
    status: queue === "payments" ? row.paymentStatus : row.deliveryStatus,
    since: row.createdAt.toISOString(),
    assignment: assignees.get(row.id) === userId ? "mine" : assignees.get(row.id) ? "assigned" : "unassigned",
    href: `/admin/orders?orderId=${encodeURIComponent(row.orderNumber)}`,
  }));
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  const params = request.nextUrl.searchParams;
  const queue = params.get("queue");
  const page = Number(params.get("page") ?? 1);
  const assignment = params.get("assignment");
  if ((queue !== null && !isQueue(queue)) || !Number.isSafeInteger(page) || page < 1 || page > 10000 ||
    (assignment !== null && (queue !== "support" || !["all", "mine", "unassigned"].includes(assignment)))) {
    return NextResponse.json({ error: "Invalid queue filters" }, { status: 400, headers: responseHeaders });
  }

  try {
    const data = isQueue(queue)
      ? await list(queue, page, assignment, auth.user.id).then((rows) => ({
        entries: rows.slice(0, pageSize), hasNext: rows.length > pageSize && page < 10000,
      }))
      : { counts: await summary() };
    return NextResponse.json(data, { headers: responseHeaders });
  } catch (error) {
    console.error("Failed to load admin operations queue", error);
    return NextResponse.json({ error: "Could not load operations queue" }, { status: 500, headers: responseHeaders });
  }
}
