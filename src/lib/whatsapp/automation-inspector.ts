import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { describeAutomationEvent, parseAutomationEvent } from "./automation-events";

type EventStore = Pick<Prisma.TransactionClient, "whatsappAutomationEvent">;
const batchLimit = 20;
const leaseMilliseconds = 30_000;

// This worker only classifies persisted event envelopes. It has no transport,
// recipient lookup, or access to the legacy sending queue.
export async function inspectAutomationBatch(db: EventStore, clock = () => new Date()) {
  const store = db.whatsappAutomationEvent;
  const due = await store.findMany({
    where: { state: "Pending", availableAt: { lte: clock() } },
    orderBy: [{ availableAt: "asc" }, { id: "asc" }],
    take: batchLimit,
    select: { id: true, schemaVersion: true, type: true, producer: true,
      entityId: true, entityVersion: true, correlationId: true, occurredAt: true },
  });
  const counts = { inspected: 0, invalid: 0, skipped: 0 };
  for (const { id, occurredAt, ...candidate } of due) {
    const now = clock();
    const claimToken = randomUUID();
    const claim = await store.updateMany({
      where: { id, state: "Pending", availableAt: { lte: now } },
      data: { claimToken, availableAt: new Date(now.getTime() + leaseMilliseconds) },
    });
    if (!claim.count) {
      counts.skipped++;
      continue;
    }
    const event = parseAutomationEvent({ ...candidate, occurredAt: occurredAt.toISOString() });
    const valid = event !== null && describeAutomationEvent(event).dedupeKey === id
      && occurredAt.getTime() <= now.getTime();
    const inspectedAt = clock();
    const result = await store.updateMany({
      where: { id, state: "Pending", claimToken, availableAt: { gt: inspectedAt } },
      data: { state: valid ? "Inspected" : "Invalid", inspectedAt, claimToken: null },
    });
    if (!result.count) counts.skipped++;
    else if (valid) counts.inspected++;
    else counts.invalid++;
  }
  return counts;
}
