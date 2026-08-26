"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  ExternalLink,
} from "lucide-react";
import { PRODUCTS as initialProducts } from "@/data/products";
import { SafeImage } from "@/components/SafeImage";
import { useToast } from "@/context/ToastContext";
import { Product } from "@/types";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");

  const filtered = productList.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const toggleStock = (id: string) => {
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
    showToast("Stock status updated.", "success");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProductList((prev) => prev.filter((p) => p.id !== id));
      showToast("Product deleted successfully.", "success");
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all products in your store
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="px-5 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Product</span>
        </Link>
      </div>

      {/* Clean Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#FC5C03] transition-all"
          />
        </div>

        <div className="text-sm font-semibold text-slate-500 self-end sm:self-center">
          Total: <strong className="text-slate-900">{productList.length}</strong> products
        </div>
      </div>

      {/* Clean Spacious Table (Reference Style) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-5 w-20">Image</th>
                <th className="py-4 px-5">Product Name</th>
                <th className="py-4 px-5">SKU / Delivery</th>
                <th className="py-4 px-5">Price</th>
                <th className="py-4 px-5">Stock</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Image */}
                  <td className="py-4 px-5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 shrink-0">
                      <SafeImage
                        src={prod.image}
                        alt={prod.name}
                        aspectRatio="1/1"
                        objectFit="cover"
                        sizes="48px"
                      />
                    </div>
                  </td>

                  {/* Product Name & Category */}
                  <td className="py-4 px-5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-slate-900">{prod.name}</span>
                        {prod.variations && prod.variations.length > 1 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold border border-slate-200">
                            {prod.variations.length} variants
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 block font-normal">{prod.category}</span>
                    </div>
                  </td>

                  {/* SKU / Delivery */}
                  <td className="py-4 px-5 text-xs text-slate-500 font-mono">
                    {prod.deliveryMethod === "WHATSAPP" ? (
                      <span className="text-emerald-600 font-sans font-bold">WhatsApp Live</span>
                    ) : (
                      <span>AI-{prod.slug.substring(0, 8).toUpperCase()}</span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="py-4 px-5">
                    <div className="space-y-0.5">
                      <span className="font-bold text-base text-slate-900 block">
                        ৳{prod.minPriceBDT}
                      </span>
                      {prod.maxPriceBDT > prod.minPriceBDT ? (
                        <span className="text-xs text-slate-400 block">
                          Up to ৳{prod.maxPriceBDT}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 line-through block">
                          ৳{Math.round(prod.minPriceBDT * 1.25)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="py-4 px-5">
                    <button
                      onClick={() => toggleStock(prod.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        prod.inStock !== false
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {prod.inStock !== false ? "In Stock" : "Sold Out"}
                    </button>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">
                    <span className="text-sm font-semibold text-emerald-600">
                      {prod.inStock !== false ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/edit/${prod.id}`}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
