import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { tryAutoFulfillOrder } from "@/lib/commerce/inventory";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required." }, { status: 400 });
    }

    const result = await tryAutoFulfillOrder(orderId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `সফলভাবে ${result.deliveredItemsCount} টি প্রোডাক্ট স্টক পুল থেকে অটো-ডেলিভারি সম্পন্ন হয়েছে!`,
        result,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "স্টক পুলে পর্যাপ্ত কি/একাউন্ট পাওয়া যায়নি অথবা পেমেন্ট এখনো ভেরিফায়েড নয়।",
        result,
      });
    }
  } catch (error: any) {
    console.error("[Admin Auto Fulfill API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to auto-fulfill order" },
      { status: 500 }
    );
  }
}
