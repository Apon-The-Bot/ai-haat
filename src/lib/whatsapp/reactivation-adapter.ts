import { parseAutomationEvent, type AutomationEvent } from "./automation-events";

export function buildReactivationEvent(input: {
  audienceId: string; audienceVersion: string; correlationId: string; occurredAt: Date;
  explicitlyConsented: boolean; templateApproved: boolean; withinFrequencyCap: boolean;
  eligibleRecipientCount: number;
}): AutomationEvent | null {
  if (!input.explicitlyConsented || !input.templateApproved || !input.withinFrequencyCap
    || input.eligibleRecipientCount <= 0 || !Number.isInteger(input.eligibleRecipientCount)
    || !Number.isFinite(input.occurredAt.getTime())) return null;
  return parseAutomationEvent({ schemaVersion: 1, type: "reactivation.campaign-ready", producer: "reactivation",
    entityId: input.audienceId, entityVersion: input.audienceVersion, correlationId: input.correlationId,
    occurredAt: input.occurredAt.toISOString() });
}
