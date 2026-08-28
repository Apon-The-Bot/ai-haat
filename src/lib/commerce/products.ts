import { prisma } from "@/lib/prisma";
import { ProductStatus, ProductType, ProductVisibility, FulfillmentType } from "@prisma/client";
import { logAdminAudit } from "@/lib/audit-logger";
import { validateProductInvariants } from "@/lib/commerce/resolver";

export interface AdminProductCreateInput {
  name: string;
  slug?: string;
  category: string;
  categories?: string[];
  image?: string;
  gallery?: string[];
  minPriceBDT?: number;
  maxPriceBDT?: number;
  regularPriceBDT?: number;
  salePriceBDT?: number;
  shortDesc?: string;
  descriptionBangla?: string;
  descriptionEnglish?: string;
  features?: string[];
  specifications?: Array<{ label: string; value: string }>;
  deliveryTime?: string;
  deliveryType?: string;
  deliverySla?: string;
  warranty?: string;
  validity?: string;
  deviceSupport?: string;
  requirements?: string;
  productType?: ProductType;
  fulfillmentType?: FulfillmentType;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  warrantyDays?: number;
  replacementAllowed?: boolean;
  refundAllowed?: boolean;
  lowStockThreshold?: number;
  costPriceBDT?: number;
  allowBackorder?: boolean;
  isFeatured?: boolean;
  isBestProduct?: boolean;
  isBestSelling?: boolean;
  inStock?: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  variations?: Array<{
    name: string;
    sku?: string;
    priceBDT?: number;
    regularPriceBDT?: number;
    salePriceBDT?: number;
    costPriceBDT?: number;
    lowStockThreshold?: number;
    description?: string;
    duration?: string;
    deliverySla?: string;
    replacementAllowed?: boolean;
    refundAllowed?: boolean;
    inStock?: boolean;
    fulfillmentType?: FulfillmentType;
    warrantyDays?: number;
    sortOrder?: number;
    isDefault?: boolean;
  }>;
}

export interface AdminProductUpdateInput extends Partial<AdminProductCreateInput> {
  variationsToUpsert?: Array<{
    id?: string;
    name: string;
    sku?: string;
    priceBDT?: number;
    regularPriceBDT?: number;
    salePriceBDT?: number;
    costPriceBDT?: number;
    lowStockThreshold?: number;
    description?: string;
    duration?: string;
    deliverySla?: string;
    replacementAllowed?: boolean;
    refundAllowed?: boolean;
    inStock?: boolean;
    fulfillmentType?: FulfillmentType;
    warrantyDays?: number;
    sortOrder?: number;
    isDefault?: boolean;
  }>;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let uniqueSlug = slug;
  let counter = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: uniqueSlug } });
    if (!existing || (excludeId && existing.id === excludeId)) {
      break;
    }
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
}

