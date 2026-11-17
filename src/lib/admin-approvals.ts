import { createHash, randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { RefundReview } from "@/lib/commerce/refund-review";
import type { adjustUserWalletBalance } from "@/lib/user-control/wallet-adjustment";

type Actor = { id: string; email: string };
type WalletChange = Omit<Parameters<typeof adjustUserWalletBalance>[0], "adminId" | "adminEmail">;
type Operation =
  | { kind: "REFUND"; input: Omit<RefundReview, "adminEmail">; version: string }
  | { kind: "WALLET"; input: WalletChange }
  | { kind: "STOCK_EXPORT"; ids: string[]; version: string; reason: string }
  | { kind: "PRODUCT_LAUNCH"; productId: string; version: string; reason: string };
export type AdminApproval = {
  id: string;
  requester: Actor;
  expiresAt: number;
  operation: Operation;
};
export type ApprovalClaim = (tx: Prisma.TransactionClient) => Promise<void>;
const prefix = "admin_operation_approval:";

export function approvalDigest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function target(operation: Operation) {
  switch (operation.kind) {
    case "REFUND": return operation.input.refundId;
    case "WALLET": return operation.input.userId;
    case "STOCK_EXPORT": return approvalDigest(operation.ids);
    case "PRODUCT_LAUNCH": return operation.productId;
  }
}

function keyFor(operation: Operation) {
  return prefix + operation.kind + ":" + target(operation);
}

async function assertAdmin(tx: Prisma.TransactionClient, id: string) {
  const account = await tx.user.findUnique({ where: { id }, select: { role: true } });
  if (account?.role !== "ADMIN") throw new Error("Administrator access changed.");
}

function audit(tx: Prisma.TransactionClient, actor: Actor, action: string, request: AdminApproval, reason?: string) {
  return tx.adminAuditLog.create({
    data: {
      actorId: actor.id, actorEmail: actor.email, action,
      targetType: request.operation.kind, targetId: target(request.operation),
      details: JSON.stringify({ requestId: request.id, requesterId: request.requester.id, operation: request.operation, reason }),
    },
  });
}

export async function requestAdminApproval(requester: Actor, operation: Operation, transaction?: Prisma.TransactionClient) {
  const submit = async (tx: Prisma.TransactionClient) => {
    await assertAdmin(tx, requester.id);
    const key = keyFor(operation);
    const current = await tx.siteSetting.findUnique({ where: { key } });
    if (current) {
      const pending = JSON.parse(current.value) as AdminApproval;
      if (pending.expiresAt > Date.now()) {
        if (pending.requester.id === requester.id &&
          approvalDigest(pending.operation) === approvalDigest(operation)) return pending.id;
        throw new Error("A request for this target is already pending. Review it in Approvals.");
      }
    }
    const request = {
      id: randomUUID(), requester: { id: requester.id, email: requester.email },
      operation, expiresAt: Date.now() + 86400000,
    };
    const value = JSON.stringify(request);
    await tx.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
    await audit(tx, requester, "OPERATION_APPROVAL_REQUESTED", request);
    return request.id;
  };
  return transaction ? submit(transaction) : prisma.$transaction(submit, { isolationLevel: "Serializable" });
}

export async function listAdminApprovals() {
  const rows = await prisma.siteSetting.findMany({ where: { key: { startsWith: prefix } } });
  return rows.map((row) => JSON.parse(row.value) as AdminApproval)
    .filter((request) => request.expiresAt > Date.now())
    .sort((a, b) => a.expiresAt - b.expiresAt);
}

export function claimAdminApproval(request: AdminApproval, reviewer: Actor, decision: "approve" | "reject", reason: string): ApprovalClaim {
  return async (tx) => {
    if (request.requester.id === reviewer.id) throw new Error("Another administrator must review this request.");
    if (request.expiresAt <= Date.now()) throw new Error("This request has expired.");
    await assertAdmin(tx, reviewer.id);
    if (decision === "approve") await assertAdmin(tx, request.requester.id);

    const key = keyFor(request.operation);
    const row = await tx.siteSetting.findUnique({ where: { key } });
    if (!row || row.value !== JSON.stringify(request)) throw new Error("This request is no longer pending.");
    const claimed = await tx.siteSetting.deleteMany({ where: { id: row.id, value: row.value } });
    if (claimed.count !== 1) throw new Error("This request is no longer pending.");
    await audit(tx, reviewer, decision === "approve" ? "OPERATION_APPROVED" : "OPERATION_REJECTED", request, reason);
  };
}
