import { Prisma, type EpsPaymentAttempt } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createEpsTransactions } from "./transactions";

type VerificationTarget = Pick<EpsPaymentAttempt, "merchantTransactionId" | "providerTransactionId" | "storeId" | "amountBDT">
  & Partial<Pick<EpsPaymentAttempt, "settlementTransactionId">>;

export function matchEpsVerification(attempt: VerificationTarget, result: Record<string, unknown>) {
  if (result.ErrorMessage || result.errorMessage || result.Status !== "Success") return null;
  if (result.MerchantTransactionId !== attempt.merchantTransactionId) return null;
  if (result.StoreId !== undefined && result.StoreId !== attempt.storeId) return null;
  if (result.Currency !== undefined && result.Currency !== "BDT") return null;
  // The sandbox status response can omit TransactionId. Use the ID already
  // bound during initialization, while rejecting conflicting provider IDs.
  const providerId = result.TransactionId ?? attempt.providerTransactionId;
  const settlementId = result.EpsTransactionId ?? attempt.settlementTransactionId ?? null;
  const validId = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0 && value.length <= 191;
  if (providerId != null && !validId(providerId)) return null;
  if (settlementId != null && !validId(settlementId)) return null;
  if (!providerId && !settlementId) return null;
  if (attempt.providerTransactionId && providerId !== attempt.providerTransactionId) return null;
  if (attempt.settlementTransactionId && settlementId !== attempt.settlementTransactionId) return null;
  const amount = result.TotalAmount;
  if ((typeof amount !== "number" && typeof amount !== "string") ||
      !/^\d{1,14}(\.\d{1,2})?$/.test(String(amount)) ||
      !attempt.amountBDT.equals(new Prisma.Decimal(amount))) return null;

  return { providerId: providerId ?? null, settlementId, amountBDT: attempt.amountBDT };
}

export async function verifyEpsAttempt(merchantTransactionId: string, userId: string) {
  if (!/^\d{10,40}$/.test(merchantTransactionId)) return null;
  const attempt = await prisma.epsPaymentAttempt.findUnique({ where: { merchantTransactionId } });
  if (!attempt || attempt.userId !== userId || attempt.mode !== process.env.EPS_MODE ||
      !["INITIALIZING", "PENDING"].includes(attempt.state)) return null;
  const result = await createEpsTransactions().verify(merchantTransactionId);
  const verified = matchEpsVerification(attempt, result);
  return verified ? { attempt, ...verified } : null;
}
