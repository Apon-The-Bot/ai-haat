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
  const defaultOrigin = mode === "sandbox" ? "https://sandboxpg.eps.com.bd" : "https://pg.eps.com.bd";
  let rawOrigin = (process.env[`${prefix}_CHECKOUT_ORIGIN`] || "").trim() || defaultOrigin;
  if (!rawOrigin.startsWith("http://") && !rawOrigin.startsWith("https://")) {
    rawOrigin = `https://${rawOrigin}`;
  }
  let origin: URL | null = null;
  try {
    origin = new URL(rawOrigin);
  } catch {
    origin = new URL(defaultOrigin);
  }
  const isEpsHost = origin.hostname === "eps.com.bd" || origin.hostname.endsWith(".eps.com.bd");
  if (!origin || origin.protocol !== "https:" || !isEpsHost || origin.port) {
    origin = new URL(defaultOrigin);
  }
  const cleanOrigin = origin.origin;
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
  let rawAppUrl = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://aihaat.shop").trim();
  if (!rawAppUrl.startsWith("http://") && !rawAppUrl.startsWith("https://")) {
    rawAppUrl = `https://${rawAppUrl}`;
  }
  let appOrigin = "https://aihaat.shop";
  try {
    appOrigin = new URL(rawAppUrl).origin;
  } catch {
    appOrigin = "https://aihaat.shop";
  }

  let callback: URL;
  try {
    callback = new URL(input.returnUrl(merchantTransactionId));
  } catch {
    callback = new URL(`/payment/eps/wallet?merchantTransactionId=${merchantTransactionId}`, appOrigin);
  }

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
      const isSavedEps = savedUrl.hostname === "eps.com.bd" || savedUrl.hostname.endsWith(".eps.com.bd");
      if ((savedUrl.origin === cleanOrigin || isSavedEps) && !savedUrl.username && !savedUrl.password) {
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
  const isRedirectEps = redirect && (redirect.hostname === "eps.com.bd" || redirect.hostname.endsWith(".eps.com.bd"));
  if (result.ErrorMessage || typeof providerId !== "string" || !providerId.trim() ||
      providerId.length > 191 || !redirect || (redirect.origin !== cleanOrigin && !isRedirectEps) ||
      redirect.username || redirect.password) {
    const code = result.ErrorCode;
    const safeCode = (typeof code === "number" || typeof code === "string") && /^\d{1,9}$/.test(String(code))
      ? String(code) : "INVALID_RESPONSE";
    await prisma.epsPaymentAttempt.updateMany({
      where: { merchantTransactionId, state: "INITIALIZING" },
      data: { initializationCode: safeCode },
    });
    const errMsg = result.ErrorMessage ? `EPS: ${result.ErrorMessage}` : "EPS did not return a valid checkout session.";
    throw new Error(errMsg);
  }
  const saved = await prisma.epsPaymentAttempt.updateMany({
    where: { merchantTransactionId, state: "INITIALIZING" },
    data: { providerTransactionId: providerId, state: "PENDING", checkoutUrl: redirect.href },
  });
  if (!saved.count) throw new Error("EPS payment state changed during initialization.");
  return { merchantTransactionId, redirectUrl: redirect.href };
}
