"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Trash2 } from "@/components/animated-icons/lucide";
import { useToast } from "@/context/ToastContext";

type Item = { productId: string; product: { slug: string; name: string; image: string; minPriceBDT: number; maxPriceBDT: number; salePriceBDT: number | null; inStock: boolean } };

export default function WishlistPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => { fetch("/api/wishlist", { cache: "no-store" }).then((response) => response.json()).then((data) => setItems(data.items || [])).finally(() => setLoading(false)); }, []);

  async function remove(productId: string) {
    const response = await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, { method: "DELETE" });
    if (!response.ok) { showToast("Could not remove item", "error"); return; }
    setItems((current) => current.filter((item) => item.productId !== productId));
  }

  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6"><div className="mb-8 flex items-center gap-3"><Heart className="h-7 w-7 text-[#FC5C03]" /><div><h1 className="text-3xl font-black text-[#1A1D26]">My wishlist</h1><p className="mt-1 text-sm text-slate-500">Save products to compare prices and availability later.</p></div></div>{loading ? <p className="text-sm text-slate-500">Loading wishlist…</p> : items.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><Heart className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-4 font-semibold text-[#1A1D26]">Your wishlist is empty</p><Link href="/shop" className="mt-5 inline-block rounded-xl bg-[#FC5C03] px-5 py-3 text-sm font-bold text-white">Browse products</Link></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article key={item.productId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><Link href={`/product/${item.product.slug}`}><img src={item.product.image} alt={item.product.name} className="h-48 w-full object-contain p-5" /></Link><div className="p-5"><Link href={`/product/${item.product.slug}`} className="font-bold text-[#1A1D26] hover:text-[#FC5C03]">{item.product.name}</Link><p className="mt-2 text-sm text-slate-500">৳{(item.product.salePriceBDT || item.product.minPriceBDT).toLocaleString()}</p><p className="mt-1 text-xs text-slate-500">{item.product.inStock ? "In stock" : "Currently unavailable"}</p><button type="button" onClick={() => remove(item.productId)} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#FC5C03]"><Trash2 className="h-4 w-4" />Remove</button></div></article>)}</div>}</main>;
}
