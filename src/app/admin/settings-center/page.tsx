"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowUpRight, Bell, CheckCircle2, CreditCard, Mail, MessageCircle, RefreshCw, Settings, ShieldCheck, Smartphone, Truck } from "@/components/animated-icons/lucide";

type CardState = {
  key: string;
  title: string;
  description: string;
  status: string;
  detail: string;
  href: string;
  icon: typeof Settings;
  tone: "good" | "warn" | "neutral";
};

type Payload = Record<string, any>;

function statusTone(value: boolean | null): CardState["tone"] {
  return value === true ? "good" : value === false ? "warn" : "neutral";
}

export default function AdminSettingsCenterPage() {
  const [cards, setCards] = useState<CardState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    const endpoints = [
      ["general", "/api/admin/settings/general"],
      ["gateways", "/api/admin/gateways"],
      ["telegram", "/api/admin/settings/telegram"],
      ["email", "/api/admin/email-marketing/settings"],
      ["meta", "/api/admin/integrations/meta"],
      ["sla", "/api/admin/delivery-sla"],
      ["notifications", "/api/admin/notifications?limit=1"],
    ] as const;

    const results = await Promise.all(
      endpoints.map(async ([key, url]) => {
        try {
          const response = await fetch(url, { cache: "no-store" });
          const data = await response.json().catch(() => ({}));
          return [key, response.ok, data] as const;
        } catch {
          return [key, false, {}] as const;
        }
      }),
    );
    const data = Object.fromEntries(results.map(([key, ok, value]) => [key, { ok, value }])) as Record<
      string,
      { ok: boolean; value: Payload }
    >;
    const unavailable = results.filter(([, ok]) => !ok).map(([key]) => key);
    if (unavailable.length) setError(`Some settings could not be loaded: ${unavailable.join(", ")}.`);

    const general = data.general.value.settings;
    const gateways = data.gateways.value.methods as Array<{ display?: string; isActive?: boolean }> | undefined;
    const telegram = data.telegram.value.settings;
    const email = data.email.value.settings;
    const meta = data.meta.value.settings;
    const sla = data.sla.value;
    const notifications = data.notifications.value.kpi;

    const activeGateways = gateways?.filter((gateway) => gateway.isActive).length ?? null;
    const gatewayCount = gateways?.length ?? null;
    const telegramReady = telegram ? Boolean(telegram.isEnabled && telegram.botToken && telegram.chatId) : null;
    const emailReady = email ? Boolean(email.fromEmail && (email.hasApiKey || email.hasSmtpPass)) : null;
    const metaReady = meta ? Boolean(meta.enabled && meta.pixelId) : null;
    const notificationHealth = notifications
      ? notifications.failed > 0
        ? false
        : notifications.pending > 0
          ? null
          : true
      : null;

    setCards([
      { key: "payment", title: "Payment gateways", description: "Active local payment methods and gateway controls.", status: gatewayCount === null ? "Unavailable" : `${activeGateways} of ${gatewayCount} active`, detail: "Manage payment methods", href: "/admin/settings#gateways", icon: CreditCard, tone: gatewayCount === null ? "neutral" : activeGateways ? "good" : "warn" },
      { key: "email", title: "Email delivery", description: "Sender configuration and deliverability verification.", status: emailReady === null ? "Unavailable" : emailReady ? "Configured" : "Needs setup", detail: email?.fromEmail || "Review email settings", href: "/admin/email-marketing/settings", icon: Mail, tone: statusTone(emailReady) },
      { key: "telegram", title: "Telegram", description: "Bot status and operational notification controls.", status: telegramReady === null ? "Unavailable" : telegramReady ? "Connected" : "Needs setup", detail: telegram?.chatId ? `Chat ${telegram.chatId}` : "Configure bot and chat", href: "/admin/settings#notifications", icon: Bell, tone: statusTone(telegramReady) },
      { key: "whatsapp", title: "WhatsApp support", description: "Customer support number used by the storefront.", status: general?.whatsapp ? "Configured" : "Needs setup", detail: general?.whatsapp || "No support number", href: "/admin/settings#general", icon: MessageCircle, tone: general?.whatsapp ? "good" : "warn" },
      { key: "delivery", title: "Delivery SLA", description: "Current delivery backlog and measured fulfilment timing.", status: sla?.overdueCount === undefined ? "Unavailable" : `${sla.overdueCount} overdue`, detail: sla?.timing?.medianMinutes ? `Median ${sla.timing.medianMinutes} min` : "Open SLA dashboard", href: "/admin/command-center", icon: Truck, tone: sla?.overdueCount > 0 ? "warn" : sla?.overdueCount === 0 ? "good" : "neutral" },
      { key: "notifications", title: "Notification health", description: "Recent event delivery status and failed dispatches.", status: notificationHealth === null ? "Pending review" : notificationHealth ? "Healthy" : `${notifications.failed} failed`, detail: notifications ? `${notifications.sent} sent · ${notifications.pending} pending` : "Open notification logs", href: "/admin/notifications", icon: Bell, tone: statusTone(notificationHealth) },
      { key: "tax", title: "Tax policy", description: "Tax configuration is not exposed by an existing settings API.", status: "Review required", detail: "Open commerce defaults", href: "/admin/settings#commerce", icon: Smartphone, tone: "neutral" },
      { key: "meta", title: "Meta tracking", description: "Browser and server-side event tracking controls.", status: metaReady === null ? "Unavailable" : metaReady ? "Enabled" : "Disabled", detail: meta?.pixelId ? `Pixel ${meta.pixelId}` : "No pixel configured", href: "/admin/integrations/meta", icon: ShieldCheck, tone: statusTone(metaReady) },
    ]);
    setUpdatedAt(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    setLoading(false);
  }, []);

  useEffect(() => { void loadSettings(); }, [loadSettings]);

  return (
    <div className="w-full space-y-6 pb-16">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-600"><Settings className="h-3.5 w-3.5" /> Settings Center</div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">System settings overview</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Review payment, communications, delivery and notification readiness from one MFA-protected admin view.</p>
        </div>
        <button onClick={() => void loadSettings()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" />{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? Array.from({ length: 8 }, (_, index) => <div key={index} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />) : cards.map((card) => {
          const Icon = card.icon;
          const tone = card.tone === "good" ? "text-emerald-600 bg-emerald-50" : card.tone === "warn" ? "text-amber-600 bg-amber-50" : "text-slate-600 bg-slate-100";
          return <article key={card.key} className="flex min-h-40 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div className={`rounded-xl p-2.5 ${tone}`}><Icon className="h-5 w-5" /></div><span className={`inline-flex items-center gap-1 text-xs font-bold ${card.tone === "good" ? "text-emerald-700" : card.tone === "warn" ? "text-amber-700" : "text-slate-500"}`}>{card.tone === "good" && <CheckCircle2 className="h-3.5 w-3.5" />}{card.status}</span></div>
            <div><h2 className="mt-4 text-base font-black text-slate-900">{card.title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{card.description}</p><a href={card.href} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700">{card.detail}<ArrowUpRight className="h-3.5 w-3.5" /></a></div>
          </article>;
        })}
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm"><ShieldCheck className="h-4 w-4 text-emerald-600" /> All cards use existing admin MFA-protected APIs. Credentials and secret values are intentionally masked. {updatedAt && `Last refreshed at ${updatedAt}.`}</div>
    </div>
  );
}
