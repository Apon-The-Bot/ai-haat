import { NextRequest, NextResponse } from "next/server";
import { subscribeToStockWaitlist } from "@/lib/commerce/stock-waitlist";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, productId, variationId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "প্রোডাক্ট আইডি আবশ্যক" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস লিখুন" },
        { status: 400 }
      );
    }

    // Try to get authenticated user session if available
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || null;

    const result = await subscribeToStockWaitlist({
      email,
      phone: phone || null,
      productId,
      variationId: variationId || null,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: `ধন্যবাদ! ${result.productName} স্টক আসার সাথে সাথে আপনার ইমেইলে নোটিফিকেশন পাঠানো হবে।`,
      data: result,
    });
  } catch (error: any) {
    console.error("[StockWaitlist POST Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "সাবস্ক্রিপশন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
