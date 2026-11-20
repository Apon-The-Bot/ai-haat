import { createHash } from "node:crypto";

const rules = {
  "order.confirmed": { producer: "orders", template: "order-confirmed" },
  "order.delivered": { producer: "fulfillment", template: "order-delivered" },
  "payment.settled": { producer: "payments", template: "payment-settled" },
  "subscription.expiry-reminder": { producer: "subscriptions", template: "subscription-expiry-reminder" },
  "marketing.campaign-ready": { producer: "marketing", template: "marketing-campaign" },
  "stock.back-in-stock": { producer: "inventory", template: "stock-back-in-stock" },
  "review.request-ready": { producer: "reviews", template: "review-request" },
  "reactivation.campaign-ready": { producer: "reactivation", template: "reactivation-campaign" },
  "support.inbound-reply": { producer: "support", template: "support-auto-reply" },
  "admin.message-approved": { producer: "admin", template: "admin-message" },
} as const;

type EventType = keyof typeof rules;
type Envelope = {
  schemaVersion: 1;
  entityId: string;
  entityVersion: string;
  correlationId: string;
  occurredAt: string;
};

export type AutomationEvent = {
  [T in EventType]: Envelope & { type: T; producer: (typeof rules)[T]["producer"] };
}[EventType];

const fields = ["schemaVersion", "type", "producer", "entityId", "entityVersion", "correlationId", "occurredAt"];
const identifier = /^[A-Za-z0-9_-]{1,64}$/;
const utcInstant = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export function parseAutomationEvent(input: unknown): AutomationEvent | null {
  if (!input || typeof input !== "object") return null;
  const event = input as Record<string, unknown>;
  const keys = Object.keys(event);
  if (keys.length !== fields.length || !fields.every((key) => Object.hasOwn(event, key))) return null;
  if (event.schemaVersion !== 1 || typeof event.type !== "string" || !Object.hasOwn(rules, event.type)) return null;
  const rule = rules[event.type as EventType];
  if (event.producer !== rule.producer) return null;
  for (const key of ["entityId", "entityVersion", "correlationId"] as const) {
    const value = event[key];
    if (typeof value !== "string" || !identifier.test(value)) return null;
  }
  if (typeof event.occurredAt !== "string" || !utcInstant.test(event.occurredAt)) return null;
  const occurredAt = new Date(event.occurredAt);
  if (!Number.isFinite(occurredAt.getTime()) || occurredAt.toISOString() !== event.occurredAt) return null;
  return { ...event } as AutomationEvent;
}

export function describeAutomationEvent(event: AutomationEvent) {
  // Stable across retries whose correlation ID and observation time differ.
  const dedupeKey = createHash("sha256")
    .update(JSON.stringify([event.schemaVersion, event.type, event.entityId, event.entityVersion]))
    .digest("hex");
  return {
    dedupeKey,
    templateKey: rules[event.type].template,
    category: "utility",
    disposition: "dry-run",
  } as const;
}
