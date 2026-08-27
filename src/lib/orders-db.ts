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
  date: string;
  createdAt: string;
  updatedAt: string;
}

const dataDir = path.join(process.cwd(), "data");
const ordersFile = path.join(dataDir, "orders.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, JSON.stringify([], null, 2), "utf-8");
  }
}

export function getAllOrders(): StoredOrder[] {
  ensureDir();
  try {
    const raw = fs.readFileSync(ordersFile, "utf-8");
    return JSON.parse(raw) as StoredOrder[];
  } catch {
    return [];
  }
}

export function saveOrder(order: StoredOrder): StoredOrder {
  ensureDir();
  const orders = getAllOrders();
  const index = orders.findIndex((o) => o.id === order.id || o.orderNumber === order.orderNumber);
  
  if (index >= 0) {
    orders[index] = { ...orders[index], ...order, updatedAt: new Date().toISOString() };
  } else {
    orders.unshift({ ...order, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }

  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), "utf-8");
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
}

export function deleteOrder(orderId: string): boolean {
  ensureDir();
  let orders = getAllOrders();
  const initialLen = orders.length;
  orders = orders.filter((o) => o.id !== orderId && o.orderNumber !== orderId);

  if (orders.length !== initialLen) {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), "utf-8");
    return true;
  }
  return false;
}
