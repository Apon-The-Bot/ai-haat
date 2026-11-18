import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { requestAdminApproval } from "@/lib/admin-approvals";

export const dynamic = "force-dynamic";

type Check = { key: string; label: string; passed: boolean; severity: "error" | "warning" | "info"; message: string };

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function checkProduct(product: any): Check[] {
  const variations = product.variations as any[];
  const activeVariations = variations.filter((variation) => variation.inStock);
  const checks: Check[] = [];
  const add = (key: string, label: string, passed: boolean, message: string, severity: Check["severity"] = "error") =>
    checks.push({ key, label, passed, message, severity });

  add("identity", "Product identity", product.name.trim().length >= 2 && product.slug.trim().length >= 2,
    product.name.trim().length >= 2 ? "Name and slug are present." : "Add a product name and a valid slug.");
  add("category", "Category", Boolean(product.category.trim()), product.category.trim() ? "Category is assigned." : "Assign a category before publishing.");
  add("content", "Storefront content", Boolean(product.image && product.shortDesc.trim() && (product.descriptionBangla.trim() || product.descriptionEnglish.trim())),
    product.image && product.shortDesc.trim() ? "Image and customer-facing descriptions are present." : "Add an image, short description and at least one full description.");
  add("price", "Price", product.minPriceBDT > 0 && product.maxPriceBDT >= product.minPriceBDT && (!product.salePriceBDT || !product.regularPriceBDT || product.salePriceBDT < product.regularPriceBDT),
    product.salePriceBDT && product.regularPriceBDT && product.salePriceBDT >= product.regularPriceBDT ? "Sale price must be lower than regular price." : "Base prices are consistent.");
  add("variations", "Variations", variations.length > 0 && activeVariations.every((v) => v.name.trim() && v.priceBDT > 0 && (!v.salePriceBDT || !v.regularPriceBDT || v.salePriceBDT < v.regularPriceBDT)),
    variations.length === 0 ? "Add at least one variation." : "Every active variation has a name and valid price.");
  add("stock", "Stock readiness", product.fulfillmentType !== "AUTO_STOCK" || activeVariations.some((v) => product.digitalStocks.some((s: any) => s.variationId === v.id && s.status === "AVAILABLE")) || product.digitalStocks.some((s: any) => !s.variationId && s.status === "AVAILABLE"),
    product.fulfillmentType === "AUTO_STOCK" ? "At least one active variation has available stock." : "Manual or protected fulfillment does not require digital stock.");
  add("delivery", "Delivery", Boolean(product.deliveryTime.trim() && product.deliveryType.trim() && product.deliverySla), "Delivery timing and method are configured.");
  add("policies", "Policies", product.warrantyDays >= 0 && (product.refundAllowed || product.replacementAllowed), "Warranty and at least one after-sales policy are configured.", "warning");
  add("seo", "SEO preview", Boolean(product.seoTitle?.trim() && product.seoDescription?.trim()), "SEO title and description are ready.", "warning");
  add("visibility", "Launch visibility", product.status === "ACTIVE" && product.visibility === "PUBLIC" && product.inStock, "Product is active, public and marked in stock.");
  return checks;
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ success: false, error: "Product id or slug is required." }, { status: 400 });

  try {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { variations: { orderBy: { sortOrder: "asc" } }, digitalStocks: { select: { variationId: true, status: true, expiryDate: true } } },
    });
    if (!product) return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });

    const checks = checkProduct(product);
    const preview = {
      id: product.id, slug: product.slug, name: product.name, category: product.category, image: product.image,
      shortDesc: product.shortDesc, descriptionBangla: product.descriptionBangla, descriptionEnglish: product.descriptionEnglish,
      features: parseJson<string[]>(product.features, []), gallery: parseJson<string[]>(product.gallery, []),
      specifications: parseJson<Array<{ label: string; value: string }>>(product.specifications, []),
      deliveryTime: product.deliveryTime, deliveryType: product.deliveryType, warranty: product.warranty, validity: product.validity,
      deviceSupport: product.deviceSupport, price: product.salePriceBDT || product.minPriceBDT,
      variations: product.variations.filter((v) => v.inStock).map((v) => ({ id: v.id, name: v.name, priceBDT: v.salePriceBDT || v.priceBDT, duration: v.duration, deliverySla: v.deliverySla })),
    };
    return NextResponse.json({ success: true, product: { id: product.id, name: product.name, slug: product.slug, status: product.status, visibility: product.visibility }, checks, preview, summary: { passed: checks.filter((c) => c.passed).length, total: checks.length, errors: checks.filter((c) => !c.passed && c.severity === "error").length, warnings: checks.filter((c) => !c.passed && c.severity === "warning").length } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Failed to load launch checklist." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    if (!id || reason.length < 3 || reason.length > 500) {
      return NextResponse.json({ success: false, error: "Product and a review reason are required." }, { status: 400 });
    }
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { variations: { orderBy: { sortOrder: "asc" } }, digitalStocks: { select: { variationId: true, status: true, expiryDate: true } } },
    });
    if (!product) return NextResponse.json({ success: false, error: "Product not found." }, { status: 404 });
    const checks = checkProduct(product);
    if (checks.some((check) => !check.passed && check.severity === "error")) {
      return NextResponse.json({ success: false, error: "Resolve all blocking launch checklist issues before requesting approval." }, { status: 409 });
    }
    const approvalId = await requestAdminApproval(auth.user, {
      kind: "PRODUCT_LAUNCH", productId: product.id, version: product.updatedAt.toISOString(), reason,
    });
    return NextResponse.json({ success: true, pendingApproval: true, approvalId }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unable to submit launch review." }, { status: 400 });
  }
}
