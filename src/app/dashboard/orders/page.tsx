"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  KeyRound,
  Search,
  Clock,
  PackageOpen,
  Eye,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Truck,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { SafeImage } from "@/components/SafeImage";

interface OrderItemSummary {
  id?: string;
  productId?: string;
  productName: string;
  variationName: string;
  priceBDT: number;
  quantity: number;
  image?: string;
  deliveryStatus?: string;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  items: OrderItemSummary[];
  productSummary: string;
  totalBDT: number;
  subtotalBDT: number;
  discountBDT: number;
  paymentMethod: string;
  trxId: string;
  paymentStatus: string;
  deliveryStatus: string;
  rawDeliveryStatus: string;
  notes?: string;
  hasDeliveredKeys: boolean;
  date: string;
  createdAt: string;
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const directOrderId = searchParams?.get("orderId") || null;

  const { formatPrice } = useCurrency();
  const { language } = useLanguage();
  const { user } = useAuth();
  const isBn = language === "bn";

  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  const fetchUserOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          const mapped: CustomerOrder[] = data.orders.map((o: any) => {
            const summary =
              Array.isArray(o.items) && o.items.length > 0
                ? o.items.map((it: any) => `${it.productName} (${it.variationName}) × ${it.quantity}`).join(", ")
                : "Digital Subscription";

            return {
              id: o.orderNumber || o.id,
              orderNumber: o.orderNumber || o.id,
              items: o.items || [],
              productSummary: summary,
              totalBDT: o.totalBDT || 0,
              subtotalBDT: o.subtotalBDT || o.totalBDT || 0,
              discountBDT: o.discountBDT || 0,
              paymentMethod: o.paymentMethod || "gateway",
              trxId: o.trxId || "N/A",
              paymentStatus: o.paymentStatus || "Completed",
              deliveryStatus: o.deliveryStatus || "Processing",
              rawDeliveryStatus: o.rawDeliveryStatus || "PROCESSING",
              notes: o.notes,
              hasDeliveredKeys: Boolean(o.hasDeliveredKeys),
              date: o.date || "Recently",
              createdAt: o.createdAt || new Date().toISOString(),
            };
          });

          setOrders(mapped);

