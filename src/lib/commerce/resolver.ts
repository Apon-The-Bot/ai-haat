import { ProductType, FulfillmentType } from "@prisma/client";

export interface ResolvedProductConfig {
  productId: string;
  variationId: string | null;
  productName: string;
  variationName: string;
  productSlug: string;
  productType: ProductType;
  fulfillmentType: FulfillmentType;
  priceBDT: number;
  regularPriceBDT: number;
  salePriceBDT: number | null;
  costPriceBDT: number | null;
  duration: string | null;
  durationDays: number | null;
  warrantyDays: number;
  replacementAllowed: boolean;
  refundAllowed: boolean;
  refundWindowDays: number;
  requiresInventory: boolean;
  inStock: boolean;
  deliverySla: string;
  image: string;
}

/**
 * Deterministically parse human duration strings into numeric integer days.
 * Examples:
 * - "30 Days", "1 Month", "১ মাস" -> 30
 * - "3 Months", "90 Days" -> 90
 * - "6 Months", "180 Days" -> 180
 * - "1 Year", "12 Months", "১ বছর" -> 365
 * - "Lifetime", "লাইফটাইম" -> 36500 (100 years representation)
 */
export function parseDurationToDays(duration: string | null | undefined): number | null {
  if (!duration) return null;
  const clean = duration.trim().toLowerCase();

  if (clean.includes("lifetime") || clean.includes("লাইফটাইম") || clean.includes("পর্যন্ত")) {
    return 36500;
  }

  // Check for Bengali numerals mapping
  const bengaliMap: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9"
  };
  const normalized = clean.replace(/[০-৯]/g, (ch) => bengaliMap[ch] || ch);

  // Match month patterns
  const monthMatch = normalized.match(/(\d+)\s*(month|months|mo|মাস)/);
  if (monthMatch) {
    const months = parseInt(monthMatch[1], 10);
    return months * 30;
  }

  // Match year patterns
  const yearMatch = normalized.match(/(\d+)\s*(year|years|yr|বছর)/);
  if (yearMatch) {
    const years = parseInt(yearMatch[1], 10);
    return years * 365;
  }

  // Match day patterns
  const dayMatch = normalized.match(/(\d+)\s*(day|days|d|দিন)/);
  if (dayMatch) {
    return parseInt(dayMatch[1], 10);
  }

  // Plain number fallback
  const numOnly = parseInt(normalized.replace(/\D/g, ""), 10);
  if (!isNaN(numOnly) && numOnly > 0) {
    return numOnly;
  }

  return null;
}

/**
 * Server-Authoritative Product & Variation Configuration Resolver.
 * Acts as the SINGLE source of truth for:
 * - Storefront detail views
 * - Cart validation
 * - Checkout quote generation
 * - Order snapshot creation
 * - Fulfillment routing
 */
