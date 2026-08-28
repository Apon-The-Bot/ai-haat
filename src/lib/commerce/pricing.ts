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
    const variationsCount = Array.isArray(product.variations) ? product.variations.length : 0;
    let chosenVariation: Variation | undefined = undefined;

    if (variationsCount === 0) {
      // CASE A: Product has ZERO database variations (single-tier base product)
      if (raw.variationId && raw.variationId !== "default") {
        return {
          isValid: false,
          error: `Variation "${raw.variationId}" does not belong to product "${product.name}".`,
          quote: { items: [], subtotalBDT: 0, discountBDT: 0, totalBDT: 0, couponCode: null, couponId: null },
        };
      }
      chosenVariation = undefined;
    } else if (variationsCount === 1) {
      // CASE B: Product has EXACTLY ONE database variation
      if (raw.variationId && raw.variationId !== "default") {
        chosenVariation = product.variations.find((v) => v.id === raw.variationId);
        if (!chosenVariation) {
          return {
            isValid: false,
            error: `Variation "${raw.variationId}" does not belong to product "${product.name}".`,
            quote: { items: [], subtotalBDT: 0, discountBDT: 0, totalBDT: 0, couponCode: null, couponId: null },
          };
        }
      } else if (raw.variationName) {
        chosenVariation = product.variations.find((v) => v.name.toLowerCase() === raw.variationName?.toLowerCase());
      }

      // If omitted or "default", safely resolve to the single legitimate variation
      if (!chosenVariation) {
        chosenVariation = product.variations[0];
      }
    } else {
      // CASE C & D: Product has MULTIPLE database variations (> 1)
      if (raw.variationId && raw.variationId !== "default") {
        chosenVariation = product.variations.find((v) => v.id === raw.variationId);
        if (!chosenVariation) {
          return {
            isValid: false,
            error: `Variation "${raw.variationId}" does not belong to product "${product.name}".`,
            quote: { items: [], subtotalBDT: 0, discountBDT: 0, totalBDT: 0, couponCode: null, couponId: null },
          };
        }
      } else if (raw.variationName) {
        chosenVariation = product.variations.find((v) => v.name.toLowerCase() === raw.variationName?.toLowerCase());
      }

      // If no valid variation was explicitly provided:
      if (!chosenVariation) {
        const explicitDefault = product.variations.find((v) => v.isDefault === true);
        if (explicitDefault) {
          // CASE C: Resolved ONLY to the explicitly configured default
          chosenVariation = explicitDefault;
        } else {
          // CASE D: Multiple variations without explicit default -> STRICTLY REJECT
          return {
            isValid: false,
            error: `Please select a variation for product "${product.name}".`,
            quote: { items: [], subtotalBDT: 0, discountBDT: 0, totalBDT: 0, couponCode: null, couponId: null },
          };
        }
      }
    }

    // Validate variation is in stock
    if (chosenVariation && chosenVariation.inStock === false) {
      return {
        isValid: false,
        error: `"${product.name} (${chosenVariation.name})" বর্তমানে স্টক আউট।`,
        quote: { items: [], subtotalBDT: 0, discountBDT: 0, totalBDT: 0, couponCode: null, couponId: null },
      };
    }

    // Use Central Configuration Resolver
    const resolved: ResolvedProductConfig = resolveProductConfiguration(product, chosenVariation);

    // Validate real-time digital stock availability for AUTO_STOCK
    const isAuto = resolved.fulfillmentType === "AUTO_STOCK" || product.fulfillmentType === "AUTO_STOCK";
    if (isAuto) {
      try {
        const availableStock = await prisma.digitalStock.count({
          where: {
            productId: product.id,
            OR: [
              { variationId: chosenVariation?.id || null },
              { variationId: null },
            ],
            status: "AVAILABLE",
          },
        });

        if (availableStock < qty) {
          return {
            isValid: false,
            error: availableStock === 0
              ? `দুঃখিত, "${product.name} (${chosenVariation?.name || 'Standard'})" এই মুহূর্তে স্টক আউট।`
              : `দুঃখিত, "${product.name} (${chosenVariation?.name || 'Standard'})" এর মাত্র ${availableStock} টি স্টকে আছে (আপনি চেয়েছেন ${qty} টি)।`,
            quote: { items: [], subtotalBDT: 0, discountBDT: 0, totalBDT: 0, couponCode: null, couponId: null },
          };
        }
      } catch (stockErr) {
        console.warn("[Pricing Engine Stock Check Warning]:", stockErr);
      }
    }

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
