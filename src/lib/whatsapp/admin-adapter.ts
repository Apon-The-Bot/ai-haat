import { parseAutomationEvent, type AutomationEvent } from "./automation-events";

export function buildAdminMessageEvent(input: {
  requestId: string; approvalVersion: string; correlationId: string; occurredAt: Date;
  isSuperAdmin: boolean; messagingPrivilege: boolean; recipientAuthorized: boolean;
  previewApproved: boolean;
}): AutomationEvent | null {
  if (!input.isSuperAdmin || !input.messagingPrivilege || !input.recipientAuthorized
    || !input.previewApproved || !Number.isFinite(input.occurredAt.getTime())) return null;
  return parseAutomationEvent({ schemaVersion: 1, type: "admin.message-approved", producer: "admin",
    entityId: input.requestId, entityVersion: input.approvalVersion, correlationId: input.correlationId,
    occurredAt: input.occurredAt.toISOString() });
}
