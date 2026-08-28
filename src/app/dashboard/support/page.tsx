"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, MessageCircle, HelpCircle, ExternalLink, ChevronDown, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function SupportPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [activeTab, setActiveTab] = useState<"all" | "open" | "resolved">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/support/tickets");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setTickets(data);
      } else {
        setError(data.error || "Failed to load support tickets.");
      }
    } catch (err: any) {
      console.error("Error fetching support tickets:", err);
      setError("Network error while loading tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = tickets.filter((ticket) => {
    const isResolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED";
    if (activeTab === "all") return true;
    if (activeTab === "open") return !isResolved;
    if (activeTab === "resolved") return isResolved;
    return true;
  });

  const faqs = [
    {
      q: isBn ? "ওয়ারেন্টি কীভাবে কাজ করে?" : "How does warranty work?",
      a: isBn
        ? "আপনার অর্ডারের নির্দিষ্ট ওয়ারেন্টি পিরিয়ডের মধ্যে কোনো সমস্যা হলে 'My Orders' থেকে সরাসরি ক্লেইম করতে পারবেন। আমরা সাধারণত ২৪ ঘন্টার মধ্যে সমাধান দিয়ে থাকি।"
        : "If you face any issue within the specified warranty period of your order, you can claim directly from 'My Orders'. We usually resolve issues within 24 hours.",
    },
    {
      q: isBn ? "ডেলিভারি পেতে কতক্ষণ সময় লাগে?" : "How long does delivery take?",
      a: isBn
        ? "ডিজিটাল প্রোডাক্টের ক্ষেত্রে পেমেন্ট কনফার্ম হওয়ার সাথে সাথেই ভল্টে ডেলিভারি হয়ে যায়। কিছু স্পেশাল অর্ডারের ক্ষেত্রে ৫-৩০ মিনিট সময় লাগতে পারে।"
        : "For digital products, delivery to your vault is instant upon payment confirmation. Some special orders may take 5-30 minutes.",
    },
    {
      q: isBn ? "রিফান্ড পলিসি কী?" : "What is the refund policy?",
      a: isBn
        ? "যদি আমরা প্রোডাক্ট ডেলিভার করতে ব্যর্থ হই অথবা ওয়ারেন্টির মধ্যে প্রোডাক্ট রিপ্লেস করতে না পারি, তবে আপনি সম্পূর্ণ রিফান্ড পাবেন আপনার ওয়ালেটে।"
        : "If we fail to deliver the product or replace it within warranty, you will receive a full refund to your wallet.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1A1D26]">
            {isBn ? "সহায়তা ও সাপোর্ট" : "Support & Helpdesk"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isBn ? "আপনার সব সমস্যার দ্রুত সমাধান পান" : "Get quick resolutions to all your issues"}
          </p>
        </div>
        <Link
          href="/dashboard/support/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isBn ? "নতুন টিকিট খুলুন" : "Create New Ticket"}</span>
        </Link>
      </div>

      {/* WhatsApp Banner (only if configured) */}
      {whatsappNumber && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                {isBn ? "লাইভ হোয়াটসঅ্যাপ সাপোর্ট" : "Live WhatsApp Support"}
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                {isBn ? "সকাল ১০টা থেকে রাত ১০টা পর্যন্ত" : "Available 10 AM to 10 PM"}
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            <span>{isBn ? "হোয়াটসঅ্যাপে মেসেজ দিন" : "Message on WhatsApp"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: isBn ? "সকল টিকিট" : "All Tickets" },
              { id: "open", label: isBn ? "ওপেন / ইন প্রোগ্রেস" : "Open / In Progress" },
              { id: "resolved", label: isBn ? "সমাধানকৃত" : "Resolved" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#FC5C03] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ticket List */}
          <div className="space-y-3">
            {loading ? (
              <div className="bg-white rounded-2xl border border-[#E8E8EE] p-10 text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FC5C03]" />
                <p className="text-sm text-slate-500">{isBn ? "সাপোর্ট টিকিট লোড হচ্ছে..." : "Loading support tickets..."}</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center text-red-600">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
              </div>
            ) : filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-2xl border border-[#E8E8EE] p-4 sm:p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-[#1A1D26]">{ticket.ticketNumber || ticket.id}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                        ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS' || ticket.status === 'WAITING_FOR_ADMIN'
                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {ticket.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                        ticket.priority === 'URGENT' || ticket.priority === 'HIGH'
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{ticket.subject}</h4>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {ticket.messages && ticket.messages.length > 0 ? ticket.messages[0].message : ticket.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isBn ? "শেষ আপডেট:" : "Last update:"} {new Date(ticket.lastActivityAt || ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/support/${ticket.id}`}
                    className="shrink-0 inline-flex items-center justify-center px-4 py-2 bg-slate-50 hover:bg-[#FC5C03] text-slate-700 hover:text-white text-xs font-bold rounded-xl transition-colors border border-slate-200 hover:border-[#FC5C03] w-full sm:w-auto"
                  >
                    {isBn ? "টিকিট দেখুন" : "View Ticket"}
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-[#E8E8EE] p-10 text-center shadow-2xs">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  {isBn ? "কোনো টিকিট পাওয়া যায়নি" : "No tickets found"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {isBn ? "আপনার কোনো সাপোর্ট টিকিট নেই।" : "You don't have any support tickets yet."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[#1A1D26]">
                {isBn ? "সাধারণ জিজ্ঞাসা (FAQ)" : "Quick FAQ"}
              </h2>
            </div>
            
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-slate-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-3 text-left bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-700 pr-2">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="p-3 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
