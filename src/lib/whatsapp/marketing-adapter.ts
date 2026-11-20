import { parseAutomationEvent, type AutomationEvent } from "./automation-events";

export function buildMarketingCampaignEvent(input: {
  campaignId: string; campaignVersion: string; correlationId: string; occurredAt: Date;
  eligibleRecipientCount: number; approved: boolean; templateReady: boolean;
}): AutomationEvent | null {
  if (!input.approved || !input.templateReady || input.eligibleRecipientCount <= 0
    || !Number.isInteger(input.eligibleRecipientCount) || !Number.isFinite(input.occurredAt.getTime())) return null;
  return parseAutomationEvent({ schemaVersion: 1, type: "marketing.campaign-ready", producer: "marketing",
    entityId: input.campaignId, entityVersion: input.campaignVersion, correlationId: input.correlationId,
    occurredAt: input.occurredAt.toISOString() });
}
