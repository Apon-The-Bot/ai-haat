import { NextRequest, NextResponse } from "next/server";
import { getPublicProductBySlug, updateProduct, deleteProduct } from "@/lib/commerce/products";
import { requireAdminMfa } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const product = await getPublicProductBySlug(params.slug);
    if (!product) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const authResult = await requireAdminMfa();
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const product = await updateProduct(params.slug, body, authResult.user);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const authResult = await requireAdminMfa();
    if (authResult instanceof NextResponse) return authResult;

    await deleteProduct(params.slug, authResult.user);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
