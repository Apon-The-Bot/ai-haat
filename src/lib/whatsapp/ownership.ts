import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type Owner = { accountId: string; token: string };

export async function acquire(accountId: string, cron=false): Promise<Owner | null> {
  const token = randomUUID();
  const changed = await prisma.$executeRaw`
    UPDATE whatsapp_accounts SET leaseId=${token}, leaseEnds=DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 45 SECOND), state='Connecting'
    WHERE id=${accountId} AND (${cron}=0 OR state IN ('Ready','Connected','Connecting','Reconnecting'))
    AND (leaseEnds IS NULL OR leaseEnds <= UTC_TIMESTAMP(3))`;
  return changed === 1 ? { accountId, token } : null;
}

export async function renew(owner: Owner) {
  return (await prisma.$executeRaw`
    UPDATE whatsapp_accounts SET leaseEnds=DATE_ADD(UTC_TIMESTAMP(3), INTERVAL 45 SECOND)
    WHERE id=${owner.accountId} AND leaseId=${owner.token} AND leaseEnds > UTC_TIMESTAMP(3)`) === 1;
}

export function fenced<T>(owner: Owner, action: (tx: Prisma.TransactionClient) => Promise<T>) {
  return prisma.$transaction(async tx => {
    const rows = await tx.$queryRaw<{id:string}[]>`
      SELECT id FROM whatsapp_accounts WHERE id=${owner.accountId}
      AND leaseId=${owner.token} AND leaseEnds > UTC_TIMESTAMP(3) FOR UPDATE`;
    if (!rows.length) throw new Error("WhatsApp session ownership expired");
    return action(tx);
  });
}
