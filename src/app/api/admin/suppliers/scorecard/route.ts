import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getSupplierPerformanceMetrics } from "@/lib/commerce/suppliers";

export const dynamic = "force-dynamic";

const round = (value: number) => Math.round(value * 10) / 10;

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;

    const supplierId = new URL(request.url).searchParams.get("supplierId") || undefined;
    const metrics = await getSupplierPerformanceMetrics(supplierId);
    const supplierIds = metrics.map((supplier) => supplier.id);

    const [syncs, replacementRows] = await Promise.all([
      prisma.supplierWebhookLog.findMany({
        where: supplierIds.length ? { supplierId: { in: supplierIds } } : undefined,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { supplierId: true, status: true, createdAt: true, itemsTotal: true, itemsAdded: true, itemsSkipped: true },
      }),
      prisma.replacementRequest.findMany({
        where: supplierIds.length ? { assignedStock: { supplierId: { in: supplierIds } } } : undefined,
        select: { status: true, assignedStock: { select: { supplierId: true } } },
      }),
    ]);

    const syncBySupplier = new Map<string, typeof syncs>();
    for (const sync of syncs) {
      const list = syncBySupplier.get(sync.supplierId) ?? [];
      if (list.length < 5) list.push(sync);
      syncBySupplier.set(sync.supplierId, list);
    }
    const replacementsBySupplier = new Map<string, Record<string, number>>();
    for (const row of replacementRows) {
      const id = row.assignedStock?.supplierId;
      if (!id) continue;
      const counts = replacementsBySupplier.get(id) ?? {};
      counts[row.status] = (counts[row.status] ?? 0) + 1;
      replacementsBySupplier.set(id, counts);
    }

    const suppliers = metrics.map((supplier) => {
      const recentSyncs = syncBySupplier.get(supplier.id) ?? [];
      const successfulSyncs = recentSyncs.filter((sync) => sync.status === "SUCCESS").length;
      const replacementCounts = replacementsBySupplier.get(supplier.id) ?? {};
      const replacementRequests = Object.values(replacementCounts).reduce((sum, value) => sum + value, 0);
      const completedReplacements = (replacementCounts.APPROVED ?? 0) + (replacementCounts.COMPLETED ?? 0);
      const syncSuccessRate = recentSyncs.length ? round((successfulSyncs / recentSyncs.length) * 100) : null;
      const qualityScore = Math.max(0, round(100 - (supplier.invalidRatePct * 2) - supplier.replacementRatePct));
      const reliabilityScore = syncSuccessRate ?? 100;
      const score = round((qualityScore + reliabilityScore) / 2);

      return {
        ...supplier,
        score,
        qualityScore,
        reliabilityScore,
        syncSuccessRate,
        replacementRequests,
        completedReplacements,
        replacementCounts,
        recentSyncs,
      };
    }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

    return NextResponse.json({ success: true, suppliers, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Supplier scorecard GET error:", error);
    return NextResponse.json({ success: false, error: "Unable to load supplier scorecard" }, { status: 500 });
  }
}
