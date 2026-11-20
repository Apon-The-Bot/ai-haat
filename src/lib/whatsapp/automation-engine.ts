export type AutomationCategory = "authentication" | "utility" | "marketing" | "service";

export type AutomationControls = {
  enabled: boolean; dryRun: boolean; category: AutomationCategory;
  queueDepth: number; queueLimit: number; templateApproved: boolean;
};

export function evaluateAutomationControls(input: AutomationControls) {
  if (!input.enabled) return { allowed: false, reason: "disabled" } as const;
  if (input.dryRun) return { allowed: false, reason: "dry-run" } as const;
  if (!input.templateApproved) return { allowed: false, reason: "template-not-approved" } as const;
  if (!Number.isInteger(input.queueDepth) || !Number.isInteger(input.queueLimit)
    || input.queueDepth < 0 || input.queueLimit < 1 || input.queueDepth >= input.queueLimit) {
    return { allowed: false, reason: "queue-cap" } as const;
  }
  return { allowed: true, category: input.category } as const;
}
