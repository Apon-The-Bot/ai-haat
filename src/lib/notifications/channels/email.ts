import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { NotificationErrorCategory } from "../types";

export interface EmailDispatchOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  error?: string;
  errorCategory?: NotificationErrorCategory;
  simulated?: boolean;
}

let cachedTransporter: Transporter | null = null;

export function isSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(host && user && pass);
}

export function getDefaultFromAddress(): string {
  if (process.env.EMAIL_FROM?.trim()) {
    return process.env.EMAIL_FROM.trim();
  }
  if (process.env.SMTP_USER?.trim()) {
    return `"AI Haat" <${process.env.SMTP_USER.trim()}>`;
  }
  return '"AI Haat" <delivery@aihaat.shop>';
}

export function getEmailTransporter(): Transporter | null {
  if (!isSmtpConfigured()) return null;
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST?.trim() || "smtp.hostinger.com";
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const isSecure = port === 465;

  try {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: { user, pass },
      connectionTimeout: 10000, // 10s connection timeout
      greetingTimeout: 10000,   // 10s greeting timeout
      socketTimeout: 15000,     // 15s socket timeout
      tls: {
        rejectUnauthorized: true,
      },
    });

    return cachedTransporter;
  } catch (err) {
    console.error("[Email Channel] Failed to initialize Nodemailer transporter:", err);
    return null;
  }
}

function runSimulatedDispatch(options: EmailDispatchOptions): EmailDispatchResult {
  const simulatedId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const recipient = Array.isArray(options.to) ? options.to.join(", ") : options.to;

  console.log(`[Email Simulation] To: ${recipient} | Subject: ${options.subject} | ID: ${simulatedId}`);

  return {
    success: true,
    messageId: simulatedId,
    simulated: true,
  };
}

export function classifyEmailError(error: any): NotificationErrorCategory {
  const code = error?.code || "";
  const msg = String(error?.message || "").toLowerCase();

  if (
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "ESOCKET" ||
    msg.includes("timeout") ||
    msg.includes("too many connections")
  ) {
    return "TRANSIENT";
  }

  if (
    code === "EAUTH" ||
    msg.includes("invalid login") ||
    msg.includes("authentication failed") ||
    msg.includes("missing credentials")
  ) {
    return "CONFIGURATION";
  }

  return "PERMANENT";
}

export async function dispatchEmail(options: EmailDispatchOptions): Promise<EmailDispatchResult> {
  const recipient = Array.isArray(options.to) ? options.to.join(", ") : options.to;

  if (!recipient || !recipient.trim()) {
    return {
      success: false,
      error: "Recipient email address is required.",
      errorCategory: "PERMANENT",
    };
  }

  if (!isSmtpConfigured()) {
    return runSimulatedDispatch(options);
  }

  const transporter = getEmailTransporter();
  if (!transporter) {
    return runSimulatedDispatch(options);
  }

  try {
    const fromAddress = options.from || getDefaultFromAddress();
    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || "delivery@aihaat.shop",
    });

    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    };
  } catch (error: any) {
    const category = classifyEmailError(error);
    console.error(`[Email Channel Error] (${category}) to ${recipient}:`, error?.message || error);

    // Fallback simulation in dev/test if network failed
    if (process.env.NODE_ENV !== "production") {
      return runSimulatedDispatch(options);
    }

    return {
      success: false,
      error: error?.message || "Failed to send email",
      errorCategory: category,
    };
  }
}
