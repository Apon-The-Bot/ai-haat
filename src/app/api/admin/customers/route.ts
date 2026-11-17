import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminMfa } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  const params = request.nextUrl.searchParams;
  const query = params.get("q")?.trim() || "";
  const page = Math.max(Number(params.get("page") || 1), 1);
  const pageSize = Math.min(Math.max(Number(params.get("pageSize") || 20), 1), 50);
  const where = query
    ? { OR: [{ name: { contains: query } }, { email: { contains: query } }, { phone: { contains: query } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, name: true, email: true, phone: true, role: true, walletBalanceBDT: true, createdAt: true, _count: { select: { orders: true, supportTickets: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    customers: users,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}
