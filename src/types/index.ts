export type Currency = "BDT" | "USD";

export interface Variation {
  id: string;
  name: string;
  priceBDT: number;
  originalPriceBDT?: number;
  description?: string;
  inStock: boolean;
  type?: "DURATION" | "CREDITS" | "TIER" | "CUSTOM";
  duration?: string;
  credits?: string | number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  isVerifiedPurchase: boolean;
  status?: "approved" | "pending";
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categories: string[];
  image: string;
  rating: number;
  ratingCount: number;
  viewCount: number;
  badge?: "Best Product" | "Best Selling" | "New" | "Offer" | string;
  minPriceBDT: number;
  maxPriceBDT: number;
  variations: Variation[];
  shortDesc: string;
  descriptionBangla: string;
  descriptionEnglish: string;
  features: string[];
  info: {
    deliveryTime: string;
    deliveryType: string;
    warranty: string;
    validity: string;
    deviceSupport: string;
    requirements?: string;
  };
  reviews: Review[];
  deliveryMethod?: "EMAIL" | "WHATSAPP" | "MESSENGER";
  isFeatured?: boolean;
  isBestProduct?: boolean;
  isBestSelling?: boolean;
  inStock?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedVariation: Variation;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  walletBalanceBDT: number;
  role?: "USER" | "ADMIN";
  avatar?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT_BDT";
  discountValue: number;
  appliesTo: "ALL" | "SPECIFIC_PRODUCTS";
  productIds: string[];
  minOrderBDT: number;
  maxDiscountBDT?: number;
  usageLimit: number;
  usedCount: number;
  validUntil: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: {
    productName: string;
    variationName: string;
    quantity: number;
    priceBDT: number;
    image: string;
  }[];
  totalBDT: number;
  paymentMethod: "bKash" | "Nagad" | "Rocket" | "Card" | "Wallet";
  paymentStatus: "Completed" | "Pending" | "Processing";
  deliveryStatus: "Delivered" | "Processing" | "Preparing" | "Order Placed";
  credentialsDelivered?: string;
  customerPhone: string;
  customerEmail: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  tier?: string;
}

export interface ProofItem {
  id: string;
  orderId: string;
  productName: string;
  amountBDT: number;
  date: string;
  type: "Subscription" | "License Key" | "Top-Up" | "Gift Card";
  image: string;
  customerNote: string;
}

export interface BlogItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
  content: string;
}
