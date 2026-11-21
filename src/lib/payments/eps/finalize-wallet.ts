import { finalizeWalletTopup } from "@/lib/commerce/wallet-topup";
import { prisma } from "@/lib/prisma";
import { verifyEpsAttempt } from "./verify-attempt";

export async function finalizeEpsWallet(merchantTransactionId: string, userId: string) {
  const verified = await verifyEpsAttempt(merchantTransactionId, userId);
  if (!verified || verified.attempt.purpose !== "WALLET_TOPUP") return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user?.email) return false;

  // Bind the provider ID under its unique constraint before changing the wallet.
  const bound = await prisma.epsPaymentAttempt.updateMany({
    where: {
      merchantTransactionId,
      userId,
      state: { in: ["INITIALIZING", "PENDING"] },
      OR: [{ providerTransactionId: null }, { providerTransactionId: verified.providerId }],
      ...(verified.settlementId && {
        AND: [{ OR: [{ settlementTransactionId: null }, { settlementTransactionId: verified.settlementId }] }],
      }),
    },
    data: { providerTransactionId: verified.providerId, settlementTransactionId: verified.settlementId, state: "PENDING" },
  });
  if (!bound.count) return false;

  // Retrying after a crash uses the same ledger key and cannot credit twice.
  const outcome = await finalizeWalletTopup({
    userId,
    userEmail: user.email,
    userName: user.name,
    amountBDT: verified.amountBDT.toNumber(),
    trxId: `EPS:${verified.attempt.mode}:${merchantTransactionId}`,
    method: "eps",
  });
  if (!outcome.success) return false;

  await prisma.epsPaymentAttempt.updateMany({
    where: { merchantTransactionId, state: "PENDING", providerTransactionId: verified.providerId },
    data: { state: "FINALIZED", checkoutUrl: null },
  });
  return true;
}
