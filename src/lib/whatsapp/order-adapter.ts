import { parseAutomationEvent, type AutomationEvent } from "./automation-events";

export function buildOrderDeliveredEvent(input: {
  orderId: string; deliveryVersion: string; correlationId: string; occurredAt: Date;
  paymentVerified: boolean; allItemsDelivered: boolean;
}): AutomationEvent | null {
  if (!input.paymentVerified || !input.allItemsDelivered || !Number.isFinite(input.occurredAt.getTime())) return null;
  return parseAutomationEvent({ schemaVersion: 1, type: "order.delivered", producer: "fulfillment",
    entityId: input.orderId, entityVersion: input.deliveryVersion, correlationId: input.correlationId,
    occurredAt: input.occurredAt.toISOString() });
}
