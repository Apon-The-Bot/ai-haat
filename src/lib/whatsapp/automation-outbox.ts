import type { Prisma } from "@prisma/client";
import { describeAutomationEvent, parseAutomationEvent } from "./automation-events";

type EventStore = Pick<Prisma.TransactionClient, "whatsappAutomationEvent">;

// The lifecycle producer supplies its existing transaction. This function
// persists intent only and never inserts into the legacy sending queue.
export async function recordAutomationEvent(tx: EventStore, input: unknown) {
  const event = parseAutomationEvent(input);
  if (!event) return { recorded: false, reason: "invalid-event" } as const;
  const { dedupeKey } = describeAutomationEvent(event);
  const result = await tx.whatsappAutomationEvent.createMany({
    data: { ...event, id: dedupeKey, occurredAt: new Date(event.occurredAt) },
    skipDuplicates: true,
  });
  return { recorded: true, inserted: result.count === 1, eventId: dedupeKey } as const;
}

export async function recordBuiltAutomationEvent(
  tx: EventStore,
  build: () => unknown,
) {
  // Domain callers build from their authoritative post-mutation state inside
  // the same transaction. A null result is an intentional no-op.
  const input = build();
  if (input === null) return { recorded: false, reason: "not-eligible" } as const;
  return recordAutomationEvent(tx, input);
}
