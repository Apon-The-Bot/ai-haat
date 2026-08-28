import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId");
    const productId = searchParams.get("productId");

    const where: any = {};
    if (supplierId && supplierId !== "ALL") where.supplierId = supplierId;
    if (productId && productId !== "ALL") where.productId = productId;

    const mappings = await prisma.productSupplier.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true, code: true } },
        product: { select: { id: true, name: true, slug: true, minPriceBDT: true } },
        variation: { select: { id: true, name: true, priceBDT: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, mappings });
  } catch (error: any) {
    console.error("Admin Supplier Mappings GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const {
      supplierId,
      productId,
      variationId,
      supplierSku,
      defaultCost,
      currency,
      leadTime,
      isPreferred,
      notes,
    } = await req.json();

    if (!supplierId || !productId) {
      return NextResponse.json({ success: false, error: "Supplier ID and Product ID are required." }, { status: 400 });
    }

    // If marked preferred, unset other preferred mappings for same product/variation
    if (isPreferred) {
      await prisma.productSupplier.updateMany({
        where: {
          productId,
          variationId: variationId || null,
        },
        data: { isPreferred: false },
      });
    }

    const mapping = await prisma.productSupplier.upsert({
      where: {
        supplierId_productId_variationId: {
          supplierId,
          productId,
          variationId: variationId || null,
        },
      },
      update: {
        supplierSku: supplierSku || null,
        defaultCost: defaultCost !== undefined && defaultCost !== null ? Number(defaultCost) : null,
        currency: (currency || "BDT").toUpperCase(),
        leadTime: leadTime || null,
        isPreferred: isPreferred || false,
        notes: notes || null,
      },
      create: {
        supplierId,
        productId,
        variationId: variationId || null,
        supplierSku: supplierSku || null,
        defaultCost: defaultCost !== undefined && defaultCost !== null ? Number(defaultCost) : null,
        currency: (currency || "BDT").toUpperCase(),
        leadTime: leadTime || null,
        isPreferred: isPreferred || false,
        notes: notes || null,
      },
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "PRODUCT_SUPPLIER_MAPPING_SAVE",
      targetType: "INVENTORY",
      targetId: mapping.id,
      details: { supplierId, productId, variationId, defaultCost, currency, isPreferred },
    });

    return NextResponse.json({ success: true, mapping });
  } catch (error: any) {
    console.error("Admin Supplier Mappings POST Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: "Mapping ID is required." }, { status: 400 });
    }

    await prisma.productSupplier.delete({ where: { id } });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "PRODUCT_SUPPLIER_MAPPING_DELETE",
      targetType: "INVENTORY",
      targetId: id,
    });

    return NextResponse.json({ success: true, message: "Mapping deleted." });
  } catch (error: any) {
    console.error("Admin Supplier Mappings DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
