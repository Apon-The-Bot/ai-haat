"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  Sparkles,
  Users,
  Eye,
  FileCode,
  Tag,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Check,
  Smartphone,
  Monitor,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Product, Coupon } from "@/types";

interface Template {
  id: string;
  name: string;
  category: string;
  subject: string | null;
  contentHtml: string;
}

interface Segment {
  id: string;
  name: string;
  estimatedCount?: number;
}

export default function CreateCampaignWizardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Info
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [senderName, setSenderName] = useState("AI Haat Offers");
  const [fromEmail, setFromEmail] = useState("offers@aihaat.shop");
  const [replyToEmail, setReplyToEmail] = useState("support@aihaat.shop");

  // Step 2: Audience
  const [audienceType, setAudienceType] = useState("ALL_SUBSCRIBED");
  const [selectedProductSlugs, setSelectedProductSlugs] = useState<string[]>([]);
  const [minSpent, setMinSpent] = useState("");
  const [maxSpent, setMaxSpent] = useState("");
  const [segmentId, setSegmentId] = useState("");
  const [manualEmails, setManualEmails] = useState("");
  const [estimatedRecipients, setEstimatedRecipients] = useState<number | null>(null);
  const [suppressedCount, setSuppressedCount] = useState<number>(0);
  const [estimatingAudience, setEstimatingAudience] = useState(false);

  // Step 3: Content & Designer
  const [contentHtml, setContentHtml] = useState("");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Step 4: Schedule / Dispatch
  const [sendOption, setSendOption] = useState<"NOW" | "SCHEDULE">("NOW");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test send in Step 4
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Auxiliary data
  const [templates, setTemplates] = useState<Template[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Load auxiliary data
  useEffect(() => {
    const loadAux = async () => {
      try {
        const [tRes, sRes, pRes, cRes] = await Promise.all([
          fetch("/api/admin/email-marketing/templates"),
          fetch("/api/admin/email-marketing/segments"),
          fetch("/api/products"),
          fetch("/api/admin/coupons"),
        ]);
        if (tRes.ok) {
          const d = await tRes.json();
          if (d.templates) setTemplates(d.templates);
        }
        if (sRes.ok) {
          const d = await sRes.json();
          if (d.segments) setSegments(d.segments);
        }
        if (pRes.ok) {
          const d = await pRes.json();
          if (d.products) setProducts(d.products);
        }
        if (cRes.ok) {
          const d = await cRes.json();
          if (d.coupons) setCoupons(d.coupons);
        }
      } catch (err) {
        console.error("Failed to load campaign aux data:", err);
      }
    };
    loadAux();
  }, []);

  // Update audience estimation whenever criteria change
  const updateAudienceEstimate = useCallback(async () => {
    try {
      setEstimatingAudience(true);
      const filterObj: Record<string, any> = {};
      if (audienceType === "SPECIFIC_PRODUCTS") filterObj.productSlugs = selectedProductSlugs;
      if (audienceType === "SPENT_RANGE") {
        filterObj.minSpent = minSpent;
        filterObj.maxSpent = maxSpent;
      }
      if (audienceType === "MANUAL") {
        filterObj.manualEmails = manualEmails
          .split(/[\n,]+/)
          .map((e) => e.trim())
          .filter((e) => e.length > 0);
      }

      const res = await fetch("/api/admin/email-marketing/segments/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audienceType,
          audienceFilter: filterObj,
          segmentId: segmentId || undefined,
          manualEmails: filterObj.manualEmails,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEstimatedRecipients(data.totalEligible);
        setSuppressedCount(data.totalSuppressed || 0);
      }
    } catch (err) {
      console.error("Audience estimation error:", err);
    } finally {
      setEstimatingAudience(false);
    }
  }, [audienceType, selectedProductSlugs, minSpent, maxSpent, segmentId, manualEmails]);

  useEffect(() => {
    if (step === 2 || step === 4) {
      updateAudienceEstimate();
    }
  }, [step, updateAudienceEstimate]);

  const handleSelectTemplate = (t: Template) => {
    setContentHtml(t.contentHtml);
    if (!subject && t.subject) {
      setSubject(t.subject);
    }
    showToast(`Loaded "${t.name}" template.`, "success");
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
        ${c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `৳${c.discountValue} FLAT DISCOUNT`} (Min order: ৳${c.minOrderBDT || 0})
      </span>
    </td>
  </tr>
</table>
`;
    setContentHtml((prev) => prev + couponHtml);
    setShowCouponModal(false);
    showToast(`Inserted coupon box for "${c.code}".`, "success");
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim() || !contentHtml.trim() || !subject.trim()) {
      showToast("Please provide subject, content, and test email address.", "error");
      return;
    }
    setIsSendingTest(true);
    try {
      const res = await fetch("/api/admin/email-marketing/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Test email sent!", "success");
      } else {
        showToast(data.error || "Failed to send test email", "error");
      }
    } catch {
      showToast("Error sending test email", "error");
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleFinishAndSubmit = async (statusOverride?: "DRAFT" | "SEND_NOW") => {
    if (!name.trim() || !subject.trim() || !contentHtml.trim()) {
      showToast("Please fill in campaign name, subject, and email content.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const isScheduled = sendOption === "SCHEDULE" && scheduledDate;
      const scheduledDateTime = isScheduled ? `${scheduledDate}T${scheduledTime || "12:00"}:00` : null;

      const filterObj: Record<string, any> = {};
      if (audienceType === "SPECIFIC_PRODUCTS") filterObj.productSlugs = selectedProductSlugs;
      if (audienceType === "SPENT_RANGE") {
        filterObj.minSpent = minSpent;
        filterObj.maxSpent = maxSpent;
      }
      if (audienceType === "MANUAL") {
        filterObj.manualEmails = manualEmails
          .split(/[\n,]+/)
          .map((e) => e.trim())
          .filter((e) => e.length > 0);
      }

      // 1. Create Campaign
      const createRes = await fetch("/api/admin/email-marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          preheader: preheader.trim() || null,
          senderName: senderName.trim(),
          fromEmail: fromEmail.trim(),
          replyToEmail: replyToEmail.trim() || null,
          contentHtml,
          audienceType,
          audienceFilter: filterObj,
          segmentId: segmentId || null,
          scheduledAt: scheduledDateTime,
          isScheduled: isScheduled && statusOverride !== "DRAFT",
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.campaign) {
        showToast(createData.error || "Failed to create campaign", "error");
        setIsSubmitting(false);
        return;
      }

      const campaignId = createData.campaign.id;

      // 2. If immediate send requested
      if (sendOption === "NOW" && statusOverride !== "DRAFT") {
        const sendRes = await fetch(`/api/admin/email-marketing/campaigns/${campaignId}/send`, {
          method: "POST",
        });
        const sendData = await sendRes.json();
        if (sendRes.ok && sendData.success) {
          showToast(sendData.message || "Broadcast successfully queued and sending!", "success");
        } else {
          showToast(sendData.error || "Campaign created but send initiation failed", "error");
        }
      } else {
        showToast(
          isScheduled ? "Campaign scheduled successfully!" : "Campaign draft saved.",
          "success"
        );
      }

      router.push(`/admin/email-marketing/campaigns/${campaignId}`);
    } catch {
      showToast("Server error processing campaign", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Campaign Wizard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create Marketing Broadcast
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Step-by-step wizard to target, design, preview, and broadcast emails safely.
          </p>
        </div>

        <Link
          href="/admin/email-marketing/campaigns"
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors self-start sm:self-auto"
        >
          ← Back to Campaigns
        </Link>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        {[
          { stepNum: 1, title: "1. Campaign Setup", desc: "Sender & Subject" },
          { stepNum: 2, title: "2. Audience Selection", desc: "Filters & Segmentation" },
          { stepNum: 3, title: "3. Email Designer", desc: "Visual Blocks & Products" },
          { stepNum: 4, title: "4. Review & Broadcast", desc: "Safety Check & Dispatch" },
        ].map((s) => (
          <button
            key={s.stepNum}
            onClick={() => setStep(s.stepNum as any)}
            className={`p-3 rounded-xl text-left transition-all cursor-pointer ${
              step === s.stepNum
                ? "bg-[#FFF2E8] text-[#FC5C03] border border-[#FC5C03]/30"
                : step > s.stepNum
                ? "bg-slate-50 text-emerald-700"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs block leading-tight">{s.title}</span>
              {step > s.stepNum && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            </div>
            <span className="text-[10.5px] opacity-75 block truncate mt-0.5">{s.desc}</span>
          </button>
        ))}
      </div>

      {/* STEP 1: CAMPAIGN DETAILS */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 max-w-3xl">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Step 1: Campaign Identity &amp; Subject Line
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Internal Campaign Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. End of Month AI Subscription Promo"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:border-[#FC5C03] focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Only visible to administrators in the dashboard.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Subject Line *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. 🔥 Flash Sale: Get 30% OFF on ChatGPT Plus & Claude!"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:border-[#FC5C03] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preheader / Preview Text
              </label>
              <input
                type="text"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
                placeholder="e.g. Exclusive discounts for AI Haat members. Valid for 24 hours."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="AI Haat Offers"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:border-[#FC5C03] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  From Email Address
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="offers@aihaat.shop"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:border-[#FC5C03] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reply-To Email
                </label>
                <input
                  type="email"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                  placeholder="support@aihaat.shop"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:border-[#FC5C03] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                if (!name.trim() || !subject.trim()) {
                  showToast("Please provide campaign name and subject line.", "error");
                  return;
                }
                setStep(2);
              }}
              className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Select Audience</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AUDIENCE SELECTION */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 max-w-3xl">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Step 2: Audience &amp; Customer Segmentation
          </h2>

          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Target Customer Group:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "ALL_SUBSCRIBED", title: "All Subscribed Customers", desc: "Opted-in members eligible for marketing." },
                { id: "ALL_CUSTOMERS", title: "All Registered Users", desc: "All user accounts (excluding suppressions)." },
                { id: "PURCHASED", title: "Paying Customers", desc: "Users with 1 or more verified orders." },
                { id: "NEVER_PURCHASED", title: "Registered Non-Buyers", desc: "Accounts with 0 orders." },
                { id: "SPECIFIC_PRODUCTS", title: "Buyers of Specific Products", desc: "Target customers who purchased certain tools." },
                { id: "SPENT_RANGE", title: "Total Spending Range", desc: "Filter by customer lifetime spend (৳)." },
                { id: "CUSTOM_SEGMENT", title: "Saved Dynamic Segment", desc: "Use a predefined segmentation rule." },
                { id: "MANUAL", title: "Manual Email List", desc: "Paste explicit email addresses." },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAudienceType(opt.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    audienceType === opt.id
                      ? "border-[#FC5C03] bg-[#FFF2E8] text-slate-900 shadow-2xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{opt.title}</span>
                    {audienceType === opt.id && <Check className="w-4 h-4 text-[#FC5C03]" />}
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>

            {/* Sub-conditions based on audienceType */}
            {audienceType === "SPECIFIC_PRODUCTS" && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Select Products:</span>
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {products.map((p) => {
                    const isSelected = selectedProductSlugs.includes(p.slug);
                    return (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedProductSlugs((prev) =>
                              prev.includes(p.slug) ? prev.filter((s) => s !== p.slug) : [...prev, p.slug]
                            );
                          }}
                          className="rounded border-slate-300 text-[#FC5C03] focus:ring-0"
                        />
                        <span>{p.name} ({p.category})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {audienceType === "SPENT_RANGE" && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Spent (৳)</label>
                  <input
                    type="number"
                    value={minSpent}
                    onChange={(e) => setMinSpent(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Spent (৳)</label>
                  <input
                    type="number"
                    value={maxSpent}
                    onChange={(e) => setMaxSpent(e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {audienceType === "CUSTOM_SEGMENT" && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Segment:</label>
                <select
                  value={segmentId}
                  onChange={(e) => setSegmentId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">-- Choose a Segment --</option>
                  {segments.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.estimatedCount || 0} estimated)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {audienceType === "MANUAL" && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-xs font-bold text-slate-700 mb-1">Paste Email Addresses (comma or line separated):</label>
                <textarea
                  rows={4}
                  value={manualEmails}
                  onChange={(e) => setManualEmails(e.target.value)}
                  placeholder="user1@example.com, user2@example.com"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            )}

            {/* Live Recipient Counter Box */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
              <div>
                <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                  Live Audience Resolution
                </span>
                <span className="text-xl font-black text-white block mt-0.5">
                  {estimatingAudience ? "Calculating..." : `${estimatedRecipients ?? 0} Eligible Recipients`}
                </span>
                {suppressedCount > 0 && (
                  <span className="text-[10.5px] text-amber-400 font-medium block">
                    🛡️ {suppressedCount} unsubscribed/suppressed contacts automatically excluded.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={updateAudienceEstimate}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Re-check Count
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Design Email</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: EMAIL DESIGNER */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Editor Area (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900">
                Email HTML Composer &amp; Tools
              </h2>

              {/* Template Dropdown */}
              <select
                onChange={(e) => {
                  const t = templates.find((item) => item.id === e.target.value);
                  if (t) handleSelectTemplate(t);
                }}
                className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Load from Template Library...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Component Buttons */}
            <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-slate-100">
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

            {/* Variable Pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Click to Insert Dynamic Variable:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: "Customer Name", code: "{{customer_name}}" },
                  { label: "First Name", code: "{{first_name}}" },
                  { label: "Customer Email", code: "{{email}}" },
                  { label: "Store Name", code: "{{site_name}}" },
                  { label: "Coupon Code", code: "{{coupon_code}}" },
                  { label: "Product Name", code: "{{product_name}}" },
                  { label: "Unsubscribe URL", code: "{{unsubscribe_url}}" },
                ].map((v) => (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => insertVariable(v.code)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-mono font-bold rounded-md transition-colors cursor-pointer"
                  >
                    {v.code}
                  </button>
                ))}
              </div>
            </div>

            {/* HTML Editor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email HTML Body Content *
              </label>
              <textarea
                rows={16}
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
                placeholder="<h1>Hello {{first_name}},</h1><p>Check out our exclusive AI deals...</p>"
                className="w-full p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-hidden focus:border-[#FC5C03] leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                The content is automatically placed into the official AI Haat responsive header &amp; footer layout with compliant 1-click unsubscribe mechanisms.
              </span>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (!contentHtml.trim()) {
                    showToast("Please enter email body content.", "error");
                    return;
                  }
                  setStep(4);
                }}
                className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Next: Review &amp; Send</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Live Preview Area (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#FC5C03]" />
                <h3 className="text-sm font-black text-slate-900">Live Client Preview</h3>
              </div>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`p-1.5 rounded-md transition-colors ${
                    previewMode === "desktop" ? "bg-white text-[#FC5C03] shadow-xs" : "text-slate-500"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={`p-1.5 rounded-md transition-colors ${
                    previewMode === "mobile" ? "bg-white text-[#FC5C03] shadow-xs" : "text-slate-500"
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Email Header Preview Simulation */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="text-slate-500">
                <strong>From:</strong> {senderName} &lt;{fromEmail}&gt;
              </div>
              <div className="text-slate-900 font-bold">
                <strong>Subject:</strong> {subject || "(No subject provided yet)"}
              </div>
              {preheader && (
                <div className="text-slate-400 text-[11px] truncate">
                  <strong>Preheader:</strong> {preheader}
                </div>
              )}
            </div>

            {/* Rendered HTML Preview Simulation Frame */}
            <div
              className={`mx-auto bg-slate-100 p-3 rounded-2xl border border-slate-200 transition-all ${
                previewMode === "mobile" ? "max-w-[320px]" : "w-full"
              }`}
            >
              <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200 text-xs text-slate-700">
                {/* Simulated Header */}
                <div className="bg-[#0F172A] p-4 text-center border-b-2 border-[#FC5C03]">
                  <div className="font-black text-white text-base">
                    AI <span className="text-[#FC5C03]">HAAT</span>
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">
                    Offers &amp; Updates
                  </div>
                </div>

                {/* Simulated Body */}
                <div
                  className="p-4 space-y-2 min-h-[160px] leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: contentHtml
                      ? contentHtml
                          .replace(/\{\{first_name\}\}/g, "John")
                          .replace(/\{\{customer_name\}\}/g, "John Doe")
                          .replace(/\{\{email\}\}/g, "john@example.com")
                          .replace(/\{\{site_name\}\}/g, "AI Haat")
                          .replace(/\{\{site_url\}\}/g, "https://aihaat.shop")
                          .replace(/\{\{coupon_code\}\}/g, "SPECIAL30")
                      : '<p style="color: #94a3b8; text-align: center; padding: 40px 0;">Compose HTML or pick a template on the left to see live preview.</p>',
                  }}
                />

                {/* Simulated Footer */}
                <div className="bg-slate-900 p-3 text-center text-[10px] text-slate-400 border-t border-slate-800">
                  <p className="margin: 0">AI Haat — Bangladesh&apos;s #1 Digital Marketplace</p>
                  <p className="margin: 0 text-[9px] text-slate-500">Unsubscribe from marketing emails</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* STEP 4: REVIEW & BROADCAST */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6 max-w-3xl">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Step 4: Final Verification &amp; Broadcast Dispatch
          </h2>

          {/* Verification Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Campaign Summary Review
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Campaign Name:</span>
                <strong className="text-slate-900">{name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Subject:</span>
                <strong className="text-slate-900">{subject}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Sender:</span>
                <strong className="text-slate-900">{senderName} &lt;{fromEmail}&gt;</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Audience Target:</span>
                <strong className="text-[#FC5C03]">{audienceType}</strong>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">Resolved Recipients:</span>
                <span className="text-lg font-black text-emerald-600 font-mono">
                  {estimatedRecipients ?? 0} Contacts
                </span>
              </div>
            </div>
          </div>

          {/* Test Email Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-[#FC5C03]" />
              <span>Send Preview Test Email Before Broadcasting</span>
            </h3>
            <p className="text-xs text-slate-500">
              Verify real inbox formatting on Gmail, Apple Mail, Outlook, or mobile clients.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter your personal or admin email..."
                className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="px-4 py-2 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? "Sending..." : "Send Test"}
              </button>
            </div>
          </div>

          {/* Dispatch Timing Options */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">Dispatch Timing:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSendOption("NOW")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  sendOption === "NOW"
                    ? "border-[#FC5C03] bg-[#FFF2E8] text-slate-900 shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">🚀 Broadcast Immediately</span>
                  {sendOption === "NOW" && <Check className="w-4 h-4 text-[#FC5C03]" />}
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Enqueues and starts sending batches right now.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSendOption("SCHEDULE")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  sendOption === "SCHEDULE"
                    ? "border-[#FC5C03] bg-[#FFF2E8] text-slate-900 shadow-xs"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">📅 Schedule for Later</span>
                  {sendOption === "SCHEDULE" && <Check className="w-4 h-4 text-[#FC5C03]" />}
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Queue to broadcast automatically at a set date &amp; time.
                </span>
              </button>
            </div>

            {sendOption === "SCHEDULE" && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time (Asia/Dhaka GMT+6)</label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Safety Mass Warning if recipients > 500 */}
          {(estimatedRecipients || 0) > 500 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-800 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>High Volume Safety Warning:</strong> You are about to broadcast to over {estimatedRecipients} customers. Please double check that your subject line, links, and coupon codes are accurate.
              </div>
            </div>
          )}

          {/* Final Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              ← Back to Editor
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFinishAndSubmit("DRAFT")}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleFinishAndSubmit()}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting
                  ? "Processing..."
                  : sendOption === "SCHEDULE"
                  ? "Confirm & Schedule"
                  : "🚀 Broadcast Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSERT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#FC5C03]" />
                <span>Select Product to Insert Card</span>
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-black">
                ✕
              </button>
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

            <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-100 pr-1">
              {filteredProducts.map((p) => (
                <div key={p.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{p.name}</h4>
                      <span className="text-[11px] text-[#FC5C03] font-bold">৳{p.minPriceBDT}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => insertProductCard(p)}
                    className="px-3 py-1.5 bg-[#FFF2E8] hover:bg-[#FC5C03] text-[#FC5C03] hover:text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-600" />
                <span>Select Coupon to Insert Box</span>
              </h3>
              <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-black">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-100 pr-1">
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
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
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