import { getAllOrders } from "@/lib/orders-db";
import { prisma } from "@/lib/prisma";

interface FeedViewer {
  id: string;
  email: string;
  role: string;
}

interface FeedOrder {
  id: string;
  orderNumber?: string;
  deliveryStatus: string;
  customerName?: string;
  totalBDT?: number;
  paymentMethod?: string;
}

function projectOrder(order: FeedOrder, isAdmin: boolean) {
  return {
    id: order.orderNumber || order.id,
    delivered: order.deliveryStatus === "DELIVERED" || order.deliveryStatus === "Delivered",
    ...(isAdmin && {
      customerName: order.customerName,
      totalBDT: order.totalBDT,
      paymentMethod: order.paymentMethod,
    }),
  };
}

export type OrderNotification = ReturnType<typeof projectOrder>;

export async function getOrderNotificationFeed(viewer: FeedViewer): Promise<OrderNotification[]> {
  const isAdmin = viewer.role === "ADMIN";
  const email = viewer.email.toLowerCase();
  try {
    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : {
        OR: [
          { userId: viewer.id },
          { userId: null, customerEmail: email.trim() },
        ],
      },
      select: {
        id: true,
        orderNumber: true,
        deliveryStatus: true,
        customerName: isAdmin,
        totalBDT: isAdmin,
        paymentMethod: isAdmin,
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    });
    return orders.map((order) => projectOrder(order, isAdmin));
  } catch (error) {
    console.warn("[Prisma order notification feed fallback to JSON]:", error);
    // Preserve the existing list's fallback order, ownership and history window.
    return getAllOrders()
      .filter((order) => isAdmin || (order.userId
        ? order.userId === viewer.id
        : order.customerEmail?.toLowerCase() === email))
      .map((order) => projectOrder(order, isAdmin));
  }
}
