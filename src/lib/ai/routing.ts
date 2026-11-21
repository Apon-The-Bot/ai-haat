import { getAiProvider, providerSupports } from "./providers";

export type AiTask = "PRODUCT_CONTENT" | "ARTICLE_CONTENT" | "SEO_AUDIT" | "METADATA" | "STRUCTURED_DATA";
export type AiRoute = { task: AiTask; providerId: string; modelId: string; fallback?: { providerId: string; modelId: string } | null; maxCostBDT?: number | null; maxOutputTokens?: number | null; allowExternalData?: boolean };
export type AiRouteDecision = { allowed: boolean; route: AiRoute | null; reason: string };

export function validateAiRoute(route: AiRoute): AiRouteDecision {
  const provider = getAiProvider(route.providerId);
  if (!provider) return { allowed: false, route: null, reason: "Unknown AI provider." };
  if (provider.status === "NOT_IMPLEMENTED" || provider.status === "TEMPORARILY_UNAVAILABLE") return { allowed: false, route: null, reason: `Provider is ${provider.status.toLowerCase().replaceAll("_", " ")}.` };
  if (!route.modelId.trim()) return { allowed: false, route: null, reason: "A verified model id is required." };
  if (!providerSupports(route.providerId, "TEXT")) return { allowed: false, route: null, reason: "Provider does not advertise text generation." };
  if (route.maxCostBDT != null && (!Number.isFinite(route.maxCostBDT) || route.maxCostBDT < 0)) return { allowed: false, route: null, reason: "Cost cap must be a non-negative finite amount." };
  if (route.maxOutputTokens != null && (!Number.isInteger(route.maxOutputTokens) || route.maxOutputTokens <= 0)) return { allowed: false, route: null, reason: "Output token limit must be a positive integer." };
  if (route.fallback && (!getAiProvider(route.fallback.providerId) || !route.fallback.modelId.trim())) return { allowed: false, route: null, reason: "Fallback provider and model must be configured." };
  return { allowed: true, route, reason: "Route is structurally valid; credentials and model availability still require runtime verification." };
}
