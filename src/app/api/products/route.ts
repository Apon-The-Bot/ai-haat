import { NextRequest, NextResponse } from "next/server";
import { getPublicProducts, createProduct } from "@/lib/commerce/products";
import { requireAdminMfa } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await getPublicProducts({
      category,
      search,
      sort,
      featured,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      products: result.products,
      pagination: result.pagination,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdminMfa();
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const product = await createProduct(body, authResult.user);

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
