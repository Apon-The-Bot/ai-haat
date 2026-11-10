import fs from "fs";
import path from "path";

export interface StoredOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId?: string;
    productName: string;
    variationName: string;
    quantity: number;
    priceBDT: number;
    image?: string;
  }[];
  totalBDT: number;
  subtotalBDT: number;
  discountBDT?: number;
  paymentMethod: string;
  senderNumber?: string;
  trxId?: string;
  paymentStatus: "Pending" | "Completed" | "Processing" | "Failed";
  deliveryStatus: "Order Placed" | "Preparing" | "Processing" | "Delivered" | "Cancelled";
  credentialsDelivered?: string;
  deliveryInstructions?: string;
  downloadUrl?: string | null;
  cancelReason?: string | null;
  notes?: string;
  isGift?: boolean;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  giftMessage?: string;
  giftTheme?: string;
  hidePriceOnGift?: boolean;
  giftClaimToken?: string;
  giftWrapOpened?: boolean;
  giftOpenedAt?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

const dataDir = path.join(process.cwd(), "data");
const ordersFile = path.join(dataDir, "orders.json");

function ensureDir() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(ordersFile)) {
      fs.writeFileSync(ordersFile, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("[Orders DB Directory Warning]:", err);
  }
}

export function getAllOrders(): StoredOrder[] {
  ensureDir();
  try {
    if (!fs.existsSync(ordersFile)) return [];
    const raw = fs.readFileSync(ordersFile, "utf-8");
    return JSON.parse(raw) as StoredOrder[];
  } catch (err) {
    console.warn("[Orders DB Read Warning]:", err);
    return [];
  }
}

export function saveOrder(order: StoredOrder): StoredOrder {
  try {
    ensureDir();
    const orders = getAllOrders();
    const index = orders.findIndex((o) => o.id === order.id || o.orderNumber === order.orderNumber);
    
    if (index >= 0) {
      orders[index] = { ...orders[index], ...order, updatedAt: new Date().toISOString() };
    } else {
      orders.unshift({ ...order, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    // Keep memory-bounded to prevent disk exhaustion (last 1000 orders)
    const boundedOrders = orders.slice(0, 1000);
    fs.writeFileSync(ordersFile, JSON.stringify(boundedOrders, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Orders DB Save Warning - Non-blocking]:", err);
  }
  return order;
}

export function findOrderByNumberOrPhone(query: string): StoredOrder[] {
  const clean = query.trim().toLowerCase();
  const orders = getAllOrders();
  return orders.filter(
    (o) =>
      o.orderNumber.toLowerCase() === clean ||
      o.id.toLowerCase() === clean ||
      o.customerPhone.includes(clean) ||
      o.customerEmail.toLowerCase() === clean
  );
}

export function updateOrderStatus(
  orderId: string,
  updates: Partial<StoredOrder>
): StoredOrder | null {
  try {
    ensureDir();
    const orders = getAllOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    
    if (index === -1) return null;

    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), "utf-8");
    return orders[index];
  } catch (err) {
    console.warn("[Orders DB Update Warning]:", err);
    return null;
  }
}

export function deleteOrder(orderId: string): boolean {
  try {
    ensureDir();
    let orders = getAllOrders();
    const initialLen = orders.length;
    orders = orders.filter((o) => o.id !== orderId && o.orderNumber !== orderId);

    if (orders.length !== initialLen) {
      fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), "utf-8");
      return true;
    }
    return false;
  } catch (err) {
    console.warn("[Orders DB Delete Warning]:", err);
    return false;
  }
}
