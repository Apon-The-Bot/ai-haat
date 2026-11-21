const forbiddenCommercialFields = ["price", "discount", "stock", "cost", "supplier", "warranty", "rating", "reviewCount", "duration"];

export type AiContentPatch = Record<string, unknown>;
export type AiContentValidation = { valid: boolean; safePatch: AiContentPatch; blockedFields: string[]; warnings: string[] };

function stripHtml(value: string): string { return value.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/on[a-z]+\s*=\s*(['\"]).*?\1/gi, ""); }

export function validateAiContentPatch(patch: AiContentPatch, allowedFields: string[]): AiContentValidation {
  const safePatch: AiContentPatch = {};
  const blockedFields: string[] = [];
  const warnings: string[] = [];
  for (const [field, rawValue] of Object.entries(patch)) {
    if (!allowedFields.includes(field) || forbiddenCommercialFields.includes(field)) { blockedFields.push(field); continue; }
    if (typeof rawValue !== "string") { warnings.push(`${field} was ignored because generated content must be text.`); continue; }
    safePatch[field] = stripHtml(rawValue).trim();
  }
  return { valid: blockedFields.length === 0, safePatch, blockedFields, warnings };
}
