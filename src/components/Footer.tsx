"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Facebook, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PaymentLogo } from "@/components/PaymentLogo";
import { useToast } from "@/context/ToastContext";

const serviceLinks = [
  ["ডিজিটাল ওয়ালেট (Wallet)", "/wallet"],
  ["কাস্টম প্রোডাক্ট রিকোয়েস্ট", "/product-request"],
  ["অর্ডার ট্র্যাকিং ও ডেলিভারি", "/order-tracking"],
  ["কাস্টমার ডেলিভারি প্রুফ", "/proofs"],
  ["ব্লগ ও টিউটোরিয়াল (Blog)", "/blog"],
] as const;

const companyLinks = [
  ["আমাদের সম্পর্কে (About Us)", "/about"],
  ["প্রাইভেসি পলিসি", "/privacy"],
  ["শর্তাবলী (Terms & Conditions)", "/terms"],
  ["লিগ্যাল সেন্টার (Legal Center)", "/legal"],
  ["২৪/৭ হেল্প ও সাপোর্ট", "/dashboard/support"],
] as const;

const acceptedPayments = ["bkash", "nagad", "rocket"] as const;

function FooterLinks({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <nav aria-label={title} className="space-y-2.5">
      <h2 className="border-l-2 border-[#FC5C03] pl-2 text-[11px] font-bold uppercase tracking-wider text-white">{title}</h2>
      <ul className="space-y-1.5 text-xs text-gray-400">
        {links.map(([label, href]) => <li key={href}><Link href={href} className="inline-flex min-h-6 items-center transition-colors hover:text-[#FC5C03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FC5C03] focus-visible:ring-offset-2 focus-visible:ring-offset-[#15171E]">{label}</Link></li>)}
      </ul>
    </nav>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (email.trim()) {
      showToast("নিউজলেটার সাবস্ক্রিপশন সম্পন্ন হয়েছে!", "success");
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-gray-800 bg-[#15171E] text-gray-300" aria-label="Site footer">
      <div className="mx-auto w-[calc(100%-32px)] max-w-[1500px] md:w-[calc(100%-64px)]">
        <div className="grid grid-cols-1 gap-7 py-8 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.35fr] lg:gap-8 lg:py-9">
          <section className="space-y-3" aria-labelledby="footer-brand-heading">
            <h2 id="footer-brand-heading" className="sr-only">AI Haat contact information</h2>
            <Logo variant="light" size="md" showSubtitle={true} />
            <p className="max-w-sm text-xs leading-5 text-gray-400">এআই হাটের ডিজিটাল সাবস্ক্রিপশন ও সফটওয়্যার মার্কেটপ্লেস। ডেলিভারি, অ্যাক্সেস ও প্রতিকার পণ্যের নিজস্ব বিবরণ ও প্রযোজ্য নীতিমালা অনুযায়ী।</p>
            <div className="space-y-1.5 text-xs text-gray-300">
              <a href="tel:+8801712345678" className="flex min-h-6 items-center gap-2 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FC5C03]"><Phone className="h-3.5 w-3.5 shrink-0 text-[#FC5C03]" />+880 1712-345678 (WhatsApp Support)</a>
              <a href="mailto:support@aihaat.shop" className="flex min-h-6 items-center gap-2 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FC5C03]"><Mail className="h-3.5 w-3.5 shrink-0 text-[#FC5C03]" />support@aihaat.shop</a>
              <span className="flex min-h-6 items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0 text-[#FC5C03]" />ঢাকা, বাংলাদেশ</span>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook Page" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-300 transition-colors hover:bg-[#FC5C03] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FC5C03]"><Facebook className="h-4 w-4" /></a>
              <a href="https://wa.me/8801712345678" target="_blank" rel="noreferrer" aria-label="WhatsApp Support" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-300 transition-colors hover:bg-[#25D366] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"><MessageCircle className="h-4 w-4" /></a>
              <a href="mailto:support@aihaat.shop" aria-label="Email Us" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-300 transition-colors hover:bg-[#FE7113] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FC5C03]"><Mail className="h-4 w-4" /></a>
            </div>
          </section>

          <FooterLinks title="সার্ভিস ও ফিচার" links={serviceLinks} />
          <FooterLinks title="কোম্পানি ও পলিসি" links={companyLinks} />

          <section className="space-y-3" aria-labelledby="footer-newsletter-heading">
            <div>
              <h2 id="footer-newsletter-heading" className="border-l-2 border-[#FC5C03] pl-2 text-[11px] font-bold uppercase tracking-wider text-white">অফার ও ডিসকাউন্ট আপডেট</h2>
              <p className="mt-2 text-xs leading-5 text-gray-400">নতুন সফটওয়্যার ও কুপন কোডের আপডেট পেতে ইমেইল দিয়ে যুক্ত থাকুন।</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex max-w-md" aria-label="Newsletter subscription">
              <label htmlFor="footer-email" className="sr-only">আপনার ইমেইল অ্যাড্রেস</label>
              <input id="footer-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="আপনার ইমেইল অ্যাড্রেস..." className="min-w-0 flex-1 rounded-l-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-xs text-white placeholder:text-gray-500 focus:border-[#FC5C03] focus:outline-none focus:ring-1 focus:ring-[#FC5C03]" />
              <button type="submit" className="flex shrink-0 items-center gap-1 rounded-r-lg bg-[#FC5C03] px-3.5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#EC4001] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FC5C03] focus-visible:ring-offset-2 focus-visible:ring-offset-[#15171E]"><span>যুক্ত হন</span><Send className="h-3 w-3" /></button>
            </form>
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-800 bg-gray-900 p-2.5"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FC5C03]/15 text-[#FC5C03]"><ShieldCheck className="h-4 w-4" /></div><div className="text-[11px] text-gray-300"><strong className="block text-white">এআই হাট ডিজিটাল স্টোর</strong><span>পেমেন্ট প্রসেসরের নিরাপদ চ্যানেল ব্যবহার করা হয়</span></div></div>
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-800/80 py-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start" aria-label="Accepted payment methods"><span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">পেমেন্ট:</span>{acceptedPayments.map((method) => <PaymentLogo key={method} method={method} width={72} height={30} className="h-8 w-16 rounded border border-gray-800 bg-white" />)}</div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-gray-500 sm:justify-end"><span>© 2026 AI Haat. All Rights Reserved.</span><Link href="/privacy" className="hover:text-white">প্রাইভেসি</Link><span aria-hidden="true">•</span><Link href="/terms" className="hover:text-white">শর্তাবলী</Link><span aria-hidden="true">•</span><Link href="/order-tracking" className="hover:text-white">অর্ডার ট্র্যাকিং</Link></div>
        </div>
      </div>
    </footer>
  );
}
