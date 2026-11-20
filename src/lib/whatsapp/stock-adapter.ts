import { parseAutomationEvent, type AutomationEvent } from "./automation-events";

export function buildBackInStockEvent(input: {
  productId: string; inventoryVersion: string; correlationId: string; occurredAt: Date;
  available: boolean; optedInRecipientCount: number;
}): AutomationEvent | null {
  if (!input.available || input.optedInRecipientCount <= 0
    || !Number.isInteger(input.optedInRecipientCount) || !Number.isFinite(input.occurredAt.getTime())) return null;
  return parseAutomationEvent({ schemaVersion: 1, type: "stock.back-in-stock", producer: "inventory",
    entityId: input.productId, entityVersion: input.inventoryVersion, correlationId: input.correlationId,
    occurredAt: input.occurredAt.toISOString() });
}
