import { parseAutomationEvent, type AutomationEvent } from "./automation-events";

export type SupportDisposition = "auto-reply" | "human-handoff";

export function buildSupportReplyEvent(input: {
  conversationId: string; messageVersion: string; correlationId: string; occurredAt: Date;
  disposition: SupportDisposition; safeReplyAvailable: boolean; authorizedAccount: boolean;
}): AutomationEvent | null {
  if (!input.authorizedAccount || !Number.isFinite(input.occurredAt.getTime())
    || (input.disposition !== "auto-reply" && input.disposition !== "human-handoff")
    || (input.disposition === "auto-reply" && !input.safeReplyAvailable)) return null;
  const type = input.disposition === "human-handoff" ? "support.handoff-requested" : "support.inbound-reply";
  return parseAutomationEvent({ schemaVersion: 1, type, producer: "support",
    entityId: input.conversationId, entityVersion: input.messageVersion, correlationId: input.correlationId,
    occurredAt: input.occurredAt.toISOString() });
}
