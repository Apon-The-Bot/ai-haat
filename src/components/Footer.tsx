"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Facebook,
  Mail,
  Phone,
  MapPin,
  Send,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useToast } from "@/context/ToastContext";
import { SafeImage } from "@/components/SafeImage";

export function Footer() {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      showToast("নিউজলেটার সাবস্ক্রিপশন সম্পন্ন হয়েছে!", "success");
      setEmail("");
    }
  };

  const paymentLogos = [
    { name: "bKash", icon: "/images/payments/bkash.png" },
    { name: "Nagad", icon: "/images/payments/nagad.png" },
    { name: "Rocket", icon: "/images/payments/rocket.png" },
    { name: "Upay", icon: "/images/payments/upay.png" },
    { name: "Visa", icon: "/images/payments/visa.svg" },
    { name: "Mastercard", icon: "/images/payments/mastercard.svg" },
  ];

  return (
    <footer className="bg-[#15171E] text-gray-300 pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        
        {/* Multi-Column Grid on Desktop, Stacked on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-gray-800/80">
          
          {/* LEFT COLUMN: Logo, Socials, Contacts (5 Cols) */}
          <div className="md:col-span-5 lg:col-span-4 space-y-4">
            <Logo variant="light" size="lg" showSubtitle={true} />
            
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              এআই হাট বাংলাদেশের বিশ্বস্ত ডিজিটাল সাবস্ক্রিপশন ও সফটওয়্যার মার্কেটপ্লেস। ৫-১৫ মিনিটে অটোমেটেড ডেলিভারি ও ১০০% রিপ্লেসমেন্ট ওয়ারেন্টি।
            </p>

            {/* Contact Info */}
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FC5C03] shrink-0" />
                <span>+880 1712-345678 (WhatsApp Support)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FC5C03] shrink-0" />
                <a href="mailto:support@aihaat.shop" className="hover:text-white transition-colors">
                  support@aihaat.shop
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FC5C03] shrink-0" />
                <span>ঢাকা, বাংলাদেশ</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-[#FC5C03] text-gray-300 hover:text-white flex items-center justify-center transition-all"
                aria-label="Facebook Page"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/8801712345678"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-[#25D366] text-gray-300 hover:text-white flex items-center justify-center transition-all"
                aria-label="WhatsApp Support"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="mailto:support@aihaat.com"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-[#FE7113] text-gray-300 hover:text-white flex items-center justify-center transition-all"
                aria-label="Email Us"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* MIDDLE COLUMN: Information Links (3 Cols) */}
          <div className="md:col-span-3 lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold tracking-wider uppercase text-white border-l-2 border-[#FC5C03] pl-2">
              প্রয়োজনীয় লিংক
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-[#FC5C03] transition-colors">
                  প্রাইভেসি পলিসি
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FC5C03] transition-colors">
                  শর্তাবলী (Terms &amp; Conditions)
                </Link>
              </li>
              <li>
                <Link href="/order-tracking" className="hover:text-[#FC5C03] transition-colors">
                  অর্ডার ট্র্যাকিং ও ডেলিভারি
                </Link>
              </li>
              <li>
                <Link href="/proofs" className="hover:text-[#FC5C03] transition-colors">
                  কাস্টমার ডেলিভারি প্রুফ
                </Link>
              </li>
              <li>
                <Link href="/product-request" className="hover:text-[#FC5C03] transition-colors">
                  কাস্টম প্রোডাক্ট রিকোয়েস্ট
                </Link>
              </li>
            </ul>
          </div>

          {/* RIGHT COLUMN: Newsletter & Payments (4-5 Cols) */}
          <div className="md:col-span-4 lg:col-span-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold tracking-wider uppercase text-white border-l-2 border-[#FC5C03] pl-2 mb-1.5">
                অফার ও ডিসকাউন্ট আপডেট
              </h3>
              <p className="text-xs text-gray-400 mb-2.5">
                নতুন সফটওয়্যার ও কুপন কোডের আপডেট পেতে ইমেইল দিয়ে যুক্ত থাকুন।
              </p>
              
              {/* Subscription Form */}
              <form onSubmit={handleSubscribe} className="flex items-center w-full max-w-sm">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="আপনার ইমেইল অ্যাড্রেস..."
                  className="w-full bg-gray-900 border border-gray-700 text-xs text-white px-3 py-2.5 rounded-l-lg focus:outline-none focus:border-[#FC5C03]"
                />
                <button
                  type="submit"
                  className="bg-[#FC5C03] hover:bg-[#EC4001] text-white px-4 py-2.5 text-xs font-bold rounded-r-lg flex items-center gap-1 shrink-0 transition-colors"
                >
                  <span>যুক্ত হন</span>
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>

            {/* Verified Business Information */}
            <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#FC5C03]/15 text-[#FC5C03] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-[11px] text-gray-300">
                <span className="font-bold text-white block">এআই হাট ভেরিফাইড ডিজিটাল স্টোর</span>
                <span>এসএসএল এনক্রিপ্টেড ও সম্পূর্ণ নিরাপদ পেমেন্ট</span>
              </div>
            </div>

            {/* Supported Payment Logos */}
            <div>
              <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                পেমেন্ট মেথড
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {paymentLogos.map((pm) => (
                  <div
                    key={pm.name}
                    className="w-14 h-7 relative rounded border border-gray-800 overflow-hidden bg-gray-900 shrink-0"
                  >
                    <SafeImage
                      src={pm.icon}
                      alt={pm.name}
                      aspectRatio="auto"
                      objectFit="contain"
                      sizes="56px"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 text-center sm:text-left">
          <p>© 2026 AI Haat. All Rights Reserved.</p>
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors">প্রাইভেসি পলিসি</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">শর্তাবলী</Link>
            <span>•</span>
            <Link href="/order-tracking" className="hover:text-white transition-colors">অর্ডার ট্র্যাকিং</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
