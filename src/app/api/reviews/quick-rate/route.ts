import { NextRequest, NextResponse } from "next/server";
import { submitQuickRating, findReviewRequestByToken } from "@/lib/commerce/reviews-retention";
import { renderThankYouHtml } from "@/lib/security/html-escape";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") || searchParams.get("t");
    const rawRating = searchParams.get("rating") || searchParams.get("r");
    const comment = searchParams.get("comment") || searchParams.get("c") || undefined;
    const isFull = searchParams.get("full") === "true";
    const acceptsHtml = req.headers.get("accept")?.includes("text/html");

    if (!token || !token.trim()) {
      if (acceptsHtml) {
        return new NextResponse(
          "<h1>Invalid or missing review token</h1>",
          { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
      return NextResponse.json({ success: false, error: "Review token is required" }, { status: 400 });
    }

    const record = findReviewRequestByToken(token.trim());
    if (!record) {
      if (acceptsHtml) {
        return new NextResponse(
          "<h1>Review token is invalid or expired</h1>",
          { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
      return NextResponse.json({ success: false, error: "Review token not found or expired" }, { status: 404 });
    }

    if (rawRating) {
      const rating = parseInt(rawRating, 10);
      const result = await submitQuickRating(token.trim(), rating, comment);

      if (acceptsHtml) {
        return new NextResponse(
          renderThankYouHtml(record.productName, rating, record.customerName, record.orderNumber),
          { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.message,
        review: result.review,
      });
    }

    if (isFull) {
      // Redirect to product page review modal
      const redirectUrl = new URL(`/products/${record.productId}?review=true&order=${encodeURIComponent(record.orderNumber)}`, req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json({
      success: true,
      record: {
        orderNumber: record.orderNumber,
        productName: record.productName,
        customerName: record.customerName,
        status: record.status,
      },
    });
  } catch (error: any) {
    console.error("[Quick Rate API Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, rating, comment } = body;

    if (!token || typeof token !== "string" || !token.trim()) {
      return NextResponse.json({ success: false, error: "Review token is required" }, { status: 400 });
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json({ success: false, error: "Rating (1-5) is required" }, { status: 400 });
    }

    const numRating = parseInt(String(rating), 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const result = await submitQuickRating(token.trim(), numRating, comment);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      review: result.review,
    });
  } catch (error: any) {
    console.error("[Quick Rate POST Error]:", error);
    return NextResponse.json({ success: false, error: error?.message || "Internal server error" }, { status: 500 });
  }
}
