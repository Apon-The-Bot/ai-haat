"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Gift, Link2, Users } from "lucide-react";

type Summary = {
  referral?: { referralCode?: string; convertedOrdersCount?: number; totalEarnedBDT?: number };
  affiliate?: {
    profile?: { referralLink?: string };
    stats?: { clicks?: number; conversionsCount?: number; availableEarnings?: number; holdingBalance?: number };
  };
};

export default function EarnAndReferPage() {
  const [data, setData] = useState<Summary>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([fetch("/api/referrals/me", { cache: "no-store" }).then((r) => r.json()), fetch("/api/affiliate/profile", { cache: "no-store" }).then((r) => r.json())]).then(([referral, affiliate]) => setData({ referral, affiliate })).finally(() => setLoading(false));
  }, []);
  const referral = data.referral;
  const affiliate = data.affiliate;
  return <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6"><div className="mb-8 flex items-center gap-3"><Gift className="h-8 w-8 text-[#FC5C03]" /><div><h1 className="text-3xl font-black text-[#1A1D26]">Affiliate earnings</h1><p className="mt-1 text-sm text-slate-500">Your link, conversions, rewards and earnings in one place.</p></div></div>{loading ? <p className="text-sm text-slate-500">Loading earnings…</p> : <><div className="grid gap-4 sm:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2 text-[#FC5C03]"><Users className="h-5 w-5" /><h2 className="font-bold text-[#1A1D26]">Acquisition rewards</h2></div><p className="mt-4 text-3xl font-black text-[#1A1D26]">{referral?.convertedOrdersCount || 0}</p><p className="text-sm text-slate-500">qualifying customers</p><p className="mt-3 text-sm text-slate-600">Earned ৳{Number(referral?.totalEarnedBDT || 0).toLocaleString()}</p><Link href="/dashboard/affiliate" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#FC5C03]">Open affiliate dashboard <ArrowRight className="h-4 w-4" /></Link></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-2 text-[#FC5C03]"><Link2 className="h-5 w-5" /><h2 className="font-bold text-[#1A1D26]">Commission earnings</h2></div><p className="mt-4 text-3xl font-black text-[#1A1D26]">৳{Number(affiliate?.stats?.availableEarnings || 0).toLocaleString()}</p><p className="text-sm text-slate-500">available to withdraw</p><p className="mt-3 text-sm text-slate-600">{affiliate?.stats?.clicks || 0} clicks · {affiliate?.stats?.conversionsCount || 0} conversions</p><Link href="/dashboard/affiliate" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#FC5C03]">Open affiliate dashboard <ArrowRight className="h-4 w-4" /></Link></section></div><div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-[#1A1D26]">Your affiliate link</h2><div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center"><code className="min-w-0 flex-1 break-all rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">{affiliate?.profile?.referralLink || (referral?.referralCode ? `https://aihaat.shop?ref=${referral.referralCode}` : "Create your link from the affiliate dashboard")}</code><Link href="/dashboard/affiliate" className="rounded-xl bg-[#FC5C03] px-4 py-3 text-center text-sm font-bold text-white">Manage affiliate links</Link></div></div></>}</main>;
}
