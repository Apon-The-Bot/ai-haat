"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  ShoppingBag,
  Tag,
  Eye,
  Search,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Product, Coupon } from "@/types";

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const campaignId = (params?.id as string) || "";

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [senderName, setSenderName] = useState("AI Haat Offers");
  const [fromEmail, setFromEmail] = useState("offers@aihaat.shop");
  const [replyToEmail, setReplyToEmail] = useState("support@aihaat.shop");
  const [audienceType, setAudienceType] = useState("ALL_SUBSCRIBED");
  const [scheduledAt, setScheduledAt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modals & Assets
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    async function loadCampaign() {
      try {
        const res = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.campaign) {
            setName(data.campaign.name);
            setSubject(data.campaign.subject);
            setPreheader(data.campaign.preheader || "");
            if (data.campaign.senderName) setSenderName(data.campaign.senderName);
            if (data.campaign.fromEmail) setFromEmail(data.campaign.fromEmail);
            if (data.campaign.replyToEmail) setReplyToEmail(data.campaign.replyToEmail);
            if (data.campaign.audienceType) setAudienceType(data.campaign.audienceType);
            if (data.campaign.scheduledAt) setScheduledAt(new Date(data.campaign.scheduledAt).toISOString().slice(0, 16));
            setContentHtml(data.campaign.contentHtml);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    async function loadAssets() {
      try {
        const [prodRes, coupRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/coupons"),
        ]);
        if (prodRes.ok) {
          const d = await prodRes.json();
          if (d.products) setProducts(d.products);
        }
        if (coupRes.ok) {
          const d = await coupRes.json();
          if (d.coupons) setCoupons(d.coupons);
        }
      } catch (e) {
        console.error("Error loading assets:", e);
      }
    }

    loadCampaign();
    loadAssets();
  }, [campaignId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          subject,
          preheader,
          senderName,
          fromEmail,
          replyToEmail,
          audienceType,
          scheduledAt: scheduledAt || null,
          contentHtml,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Campaign updated successfully", "success");
        router.push(`/admin/email-marketing/campaigns/${campaignId}`);
      } else {
        showToast(data.error || "Failed to update", "error");
      }
    } catch {
      showToast("Error updating campaign", "error");
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (varCode: string) => {
    setContentHtml((prev) => prev + ` ${varCode} `);
  };

  const insertProductCard = (p: Product) => {
    const cardHtml = `
<!-- Product Card: ${p.name} -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin: 20px 0; overflow: hidden;">
  <tr>
    <td style="padding: 20px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td valign="top" style="padding-right: 16px; width: 100px;">
            <img src="${p.image}" alt="${p.name}" width="90" style="width: 90px; height: 90px; border-radius: 12px; object-fit: cover; display: block;" />
          </td>
          <td valign="top">
            <span style="font-size: 10px; font-weight: 800; color: #FC5C03; text-transform: uppercase; background-color: #FFF2E8; padding: 2px 8px; border-radius: 6px; display: inline-block; margin-bottom: 6px;">
              ${p.category}
            </span>
            <h3 style="font-size: 16px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0;">
              ${p.name}
            </h3>
            <div style="font-size: 15px; font-weight: 900; color: #16A34A; margin-bottom: 12px;">
              ৳${p.minPriceBDT}${p.maxPriceBDT && p.maxPriceBDT !== p.minPriceBDT ? ` - ৳${p.maxPriceBDT}` : ""}
            </div>
            <a href="https://aihaat.shop/products/${p.slug}" target="_blank" style="display: inline-block; background: #FC5C03; color: #FFFFFF; font-size: 12px; font-weight: 800; text-decoration: none; padding: 8px 18px; border-radius: 8px;">
              Buy Now 🚀
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
    setContentHtml((prev) => prev + cardHtml);
    setShowProductModal(false);
    showToast(`Inserted product card for "${p.name}".`, "success");
  };

  const insertCouponBlock = (c: Coupon) => {
    const couponHtml = `
<!-- Promo Coupon Box: ${c.code} -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFF9F5; border: 2px dashed #FC5C03; border-radius: 16px; margin: 20px 0; padding: 18px; text-align: center;">
  <tr>
    <td>
      <span style="font-size: 11px; font-weight: 800; color: #C2410C; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">
        Use Exclusive Coupon:
      </span>
      <div style="font-size: 24px; font-weight: 900; color: #EA580C; font-family: monospace; letter-spacing: 2px; margin: 4px 0;">
        ${c.code}
      </div>
      <span style="font-size: 11px; color: #9A3412; display: block;">
        ${c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `৳${c.discountValue} FLAT DISCOUNT`}
      </span>
    </td>
  </tr>
</table>
`;
    setContentHtml((prev) => prev + couponHtml);
    setShowCouponModal(false);
    showToast(`Inserted coupon box for "${c.code}".`, "success");
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-[#FC5C03] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-500">Loading campaign for edit...</p>
      </div>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/email-marketing/campaigns/${campaignId}`}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Campaign</h1>
            <p className="text-xs text-slate-500">Modify broadcast parameters, subject line, or design</p>
          </div>
        </div>

        <Link
          href={`/admin/email-marketing/campaigns/${campaignId}`}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
        >
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-5">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            Campaign Setup &amp; HTML Body
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject Line *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Preheader Preview</label>
            <input
              type="text"
              value={preheader}
              onChange={(e) => setPreheader(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sender Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">From Email</label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reply-To</label>
              <input
                type="email"
                value={replyToEmail}
                onChange={(e) => setReplyToEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Audience Type</label>
            <select
              value={audienceType}
              onChange={(e) => setAudienceType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            >
              <option value="ALL_SUBSCRIBED">All Subscribed Customers</option>
              <option value="ALL_CUSTOMERS">All Registered Users</option>
              <option value="PURCHASED">Paying Customers</option>
              <option value="NEVER_PURCHASED">Registered Non-Buyers</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Schedule Date &amp; Time (Optional)</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
            />
          </div>

          {/* Quick Components */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowProductModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-[#FFF2E8] hover:text-[#FC5C03] text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#FC5C03]" />
              <span>+ Insert Product Card</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCouponModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5 text-purple-600" />
              <span>+ Insert Coupon Box</span>
            </button>
          </div>

          {/* Variables */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              "{{customer_name}}",
              "{{first_name}}",
              "{{email}}",
              "{{site_name}}",
              "{{coupon_code}}",
              "{{product_name}}",
            ].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVariable(v)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-bold rounded-md cursor-pointer"
              >
                {v}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email HTML Body *</label>
            <textarea
              rows={14}
              required
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
              className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 leading-relaxed focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {/* Right Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 sticky top-20">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Eye className="w-4 h-4 text-[#FC5C03]" />
            <h3 className="text-sm font-black text-slate-900">Live Client Preview</h3>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
            <div className="text-slate-500"><strong>From:</strong> {senderName} &lt;{fromEmail}&gt;</div>
            <div className="text-slate-900 font-bold"><strong>Subject:</strong> {subject}</div>
          </div>

          <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200">
            <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200 text-xs text-slate-700">
              <div className="bg-[#0F172A] p-4 text-center border-b-2 border-[#FC5C03]">
                <div className="font-black text-white text-base">AI <span className="text-[#FC5C03]">HAAT</span></div>
              </div>
              <div
                className="p-4 space-y-2 min-h-[160px] leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: contentHtml
                    ? contentHtml
                        .replace(/\{\{first_name\}\}/g, "John")
                        .replace(/\{\{customer_name\}\}/g, "John Doe")
                    : '<p style="color: #94a3b8; text-align: center; padding: 40px 0;">Compose HTML...</p>',
                }}
              />
              <div className="bg-slate-900 p-3 text-center text-[10px] text-slate-400">
                <p className="margin: 0">AI Haat — Bangladesh&apos;s #1 Digital Marketplace</p>
              </div>
            </div>
          </div>
        </div>

      </form>

      {/* INSERT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#FC5C03]" />
                <span>Select Product to Insert Card</span>
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-black">✕</button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <div key={p.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                      <span className="text-[11px] text-[#FC5C03] font-bold">৳{p.minPriceBDT}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => insertProductCard(p)}
                    className="px-3 py-1.5 bg-[#FFF2E8] hover:bg-[#FC5C03] text-[#FC5C03] hover:text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Insert Card
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INSERT COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-600" />
                <span>Select Coupon to Insert Box</span>
              </h3>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-black">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-100">
              {coupons.map((c) => (
                <div key={c.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-xs">
                      {c.code}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `৳${c.discountValue} FLAT`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => insertCouponBlock(c)}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Insert Box
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}