export async function getPublicProducts(filters: {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  status?: string;
}) {
  const { category, search, sort, page = 1, limit = 100, featured, status } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (category && category !== "ALL") {
    where.category = category;
  }
  if (featured !== undefined) {
    where.isFeatured = featured;
  }
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { slug: { contains: search } },
      { category: { contains: search } },
      { shortDesc: { contains: search } },
    ];
  }

  let orderBy: any = { sortOrder: "asc" };
  if (sort === "price_asc") orderBy = { minPriceBDT: "asc" };
  else if (sort === "price_desc") orderBy = { minPriceBDT: "desc" };
  else if (sort === "newest") orderBy = { createdAt: "desc" };
  else if (sort === "rating") orderBy = { rating: "desc" };

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          variations: {
            orderBy: { sortOrder: "asc" },
          },
          digitalStocks: {
            where: { status: "AVAILABLE" },
            select: { id: true, variationId: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

  const data = products.map((p) => {
    let featuresList: string[] = [];
    try {
      featuresList = JSON.parse(p.features || "[]");
    } catch {
      featuresList = [];
    }

    let categoriesList: string[] = [];
    try {
      categoriesList = JSON.parse(p.categories || "[]");
    } catch {
      categoriesList = [p.category];
    }

    const availableStocks = p.digitalStocks || [];
    const isAutoStock = p.fulfillmentType === "AUTO_STOCK";
    const totalAvailable = availableStocks.length;

    const variations = p.variations.map((v) => {
      const vStocks = availableStocks.filter((s) => s.variationId === v.id || !s.variationId);
      const vStockCount = vStocks.length;
      const isVarInStock = isAutoStock ? vStockCount > 0 : v.inStock;

      return {
        id: v.id,
        name: v.name,
        priceBDT: v.priceBDT,
        regularPriceBDT: v.regularPriceBDT || v.priceBDT,
        salePriceBDT: v.salePriceBDT || undefined,
        duration: v.duration,
        inStock: isVarInStock,
        availableStockCount: vStockCount,
        description: v.description,
      };
    });

    const isAnyVarInStock = variations.length > 0
      ? variations.some((v) => v.inStock)
      : (isAutoStock ? totalAvailable > 0 : p.inStock);

    const isProdInStock = isAutoStock
      ? totalAvailable > 0 && isAnyVarInStock
      : p.inStock && isAnyVarInStock;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      categories: categoriesList,
      image: p.image,
      badge: p.badge || (p.isBestProduct ? "Best Product" : undefined),
      minPriceBDT: p.minPriceBDT,
      maxPriceBDT: p.maxPriceBDT,
      regularPriceBDT: p.regularPriceBDT || p.minPriceBDT,
      salePriceBDT: p.salePriceBDT || undefined,
      shortDesc: p.shortDesc,
      rating: p.rating,
      ratingCount: p.ratingCount,
      viewCount: p.viewCount,
      inStock: isProdInStock,
      availableStockCount: totalAvailable,
      isFeatured: p.isFeatured,
      isBestProduct: p.isBestProduct,
      isBestSelling: p.isBestSelling,
      productType: p.productType,
      fulfillmentType: p.fulfillmentType,
      deliveryTime: p.deliveryTime,
      deliveryType: p.deliveryType,
      deliverySla: p.deliverySla,
      features: featuresList,
      variations,
    };
  });

    return {
      success: true,
      products: data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (err: any) {
    console.warn("[getPublicProducts DB error]:", err);
    return {
      success: false,
      error: err.message,
      products: [],
      pagination: {
        total: 0,
        page: 1,
        limit,
        totalPages: 0,
      },
    };
  }
}

export async function getPublicProductBySlug(slug: string, previewToken?: boolean) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      variations: {
        orderBy: { sortOrder: "asc" },
      },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      digitalStocks: {
        where: { status: "AVAILABLE" },
        select: { id: true, variationId: true },
      },
    },
  });

  if (!product) {
    return null;
  }

  if (product.status === "DRAFT" && !previewToken) {
    return null;
  }

  let featuresList: string[] = [];
  try {
    featuresList = JSON.parse(product.features || "[]");
  } catch {
    featuresList = [];
  }

  let categoriesList: string[] = [];
  try {
    categoriesList = JSON.parse(product.categories || "[]");
  } catch {
    categoriesList = [product.category];
  }

  let galleryList: string[] = [];
  try {
    galleryList = JSON.parse(product.gallery || "[]");
  } catch {
    galleryList = [];
  }

  let specsList: Array<{ label: string; value: string }> = [];
  try {
    specsList = JSON.parse(product.specifications || "[]");
  } catch {
    specsList = [];
  }

  const stockMap: Record<string, number> = {};
  product.digitalStocks.forEach((s) => {
    const key = s.variationId || "product";
    stockMap[key] = (stockMap[key] || 0) + 1;
  });

  const isAutoStock = product.fulfillmentType === "AUTO_STOCK";
  const totalAvailable = product.digitalStocks.length;

  const formattedVariations = product.variations.map((v) => {
    const vStockCount = stockMap[v.id] !== undefined ? stockMap[v.id] : (stockMap["product"] || totalAvailable);
    const isVarInStock = isAutoStock ? vStockCount > 0 : v.inStock;
    return {
      id: v.id,
      name: v.name,
      priceBDT: v.priceBDT,
      regularPriceBDT: v.regularPriceBDT || v.priceBDT,
      salePriceBDT: v.salePriceBDT || undefined,
      duration: v.duration,
      inStock: isVarInStock,
      stockCount: vStockCount,
      availableStockCount: vStockCount,
      description: v.description,
      fulfillmentType: v.fulfillmentType || product.fulfillmentType,
      warrantyDays: v.warrantyDays || product.warrantyDays,
    };
  });

  const isAnyVarInStock = formattedVariations.length > 0
    ? formattedVariations.some((v) => v.inStock)
    : (isAutoStock ? totalAvailable > 0 : product.inStock);

  const isProdInStock = isAutoStock
    ? totalAvailable > 0 && isAnyVarInStock
    : product.inStock && isAnyVarInStock;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    categories: categoriesList,
    image: product.image,
    gallery: galleryList,
    rating: product.rating,
    ratingCount: product.ratingCount,
    viewCount: product.viewCount,
    badge: product.badge || undefined,
    minPriceBDT: product.minPriceBDT,
    maxPriceBDT: product.maxPriceBDT,
    regularPriceBDT: product.regularPriceBDT || product.minPriceBDT,
    salePriceBDT: product.salePriceBDT || undefined,
    shortDesc: product.shortDesc,
    descriptionBangla: product.descriptionBangla,
    descriptionEnglish: product.descriptionEnglish,
    features: featuresList,
    specifications: specsList,
    info: {
      deliveryTime: product.deliveryTime,
      deliveryType: product.deliveryType,
      warranty: product.warranty,
      validity: product.validity,
      deviceSupport: product.deviceSupport,
    },
    deliverySla: product.deliverySla,
    productType: product.productType,
    fulfillmentType: product.fulfillmentType,
    warrantyDays: product.warrantyDays,
    replacementAllowed: product.replacementAllowed,
    refundAllowed: product.refundAllowed,
    inStock: isProdInStock,
    availableStockCount: totalAvailable,
    digitalStock: totalAvailable,
    stockCount: totalAvailable,
    isFeatured: product.isFeatured,
    isBestProduct: product.isBestProduct,
    isBestSelling: product.isBestSelling,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    seoKeywords: product.seoKeywords,
    variations: formattedVariations,
    reviews: product.reviews.map((r) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      date: r.createdAt.toISOString().split("T")[0],
      comment: r.comment,
      isVerifiedPurchase: r.isVerifiedPurchase,
    })),
  };
}

