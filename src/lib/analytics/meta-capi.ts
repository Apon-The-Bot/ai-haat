import { graphVersions, readMetaToken, type MetaSettings } from "./meta-settings";
import type { MetaCapiEvent } from "./types";

export async function sendCapiEvent(settings: MetaSettings, event: MetaCapiEvent, testCode?: string) {
  if (!/^\d{5,25}$/.test(settings.pixelId) || !graphVersions.some((version) => version === settings.graphVersion)) {
    return { accepted: false, retryable: false, reason: "invalid_configuration" };
  }
  let token: string;
  try {
    token = readMetaToken(settings);
  } catch {
    return { accepted: false, retryable: false, reason: "token_decryption_failed" };
  }
  if (!token) return { accepted: false, retryable: false, reason: "missing_token" };
  try {
    const response = await fetch(`https://graph.facebook.com/${settings.graphVersion}/${settings.pixelId}/events`, {
      method: "POST",
      redirect: "error",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event], access_token: token, ...(testCode ? { test_event_code: testCode } : {}) }),
      signal: AbortSignal.timeout(4000),
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result?.events_received === 1 && !result?.error) {
      return { accepted: true, retryable: false, reason: "accepted" };
    }
    const code = Number.isInteger(result?.error?.code) ? `_${result.error.code}` : "";
    const retryable = response.status === 429 || response.status >= 500 || result?.error?.is_transient === true;
    return { accepted: false, retryable, reason: `provider_${response.status}${code}` };
  } catch {
    return { accepted: false, retryable: true, reason: "network_or_timeout" };
  }
}
