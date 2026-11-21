import { createHmac } from "node:crypto";
import { authenticateEps, epsOrigins, invalidateEpsToken } from "./auth";

export type EpsInitialization = {
  storeId: string;
  merchantId: string;
  CustomerOrderId: string;
  transactionTypeId: string | number;
  totalAmount: number;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerPostcode: string;
  customerCountry: string;
  customerPhone: string;
  productName: string;
};

export function createEpsTransactions(env = process.env, request: typeof fetch = fetch) {
  async function call(operation: "InitializeEPS" | "CheckMerchantTransactionStatus", id: string, data?: EpsInitialization) {
    if (operation === "InitializeEPS" && env.EPS_PAYMENT_ENABLED !== "true") {
      throw new Error("EPS checkout is disabled.");
    }
    if (!/^\d{10,40}$/.test(id)) throw new Error("Invalid EPS merchant transaction ID.");
    const mode = env.EPS_MODE;
    if (mode !== "sandbox" && mode !== "live") throw new Error("Invalid EPS mode.");
    const key = env[mode === "sandbox" ? "EPS_SANDBOX_HASH_KEY" : "EPS_LIVE_HASH_KEY"];
    if (!key) throw new Error("EPS hash key is missing.");
    const token = await authenticateEps(env, request);
    const url = new URL(`/v1/EPSEngine/${operation}`, epsOrigins[mode]);
    if (!data) url.searchParams.set("merchantTransactionId", id);
    try {
      const response = await request(url, {
        method: data ? "POST" : "GET",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          "x-hash": createHmac("sha512", key).update(id).digest("base64"),
        },
        body: data ? JSON.stringify({ ...data, merchantTransactionId: id }) : undefined,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      });
      if (response.status === 401) invalidateEpsToken(mode, token, request);
      if (!response.ok) throw new Error();
      const body: unknown = await response.json();
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
      return body as Record<string, unknown>;
    } catch {
      throw new Error(`EPS ${operation} request failed.`);
    }
  }

  return {
    initialize: (id: string, data: EpsInitialization) => call("InitializeEPS", id, data),
    verify: (id: string) => call("CheckMerchantTransactionStatus", id),
  };
}
