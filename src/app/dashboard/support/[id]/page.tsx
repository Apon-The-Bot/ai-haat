"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  MessageCircle, 
  Clock, 
  Send, 
  ExternalLink, 
  ShieldCheck, 
  KeyRound, 
  RotateCcw,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { SafeImage } from "@/components/SafeImage";

export default function TicketDetailsPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { language } = useLanguage();
  const { user } = useAuth();
  const isBn = language === "bn";

  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  const fetchTicket = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/support/tickets/${id}`);
      const data = await res.json();

      if (res.ok && data.id) {
        setTicket(data);
        setMessages(data.messages || []);
      } else {
        setError(data.error || "Failed to load ticket.");
      }
    } catch (err: any) {
      console.error("Error fetching ticket:", err);
      setError("Network error while loading ticket.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleSendReply = async () => {
    if (!reply.trim() || sending) return;

    try {
      setSending(true);
      const res = await fetch(`/api/support/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setReply("");
        await fetchTicket();
      } else {
        alert(data.error || "Failed to send message.");
      }
    } catch (err: any) {
      alert("Error sending message: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const whatsappDeepLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I need help with ticket ${ticket?.ticketNumber || id}`)}`
    : null;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-3xl border border-[#E8E8EE]">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#FC5C03]" />
        <p className="text-sm text-slate-500">{isBn ? "টিকিটের তথ্য লোড হচ্ছে..." : "Loading ticket details..."}</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-red-50 rounded-3xl border border-red-200 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
        <p className="text-sm font-bold text-red-700">{error || "Ticket not found."}</p>
        <Link href="/dashboard/support" className="inline-block mt-4 text-xs font-bold text-[#FC5C03] underline">
          {isBn ? "সাপোর্ট ড্যাশবোর্ডে ফিরে যান" : "Back to Support"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/support"
          className="w-8 h-8 flex items-center justify-center bg-white border border-[#E8E8EE] rounded-lg text-slate-600 hover:text-[#FC5C03] hover:border-[#FC5C03] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-[#1A1D26] flex items-center gap-2">
            {isBn ? "টিকিট" : "Ticket"} {ticket.ticketNumber || ticket.id}
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase ${
              ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS' || ticket.status === 'WAITING_FOR_ADMIN'
                ? "bg-amber-50 text-amber-700 border-amber-200" 
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              {ticket.status.replace(/_/g, ' ')}
            </span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">{ticket.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Conversation Thread */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-[#E8E8EE] shadow-2xs overflow-hidden flex flex-col h-[600px]">
            
            {/* Subject Header */}
            <div className="p-4 border-b border-gray-100 bg-slate-50">
              <h2 className="text-sm font-bold text-slate-800">
                {isBn ? "বিষয়:" : "Subject:"} {ticket.subject}
              </h2>
            </div>

            {/* Chat Timeline */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
              {messages.map((msg) => {
                const isCustomer = msg.senderType === "CUSTOMER";
                return (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isCustomer ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                    <div className="shrink-0 mt-1">
                      {isCustomer ? (
                        <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden bg-white">
                          <SafeImage
                            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                            alt="Customer"
                            aspectRatio="1/1"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border border-indigo-200">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    
                    <div className={`space-y-1 ${isCustomer ? "text-right" : "text-left"}`}>
                      <div className="flex items-center gap-2 justify-end px-1">
                        {!isCustomer && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            AI Haat Support
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className={`p-3.5 rounded-2xl text-sm ${
                        isCustomer 
                          ? "bg-[#FC5C03] text-white rounded-tr-sm" 
                          : "bg-white text-slate-700 border border-slate-200 shadow-sm rounded-tl-sm"
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Box */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="relative">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={isBn ? "এখানে আপনার মেসেজ লিখুন..." : "Type your reply here..."}
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-2xl px-4 py-3 pr-14 outline-none focus:border-[#FC5C03] focus:ring-1 focus:ring-[#FC5C03]/20 transition-all resize-none min-h-[80px]"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!reply.trim() || sending}
                  className="absolute bottom-3 right-3 w-8 h-8 bg-[#FC5C03] hover:bg-[#EC4001] disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar Context */}
        <div className="lg:col-span-1 space-y-4">
          {/* Linked Order Card */}
          {ticket.order && (
            <div className="bg-white rounded-2xl border border-[#E8E8EE] p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {isBn ? "লিঙ্কড অর্ডার" : "Linked Order Details"}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">{isBn ? "অর্ডার আইডি" : "Order ID"}</span>
                  <Link href={`/dashboard/orders`} className="text-sm font-bold text-[#FC5C03] hover:underline flex items-center gap-1 mt-0.5">
                    {ticket.order.trxId || ticket.order.id}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {ticket.product && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">{isBn ? "প্রোডাক্ট" : "Product"}</span>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-tight">
                      {ticket.product.name}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block">{isBn ? "পেমেন্ট" : "Payment"}</span>
                    <span className="text-xs font-bold text-emerald-600 capitalize mt-0.5 block">
                      {ticket.order.paymentStatus}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block">{isBn ? "ডেলিভারি" : "Delivery"}</span>
                    <span className="text-xs font-bold text-blue-600 capitalize mt-0.5 block">
                      {ticket.order.deliveryStatus}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <Link href="/dashboard/keys" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#FC5C03] transition-colors p-2 bg-slate-50 rounded-lg">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isBn ? "ভল্ট চেক করুন" : "Check in Vault"}</span>
                  </Link>
                  <Link href="/dashboard/replacements" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#FC5C03] transition-colors p-2 bg-slate-50 rounded-lg">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isBn ? "ওয়ারেন্টি ক্লেইম" : "Warranty Claims"}</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Support Action */}
          {whatsappDeepLink && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 shadow-2xs text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-900">
                  {isBn ? "দ্রুত সমাধান প্রয়োজন?" : "Need faster resolution?"}
                </h3>
                <p className="text-xs text-emerald-700 mt-1">
                  {isBn ? "আমাদের সাপোর্ট টিমের সাথে হোয়াটসঅ্যাপে সরাসরি কথা বলুন।" : "Talk to our support team directly on WhatsApp."}
                </p>
              </div>
              <a
                href={whatsappDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isBn ? "হোয়াটসঅ্যাপে যান" : "Continue on WhatsApp"}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
