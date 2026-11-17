import { NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

const assignmentAction = "ORDER_ASSIGNMENT";
const noteAction = "ORDER_INTERNAL_NOTE";
function parseChange(body: unknown) {
  if (!body || typeof body !== "object") return null;
  if ("action" in body && body.action === "assign" && "assigneeId" in body) {
    const { assigneeId } = body;
    if (assigneeId === null || (typeof assigneeId === "string" && assigneeId.length > 0 && assigneeId.length <= 191)) {
      return { action: "assign" as const, assigneeId };
    }
  }
  if ("action" in body && body.action === "note" && "note" in body && typeof body.note === "string") {
    const note = body.note.trim();
    if (note && note.length <= 2000) return { action: "note" as const, note };
  }
  return null;
}

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      createdAt: true, paymentStatus: true, deliveryStatus: true,
      refundStatus: true, refundedBDT: true,
      items: {
        select: {
          id: true, productName: true, variationName: true, deliveryStatus: true,
          fulfillmentType: true, warrantyDaysAtPurchase: true, refundWindowDaysAtPurchase: true,
          refundAllowedAtPurchase: true, replacementAllowedAtPurchase: true,
        },
      },
      supportTickets: {
        select: { id: true, ticketNumber: true, status: true, createdAt: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 50,
      },
      refunds: {
        select: {
          id: true, status: true, requestedAmountBDT: true, approvedAmountBDT: true,
          createdAt: true, reviewedAt: true, processedAt: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 50,
      },
      replacements: {
        select: { id: true, status: true, createdAt: true, reviewedAt: true },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 50,
      },
      deliveredKeys: {
        select: { id: true, deliveredAt: true, isReplacement: true },
        orderBy: [{ deliveredAt: "desc" }, { id: "desc" }], take: 50,
      },
    },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const where = { targetType: "ORDER", targetId: id };
  const orderBy = [{ createdAt: "desc" as const }, { id: "desc" as const }];
  const [assignment, activity, admins] = await Promise.all([
    prisma.adminAuditLog.findFirst({
      where: { ...where, action: assignmentAction }, orderBy, select: { details: true },
    }),
    prisma.adminAuditLog.findMany({
      where: { ...where, action: { in: [assignmentAction, noteAction] } },
      orderBy, take: 100,
      select: { id: true, action: true, details: true, actorEmail: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { role: "ADMIN" }, select: { id: true, name: true, email: true },
      orderBy: { email: "asc" },
    }),
  ]);
  return NextResponse.json({
    ...order, admins, activity, assigneeId: assignment?.details ?? null,
  }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request, { params }: Context) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;
  const change = parseChange(await request.json().catch(() => null));
  if (!change) {
    return NextResponse.json({ error: "Invalid assignment or note" }, { status: 400 });
  }
  const result = await prisma.$transaction(async (tx) => {
    if (!await tx.order.findUnique({ where: { id }, select: { id: true } })) return 404;
    if (change.action === "assign" && change.assigneeId) {
      const admin = await tx.user.findFirst({
        where: { id: change.assigneeId, role: "ADMIN" }, select: { id: true },
      });
      if (!admin) return 400;
    }
    await tx.adminAuditLog.create({
      data: {
        targetType: "ORDER", targetId: id, actorId: auth.user.id, actorEmail: auth.user.email,
        action: change.action === "assign" ? assignmentAction : noteAction,
        details: change.action === "assign" ? change.assigneeId : change.note,
      },
    });
    return 200;
  });
  if (result === 404) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (result === 400) return NextResponse.json({ error: "Choose an administrator" }, { status: 400 });
  return NextResponse.json({ success: true });
}
