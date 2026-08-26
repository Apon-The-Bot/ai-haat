import { Coupon } from "@/types";

export const COUPONS: Coupon[] = [
  {
    id: "cp-1",
    code: "AIHAAT10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    appliesTo: "ALL",
    productIds: [],
    minOrderBDT: 200,
    maxDiscountBDT: 200,
    usageLimit: 500,
    usedCount: 42,
    validUntil: "2026-12-31",
    isActive: true,
  },
  {
    id: "cp-2",
    code: "GPT50",
    discountType: "FLAT_BDT",
    discountValue: 50,
    appliesTo: "SPECIFIC_PRODUCTS",
    productIds: ["chatgpt-plus"],
    minOrderBDT: 250,
    usageLimit: 200,
    usedCount: 88,
    validUntil: "2026-10-31",
    isActive: true,
  },
  {
    id: "cp-3",
    code: "SAVE100",
    discountType: "FLAT_BDT",
    discountValue: 100,
    appliesTo: "ALL",
    productIds: [],
    minOrderBDT: 600,
    usageLimit: 100,
    usedCount: 19,
    validUntil: "2026-11-30",
    isActive: true,
  },
  {
    id: "cp-4",
    code: "CANVA20",
    discountType: "PERCENTAGE",
    discountValue: 20,
    appliesTo: "SPECIFIC_PRODUCTS",
    productIds: ["canva-pro"],
    minOrderBDT: 300,
    maxDiscountBDT: 150,
    usageLimit: 300,
    usedCount: 65,
    validUntil: "2026-09-30",
    isActive: true,
  },
];

export function validateCoupon(
  code: string,
  cartItems: { slug: string; priceBDT: number; quantity: number }[],
  couponsList: Coupon[] = COUPONS
): {
  isValid: boolean;
  coupon?: Coupon;
  discountBDT: number;
  message: string;
} {
  const cleanCode = code.trim().toUpperCase();
  const coupon = couponsList.find((c) => c.code.toUpperCase() === cleanCode);

  if (!coupon) {
    return { isValid: false, discountBDT: 0, message: "Invalid coupon code." };
  }

  if (!coupon.isActive) {
    return { isValid: false, discountBDT: 0, message: "This coupon is currently inactive." };
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.priceBDT * item.quantity, 0);

  if (subtotal < coupon.minOrderBDT) {
    return {
      isValid: false,
      discountBDT: 0,
      message: `Minimum order amount of ৳${coupon.minOrderBDT} required for this coupon.`,
    };
  }

  let eligibleSubtotal = subtotal;

  if (coupon.appliesTo === "SPECIFIC_PRODUCTS" && coupon.productIds.length > 0) {
    const eligibleItems = cartItems.filter((item) =>
      coupon.productIds.includes(item.slug)
    );

    if (eligibleItems.length === 0) {
      return {
        isValid: false,
        discountBDT: 0,
        message: "This coupon is not valid for the items in your cart.",
      };
    }

    eligibleSubtotal = eligibleItems.reduce(
      (sum, item) => sum + item.priceBDT * item.quantity,
      0
    );
  }

  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = Math.round((eligibleSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountBDT && discount > coupon.maxDiscountBDT) {
      discount = coupon.maxDiscountBDT;
    }
  } else {
    discount = Math.min(coupon.discountValue, eligibleSubtotal);
  }

  return {
    isValid: true,
    coupon,
    discountBDT: discount,
    message: `Coupon "${coupon.code}" applied successfully! (৳${discount} saved)`,
  };
}
