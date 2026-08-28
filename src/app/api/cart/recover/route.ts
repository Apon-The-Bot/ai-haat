import { NextRequest, NextResponse } from "next/server";
import { getCartByRecoveryToken, markCartRecovered } from "@/lib/commerce/abandoned-cart";
import { getProductById } from "@/lib/products-db";
import { PRODUCTS } from "@/data/products";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || searchParams.get("recover");

    if (!token || !token.trim()) {
      return NextResponse.json({ success: false, error: "Recovery token is required" }, { status: 400 });
    }

    const cart = await getCartByRecoveryToken(token.trim());
    if (!cart) {
      return NextResponse.json({
        success: false,
        error: "Cart recovery link is invalid, expired, or already completed.",
      }, { status: 404 });
    }

    // Enrich cart items with product details if available
    const enrichedItems = await Promise.all(
      cart.items.map(async (item) => {
        let product = await getProductById(item.productId);
        if (!product) {
          product = PRODUCTS.find((p) => p.id === item.productId || p.slug === item.productId) || null;
        }

        const selectedVariation =
          product?.variations?.find((v: any) => v.id === item.variationId) ||
          product?.variations?.[0] || {
            id: item.variationId || "var-default",
            name: item.variationName || "Standard",
            priceBDT: item.priceBDT,
          };

        return {
          id: `${item.productId}-${selectedVariation.id}-${Date.now()}`,
          product: product || {
            id: item.productId,
            name: item.productName,
            slug: item.productId,
            category: "AI Tools",
            image: item.image || "/images/placeholder.svg",
            minPriceBDT: item.priceBDT,
            maxPriceBDT: item.priceBDT,
            regularPriceBDT: item.priceBDT,
            shortDesc: item.productName,
            descriptionBangla: item.productName,
            descriptionEnglish: item.productName,
            features: [],
            productType: "SUBSCRIPTION",
            fulfillmentType: "AUTO_STOCK",
            variations: [selectedVariation],
          },
          selectedVariation,
          quantity: item.quantity || 1,
        };
      })
    );

    // Mark cart as recovered
    await markCartRecovered(token.trim());

    return NextResponse.json({
      success: true,
      cart: {
        id: cart.id,
        customerEmail: cart.customerEmail,
        customerName: cart.customerName,
        customerPhone: cart.customerPhone,
        items: enrichedItems,
        appliedCoupon: cart.appliedCoupon || (cart.stage2SentAt ? "SAVE5" : null),
        subtotalBDT: cart.subtotalBDT,
      },
    });
  } catch (error: any) {
    console.error("[Cart Recovery API Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || body.recoveryToken;

    if (!token || typeof token !== "string" || !token.trim()) {
      return NextResponse.json({ success: false, error: "Recovery token is required" }, { status: 400 });
    }

    const cart = await getCartByRecoveryToken(token.trim());
    if (!cart) {
      return NextResponse.json({
        success: false,
        error: "Cart recovery link is invalid, expired, or already completed.",
      }, { status: 404 });
    }

    await markCartRecovered(token.trim());

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error: any) {
    console.error("[Cart Recovery POST Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status: 500 });
  }
}
