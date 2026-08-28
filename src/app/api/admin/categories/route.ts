import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
    });

    // Also get product counts per category name
    const products = await prisma.product.findMany({
      select: { category: true },
    });

    const categoryCounts: Record<string, number> = {};
    for (const p of products) {
      if (p.category) {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      }
    }

    const formatted = categories.map((c) => ({
      ...c,
      productCount: categoryCounts[c.name] || 0,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, categories: formatted });
  } catch (error: any) {
    console.error("[Categories GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { name, slug, description, image, displayOrder, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const cleanSlug = slug
      ? slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")
      : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description ? description.trim() : null,
        image: image || null,
        displayOrder: Number(displayOrder) || 0,
        isActive: isActive !== false,
      },
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "CATEGORY_CREATE",
      targetType: "CATEGORY",
      targetId: newCategory.id,
      details: { name: newCategory.name, slug: newCategory.slug },
    });

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error: any) {
    console.error("[Categories POST Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to create category" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { id, name, slug, description, image, displayOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (slug) updateData.slug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (image !== undefined) updateData.image = image || null;
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "CATEGORY_UPDATE",
      targetType: "CATEGORY",
      targetId: updated.id,
      details: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: updated,
    });
  } catch (error: any) {
    console.error("[Categories PATCH Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to update category" }, { status: 500 });
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
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const targetCat = await prisma.category.findUnique({ where: { id } });
    if (!targetCat) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if any product is assigned to this category
    const linkedProducts = await prisma.product.count({
      where: { category: targetCat.name },
    });

    if (linkedProducts > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category "${targetCat.name}" because ${linkedProducts} product(s) are currently assigned to it. Reassign or edit those products first.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "CATEGORY_DELETE",
      targetType: "CATEGORY",
      targetId: id,
      details: { name: targetCat.name },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error: any) {
    console.error("[Categories DELETE Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete category" }, { status: 500 });
  }
}
