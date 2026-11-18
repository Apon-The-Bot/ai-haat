import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function dateValue(value: string | null, end = false) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  if (end && /^\d{4}-\d{2}-\d{2}$/.test(value)) date.setHours(23, 59, 59, 999);
  return date;
}

function parseDetails(value: string | null) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return value; }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  const params = request.nextUrl.searchParams;
  const source = params.get("source") || "all";
  const actor = params.get("actor")?.trim();
  const action = params.get("action")?.trim();
  const targetType = params.get("targetType")?.trim();
  const query = params.get("query")?.trim();
  const from = dateValue(params.get("from"));
  const to = dateValue(params.get("to"), true);
  const page = Math.max(1, Number(params.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize") || 50)));
  const exportCsv = params.get("format") === "csv";
  const createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };

  const auditWhere: any = { ...(Object.keys(createdAt).length ? { createdAt } : {}) };
  if (actor) auditWhere.actorEmail = { contains: actor };
  if (action && action !== "ALL") auditWhere.action = action;
  if (targetType && targetType !== "ALL") auditWhere.targetType = targetType;
  if (query) auditWhere.OR = [{ actorEmail: { contains: query } }, { targetId: { contains: query } }, { details: { contains: query } }];

  const timelineWhere: any = { ...(Object.keys(createdAt).length ? { createdAt } : {}) };
  if (actor) timelineWhere.actorEmail = { contains: actor };
  if (action && action !== "ALL") timelineWhere.status = { contains: action };
  if (query) timelineWhere.OR = [{ actorEmail: { contains: query } }, { status: { contains: query } }, { note: { contains: query } }, { orderId: { contains: query } }];

  const [auditLogs, orderEvents] = await Promise.all([
    source === "timeline" ? [] : prisma.adminAuditLog.findMany({ where: auditWhere, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: exportCsv ? 5000 : 5000 }),
    source === "audit" ? [] : prisma.orderTimelineEvent.findMany({ where: timelineWhere, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: exportCsv ? 5000 : 5000 }),
  ]);

  const events = [
    ...auditLogs.map((log) => ({ id: log.id, source: "ADMIN_AUDIT", actor: log.actorEmail || "Admin", action: log.action, targetType: log.targetType, targetId: log.targetId || "N/A", details: parseDetails(log.details), createdAt: log.createdAt.toISOString() })),
    ...orderEvents.map((event) => ({ id: event.id, source: "ORDER_TIMELINE", actor: event.actorEmail || event.actor, action: event.status, targetType: "ORDER", targetId: event.orderId, details: event.note || null, createdAt: event.createdAt.toISOString() })),
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  if (exportCsv) {
    const rows = ["timestamp,source,actor,action,targetType,targetId,details", ...events.map((event) => [event.createdAt, event.source, event.actor, event.action, event.targetType, event.targetId, typeof event.details === "string" ? event.details : JSON.stringify(event.details || "")].map(csvCell).join(","))];
    return new NextResponse(rows.join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="admin-activity-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "private, no-store" } });
  }

  const total = events.length;
  const start = (page - 1) * pageSize;
  return NextResponse.json({ success: true, events: events.slice(start, start + pageSize), pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }, filters: { actions: Array.from(new Set(events.map((event) => event.action))).sort(), targetTypes: Array.from(new Set(events.map((event) => event.targetType))).sort(), actors: Array.from(new Set(events.map((event) => event.actor))).sort() } }, { headers: { "Cache-Control": "private, no-store" } });
}
