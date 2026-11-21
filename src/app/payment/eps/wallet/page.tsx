import type { Metadata } from "next";
import { WalletPaymentStatus } from "./wallet-payment-status";

export const metadata: Metadata = {
  title: "EPS Payment | AI Haat",
  robots: { index: false, follow: false },
};

export default async function EpsWalletReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ merchantTransactionId?: string | string[] }>;
}) {
  const { merchantTransactionId: raw } = await searchParams;
  const merchantTransactionId = Array.isArray(raw)
    ? raw.every((value) => value === raw[0]) ? raw[0] : undefined
    : raw;
  return (
    <main className="mx-auto max-w-lg space-y-4 px-4 py-16">
      <h1 className="text-2xl font-semibold">EPS পেমেন্ট</h1>
      <WalletPaymentStatus key={merchantTransactionId} reference={merchantTransactionId} />
    </main>
  );
}