export function resolveProductConfiguration(
  product: {
    id: string;
    slug: string;
    name: string;
    image?: string | null;
    productType?: ProductType | string;
    fulfillmentType?: FulfillmentType | string;
    minPriceBDT?: number;
    maxPriceBDT?: number;
    regularPriceBDT?: number | null;
    salePriceBDT?: number | null;
    costPriceBDT?: number | null;
    warrantyDays?: number | null;
    replacementAllowed?: boolean | null;
    refundAllowed?: boolean | null;
    deliverySla?: string | null;
    inStock?: boolean | null;
    variations?: any[];
  },
  selectedVariation?: {
    id?: string;
    name?: string;
    priceBDT?: number;
    regularPriceBDT?: number | null;
    salePriceBDT?: number | null;
    costPriceBDT?: number | null;
    duration?: string | null;
    fulfillmentType?: FulfillmentType | string | null;
    warrantyDays?: number | null;
    replacementAllowed?: boolean | null;
    refundAllowed?: boolean | null;
    deliverySla?: string | null;
    inStock?: boolean | null;
  } | null
): ResolvedProductConfig {
  const prodType = (product.productType as ProductType) || "SUBSCRIPTION";
  
  // 1. Resolve Variation & Identification
  const vName = selectedVariation?.name || "Standard";
  const vId = selectedVariation?.id || null;

  // 2. Resolve Pricing: Sale price takes precedence if valid (< regular price)
  let unitPrice = 0;
  let regularPrice = 0;
  let salePrice: number | null = null;
  let costPrice: number | null = null;

  if (selectedVariation) {
    regularPrice = selectedVariation.regularPriceBDT || selectedVariation.priceBDT || product.regularPriceBDT || product.minPriceBDT || 0;
    if (
      selectedVariation.salePriceBDT &&
      selectedVariation.salePriceBDT > 0 &&
      selectedVariation.salePriceBDT < regularPrice
    ) {
      salePrice = selectedVariation.salePriceBDT;
      unitPrice = selectedVariation.salePriceBDT;
    } else {
      unitPrice = selectedVariation.priceBDT || regularPrice;
    }
    costPrice = selectedVariation.costPriceBDT ?? product.costPriceBDT ?? null;
  } else {
    regularPrice = product.regularPriceBDT || product.minPriceBDT || 0;
    if (
      product.salePriceBDT &&
      product.salePriceBDT > 0 &&
      product.salePriceBDT < regularPrice
    ) {
      salePrice = product.salePriceBDT;
      unitPrice = product.salePriceBDT;
    } else {
      unitPrice = regularPrice;
    }
    costPrice = product.costPriceBDT ?? null;
  }

  // 3. Resolve Fulfillment Type (Variation override -> Product default)
  let finalFulfillment: FulfillmentType = (product.fulfillmentType as FulfillmentType) || "AUTO_STOCK";
  if (selectedVariation?.fulfillmentType && selectedVariation.fulfillmentType !== ("INHERIT" as any)) {
    finalFulfillment = selectedVariation.fulfillmentType as FulfillmentType;
  }

  // 4. Resolve Warranty Days (Variation override -> Product default -> 30d fallback)
  let finalWarrantyDays = product.warrantyDays ?? 30;
  if (selectedVariation?.warrantyDays !== undefined && selectedVariation?.warrantyDays !== null && selectedVariation.warrantyDays > 0) {
    finalWarrantyDays = selectedVariation.warrantyDays;
  }

  // 5. Resolve Replacement & Refund Flags
  const replacementAllowed = selectedVariation?.replacementAllowed !== null && selectedVariation?.replacementAllowed !== undefined
    ? selectedVariation.replacementAllowed
    : product.replacementAllowed ?? true;

  const refundAllowed = selectedVariation?.refundAllowed !== null && selectedVariation?.refundAllowed !== undefined
    ? selectedVariation.refundAllowed
    : product.refundAllowed ?? true;

  // 6. Resolve Duration
  const rawDuration = selectedVariation?.duration || null;
  const durationDays = parseDurationToDays(rawDuration);

  // 7. Inventory Requirement
  const requiresInventory = finalFulfillment === "AUTO_STOCK";

  // 8. Stock availability
  const isAvailable = (product.inStock ?? true) && (selectedVariation?.inStock ?? true);

  return {
    productId: product.id,
    variationId: vId,
    productName: product.name,
    variationName: vName,
    productSlug: product.slug,
    productType: prodType,
    fulfillmentType: finalFulfillment,
    priceBDT: unitPrice,
    regularPriceBDT: regularPrice,
    salePriceBDT: salePrice,
    costPriceBDT: costPrice,
    duration: rawDuration,
    durationDays,
    warrantyDays: finalWarrantyDays,
    replacementAllowed,
    refundAllowed,
    refundWindowDays: 7,
    requiresInventory,
    inStock: isAvailable,
    deliverySla: selectedVariation?.deliverySla || product.deliverySla || "Instant",
    image: product.image || "/images/placeholders/aihaat-placeholder.svg",
  };
}

/**
 * Validate product commercial invariants before publishing.
 */
export function validateProductInvariants(input: {
  name: string;
  productType?: ProductType;
  fulfillmentType?: FulfillmentType;
  variations?: Array<{
    name: string;
    priceBDT?: number;
    regularPriceBDT?: number;
    salePriceBDT?: number;
    inStock?: boolean;
    fulfillmentType?: FulfillmentType | string;
  }>;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.name || input.name.trim().length < 2) {
    errors.push("Product name must be at least 2 characters.");
  }

  const variations = input.variations || [];
  if (variations.length > 0) {
    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      if (!v.name || v.name.trim().length === 0) {
        errors.push(`Variation #${i + 1} is missing a name.`);
      }
      const effectivePrice = v.salePriceBDT || v.priceBDT || v.regularPriceBDT || 0;
      if (v.inStock !== false && effectivePrice <= 0) {
        errors.push(`Variation "${v.name || `#${i + 1}`}" must have a price greater than 0.`);
      }
      if (v.salePriceBDT && v.regularPriceBDT && v.salePriceBDT >= v.regularPriceBDT) {
        errors.push(`Variation "${v.name}" sale price (৳${v.salePriceBDT}) must be less than regular price (৳${v.regularPriceBDT}).`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
