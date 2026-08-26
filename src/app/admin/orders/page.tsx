"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Search,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  KeyRound,
  Mail,
  Phone,
  Copy,
  Check,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useToast } from "@/context/ToastContext";

export default function AdminOrdersPage() {
  const { formatPrice } = useCurrency();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([
    {
      id: "AH-98214",
      customerName: "Sifat Rahman",
      customerEmail: "sifat.rahman@gmail.com",
      customerPhone: "01711-223344",
      productName: "ChatGPT Plus (1 Month Shared)",
      variationName: "1 Month Shared Profile",
      totalBDT: 290,
      paymentMethod: "bKash",
      senderNumber: "01711-223344",
      trxId: "BL90X84Q",
      status: "PENDING",
      createdAt: "10 মিনিট আগে",
      deliveredKey: null,
    },
    {
      id: "AH-98213",
      customerName: "Tanvir Ahmed",
      customerEmail: "tanvir.ahmed@gmail.com",
      customerPhone: "01822-334455",
      productName: "Canva Pro (1 Year Personal)",
      variationName: "1 Year Personal Email Activation",
      totalBDT: 499,
      paymentMethod: "Nagad",
      senderNumber: "01822-334455",
      trxId: "NG882K19",
      status: "PENDING",
      createdAt: "24 মিনিট আগে",
      deliveredKey: null,
    },
    {
      id: "AH-89211",
      customerName: "Amanullah Sheikh",
      customerEmail: "mdamanullahsheikhapon@gmail.com",
      customerPhone: "01712-345678",
      productName: "ChatGPT Plus (1 Month Shared)",
      variationName: "1 Month Shared Profile",
      totalBDT: 290,
      paymentMethod: "bKash",
      senderNumber: "01712-345678",
      trxId: "BL90X84Q",
      status: "DELIVERED",
      createdAt: "গতকাল 14:15",
      deliveredKey: "Email: user12@gptaccess.net | Pass: SmartGpt2026! | Pin: 4092",
    },
  ]);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<any>(null);
  const [credentials, setCredentials] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isDelivering, setIsDelivering] = useState(false);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      o.trxId.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleOpenDeliveryModal = (order: any) => {
    setSelectedOrderForDelivery(order);
    setCredentials(
      `Email: ${order.customerEmail.split("@")[0]}@account.aihaat.net\nPassword: Pass${Math.floor(
        1000 + Math.random() * 9000
      )}!\nProfile PIN: ${Math.floor(1000 + Math.random() * 9000)}`
    );
    setInstructions("লগইন করে আপনার নির্দিষ্ট প্রোফাইল পিনে প্রবেশ করুন। পাসওয়ার্ড পরিবর্তন নিষিদ্ধ।");
  };

  const handleDeliver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials) {
      showToast("দয়া করে ক্রেডেনশিয়াল বা লাইসেন্স কি প্রদান করুন।", "error");
      return;
    }

    setIsDelivering(true);
    try {
      const res = await fetch("/api/admin/deliver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: selectedOrderForDelivery.id,
          customerName: selectedOrderForDelivery.customerName,
          customerEmail: selectedOrderForDelivery.customerEmail,
          productName: selectedOrderForDelivery.productName,
          accountType: selectedOrderForDelivery.variationName,
          credentials,
          instructions,
        }),
      });

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrderForDelivery.id
            ? { ...o, status: "DELIVERED", deliveredKey: credentials }
            : o
        )
      );

      showToast(`অর্ডার ${selectedOrderForDelivery.id} সফলভাবে ডেলিভারি করা হয়েছে! ইমেইল পাঠানো হয়েছে।`, "success");
      setSelectedOrderForDelivery(null);
      setCredentials("");
    } catch {
      showToast("ডেলিভারি প্রসেস করতে ত্রুটি হয়েছে।", "error");
    } finally {
      setIsDelivering(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white">অর্ডার ও ইনস্ট্যান্ট ডেলিভারি (Orders Queue)</h1>
          <p className="text-xs text-slate-400">অর্ডার ভেরিফাই করুন এবং ১-ক্লিকে কাস্টমারকে ডিজিটাল কি/অ্যাকাউন্ট ডেলিভারি দিন</p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {["ALL", "PENDING", "DELIVERED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === s
                  ? "bg-[#FC5C03] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {s === "ALL" ? "সবগুলো" : s === "PENDING" ? "পেন্ডিং (২)" : "ডেলিভার্ড"}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="অর্ডার নাম্বার, ক্রেতার নাম, ফোন বা TrxID দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FC5C03]"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">অর্ডার আইডি</th>
                <th className="py-3.5 px-4">ক্রেতা ও যোগাযোগ</th>
                <th className="py-3.5 px-4">প্রোডাক্ট ও ভ্যারিয়েশন</th>
                <th className="py-3.5 px-4">পেমেন্ট মেথড ও TrxID</th>
                <th className="py-3.5 px-4">মূল্য</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900/50 transition-colors">
                  
                  {/* Order ID */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-white block">{order.id}</span>
                    <span className="text-[10px] text-slate-500">{order.createdAt}</span>
                  </td>

                  {/* Customer Info */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{order.customerName}</span>
                    <span className="text-[11px] text-slate-400 block font-mono">{order.customerPhone}</span>
                    <span className="text-[10px] text-slate-500">{order.customerEmail}</span>
                  </td>

                  {/* Product */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-200 block">{order.productName}</span>
                    <span className="text-[11px] text-slate-400">{order.variationName}</span>
                  </td>

                  {/* Payment */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-300 block">{order.paymentMethod}</span>
                    <span className="font-mono text-[11px] text-[#FC5C03] bg-[#FC5C03]/10 px-1.5 py-0.5 rounded-md border border-[#FC5C03]/20">
                      {order.trxId}
                    </span>
                  </td>

                  {/* Total */}
                  <td className="py-3.5 px-4 font-black text-white text-sm">
                    ৳{order.totalBDT}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                          : "bg-amber-950 text-amber-400 border border-amber-800/40"
                      }`}
                    >
                      {order.status === "DELIVERED" ? "ডেলিভার্ড" : "পেন্ডিং"}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    {order.status === "PENDING" ? (
                      <button
                        onClick={() => handleOpenDeliveryModal(order)}
                        className="px-3 py-1.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>ডেলিভারি দিন</span>
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>সম্পন্ন</span>
                      </span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deliver Modal */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">
                  ডিজিটাল ডেলিভারি: {selectedOrderForDelivery.id}
                </h3>
                <span className="text-xs text-slate-400">
                  {selectedOrderForDelivery.customerName} ({selectedOrderForDelivery.customerEmail})
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderForDelivery(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDeliver} className="space-y-3.5">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 block">প্রোডাক্ট:</span>
                <span className="font-bold text-white block">
                  {selectedOrderForDelivery.productName} ({selectedOrderForDelivery.variationName})
                </span>
                <span className="text-[11px] text-emerald-400">
                  মূল্য: ৳{selectedOrderForDelivery.totalBDT} | মেথড: {selectedOrderForDelivery.paymentMethod} (TrxID: {selectedOrderForDelivery.trxId})
                </span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  🔐 লগইন ক্রেডেনশিয়াল / লাইসেন্স কি / ইনভাইট লিংক *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Email: ...\nPassword: ...\nProfile PIN: ..."
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  ব্যবহারের নির্দেশিকা (Instructions)
                </label>
                <textarea
                  rows={2}
                  placeholder="ব্যবহারের কোনো বিশেষ নিয়ম থাকলে এখানে লিখুন..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDelivery(null)}
                  className="w-1/3 py-2.5 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-900"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isDelivering}
                  className="w-2/3 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{isDelivering ? "পাঠানো হচ্ছে..." : "কনফার্ম ও ডেলিভারি দিন"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
