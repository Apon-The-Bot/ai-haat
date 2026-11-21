import { createHash, createHmac } from "node:crypto";

export const epsOrigins = {
  sandbox: "https://sandboxpgapi.eps.com.bd",
  live: "https://pgapi.eps.com.bd",
} as const;

type Mode = keyof typeof epsOrigins;
type TokenEntry = { fingerprint: string; token: string; expiresAt: number };
const tokens = new WeakMap<typeof fetch, Partial<Record<Mode, TokenEntry>>>();

export function invalidateEpsToken(mode: Mode, token: string, request: typeof fetch) {
  const cached = tokens.get(request);
  if (cached?.[mode]?.token === token) delete cached[mode];
}

export async function authenticateEps(
  env: NodeJS.ProcessEnv = process.env,
  request: typeof fetch = fetch,
  forceRefresh = false
): Promise<string> {
  const mode = env.EPS_MODE;
  if (mode !== "sandbox" && mode !== "live") {
    throw new Error("EPS authentication has no valid mode.");
  }
  const prefix = mode === "sandbox" ? "EPS_SANDBOX" : "EPS_LIVE";
  const userName = env[`${prefix}_USERNAME`];
  const password = env[`${prefix}_PASSWORD`];
  const key = env[`${prefix}_HASH_KEY`];
  if (!userName?.trim() || !password?.trim() || !key?.trim()) {
    throw new Error("EPS credentials are incomplete for the selected mode.");
  }
  const fingerprint = createHash("sha256").update(JSON.stringify([userName, password, key])).digest("hex");
  const entries = tokens.get(request) ?? {};
  tokens.set(request, entries);
  const cached = entries[mode];
  if (!forceRefresh && cached?.fingerprint === fingerprint && cached.expiresAt > Date.now() + 30_000) {
    return cached.token;
  }
  try {
    const response = await request(`${epsOrigins[mode]}/v1/Auth/GetToken`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-hash": createHmac("sha512", Buffer.from(key, "utf8")).update(userName, "utf8").digest("base64"),
      },
      body: JSON.stringify({ userName, password }),
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error();
    const result = await response.json();
    if (!result || typeof result.token !== "string" || !result.token.trim() || result.errorMessage) {
      throw new Error();
    }
    const expiry = result.expireDate;
    if (typeof expiry === "string" && /^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(expiry)) {
      const expiresAt = Math.min(Date.parse(expiry), Date.now() + 15 * 60_000);
      if (expiresAt > Date.now() + 30_000) entries[mode] = { fingerprint, token: result.token, expiresAt };
    }
    return result.token;
  } catch {
    throw new Error("EPS token request failed.");
  }
}
