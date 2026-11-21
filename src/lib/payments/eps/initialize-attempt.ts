import { createHash, randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createEpsTransactions, type EpsInitialization } from "./transactions";

type AttemptInput = {
  reference: string;
  userId: string;
  purpose: "ORDER" | "WALLET_TOPUP";
  payment: Omit<EpsInitialization, "CustomerOrderId" | "successUrl" | "failUrl" | "cancelUrl">;
  returnUrl: (merchantTransactionId: string) => string;
};

export async function initializeEpsAttempt(input: AttemptInput) {
  const mode = process.env.EPS_MODE;
  if (process.env.EPS_PAYMENT_ENABLED !== "true" || (mode !== "sandbox" && mode !== "live")) {
    throw new Error("EPS is unavailable.");
  }
  const prefix = mode === "sandbox" ? "EPS_SANDBOX" : "EPS_LIVE";
  for (const key of ["USERNAME", "PASSWORD", "HASH_KEY"]) {
    if (!process.env[`${prefix}_${key}`]?.trim()) throw new Error("EPS credentials are incomplete.");
  }
  const configuredOrigin = process.env[`${prefix}_CHECKOUT_ORIGIN`];
  const origin = configuredOrigin && new URL(configuredOrigin);
  if (!origin || origin.protocol !== "https:" || origin.origin !== configuredOrigin ||
      !origin.hostname.endsWith(".eps.com.bd") || origin.port) {
    throw new Error("EPS checkout origin is not configured.");
  }
  if (mode === "sandbox" ? origin.hostname !== "sandboxpg.eps.com.bd"
    : /(?:^|\.)(?:sandbox|test|staging)/i.test(origin.hostname)) {
    throw new Error("EPS checkout origin does not match the selected environment.");
  }
  const amount = new Prisma.Decimal(input.payment.totalAmount);
  if (!amount.isFinite() || !amount.isPositive() || amount.decimalPlaces() > 2 ||
      amount.greaterThan("99999999999999.99")) {
    throw new Error("Invalid EPS payment amount.");
  }
  const merchantTransactionId = String(randomInt(10_000_000_000_000, 100_000_000_000_000));
  const callback = new URL(input.returnUrl(merchantTransactionId));
  const appOrigin = new URL(process.env.NEXTAUTH_URL || "https://aihaat.shop").origin;
  const secureCallback = callback.protocol === "https:" ||
    (mode === "sandbox" && callback.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(callback.hostname));
  if (!secureCallback || callback.origin !== appOrigin || callback.username || callback.password) {
    throw new Error("EPS return URL is invalid.");
  }
  const initiationKey = createHash("sha256").update(JSON.stringify([
    input.purpose, input.reference, input.purpose === "WALLET_TOPUP" ? input.userId : null,
  ])).digest("hex");
  try {
    await prisma.epsPaymentAttempt.create({
      data: {
        merchantTransactionId,
        initiationKey,
        reference: input.reference,
        userId: input.userId,
        purpose: input.purpose,
        mode,
        storeId: input.payment.storeId,
        amountBDT: amount,
      },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2002") throw error;
    const existing = await prisma.epsPaymentAttempt.findUnique({ where: { initiationKey } });
    if (existing?.state === "PENDING" && existing.userId === input.userId &&
        existing.mode === mode && existing.storeId === input.payment.storeId &&
        existing.amountBDT.equals(amount) && existing.checkoutUrl) {
      const savedUrl = new URL(existing.checkoutUrl);
      if (savedUrl.origin === origin.origin && !savedUrl.username && !savedUrl.password) {
        return { merchantTransactionId: existing.merchantTransactionId, redirectUrl: savedUrl.href };
      }
    }
    throw new Error("An EPS payment attempt already exists for this reference.");
  }

  const result = await createEpsTransactions().initialize(merchantTransactionId, {
    ...input.payment,
    CustomerOrderId: input.reference,
    successUrl: callback.href,
    failUrl: callback.href,
    cancelUrl: callback.href,
  });
  const providerId = result.TransactionId;
  const rawRedirect = result.RedirectURL;
  const redirect = typeof rawRedirect === "string" && URL.canParse(rawRedirect) ? new URL(rawRedirect) : null;
  if (result.ErrorMessage || typeof providerId !== "string" || !providerId.trim() ||
      providerId.length > 191 || !redirect || redirect.origin !== origin.origin ||
      redirect.username || redirect.password) {
    const code = result.ErrorCode;
    const safeCode = (typeof code === "number" || typeof code === "string") && /^\d{1,9}$/.test(String(code))
      ? String(code) : "INVALID_RESPONSE";
    await prisma.epsPaymentAttempt.updateMany({
      where: { merchantTransactionId, state: "INITIALIZING" },
      data: { initializationCode: safeCode },
    });
    throw new Error("EPS did not return a valid checkout session.");
  }
  const saved = await prisma.epsPaymentAttempt.updateMany({
    where: { merchantTransactionId, state: "INITIALIZING" },
    data: { providerTransactionId: providerId, state: "PENDING", checkoutUrl: redirect.href },
  });
  if (!saved.count) throw new Error("EPS payment state changed during initialization.");
  return { merchantTransactionId, redirectUrl: redirect.href };
}
