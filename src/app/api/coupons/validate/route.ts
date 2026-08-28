import { NextRequest, NextResponse } from "next/server";
import { calculateOrderQuote } from "@/lib/commerce/pricing";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(`coupon-validate:${ip}`, 10, 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterMs, "অনেকবার কুপন চেষ্টা করা হয়েছে। ১ মিনিট পর আবার চেষ্টা করুন।");
  }

  try {
    const body = await req.json();
    const code = (body.code || body.couponCode || "").trim().toUpperCase();
    const items = body.items;

    if (!code || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { valid: false, isValid: false, error: "অনুগ্রহ করে কুপন কোড ও কার্ট আইটেম প্রদান করুন।" },
        { status: 400 }
      );
    }

    const priceCheck = await calculateOrderQuote(
      items.map((it: any) => ({
        productId: it.productId || it.id || "",
        variationId: it.variationId || it.selectedVariation?.id || null,
        productName: it.productName || it.name || "",
        variationName: it.variationName || it.selectedVariation?.name || "",
        quantity: Number(it.quantity) || 1,
      })),
      code
    );

    if (!priceCheck.isValid) {
      return NextResponse.json({ valid: false, isValid: false, error: priceCheck.error }, { status: 400 });
    }

    const { quote } = priceCheck;

    if (!quote.couponCode) {
      return NextResponse.json({
        valid: false,
        isValid: false,
        error: "কুপন কোডটি সঠিক নয়, মেয়াদ শেষ অথবা সর্বনিম্ন অর্ডারের শর্ত পূরণ করেনি।",
      }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      isValid: true,
      coupon: {
        code: quote.couponCode,
        discountBDT: quote.discountBDT,
        subtotalBDT: quote.subtotalBDT,
        totalBDT: quote.totalBDT,
        discountType: quote.couponDiscountType,
        discountValue: quote.couponDiscountValue,
      },
      quote: {
        couponCode: quote.couponCode,
        discountBDT: quote.discountBDT,
        subtotalBDT: quote.subtotalBDT,
        totalBDT: quote.totalBDT,
      },
    });
  } catch (error: any) {
    console.error("[Coupon Validate Error]:", error);
    return NextResponse.json({ valid: false, isValid: false, error: "কুপন যাচাই করতে সমস্যা হয়েছে।" }, { status: 500 });
  }
}
