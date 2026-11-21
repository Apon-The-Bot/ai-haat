import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { Prisma } from "@prisma/client";
import { createEpsTransactions } from "../src/lib/payments/eps/transactions";
import { authenticateEps, invalidateEpsToken } from "../src/lib/payments/eps/auth";
import { matchEpsVerification } from "../src/lib/payments/eps/verify-attempt";

async function main() {
  const id = "12345678901234567890";
  const env = {
    NODE_ENV: "test" as const,
    EPS_MODE: "sandbox",
    EPS_PAYMENT_ENABLED: "true",
    EPS_SANDBOX_USERNAME: "sandbox-fixture",
    EPS_SANDBOX_PASSWORD: "fixture-password",
    EPS_SANDBOX_HASH_KEY: "fixture-key",
  };
  const sample = {
    Status: "Success",
    MerchantTransactionId: id,
    TransactionId: "fixture-payment",
    TotalAmount: "125.50",
    Currency: "BDT",
    StoreId: "fixture-store",
  };
  let calls = 0;
  const gateway: typeof fetch = async (input, init) => {
    calls++;
    const url = new URL(String(input));
    const headers = new Headers(init?.headers);
    assert.equal(url.origin, "https://sandboxpgapi.eps.com.bd");
    assert.equal(init?.redirect, "error");
    const tokenRequest = url.pathname === "/v1/Auth/GetToken";
    const signedValue = tokenRequest ? env.EPS_SANDBOX_USERNAME : id;
    assert.equal(headers.get("x-hash"), createHmac("sha512", env.EPS_SANDBOX_HASH_KEY).update(signedValue).digest("base64"));
    if (tokenRequest) return Response.json({ token: "fixture-token" });
    assert.equal(init?.method, "GET");
    assert.equal(url.pathname, "/v1/EPSEngine/CheckMerchantTransactionStatus");
    assert.equal(url.searchParams.get("merchantTransactionId"), id);
    assert.equal(headers.get("authorization"), "Bearer fixture-token");
    return Response.json(sample);
  };
  const result = await createEpsTransactions(env, gateway).verify(id);
  const attempt = {
    merchantTransactionId: id, providerTransactionId: "fixture-payment", reference: "fixture-order",
    userId: "fixture-user", purpose: "ORDER", mode: "sandbox", storeId: "fixture-store",
    amountBDT: new Prisma.Decimal("125.50"), state: "PENDING", createdAt: new Date(), updatedAt: new Date(),
  };
  assert.equal(matchEpsVerification(attempt, result)?.providerId, "fixture-payment");
  assert.equal(matchEpsVerification(attempt, { ...result, TransactionId: undefined })?.providerId, "fixture-payment");
  assert.equal(matchEpsVerification(attempt, {
    ...result, TransactionId: undefined, EpsTransactionId: "fixture-settlement",
  })?.settlementId, "fixture-settlement");
  assert.equal(matchEpsVerification({ ...attempt, settlementTransactionId: "previous" }, {
    ...result, EpsTransactionId: "changed",
  }), null);
  assert.equal(matchEpsVerification(
    { ...attempt, providerTransactionId: null }, { ...result, TransactionId: undefined }
  ), null);
  for (const mismatch of [
    { Status: "Pending" }, { MerchantTransactionId: "other" }, { TotalAmount: "125.51" },
    { TransactionId: "other" }, { StoreId: "other" }, { Currency: "USD" }, { ErrorMessage: "failed" },
  ]) {
    assert.equal(matchEpsVerification(attempt, { ...result, ...mismatch }), null);
  }
  await assert.rejects(createEpsTransactions({ ...env, EPS_MODE: "live" }, gateway).verify(id));
  assert.equal(calls, 2);
  await createEpsTransactions({ ...env, EPS_PAYMENT_ENABLED: "false" }, gateway).verify(id);
  assert.equal(calls, 4);
  let authCalls = 0;
  const expiringToken: typeof fetch = async () => Response.json({
    token: `fixture-${++authCalls}`,
    expireDate: new Date(Date.now() + 60_000).toISOString(),
  });
  assert.equal(await authenticateEps(env, expiringToken), "fixture-1");
  assert.equal(await authenticateEps(env, expiringToken), "fixture-1");
  assert.equal(await authenticateEps(env, expiringToken, true), "fixture-2");
  invalidateEpsToken("sandbox", "fixture-2", expiringToken);
  assert.equal(await authenticateEps(env, expiringToken), "fixture-3");
  assert.equal(await authenticateEps({ ...env, EPS_SANDBOX_PASSWORD: "rotated-fixture" }, expiringToken), "fixture-4");
  console.log("EPS request and verification fixtures passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
