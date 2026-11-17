import { NextResponse } from "next/server";
import { requireTeamAdmin } from "@/lib/staff-access";
import { listAdminApprovals } from "@/lib/admin-approvals";
import { prisma } from "@/lib/prisma";
import { ApprovalDecision } from "./ApprovalDecision";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminApprovalsPage() {
  const auth = await requireTeamAdmin();
  if (auth instanceof NextResponse) return <p>Administrator access and verified MFA are required.</p>;

  const requests = await listAdminApprovals();
  const userIds = requests.flatMap(({ operation }) => operation.kind === "WALLET" ? [operation.input.userId] : []);
  const refundIds = requests.flatMap(({ operation }) => operation.kind === "REFUND" ? [operation.input.refundId] : []);
  const [users, refunds] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } }),
    prisma.refund.findMany({
      where: { id: { in: refundIds } }, select: { id: true, refundMethod: true, order: { select: { orderNumber: true } } },
    }),
  ]);
  const emails = new Map(users.map((user) => [user.id, user.email]));
  const refundDetails = new Map(refunds.map((refund) => [refund.id, refund]));

  return (
    <main className="max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Admin Approvals</h1>
      <p className="text-sm text-slate-600">Requests expire after 24 hours. A different administrator must review them.</p>
      {requests.length === 0 && <p className="rounded-xl border bg-white p-5">No pending approvals.</p>}
      {requests.map(({ id, requester, expiresAt, operation }) => {
        const refund = operation.kind === "REFUND" ? refundDetails.get(operation.input.refundId) : undefined;
        return (
          <article key={id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">
              {operation.kind === "WALLET" ? "Wallet adjustment" :
                operation.kind === "REFUND" ? "Refund" : operation.kind === "PRODUCT_LAUNCH" ? "Product launch" : "Bulk stock export"}
            </h2>
            <p className="break-words text-sm text-slate-600">
              Requested by {requester.email}. Expires {new Date(expiresAt).toISOString().replace("T", " ").slice(0, 16)} UTC.
            </p>
            {operation.kind === "WALLET" && <div className="space-y-1 break-words text-sm">
              <p>{operation.input.type} ৳{operation.input.amountBDT} · {emails.get(operation.input.userId) ?? operation.input.userId}</p>
              <p>{operation.input.category} · {operation.input.reason}</p>
              {operation.input.reference && <p>Reference {operation.input.reference}</p>}
              {operation.input.ledger && <p>Method {operation.input.ledger.method}</p>}
              {operation.input.internalNote && <p>Internal note {operation.input.internalNote}</p>}
            </div>}
            {operation.kind === "REFUND" && <div className="space-y-1 break-words text-sm">
              <p>Order {refund?.order.orderNumber ?? "unavailable"} · {refund?.refundMethod}</p>
              <p>{operation.input.action.replaceAll("_", " ")} · ৳{operation.input.approvedAmount}</p>
              {operation.input.payoutTrxId && <p>Payout reference {operation.input.payoutTrxId}</p>}
              {operation.input.gatewayRef && <p>Gateway reference {operation.input.gatewayRef}</p>}
              {operation.input.adminNotes && <p>Internal note {operation.input.adminNotes}</p>}
              {operation.input.customerMessage && <p>Customer message {operation.input.customerMessage}</p>}
            </div>}
            {operation.kind === "STOCK_EXPORT" && <div className="space-y-1 break-words text-sm">
              <p>{operation.ids.length} stock items · {operation.reason}</p>
              <details><summary>Selected stock IDs</summary><p>{operation.ids.join(", ")}</p></details>
            </div>}
            {operation.kind === "PRODUCT_LAUNCH" && <p className="break-words text-sm">Product ID {operation.productId} · {operation.reason}</p>}
            {operation.kind === "PRODUCT_LAUNCH" && <Link href={`/admin/products/launch?id=${encodeURIComponent(operation.productId)}`} className="inline-block rounded-lg border px-3 py-2 text-sm">Open launch checklist</Link>}
            {requester.id === auth.user.id
              ? <p className="text-sm text-slate-600">Awaiting another administrator.</p>
              : <ApprovalDecision id={id} downloadsStock={operation.kind === "STOCK_EXPORT"} />}
          </article>
        );
      })}
    </main>
  );
}
