import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { prisma } from "@/lib/prisma";
import { EmailMarketingSettings, ProviderType } from "./types";

let cachedTransporter: Transporter | null = null;
let lastTransporterConfigKey = "";

const DEFAULT_SETTINGS: EmailMarketingSettings = {
  senderName: "AI Haat Offers",
  fromEmail: "offers@aihaat.shop",
  replyToEmail: "support@aihaat.shop",
  providerType: "HOSTINGER_SMTP",
  smtpHost: process.env.SMTP_HOST || "smtp.hostinger.com",
  smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465,
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpSecure: true,
  batchSize: 50,
  rateLimitDelayMs: 100,
  maxRetries: 3,
  testMode: false,
  trackingEnabled: true,
  openTracking: true,
  clickTracking: true,
  defaultTimezone: "Asia/Dhaka",
};

/**
 * Loads Email Marketing Settings from the DB (with fallback to environment variables).
 */
export async function getEmailMarketingSettings(): Promise<EmailMarketingSettings> {
  try {
    const records = await prisma.siteSetting.findMany({
      where: {
        key: {
          startsWith: "email_marketing_",
        },
      },
    });

    const map: Record<string, string> = {};
    for (const r of records) {
      map[r.key] = r.value;
    }

    return {
      senderName: map["email_marketing_sender_name"] || DEFAULT_SETTINGS.senderName,
      fromEmail: map["email_marketing_from_email"] || DEFAULT_SETTINGS.fromEmail,
      replyToEmail: map["email_marketing_reply_to"] || DEFAULT_SETTINGS.replyToEmail,
      providerType: (map["email_marketing_provider_type"] as ProviderType) || DEFAULT_SETTINGS.providerType,
      smtpHost: map["email_marketing_smtp_host"] || process.env.SMTP_HOST || DEFAULT_SETTINGS.smtpHost,
      smtpPort: map["email_marketing_smtp_port"]
        ? parseInt(map["email_marketing_smtp_port"], 10)
        : process.env.SMTP_PORT
        ? parseInt(process.env.SMTP_PORT, 10)
        : DEFAULT_SETTINGS.smtpPort,
      smtpUser: map["email_marketing_smtp_user"] || process.env.SMTP_USER || DEFAULT_SETTINGS.smtpUser,
      smtpPass: map["email_marketing_smtp_pass"] || process.env.SMTP_PASS || DEFAULT_SETTINGS.smtpPass,
      smtpSecure: map["email_marketing_smtp_secure"] !== "false",
      apiKey: map["email_marketing_api_key"] || "",
      batchSize: map["email_marketing_batch_size"]
        ? parseInt(map["email_marketing_batch_size"], 10)
        : DEFAULT_SETTINGS.batchSize,
      rateLimitDelayMs: map["email_marketing_rate_delay"]
        ? parseInt(map["email_marketing_rate_delay"], 10)
        : DEFAULT_SETTINGS.rateLimitDelayMs,
      maxRetries: map["email_marketing_max_retries"]
        ? parseInt(map["email_marketing_max_retries"], 10)
        : DEFAULT_SETTINGS.maxRetries,
      testMode: map["email_marketing_test_mode"] === "true",
      trackingEnabled: map["email_marketing_tracking_enabled"] !== "false",
      openTracking: map["email_marketing_open_tracking"] !== "false",
      clickTracking: map["email_marketing_click_tracking"] !== "false",
      defaultTimezone: map["email_marketing_timezone"] || DEFAULT_SETTINGS.defaultTimezone,
    };
  } catch (err) {
    console.error("[EmailMarketing Settings Error - Fallback to Default]:", err);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Returns masked settings safe to expose in the Admin UI.
 */
export async function getMaskedEmailMarketingSettings(): Promise<
  Omit<EmailMarketingSettings, "smtpPass" | "apiKey"> & {
    hasSmtpPass: boolean;
    hasApiKey: boolean;
  }
> {
  const full = await getEmailMarketingSettings();
  return {
    senderName: full.senderName,
    fromEmail: full.fromEmail,
    replyToEmail: full.replyToEmail,
    providerType: full.providerType,
    smtpHost: full.smtpHost,
    smtpPort: full.smtpPort,
    smtpUser: full.smtpUser,
    smtpSecure: full.smtpSecure,
    batchSize: full.batchSize,
    rateLimitDelayMs: full.rateLimitDelayMs,
    maxRetries: full.maxRetries,
    testMode: full.testMode,
    trackingEnabled: full.trackingEnabled,
    openTracking: full.openTracking,
    clickTracking: full.clickTracking,
    defaultTimezone: full.defaultTimezone,
    hasSmtpPass: Boolean(full.smtpPass && full.smtpPass.length > 0),
    hasApiKey: Boolean(full.apiKey && full.apiKey.length > 0),
  };
}

/**
 * Initializes or reuses the Nodemailer transporter.
 */
function getMarketingTransporter(settings: EmailMarketingSettings): Transporter | null {
  const host = settings.smtpHost?.trim() || "smtp.hostinger.com";
  const port = settings.smtpPort || 465;
  const user = settings.smtpUser?.trim();
  const pass = settings.smtpPass?.trim();
  const isSecure = settings.smtpSecure ?? (port === 465);

  if (!user || !pass) {
    return null;
  }

  const configKey = `${host}:${port}:${user}:${pass}:${isSecure}`;
  if (cachedTransporter && lastTransporterConfigKey === configKey) {
    return cachedTransporter;
  }

  try {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
    lastTransporterConfigKey = configKey;
    return cachedTransporter;
  } catch (err) {
    console.error("[EmailMarketing] Failed to create transporter:", err);
    return null;
  }
}

export interface SendMarketingEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  senderName?: string;
  replyTo?: string;
  unsubscribeUrl?: string;
  headers?: Record<string, string>;
}

export interface MarketingSendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Master dispatcher for marketing broadcast emails.
 */
export async function sendMarketingEmail(
  options: SendMarketingEmailOptions,
  customSettings?: EmailMarketingSettings
): Promise<MarketingSendResult> {
  const settings = customSettings || (await getEmailMarketingSettings());
  const recipient = options.to?.trim();

  if (!recipient) {
    return { success: false, error: "Recipient email is required" };
  }

  // If in test mode or SIMULATED provider, simulate delivery
  if (settings.testMode || settings.providerType === "SIMULATED") {
    const simId = `sim_mkt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log(`[EmailMarketing SIMULATED] To: ${recipient} | Subject: ${options.subject} | SimID: ${simId}`);
    return { success: true, messageId: simId, simulated: true };
  }

  const fromSender = options.senderName || settings.senderName || "AI Haat Offers";
  const fromAddress = options.from || settings.fromEmail || "offers@aihaat.shop";
  const formattedFrom = `"${fromSender}" <${fromAddress}>`;
  const replyTo = options.replyTo || settings.replyToEmail || "support@aihaat.shop";

  // Build standard RFC 8058 1-click unsubscribe headers
  const headers: Record<string, string> = { ...(options.headers || {}) };
  if (options.unsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${options.unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  // 1. Hostinger SMTP / Custom SMTP
  if (settings.providerType === "HOSTINGER_SMTP" || settings.providerType === "CUSTOM_SMTP") {
    const transporter = getMarketingTransporter(settings);
    if (!transporter) {
      // In non-production or missing credentials, fallback gracefully to simulation
      if (process.env.NODE_ENV !== "production") {
        console.warn("[EmailMarketing] No SMTP credentials in dev, simulating dispatch.");
        return { success: true, messageId: `sim_dev_${Date.now()}`, simulated: true };
      }
      return { success: false, error: "SMTP credentials not configured for Email Marketing." };
    }

    try {
      const info = await transporter.sendMail({
        from: formattedFrom,
        to: recipient,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo,
        headers,
      });

      return { success: true, messageId: info.messageId, simulated: false };
    } catch (err: any) {
      console.error(`[EmailMarketing SMTP Error] to ${recipient}:`, err?.message || err);
      return { success: false, error: err?.message || "Failed to dispatch via SMTP" };
    }
  }

  // 2. Resend API
  if (settings.providerType === "RESEND") {
    if (!settings.apiKey) {
      return { success: false, error: "Resend API Key is not configured." };
    }
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.apiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: formattedFrom,
          to: [recipient],
          subject: options.subject,
          html: options.html,
          text: options.text,
          reply_to: replyTo,
          headers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data?.message || "Resend API dispatch failed" };
      }
      return { success: true, messageId: data.id, simulated: false };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to connect to Resend API" };
    }
  }

  // 3. Brevo (Sendinblue) API
  if (settings.providerType === "BREVO") {
    if (!settings.apiKey) {
      return { success: false, error: "Brevo API Key is not configured." };
    }
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": settings.apiKey.trim(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: fromSender, email: fromAddress },
          to: [{ email: recipient }],
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text,
          replyTo: { email: replyTo },
          headers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data?.message || "Brevo API dispatch failed" };
      }
      return { success: true, messageId: data.messageId, simulated: false };
    } catch (err: any) {
      return { success: false, error: err?.message || "Failed to connect to Brevo API" };
    }
  }

  return { success: false, error: `Unsupported provider type: ${settings.providerType}` };
}

/**
 * Diagnostic method to verify SMTP / API connection.
 */
export async function verifyMarketingConnection(): Promise<{ ok: boolean; message: string }> {
  const settings = await getEmailMarketingSettings();

  if (settings.testMode || settings.providerType === "SIMULATED") {
    return { ok: true, message: "Test Mode is active. All dispatches will be simulated safely." };
  }

  if (settings.providerType === "HOSTINGER_SMTP" || settings.providerType === "CUSTOM_SMTP") {
    const transporter = getMarketingTransporter(settings);
    if (!transporter) {
      return {
        ok: false,
        message: `Missing SMTP credentials for host ${settings.smtpHost}. Please fill User and Password in settings.`,
      };
    }
    try {
      await transporter.verify();
      return {
        ok: true,
        message: `Connection to SMTP (${settings.smtpHost}:${settings.smtpPort}) successfully established and authenticated!`,
      };
    } catch (err: any) {
      return {
        ok: false,
        message: `SMTP handshake failed: ${err?.message || err}`,
      };
    }
  }

  if (settings.providerType === "RESEND" || settings.providerType === "BREVO") {
    if (!settings.apiKey) {
      return { ok: false, message: `Missing API Key for ${settings.providerType}.` };
    }
    return { ok: true, message: `${settings.providerType} API key is configured.` };
  }

  return { ok: false, message: "Unknown provider configuration." };
}