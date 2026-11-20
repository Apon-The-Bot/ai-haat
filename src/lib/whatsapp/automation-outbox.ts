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
