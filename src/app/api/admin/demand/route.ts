import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getAllProductRequests } from "@/lib/product-requests-db";

export const dynamic = "force-dynamic";

type RequestRow = {
  id: string;
  productName: string;
  category: string;
  status: string;
  urgency: string;
  targetBudget: string | null;
  contact: string;
  createdAt: string;
};

function parseDetails(details: string | null) {
  if (!details?.trim().startsWith("{")) return {};
  try {
    return JSON.parse(details) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function readProductRequests(): Promise<RequestRow[]> {
  try {
    const records = await prisma.productRequest.findMany({ orderBy: { createdAt: "desc" } });
    if (records.length > 0) {
      return records.map((record) => {
        const details = parseDetails(record.details);
        return {
          id: record.id,
          productName: record.productName,
          category: typeof details.category === "string" ? details.category : "Uncategorized",
          status: record.status,
          urgency: typeof details.urgency === "string" ? details.urgency : "NORMAL",
          targetBudget: record.targetBudget,
          contact: record.contact,
          createdAt: record.createdAt.toISOString(),
        };
      });
    }
  } catch (error) {
    console.warn("[Admin Demand] Product request database read failed", error);
  }

  return getAllProductRequests().map((request) => ({
    id: request.id,
    productName: request.productName,
    category: request.category || "Uncategorized",
    status: request.status,
    urgency: request.urgency || "NORMAL",
    targetBudget: request.targetBudget || (request.budgetBDT != null ? String(request.budgetBDT) : null),
    contact: request.contact || request.customerEmail || request.customerPhone || "",
    createdAt: request.createdAt,
  }));
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "90D";
    const days = Number(range.replace("D", ""));
    const since = Number.isFinite(days) ? new Date(Date.now() - days * 86400000) : null;
    const [requests, waitlist] = await Promise.all([
      readProductRequests(),
      prisma.stockWaitlist.findMany({
        where: since ? { createdAt: { gte: since } } : undefined,
        include: {
          product: { select: { id: true, name: true, slug: true, inStock: true } },
          variation: { select: { id: true, name: true, inStock: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const filteredRequests = since
      ? requests.filter((request) => new Date(request.createdAt) >= since)
      : requests;
    const requestByStatus = Object.fromEntries(
      ["PENDING", "IN_PROGRESS", "FULFILLED", "REJECTED"].map((status) => [
        status,
        filteredRequests.filter((request) => request.status === status).length,
      ])
    );
    const requestByCategory = new Map<string, number>();
    filteredRequests.forEach((request) => requestByCategory.set(request.category, (requestByCategory.get(request.category) || 0) + 1));

    const productDemand = new Map<string, {
      productId: string;
      productName: string;
      slug: string;
      pendingWaitlist: number;
      notifiedWaitlist: number;
      productRequestCount: number;
      variations: Map<string, number>;
      inStock: boolean;
      latestDemandAt: string;
    }>();
    for (const item of waitlist) {
      const current = productDemand.get(item.productId) || {
        productId: item.productId,
        productName: item.product.name,
        slug: item.product.slug,
        pendingWaitlist: 0,
        notifiedWaitlist: 0,
        productRequestCount: 0,
        variations: new Map<string, number>(),
        inStock: item.product.inStock,
        latestDemandAt: item.createdAt.toISOString(),
      };
      if (item.status === "PENDING") current.pendingWaitlist++;
      if (item.status === "NOTIFIED") current.notifiedWaitlist++;
      const variationName = item.variation?.name || "Any variation";
      current.variations.set(variationName, (current.variations.get(variationName) || 0) + 1);
      if (item.createdAt.toISOString() > current.latestDemandAt) current.latestDemandAt = item.createdAt.toISOString();
      productDemand.set(item.productId, current);
    }

    return NextResponse.json({
      success: true,
      range,
      summary: {
        productRequests: filteredRequests.length,
        pendingProductRequests: requestByStatus.PENDING || 0,
        pendingWaitlist: waitlist.filter((item) => item.status === "PENDING").length,
        distinctWaitlistProducts: productDemand.size,
        urgentRequests: filteredRequests.filter((request) => ["HIGH", "URGENT"].includes(request.urgency)).length,
      },
      productRequests: filteredRequests.slice(0, 100),
      requestByStatus,
      requestByCategory: Array.from(requestByCategory, ([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count),
      productDemand: Array.from(productDemand.values()).map((item) => ({
        ...item,
        variations: Array.from(item.variations, ([variation, count]) => ({ variation, count })),
      })).sort((a, b) => (b.pendingWaitlist + b.productRequestCount) - (a.pendingWaitlist + a.productRequestCount)),
    });
  } catch (error) {
    console.error("[Admin Demand GET Error]", error);
    return NextResponse.json({ success: false, error: "Failed to load demand report" }, { status: 500 });
  }
}
