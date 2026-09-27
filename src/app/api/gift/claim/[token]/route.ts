import { NextRequest, NextResponse } from "next/server";
import { getGiftByClaimToken, markGiftAsOpened } from "@/lib/gifting/product-gifting";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    token: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Missing gift claim token" }, { status: 400 });
    }

    const gift = await getGiftByClaimToken(token);
    if (!gift) {
      return NextResponse.json(
        { error: "উপহারটি খুঁজে পাওয়া যায়নি অথবা লিঙ্কটি অকার্যকর।" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      gift,
    });
  } catch (error: any) {
    console.error("[GET /api/gift/claim/[token] error]:", error);
    return NextResponse.json(
      { error: "Internal server error fetching gift details" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: "Missing gift claim token" }, { status: 400 });
    }

    const result = await markGiftAsOpened(token);
    if (!result) {
      return NextResponse.json({ error: "Failed to mark gift as opened" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      openedAt: result.giftOpenedAt,
      message: "Gift unwrapped successfully!",
    });
  } catch (error: any) {
    console.error("[POST /api/gift/claim/[token] error]:", error);
    return NextResponse.json(
      { error: "Internal server error updating gift status" },
      { status: 500 }
    );
  }
}
