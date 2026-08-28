import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { generateSlug, ensureUniqueSlug } from "@/lib/commerce/products";

export async function getActiveCategories() {
  const [categories, productCounts] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.groupBy({
      by: ["category"],
      _count: { id: true },
      where: { status: "ACTIVE" },
    }),
  ]);

  const countMap: Record<string, number> = {};
  productCounts.forEach((c) => {
    countMap[c.category] = c._count.id;
  });

  return categories.map((cat) => ({
    ...cat,
    productCount: countMap[cat.name] || countMap[cat.slug] || 0,
  }));
}

export async function getAllCategories() {
  const [categories, productCounts] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
  ]);

  const countMap: Record<string, number> = {};
  productCounts.forEach((c) => {
    countMap[c.category] = c._count.id;
  });

  return categories.map((cat) => ({
    ...cat,
    productCount: countMap[cat.name] || countMap[cat.slug] || 0,
  }));
}

export async function createCategory(
  data: { name: string; slug?: string; description?: string; image?: string; displayOrder?: number; isActive?: boolean },
  adminUser?: { id: string; email: string }
) {
  const baseSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
  const slug = await ensureUniqueSlug(baseSlug);

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      image: data.image || null,
      displayOrder: data.displayOrder || 0,
      isActive: data.isActive ?? true,
    },
  });

  if (adminUser) {
    await logAdminAudit({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      action: "CATEGORY_CREATE",
      targetType: "CATEGORY",
      targetId: category.id,
      details: { name: category.name, slug: category.slug },
    }).catch(console.error);
  }

  return category;
}

export async function updateCategory(
  id: string,
  data: { name?: string; slug?: string; description?: string; image?: string; displayOrder?: number; isActive?: boolean },
  adminUser?: { id: string; email: string }
) {
  const category = await prisma.category.update({
    where: { id },
    data,
  });

  if (adminUser) {
    await logAdminAudit({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      action: "CATEGORY_UPDATE",
      targetType: "CATEGORY",
      targetId: id,
      details: data,
    }).catch(console.error);
  }

  return category;
}

export async function deleteCategory(id: string, adminUser?: { id: string; email: string }) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error("Category not found");

  const productCount = await prisma.product.count({
    where: {
      OR: [{ category: category.name }, { category: category.slug }],
    },
  });

  if (productCount > 0) {
    throw new Error(`Cannot delete category "${category.name}" because it has ${productCount} assigned products. Reassign them first.`);
  }

  const deleted = await prisma.category.delete({ where: { id } });

  if (adminUser) {
    await logAdminAudit({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      action: "CATEGORY_DELETE",
      targetType: "CATEGORY",
      targetId: id,
      details: { name: category.name },
    }).catch(console.error);
  }

  return deleted;
}
