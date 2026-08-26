"use client";

import React, { useState } from "react";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PRODUCTS as initialProducts } from "@/data/products";
import { SafeImage } from "@/components/SafeImage";
import { useToast } from "@/context/ToastContext";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [productList, setProductList] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // New Product Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("AI Tools");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [isBestProduct, setIsBestProduct] = useState(false);
  const [isBestSelling, setIsBestSelling] = useState(false);
  const [variations, setVariations] = useState([
    { name: "1 Month", price: 290, desc: "Standard" },
  ]);

  const categories = [
    "ALL",
    "AI Tools",
    "Design & Creative",
    "Software & OS",
    "VPN & Security",
    "Streaming & Media",
    "Game Top-Up",
    "Gift Cards",
  ];

  const filtered = productList.filter((p) => {
    const matchCat = categoryFilter === "ALL" || p.category === categoryFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleStock = (id: string) => {
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
    showToast("স্টক স্ট্যাটাস আপডেট হয়েছে।", "success");
  };

  const toggleBestProduct = (id: string) => {
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isBestProduct: !p.isBestProduct } : p))
    );
    showToast("Best Product স্ট্যাটাস আপডেট হয়েছে।", "success");
  };

  const toggleBestSelling = (id: string) => {
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isBestSelling: !p.isBestSelling } : p))
    );
    showToast("Best Selling স্ট্যাটাস আপডেট হয়েছে।", "success");
  };

  const handleDelete = (id: string) => {
    if (confirm("আপনি কি নিশ্চিত এই প্রোডাক্টটি মুছে ফেলতে চান?")) {
      setProductList((prev) => prev.filter((p) => p.id !== id));
      showToast("প্রোডাক্ট মুছে ফেলা হয়েছে।", "success");
    }
  };

  const handleAddVariation = () => {
    setVariations([...variations, { name: "1 Year", price: 990, desc: "Annual" }]);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProd = {
      id: `p-${Date.now()}`,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      category,
      categories: [category],
      image: "/images/placeholders/aihaat-placeholder.svg",
      rating: 5.0,
      ratingCount: 1,
      minPriceBDT: Number(minPrice) || 290,
      maxPriceBDT: Number(maxPrice) || Number(minPrice) || 290,
      shortDesc: shortDesc || "Official subscription with warranty.",
      descriptionBangla: shortDesc || "অফিসিয়াল সাবস্ক্রিপশন এবং ফুল রিপ্লেসমেন্ট ওয়ারেন্টি।",
      descriptionEnglish: "Official high speed subscription.",
      features: ["ইনস্ট্যান্ট ডেলিভারি", "ফুল ওয়ারেন্টি", "২৪/৭ সাপোর্ট"],
      deliveryTime: "৫ থেকে ১৫ মিনিট",
      deliveryType: "ইনস্ট্যান্ট ডেলিভারি",
      warranty: "সম্পূর্ণ মেয়াদের রিপ্লেসমেন্ট ওয়ারেন্টি",
      validity: "১ মাস / ১ বছর",
      deviceSupport: "সকল ডিভাইস",
      variations: variations.map((v, i) => ({
        id: `var-${i}`,
        name: v.name,
        priceBDT: Number(v.price),
        description: v.desc,
        inStock: true,
      })),
      isBestProduct,
      isBestSelling,
      inStock: true,
    };

    setProductList([newProd as any, ...productList]);
    setIsAddModalOpen(false);
    showToast("নতুন প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!", "success");
    setName("");
    setMinPrice("");
    setMaxPrice("");
    setShortDesc("");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white">প্রোডাক্ট ম্যানেজার (Product Catalog) 📦</h1>
          <p className="text-xs text-slate-400">ওয়েবসাইটের সমস্ত প্রোডাক্ট, ভ্যারিয়েশন, দাম এবং স্টক নিয়ন্ত্রণ করুন</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ নতুন প্রোডাক্ট যোগ করুন</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="প্রোডাক্টের নাম দিয়ে সার্চ করুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FC5C03]"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FC5C03]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? "সব ক্যাটাগরি" : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">প্রোডাক্ট</th>
                <th className="py-3.5 px-4">ক্যাটাগরি</th>
                <th className="py-3.5 px-4">দাম রেঞ্জ</th>
                <th className="py-3.5 px-4">ভ্যারিয়েশন</th>
                <th className="py-3.5 px-4">স্টক</th>
                <th className="py-3.5 px-4">ব্যাজ (Badges)</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-900/50 transition-colors">
                  
                  {/* Product Thumbnail & Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
                        <SafeImage
                          src={prod.image}
                          alt={prod.name}
                          aspectRatio="1/1"
                          objectFit="cover"
                          sizes="40px"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-white block">{prod.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">/{prod.slug}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 text-slate-400">{prod.category}</td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-bold text-[#FC5C03]">
                    ৳{prod.minPriceBDT} {prod.maxPriceBDT > prod.minPriceBDT && `- ৳${prod.maxPriceBDT}`}
                  </td>

                  {/* Variations Count */}
                  <td className="py-3.5 px-4 text-slate-400">
                    {prod.variations?.length || 1} টি অপশন
                  </td>

                  {/* Stock Toggle */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleStock(prod.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-colors ${
                        prod.inStock
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                          : "bg-red-950 text-red-400 border border-red-800/40"
                      }`}
                    >
                      {prod.inStock ? "In Stock" : "Stock Out"}
                    </button>
                  </td>

                  {/* Badges Toggles */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleBestProduct(prod.id)}
                        className={`p-1 rounded-md text-[10px] font-bold transition-colors ${
                          prod.isBestProduct
                            ? "bg-[#FC5C03] text-white"
                            : "bg-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                        title="Toggle Best Product"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleBestSelling(prod.id)}
                        className={`p-1 rounded-md text-[10px] font-bold transition-colors ${
                          prod.isBestSelling
                            ? "bg-amber-500 text-black"
                            : "bg-slate-800 text-slate-500 hover:text-slate-300"
                        }`}
                        title="Toggle Best Selling"
                      >
                        <Flame className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">+ নতুন ডিজিটাল প্রোডাক্ট যোগ করুন</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  প্রোডাক্টের নাম *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Claude 3.5 Sonnet Pro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {categories.filter((c) => c !== "ALL").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">শুরু মূল্য (BDT) *</label>
                  <input
                    type="number"
                    required
                    placeholder="290"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  placeholder="অফিসিয়াল প্রিমিয়াম অ্যাক্সেস এবং ফুল রিপ্লেসমেন্ট ওয়ারেন্টি..."
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              {/* Variations */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>ভ্যারিয়েশন ও প্রাইসিং:</span>
                  <button
                    type="button"
                    onClick={handleAddVariation}
                    className="text-[11px] text-[#FC5C03] hover:underline"
                  >
                    + আরও যোগ করুন
                  </button>
                </div>

                {variations.map((v, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => {
                        const copy = [...variations];
                        copy[i].name = e.target.value;
                        setVariations(copy);
                      }}
                      placeholder="প্যাকেজ নাম"
                      className="col-span-7 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => {
                        const copy = [...variations];
                        copy[i].price = Number(e.target.value);
                        setVariations(copy);
                      }}
                      placeholder="৳ মূল্য"
                      className="col-span-5 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                ))}
              </div>

              {/* Badges Toggle */}
              <div className="flex items-center gap-4 pt-1 text-xs text-slate-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestProduct}
                    onChange={(e) => setIsBestProduct(e.target.checked)}
                  />
                  <span>⭐ Best Product</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSelling}
                    onChange={(e) => setIsBestSelling(e.target.checked)}
                  />
                  <span>🔥 Best Selling</span>
                </label>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/3 py-2.5 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-900"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl"
                >
                  সংরক্ষণ করুন (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
