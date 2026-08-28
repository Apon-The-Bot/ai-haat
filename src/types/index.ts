export type Currency = "BDT" | "USD";

export interface Variation {
  id: string;
  name: string;
  priceBDT: number;
  regularPriceBDT?: number | null;
  salePriceBDT?: number | null;
  originalPriceBDT?: number;
  description?: string | null;
  inStock: boolean;
  stockCount?: number;
  fulfillmentType?: string;
  type?: "DURATION" | "CREDITS" | "TIER" | "CUSTOM";
  duration?: string | null;
  credits?: string | number;
}

export interface Review {
  id: string;
  author: string;
  userName?: string;
  rating: number;
  date: string;
  comment: string;
  isVerifiedPurchase: boolean;
  status?: "approved" | "pending" | "rejected" | "APPROVED" | "PENDING" | "REJECTED";
  productId?: string;
  productName?: string;
  userId?: string;
  createdAt?: string;
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
  regularPriceBDT?: number | null;
  salePriceBDT?: number | null;
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
  status?: "ACTIVE" | "DRAFT" | "INACTIVE" | "ARCHIVED";
  visibility?: "PUBLIC" | "HIDDEN" | "DIRECT_LINK_ONLY";
  fulfillmentMode?: "AUTO" | "MANUAL";
  fulfillmentType?: "AUTO_STOCK" | "MANUAL" | string;
  allowBackorder?: boolean;
  sku?: string;
  digitalStock?: number;
  stockCount?: number;
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
  type: "Subscription" | "License Key" | "Top-Up" | "Gift Card" | string;
  category?: "AI Tools" | "Subscriptions" | "Windows & Office" | "VPNs" | string;
  image: string;
  customerNote: string;
  createdAt?: string;
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

export interface ProductRequestItem {
  id: string;
  productName: string;
  category?: string;
  budgetBDT?: number | string | null;
  targetBudget?: string | null;
  duration?: string | null;
  urgency?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;
  notes?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  contact?: string | null;
  details?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "FULFILLED" | "REJECTED";
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}
