import { prisma } from "../src/lib/prisma";
import { encryptCredential } from "../src/lib/mfa/crypto";
import { ProductType, FulfillmentType, StockType, StockStatus, DeliveryStatus, PaymentStatus } from "@prisma/client";

export interface QATracker {
  userIds: string[];
  productIds: string[];
  variationIds: string[];
  stockIds: string[];
  couponIds: string[];
  orderIds: string[];
  deliveryKeyIds: string[];
  replacementRequestIds: string[];
  refundIds: string[];
  notificationIds: string[];
  walletTxIds: string[];
  supportTicketIds: string[];
}

export function createQATracker(): QATracker {
  return {
    userIds: [],
    productIds: [],
    variationIds: [],
    stockIds: [],
    couponIds: [],
    orderIds: [],
    deliveryKeyIds: [],
    replacementRequestIds: [],
    refundIds: [],
    notificationIds: [],
    walletTxIds: [],
    supportTicketIds: [],
  };
}

/**
 * Production Database Safety Guard
 * Prevents accidental destructive execution
 */
export function guardSafeTestDatabase() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_TEST_ON_PROD) {
    console.warn("⚠️ Running QA suite in production mode with strict synthetic test fixtures only.");
  }
}

/**
 * Fixture Helper: Create Customer User
 */
export async function createCustomerFixture(tracker: QATracker, prefix = "cust") {
  const timestamp = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  const user = await prisma.user.create({
    data: {
      id: `qa-user-${prefix}-${timestamp}-${rand}`,
      name: `QA Customer ${prefix.toUpperCase()}`,
      email: `qa_${prefix}_${timestamp}_${rand}@aihaat.shop`,
      role: "USER",
      walletBalanceBDT: 1000,
    },
  });
  tracker.userIds.push(user.id);
  return user;
}

/**
 * Fixture Helper: Create Admin User
 */
export async function createAdminFixture(tracker: QATracker) {
  const timestamp = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  const admin = await prisma.user.create({
    data: {
      id: `qa-user-admin-${timestamp}-${rand}`,
      name: "QA Admin Master",
      email: `qa_admin_${timestamp}_${rand}@aihaat.shop`,
      role: "ADMIN",
      walletBalanceBDT: 5000,
    },
  });
  tracker.userIds.push(admin.id);
  return admin;
}

/**
 * Fixture Helper: Create Standard Product & Variation
 */
export async function createProductFixture(
  tracker: QATracker,
  options?: {
    productType?: ProductType;
    fulfillmentType?: FulfillmentType;
    priceBDT?: number;
    warrantyDays?: number;
  }
) {
  const timestamp = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  const pType = options?.productType || "SUBSCRIPTION";
  const fType = options?.fulfillmentType || "AUTO_STOCK";
  const price = options?.priceBDT || 500;
  const warranty = options?.warrantyDays || 30;

  const product = await prisma.product.create({
    data: {
      id: `qa-prod-${timestamp}-${rand}`,
      slug: `qa-prod-${timestamp}-${rand}`,
      name: `QA Product ${pType}`,
      category: "AI Tools",
      image: "/images/test.svg",
      minPriceBDT: price,
      maxPriceBDT: price,
      regularPriceBDT: price,
      shortDesc: "QA test product",
      descriptionBangla: "টেস্ট পণ্য",
      descriptionEnglish: "QA Test Product",
      features: JSON.stringify(["Feature 1", "Feature 2"]),
      productType: pType,
      fulfillmentType: fType,
      warrantyDays: warranty,
      variations: {
        create: [
          {
            id: `qa-var-${timestamp}-${rand}`,
            name: "Standard 1 Month",
            priceBDT: price,
            regularPriceBDT: price,
            duration: "1 Month",
            inStock: true,
          },
        ],
      },
    },
    include: { variations: true },
  });

  tracker.productIds.push(product.id);
  tracker.variationIds.push(product.variations[0].id);
  return { product, variation: product.variations[0] };
}

/**
 * Fixture Helper: Add Digital Stock
 */
export async function createStockFixture(
  tracker: QATracker,
  productId: string,
  variationId: string,
  rawPayload = "user:password123"
) {
  const timestamp = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  const encrypted = encryptCredential(rawPayload);

  const stock = await prisma.digitalStock.create({
    data: {
      id: `qa-stock-${timestamp}-${rand}`,
      productId,
      variationId,
      type: "ACCOUNT_CREDENTIAL",
      payloadEncrypted: encrypted,
      status: "AVAILABLE",
    },
  });

  tracker.stockIds.push(stock.id);
  return stock;
}

