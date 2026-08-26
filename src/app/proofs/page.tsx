"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Clock, ArrowRight, PackageOpen } from "lucide-react";
import { PROOFS } from "@/data/proofs";
import { useCurrency } from "@/context/CurrencyContext";
import { SafeImage } from "@/components/SafeImage";

export default function ProofsPage() {
  const { formatPrice } = useCurrency();
  const [filterType, setFilterType] = useState<string>("All");

  const types = ["All", "Subscription", "License Key"];

  const filteredProofs =
    filterType === "All" ? PROOFS : PROOFS.filter((p) => p.type === filterType);

  return (
    <div className="w-full bg-white py-8 sm:py-12 min-h-[75vh]">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ভেরিফাইড ডেলিভারি প্রুফ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D26] tracking-tight">
            কাস্টমার পেমেন্ট ও ডেলিভারি প্রমাণপত্র
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            প্রতিদিন গ্রাহকদের সফল ডেলিভারি ও রিয়েল-টাইম স্ক্রিনশট প্রুফ।
          </p>
        </div>

        {/* Proof Cards Grid */}
        {filteredProofs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProofs.map((proof) => (
              <div
                key={proof.id}
                className="bg-white rounded-xl border border-[#E8E8EE] overflow-hidden shadow-2xs hover:border-[#FC5C03]/50 transition-all flex flex-col"
              >
                <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      অর্ডার নাম্বার
                    </span>
                    <span className="text-xs font-black text-[#1A1D26] font-mono">
                      {proof.orderId}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> ডেলিভার্ড
                  </span>
                </div>

                <div className="p-4 flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
                      <SafeImage
                        src={proof.image}
                        alt={proof.productName}
                        aspectRatio="1/1"
                        objectFit="cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1A1D26]">
                        {proof.productName}
                      </h4>
                      <span className="text-xs font-extrabold text-[#FC5C03]">
                        {formatPrice(proof.amountBDT)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FFF9F5] rounded-lg border border-[#FFF2E8] text-xs text-gray-700 italic leading-relaxed">
                    &ldquo;{proof.customerNote}&rdquo;
                  </div>
                </div>

                <div className="p-3 bg-gray-50/50 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{proof.date}</span>
                  </div>
                  <span className="font-bold text-[#1A1D26]">{proof.type}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200 max-w-md mx-auto p-8 space-y-3">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <PackageOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">এখনো কোনো ডেলিভারি প্রুফ নেই</h3>
            <p className="text-xs text-slate-500">
              অ্যাডমিন প্যানেল থেকে ডেলিভারি সম্পন্ন হলে ভেরিফাইড প্রুফ এখানে প্রদর্শিত হবে।
            </p>
            <Link
              href="/shop"
              className="inline-block px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-colors"
            >
              প্রোডাক্ট দেখুন
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
