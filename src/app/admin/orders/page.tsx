"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  User,
  CreditCard,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";
import { generateDeliveryHtml } from "@/utils/emailTemplate";

interface OrderItemDetail {
  id?: string;
  productId?: string;
  productName: string;
  variationName: string;
  quantity: number;
  priceBDT: number;
  image?: string;
  deliveryStatus?: string;
  fulfillmentType?: string;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItemDetail[];
  totalBDT: number;
  subtotalBDT: number;
  discountBDT: number;
  paymentMethod: string;
  senderNumber?: string;
  trxId?: string;
  paymentStatus: string;
  deliveryStatus: string;
  rawDeliveryStatus?: string;
  rawPaymentStatus?: string;
  notes?: string | null;
  date: string;
  createdAt: string;
  hasDeliveredKeys?: boolean;
}

interface OrderDetailFull {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string | null;
  subtotalBDT: number;
  discountBDT: number;
  totalBDT: number;
  paymentMethod: string;
  senderNumber?: string | null;
  trxId?: string | null;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    productId?: string;
    productName: string;
    variationName: string;
    priceBDT: number;
    quantity: number;
    image?: string;
    deliveryStatus: string;
    fulfillmentType: string;
    deliveredKeys?: Array<{
      id: string;
      productName: string;
      accountType: string;
      warrantyExpiresAt?: string | null;
      isReplacement: boolean;
      deliveredAt: string;
    }>;
    digitalStocks?: Array<{
      id: string;
      status: string;
      type: string;
      batchRef?: string;
      costPriceBDT?: number;
    }>;
  }>;
  deliveredKeys: Array<{
    id: string;
    orderItemId?: string;
    productName: string;
    accountType: string;
    instructions?: string;
    warrantyExpiresAt?: string | null;
    isReplacement: boolean;
    deliveredAt: string;
  }>;
  timelineEvents: Array<{
    id: string;
    status: string;
    actor: string;
    actorEmail?: string | null;
    note?: string | null;
    createdAt: string;
  }>;
  user?: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
    role: string;
    walletBalanceBDT: number;
    createdAt: string;
  } | null;
}

