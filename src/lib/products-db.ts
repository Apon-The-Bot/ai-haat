import { prisma } from "@/lib/prisma";
import { Product } from "@/types";
import { PRODUCTS } from "@/data/products";
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

export async function getAllProducts(includeHidden = false): Promise<Product[]> {
  try {
    const whereClause = includeHidden ? { status: "ACTIVE" } : { status: "ACTIVE", visibility: "PUBLIC" };
    const dbProducts = await prisma.product.findMany({
      where: whereClause as any,
      include: {
        variations: {
          orderBy: { sortOrder: "asc" }
        },
        digitalStocks: {
          where: { status: "AVAILABLE" },
          select: { id: true, variationId: true }
        }
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

        const availableStocks = p.digitalStocks || [];
        const isAutoStock = p.fulfillmentType === "AUTO_STOCK";
        const totalAvailableStock = availableStocks.length;

        const variations = (p.variations || []).map((v) => {
          const vStocks = availableStocks.filter(
            (s) => s.variationId === v.id || !s.variationId
          );
          const vStockCount = vStocks.length;
          // In AUTO_STOCK mode, stock is dynamic: inStock is true if stockCount > 0
          const isVarInStock = isAutoStock
            ? (vStockCount > 0)
            : v.inStock;

          return {
            id: v.id,
            name: v.name,
            priceBDT: v.priceBDT,
            regularPriceBDT: v.regularPriceBDT,
            salePriceBDT: v.salePriceBDT,
            inStock: isVarInStock,
            stockCount: vStockCount,
            fulfillmentType: v.fulfillmentType || p.fulfillmentType,
            description: v.description || "",
            duration: v.duration || "",
            isDefault: v.isDefault ?? false,
          };
        });

        // Determine product inStock state
        const isAnyVarInStock = variations.length > 0
          ? variations.some((v) => v.inStock)
          : (isAutoStock ? totalAvailableStock > 0 : p.inStock);

        const isProdInStock = isAutoStock
          ? totalAvailableStock > 0 && isAnyVarInStock
          : p.inStock && isAnyVarInStock;

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
          regularPriceBDT: p.regularPriceBDT,
          salePriceBDT: p.salePriceBDT,
          status: p.status as any,
          visibility: p.visibility as any,
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
          variations,
          inStock: isProdInStock,
          digitalStock: totalAvailableStock,
          stockCount: totalAvailableStock,
          fulfillmentType: p.fulfillmentType,
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

  const local = getLocalProducts();
  if (local && local.length > 0) {
    return local;
  }
  return PRODUCTS;
}

export async function getProductById(id: string): Promise<Product | null> {
  return getProductBySlug(id);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const dbProduct = await prisma.product.findFirst({
      where: {
        OR: [{ slug: slug }, { id: slug }],
        status: "ACTIVE",
      },
      include: {
        variations: {
          orderBy: { sortOrder: "asc" }
        },
        digitalStocks: {
          where: { status: "AVAILABLE" },
          select: { id: true, variationId: true }
        },
        reviews: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (dbProduct) {
      let features: string[] = [];
      let categories: string[] = [dbProduct.category];
      try {
        features = JSON.parse(dbProduct.features || "[]");
      } catch {
        features = [dbProduct.features || ""];
      }
      try {
        categories = JSON.parse(dbProduct.categories || "[]");
      } catch {
        categories = [dbProduct.category];
      }

      const availableStocks = dbProduct.digitalStocks || [];
      const isAutoStock = dbProduct.fulfillmentType === "AUTO_STOCK";
      const totalAvailableStock = availableStocks.length;

      const variations = (dbProduct.variations || []).map((v) => {
        const vStocks = availableStocks.filter(
          (s) => s.variationId === v.id || !s.variationId
        );
        const vStockCount = vStocks.length;
        // In AUTO_STOCK mode, stock is dynamic: inStock is true if stockCount > 0
        const isVarInStock = isAutoStock
          ? (vStockCount > 0)
          : v.inStock;

        return {
          id: v.id,
          name: v.name,
          priceBDT: v.priceBDT,
          regularPriceBDT: v.regularPriceBDT,
          salePriceBDT: v.salePriceBDT,
          inStock: isVarInStock,
          stockCount: vStockCount,
          fulfillmentType: v.fulfillmentType || dbProduct.fulfillmentType,
          description: v.description || "",
          duration: v.duration || "",
          isDefault: v.isDefault ?? false,
        };
      });

      // Determine product inStock state
      const isAnyVarInStock = variations.length > 0
        ? variations.some((v) => v.inStock)
        : (isAutoStock ? totalAvailableStock > 0 : dbProduct.inStock);

      const isProdInStock = isAutoStock
        ? totalAvailableStock > 0 && isAnyVarInStock
        : dbProduct.inStock && isAnyVarInStock;

      return {
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        category: dbProduct.category,
        categories,
        image: dbProduct.image,
        rating: dbProduct.rating,
        ratingCount: dbProduct.ratingCount,
        viewCount: dbProduct.viewCount,
        badge: dbProduct.badge || undefined,
        minPriceBDT: dbProduct.minPriceBDT,
        maxPriceBDT: dbProduct.maxPriceBDT,
        regularPriceBDT: dbProduct.regularPriceBDT,
        salePriceBDT: dbProduct.salePriceBDT,
        status: dbProduct.status as any,
        visibility: dbProduct.visibility as any,
        shortDesc: dbProduct.shortDesc,
        descriptionBangla: dbProduct.descriptionBangla,
        descriptionEnglish: dbProduct.descriptionEnglish,
        features,
        info: {
          deliveryTime: dbProduct.deliveryTime,
          deliveryType: dbProduct.deliveryType,
          warranty: dbProduct.warranty,
          validity: dbProduct.validity,
          deviceSupport: dbProduct.deviceSupport,
        },
        variations,
        inStock: isProdInStock,
        digitalStock: totalAvailableStock,
        stockCount: totalAvailableStock,
        fulfillmentType: dbProduct.fulfillmentType,
        isFeatured: dbProduct.isFeatured,
        isBestProduct: dbProduct.isBestProduct,
        isBestSelling: dbProduct.isBestSelling,
        reviews: (dbProduct.reviews || []).map((r) => ({
          id: r.id,
          author: r.author,
          rating: r.rating,
          date: r.createdAt.toISOString().split("T")[0],
          comment: r.comment,
          isVerifiedPurchase: r.isVerifiedPurchase,
        })),
      };
    }
  } catch (err) {
    console.warn("[Prisma getProductBySlug fallback]:", err);
  }

  const local = getLocalProducts();
  const localMatch = local.find((p) => p.slug === slug || p.id === slug);
  if (localMatch) return localMatch;

  const staticMatch = PRODUCTS.find((p) => p.slug === slug || p.id === slug);
  return staticMatch || null;
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
