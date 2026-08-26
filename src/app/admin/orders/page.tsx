"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Search,
  Send,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  Copy,
  Check,
  X,
  MessageSquare,
  Download,
  ExternalLink,
  Eye,
  Edit3,
  Ban,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { generateDeliveryHtml } from "@/utils/emailTemplate";

export default function AdminOrdersPage() {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([
    {
      id: "AH-98214",
      customerName: "Sifat Rahman",
      customerEmail: "sifat.rahman@gmail.com",
      customerPhone: "01711223344",
      productName: "ChatGPT Plus (1 Month Shared)",
      variationName: "1 Month Shared Profile",
      totalBDT: 290,
      paymentMethod: "bKash",
      senderNumber: "01711-223344",
      trxId: "BL90X84Q",
      status: "PENDING",
      createdAt: "10 mins ago",
      deliveredKey: null,
      downloadUrl: null,
      cancelReason: null,
    },
    {
      id: "AH-98213",
      customerName: "Tanvir Ahmed",
      customerEmail: "tanvir.ahmed@gmail.com",
      customerPhone: "01822334455",
      productName: "CapCut Pro PC & Mobile (VIP Auto Captions)",
      variationName: "1 Month - 1 Device PC/Mobile",
      totalBDT: 150,
      paymentMethod: "Nagad",
      senderNumber: "01822-334455",
      trxId: "NG882K19",
      status: "PENDING",
      createdAt: "24 mins ago",
      deliveredKey: null,
      downloadUrl: "https://drive.google.com/uc?id=capcut-pro-v5-apk-setup",
      cancelReason: null,
    },
    {
      id: "AH-89211",
      customerName: "Amanullah Sheikh",
      customerEmail: "mdamanullahsheikhapon@gmail.com",
      customerPhone: "01712345678",
      productName: "ChatGPT Plus (1 Month Shared)",
      variationName: "1 Month Shared Profile",
      totalBDT: 290,
      paymentMethod: "bKash",
      senderNumber: "01712-345678",
      trxId: "BL90X84Q",
      status: "DELIVERED",
      createdAt: "Yesterday 14:15",
      deliveredKey: "Email: user12@gptaccess.net\nPassword: SmartGpt2026!\nPIN: 4092",
      downloadUrl: null,
      cancelReason: null,
    },
  ]);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Email Compose & Preview States
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [modalTab, setModalTab] = useState<"COMPOSE" | "PREVIEW">("COMPOSE");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [credentials, setCredentials] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("Invalid TrxID / Payment Not Received");

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      o.trxId.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleOpenFulfill = (order: any) => {
    setSelectedOrder(order);
    setModalTab("COMPOSE");
    setEmailTo(order.customerEmail);
    setEmailSubject(`Your AI Haat Delivery: ${order.productName} (Order #${order.id})`);
    setCredentials(
      `Email: ${order.customerEmail.split("@")[0]}@access.aihaat.net\nPassword: Pass${Math.floor(
        1000 + Math.random() * 9000
      )}!\nProfile PIN: ${Math.floor(1000 + Math.random() * 9000)}`
    );
    setDownloadUrl(order.downloadUrl || "");
    setInstructions("Log in using the credentials above. Do not change recovery or account settings. Full replacement warranty active.");
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Dispatch Email via API
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.trim() && !downloadUrl.trim()) {
      showToast("Please provide credentials or download URL.", "error");
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/admin/send-delivery-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: selectedOrder.customerName,
          customerEmail: emailTo,
          orderId: selectedOrder.id,
          productName: selectedOrder.productName,
          variationName: selectedOrder.variationName,
          credentials,
          downloadUrl: downloadUrl.trim() || null,
          instructions,
          subject: emailSubject,
        }),
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                status: "DELIVERED",
                deliveredKey: credentials,
                downloadUrl: downloadUrl.trim() || null,
              }
            : o
        )
      );

      showToast(`Delivery email sent to ${emailTo}!`, "success");
      setSelectedOrder(null);
    } catch {
      showToast("Failed to dispatch email.", "error");
    } finally {
      setIsSending(false);
    }
  };

  // Cancel Order Handler
  const handleConfirmCancel = () => {
    if (!cancellingOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancellingOrder.id
          ? {
              ...o,
              status: "CANCELLED",
              cancelReason,
            }
          : o
      )
    );
    showToast(`Order #${cancellingOrder.id} has been cancelled.`, "info");
    setCancellingOrder(null);
  };

  // Reopen Cancelled Order
  const handleReopenOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "PENDING",
              cancelReason: null,
            }
          : o
      )
    );
    showToast(`Order #${orderId} moved back to Pending!`, "success");
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage customer purchases, dispatch deliveries, or cancel invalid orders.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          {[
            { id: "ALL", label: `All (${orders.length})` },
            { id: "PENDING", label: `Pending (${orders.filter((o) => o.status === "PENDING").length})` },
            { id: "DELIVERED", label: `Delivered (${orders.filter((o) => o.status === "DELIVERED").length})` },
            { id: "CANCELLED", label: `Cancelled (${orders.filter((o) => o.status === "CANCELLED").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white text-[#FC5C03] shadow-xs"
                  : "text-slate-600 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order ID, name, phone, or TrxID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#FC5C03] transition-all"
          />
        </div>

        <div className="text-sm font-semibold text-slate-500 hidden sm:block">
          Showing <strong className="text-slate-900">{filtered.length}</strong> orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5">Order ID</th>
                <th className="py-4 px-5">Customer</th>
                <th className="py-4 px-5">Product & Plan</th>
                <th className="py-4 px-5">Payment Details</th>
                <th className="py-4 px-5">Total</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Order ID */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-slate-900">{order.id}</span>
                      <button
                        onClick={() => handleCopy(order.id, order.id)}
                        className="text-slate-400 hover:text-slate-900 cursor-pointer"
                      >
                        {copiedId === order.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">{order.createdAt}</span>
                  </td>

                  {/* Customer Details */}
                  <td className="py-4 px-5">
                    <span className="font-bold text-base text-slate-900 block">{order.customerName}</span>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{order.customerPhone}</span>
                      <a
                        href={`https://wa.me/88${order.customerPhone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">{order.customerEmail}</span>
                  </td>

                  {/* Product */}
                  <td className="py-4 px-5">
                    <span className="font-bold text-base text-slate-900 block">{order.productName}</span>
                    <span className="text-xs text-slate-500 block mt-0.5">{order.variationName}</span>
                  </td>

                  {/* Payment */}
                  <td className="py-4 px-5">
                    <span className="font-bold text-sm text-slate-800 block">{order.paymentMethod}</span>
                    <span className="font-mono text-xs font-bold text-[#FC5C03] block mt-0.5">
                      TrxID: {order.trxId}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-5 font-black text-base text-slate-900">
                    {formatPrice(order.totalBDT)}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700"
                          : order.status === "CANCELLED"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-500"
                            : order.status === "CANCELLED"
                            ? "bg-red-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <span>
                        {order.status === "DELIVERED"
                          ? "Delivered"
                          : order.status === "CANCELLED"
                          ? "Cancelled"
                          : "Pending"}
                      </span>
                    </span>
                    {order.cancelReason && (
                      <span className="text-[11px] text-red-600 block mt-0.5 truncate max-w-[140px]" title={order.cancelReason}>
                        {order.cancelReason}
                      </span>
                    )}
                  </td>

                  {/* Action Column */}
                  <td className="py-4 px-5 text-right">
                    {order.status === "PENDING" && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenFulfill(order)}
                          className="px-4 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Send Email</span>
                        </button>

                        <button
                          onClick={() => setCancellingOrder(order)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Cancel Order"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {order.status === "DELIVERED" && (
                      <div className="flex items-center justify-end gap-2">
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 whitespace-nowrap">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Delivered</span>
                        </span>
                        <button
                          onClick={() => setCancellingOrder(order)}
                          className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Cancel & Revoke"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {order.status === "CANCELLED" && (
                      <button
                        onClick={() => handleReopenOrder(order.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        title="Move back to Pending"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reopen</span>
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANCEL ORDER CONFIRMATION MODAL */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900">
                Cancel Order #{cancellingOrder.id}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Customer: <b>{cancellingOrder.customerName}</b> • {cancellingOrder.productName}
              </p>
            </div>

            {/* Select Reason */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-800 block">
                Select Cancellation Reason:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-red-500"
              >
                <option value="Invalid TrxID / Payment Not Received">
                  ❌ Invalid TrxID / Payment Not Received
                </option>
                <option value="Customer Requested Cancellation">
                  ❌ Customer Requested Cancellation
                </option>
                <option value="Duplicate Order / Double Click">
                  ❌ Duplicate Order
                </option>
                <option value="Out of Stock / Account Unavailable">
                  ❌ Out of Stock / Account Unavailable
                </option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Keep Order
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirm Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EMAIL DISPATCH & PREVIEW MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Send Delivery Email
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      From: delivery@aihaat.shop
                    </span>
                    <span className="text-xs text-slate-400">• Order #{selectedOrder.id}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-black rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compose vs Live HTML Preview Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalTab("COMPOSE")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    modalTab === "COMPOSE"
                      ? "bg-white text-[#FC5C03] shadow-xs"
                      : "text-slate-600 hover:text-black"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Email Form</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("PREVIEW")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    modalTab === "PREVIEW"
                      ? "bg-white text-[#FC5C03] shadow-xs"
                      : "text-slate-600 hover:text-black"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
              </div>

              <span className="text-xs font-semibold text-slate-500 hidden sm:block">
                Recipient: <strong className="text-slate-900">{emailTo}</strong>
              </span>
            </div>

            {/* TAB 1: COMPOSE FORM */}
            {modalTab === "COMPOSE" ? (
              <form onSubmit={handleSendEmail} className="space-y-4">
                
                {/* To & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-5 space-y-1.5">
                    <label className="text-sm font-bold text-slate-800 block">Recipient Email</label>
                    <input
                      type="email"
                      required
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                    />
                  </div>

                  <div className="sm:col-span-7 space-y-1.5">
                    <label className="text-sm font-bold text-slate-800 block">Subject</label>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                    />
                  </div>
                </div>

                {/* Credentials / Key Box */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800 block">
                    Account Credentials / License Key *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={credentials}
                    onChange={(e) => setCredentials(e.target.value)}
                    placeholder="Email: ...&#10;Password: ...&#10;PIN: ..."
                    className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-sm rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#FC5C03] leading-relaxed"
                  />
                </div>

                {/* APK / File Attachment Download Link */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800 block">
                    APK / Software File Download URL (Optional)
                  </label>
                  <div className="relative">
                    <Download className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={downloadUrl}
                      onChange={(e) => setDownloadUrl(e.target.value)}
                      placeholder="https://drive.google.com/... or direct APK download link"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800 block">
                    Usage Instructions & Warranty Guidelines
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Login with PIN lock. Full 30 days replacement warranty."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-[#FC5C03]"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-8 py-3 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSending ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Email</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            ) : (
              /* TAB 2: LIVE HTML PREVIEW */
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner bg-slate-100 p-2 max-h-[500px] overflow-y-auto">
                  <iframe
                    title="HTML Email Preview"
                    srcDoc={generateDeliveryHtml({
                      customerName: selectedOrder.customerName,
                      customerEmail: emailTo,
                      orderId: selectedOrder.id,
                      productName: selectedOrder.productName,
                      variationName: selectedOrder.variationName,
                      credentials,
                      downloadUrl,
                      instructions,
                    })}
                    className="w-full min-h-[550px] bg-white rounded-xl border-0"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalTab("COMPOSE")}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl cursor-pointer"
                  >
                    Back to Edit
                  </button>

                  <button
                    type="button"
                    disabled={isSending}
                    onClick={handleSendEmail}
                    className="px-8 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
