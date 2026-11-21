import assert from "node:assert/strict";
import { randomInt, randomUUID } from "node:crypto";
import { Prisma, PrismaClient } from "@prisma/client";

async function main() {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (url.protocol !== "mysql:" || url.hostname !== "127.0.0.1" || url.pathname !== "/aihaat_eps_fixture") {
    throw new Error("EPS MySQL tests require the dedicated loopback fixture database.");
  }
  const db = new PrismaClient({ datasourceUrl: url.href });
  const reference = `EPS-QA-${randomUUID()}`;
  const base = {
    reference, userId: "fixture", purpose: "ORDER", mode: "sandbox",
    storeId: "fixture-store", amountBDT: new Prisma.Decimal("125.51"),
    initiationKey: reference,
  };
  const nextId = () => String(randomInt(10_000_000_000_000, 100_000_000_000_000));
  try {
    const outcomes = await Promise.allSettled([
      db.epsPaymentAttempt.create({ data: { ...base, merchantTransactionId: nextId() } }),
      db.epsPaymentAttempt.create({ data: { ...base, merchantTransactionId: nextId() } }),
    ]);
    const [saved] = outcomes.filter((item) => item.status === "fulfilled");
    const rejected = outcomes.filter((item) => item.status === "rejected");
    assert(saved && rejected.length === 1);
    assert.equal(rejected[0].reason.code, "P2002");
    assert(saved.value.amountBDT.equals(base.amountBDT));
    const stateUpdates = await Promise.all([1, 2].map(() => db.epsPaymentAttempt.updateMany({
      where: { merchantTransactionId: saved.value.merchantTransactionId, state: "INITIALIZING" },
      data: { state: "PENDING", providerTransactionId: reference },
    })));
    assert.equal(stateUpdates.reduce((total, item) => total + item.count, 0), 1);
    await assert.rejects(db.epsPaymentAttempt.create({
      data: { ...base, initiationKey: null, merchantTransactionId: nextId(), providerTransactionId: reference },
    }), { code: "P2002" });
    console.log("MySQL EPS decimal amount, unique keys, and concurrent state change passed.");
  } finally {
    try {
      await db.epsPaymentAttempt.deleteMany({ where: { reference, userId: "fixture" } });
    } finally {
      await db.$disconnect();
    }
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "EPS MySQL test failed.");
  process.exitCode = 1;
});
