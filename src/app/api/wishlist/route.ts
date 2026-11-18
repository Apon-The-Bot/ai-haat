import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const items = await prisma.wishlistItem.findMany({
    where: { userId: auth.user.id },
    orderBy: { createdAt: "desc" },
    include: { product: { select: { id: true, slug: true, name: true, image: true, minPriceBDT: true, maxPriceBDT: true, salePriceBDT: true, inStock: true, status: true, visibility: true } } },
  });
  return NextResponse.json({ success: true, items });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const body = await request.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId : "";
  if (!productId || productId.length > 100) return NextResponse.json({ error: "A valid product is required" }, { status: 400 });
  const product = await prisma.product.findFirst({ where: { id: productId, status: "ACTIVE", visibility: "PUBLIC" }, select: { id: true } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  const item = await prisma.wishlistItem.upsert({ where: { userId_productId: { userId: auth.user.id, productId } }, create: { userId: auth.user.id, productId }, update: {} });
  return NextResponse.json({ success: true, item }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const productId = new URL(request.url).searchParams.get("productId") || "";
  if (!productId) return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  await prisma.wishlistItem.deleteMany({ where: { userId: auth.user.id, productId } });
  return NextResponse.json({ success: true });
}
