import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { staffAuditTarget, staffRequestPrefix } from "@/lib/staff-access";
import { hasStaffGrant, staffGrantKey, type StaffRole } from "@/lib/staff-roles";

type Actor = { id: string; email: string };
type Change = "grant" | "revoke";
type Decision = "approve" | "reject";

export class StaffRequestError extends Error {}

async function assertCurrentAdmin(db: Prisma.TransactionClient, id: string) {
  const account = await db.user.findUnique({ where: { id }, select: { role: true } });
  if (account?.role !== "ADMIN") throw new StaffRequestError("Administrator access changed.");
}

function audit(
  db: Prisma.TransactionClient, actor: Actor, action: string,
  targetId: string, details: Record<string, unknown>,
) {
  return db.adminAuditLog.create({
    data: {
      actorId: actor.id, actorEmail: actor.email, action, targetId,
      targetType: staffAuditTarget, details: JSON.stringify(details),
    },
  });
}

export async function requestStaffChange(actor: Actor, email: string, change: Change, reason: string, role: StaffRole) {
  return prisma.$transaction(async (db) => {
    await assertCurrentAdmin(db, actor.id);
    const target = await db.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (!target || target.role !== "USER") throw new StaffRequestError("Select an existing user account.");
    const grant = await db.siteSetting.findUnique({ where: { key: staffGrantKey(target.id, role) } });
    if (hasStaffGrant(grant?.value, role) === (change === "grant")) {
      throw new StaffRequestError("The account already has the requested access state.");
    }
    const request = {
      id: randomUUID(), targetId: target.id, change, reason, role,
      requesterId: actor.id, expectedGrant: grant?.value ?? null,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
    await db.siteSetting.create({
      data: { key: staffRequestPrefix + request.id, value: JSON.stringify(request) },
    });
    await audit(db, actor, "STAFF_ACCESS_REQUESTED", target.id, { requestId: request.id, change, reason, role });
  }, { isolationLevel: "Serializable" });
}

export async function decideStaffChange(actor: Actor, id: string, decision: Decision, reason: string) {
  return prisma.$transaction(async (db) => {
    await assertCurrentAdmin(db, actor.id);
    const row = await db.siteSetting.findUnique({ where: { key: staffRequestPrefix + id } });
    if (!row) throw new StaffRequestError("This request is no longer pending.");
    const request = JSON.parse(row.value) as {
      targetId: string; change: Change; requesterId: string;
      expectedGrant: string | null; expiresAt: number; role?: StaffRole;
    };
    const role = request.role ?? "AUDITOR";
    if (request.requesterId === actor.id) {
      throw new StaffRequestError("Another administrator must review this request.");
    }
    const claimed = await db.siteSetting.deleteMany({ where: { id: row.id, value: row.value } });
    if (claimed.count !== 1) throw new StaffRequestError("This request is no longer pending.");
    if (decision === "approve") {
      if (request.expiresAt <= Date.now()) throw new StaffRequestError("This request has expired.");
      await assertCurrentAdmin(db, request.requesterId);
      const target = await db.user.findUnique({ where: { id: request.targetId }, select: { role: true } });
      if (target?.role !== "USER") throw new StaffRequestError("The target account is no longer eligible.");
      const key = staffGrantKey(request.targetId, role);
      const grant = await db.siteSetting.findUnique({ where: { key } });
      if ((grant?.value ?? null) !== request.expectedGrant) {
        throw new StaffRequestError("Access changed since this request was submitted.");
      }
      const value = `${request.change === "grant" ? role : "REVOKED"}:${id}`;
      await db.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
    }
    await audit(db, actor, decision === "approve" ? "STAFF_ACCESS_APPROVED" : "STAFF_ACCESS_REJECTED",
      request.targetId, { requestId: id, change: request.change, reason, role });
  }, { isolationLevel: "Serializable" });
}
