import Link from "next/link";
import { Metadata } from "next";
import { legalDocuments } from "@/lib/legal/documents";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = { title: "Legal Center | AI Haat", description: "AI Haat legal, delivery, refund, subscription and privacy documents.", alternates: { canonical: `${SITE_URL}/legal` } };

export default function LegalCenterPage() {
  return <main className="min-h-[75vh] bg-white py-10 sm:py-16"><div className="mx-auto w-[calc(100%-24px)] max-w-5xl space-y-8 md:w-[calc(100%-40px)]"><header><p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#FC5C03]">AI Haat Legal Center</p><h1 className="text-3xl font-black text-slate-900">আইনি নীতিমালা ও গ্রাহক তথ্য</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">প্রতিটি পণ্যের প্রকৃত ডেলিভারি, অ্যাক্সেস, লাইসেন্স, মেয়াদ ও প্রতিকার পণ্যের পেজে যাচাই করুন। নিচের নীতিমালাগুলো প্রকাশের আগে ব্যবসায়িক তথ্য ও আইনগত ভাষা অনুমোদন করা প্রয়োজন।</p></header><div className="grid gap-4 sm:grid-cols-2">{legalDocuments.map((document) => <Link key={document.slug} href={`/legal/${document.slug}`} className="rounded-2xl border border-slate-200 p-5 transition hover:border-[#FC5C03] hover:shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{document.category}</p><h2 className="mt-2 font-bold text-slate-900">{document.titleBn}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{document.summaryBn}</p><p className="mt-3 text-xs font-semibold text-[#FC5C03]">{document.classification}</p></Link>)}</div></div></main>;
}
