import { parseAutomationEvent, type AutomationEvent } from "./automation-events";

export function buildReviewRequestEvent(input: {
  orderId: string; fulfillmentVersion: string; correlationId: string; occurredAt: Date;
  fulfilled: boolean; eligibleRecipientCount: number; withinReviewWindow: boolean;
}): AutomationEvent | null {
  if (!input.fulfilled || !input.withinReviewWindow || input.eligibleRecipientCount <= 0
    || !Number.isInteger(input.eligibleRecipientCount) || !Number.isFinite(input.occurredAt.getTime())) return null;
  return parseAutomationEvent({ schemaVersion: 1, type: "review.request-ready", producer: "reviews",
    entityId: input.orderId, entityVersion: input.fulfillmentVersion, correlationId: input.correlationId,
    occurredAt: input.occurredAt.toISOString() });
}
