import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import {
  bulkUpdateProductStatus,
  bulkUpdateProductVisibility,
  bulkArchiveProducts,
  bulkDeleteProducts,
  bulkUpdateProductPrice,
  exportProductsToCSV,
} from "@/lib/commerce/products";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdminMfa();
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { action, status, visibility, adjustment } = body;
    // Support either productIds or ids for backward-compatibility
    const productIds: string[] = body.productIds || body.ids;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid or empty productIds" }, { status: 400 });
    }

    if (action === "STATUS" || action === "ACTIVATE" || action === "DEACTIVATE") {
      let targetStatus = status;
      if (action === "ACTIVATE") targetStatus = "ACTIVE";
      if (action === "DEACTIVATE") targetStatus = "INACTIVE";

      if (!targetStatus || !["ACTIVE", "INACTIVE", "ARCHIVED", "DRAFT"].includes(targetStatus)) {
        return NextResponse.json(
          { success: false, error: "Valid status (ACTIVE, INACTIVE, ARCHIVED, DRAFT) is required" },
          { status: 400 }
        );
      }
      const result = await bulkUpdateProductStatus(productIds, targetStatus as any, authResult.user);
      return NextResponse.json({ success: true, count: result.count, status: targetStatus });
    } else if (action === "VISIBILITY") {
      if (!visibility || !["PUBLIC", "HIDDEN", "DIRECT_LINK_ONLY"].includes(visibility)) {
        return NextResponse.json(
          { success: false, error: "Valid visibility (PUBLIC, HIDDEN, DIRECT_LINK_ONLY) is required" },
          { status: 400 }
        );
      }
      const result = await bulkUpdateProductVisibility(productIds, visibility as any, authResult.user);
      return NextResponse.json({ success: true, count: result.count, visibility });
    } else if (action === "ARCHIVE") {
      const result = await bulkArchiveProducts(productIds, authResult.user);
      return NextResponse.json({ success: true, count: result.count });
    } else if (action === "DELETE") {
      const result = await bulkDeleteProducts(productIds, authResult.user);
      return NextResponse.json({
        success: true,
        deletedCount: result.deletedCount,
        archivedCount: result.archivedCount,
        total: result.total,
      });
    } else if (action === "EXPORT_CSV") {
      const csv = await exportProductsToCSV(productIds);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="AI_Haat_Products_Export_${new Date().toISOString().split("T")[0]}.csv"`,
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    } else if (action === "PRICE") {
      // Support nested payload or direct adjustment
      const adj = adjustment || body.payload;
      if (!adj) {
        return NextResponse.json({ success: false, error: "Adjustment details are required for PRICE action" }, { status: 400 });
      }

      // Format normalize: type ('PERCENT'|'FIXED'), value (number), direction ('INCREASE'|'DECREASE')
      let adjType: "PERCENT" | "FIXED" = adj.type === "fixed" || adj.type === "FIXED" ? "FIXED" : "PERCENT";
      let val = Number(adj.value || 0);
      let direction: "INCREASE" | "DECREASE" = adj.direction || (val >= 0 ? "INCREASE" : "DECREASE");
      val = Math.abs(val);

      await bulkUpdateProductPrice(productIds, { type: adjType, value: val, direction }, authResult.user);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
