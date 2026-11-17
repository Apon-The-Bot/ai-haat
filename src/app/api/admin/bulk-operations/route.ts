import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { requireAdminMfa } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";
import { bulkUpdateProductPrice } from "@/lib/commerce/products";

export const dynamic = "force-dynamic";

type Operation =
  | "PRODUCT_STATUS"
  | "PRODUCT_PRICE"
  | "PRODUCT_CATEGORY"
  | "COUPON_ACTIVE"
  | "CUSTOMER_TAG";

const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const uniqueIds = (value: unknown) => Array.from(new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === "string" && id.trim().length > 0) : []));
const operationDigest = (input: ReturnType<typeof validate>) => digest({ operation: input.operation, ids: input.ids, body: Object.fromEntries(Object.entries(input.body).filter(([key]) => key !== "mode" && key !== "previewDigest")) });

function validate(body: Record<string, unknown>) {
  const operation = body.operation as Operation;
  if (!["PRODUCT_STATUS", "PRODUCT_PRICE", "PRODUCT_CATEGORY", "COUPON_ACTIVE", "CUSTOMER_TAG"].includes(operation)) {
    throw new Error("Unsupported bulk operation.");
  }
  const ids = uniqueIds(body.ids);
  if (ids.length === 0 || ids.length > 500) throw new Error("Select between 1 and 500 records.");
  if (operation === "PRODUCT_STATUS" && !["ACTIVE", "INACTIVE", "ARCHIVED", "DRAFT"].includes(String(body.status))) {
    throw new Error("Invalid product status.");
  }
  if (operation === "PRODUCT_CATEGORY" && (!String(body.category || "").trim() || String(body.category).length > 120)) {
    throw new Error("A category between 1 and 120 characters is required.");
  }
  if (operation === "COUPON_ACTIVE" && typeof body.isActive !== "boolean") throw new Error("isActive must be boolean.");
  if (operation === "CUSTOMER_TAG") {
    const tag = String(body.tag || "").trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9 _-]{0,99}$/.test(tag)) throw new Error("Tag contains invalid characters.");
    if (body.mode !== "ADD" && body.mode !== "REMOVE") throw new Error("Tag mode must be ADD or REMOVE.");
  }
  if (operation === "PRODUCT_PRICE") {
    const adjustment = body.adjustment as Record<string, unknown> | undefined;
    if (!adjustment || !["PERCENT", "FIXED"].includes(String(adjustment.type)) || !["INCREASE", "DECREASE"].includes(String(adjustment.direction))) {
      throw new Error("A valid price adjustment is required.");
    }
    const value = Number(adjustment.value);
    if (!Number.isFinite(value) || value < 0 || value > 100000) throw new Error("Price adjustment is out of range.");
  }
  return { operation, ids, body };
}

async function preview(input: ReturnType<typeof validate>) {
  const { operation, ids, body } = input;
  if (operation.startsWith("PRODUCT_")) {
    const rows = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, status: true, category: true, regularPriceBDT: true, minPriceBDT: true }, orderBy: { id: "asc" } });
    const found = new Set(rows.map((row) => row.id));
    const changes = rows.map((row) => ({ id: row.id, name: row.name, before: row.status === undefined ? row.category : operation === "PRODUCT_CATEGORY" ? row.category : operation === "PRODUCT_STATUS" ? row.status : row.regularPriceBDT ?? row.minPriceBDT, after: operation === "PRODUCT_CATEGORY" ? String(body.category).trim() : operation === "PRODUCT_STATUS" ? body.status : "calculated at commit" }));
    return { operation, requested: ids.length, matched: rows.length, skipped: ids.filter((id) => !found.has(id)), changes: changes.slice(0, 20), digest: operationDigest(input) };
  }
  if (operation === "COUPON_ACTIVE") {
    const rows = await prisma.coupon.findMany({ where: { id: { in: ids } }, select: { id: true, code: true, isActive: true }, orderBy: { id: "asc" } });
    const found = new Set(rows.map((row) => row.id));
    return { operation, requested: ids.length, matched: rows.length, skipped: ids.filter((id) => !found.has(id)), changes: rows.slice(0, 20).map((row) => ({ id: row.id, name: row.code, before: row.isActive, after: body.isActive })), digest: operationDigest(input) };
  }
  const rows = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, email: true }, orderBy: { id: "asc" } });
  const found = new Set(rows.map((row) => row.id));
  return { operation, requested: ids.length, matched: rows.length, skipped: ids.filter((id) => !found.has(id)), changes: rows.slice(0, 20).map((row) => ({ id: row.id, name: row.name || row.email, before: "existing tags", after: `${body.mode}: ${String(body.tag).trim().toUpperCase()}` })), digest: operationDigest(input) };
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await req.json() as Record<string, unknown>;
    const input = validate(body);
    if (body.mode === "PREVIEW") return NextResponse.json({ success: true, preview: await preview(input) });
    if (body.mode !== "COMMIT" || body.previewDigest !== operationDigest(input)) {
      return NextResponse.json({ success: false, error: "Run a fresh preview before committing." }, { status: 409 });
    }
    const current = await preview(input);
    if (current.matched !== current.requested) return NextResponse.json({ success: false, error: "Some selected records no longer exist. Preview again.", preview: current }, { status: 409 });
    let affected = 0;
    if (input.operation === "PRODUCT_STATUS") affected = (await prisma.product.updateMany({ where: { id: { in: input.ids } }, data: { status: input.body.status as any, ...(input.body.status === "ARCHIVED" ? { archivedAt: new Date() } : {}) } })).count;
    if (input.operation === "PRODUCT_CATEGORY") affected = (await prisma.product.updateMany({ where: { id: { in: input.ids } }, data: { category: String(input.body.category).trim() } })).count;
    if (input.operation === "PRODUCT_PRICE") { await bulkUpdateProductPrice(input.ids, input.body.adjustment as never, auth.user); affected = input.ids.length; }
    if (input.operation === "COUPON_ACTIVE") affected = (await prisma.coupon.updateMany({ where: { id: { in: input.ids } }, data: { isActive: input.body.isActive as boolean } })).count;
    if (input.operation === "CUSTOMER_TAG") {
      const tag = String(input.body.tag).trim().toUpperCase();
      if (input.body.mode === "ADD") { const result = await prisma.userTag.createMany({ data: input.ids.map((userId) => ({ userId, tag, assignedById: auth.user.id })), skipDuplicates: true }); affected = result.count; }
      else affected = (await prisma.userTag.deleteMany({ where: { userId: { in: input.ids }, tag } })).count;
    }
    await logAdminAudit({ actorId: auth.user.id, actorEmail: auth.user.email, action: "ADMIN_BULK_OPERATION_COMMITTED", targetType: input.operation, targetId: input.ids.join(","), details: { operation: input.operation, requested: input.ids.length, affected } });
    return NextResponse.json({ success: true, affected });
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Bulk operation failed." }, { status: 400 }); }
}
