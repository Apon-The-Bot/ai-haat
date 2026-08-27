import { prisma } from "@/lib/prisma";
import { Product } from "@/types";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const productsFile = path.join(dataDir, "products.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(productsFile)) {
    fs.writeFileSync(productsFile, JSON.stringify([], null, 2), "utf-8");
  }
}

function getLocalProducts(): Product[] {
  ensureDir();
  try {
    const raw = fs.readFileSync(productsFile, "utf-8");
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

function saveLocalProducts(products: Product[]) {
  ensureDir();
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), "utf-8");
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      include: {
        variations: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map((p) => {
        let features: string[] = [];
        let categories: string[] = [p.category];
        try {
          features = JSON.parse(p.features || "[]");
        } catch {
          features = [p.features || ""];
        }
        try {
          categories = JSON.parse(p.categories || "[]");
        } catch {
          categories = [p.category];
        }

        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.category,
          categories,
          image: p.image,
          rating: p.rating,
          ratingCount: p.ratingCount,
          viewCount: p.viewCount,
          badge: p.badge || undefined,
          minPriceBDT: p.minPriceBDT,
          maxPriceBDT: p.maxPriceBDT,
          shortDesc: p.shortDesc,
          descriptionBangla: p.descriptionBangla,
          descriptionEnglish: p.descriptionEnglish,
          features,
          info: {
            deliveryTime: p.deliveryTime,
            deliveryType: p.deliveryType,
            warranty: p.warranty,
            validity: p.validity,
            deviceSupport: p.deviceSupport,
          },
          variations: p.variations.map((v) => ({
            id: v.id,
            name: v.name,
            priceBDT: v.priceBDT,
            inStock: v.inStock,
            description: v.description || "",
          })),
          inStock: p.inStock,
          isFeatured: p.isFeatured,
          isBestProduct: p.isBestProduct,
          isBestSelling: p.isBestSelling,
          reviews: [],
        };
      });
    }
  } catch (err) {
    console.warn("[Prisma getAllProducts fallback to local]:", err);
  }

  return getLocalProducts();
}

export async function createProduct(prod: Product): Promise<Product> {
  const local = getLocalProducts();
  const filtered = local.filter((p) => p.id !== prod.id && p.slug !== prod.slug);
  filtered.unshift(prod);
  saveLocalProducts(filtered);

  try {
    await prisma.product.create({
      data: {
        id: prod.id,
        slug: prod.slug,
        name: prod.name,
        category: prod.category,
        categories: JSON.stringify(prod.categories || [prod.category]),
        image: prod.image,
        rating: prod.rating || 5.0,
        ratingCount: prod.ratingCount || 1,
        viewCount: prod.viewCount || 100,
        badge: prod.badge || null,
        minPriceBDT: prod.minPriceBDT,
        maxPriceBDT: prod.maxPriceBDT,
        shortDesc: prod.shortDesc || "",
        descriptionBangla: prod.descriptionBangla || prod.shortDesc || "",
        descriptionEnglish: prod.descriptionEnglish || prod.shortDesc || "",
        features: JSON.stringify(prod.features || []),
        deliveryTime: prod.info?.deliveryTime || "৫ থেকে ১৫ মিনিট",
        deliveryType: prod.info?.deliveryType || "ইনস্ট্যান্ট ডেলিভারি",
        warranty: prod.info?.warranty || "সম্পূর্ণ মেয়াদের রিপ্লেসমেন্ট ওয়ারেন্টি",
        validity: prod.info?.validity || "১ মাস / ১ বছর",
        deviceSupport: prod.info?.deviceSupport || "সকল ডিভাইস",
        inStock: prod.inStock ?? true,
        isFeatured: prod.isFeatured ?? false,
        isBestProduct: prod.isBestProduct ?? false,
        isBestSelling: prod.isBestSelling ?? false,
        variations: {
          create: (prod.variations || []).map((v) => ({
            id: v.id,
            name: v.name,
            priceBDT: v.priceBDT,
            description: v.description || null,
            inStock: v.inStock ?? true,
          })),
        },
      },
    });
  } catch (err) {
    console.error("[Prisma createProduct error]:", err);
  }

  return prod;
}

export async function updateProductInDB(idOrSlug: string, prod: Partial<Product>): Promise<Product | null> {
  const local = getLocalProducts();
  const idx = local.findIndex((p) => p.id === idOrSlug || p.slug === idOrSlug);
  if (idx >= 0) {
    local[idx] = { ...local[idx], ...prod };
    saveLocalProducts(local);
  }

  try {
    const updateData: any = {};
    if (prod.name !== undefined) updateData.name = prod.name;
    if (prod.category !== undefined) updateData.category = prod.category;
    if (prod.image !== undefined) updateData.image = prod.image;
    if (prod.minPriceBDT !== undefined) updateData.minPriceBDT = prod.minPriceBDT;
    if (prod.maxPriceBDT !== undefined) updateData.maxPriceBDT = prod.maxPriceBDT;
    if (prod.shortDesc !== undefined) updateData.shortDesc = prod.shortDesc;
    if (prod.inStock !== undefined) updateData.inStock = prod.inStock;
    if (prod.isFeatured !== undefined) updateData.isFeatured = prod.isFeatured;
    if (prod.isBestProduct !== undefined) updateData.isBestProduct = prod.isBestProduct;
    if (prod.isBestSelling !== undefined) updateData.isBestSelling = prod.isBestSelling;
    if (prod.badge !== undefined) updateData.badge = prod.badge;

    await prisma.product.updateMany({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      data: updateData,
    });
  } catch (err) {
    console.error("[Prisma updateProduct error]:", err);
  }

  return local[idx] || null;
}

export async function deleteProductFromDB(idOrSlug: string): Promise<boolean> {
  let local = getLocalProducts();
  local = local.filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
  saveLocalProducts(local);

  try {
    await prisma.product.deleteMany({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });
  } catch (err) {
    console.error("[Prisma deleteProduct error]:", err);
  }

  return true;
}
