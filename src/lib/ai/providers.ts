export type AiProviderStatus = "FULLY_OPERATIONAL" | "COMPATIBLE_ADAPTER" | "CONFIG_REQUIRED" | "NOT_IMPLEMENTED" | "TEMPORARILY_UNAVAILABLE";
export type AiCapability = "TEXT" | "JSON" | "STREAMING" | "VISION" | "TOOLS" | "EMBEDDINGS" | "WEB_GROUNDING";

export type AiProviderDefinition = {
  id: string;
  name: string;
  kind: "DIRECT" | "ROUTER" | "CLOUD" | "SELF_HOSTED";
  protocol: "NATIVE" | "OPENAI_COMPATIBLE" | "CLOUD_SPECIFIC";
  status: AiProviderStatus;
  capabilities: AiCapability[];
  requiresCredentials: boolean;
};

const definitions: AiProviderDefinition[] = [
  { id: "openai", name: "OpenAI", kind: "DIRECT", protocol: "NATIVE", status: "CONFIG_REQUIRED", capabilities: ["TEXT", "JSON", "STREAMING", "VISION", "TOOLS", "EMBEDDINGS"], requiresCredentials: true },
  { id: "google-gemini", name: "Google Gemini", kind: "DIRECT", protocol: "NATIVE", status: "CONFIG_REQUIRED", capabilities: ["TEXT", "JSON", "STREAMING", "VISION", "TOOLS"], requiresCredentials: true },
  { id: "xai", name: "xAI", kind: "DIRECT", protocol: "OPENAI_COMPATIBLE", status: "CONFIG_REQUIRED", capabilities: ["TEXT", "TOOLS"], requiresCredentials: true },
  { id: "groq", name: "Groq", kind: "DIRECT", protocol: "OPENAI_COMPATIBLE", status: "CONFIG_REQUIRED", capabilities: ["TEXT", "JSON", "TOOLS"], requiresCredentials: true },
  { id: "anthropic", name: "Anthropic Claude", kind: "DIRECT", protocol: "NATIVE", status: "CONFIG_REQUIRED", capabilities: ["TEXT", "JSON", "TOOLS", "VISION"], requiresCredentials: true },
  { id: "openrouter", name: "OpenRouter", kind: "ROUTER", protocol: "OPENAI_COMPATIBLE", status: "CONFIG_REQUIRED", capabilities: ["TEXT", "JSON", "STREAMING", "VISION", "TOOLS"], requiresCredentials: true },
  { id: "custom-openai-compatible", name: "Custom OpenAI-compatible endpoint", kind: "SELF_HOSTED", protocol: "OPENAI_COMPATIBLE", status: "NOT_IMPLEMENTED", capabilities: ["TEXT"], requiresCredentials: true },
];

export function listAiProviders(): AiProviderDefinition[] { return definitions.map((provider) => ({ ...provider, capabilities: [...provider.capabilities] })); }
export function getAiProvider(providerId: string): AiProviderDefinition | null { return definitions.find((provider) => provider.id === providerId) || null; }
export function providerSupports(providerId: string, capability: AiCapability): boolean { return getAiProvider(providerId)?.capabilities.includes(capability) === true; }
