import { NextRequest, NextResponse } from "next/server";
import { captureAbandonedCart, markCartCleared, markCartConverted } from "@/lib/commerce/abandoned-cart";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, email, phone, name, items, subtotalBDT, appliedCoupon, orderId, token } = body;

    if (action === "CLEAR") {
      if (email || token) {
        await markCartCleared(email || token);
      }
      return NextResponse.json({ success: true, message: "Cart marked cleared" });
    }

    if (action === "CONVERT") {
      if (email || token) {
        await markCartConverted(email || token, orderId);
      }
      return NextResponse.json({ success: true, message: "Cart marked converted" });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid email is required" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Items array is required" }, { status: 400 });
    }

    const cart = await captureAbandonedCart({
      email,
      phone,
      name,
      items,
      subtotalBDT,
      appliedCoupon,
    });

    if (!cart) {
      return NextResponse.json({ success: false, error: "Failed to capture cart" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      cartId: cart.id,
      recoveryToken: cart.recoveryToken,
    });
  } catch (error: any) {
    console.error("[Cart Abandon API Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status: 500 });
  }
}