          // If direct orderId query parameter was passed, open modal
          if (directOrderId) {
            const found = mapped.find(
              (ord) => ord.id.toLowerCase() === directOrderId.toLowerCase() || ord.orderNumber.toLowerCase() === directOrderId.toLowerCase()
            );
            if (found) setSelectedOrder(found);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load user orders:", e);
    } finally {
      setLoading(false);
    }
  }, [directOrderId]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      filter === "ALL" ||
      (filter === "PROCESSING" && (o.rawDeliveryStatus === "PROCESSING" || o.rawDeliveryStatus === "PREPARING" || o.rawDeliveryStatus === "ORDER_PLACED")) ||
      (filter === "DELIVERED" && o.rawDeliveryStatus === "DELIVERED") ||
      (filter === "CANCELLED" && o.rawDeliveryStatus === "CANCELLED");

    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.productSummary.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-7 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-blue-200">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isBn ? "অর্ডার ট্র্যাকিং ও হিস্টোরি" : "Order History"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#1A1D26] tracking-tight">
            {isBn ? "আমার অর্ডারসমূহ" : "My Orders & Purchases"}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A8190] mt-0.5">
            {isBn
              ? "আপনার সমস্ত কেনাকাটার লাইভ স্ট্যাটাস ও ডিজিটাল লাইসেন্স এক্সেস।"
              : "Track live fulfillment statuses, review invoice summaries, and access purchased keys."}
          </p>
        </div>

        <button
          onClick={fetchUserOrders}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-[#E8E8EE] p-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#7A8190] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isBn ? "অর্ডার আইডি বা প্রোডাক্ট খুঁজুন..." : "Search by order ID or product..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: "ALL", label: isBn ? "সকল" : "All Orders" },
            { id: "PROCESSING", label: isBn ? "চলমান" : "Processing" },
            { id: "DELIVERED", label: isBn ? "ডেলিভার্ড" : "Delivered" },
            { id: "CANCELLED", label: isBn ? "বাতিল" : "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === tab.id
                  ? "bg-[#1A1D26] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isDelivered = order.rawDeliveryStatus === "DELIVERED";
            const isCancelled = order.rawDeliveryStatus === "CANCELLED";

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#E8E8EE] p-5 sm:p-6 shadow-2xs space-y-4 hover:border-[#FC5C03]/40 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-slate-900">
                      #{order.id}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">{order.date}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-semibold uppercase">{order.paymentMethod}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        isDelivered
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isCancelled
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isDelivered ? "bg-emerald-500" : isCancelled ? "bg-red-500" : "bg-amber-500 animate-pulse"
                        }`}
                      />
                      <span>{order.deliveryStatus}</span>
                    </span>
                  </div>
                </div>

                {/* Items Summary & Pricing */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {order.productSummary}
                    </h4>
                    {order.items.length > 1 && (
                      <span className="text-xs text-slate-400 block font-medium">
                        Contains {order.items.length} purchased items
                      </span>
                    )}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-base font-black text-slate-900 block">
                      {formatPrice(order.totalBDT)}
                    </span>
                    {order.discountBDT > 0 && (
                      <span className="text-[10.5px] text-emerald-600 font-bold block">
                        Saved ৳{order.discountBDT} discount
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions row */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {isDelivered && (
                      <Link
                        href="/dashboard/keys"
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 inline-flex items-center gap-1.5 transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{isBn ? "ভল্টে কি দেখুন" : "View Keys in Vault"}</span>
                      </Link>
                    )}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isBn ? "অর্ডার ডিটেইলস" : "Order Details"}</span>
                    </button>
                  </div>

                  <Link
                    href={`https://wa.me/8801700000000?text=${encodeURIComponent(`Hello, I need help with my Order #${order.id}`)}`}
                    target="_blank"
                    className="text-slate-500 hover:text-[#FC5C03] font-semibold inline-flex items-center gap-1 self-start sm:self-auto"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#FC5C03]" />
                    <span>Get Order Support</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300 p-8 shadow-2xs max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <PackageOpen className="w-8 h-8 text-[#FC5C03]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">
              {isBn ? "কোনো অর্ডার পাওয়া যায়নি" : "No Orders Found"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {isBn
                ? "আপনার কেনা ডিজিটাল প্রোডাক্টের ট্র্যাকিং ও হিস্টোরি এখানে দেখতে পাবেন।"
                : "You have no orders matching the selected filter. Browse our store to purchase digital tools."}
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <span>{isBn ? "শপ ব্রাউজ করুন" : "Browse Marketplace"}</span>
          </Link>
        </div>
      )}

      {/* CUSTOMER ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-5 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black text-slate-900">
                  Order #{selectedOrder.id}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    selectedOrder.rawDeliveryStatus === "DELIVERED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {selectedOrder.deliveryStatus}
                </span>
              </div>
              <span className="text-xs text-slate-400 block font-mono">
                Placed on {selectedOrder.date} • {selectedOrder.paymentMethod.toUpperCase()}
              </span>
            </div>

            {/* Itemized Products Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Purchased Items ({selectedOrder.items.length})
              </h4>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      {it.image ? (
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                          <SafeImage src={it.image} alt={it.productName} aspectRatio="1/1" objectFit="contain" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FC5C03] flex items-center justify-center font-bold shrink-0">
                          {idx + 1}
                        </div>
                      )}
                      <div>
                        <strong className="text-slate-900 font-bold text-sm block">{it.productName}</strong>
                        <span className="text-slate-500 font-medium">Plan: {it.variationName} • Qty: {it.quantity}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-900 text-sm block">
                        {formatPrice(it.priceBDT * (it.quantity || 1))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Invoice Breakdown */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">{formatPrice(selectedOrder.subtotalBDT)}</span>
              </div>
              {selectedOrder.discountBDT > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount Applied:</span>
                  <span>- {formatPrice(selectedOrder.discountBDT)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Paid:</span>
                <span className="text-[#FC5C03]">{formatPrice(selectedOrder.totalBDT)}</span>
              </div>
            </div>

            {/* Delivery & Vault Shortcuts */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              {selectedOrder.rawDeliveryStatus === "DELIVERED" ? (
                <Link
                  href="/dashboard/keys"
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Access Credentials in Vault</span>
                </Link>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2 w-full">
                  <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Your order is processing. Credentials will appear in your Vault within 5-15 minutes.</span>
                </div>
              )}

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardOrdersPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