export async function getAdminProducts(filters: {
  search?: string;
  category?: string;
  status?: ProductStatus;
  fulfillmentType?: FulfillmentType;
  inStock?: boolean;
  page?: number;
  limit?: number;
}) {
  const { search, category, status, fulfillmentType, inStock, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (status) where.status = status;
  if (fulfillmentType) where.fulfillmentType = fulfillmentType;
  if (category && category !== "ALL") where.category = category;
  if (inStock !== undefined) where.inStock = inStock;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { slug: { contains: search } },
      { category: { contains: search } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        variations: true,
        digitalStocks: {
          select: { id: true, status: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const data = products.map((p) => {
    const stockCounts = {
      available: p.digitalStocks.filter((s) => s.status === "AVAILABLE").length,
      reserved: p.digitalStocks.filter((s) => s.status === "RESERVED").length,
      delivered: p.digitalStocks.filter((s) => s.status === "DELIVERED").length,
      invalid: p.digitalStocks.filter((s) => s.status === "INVALID").length,
      expired: p.digitalStocks.filter((s) => s.status === "EXPIRED").length,
    };

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      image: p.image,
      minPriceBDT: p.minPriceBDT,
      maxPriceBDT: p.maxPriceBDT,
      regularPriceBDT: p.regularPriceBDT,
      salePriceBDT: p.salePriceBDT,
      status: p.status,
      visibility: p.visibility,
      fulfillmentType: p.fulfillmentType,
      productType: p.productType,
      inStock: p.inStock,
      isFeatured: p.isFeatured,
      isBestProduct: p.isBestProduct,
      isBestSelling: p.isBestSelling,
      totalVariationsCount: p.variations.length,
      activeVariationsCount: p.variations.filter((v) => v.inStock).length,
      stockCounts,
      updatedAt: p.updatedAt,
      createdAt: p.createdAt,
    };
  });

  return {
    success: true,
    products: data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAdminProductById(id: string) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      variations: {
        orderBy: { sortOrder: "asc" },
      },
      digitalStocks: {
        select: { id: true, status: true, variationId: true, expiryDate: true },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
}

export async function createProduct(data: AdminProductCreateInput, adminUser: { id: string; email: string }) {
  if (!data.name) throw new Error("Product name is required");

  const validation = validateProductInvariants({
    name: data.name,
    productType: data.productType,
    fulfillmentType: data.fulfillmentType,
    variations: data.variations,
  });

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
  }

  const baseSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
  const uniqueSlug = await ensureUniqueSlug(baseSlug);

  const regularPrice = data.regularPriceBDT ?? data.minPriceBDT ?? 0;
  const salePrice = data.salePriceBDT;
  if (salePrice !== undefined && salePrice >= regularPrice && regularPrice > 0) {
    throw new Error("Sale price must be less than regular price");
  }

  const variationsInput = data.variations || [];
  let minPrice = regularPrice;
  let maxPrice = regularPrice;

  if (variationsInput.length > 0) {
    const prices = variationsInput.map((v) => v.salePriceBDT || v.priceBDT || v.regularPriceBDT || 0);
    minPrice = Math.min(...prices);
    maxPrice = Math.max(...prices);
  }

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name: data.name,
        slug: uniqueSlug,
        category: data.category || "AI Tools",
        categories: JSON.stringify(data.categories || [data.category || "AI Tools"]),
        image: data.image || "/images/placeholders/aihaat-placeholder.svg",
        gallery: JSON.stringify(data.gallery || []),
        minPriceBDT: minPrice,
        maxPriceBDT: maxPrice,
        regularPriceBDT: data.regularPriceBDT || regularPrice,
        salePriceBDT: data.salePriceBDT || null,
        shortDesc: data.shortDesc || "Official digital subscription.",
        descriptionBangla: data.descriptionBangla || data.shortDesc || "অফিসিয়াল ডিজিটাল সেবা।",
        descriptionEnglish: data.descriptionEnglish || data.shortDesc || "Official digital service.",
        features: JSON.stringify(data.features || ["Instant Delivery", "Full Warranty"]),
        specifications: JSON.stringify(data.specifications || []),
        deliveryTime: data.deliveryTime || "৫ থেকে ১৫ মিনিট",
        deliveryType: data.deliveryType || "ইনস্ট্যান্ট ডেলিভারি",
        deliverySla: data.deliverySla || "Instant",
        warranty: data.warranty || "সম্পূর্ণ মেয়াদের রিপ্লেসমেন্ট ওয়ারেন্টি",
        validity: data.validity || "১ মাস / ১ বছর",
        deviceSupport: data.deviceSupport || "সকল ডিভাইস",
        requirements: data.requirements || null,
        productType: data.productType || "SUBSCRIPTION",
        fulfillmentType: data.fulfillmentType || "AUTO_STOCK",
        status: data.status || "DRAFT",
        visibility: data.visibility || "PUBLIC",
        warrantyDays: data.warrantyDays ?? 30,
        replacementAllowed: data.replacementAllowed ?? true,
        refundAllowed: data.refundAllowed ?? true,
        lowStockThreshold: data.lowStockThreshold ?? 3,
        costPriceBDT: data.costPriceBDT || null,
        allowBackorder: data.allowBackorder ?? true,
        isFeatured: data.isFeatured ?? false,
        isBestProduct: data.isBestProduct ?? false,
        isBestSelling: data.isBestSelling ?? false,
        inStock: data.inStock ?? true,
        sortOrder: data.sortOrder ?? 0,
        seoTitle: data.seoTitle || data.name,
        seoDescription: data.seoDescription || data.shortDesc,
        seoKeywords: data.seoKeywords || null,
        variations: {
          create: variationsInput.map((v, i) => ({
            name: v.name,
            sku: v.sku || null,
            priceBDT: v.salePriceBDT || v.priceBDT || v.regularPriceBDT || 0,
            regularPriceBDT: v.regularPriceBDT || v.priceBDT || 0,
            salePriceBDT: v.salePriceBDT || null,
            costPriceBDT: v.costPriceBDT || null,
            lowStockThreshold: v.lowStockThreshold || null,
            description: v.description || null,
            duration: v.duration || null,
            deliverySla: v.deliverySla || null,
            replacementAllowed: v.replacementAllowed ?? null,
            refundAllowed: v.refundAllowed ?? null,
            inStock: v.inStock ?? true,
            fulfillmentType: v.fulfillmentType || null,
            warrantyDays: v.warrantyDays || null,
            sortOrder: v.sortOrder ?? i,
            isDefault: v.isDefault ?? (i === 0),
          })),
        },
      },
      include: { variations: true },
    });

    return created;
  });

  await logAdminAudit({
    actorId: adminUser.id,
    actorEmail: adminUser.email,
    action: "PRODUCT_CREATE",
    targetType: "PRODUCT",
    targetId: product.id,
    details: { name: product.name, slug: product.slug, category: product.category, status: product.status },
  }).catch((e) => console.error("Audit log error:", e));

  return product;
}

