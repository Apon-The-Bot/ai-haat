"use client";

import { useEffect, useMemo, useState } from "react";
import { Calculator, Plus, RefreshCw, Trash2 } from "lucide-react";

type Variation = { id: string; name: string; priceBDT: number; inStock: boolean };
type Product = { id: string; slug: string; name: string; priceBDT: number; inStock: boolean; variations: Variation[] };
type CartLine = { id: string; productId: string; variationId: string; quantity: number };
type Quote = { subtotalBDT: number; discountBDT: number; couponDiscountBDT: number; volumeDiscountBDT: number; bundleDiscountBDT: number; totalBDT: number; costPriceTotalBDT: number; grossProfitBDT: number; grossMarginPct: number; couponCode: string | null; appliedBundleName: string | null; items: Array<{ productName: string; variationName: string; quantity: number; unitPriceBDT: number; lineTotalBDT: number }> };

const money = (value: number) => `৳${value.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CouponSimulatorPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariation, setSelectedVariation] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetch("/api/admin/coupons/simulator")
      .then((response) => response.json())
      .then((data) => { if (data.success) setProducts(data.products); else setError(data.error); })
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false));
  }, []);

  const product = products.find((item) => item.id === selectedProduct);
  const variations = product?.variations || [];
  const availableProducts = useMemo(() => products.filter((item) => item.inStock), [products]);

  const addLine = () => {
    if (!selectedProduct) return;
    const variationId = selectedVariation || product?.variations[0]?.id || "default";
    setCart((current) => {
      const existing = current.find((line) => line.productId === selectedProduct && line.variationId === variationId);
      if (existing) return current.map((line) => line === existing ? { ...line, quantity: Math.min(100, line.quantity + quantity) } : line);
      return [...current, { id: `${selectedProduct}-${variationId}-${Date.now()}`, productId: selectedProduct, variationId, quantity }];
    });
    setQuantity(1);
  };

  const calculate = async () => {
    setError("");
    setCalculating(true);
    try {
      const response = await fetch("/api/admin/coupons/simulator", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart, couponCode }) });
      const data = await response.json();
      if (!response.ok || !data.success) { setQuote(null); setError(data.error || "Quote could not be calculated."); } else setQuote(data.quote);
    } catch { setQuote(null); setError("Quote could not be calculated."); } finally { setCalculating(false); }
  };

  return (
    <main className="space-y-6 pb-16">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-600"><Calculator className="h-4 w-4" /> Coupon simulator</div><h1 className="text-3xl font-black tracking-tight text-slate-900">Campaign margin simulator</h1><p className="mt-1 text-sm text-slate-500">Test a sample cart against the live pricing and coupon rules. Nothing is saved or consumed.</p></div>
        <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"><RefreshCw className="h-4 w-4" /> Refresh catalog</button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Sample cart</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_100px_auto]">
            <select value={selectedProduct} onChange={(event) => { setSelectedProduct(event.target.value); setSelectedVariation(""); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" disabled={loading}><option value="">Choose product</option>{availableProducts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <select value={selectedVariation} onChange={(event) => setSelectedVariation(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" disabled={!product || variations.length === 0}><option value="">Default variation</option>{variations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <input type="number" min={1} max={100} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(100, Number(event.target.value) || 1)))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            <button onClick={addLine} disabled={!selectedProduct} className="inline-flex items-center justify-center gap-1 rounded-xl bg-orange-500 px-3 py-2 text-sm font-bold text-white disabled:opacity-40"><Plus className="h-4 w-4" /> Add</button>
          </div>
          <div className="mt-5 space-y-2">{cart.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Add one or more products to begin.</p> : cart.map((line) => { const item = products.find((p) => p.id === line.productId); const variation = item?.variations.find((v) => v.id === line.variationId); return <div key={line.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3"><div><p className="text-sm font-bold text-slate-800">{item?.name || line.productId}</p><p className="text-xs text-slate-500">{variation?.name || "Default"} · Qty {line.quantity}</p></div><button onClick={() => setCart((current) => current.filter((entry) => entry.id !== line.id))} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove cart line"><Trash2 className="h-4 w-4" /></button></div>; })}</div>
          <div className="mt-5 flex gap-3"><input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Coupon code, e.g. SAVE10" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm uppercase" /><button onClick={calculate} disabled={cart.length === 0 || calculating} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{calculating ? "Calculating..." : "Simulate"}</button></div>
          {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white shadow-sm">
          <h2 className="text-lg font-black">Estimated result</h2>
          {quote ? <><div className="mt-5 grid grid-cols-2 gap-3">{[["Subtotal", quote.subtotalBDT], ["Total discount", quote.discountBDT], ["Customer pays", quote.totalBDT], ["Estimated cost", quote.costPriceTotalBDT], ["Gross profit", quote.grossProfitBDT], ["Gross margin", quote.grossMarginPct]].map(([label, value]) => <div key={label} className="rounded-xl bg-white/10 p-3"><p className="text-xs text-slate-300">{label}</p><p className="mt-1 text-lg font-black">{label === "Gross margin" ? `${value}%` : money(Number(value))}</p></div>)}</div><div className="mt-4 space-y-1 text-xs text-slate-300"><p>Coupon discount {money(quote.couponDiscountBDT)} · Volume {money(quote.volumeDiscountBDT)} · Bundle {money(quote.bundleDiscountBDT)}</p>{quote.couponCode && <p>Applied coupon {quote.couponCode}</p>}{quote.appliedBundleName && <p>Applied bundle {quote.appliedBundleName}</p>}</div></> : <p className="mt-6 text-sm text-slate-300">Run a simulation to see discount and margin estimates.</p>}
        </div>
      </section>
    </main>
  );
}
