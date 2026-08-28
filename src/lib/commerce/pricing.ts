import { prisma } from "@/lib/prisma";
import { getAllProducts } from "@/lib/products-db";
import { Product, Variation } from "@/types";
import { safeAddBDT, safeSubBDT, safeMulBDT, calculatePercentageDiscount } from "@/lib/commerce/money";
import { resolveProductConfiguration, ResolvedProductConfig } from "@/lib/commerce/resolver";
import { FulfillmentType, ProductType } from "@prisma/client";

export interface OrderItemInput {
  productId: string;
  variationId?: string | null;
  productName?: string;
  variationName?: string;
  quantity: number;
}

export interface NormalizedOrderItem {
  productId: string;
  variationId: string | null;
  productName: string;
  variationName: string;
  priceBDT: number;
  regularPriceBDT: number;
  salePriceBDT: number | null;
  costPriceBDT: number | null;
  quantity: number;
  image: string;
  productSlug: string;
  productType: ProductType;
  fulfillmentType: FulfillmentType;
  duration: string | null;
  durationDays: number | null;
  warrantyDays: number;
  refundWindowDays: number;
  replacementAllowed: boolean;
  refundAllowed: boolean;
  requiresInventory: boolean;
}

export interface OrderQuote {
  items: NormalizedOrderItem[];
  subtotalBDT: number;
  discountBDT: number;
  totalBDT: number;
  couponCode: string | null;
  couponId: string | null;
  couponDiscountType?: string;
  couponDiscountValue?: number;
}

export interface PricingResult {
  isValid: boolean;
  error?: string;
  quote: OrderQuote;
}

/**
 * Server-Authoritative Price & Coupon Recalculation Engine
 * Completely ignores client-supplied prices/subtotals/discounts/totals.
 * Uses the canonical resolveProductConfiguration resolver for all commerce rules.
 */
