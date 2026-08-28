import { NextRequest, NextResponse } from "next/server";
import { getAllReviews, createReview } from "@/lib/reviews-db";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const status = searchParams.get("status") || "APPROVED";
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;

    const reviews = await getAllReviews({
      productId,
      search,
      status,
      limit,
    });

    const total = reviews.length;
    const averageRating =
      total > 0
        ? Number((reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / total).toFixed(1))
        : 5.0;

    const ratingCounts = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return NextResponse.json({
      success: true,
      reviews,
      total,
      averageRating,
      ratingCounts,
    });
  } catch (error: any) {
    console.error("[Reviews API GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews", reviews: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { rating, comment, productId, productName } = body;

    const finalName = (user.name || user.email || "").trim();
    if (!finalName) {
      return NextResponse.json(
        { error: "আপনার নাম বা ইউজারনেম আবশ্যক।" },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে আপনার রিভিউ বা মন্তব্য লিখুন।" },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: "রেটিং ১ থেকে ৫ এর মধ্যে হতে হবে।" },
        { status: 400 }
      );
    }

    let isVerifiedPurchase = false;
    if (productId) {
      const verifiedOrder = await prisma.order.findFirst({
        where: {
          userId: user.id,
          paymentStatus: 'VERIFIED',
          items: { some: { productId: productId.trim() } }
        }
      });
      isVerifiedPurchase = !!verifiedOrder;
    }

    const newReview = await createReview({
      userId: user.id,
      userName: user.name || user.email,
      author: finalName,
      rating: Math.round(numRating),
      comment: comment.trim(),
      productId: productId?.trim() || undefined,
      productName: productName?.trim() || undefined,
      isVerifiedPurchase,
      status: 'PENDING',
    });

    return NextResponse.json({
      success: true,
      message: "আপনার রিভিউ সফলভাবে জমা দেওয়া হয়েছে এবং পর্যালোচনার জন্য অপেক্ষমাণ রয়েছে!",
      review: newReview,
    });
  } catch (error: any) {
    console.error("[Reviews API POST Error]:", error);
    return NextResponse.json(
      { error: error?.message || "রিভিউ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }
}
