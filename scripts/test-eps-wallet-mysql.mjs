import assert from "node:assert/strict";
import { randomInt, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { Prisma, PrismaClient } from "@prisma/client";
import ts from "typescript";

const url = new URL(process.env.DATABASE_URL ?? "");
if (url.protocol !== "mysql:" || url.hostname !== "127.0.0.1" || url.pathname !== "/aihaat_eps_schema_fixture") {
  throw new Error("Use the dedicated EPS schema fixture on loopback.");
}

function fixtureModule(path, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const module = { exports: {} };
  const requireFixture = (name) => {
    if (!Object.hasOwn(dependencies, name)) throw new Error(`Unexpected fixture dependency: ${name}`);
    return dependencies[name];
  };
  new Function("require", "module", "exports", js)(requireFixture, module, module.exports);
  return module.exports;
}

const prisma = new PrismaClient({ datasourceUrl: url.href });
const email = `eps-${randomUUID()}@example.invalid`;
const mid = String(randomInt(10_000_000_000_000, 100_000_000_000_000));
const trxId = `EPS:sandbox:${mid}`;
let userId;
let orderId;
let orderReference;
let dispatches = 0;

try {
  const user = await prisma.user.create({ data: { email, name: "EPS wallet fixture", walletBalanceBDT: 10 } });
  userId = user.id;
  const attempt = await prisma.epsPaymentAttempt.create({ data: {
    merchantTransactionId: mid, reference: `WT-${randomUUID()}`, userId, purpose: "WALLET_TOPUP",
    mode: "sandbox", storeId: "fixture-store", amountBDT: new Prisma.Decimal("125.51"),
  } });
  const ledger = fixtureModule("../src/lib/commerce/wallet-topup.ts", {
    "@/lib/prisma": { prisma }, "@prisma/client": { Prisma },
    "@/lib/notifications": {
      NOTIFICATION_EVENTS: { WALLET_TOPUP_COMPLETED: "WALLET_TOPUP_COMPLETED" },
      dispatchNotificationEvent: async () => { dispatches++; },
    },
    "@/lib/wallet-db": { creditLocalWalletBalance: () => {}, recordLocalTransaction: () => {} },
  });
  const { finalizeEpsWallet } = fixtureModule("../src/lib/payments/eps/finalize-wallet.ts", {
    "@/lib/prisma": { prisma },
    "@/lib/commerce/wallet-topup": ledger,
    "./verify-attempt": { verifyEpsAttempt: async (id, owner) =>
      id === mid && owner === userId ? { attempt, providerId: `fixture-${mid}`, amountBDT: attempt.amountBDT } : null },
  });
  const results = await Promise.all([finalizeEpsWallet(mid, userId), finalizeEpsWallet(mid, userId)]);
  assert(results.some(Boolean));
  assert.equal(await finalizeEpsWallet(mid, userId), false);
  assert.equal((await prisma.user.findUniqueOrThrow({ where: { id: userId } })).walletBalanceBDT, 135.51);
  assert.equal(await prisma.walletTransaction.count({ where: { trxId, userId, status: "APPROVED" } }), 1);
  assert.equal((await prisma.epsPaymentAttempt.findUniqueOrThrow({ where: { merchantTransactionId: mid } })).state, "FINALIZED");
  assert.equal(dispatches, 1);
  console.log("Isolated MySQL EPS wallet finalization produced one credit, one ledger entry, and one dispatch.");

  orderReference = `EPS-QA-${randomUUID()}`;
  const order = await prisma.order.create({ data: {
    orderNumber: orderReference, userId, customerName: "EPS order fixture", customerEmail: email,
    customerPhone: "01700000000", subtotalBDT: 125.51, totalBDT: 125.51, paymentMethod: "gateway",
  } });
  orderId = order.id;
  const initEnv = {
    EPS_MODE: "sandbox", EPS_PAYMENT_ENABLED: "true", EPS_SANDBOX_USERNAME: "fixture",
    EPS_SANDBOX_PASSWORD: "fixture", EPS_SANDBOX_HASH_KEY: "fixture",
    EPS_SANDBOX_CHECKOUT_ORIGIN: "https://sandboxpg.eps.com.bd", NEXTAUTH_URL: "https://example.invalid",
  };
  const previousEnv = Object.fromEntries(Object.keys(initEnv).map((key) => [key, process.env[key]]));
  let initializations = 0;
  let initialized;
  try {
    Object.assign(process.env, initEnv);
    const { initializeEpsAttempt } = fixtureModule("../src/lib/payments/eps/initialize-attempt.ts", {
      "node:crypto": await import("node:crypto"), "@prisma/client": { Prisma }, "@/lib/prisma": { prisma },
      "./transactions": { createEpsTransactions: () => ({ initialize: async () => {
        initializations++;
        return { TransactionId: `fixture-init-${orderId}`, RedirectURL: "https://sandboxpg.eps.com.bd/checkout" };
      } }) },
    });
    const input = {
      reference: orderReference, userId, purpose: "ORDER", payment: { totalAmount: 125.51, storeId: "fixture-store" },
      returnUrl: (id) => `https://example.invalid/payment/eps/wallet?merchantTransactionId=${id}`,
    };
    const parallel = await Promise.allSettled([initializeEpsAttempt(input), initializeEpsAttempt(input)]);
    assert(parallel.some((result) => result.status === "fulfilled"));
    initialized = await initializeEpsAttempt(input);
    assert.equal(initializations, 1);
    const pending = await prisma.epsPaymentAttempt.findUniqueOrThrow({
      where: { merchantTransactionId: initialized.merchantTransactionId },
    });
    assert.equal(pending.state, "PENDING");
    assert.equal(pending.amountBDT.toString(), "125.51");
    assert.equal(pending.providerTransactionId, `fixture-init-${orderId}`);
    console.log("Isolated MySQL EPS initialization made one provider call and reused the pending checkout.");
  } finally {
    for (const [key, value] of Object.entries(previousEnv)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
  let fulfillments = 0;
  let orderNotifications = 0;
  let reusedSettlementId;
  const { finalizeEpsOrder } = fixtureModule("../src/lib/payments/eps/finalize-order.ts", {
    "@prisma/client": { Prisma }, "@/lib/prisma": { prisma },
    "@/lib/analytics/server": { trackServerPurchase: async () => {} },
    "@/lib/commerce/inventory": { tryAutoFulfillOrder: async () => { fulfillments++; } },
    "@/lib/commerce/affiliates": { processPaidOrderCommission: async () => {} },
    "@/lib/loyalty/coins": { awardCoinsForOrder: async () => {} },
    "@/lib/notifications": {
      NOTIFICATION_EVENTS: { PAYMENT_VERIFIED: "PAYMENT_VERIFIED" },
      dispatchNotificationEvent: async () => { orderNotifications++; },
    },
    "./verify-attempt": { verifyEpsAttempt: async (id, owner) => {
      const row = await prisma.epsPaymentAttempt.findFirst({ where: { merchantTransactionId: id, userId: owner } });
      return row ? {
        attempt: row,
        providerId: row.providerTransactionId ?? `fixture-${id}`,
        settlementId: reusedSettlementId ?? `settlement-${id}`,
        amountBDT: row.amountBDT,
      } : null;
    } },
  });
  async function createOrderAttempt() {
    return prisma.epsPaymentAttempt.create({ data: {
      merchantTransactionId: String(randomInt(10_000_000_000_000, 100_000_000_000_000)),
      reference: orderReference, userId, purpose: "ORDER",
      mode: "sandbox", storeId: "fixture-store", amountBDT: new Prisma.Decimal("125.51"),
    } });
  }
  const orderAttempt = initialized;
  const orderResults = await Promise.all([1, 2].map(() => finalizeEpsOrder(orderAttempt.merchantTransactionId, userId)));
  assert.equal(orderResults.filter(Boolean).length, 1);
  const settledAttempt = await prisma.epsPaymentAttempt.findUniqueOrThrow({
    where: { merchantTransactionId: orderAttempt.merchantTransactionId },
  });
  assert.equal(settledAttempt.settlementTransactionId, `settlement-${orderAttempt.merchantTransactionId}`);
  const settled = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  assert.equal(settled.paymentStatus, "VERIFIED");
  assert.equal(settled.paymentMethod, "EPS");
  assert.equal(await prisma.orderTimelineEvent.count({ where: { orderId, status: "PAYMENT_VERIFIED" } }), 1);
  const extraAttempt = await createOrderAttempt();
  reusedSettlementId = settledAttempt.settlementTransactionId;
  await assert.rejects(finalizeEpsOrder(extraAttempt.merchantTransactionId, userId), { code: "P2002" });
  assert.equal((await prisma.epsPaymentAttempt.findUniqueOrThrow({
    where: { merchantTransactionId: extraAttempt.merchantTransactionId },
  })).state, "INITIALIZING");
  reusedSettlementId = undefined;
  assert.equal(await finalizeEpsOrder(extraAttempt.merchantTransactionId, userId), false);
  assert.equal((await prisma.epsPaymentAttempt.findUniqueOrThrow({
    where: { merchantTransactionId: extraAttempt.merchantTransactionId },
  })).state, "REVIEW_REQUIRED");
  assert.equal((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).trxId, settled.trxId);
  assert.equal(fulfillments, 1);
  assert.equal(orderNotifications, 1);
  console.log("Isolated MySQL EPS order finalization produced one order transition and routed an extra payment to review.");
} finally {
  try {
    if (userId) {
      if (orderReference) await prisma.epsPaymentAttempt.deleteMany({ where: { reference: orderReference, userId } });
      if (orderId) await prisma.order.delete({ where: { id: orderId, userId } });
      await prisma.epsPaymentAttempt.deleteMany({ where: { merchantTransactionId: mid, userId } });
      await prisma.notification.deleteMany({ where: { userId } });
      await prisma.walletTransaction.deleteMany({ where: { userId, trxId } });
      await prisma.user.delete({ where: { id: userId, email } });
    }
  } finally {
    await prisma.$disconnect();
  }
}
