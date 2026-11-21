import { randomInt } from "node:crypto";
import { createEpsTransactions } from "../src/lib/payments/eps/transactions";

async function checkStatus(client: ReturnType<typeof createEpsTransactions>, id: string) {
  const status = await client.verify(id);
  const keys = ["Status", "TransactionStatus", "TransactionId", "MerchantTransactionId", "TotalAmount", "ErrorCode"];
  console.log("EPS sandbox status response field types", keys.map((key) => `${key}=${typeof status[key]}`).join(", "));
  const providerStatus = typeof status.Status === "string" ? status.Status.trim() : "";
  const knownStates = ["success", "pending", "failed", "cancelled", "canceled", "expired", "initiated"];
  console.log("EPS sandbox status", knownStates.includes(providerStatus.toLowerCase()) ? providerStatus : "unrecognized");
}

async function main() {
  if (process.env.EPS_MODE !== "sandbox" || process.env.EPS_PAYMENT_ENABLED !== "true") {
    throw new Error("This smoke test requires explicitly enabled sandbox mode.");
  }
  const client = createEpsTransactions();
  const existing = process.env.EPS_SMOKE_MERCHANT_TRANSACTION_ID;
  if (existing) {
    if (!/^\d{10,40}$/.test(existing)) throw new Error("Invalid sandbox merchant transaction ID.");
    await checkStatus(client, existing);
    return;
  }
  const { EPS_SANDBOX_MERCHANT_ID: merchantId, EPS_SANDBOX_STORE_ID: storeId } = process.env;
  if (!merchantId || !storeId) throw new Error("Sandbox merchant and store settings are required.");
  const id = String(randomInt(10_000_000_000_000, 100_000_000_000_000));
  const callback = "https://example.com/eps-sandbox";
  const payment = {
    merchantId, storeId, CustomerOrderId: `Sandbox-${id}`, transactionTypeId: 1,
    totalAmount: 100, successUrl: callback, failUrl: callback, cancelUrl: callback,
    customerName: "Sandbox Customer", customerEmail: "sandbox@example.com",
    customerAddress: "Sandbox Test Address", customerCity: "Dhaka", customerState: "Dhaka",
    customerPostcode: "1205", customerCountry: "Bangladesh", customerPhone: "01700000000",
    productName: "Sandbox Test Product",
  };
  if (process.env.EPS_SMOKE_PERSIST === "true") {
    const database = new URL(process.env.DATABASE_URL ?? "");
    if (database.protocol !== "mysql:" || database.hostname !== "127.0.0.1" ||
        database.pathname !== "/aihaat_eps_schema_fixture") {
      throw new Error("Persistent sandbox checks require the isolated loopback EPS schema fixture.");
    }
    const { prisma } = await import("../src/lib/prisma");
    const { initializeEpsAttempt } = await import("../src/lib/payments/eps/initialize-attempt");
    const reference = `Sandbox-QA-${id}`;
    const userId = "eps-sandbox-smoke";
    try {
      const result = await initializeEpsAttempt({
        reference, userId, purpose: "ORDER", payment,
        returnUrl: (merchantId) => `https://example.com/eps-sandbox?merchantTransactionId=${merchantId}`,
      });
      const row = await prisma.epsPaymentAttempt.findUniqueOrThrow({
        where: { merchantTransactionId: result.merchantTransactionId },
      });
      if (row.state !== "PENDING" || !row.providerTransactionId || !row.amountBDT.equals(100) ||
          row.reference !== reference || row.userId !== userId) {
        throw new Error("EPS sandbox checkout persistence did not match the expected attempt.");
      }
      console.log("EPS initialized sandbox checkout and persisted its pending attempt in isolated MySQL.");
      await checkStatus(client, result.merchantTransactionId);
    } finally {
      try {
        await prisma.epsPaymentAttempt.deleteMany({ where: { reference, userId, mode: "sandbox" } });
      } finally {
        await prisma.$disconnect();
      }
    }
    return;
  }
  const result = await client.initialize(id, payment);
  if (!result.TransactionId || typeof result.RedirectURL !== "string" || !result.RedirectURL) {
    const code = /^\d{1,9}$/.test(String(result.ErrorCode)) ? String(result.ErrorCode) : "unavailable";
    const message = typeof result.ErrorMessage === "string" ? result.ErrorMessage.toLowerCase() : "";
    const categories = ["duplicate", "transaction", "merchant", "store", "amount", "hash", "domain", "url", "required", "invalid"]
      .filter((category) => new RegExp(`\\b${category}\\b`).test(message));
    throw new Error(`EPS did not initialize a sandbox checkout. Application error code: ${code}. Categories: ${categories.join(", ") || "unavailable"}.`);
  }
  const origin = new URL(result.RedirectURL).origin;
  if (!/^https:\/\/[a-z0-9.-]+\.eps\.com\.bd$/i.test(origin)) {
    throw new Error("EPS returned an unexpected sandbox checkout origin.");
  }
  console.log("EPS initialized a sandbox checkout at", origin);
  await checkStatus(client, id);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "EPS sandbox smoke test failed.");
  process.exitCode = 1;
});
