"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Mail,
  MessageSquare,
  Share2,
} from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useToast } from "@/context/ToastContext";
import { ImageUpload } from "@/components/ImageUpload";
import { Product } from "@/types";

export default function AdminNewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"EMAIL" | "WHATSAPP" | "MESSENGER">("EMAIL");

  const [productType, setProductType] = useState<"SIMPLE" | "VARIANTS">("VARIANTS");
  const [simplePrice, setSimplePrice] = useState("290");
  const [simpleComparePrice, setSimpleComparePrice] = useState("350");

  const [variants, setVariants] = useState<Array<{
    id: string;
    name: string;
    priceBDT: number;
    originalPriceBDT?: number;
    inStock: boolean;
  }>>([
    { id: "v-1", name: "1 Month", priceBDT: 290, originalPriceBDT: 350, inStock: true },
    { id: "v-2", name: "3 Months", priceBDT: 790, originalPriceBDT: 950, inStock: true },
    { id: "v-3", name: "1 Year", priceBDT: 2650, originalPriceBDT: 3500, inStock: true },
  ]);

  const [categories, setCategories] = useState<string[]>([
    "AI Tools",
    "Developer & Coding AI",
    "Design & Creative",
    "Software & PC Keys",
    "VPN & Security",
    "Cloud Storage & Productivity",
    "OTT Platform Subscription",
  ]);
  const [category, setCategory] = useState("AI Tools");
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestProduct, setIsBestProduct] = useState(false);

  const handleApplyPreset = (type: "DURATIONS" | "CREDITS" | "TIERS") => {
    if (type === "DURATIONS") {
      setVariants([
        { id: `d-1`, name: "1 Month", priceBDT: 290, originalPriceBDT: 350, inStock: true },
        { id: `d-2`, name: "3 Months", priceBDT: 790, originalPriceBDT: 950, inStock: true },
        { id: `d-3`, name: "6 Months", priceBDT: 1450, originalPriceBDT: 1800, inStock: true },
        { id: `d-4`, name: "1 Year", priceBDT: 2650, originalPriceBDT: 3500, inStock: true },
      ]);
    } else if (type === "CREDITS") {
      setVariants([
        { id: `c-1`, name: "500 Credits", priceBDT: 390, originalPriceBDT: 490, inStock: true },
        { id: `c-2`, name: "1,500 Credits", priceBDT: 950, originalPriceBDT: 1200, inStock: true },
        { id: `c-3`, name: "5,000 Credits", priceBDT: 2600, originalPriceBDT: 3200, inStock: true },
      ]);
    } else if (type === "TIERS") {
      setVariants([
        { id: `t-1`, name: "Shared Profile", priceBDT: 290, originalPriceBDT: 350, inStock: true },
        { id: `t-2`, name: "Personal Email", priceBDT: 2200, originalPriceBDT: 2600, inStock: true },
        { id: `t-3`, name: "Team Plan", priceBDT: 4500, originalPriceBDT: 5500, inStock: true },
      ]);
    }
  };

  const handleAddVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `v-${Date.now()}`,
        name: `Option ${prev.length + 1}`,
        priceBDT: 490,
        originalPriceBDT: 590,
        inStock: true,
      },
    ]);
  };

  const handleUpdateVariant = (index: number, field: string, value: any) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length === 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Product name is required.", "error");
      return;
    }

    let finalCategory = category;
    if (isAddingCustomCategory && customCategoryName.trim()) {
      finalCategory = customCategoryName.trim();
    }

    let calculatedVariations = variants;
    let minPrice = 290;
    let maxPrice = 290;

    if (productType === "SIMPLE") {
      const p = Number(simplePrice) || 290;
      const cp = Number(simpleComparePrice) || p;
      minPrice = p;
      maxPrice = p;
      calculatedVariations = [
        {
          id: `v-single-${Date.now()}`,
          name: "Standard",
          priceBDT: p,
          originalPriceBDT: cp > p ? cp : undefined,
          inStock,
        },
      ];
    } else {
      minPrice = Math.min(...variants.map((v) => Number(v.priceBDT) || 0));
      maxPrice = Math.max(...variants.map((v) => Number(v.priceBDT) || 0));
    }

    const newProd: Product = {
      id: `p-${Date.now()}`,
      slug: name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"),
      name,
      category: finalCategory,
      categories: [finalCategory],
      image: imageUrl.trim() || "/images/placeholders/aihaat-placeholder.svg",
      rating: 5.0,
      ratingCount: 1,
      viewCount: 100,
      minPriceBDT: minPrice,
      maxPriceBDT: maxPrice,
      deliveryMethod,
      shortDesc: description || "Official subscription.",
      descriptionBangla: description || "অফিসিয়াল সাবস্ক্রিপশন।",
      descriptionEnglish: description || "Official subscription with warranty.",
      features: ["Instant Delivery", "Full Warranty", "24/7 Support"],
      info: {
        deliveryTime: "5 to 15 mins",
        deliveryType:
          deliveryMethod === "WHATSAPP"
            ? "WhatsApp Live Activation"
            : deliveryMethod === "MESSENGER"
            ? "Facebook Messenger Live Activation"
            : "Email & Digital Vault Dispatch",
        warranty: "Full Warranty",
        validity: calculatedVariations[0]?.name || "1 Month",
        deviceSupport: "All Devices",
      },
      reviews: [],
      variations: calculatedVariations.map((v, i) => ({
        id: v.id || `v-${i}`,
        name: v.name,
        priceBDT: Number(v.priceBDT) || 0,
        originalPriceBDT: Number(v.originalPriceBDT) || undefined,
        description: "",
        inStock: v.inStock,
      })),
      inStock,
      isFeatured,
      isBestProduct,
      isBestSelling: isBestProduct,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProd),
      });

      if (res.ok) {
        showToast("Product added to database successfully!", "success");
        router.push("/admin/products");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save product", "error");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              New Product
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Add a new digital subscription to your catalog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSaveProduct}
            className="px-7 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Product
          </button>
        </div>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSaveProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* General Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900">General Information</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-800 block mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Claude 3.5 Sonnet Pro"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-hidden focus:border-[#FC5C03]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-800 block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a brief overview of features, warranty, and delivery..."
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-[#FC5C03] leading-relaxed"
                />
              </div>

              <div>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  label="Product Image"
                  description="Upload product logo or banner from your device (PNG, JPG, WebP, SVG)"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Variations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Pricing & Options</h3>
              
              <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setProductType("SIMPLE")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    productType === "SIMPLE" ? "bg-white text-[#FC5C03] shadow-xs" : "text-slate-600"
                  }`}
                >
                  Single Price
                </button>
                <button
                  type="button"
                  onClick={() => setProductType("VARIANTS")}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    productType === "VARIANTS" ? "bg-white text-[#FC5C03] shadow-xs" : "text-slate-600"
                  }`}
                >
                  Multiple Plans
                </button>
              </div>
            </div>

            {productType === "SIMPLE" ? (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-sm font-bold text-slate-800 block mb-1">Price (৳) *</label>
                  <input
                    type="number"
                    required
                    value={simplePrice}
                    onChange={(e) => setSimplePrice(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base font-bold text-[#FC5C03]"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-800 block mb-1">Compare Price (৳)</label>
                  <input
                    type="number"
                    value={simpleComparePrice}
                    onChange={(e) => setSimpleComparePrice(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base text-slate-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                
                {/* Presets */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("DURATIONS")}
                    className="px-3.5 py-1.5 bg-orange-50 text-[#FC5C03] text-xs font-bold rounded-lg hover:bg-orange-100 cursor-pointer"
                  >
                    1M / 3M / 6M / 1Y
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("CREDITS")}
                    className="px-3.5 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 cursor-pointer"
                  >
                    Credits
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("TIERS")}
                    className="px-3.5 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg hover:bg-purple-100 cursor-pointer"
                  >
                    Tiers
                  </button>
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold text-xs">
                      <tr>
                        <th className="py-3 px-4">Plan Name</th>
                        <th className="py-3 px-4 w-36">Price (৳)</th>
                        <th className="py-3 px-4 w-32">Regular (৳)</th>
                        <th className="py-3 px-4 w-28">Stock</th>
                        <th className="py-3 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {variants.map((v, i) => (
                        <tr key={v.id || i} className="hover:bg-slate-50/70">
                          <td className="p-3">
                            <input
                              type="text"
                              required
                              value={v.name}
                              onChange={(e) => handleUpdateVariant(i, "name", e.target.value)}
                              className="w-full px-3 py-2 bg-transparent focus:bg-white border border-transparent focus:border-[#FC5C03] rounded-lg text-sm font-bold text-slate-900"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              required
                              min="1"
                              value={v.priceBDT}
                              onChange={(e) => handleUpdateVariant(i, "priceBDT", Number(e.target.value))}
                              className="w-full px-3 py-2 bg-transparent focus:bg-white border border-transparent focus:border-[#FC5C03] rounded-lg text-sm font-bold text-[#FC5C03]"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="0"
                              value={v.originalPriceBDT || ""}
                              onChange={(e) => handleUpdateVariant(i, "originalPriceBDT", Number(e.target.value))}
                              className="w-full px-3 py-2 bg-transparent focus:bg-white border border-transparent focus:border-[#FC5C03] rounded-lg text-sm text-slate-400"
                            />
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleUpdateVariant(i, "inStock", !v.inStock)}
                              className={`w-full py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                v.inStock ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {v.inStock ? "In Stock" : "Sold Out"}
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(i)}
                              className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleAddVariantRow}
                      className="text-sm font-bold text-[#FC5C03] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Another Option</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Delivery Method Selector (Email vs WhatsApp vs Messenger) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Delivery Method
            </h3>

            <div className="space-y-2.5">
              
              {/* 1. Email & Vault */}
              <label
                onClick={() => setDeliveryMethod("EMAIL")}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  deliveryMethod === "EMAIL"
                    ? "border-[#FC5C03] bg-[#FFF2E8]"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === "EMAIL"}
                  onChange={() => setDeliveryMethod("EMAIL")}
                  className="mt-1 text-[#FC5C03] focus:ring-0"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-[#FC5C03]" />
                    <span>Email & Vault Dispatch</span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    ID/Pass, APK file, or Key sent via Email & saved to User Vault.
                  </span>
                </div>
              </label>

              {/* 2. Contact WhatsApp */}
              <label
                onClick={() => setDeliveryMethod("WHATSAPP")}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  deliveryMethod === "WHATSAPP"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === "WHATSAPP"}
                  onChange={() => setDeliveryMethod("WHATSAPP")}
                  className="mt-1 text-emerald-600 focus:ring-0"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Contact WhatsApp</span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Customer is prompted to message your WhatsApp after payment.
                  </span>
                </div>
              </label>

              {/* 3. Contact Messenger */}
              <label
                onClick={() => setDeliveryMethod("MESSENGER")}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  deliveryMethod === "MESSENGER"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === "MESSENGER"}
                  onChange={() => setDeliveryMethod("MESSENGER")}
                  className="mt-1 text-blue-600 focus:ring-0"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>Contact Facebook Messenger</span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Customer is prompted to message your Facebook Messenger page.
                  </span>
                </div>
              </label>

            </div>
          </div>

          {/* Organization & Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Organization
            </h3>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-slate-800">Category</label>
                <button
                  type="button"
                  onClick={() => setIsAddingCustomCategory(!isAddingCustomCategory)}
                  className="text-xs font-bold text-[#FC5C03] hover:underline cursor-pointer"
                >
                  {isAddingCustomCategory ? "Existing" : "+ Custom"}
                </button>
              </div>

              {!isAddingCustomCategory ? (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:border-[#FC5C03]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required={isAddingCustomCategory}
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="Type category..."
                  className="w-full px-4 py-3 bg-white border border-[#FC5C03] rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden"
                />
              )}
            </div>

            {/* In Stock Switch */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-800 block">In Stock Status</span>
                <span className="text-xs text-slate-400">স্টক আছে কিনা নির্ধারণ করুন</span>
              </div>
              <button
                type="button"
                onClick={() => setInStock(!inStock)}
                className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                  inStock ? "bg-[#FC5C03]" : "bg-slate-200"
                }`}
              >
                <span className={`w-4.5 h-4.5 bg-white rounded-full absolute top-1 transition-transform ${
                  inStock ? "right-1" : "left-1"
                }`} />
              </button>
            </div>

            {/* Featured on Home Screen */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-800 block">Featured ⭐</span>
                <span className="text-xs text-slate-400">হোম স্ক্রিনের টপ ৬ ফিচার্ডে দেখাবে</span>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                  isFeatured ? "bg-[#FC5C03]" : "bg-slate-200"
                }`}
              >
                <span className={`w-4.5 h-4.5 bg-white rounded-full absolute top-1 transition-transform ${
                  isFeatured ? "right-1" : "left-1"
                }`} />
              </button>
            </div>

            {/* Best Product / Best Selling */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-slate-800 block">Best Product 🏆</span>
                <span className="text-xs text-slate-400">সেরা প্রোডাক্ট সেকশনে দেখাবে</span>
              </div>
              <button
                type="button"
                onClick={() => setIsBestProduct(!isBestProduct)}
                className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                  isBestProduct ? "bg-amber-500" : "bg-slate-200"
                }`}
              >
                <span className={`w-4.5 h-4.5 bg-white rounded-full absolute top-1 transition-transform ${
                  isBestProduct ? "right-1" : "left-1"
                }`} />
              </button>
            </div>

          </div>

          {/* Action */}
          <div className="space-y-2.5">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Product
            </button>
            <Link
              href="/admin/products"
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors block text-center"
            >
              Discard
            </Link>
          </div>

        </div>

      </form>

    </div>
  );
}