export async function calculateOrderQuote(
  rawItems: OrderItemInput[],
  couponCode?: string | null
): Promise<PricingResult> {
  if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
    return {
      isValid: false,
      error: "Cart is empty.",
      quote: { items: [], subtotalBDT: 0, discountBDT: 0, totalBDT: 0, couponCode: null, couponId: null },
    };
  }

  // 1. Fetch all products from Database (or local fallback)
  let allProducts: Product[] = [];
  try {
    allProducts = await getAllProducts();
  } catch (err) {
    console.error("[Pricing Engine] Failed to fetch products:", err);
  }

  const normalizedItems: NormalizedOrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const raw of rawItems) {
    const qty = Math.max(1, Math.floor(Number(raw.quantity) || 1));
    const targetProductId = raw.productId?.trim();

    // Look up product by ID or Slug or Name
    const product = allProducts.find(
      (p) => p.id === targetProductId || p.slug === targetProductId || p.name.toLowerCase() === raw.productName?.toLowerCase()
    );

    if (!product) {
      return {
        isValid: false,
        error: `Product not found: "${raw.productName || targetProductId}"`,
        quote: { items: [], subtotalBDT: 0, discountBDT: 0, totalBDT: 0, couponCode: null, couponId: null },
      };
    }

    if (product.inStock === false) {
      return {
        isValid: false,
        error: `Product "${product.name}" is currently out of stock.`,
        quote: { items: [], subtotalBDT: 0, discountBDT: 0, totalBDT: 0, couponCode: null, couponId: null },
      };
    }

    // Match variation — validate it belongs to this product
    let chosenVariation: Variation | undefined = undefined;
    if (raw.variationId) {
      chosenVariation = product.variations?.find((v) => v.id === raw.variationId);
      if (!chosenVariation) {
        return {
          isValid: false,
          error: `Variation "${raw.variationId}" does not belong to product "${product.name}".`,
          quote: { items: [], subtotalBDT: 0, discountBDT: 0, totalBDT: 0, couponCode: null, couponId: null },
        };
      }
    }
    if (!chosenVariation && raw.variationName) {
      chosenVariation = product.variations?.find((v) => v.name.toLowerCase() === raw.variationName?.toLowerCase());
    }
    if (!chosenVariation) {
      chosenVariation = product.variations?.[0];
    }

    // Validate variation is in stock
    if (chosenVariation && chosenVariation.inStock === false) {
      return {
        isValid: false,
        error: `Variation "${chosenVariation.name}" of product "${product.name}" is currently out of stock.`,
        quote: { items: [], subtotalBDT: 0, discountBDT: 0, totalBDT: 0, couponCode: null, couponId: null },
      };
    }

    // Use Central Configuration Resolver
    const resolved: ResolvedProductConfig = resolveProductConfiguration(product, chosenVariation);

    const itemTotal = safeMulBDT(resolved.priceBDT, qty);
    calculatedSubtotal = safeAddBDT(calculatedSubtotal, itemTotal);

    normalizedItems.push({
      productId: resolved.productId,
      variationId: resolved.variationId,
      productName: resolved.productName,
      variationName: resolved.variationName,
      priceBDT: resolved.priceBDT,
      regularPriceBDT: resolved.regularPriceBDT,
      salePriceBDT: resolved.salePriceBDT,
      costPriceBDT: resolved.costPriceBDT,
      quantity: qty,
      image: resolved.image,
      productSlug: resolved.productSlug,
      productType: resolved.productType,
      fulfillmentType: resolved.fulfillmentType,
      duration: resolved.duration,
      durationDays: resolved.durationDays,
      warrantyDays: resolved.warrantyDays,
      refundWindowDays: resolved.refundWindowDays,
      replacementAllowed: resolved.replacementAllowed,
      refundAllowed: resolved.refundAllowed,
      requiresInventory: resolved.requiresInventory,
    });
  }

  // 2. Server-Side Coupon Verification
  let calculatedDiscount = 0;
  let validatedCouponCode: string | null = null;
  let validatedCouponId: string | null = null;
  let couponDiscountType: string | undefined = undefined;
  let couponDiscountValue: number | undefined = undefined;

  const cleanCouponCode = couponCode?.trim().toUpperCase();

  if (cleanCouponCode) {
    try {
      const couponRecord = await prisma.coupon.findUnique({
        where: { code: cleanCouponCode },
      });

      if (couponRecord) {
        const now = new Date();
        const isExpired = couponRecord.validUntil < now;
        const isExhausted = couponRecord.usedCount >= couponRecord.usageLimit;
        const meetsMinOrder = calculatedSubtotal >= couponRecord.minOrderBDT;

        let isApplicable = true;
        if (couponRecord.appliesTo === "SPECIFIC_PRODUCTS") {
          let allowedSlugs: string[] = [];
          try {
            allowedSlugs = JSON.parse(couponRecord.productIds || "[]");
          } catch {
            allowedSlugs = [];
          }
          const hasEligibleProduct = normalizedItems.some((it) => allowedSlugs.includes(it.productSlug));
          if (!hasEligibleProduct) {
            isApplicable = false;
          }
        }

        if (couponRecord.isActive && !isExpired && !isExhausted && meetsMinOrder && isApplicable) {
          validatedCouponCode = couponRecord.code;
          validatedCouponId = couponRecord.id;
          couponDiscountType = couponRecord.discountType;
          couponDiscountValue = couponRecord.discountValue;

          if (couponRecord.discountType === "PERCENTAGE") {
            calculatedDiscount = calculatePercentageDiscount(
              calculatedSubtotal,
              couponRecord.discountValue,
              couponRecord.maxDiscountBDT
            );
          } else {
            calculatedDiscount = Math.min(calculatedSubtotal, couponRecord.discountValue);
          }
        }
      }
    } catch (couponErr) {
      console.warn("[Pricing Engine] Coupon check DB warning:", couponErr);
    }
  }

  const finalTotal = safeSubBDT(calculatedSubtotal, calculatedDiscount);

  return {
    isValid: true,
    quote: {
      items: normalizedItems,
      subtotalBDT: calculatedSubtotal,
      discountBDT: calculatedDiscount,
      totalBDT: finalTotal,
      couponCode: validatedCouponCode,
      couponId: validatedCouponId,
      couponDiscountType,
      couponDiscountValue,
    },
  };
}
