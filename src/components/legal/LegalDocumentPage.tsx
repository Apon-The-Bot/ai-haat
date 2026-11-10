import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import type { LegalDocument } from "@/lib/legal/documents";

export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  return <main className="min-h-[75vh] bg-white py-10 sm:py-16">
    <article className="mx-auto w-[calc(100%-24px)] max-w-4xl space-y-8 md:w-[calc(100%-40px)]">
      <Link href="/legal" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#FC5C03]"><ArrowLeft className="h-3.5 w-3.5" />আইনি কেন্দ্র</Link>
      <header className="border-b border-slate-200 pb-6">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FC5C03]"><FileText className="h-3.5 w-3.5" />{document.category}</div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{document.titleBn}</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">{document.titleEn} · Version 1.0 · Last reviewed: 10 November 2026</p>
        <p className="mt-4 text-sm leading-7 text-slate-600">{document.summaryBn}</p>
      </header>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900"><ShieldCheck className="mr-2 inline h-4 w-4" />প্রকাশের আগে ব্যবসার পরিচয়, প্রযোজ্য আইন, সরবরাহকারী-অনুমোদন ও অপারেশনাল সময়সীমা যাচাই করুন।</div>
      <div className="space-y-8 text-sm leading-7 text-slate-700">
        {document.sections.map((section) => <section key={section.heading} id={section.heading.replace(/\s+/g, "-")} className="scroll-mt-24"><h2 className="mb-2 text-lg font-bold text-slate-900">{section.heading}</h2>{section.body.map((paragraph) => <p key={paragraph} className="mb-3">{paragraph}</p>)}</section>)}
      </div>
      <footer className="border-t border-slate-200 pt-6 text-sm text-slate-600"><p>প্রশ্ন বা তথ্য-অধিকার অনুরোধ: <a className="font-semibold text-[#FC5C03]" href="mailto:support@aihaat.shop">support@aihaat.shop</a></p><p className="mt-2">এই পেজ আইনি পরামর্শ নয়; প্রকাশের আগে যোগ্য বাংলাদেশি আইনজীবীর পর্যালোচনা প্রয়োজন।</p></footer>
    </article>
  </main>;
}