/**
 * Fixture Helper: Create Order & OrderItem
 */
export async function createOrderFixture(
  tracker: QATracker,
  options: {
    userId?: string | null;
    customerEmail: string;
    customerName?: string;
    productId: string;
    variationId?: string | null;
    productName: string;
    variationName?: string;
    priceBDT: number;
    quantity?: number;
    paymentStatus?: PaymentStatus;
    paymentMethod?: string;
    deliveryStatus?: DeliveryStatus;
    fulfillmentType?: FulfillmentType;
    warrantyDays?: number;
  }
) {
  const timestamp = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  const qty = options.quantity || 1;
  const price = options.priceBDT;
  const total = price * qty;

  const order = await prisma.order.create({
    data: {
      id: `QA-ORD-${timestamp}-${rand}`,
      orderNumber: `QA-ORD-${timestamp}-${rand}`,
      userId: options.userId || null,
      customerName: options.customerName || "QA Customer",
      customerEmail: options.customerEmail,
      customerPhone: "01700000000",
      subtotalBDT: total,
      totalBDT: total,
      paymentMethod: options.paymentMethod || "bKash",
      paymentStatus: options.paymentStatus || "PENDING",
      deliveryStatus: options.deliveryStatus || "ORDER_PLACED",
      items: {
        create: {
          id: `qa-item-${timestamp}-${rand}`,
          productId: options.productId,
          variationId: options.variationId || null,
          productName: options.productName,
          variationName: options.variationName || "Default",
          priceBDT: price,
          quantity: qty,
          fulfillmentType: options.fulfillmentType || "AUTO_STOCK",
          warrantyDaysAtPurchase: options.warrantyDays || 30,
        },
      },
    },
    include: { items: true },
  });

  tracker.orderIds.push(order.id);
  return { order, orderItem: order.items[0] };
}

/**
 * Cleanup Fixtures in Strict Reverse-Dependency Order
 */
export async function cleanupTestFixtures(tracker: QATracker) {
  try {
    if (tracker.refundIds.length > 0) {
      await prisma.refund.deleteMany({ where: { id: { in: tracker.refundIds } } });
    }
    if (tracker.deliveryKeyIds.length > 0) {
      await prisma.deliveredKey.deleteMany({ where: { id: { in: tracker.deliveryKeyIds } } });
    }
    if (tracker.orderIds.length > 0) {
      await prisma.deliveredKey.deleteMany({ where: { orderId: { in: tracker.orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: tracker.orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: tracker.orderIds } } });
    }
    if (tracker.replacementRequestIds.length > 0) {
      await prisma.replacementRequest.deleteMany({ where: { id: { in: tracker.replacementRequestIds } } });
    }
    if (tracker.stockIds.length > 0) {
      await prisma.digitalStock.deleteMany({ where: { id: { in: tracker.stockIds } } });
    }
    if (tracker.variationIds.length > 0) {
      await prisma.variation.deleteMany({ where: { id: { in: tracker.variationIds } } });
    }
    if (tracker.productIds.length > 0) {
      await prisma.digitalStock.deleteMany({ where: { productId: { in: tracker.productIds } } });
      await prisma.variation.deleteMany({ where: { productId: { in: tracker.productIds } } });
      await prisma.product.deleteMany({ where: { id: { in: tracker.productIds } } });
    }
    if (tracker.couponIds.length > 0) {
      await prisma.coupon.deleteMany({ where: { id: { in: tracker.couponIds } } });
    }
    if (tracker.notificationIds.length > 0) {
      await prisma.notification.deleteMany({ where: { id: { in: tracker.notificationIds } } });
    }
    if (tracker.walletTxIds.length > 0) {
      await prisma.walletTransaction.deleteMany({ where: { id: { in: tracker.walletTxIds } } });
    }
    if (tracker.supportTicketIds.length > 0) {
      await prisma.supportMessage.deleteMany({ where: { ticketId: { in: tracker.supportTicketIds } } });
      await prisma.supportTicket.deleteMany({ where: { id: { in: tracker.supportTicketIds } } });
    }
    if (tracker.userIds.length > 0) {
      await prisma.notification.deleteMany({ where: { userId: { in: tracker.userIds } } });
      await prisma.walletTransaction.deleteMany({ where: { userId: { in: tracker.userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: tracker.userIds } } });
    }
  } catch (err) {
    console.warn("Fixture cleanup warning:", err);
  }
}
