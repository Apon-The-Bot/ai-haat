import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchScope = "all" | "orders" | "users" | "tickets" | "products";

function cleanScope(value: string | null): SearchScope {
  return value && ["all", "orders", "users", "tickets", "products"].includes(value)
    ? (value as SearchScope)
    : "all";
}

function contains(value: string): Prisma.StringFilter {
  return { contains: value };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  const params = request.nextUrl.searchParams;
  const query = params.get("q")?.trim() || "";
  const scope = cleanScope(params.get("scope"));

  if (query.length < 2) {
    return NextResponse.json({ success: true, query, scope, results: [] });
  }

  const [orders, users, tickets, products] = await Promise.all([
    scope === "all" || scope === "orders"
      ? prisma.order.findMany({
          where: { OR: [{ orderNumber: contains(query) }, { id: contains(query) }, { customerName: contains(query) }, { customerEmail: contains(query) }, { trxId: contains(query) }] },
          select: { id: true, orderNumber: true, customerName: true, customerEmail: true, totalBDT: true, paymentStatus: true, deliveryStatus: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        })
      : Promise.resolve([]),
    scope === "all" || scope === "users"
      ? prisma.user.findMany({
          where: { OR: [{ id: contains(query) }, { name: contains(query) }, { email: contains(query) }, { phone: contains(query) }] },
          select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        })
      : Promise.resolve([]),
    scope === "all" || scope === "tickets"
      ? prisma.supportTicket.findMany({
          where: { OR: [{ ticketNumber: contains(query) }, { subject: contains(query) }, { customerEmail: contains(query) }, { customerName: contains(query) }] },
          select: { id: true, ticketNumber: true, subject: true, customerName: true, customerEmail: true, status: true, priority: true, lastActivityAt: true },
          orderBy: { lastActivityAt: "desc" },
          take: 8,
        })
      : Promise.resolve([]),
    scope === "all" || scope === "products"
      ? prisma.product.findMany({
          where: { OR: [{ id: contains(query) }, { name: contains(query) }, { slug: contains(query) }, { category: contains(query) }] },
          select: { id: true, name: true, slug: true, category: true, status: true, minPriceBDT: true, maxPriceBDT: true, inStock: true },
          orderBy: { sortOrder: "asc" },
          take: 8,
        })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({
    success: true,
    query,
    scope,
    results: [
      ...orders.map((item) => ({ type: "order", id: item.id, title: item.orderNumber, subtitle: `${item.customerName} · ${item.customerEmail}`, meta: `${item.paymentStatus} · ${item.deliveryStatus} · ৳${item.totalBDT}`, href: `/admin/orders?order=${encodeURIComponent(item.id)}`, timestamp: item.createdAt })),
      ...users.map((item) => ({ type: "user", id: item.id, title: item.name || item.email, subtitle: `${item.email}${item.phone ? ` · ${item.phone}` : ""}`, meta: item.role, href: `/admin/users/${encodeURIComponent(item.id)}`, timestamp: item.createdAt })),
      ...tickets.map((item) => ({ type: "ticket", id: item.id, title: `${item.ticketNumber} · ${item.subject}`, subtitle: `${item.customerName || "Customer"} · ${item.customerEmail}`, meta: `${item.priority} · ${item.status}`, href: `/admin/support/${encodeURIComponent(item.id)}`, timestamp: item.lastActivityAt })),
      ...products.map((item) => ({ type: "product", id: item.id, title: item.name, subtitle: `${item.category} · ${item.slug}`, meta: `${item.status} · ${item.inStock ? "In stock" : "Out of stock"}`, href: `/admin/products/${encodeURIComponent(item.id)}/edit`, timestamp: null })),
    ],
  });
}
