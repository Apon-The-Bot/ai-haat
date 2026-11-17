import Link from "next/link";
import { NextResponse } from "next/server";
import { requireTeamAdmin } from "@/lib/staff-access";
import { listAdminApprovals } from "@/lib/admin-approvals";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductLaunchReviewPage() {
  const auth = await requireTeamAdmin();
  if (auth instanceof NextResponse) return <p>Administrator access and verified MFA are required.</p>;
  const requests = (await listAdminApprovals()).filter(({ operation }) => operation.kind === "PRODUCT_LAUNCH");
  const products = await prisma.product.findMany({ where: { id: { in: requests.map(({ operation }) => operation.kind === "PRODUCT_LAUNCH" ? operation.productId : "") } }, select: { id: true, name: true, slug: true, status: true } });
  const byId = new Map(products.map((product) => [product.id, product]));
  return <main className="max-w-5xl space-y-4"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">Product Launch Reviews</h1><p className="text-sm text-slate-600">Review products waiting for a second administrator’s publish approval.</p></div><Link href="/admin/approvals" className="rounded-lg border bg-white px-3 py-2 text-sm">All approvals</Link></div>{requests.length === 0 && <p className="rounded-xl border bg-white p-5">No product launch reviews pending.</p>}{requests.map(({ id, requester, expiresAt, operation }) => { if (operation.kind !== "PRODUCT_LAUNCH") return null; const product = byId.get(operation.productId); return <article key={id} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{product?.name ?? "Product unavailable"}</h2><p className="text-sm text-slate-600">Requested by {requester.email} · expires {new Date(expiresAt).toISOString().slice(0, 16).replace("T", " ")} UTC</p><p className="mt-2 text-sm">Reason: {operation.reason}</p></div>{product && <Link href={`/admin/products/launch?id=${encodeURIComponent(product.id)}`} className="rounded-lg border px-3 py-2 text-sm">Open checklist</Link>}</div></article>; })}</main>;
}