export async function updateProduct(id: string, data: AdminProductUpdateInput, adminUser: { id: string; email: string }) {
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variations: true },
  });

  if (!existing) {
    throw new Error("Product not found");
  }

  let uniqueSlug = existing.slug;
  if (data.slug && data.slug !== existing.slug) {
    uniqueSlug = await ensureUniqueSlug(generateSlug(data.slug), id);
  }

  const regularPrice = data.regularPriceBDT ?? existing.regularPriceBDT ?? existing.minPriceBDT;
  const salePrice = data.salePriceBDT !== undefined ? data.salePriceBDT : existing.salePriceBDT;
  if (salePrice && regularPrice && salePrice >= regularPrice) {
    throw new Error("Sale price must be less than regular price");
  }

  const updatedProduct = await prisma.$transaction(async (tx) => {
    // 1. Update basic product attributes
    const updateData: any = {
      ...(data.name && { name: data.name }),
      ...(uniqueSlug && { slug: uniqueSlug }),
      ...(data.category && { category: data.category }),
      ...(data.categories && { categories: JSON.stringify(data.categories) }),
      ...(data.image && { image: data.image }),
      ...(data.gallery && { gallery: JSON.stringify(data.gallery) }),
      ...(data.shortDesc !== undefined && { shortDesc: data.shortDesc }),
      ...(data.descriptionBangla !== undefined && { descriptionBangla: data.descriptionBangla }),
      ...(data.descriptionEnglish !== undefined && { descriptionEnglish: data.descriptionEnglish }),
      ...(data.features && { features: JSON.stringify(data.features) }),
      ...(data.specifications && { specifications: JSON.stringify(data.specifications) }),
      ...(data.deliveryTime !== undefined && { deliveryTime: data.deliveryTime }),
      ...(data.deliveryType !== undefined && { deliveryType: data.deliveryType }),
      ...(data.deliverySla !== undefined && { deliverySla: data.deliverySla }),
      ...(data.warranty !== undefined && { warranty: data.warranty }),
      ...(data.validity !== undefined && { validity: data.validity }),
      ...(data.deviceSupport !== undefined && { deviceSupport: data.deviceSupport }),
      ...(data.requirements !== undefined && { requirements: data.requirements }),
      ...(data.productType && { productType: data.productType }),
      ...(data.fulfillmentType && { fulfillmentType: data.fulfillmentType }),
      ...(data.status && { status: data.status }),
      ...(data.visibility && { visibility: data.visibility }),
      ...(data.warrantyDays !== undefined && { warrantyDays: data.warrantyDays }),
      ...(data.replacementAllowed !== undefined && { replacementAllowed: data.replacementAllowed }),
      ...(data.refundAllowed !== undefined && { refundAllowed: data.refundAllowed }),
      ...(data.lowStockThreshold !== undefined && { lowStockThreshold: data.lowStockThreshold }),
      ...(data.costPriceBDT !== undefined && { costPriceBDT: data.costPriceBDT }),
      ...(data.allowBackorder !== undefined && { allowBackorder: data.allowBackorder }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.isBestProduct !== undefined && { isBestProduct: data.isBestProduct }),
      ...(data.isBestSelling !== undefined && { isBestSelling: data.isBestSelling }),
      ...(data.inStock !== undefined && { inStock: data.inStock }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
      ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
      ...(data.seoKeywords !== undefined && { seoKeywords: data.seoKeywords }),
      ...(data.regularPriceBDT !== undefined && { regularPriceBDT: data.regularPriceBDT }),
      ...(data.salePriceBDT !== undefined && { salePriceBDT: data.salePriceBDT }),
    };

    // 2. Synchronize variations if provided
    if (data.variationsToUpsert && data.variationsToUpsert.length > 0) {
      const incomingIds = data.variationsToUpsert.map((v) => v.id).filter(Boolean) as string[];

      // Handle removed variations safely (never delete if orders exist)
      for (const oldVar of existing.variations) {
        if (!incomingIds.includes(oldVar.id)) {
          const hasOrders = await tx.orderItem.findFirst({ where: { variationId: oldVar.id } });
          if (hasOrders) {
            await tx.variation.update({ where: { id: oldVar.id }, data: { inStock: false } });
          } else {
            await tx.variation.delete({ where: { id: oldVar.id } });
          }
        }
      }

      // Upsert incoming variations
      for (let i = 0; i < data.variationsToUpsert.length; i++) {
        const v = data.variationsToUpsert[i];
        const effectivePrice = v.salePriceBDT || v.priceBDT || v.regularPriceBDT || 0;
        const varData = {
          name: v.name,
          sku: v.sku || null,
          priceBDT: effectivePrice,
          regularPriceBDT: v.regularPriceBDT || v.priceBDT || 0,
          salePriceBDT: v.salePriceBDT || null,
          costPriceBDT: v.costPriceBDT || null,
          lowStockThreshold: v.lowStockThreshold || null,
          description: v.description || null,
          duration: v.duration || null,
          deliverySla: v.deliverySla || null,
          replacementAllowed: v.replacementAllowed ?? null,
          refundAllowed: v.refundAllowed ?? null,
          inStock: v.inStock ?? true,
          fulfillmentType: v.fulfillmentType || null,
          warrantyDays: v.warrantyDays || null,
          sortOrder: v.sortOrder ?? i,
          isDefault: v.isDefault ?? (i === 0),
        };

        if (v.id) {
          await tx.variation.update({ where: { id: v.id }, data: varData });
        } else {
          await tx.variation.create({ data: { ...varData, productId: id } });
        }
      }

      const allPrices = data.variationsToUpsert.map((v) => v.salePriceBDT || v.priceBDT || v.regularPriceBDT || 0);
      updateData.minPriceBDT = Math.min(...allPrices);
      updateData.maxPriceBDT = Math.max(...allPrices);
    }

    const updated = await tx.product.update({
      where: { id },
      data: updateData,
      include: { variations: true },
    });

    return updated;
  });

  await logAdminAudit({
    actorId: adminUser.id,
    actorEmail: adminUser.email,
    action: "PRODUCT_UPDATE",
    targetType: "PRODUCT",
    targetId: id,
    details: { id, updatedFields: Object.keys(data) },
  }).catch((e) => console.error("Audit log error:", e));

  return updatedProduct;
}

