// ─── AI Haat — Analytics-Safe Order Data Endpoint ────────────────
// Returns ONLY analytics-safe order data for client-side Purchase event.
// No credentials, no PII, no payment gateway details.
// Rate limited to prevent abuse.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Simple in-memory rate limiter (10 req/min per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const orderId = req.nextUrl.searchParams.get("orderId")?.trim();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Fetch order with items — whitelist fields
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      select: {
        orderNumber: true,
        totalBDT: true,
        discountBDT: true,
        paymentStatus: true,
        paymentMethod: true,
        items: {
          select: {
            productId: true,
            variationId: true,
            productName: true,
            variationName: true,
            priceBDT: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Build analytics-safe response — NO customer PII, credentials, or gateway details
    // Try to get category from product data
    const productIds = order.items
      .map((item) => item.productId)
      .filter(Boolean) as string[];

    let productCategories: Record<string, string> = {};
    if (productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, category: true },
      });
      productCategories = Object.fromEntries(products.map((p) => [p.id, p.category]));
    }

    // Check if a coupon was used (from discount > 0, but don't expose coupon code directly)
    // We can safely include coupon code since it's not sensitive
    let couponCode: string | undefined;
    if (order.discountBDT > 0) {
      // Try to find the coupon from order notes or timeline — simplified approach
      couponCode = undefined; // Will be enhanced when order stores coupon code
    }

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        totalBDT: order.totalBDT,
        discountBDT: order.discountBDT,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        couponCode,
        items: order.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          variationName: item.variationName,
          priceBDT: item.priceBDT,
          quantity: item.quantity,
          category: item.productId ? productCategories[item.productId] : undefined,
        })),
      },
    });
  } catch (err) {
    console.error("[Analytics Order API Error]:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
