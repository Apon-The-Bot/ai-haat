import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { calculateGrossMarginPct } from "@/lib/commerce/costing";
import { calculateOrderQuote, OrderItemInput } from "@/lib/commerce/pricing";
import { getAllProducts } from "@/lib/products-db";

export const dynamic = "force-dynamic";

function catalogProducts(products: Awaited<ReturnType<typeof getAllProducts>>) {
  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    priceBDT: product.minPriceBDT,
    inStock: product.inStock !== false,
    variations: (product.variations || []).map((variation) => ({
      id: variation.id,
      name: variation.name,
      priceBDT: variation.priceBDT,
      inStock: variation.inStock !== false,
    })),
  }));
}

export async function GET() {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const products = await getAllProducts();
    return NextResponse.json({ success: true, products: catalogProducts(products) });
  } catch (error) {
    console.error("[Coupon Simulator Catalog Error]", error);
    return NextResponse.json({ success: false, error: "Failed to load simulator catalog." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const normalizedItems: OrderItemInput[] = items.map((item: Partial<OrderItemInput>) => ({
      productId: String(item.productId || ""),
      variationId: item.variationId || null,
      quantity: Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1))),
    }));

    if (normalizedItems.length === 0) {
      return NextResponse.json({ success: false, error: "Add at least one product to the sample cart." }, { status: 400 });
    }

    const result = await calculateOrderQuote(normalizedItems, typeof body.couponCode === "string" ? body.couponCode : null);
    const quote = result.quote;
    const grossProfitBDT = Math.round((quote.totalBDT - (quote.costPriceTotalBDT || 0)) * 100) / 100;

    return NextResponse.json({
      success: result.isValid,
      error: result.error,
      quote: {
        subtotalBDT: quote.subtotalBDT,
        discountBDT: quote.discountBDT,
        couponDiscountBDT: quote.couponDiscountBDT || 0,
        volumeDiscountBDT: quote.volumeDiscountBDT || 0,
        bundleDiscountBDT: quote.bundleDiscountBDT || 0,
        totalBDT: quote.totalBDT,
        costPriceTotalBDT: quote.costPriceTotalBDT || 0,
        grossProfitBDT,
        grossMarginPct: calculateGrossMarginPct(grossProfitBDT, quote.totalBDT),
        couponCode: quote.couponCode,
        appliedBundleName: quote.appliedBundleName,
        items: quote.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          variationName: item.variationName,
          quantity: item.quantity,
          unitPriceBDT: item.priceBDT,
          unitCostBDT: item.costPriceBDT,
          lineTotalBDT: Math.round(item.priceBDT * item.quantity * 100) / 100,
        })),
      },
    });
  } catch (error) {
    console.error("[Coupon Simulator Quote Error]", error);
    return NextResponse.json({ success: false, error: "Failed to calculate sample quote." }, { status: 500 });
  }
}
