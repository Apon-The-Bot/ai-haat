import { NextRequest, NextResponse } from "next/server";
import { validateSupplierAuth, ingestSupplierStock } from "@/lib/commerce/suppliers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const key = req.headers.get("x-supplier-key") || req.headers.get("authorization")?.replace("Bearer ", "");
    const secret = req.headers.get("x-supplier-secret") || undefined;

    if (!key) {
      return NextResponse.json({ success: false, error: "Missing supplier authentication key (X-Supplier-Key or Bearer token)" }, { status: 401 });
    }

    const authResult = await validateSupplierAuth(key, secret);
    if (!authResult.isValid || !authResult.supplier) {
      return NextResponse.json({ success: false, error: authResult.error || "Unauthorized or inactive supplier" }, { status: 403 });
    }

    const body = await req.json();
    const { productId, variationId, type, lines, items, batchRef, notes } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "productId is required" }, { status: 400 });
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddress = forwarded?.split(",")[0]?.trim() || "unknown";

    const result = await ingestSupplierStock({
      supplierId: authResult.supplier.id,
      productId,
      variationId,
      type,
      lines,
      items,
      batchRef,
      notes,
      ipAddress
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Supplier Webhook Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
