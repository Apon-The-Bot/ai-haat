export const queues = {
  fulfillment: { label: "Paid orders awaiting delivery", href: "/admin/orders?paymentStatus=VERIFIED" },
  payments: { label: "Pending payment verification", href: "/admin/orders" },
  refunds: { label: "Refunds awaiting review", href: "/admin/refunds" },
  replacements: { label: "Replacements awaiting review", href: "/admin/replacements" },
  support: { label: "Support awaiting reply", href: "/admin/support" },
  stock: { label: "Stock alerts", href: "/admin/inventory" },
  suppliers: { label: "Supplier sync alerts", href: "/admin/suppliers" },
} as const;

export type Queue = keyof typeof queues;
export type Assignment = "all" | "mine" | "unassigned";
export type QueueCounts = Record<Queue, number>;

export type QueueEntry = {
  id: string;
  reference: string;
  detail: string;
  status: string;
  since: string | null;
  assignment?: "mine" | "unassigned" | "assigned";
  href: string;
};

export const queueKeys = Object.keys(queues) as Queue[];

export function isQueue(value: unknown): value is Queue {
  return typeof value === "string" && Object.hasOwn(queues, value);
}
