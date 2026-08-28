import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { getSupplierPerformanceMetrics } from "@/lib/commerce/suppliers";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("id");

    const suppliersWithMetrics = await getSupplierPerformanceMetrics(supplierId || undefined);

    if (supplierId) {
      if (suppliersWithMetrics.length === 0) {
        return NextResponse.json({ success: false, error: "Supplier not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, supplier: suppliersWithMetrics[0] });
    }

    return NextResponse.json({ success: true, suppliers: suppliersWithMetrics });
  } catch (error: any) {
    console.error("Admin Suppliers GET Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const { name, code, contactName, contactEmail, contactPhone, telegram, website, notes, status } = await req.json();

    if (!name || !code) {
      return NextResponse.json({ success: false, error: "Name and code are required." }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check duplicate code
    const existing = await prisma.supplier.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ success: false, error: `Supplier with code ${cleanCode} already exists.` }, { status: 400 });
    }

    const apiKey = "sup_live_" + crypto.randomBytes(16).toString("hex");
    const apiSecret = "sk_live_" + crypto.randomBytes(32).toString("hex");

    const supplier = await prisma.supplier.create({
      data: {
        name,
        code: cleanCode,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        telegram: telegram || null,
        website: website || null,
        notes: notes || null,
        status: status || "ACTIVE",
        apiKey,
        apiSecret,
        isActive: status !== "INACTIVE" && status !== "BLOCKED",
      }
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "SUPPLIER_CREATE",
      targetType: "INVENTORY",
      targetId: supplier.id,
      details: { code: supplier.code, name: supplier.name }
    });

    return NextResponse.json({ success: true, supplier });
  } catch (error: any) {
    console.error("Admin Suppliers POST Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const {
      id,
      name,
      contactName,
      contactEmail,
      contactPhone,
      telegram,
      website,
      status,
      isActive,
      notes,
      regenerateKey
    } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "Supplier ID required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (contactName !== undefined) updateData.contactName = contactName;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (telegram !== undefined) updateData.telegram = telegram;
    if (website !== undefined) updateData.website = website;
    if (notes !== undefined) updateData.notes = notes;

    if (status !== undefined) {
      updateData.status = status;
      updateData.isActive = status === "ACTIVE";
    } else if (isActive !== undefined) {
      updateData.isActive = isActive;
      updateData.status = isActive ? "ACTIVE" : "INACTIVE";
    }

    if (regenerateKey) {
      updateData.apiKey = "sup_live_" + crypto.randomBytes(16).toString("hex");
      updateData.apiSecret = "sk_live_" + crypto.randomBytes(32).toString("hex");
    }

    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "SUPPLIER_UPDATE",
      targetType: "INVENTORY",
      targetId: supplier.id,
      details: { updates: updateData }
    });

    return NextResponse.json({ success: true, supplier });
  } catch (error: any) {
    console.error("Admin Suppliers PATCH Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdminMfa();
    if (auth instanceof NextResponse) return auth;
    const { user } = auth;

    const { id } = await req.json();

    const supplier = await prisma.supplier.update({
      where: { id },
      data: { isActive: false, status: "INACTIVE" }
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "SUPPLIER_DEACTIVATE",
      targetType: "INVENTORY",
      targetId: supplier.id
    });

    return NextResponse.json({ success: true, supplier });
  } catch (error: any) {
    console.error("Admin Suppliers DELETE Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
