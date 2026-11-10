import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { getGiftByClaimToken } from "@/lib/gifting/product-gifting";
import { GiftClaimClient, GiftClaimData } from "./GiftClaimClient";

export const metadata: Metadata = {
  title: "ডিজিটাল উপহার | AI Haat",
  robots: { index: false, follow: false },
};

export default async function GiftClaimPage({ params }: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token) notFound();
  const auth = await requireAuth();
  if (auth instanceof NextResponse) {
    if (auth.status !== 401) notFound();
    const callback = `/gift/${encodeURIComponent(token)}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callback)}`);
  }
  const gift = await getGiftByClaimToken(token, auth.user.email);
  if (!gift) notFound();
  return <GiftClaimClient initialGift={gift as GiftClaimData} token={token} />;
}