export async function duplicateProduct(id: string, adminUser: { id: string; email: string }) {
  const original = await prisma.product.findUnique({
    where: { id },
    include: { variations: true },
  });

  if (!original) throw new Error("Original product not found");

  const random4 = Math.floor(1000 + Math.random() * 9000);
  const newSlug = await ensureUniqueSlug(`${original.slug}-copy-${random4}`);

  const duplicate = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name: `${original.name} (Copy)`,
        slug: newSlug,
        category: original.category,
        categories: original.categories,
        image: original.image,
        gallery: original.gallery,
        minPriceBDT: original.minPriceBDT,
        maxPriceBDT: original.maxPriceBDT,
        regularPriceBDT: original.regularPriceBDT,
        salePriceBDT: original.salePriceBDT,
        shortDesc: original.shortDesc,
        descriptionBangla: original.descriptionBangla,
        descriptionEnglish: original.descriptionEnglish,
        features: original.features,
        specifications: original.specifications,
        deliveryTime: original.deliveryTime,
        deliveryType: original.deliveryType,
        deliverySla: original.deliverySla,
        warranty: original.warranty,
        validity: original.validity,
        deviceSupport: original.deviceSupport,
        requirements: original.requirements,
        productType: original.productType,
        fulfillmentType: original.fulfillmentType,
        status: "DRAFT",
        visibility: "PUBLIC",
        warrantyDays: original.warrantyDays,
        replacementAllowed: original.replacementAllowed,
        refundAllowed: original.refundAllowed,
        lowStockThreshold: original.lowStockThreshold,
        costPriceBDT: original.costPriceBDT,
        allowBackorder: original.allowBackorder,
        isFeatured: false,
        isBestProduct: false,
        isBestSelling: false,
        inStock: false,
        sortOrder: original.sortOrder + 1,
        seoTitle: original.seoTitle ? `${original.seoTitle} (Copy)` : null,
        seoDescription: original.seoDescription,
        seoKeywords: original.seoKeywords,
        variations: {
          create: original.variations.map((v, i) => ({
            name: v.name,
            sku: v.sku ? `${v.sku}-copy` : null,
            priceBDT: v.priceBDT,
            regularPriceBDT: v.regularPriceBDT,
            salePriceBDT: v.salePriceBDT,
            costPriceBDT: v.costPriceBDT,
            lowStockThreshold: v.lowStockThreshold,
            description: v.description,
            duration: v.duration,
            deliverySla: v.deliverySla,
            replacementAllowed: v.replacementAllowed,
            refundAllowed: v.refundAllowed,
            inStock: false,
            fulfillmentType: v.fulfillmentType,
            warrantyDays: v.warrantyDays,
            sortOrder: v.sortOrder ?? i,
            isDefault: v.isDefault,
          })),
        },
      },
      include: { variations: true },
    });

    return created;
  });

  await logAdminAudit({
    actorId: adminUser.id,
    actorEmail: adminUser.email,
    action: "PRODUCT_DUPLICATE",
    targetType: "PRODUCT",
    targetId: duplicate.id,
    details: { originalId: id, newId: duplicate.id, newSlug: duplicate.slug },
  }).catch((e) => console.error("Audit log error:", e));

  return duplicate;
}

