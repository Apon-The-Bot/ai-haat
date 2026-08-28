"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Lock,
  Send,
  User,
  Phone,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Package,
  Key,
  RotateCcw,
  Undo2,
  ExternalLink,
  Calendar,
  CreditCard,
  Truck,
} from "lucide-react";
import { useParams } from "next/navigation";

export default function AdminTicketWorkspacePage() {
  const params = useParams();
  const ticketId = (params?.id as string) || "";

  const [replyType, setReplyType] = useState<"PUBLIC" | "INTERNAL">("PUBLIC");
  const [replyContent, setReplyContent] = useState("");
  const [nextStatus, setNextStatus] = useState("WAITING_FOR_CUSTOMER");
  const [ticketStatus, setTicketStatus] = useState("WAITING_FOR_ADMIN");
  const [ticketPriority, setTicketPriority] = useState("HIGH");

  return (
    <div className="space-y-6">
      {/* TOP NAV */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/support"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-black shadow-sm transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Ticket {ticketId}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Order not delivered yet • Delivery Issue
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* TICKET HEADER */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={ticketStatus}
                onChange={(e) => setTicketStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FC5C03]/20 uppercase"
              >
                <option value="OPEN">Open</option>
                <option value="WAITING_FOR_ADMIN">Waiting for Admin</option>
                <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              <select
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FC5C03]/20 uppercase"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="text-sm text-slate-500 font-medium">
              Created: 2 hours ago
            </div>
          </div>

          {/* MESSAGE THREAD */}
          <div className="space-y-4">
            {/* Customer Message */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                    RU
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Rahim Uddin (Customer)</p>
                    <p className="text-xs text-slate-500">rahim@example.com</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">2 hours ago</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                Hi, I ordered the digital software key yesterday but haven't received the delivery yet. The status says processing. Can you please check?
              </p>
            </div>

            {/* Internal Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-amber-100 px-5 py-2 flex items-center gap-2 text-amber-800 text-xs font-bold uppercase">
                <Lock className="w-3.5 h-3.5" />
                <span>Internal Note — Visible ONLY to Admins</span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs">
                      A
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900">Admin (You)</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-amber-600/70">1 hour ago</span>
                </div>
                <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                  Checked the vault pool, we ran out of keys for this SKU. Need to restock and then dispatch. I'll inform the customer to wait for a few hours.
                </p>
              </div>
            </div>

            {/* Admin Reply */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-bold text-xs">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-bold text-indigo-900">Admin Support</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-indigo-600/70">1 hour ago</span>
              </div>
              <p className="text-sm text-indigo-900 whitespace-pre-wrap leading-relaxed">
                Dear Rahim, we apologize for the delay. We are currently restocking the keys for your requested item. It should be delivered to you within the next 4 hours. Thank you for your patience!
              </p>
            </div>
            
            {/* Customer Message */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                    RU
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Rahim Uddin (Customer)</p>
                    <p className="text-xs text-slate-500">rahim@example.com</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">10 mins ago</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                Okay, I will wait. Please ensure it's delivered today.
              </p>
            </div>
          </div>

          {/* REPLY BOX */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex gap-2">
              <button
                onClick={() => setReplyType("PUBLIC")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  replyType === "PUBLIC" ? "bg-white border border-slate-200 shadow-sm text-slate-900" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Reply to Customer</span>
              </button>
              <button
                onClick={() => setReplyType("INTERNAL")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  replyType === "INTERNAL" ? "bg-amber-100 border border-amber-200 text-amber-900 shadow-sm" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Internal Note Only</span>
              </button>
            </div>
            <div className={`p-4 ${replyType === "INTERNAL" ? "bg-amber-50/30" : "bg-white"}`}>
              <textarea
                rows={4}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={replyType === "PUBLIC" ? "Type your reply to the customer..." : "Type an internal note (visible only to admins)..."}
                className="w-full bg-transparent border-0 focus:ring-0 text-sm text-slate-900 placeholder-slate-400 resize-none p-0"
              />
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500">Status after sending:</span>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#FC5C03]/20"
                >
                  <option value="OPEN">Open</option>
                  <option value="WAITING_FOR_ADMIN">Waiting for Admin</option>
                  <option value="WAITING_FOR_CUSTOMER">Waiting for Customer</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
              <button className={`px-5 py-2 text-white text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 ${
                replyType === "INTERNAL" ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"
              }`}>
                <span>{replyType === "INTERNAL" ? "Add Note" : "Send Reply"}</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT / CONTEXT COLUMN */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider px-1">Context Panel</h2>

          {/* Customer Context */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Rahim Uddin</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Verified Customer</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">rahim@example.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">+880 171 234 5678</span>
              </div>
            </div>
          </div>

          {/* Order Context */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#FC5C03]" />
                <h3 className="text-sm font-bold text-slate-900">Order Context</h3>
              </div>
              <Link href="/admin/orders/ORD-10294" className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                View Order <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Order #</span>
                <span className="text-xs font-bold text-slate-900">ORD-10294</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Date</span>
                <span className="text-xs font-bold text-slate-900">2026-08-27</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Total</span>
                <span className="text-xs font-black text-[#FC5C03]">৳ 4,500</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Payment</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">Paid</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Delivery</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">Processing</span>
              </div>
            </div>
          </div>

          {/* Item Context */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
              <Package className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Item Context</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Product</p>
                <p className="text-sm font-bold text-slate-900">Microsoft Office 2021 Professional Plus</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Type</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase">Digital Key</span>
              </div>
              <div className="pt-2">
                <Link href="/admin/inventory" className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all">
                  <Key className="w-3.5 h-3.5" />
                  <span>Check Vault Keys</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Escalation Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Escalation Actions</h3>
            <div className="space-y-2">
              <Link href="/admin/replacements/new" className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-2 text-slate-700 group-hover:text-black text-sm font-bold">
                  <RotateCcw className="w-4 h-4" />
                  <span>Create Replacement</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-black" />
              </Link>
              <Link href="/admin/refunds/new" className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-2 text-slate-700 group-hover:text-black text-sm font-bold">
                  <Undo2 className="w-4 h-4" />
                  <span>Request Refund</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-black" />
              </Link>
              <a
                href="https://wa.me/8801712345678"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all group mt-4"
              >
                <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold">
                  <MessageSquare className="w-4 h-4" />
                  <span>Open on WhatsApp</span>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-600" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
