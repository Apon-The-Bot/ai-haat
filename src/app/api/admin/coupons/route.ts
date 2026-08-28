import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = coupons.map((c) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      appliesTo: c.appliesTo,
      productIds: JSON.parse(c.productIds || "[]"),
      minOrderBDT: c.minOrderBDT,
      maxDiscountBDT: c.maxDiscountBDT,
      usageLimit: c.usageLimit,
      usedCount: c.usedCount,
      validUntil: c.validUntil.toISOString().split("T")[0],
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, coupons: formatted });
  } catch (error: any) {
    console.error("[Admin Coupons GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      appliesTo,
      productIds,
      minOrderBDT,
      maxDiscountBDT,
      usageLimit,
      validUntil,
    } = body;

    if (!code || !discountValue || !validUntil) {
      return NextResponse.json({ error: "Code, discount value, and validity date are required." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json({ error: `Coupon code "${cleanCode}" already exists.` }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountType: discountType === "FLAT_BDT" ? "FLAT_BDT" : "PERCENTAGE",
        discountValue: Number(discountValue),
        appliesTo: appliesTo === "SPECIFIC_PRODUCTS" ? "SPECIFIC_PRODUCTS" : "ALL",
        productIds: JSON.stringify(Array.isArray(productIds) ? productIds : []),
        minOrderBDT: Number(minOrderBDT) || 0,
        maxDiscountBDT: maxDiscountBDT ? Number(maxDiscountBDT) : null,
        usageLimit: Number(usageLimit) || 100,
        validUntil: new Date(validUntil),
        isActive: true,
      },
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "COUPON_CREATE",
      targetType: "COUPON",
      targetId: coupon.id,
      details: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("[Admin Coupons POST Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to create coupon" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const {
      id,
      code,
      isActive,
      usageLimit,
      validUntil,
      discountType,
      discountValue,
      appliesTo,
      productIds,
      minOrderBDT,
      maxDiscountBDT,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (code) updateData.code = code.trim().toUpperCase();
    if (typeof isActive === "boolean") updateData.isActive = isActive;
    if (discountType) updateData.discountType = discountType === "FLAT_BDT" ? "FLAT_BDT" : "PERCENTAGE";
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (appliesTo) updateData.appliesTo = appliesTo === "SPECIFIC_PRODUCTS" ? "SPECIFIC_PRODUCTS" : "ALL";
    if (productIds !== undefined) updateData.productIds = JSON.stringify(Array.isArray(productIds) ? productIds : []);
    if (minOrderBDT !== undefined) updateData.minOrderBDT = Number(minOrderBDT);
    if (maxDiscountBDT !== undefined) updateData.maxDiscountBDT = maxDiscountBDT ? Number(maxDiscountBDT) : null;
    if (usageLimit !== undefined) updateData.usageLimit = Number(usageLimit);
    if (validUntil) updateData.validUntil = new Date(validUntil);

    const updated = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "COUPON_UPDATE",
      targetType: "COUPON",
      targetId: updated.id,
      details: updateData,
    });

    return NextResponse.json({ success: true, coupon: updated });
  } catch (error: any) {
    console.error("[Admin Coupons PATCH Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const deleted = await prisma.coupon.delete({
      where: { id },
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "COUPON_DELETE",
      targetType: "COUPON",
      targetId: id,
      details: { code: deleted.code },
    });

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error: any) {
    console.error("[Admin Coupons DELETE Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to delete coupon" }, { status: 500 });
  }
}