export async function archiveProduct(id: string, adminUser: { id: string; email: string }) {
  const archived = await prisma.product.update({
    where: { id },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });

  await logAdminAudit({
    actorId: adminUser.id,
    actorEmail: adminUser.email,
    action: "PRODUCT_ARCHIVE",
    targetType: "PRODUCT",
    targetId: id,
    details: { id, name: archived.name, status: "ARCHIVED" },
  }).catch((e) => console.error("Audit log error:", e));

  return archived;
}

export async function deleteProduct(id: string, adminUser: { id: string; email: string }) {
  const [hasOrders, hasStock, hasReplacements, hasRefunds] = await Promise.all([
    prisma.orderItem.findFirst({ where: { productId: id } }),
    prisma.digitalStock.findFirst({ where: { productId: id } }),
    prisma.replacementRequest.findFirst({ where: { orderItem: { productId: id } } }),
    prisma.refund.findFirst({ where: { orderItem: { productId: id } } }),
  ]);

  if (hasOrders || hasStock || hasReplacements || hasRefunds) {
    throw new Error("Product has historical commercial records and cannot be hard deleted. Please archive instead.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.variation.deleteMany({ where: { productId: id } });
    await tx.product.delete({ where: { id } });
  });

  await logAdminAudit({
    actorId: adminUser.id,
    actorEmail: adminUser.email,
    action: "PRODUCT_DELETE",
    targetType: "PRODUCT",
    targetId: id,
    details: { id },
  }).catch((e) => console.error("Audit log error:", e));

  return { success: true };
}

