import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store" };
const windows = ["all", "7", "30", "expired"] as const;
type Window = (typeof windows)[number];

function windowBounds(window: Window) {
  const now = new Date();
  if (window === "expired") return { lte: now };
  if (window === "all") return undefined;
  const end = new Date(now.getTime() + Number(window) * 24 * 60 * 60 * 1000);
  return { gt: now, lte: end };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  const params = request.nextUrl.searchParams;
  const rawWindow = params.get("window") ?? "30";
  const window = windows.includes(rawWindow as Window) ? rawWindow as Window : "30";
  const limit = Math.min(Math.max(Number(params.get("limit") ?? 100), 1), 250);

  try {
    const expiry = windowBounds(window);
    const [entitlements, renewalOrders] = await Promise.all([
      prisma.deliveredKey.findMany({
        where: { warrantyExpiresAt: expiry, isReplacement: false },
        orderBy: [{ warrantyExpiresAt: "asc" }, { deliveredAt: "asc" }],
        take: limit,
        select: {
          id: true, productName: true, accountType: true, warrantyExpiresAt: true,
          deliveredAt: true, orderId: true, userId: true,
          order: { select: { orderNumber: true, customerName: true, customerEmail: true, userId: true } },
          orderItem: { select: { variationName: true, productId: true } },
        },
      }),
      prisma.order.findMany({
        where: { isRenewal: true, paymentStatus: { in: ["FAILED", "PENDING"] } },
        orderBy: { createdAt: "desc" }, take: limit,
        select: { id: true, orderNumber: true, customerName: true, customerEmail: true, totalBDT: true, paymentMethod: true, paymentStatus: true, createdAt: true, userId: true, renewedFromOrderId: true },
      }),
    ]);

    const userIds = Array.from(new Set(entitlements.flatMap((item) => [item.userId, item.order.userId].filter((id): id is string => Boolean(id)))));
    const [notifications, events] = await Promise.all([
      userIds.length ? prisma.notification.findMany({ where: { userId: { in: userIds }, dedupeKey: { startsWith: "expiry-reminder-" } }, select: { userId: true, dedupeKey: true, createdAt: true } }) : [],
      prisma.notificationEvent.findMany({ where: { entityType: "ORDER", eventType: { contains: "EXPIRY" } }, select: { entityId: true, status: true, createdAt: true } }),
    ]);
    const reminderFor = (userId: string | null) => notifications.find((item) => item.userId === userId)?.dedupeKey;
    return NextResponse.json({
      window,
      summary: {
        expiring: entitlements.filter((item) => item.warrantyExpiresAt && item.warrantyExpiresAt > new Date()).length,
        expired: entitlements.filter((item) => item.warrantyExpiresAt && item.warrantyExpiresAt <= new Date()).length,
        failedRenewals: renewalOrders.filter((order) => order.paymentStatus === "FAILED").length,
        pendingRenewals: renewalOrders.filter((order) => order.paymentStatus === "PENDING").length,
        reminderEvents: events.filter((event) => event.status === "SENT").length,
      },
      expiring: entitlements.map((item) => { const key = reminderFor(item.userId || item.order.userId); return { ...item, reminder: key ? { stage: key.includes("1d") ? "1 day" : "3 days", createdAt: notifications.find((entry) => entry.dedupeKey === key)?.createdAt } : null }; }),
      renewalFailures: renewalOrders,
    }, { headers });
  } catch (error) {
    console.error("Failed to load admin subscription desk", error);
    return NextResponse.json({ error: "Could not load subscription data" }, { status: 500, headers });
  }
}