export default function AdminOrdersPage() {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Selected Order for Detail Drawer
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetailFull | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Manual Delivery / Email Dispatch Modal
  const [dispatchOrder, setDispatchOrder] = useState<AdminOrder | OrderDetailFull | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [credentials, setCredentials] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [dispatchModalTab, setDispatchModalTab] = useState<"COMPOSE" | "PREVIEW">("COMPOSE");

  // Cancellation Modal
  const [cancellingOrder, setCancellingOrder] = useState<AdminOrder | OrderDetailFull | null>(null);
  const [cancelReason, setCancelReason] = useState("Invalid TrxID / Payment Not Received");

  // Internal Note Input in Drawer
  const [adminNoteText, setAdminNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Orders from Server-Side API
  const fetchOrders = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("pageSize", String(pageSize));

        if (statusFilter !== "ALL") {
          params.set("deliveryStatus", statusFilter);
        }
        if (paymentFilter !== "ALL") {
          params.set("paymentStatus", paymentFilter);
        }
        if (paymentMethodFilter !== "ALL") {
          params.set("paymentMethod", paymentMethodFilter);
        }
        if (search.trim()) {
          params.set("search", search.trim());
        }

        const res = await fetch(`/api/orders?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.orders) {
            setOrders(data.orders);
            if (data.pagination) {
              setTotalOrders(data.pagination.total);
              setTotalPages(data.pagination.totalPages || 1);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [currentPage, pageSize, statusFilter, paymentFilter, paymentMethodFilter, search]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Periodic Sensible Refresh (30s)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Fetch Full Order Details for Drawer
  const openOrderDetail = async (orderNumberOrId: string) => {
    setSelectedOrderNumber(orderNumberOrId);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/orders?orderId=${encodeURIComponent(orderNumberOrId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setOrderDetail(data.order);
        }
      }
    } catch (err) {
      showToast("অর্ডার ডিটেইল লোড করা যায়নি", "error");
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeOrderDetail = () => {
    setSelectedOrderNumber(null);
    setOrderDetail(null);
    setAdminNoteText("");
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Instant Auto-Fulfillment Trigger
  const handleAutoFulfill = async (orderId: string) => {
    try {
      const res = await fetch("/api/admin/orders/auto-fulfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "অর্ডার সফলভাবে অটো-ডেলিভারি হয়েছে!", "success");
        fetchOrders(true);
        if (selectedOrderNumber) {
          openOrderDetail(selectedOrderNumber);
        }
      } else {
        showToast(data.message || data.error || "স্টক পুলে পর্যাপ্ত কি পাওয়া যায়নি। ম্যানুয়ালি ডেলিভার করুন।", "error");
      }
    } catch {
      showToast("সার্ভার এরর। আবার চেষ্টা করুন।", "error");
    }
  };

  // Open Manual Dispatch Modal
  const handleOpenDispatchModal = (order: AdminOrder | OrderDetailFull) => {
    setDispatchOrder(order);
    setDispatchModalTab("COMPOSE");
    setEmailTo(order.customerEmail);
    const summary = order.items.map((it) => `${it.productName} (${it.variationName})`).join(", ");
    setEmailSubject(`Your AI Haat Delivery: ${summary} (Order #${order.orderNumber || order.id})`);
    setCredentials(
      `Email: ${order.customerEmail.split("@")[0]}@access.aihaat.net\nPassword: Pass${Math.floor(
        1000 + Math.random() * 9000
      )}!\nProfile PIN: ${Math.floor(1000 + Math.random() * 9000)}`
    );
    setDownloadUrl("");
    setInstructions("Log in using the credentials above. Do not change recovery or account settings. Full replacement warranty active.");
  };

  // Dispatch Email & Mark Delivered
  const handleSendDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchOrder) return;
    if (!credentials.trim() && !downloadUrl.trim()) {
      showToast("ক্রেডেনশিয়াল অথবা ডাউনলোড লিংক প্রদান করুন।", "error");
      return;
    }

    setIsSending(true);
    try {
      const orderNum = dispatchOrder.orderNumber || dispatchOrder.id;
      const prodSummary = dispatchOrder.items.map((it) => `${it.productName} (${it.variationName})`).join(", ");

      // Send Delivery Email via API
      await fetch("/api/admin/send-delivery-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: dispatchOrder.customerName,
          customerEmail: emailTo,
          orderId: orderNum,
          productName: prodSummary,
          variationName: dispatchOrder.items[0]?.variationName || "Standard",
          credentials,
          downloadUrl: downloadUrl.trim() || null,
          instructions,
          subject: emailSubject,
        }),
      });

      // Update Order Status in DB
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNum,
          deliveryStatus: "DELIVERED",
          paymentStatus: "VERIFIED",
          credentialsDelivered: credentials,
          deliveryInstructions: instructions,
          downloadUrl: downloadUrl.trim() || null,
        }),
      });

      showToast(`Delivery email sent to ${emailTo}! Order marked as Delivered.`, "success");
      setDispatchOrder(null);
      fetchOrders(true);
      if (selectedOrderNumber) {
        openOrderDetail(selectedOrderNumber);
      }
    } catch {
      showToast("ডেলিভারি ইমেইল পাঠাতে ব্যর্থ হয়েছে।", "error");
    } finally {
      setIsSending(false);
    }
  };

  // Confirm Cancellation
  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    const orderNum = cancellingOrder.orderNumber || cancellingOrder.id;

    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNum,
          deliveryStatus: "CANCELLED",
          paymentStatus: "FAILED",
          cancelReason,
        }),
      });

      if (res.ok) {
        showToast(`Order #${orderNum} cancelled.`, "info");
        setCancellingOrder(null);
        fetchOrders(true);
        if (selectedOrderNumber) {
          openOrderDetail(selectedOrderNumber);
        }
      }
    } catch {
      showToast("অর্ডার বাতিল করতে সমস্যা হয়েছে", "error");
    }
  };

  // Reopen Order
  const handleReopenOrder = async (orderNum: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNum,
          deliveryStatus: "PROCESSING",
        }),
      });
      if (res.ok) {
        showToast(`Order #${orderNum} moved back to Processing!`, "success");
        fetchOrders(true);
        if (selectedOrderNumber) {
          openOrderDetail(selectedOrderNumber);
        }
      }
    } catch {
      showToast("অর্ডার রিওপেন করতে সমস্যা হয়েছে", "error");
    }
  };

  // Add Internal Admin Note
  const handleAddAdminNote = async () => {
    if (!adminNoteText.trim() || !selectedOrderNumber) return;
    setIsSavingNote(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: selectedOrderNumber,
          adminNote: adminNoteText.trim(),
        }),
      });

      if (res.ok) {
        showToast("এডমিন নোট যুক্ত হয়েছে।", "success");
        setAdminNoteText("");
        openOrderDetail(selectedOrderNumber);
      }
    } catch {
      showToast("নোট সেভ করতে সমস্যা হয়েছে", "error");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Safe Export Orders to CSV (Zero secrets)
  const handleExportCSV = () => {
    if (orders.length === 0) {
      showToast("এক্সপোর্ট করার জন্য কোনো অর্ডার পাওয়া যায়নি।", "error");
      return;
    }

    const headers = [
      "Order Number",
      "Created At",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Products Summary",
      "Total (BDT)",
      "Payment Method",
      "TrxID",
      "Payment Status",
      "Delivery Status",
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.createdAt}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerEmail}"`,
      `"${o.customerPhone}"`,
      `"${o.items.map((it) => `${it.productName} (${it.variationName}) x${it.quantity}`).join("; ").replace(/"/g, '""')}"`,
      o.totalBDT,
      `"${o.paymentMethod}"`,
      `"${o.trxId || "N/A"}"`,
      `"${o.paymentStatus}"`,
      `"${o.deliveryStatus}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI_Haat_Orders_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("অর্ডার ডাটা CSV হিসেবে সফলভাবে এক্সপোর্ট হয়েছে!", "success");
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-20">
      
      {/* Header & Global Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Operations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Orders Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage multi-item purchases, digital instant dispatch, warranty tracking, and customer communications.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Export current order list to CSV without sensitive credentials"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => fetchOrders()}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh order queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Advanced Search */}
      <div className="space-y-4">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "ORDER_PLACED", label: "Placed / Pending Delivery" },
            { id: "PROCESSING", label: "Processing" },
            { id: "DELIVERED", label: "Delivered" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-[#FC5C03] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Secondary Filter Dropdowns */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, customer, email, phone, TrxID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#FC5C03] transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            {/* Payment Status Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">Payment: All</option>
              <option value="VERIFIED">Verified (Paid)</option>
              <option value="PENDING">Pending Payment</option>
              <option value="FAILED">Failed</option>
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">Gateway: All</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="wallet">Wallet</option>
            </select>

            <div className="text-xs font-semibold text-slate-500 hidden lg:block">
              Showing <strong className="text-slate-900">{orders.length}</strong> of{" "}
              <strong className="text-slate-900">{totalOrders}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table & Priority View */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        
        {/* Mobile View: Responsive Stacked Cards (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {orders.length > 0 ? (
            orders.map((order) => {
              const itemsCount = order.items.reduce((acc, it) => acc + (it.quantity || 1), 0);
              const firstItem = order.items[0];
              const additionalCount = order.items.length - 1;

              return (
                <div
                  key={order.id}
                  className="p-4 space-y-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => openOrderDetail(order.orderNumber || order.id)}
                >
                  {/* Top Bar: Order ID + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openOrderDetail(order.orderNumber || order.id)}
                        className="font-mono font-bold text-sm text-slate-900 hover:text-[#FC5C03]"
                      >
                        #{order.orderNumber || order.id}
                      </button>
                      <button
                        onClick={() => handleCopy(order.id, order.orderNumber || order.id)}
                        className="text-slate-400 hover:text-slate-800 p-1"
                        title="Copy Order ID"
                      >
                        {copiedId === order.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        order.deliveryStatus === "Delivered" || order.deliveryStatus === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : order.deliveryStatus === "Cancelled" || order.deliveryStatus === "CANCELLED"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : order.deliveryStatus === "Processing" || order.deliveryStatus === "PROCESSING"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      <span>{order.deliveryStatus}</span>
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <strong className="text-slate-900 font-bold block">{order.customerName}</strong>
                      <span className="text-slate-500 font-mono text-[11px]">{order.customerPhone}</span>
                    </div>

                    {order.customerPhone && (
                      <a
                        href={`https://wa.me/88${order.customerPhone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold inline-flex items-center gap-1 text-[11px]"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* Product Summary & Total */}
                  <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-800 line-clamp-1">
                        {firstItem ? `${firstItem.productName} (${firstItem.variationName})` : "Digital Product"}
                      </span>
                      <strong className="text-slate-900 font-black text-sm shrink-0">
                        {formatPrice(order.totalBDT)}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {order.paymentMethod.toUpperCase()} • Trx: <strong className="font-mono text-[#FC5C03]">{order.trxId || "N/A"}</strong>
                      </span>
                      {additionalCount > 0 && (
                        <span className="text-blue-600 font-bold">+{additionalCount} more items</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    {order.deliveryStatus !== "Delivered" && order.deliveryStatus !== "DELIVERED" && order.deliveryStatus !== "Cancelled" && order.deliveryStatus !== "CANCELLED" && (
                      <>
                        <button
                          onClick={() => handleAutoFulfill(order.orderNumber || order.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Auto</span>
                        </button>

                        <button
                          onClick={() => handleOpenDispatchModal(order)}
                          className="px-3 py-1.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => openOrderDetail(order.orderNumber || order.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700 text-xs">No orders matching criteria</p>
            </div>
          )}
        </div>

        {/* Desktop View: Full Data Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-4 px-5">Order ID</th>
                <th className="py-4 px-5">Customer Details</th>
                <th className="py-4 px-5">Products & Multi-Items</th>
                <th className="py-4 px-5">Payment & TrxID</th>
                <th className="py-4 px-5">Total</th>
                <th className="py-4 px-5">Delivery Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.length > 0 ? (
                orders.map((order) => {
                  const itemsCount = order.items.reduce((acc, it) => acc + (it.quantity || 1), 0);
                  const firstItem = order.items[0];
                  const additionalCount = order.items.length - 1;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => openOrderDetail(order.orderNumber || order.id)}
                    >
                      {/* Order ID & Created */}
                      <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openOrderDetail(order.orderNumber || order.id)}
                            className="font-mono font-bold text-sm text-slate-900 hover:text-[#FC5C03] transition-colors"
                          >
                            {order.orderNumber || order.id}
                          </button>
                          <button
                            onClick={() => handleCopy(order.id, order.orderNumber || order.id)}
                            className="text-slate-400 hover:text-slate-800 cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">{order.date}</span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                        <span className="font-bold text-sm text-slate-900 block truncate max-w-[180px]">
                          {order.customerName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono">{order.customerPhone}</span>
                          {order.customerPhone && (
                            <a
                              href={`https://wa.me/88${order.customerPhone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1 text-[11px]"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WA</span>
                            </a>
                          )}
                        </div>
                        <span className="text-[10.5px] text-slate-400 block truncate max-w-[180px]">
                          {order.customerEmail}
                        </span>
                      </td>

                      {/* Products Summary */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-xs text-slate-900 block truncate max-w-[240px]">
                            {firstItem ? `${firstItem.productName} (${firstItem.variationName})` : "Digital Product"}
                          </span>
                          {additionalCount > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                              + {additionalCount} more items ({itemsCount} total)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800 uppercase">
                            {order.paymentMethod}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase ${
                              order.paymentStatus === "Completed" || order.paymentStatus === "VERIFIED"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.paymentStatus === "Failed" || order.paymentStatus === "FAILED"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-[#FC5C03] block mt-0.5">
                          TrxID: {order.trxId || "N/A"}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-5 font-black text-sm text-slate-900">
                        {formatPrice(order.totalBDT)}
                      </td>

                      {/* Delivery Status */}
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            order.deliveryStatus === "Delivered" || order.deliveryStatus === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : order.deliveryStatus === "Cancelled" || order.deliveryStatus === "CANCELLED"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : order.deliveryStatus === "Processing" || order.deliveryStatus === "PROCESSING"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              order.deliveryStatus === "Delivered" || order.deliveryStatus === "DELIVERED"
                                ? "bg-emerald-500"
                                : order.deliveryStatus === "Cancelled" || order.deliveryStatus === "CANCELLED"
                                ? "bg-red-500"
                                : order.deliveryStatus === "Processing" || order.deliveryStatus === "PROCESSING"
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span>{order.deliveryStatus}</span>
                        </span>
                      </td>

                      {/* Action Column */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {order.deliveryStatus !== "Delivered" && order.deliveryStatus !== "DELIVERED" && order.deliveryStatus !== "Cancelled" && order.deliveryStatus !== "CANCELLED" && (
                            <>
                              <button
                                onClick={() => handleAutoFulfill(order.orderNumber || order.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="Attempt instant automatic fulfillment from digital stock pool"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Auto</span>
                              </button>

                              <button
                                onClick={() => handleOpenDispatchModal(order)}
                                className="px-2.5 py-1.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="Open Manual Dispatch & Email Compose"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Send</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => openOrderDetail(order.orderNumber || order.id)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700 text-sm">No orders matching criteria</p>
                      <p className="text-xs text-slate-400">Adjust filters or search parameters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-semibold text-slate-500">
            Page <strong className="text-slate-900">{currentPage}</strong> of{" "}
            <strong className="text-slate-900">{totalPages}</strong> ({totalOrders} total orders)
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-hidden"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FULL ORDER DETAIL DRAWER / MODAL */}
      {selectedOrderNumber && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 font-mono">
                      Order #{selectedOrderNumber}
                    </h3>
                    <button
                      onClick={() => handleCopy(selectedOrderNumber, selectedOrderNumber)}
                      className="text-slate-400 hover:text-slate-800 cursor-pointer"
                      title="Copy"
                    >
                      {copiedId === selectedOrderNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {orderDetail?.createdAt ? new Date(orderDetail.createdAt).toLocaleString() : "Loading..."}
                  </span>
                </div>
              </div>

              <button
                onClick={closeOrderDetail}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDetail || !orderDetail ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#FC5C03]" />
                  <span className="text-xs font-semibold">অর্ডার ডিটেইল লোড হচ্ছে...</span>
                </div>
              ) : (
                <>
                  {/* Status & Financial Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Delivery</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          orderDetail.deliveryStatus === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : orderDetail.deliveryStatus === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {orderDetail.deliveryStatus}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block mb-1">Payment</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          orderDetail.paymentStatus === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : orderDetail.paymentStatus === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {orderDetail.paymentStatus}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">Method</span>
                      <span className="font-bold text-slate-900 uppercase">{orderDetail.paymentMethod}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Trx: {orderDetail.trxId || "N/A"}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">Total Paid</span>
                      <span className="text-base font-black text-slate-900">{formatPrice(orderDetail.totalBDT)}</span>
                      {orderDetail.discountBDT > 0 && (
                        <span className="text-[10px] text-emerald-600 block">Saved ৳{orderDetail.discountBDT}</span>
                      )}
                    </div>
                  </div>

                  {/* Customer Information Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Customer Profile</span>
                      </h4>
                      {orderDetail.customerPhone && (
                        <a
                          href={`https://wa.me/88${orderDetail.customerPhone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Customer</span>
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block">Customer Name</span>
                        <strong className="text-slate-900 font-semibold">{orderDetail.customerName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Email Address</span>
                        <strong className="text-slate-900 font-semibold">{orderDetail.customerEmail}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Phone Number</span>
                        <strong className="text-slate-900 font-mono">{orderDetail.customerPhone}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Itemized Order Items */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Layers className="w-4 h-4 text-slate-500" />
                      <span>Purchased Items ({orderDetail.items.length})</span>
                    </h4>

                    <div className="space-y-3">
                      {orderDetail.items.map((it) => (
                        <div
                          key={it.id}
                          className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{it.productName}</span>
                            <span className="text-slate-500 block">
                              Plan: <b>{it.variationName}</b> • Qty: <b>{it.quantity}</b> • Type: <b>{it.fulfillmentType}</b>
                            </span>
                            {it.deliveredKeys && it.deliveredKeys.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{it.deliveredKeys.length} digital key(s) delivered</span>
                              </span>
                            )}
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-black text-slate-900 block">
                              {formatPrice(it.priceBDT * it.quantity)}
                            </span>
                            <span className="text-[10.5px] text-slate-400">
                              (৳{it.priceBDT} each)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivered Digital Credentials History */}
                  {orderDetail.deliveredKeys && orderDetail.deliveredKeys.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                        <KeyRound className="w-4 h-4 text-emerald-600" />
                        <span>Issued Digital Credentials ({orderDetail.deliveredKeys.length})</span>
                      </h4>

                      <div className="space-y-2">
                        {orderDetail.deliveredKeys.map((k) => (
                          <div key={k.id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-900">{k.productName} ({k.accountType})</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Delivered: {new Date(k.deliveredAt).toLocaleString()}
                              </span>
                            </div>
                            {k.warrantyExpiresAt && (
                              <span className="text-[10.5px] text-slate-500 block mt-0.5">
                                Warranty valid until: {new Date(k.warrantyExpiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Timeline Events */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Order Timeline & Event History</span>
                    </h4>

                    {orderDetail.timelineEvents && orderDetail.timelineEvents.length > 0 ? (
                      <div className="space-y-2.5">
                        {orderDetail.timelineEvents.map((ev) => (
                          <div key={ev.id} className="flex items-start gap-2.5 text-xs">
                            <div className="w-2 h-2 rounded-full bg-[#FC5C03] mt-1.5 shrink-0" />
                            <div>
                              <p className="text-slate-800 font-semibold">{ev.note || ev.status}</p>
                              <span className="text-[10px] text-slate-400">
                                {ev.actor} ({ev.actorEmail || "System"}) • {new Date(ev.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No previous status timeline logged.</p>
                    )}
                  </div>

                  {/* Internal Admin Notes */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                      <Edit3 className="w-4 h-4 text-slate-500" />
                      <span>Internal Admin Notes (Never shown to customer)</span>
                    </h4>

                    {orderDetail.notes && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap font-mono">
                        {orderDetail.notes}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add internal note..."
                        value={adminNoteText}
                        onChange={(e) => setAdminNoteText(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                      />
                      <button
                        onClick={handleAddAdminNote}
                        disabled={isSavingNote || !adminNoteText.trim()}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        {isSavingNote ? "Saving..." : "Add Note"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Drawer Actions Footer */}
            {orderDetail && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {orderDetail.deliveryStatus === "CANCELLED" ? (
                    <button
                      onClick={() => handleReopenOrder(orderDetail.orderNumber || orderDetail.id)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reopen Order</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCancellingOrder(orderDetail)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {orderDetail.deliveryStatus !== "DELIVERED" && orderDetail.deliveryStatus !== "CANCELLED" && (
                    <>
                      <button
                        onClick={() => handleAutoFulfill(orderDetail.orderNumber || orderDetail.id)}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Auto-Deliver Pool</span>
                      </button>

                      <button
                        onClick={() => handleOpenDispatchModal(orderDetail)}
                        className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Manual Email Delivery</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MANUAL DISPATCH & EMAIL COMPOSER MODAL */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
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
                      delivery@aihaat.shop
                    </span>
                    <span className="text-xs text-slate-400">• Order #{dispatchOrder.orderNumber || dispatchOrder.id}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDispatchOrder(null)}
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
                  onClick={() => setDispatchModalTab("COMPOSE")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    dispatchModalTab === "COMPOSE"
                      ? "bg-white text-[#FC5C03] shadow-xs"
                      : "text-slate-600 hover:text-black"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Email Form</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDispatchModalTab("PREVIEW")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    dispatchModalTab === "PREVIEW"
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

            {/* Form vs Preview */}
            {dispatchModalTab === "COMPOSE" ? (
              <form onSubmit={handleSendDelivery} className="space-y-4">
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

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800 block">
                    Account Credentials / License Key *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={credentials}
                    onChange={(e) => setCredentials(e.target.value)}
                    placeholder="Email: ...&#10;Password: ...&#10;PIN: ..."
                    className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-sm rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#FC5C03] leading-relaxed"
                  />
                </div>

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
                      placeholder="https://drive.google.com/... or direct download link"
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-800 block">
                    Usage Instructions & Warranty Guidelines
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Log in with PIN lock. Full 30 days replacement warranty."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-[#FC5C03]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDispatchOrder(null)}
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
                        <span>Send Delivery Email</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner bg-slate-100 p-2 max-h-[500px] overflow-y-auto">
                  <iframe
                    title="HTML Email Preview"
                    srcDoc={generateDeliveryHtml({
                      customerName: dispatchOrder.customerName,
                      customerEmail: emailTo,
                      orderId: dispatchOrder.orderNumber || dispatchOrder.id,
                      productName: dispatchOrder.items.map((it) => it.productName).join(", "),
                      variationName: dispatchOrder.items[0]?.variationName || "Standard",
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
                    onClick={() => setDispatchModalTab("COMPOSE")}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl cursor-pointer"
                  >
                    Back to Edit
                  </button>

                  <button
                    type="button"
                    disabled={isSending}
                    onClick={handleSendDelivery}
                    className="px-8 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Delivery Email</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* CANCEL ORDER CONFIRMATION MODAL */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4">
            
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900">
                Cancel Order #{cancellingOrder.orderNumber || cancellingOrder.id}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Customer: <b>{cancellingOrder.customerName}</b>
              </p>
            </div>

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

    </div>
  );
}
