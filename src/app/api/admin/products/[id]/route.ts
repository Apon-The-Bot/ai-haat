import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { getAdminProductById, updateProduct, deleteProduct } from "@/lib/commerce/products";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAdminMfa();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const product = await getAdminProductById(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAdminMfa();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const body = await req.json();
    const product = await updateProduct(id, body, authResult.user);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAdminMfa();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    await deleteProduct(id, authResult.user);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
