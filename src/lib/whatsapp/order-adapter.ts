import { parseAutomationEvent, type AutomationEvent } from "./automation-events";

export function buildOrderDeliveredEvent(input: {
  orderId: string; deliveredAt: Date; correlationId: string;
  paymentVerified: boolean; allItemsDelivered: boolean;
}): AutomationEvent | null {
  const timestamp = input.deliveredAt.getTime();
  if (!input.paymentVerified || !input.allItemsDelivered || !Number.isFinite(timestamp)) return null;
  return parseAutomationEvent({ schemaVersion: 1, type: "order.delivered", producer: "fulfillment",
    entityId: input.orderId, entityVersion: `delivery-${timestamp}`, correlationId: input.correlationId,
    occurredAt: input.deliveredAt.toISOString() });
}
