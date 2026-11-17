import { NextRequest, NextResponse } from "next/server";
import { requireAdminMfa, requireRecentMfa } from "@/lib/auth-guard";
import { claimAdminApproval, listAdminApprovals } from "@/lib/admin-approvals";
import { reviewRefundRequest } from "@/lib/commerce/refund-review";
import { adjustUserWalletBalance } from "@/lib/user-control/wallet-adjustment";
import { approvedStockExport } from "@/lib/admin-stock-export";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  if (!req.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json({ error: "JSON request required." }, { status: 415 });
  }

  try {
    const { id, decision, reason } = await req.json();
    if (typeof id !== "string" || (decision !== "approve" && decision !== "reject") ||
      typeof reason !== "string" || !reason.trim() || reason.length > 500) {
      return NextResponse.json({ error: "Select a decision and provide a reason." }, { status: 400 });
    }
    const request = (await listAdminApprovals()).find((pending) => pending.id === id);
    if (!request) return NextResponse.json({ error: "Request expired or already reviewed." }, { status: 409 });
    if (request.requester.id === auth.user.id) {
      return NextResponse.json({ error: "Another administrator must review this request." }, { status: 403 });
    }

    const { operation } = request;
    const claim = claimAdminApproval(request, auth.user, decision, reason.trim());
    if (decision === "reject") {
      await prisma.$transaction(claim, { isolationLevel: "Serializable" });
    } else if (operation.kind === "REFUND") {
      await reviewRefundRequest({ ...operation.input, adminEmail: auth.user.email }, async (tx) => {
        await claim(tx);
        const refund = await tx.refund.findUniqueOrThrow({ where: { id: operation.input.refundId } });
        if (refund.updatedAt.toISOString() !== operation.version) {
          throw new Error("Refund changed since submission. Request a new approval.");
        }
      });
    } else if (operation.kind === "WALLET") {
      if (operation.input.amountBDT >= 1000) {
        const stepUp = await requireRecentMfa(5);
        if (stepUp instanceof NextResponse) return stepUp;
      }
      await adjustUserWalletBalance({ ...operation.input, adminId: auth.user.id, adminEmail: auth.user.email }, claim);
    } else if (operation.kind === "PRODUCT_LAUNCH") {
      const product = await prisma.product.findUnique({ where: { id: operation.productId }, select: { id: true, slug: true, updatedAt: true } });
      if (!product || product.updatedAt.toISOString() !== operation.version) {
        throw new Error("Product changed since submission. Run the launch checklist again.");
      }
      await prisma.$transaction(async (tx) => {
        await claim(tx);
        const updated = await tx.product.updateMany({
          where: { id: product.id, updatedAt: product.updatedAt, status: { not: "ARCHIVED" } },
          data: { status: "ACTIVE", visibility: "PUBLIC", inStock: true },
        });
        if (updated.count !== 1) throw new Error("Product could not be published.");
      }, { isolationLevel: "Serializable" });
      revalidatePath(`/product/${product.slug}`);
      revalidatePath("/shop");
    } else {
      const items = await prisma.$transaction(async (tx) => {
        await claim(tx);
        return approvedStockExport(tx, operation.ids, operation.version);
      }, { isolationLevel: "Serializable" });
      return NextResponse.json({ success: true, items }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2034") {
      return NextResponse.json({ error: "A concurrent change occurred. Refresh and try again." }, { status: 409 });
    }
    const message = error instanceof Error && !("code" in error) ? error.message : "Unable to complete approval.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