export async function bulkUpdateProductStatus(
  productIds: string[],
  status: ProductStatus,
  adminUser: { id: string; email: string }
) {
  const result = await prisma.product.updateMany({
    where: { id: { in: productIds } },
    data: { status },
  });

  await logAdminAudit({
    actorId: adminUser.id,
    actorEmail: adminUser.email,
    action: "PRODUCT_BULK_STATUS_UPDATE",
    targetType: "PRODUCT",
    targetId: productIds.join(","),
    details: { count: result.count, status, productIds },
  }).catch((e) => console.error("Audit log error:", e));

  return { success: true, count: result.count };
}

export async function bulkUpdateProductPrice(
  productIds: string[],
  adjustment: { type: "PERCENT" | "FIXED"; value: number; direction: "INCREASE" | "DECREASE" },
  adminUser: { id: string; email: string }
) {
  await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      include: { variations: true },
    });

    for (const p of products) {
      let delta = 0;
      const basePrice = p.regularPriceBDT || p.minPriceBDT || 0;
      if (adjustment.type === "FIXED") {
        delta = adjustment.direction === "INCREASE" ? adjustment.value : -adjustment.value;
      } else {
        delta = adjustment.direction === "INCREASE" ? basePrice * (adjustment.value / 100) : -(basePrice * (adjustment.value / 100));
      }

      const newRegularPrice = Math.max(0, Math.round(basePrice + delta));
      const newSalePrice = p.salePriceBDT ? Math.max(0, Math.round(p.salePriceBDT + delta)) : null;

      await tx.product.update({
        where: { id: p.id },
        data: {
          regularPriceBDT: newRegularPrice,
          salePriceBDT: newSalePrice && newSalePrice < newRegularPrice ? newSalePrice : null,
          minPriceBDT: newRegularPrice,
          maxPriceBDT: newRegularPrice,
        },
      });

      // Update variations too
      for (const v of p.variations) {
        const vBase = v.regularPriceBDT || v.priceBDT || 0;
        let vDelta = 0;
        if (adjustment.type === "FIXED") {
          vDelta = adjustment.direction === "INCREASE" ? adjustment.value : -adjustment.value;
        } else {
          vDelta = adjustment.direction === "INCREASE" ? vBase * (adjustment.value / 100) : -(vBase * (adjustment.value / 100));
        }
        const vReg = Math.max(0, Math.round(vBase + vDelta));
        const vSale = v.salePriceBDT ? Math.max(0, Math.round(v.salePriceBDT + vDelta)) : null;

        await tx.variation.update({
          where: { id: v.id },
          data: {
            regularPriceBDT: vReg,
            salePriceBDT: vSale && vSale < vReg ? vSale : null,
            priceBDT: vSale && vSale < vReg ? vSale : vReg,
          },
        });
      }
    }
  });

  await logAdminAudit({
    actorId: adminUser.id,
    actorEmail: adminUser.email,
    action: "PRODUCT_BULK_PRICE_UPDATE",
    targetType: "PRODUCT",
    targetId: productIds.join(","),
    details: { count: productIds.length, adjustment, productIds },
  }).catch((e) => console.error("Audit log error:", e));

  return { success: true, count: productIds.length };
}

// Category Management Helpers
export async function getCategories() {
  const [categories, productCounts] = await Promise.all([
    prisma.category.findMany({
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

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  displayOrder?: number;
}) {
  const baseSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
  const slug = await ensureUniqueSlug(baseSlug);
  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      image: data.image || null,
      displayOrder: data.displayOrder || 0,
      isActive: true,
    },
  });
}

export async function updateCategory(
  id: string,
  data: { name?: string; slug?: string; description?: string; image?: string; displayOrder?: number; isActive?: boolean }
) {
  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(id: string) {
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

  return prisma.category.delete({ where: { id } });
}
