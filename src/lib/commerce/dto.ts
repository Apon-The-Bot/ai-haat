import { Product, Variation, Review } from "@/types";
import { ProductType, FulfillmentType, ProductStatus, ProductVisibility } from "@prisma/client";
import { decryptCredential } from "@/lib/mfa/crypto";

export interface PublicProductSummaryDTO {
  id: string;
  slug: string;
  name: string;
  category: string;
  categories: string[];
  image: string;
  badge?: string;
  minPriceBDT: number;
  maxPriceBDT: number;
  regularPriceBDT: number;
  salePriceBDT?: number;
  shortDesc: string;
  rating: number;
  ratingCount: number;
  viewCount: number;
  inStock: boolean;
  isFeatured: boolean;
  isBestProduct: boolean;
  isBestSelling: boolean;
  productType: ProductType;
  fulfillmentType: FulfillmentType;
  deliveryTime: string;
  deliveryType: string;
  deliverySla?: string | null;
  features: string[];
  variations: Array<{
    id: string;
    name: string;
    priceBDT: number;
    regularPriceBDT: number;
    salePriceBDT?: number;
    duration?: string | null;
    inStock: boolean;
    description?: string | null;
  }>;
}

export interface PublicProductDetailDTO extends PublicProductSummaryDTO {
  gallery: string[];
  descriptionBangla: string;
  descriptionEnglish: string;
  specifications: Array<{ label: string; value: string }>;
  info: {
    deliveryTime: string;
    deliveryType: string;
    warranty: string;
    validity: string;
    deviceSupport: string;
    requirements?: string | null;
  };
  warrantyDays: number;
  replacementAllowed: boolean;
  refundAllowed: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  availableStockCount: number;
  variations: Array<{
    id: string;
    name: string;
    priceBDT: number;
    regularPriceBDT: number;
    salePriceBDT?: number;
    duration?: string | null;
    inStock: boolean;
    availableStockCount: number;
    description?: string | null;
    fulfillmentType: FulfillmentType;
    warrantyDays: number;
  }>;
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    date: string;
    comment: string;
    isVerifiedPurchase: boolean;
  }>;
}

export interface AdminProductDTO {
  id: string;
  name: string;
  slug: string;
  category: string;
  categories: string[];
  image: string;
  gallery: string[];
  minPriceBDT: number;
  maxPriceBDT: number;
  regularPriceBDT?: number | null;
  salePriceBDT?: number | null;
  costPriceBDT?: number | null;
  shortDesc: string;
  descriptionBangla: string;
  descriptionEnglish: string;
  features: string[];
  specifications: Array<{ label: string; value: string }>;
  deliveryTime: string;
  deliveryType: string;
  deliverySla?: string | null;
  warranty: string;
  validity: string;
  deviceSupport: string;
  requirements?: string | null;
  productType: ProductType;
  fulfillmentType: FulfillmentType;
  status: ProductStatus;
  visibility: ProductVisibility;
  warrantyDays: number;
  replacementAllowed: boolean;
  refundAllowed: boolean;
  lowStockThreshold: number;
  allowBackorder: boolean;
  isFeatured: boolean;
  isBestProduct: boolean;
  isBestSelling: boolean;
  inStock: boolean;
  sortOrder: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  variations: Array<{
    id: string;
    name: string;
    sku?: string | null;
    priceBDT: number;
    regularPriceBDT?: number | null;
    salePriceBDT?: number | null;
    costPriceBDT?: number | null;
    lowStockThreshold?: number | null;
    description?: string | null;
    duration?: string | null;
    deliverySla?: string | null;
    replacementAllowed?: boolean | null;
    refundAllowed?: boolean | null;
    inStock: boolean;
    fulfillmentType?: FulfillmentType | null;
    warrantyDays?: number | null;
    sortOrder: number;
    isDefault: boolean;
  }>;
  stockCounts?: {
    available: number;
    reserved: number;
    delivered: number;
    invalid: number;
    expired: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface VaultKeyDTO {
  id: string;
  orderId: string;
  orderItemId?: string | null;
  productName: string;
  variationName: string;
  accountType: string;
  productType: string;
  image?: string | null;
  credentials: string;
  instructions?: string | null;
  warrantyExpiresAt: string | null;
  isWarrantyActive: boolean;
  isReplacement: boolean;
  replacedDeliveryId?: string | null;
  hasOpenReplacement: boolean;
  deliveredAt: string;
}

/**
 * Maps raw database product to sanitized Public Summary DTO
 */
export function toPublicProductSummaryDTO(p: any): PublicProductSummaryDTO {
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
    inStock: p.inStock,
    isFeatured: p.isFeatured,
    isBestProduct: p.isBestProduct,
    isBestSelling: p.isBestSelling,
    productType: p.productType,
    fulfillmentType: p.fulfillmentType,
    deliveryTime: p.deliveryTime,
    deliveryType: p.deliveryType,
    deliverySla: p.deliverySla,
    features: featuresList,
    variations: (p.variations || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      priceBDT: v.priceBDT,
      regularPriceBDT: v.regularPriceBDT || v.priceBDT,
      salePriceBDT: v.salePriceBDT || undefined,
      duration: v.duration,
      inStock: v.inStock,
      description: v.description,
    })),
  };
}

/**
 * Maps database product to sanitized Public Detail DTO
 */
export function toPublicProductDetailDTO(p: any, stockMap: Record<string, number> = {}): PublicProductDetailDTO {
  const summary = toPublicProductSummaryDTO(p);

  let galleryList: string[] = [];
  try {
    galleryList = JSON.parse(p.gallery || "[]");
  } catch {
    galleryList = [];
  }

  let specsList: Array<{ label: string; value: string }> = [];
  try {
    specsList = JSON.parse(p.specifications || "[]");
  } catch {
    specsList = [];
  }

  return {
    ...summary,
    gallery: galleryList,
    descriptionBangla: p.descriptionBangla,
    descriptionEnglish: p.descriptionEnglish,
    specifications: specsList,
    info: {
      deliveryTime: p.deliveryTime,
      deliveryType: p.deliveryType,
      warranty: p.warranty,
      validity: p.validity,
      deviceSupport: p.deviceSupport,
      requirements: p.requirements,
    },
    warrantyDays: p.warrantyDays,
    replacementAllowed: p.replacementAllowed,
    refundAllowed: p.refundAllowed,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    seoKeywords: p.seoKeywords,
    availableStockCount: stockMap["product"] || 0,
    variations: (p.variations || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      priceBDT: v.priceBDT,
      regularPriceBDT: v.regularPriceBDT || v.priceBDT,
      salePriceBDT: v.salePriceBDT || undefined,
      duration: v.duration,
      inStock: v.inStock,
      availableStockCount: stockMap[v.id] || 0,
      description: v.description,
      fulfillmentType: v.fulfillmentType || p.fulfillmentType,
      warrantyDays: v.warrantyDays || p.warrantyDays,
    })),
    reviews: (p.reviews || []).map((r: any) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      date: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "",
      comment: r.comment,
      isVerifiedPurchase: r.isVerifiedPurchase,
    })),
  };
}
