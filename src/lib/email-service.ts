import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import {
  renderOrderDeliveryEmail,
  renderWalletTopupEmail,
  renderReplacementUpdateEmail,
  renderRefundUpdateEmail,
  renderSecurityOtpEmail,
  renderTicketCreatedEmail,
  renderAdminReplyEmail,
  renderTicketResolvedEmail,
  renderAffiliateCommissionEarnedEmail,
  renderAffiliatePayoutCompletedEmail,
  renderAffiliateTierUpgradedEmail,
  renderCustomerExpiryNoticeEmail,
  renderAbandonedCartRecoveryEmail,
  renderReviewRequestEmail,
  type OrderDeliveryEmailParams,
  type WalletTopupEmailParams,
  type ReplacementUpdateEmailParams,
  type RefundUpdateEmailParams,
  type SecurityOtpEmailParams,
  type TicketCreatedEmailParams,
  type AdminReplyEmailParams,
  type TicketResolvedEmailParams,
  type AffiliateCommissionEarnedEmailParams,
  type AffiliatePayoutCompletedEmailParams,
  type AffiliateTierUpgradedEmailParams,
  type CustomerExpiryNoticeEmailParams,
  type AbandonedCartRecoveryEmailParams,
  type ReviewRequestEmailParams,
  type EmailRenderResult,
} from "./email-templates";

export * from "./email-templates";

export interface EmailServiceResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

// ─── SMTP CONFIGURATION & TRANSPORTER ────────────────────────────────────────

let cachedTransporter: Transporter | null = null;

/**
 * Checks if Hostinger SMTP credentials are provided in the current environment.
 */
export function isSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  return Boolean(host && user && pass);
}

/**
 * Resolves the sender email address. Defaults to EMAIL_FROM or SMTP_USER or official delivery address.
 */
export function getDefaultFromAddress(): string {
  if (process.env.EMAIL_FROM?.trim()) {
    return process.env.EMAIL_FROM.trim();
  }
  if (process.env.SMTP_USER?.trim()) {
    return `"AI Haat" <${process.env.SMTP_USER.trim()}>`;
  }
  return '"AI Haat Delivery" <delivery@aihaat.shop>';
}

/**
 * Initializes and caches the Nodemailer transporter for Hostinger SMTP.
 */
export function getEmailTransporter(): Transporter | null {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (cachedTransporter) {
    return cachedTransporter;
  }

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
      auth: {
        user,
        pass,
      },
      tls: {
        // Hostinger SSL cert resilience
        rejectUnauthorized: false,
      },
    });

    return cachedTransporter;
  } catch (err) {
    console.error("[Email Engine] Failed to initialize Nodemailer transporter:", err);
    return null;
  }
}

// ─── SIMULATION FALLBACK ENGINE ──────────────────────────────────────────────

function runSimulatedDispatch(options: SendEmailOptions): EmailServiceResult {
  const simulatedId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const recipient = Array.isArray(options.to) ? options.to.join(", ") : options.to;

  console.log(`
┌─────────────────────────────────────────────────────────────┐
│ 🚀 [AI HAAT EMAIL ENGINE] SIMULATED DISPATCH (No SMTP)      │
├─────────────────────────────────────────────────────────────┤
│ 📬 To:        ${recipient}
│ 🏷️  Subject:   ${options.subject}
│ 📤 From:      ${options.from || getDefaultFromAddress()}
│ 🆔 Sim ID:    ${simulatedId}
│ ⏰ Time:      ${new Date().toISOString()}
└─────────────────────────────────────────────────────────────┘
  `);

  return {
    success: true,
    messageId: simulatedId,
    simulated: true,
  };
}

// ─── MASTER EMAIL DISPATCH METHOD ────────────────────────────────────────────

/**
 * Core transactional email sender. Uses Hostinger SMTP when configured,
 * and gracefully falls back to simulation mode in dev/unconfigured environments.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailServiceResult> {
  const recipient = Array.isArray(options.to) ? options.to.join(", ") : options.to;

  if (!recipient || !recipient.trim()) {
    return {
      success: false,
      error: "Recipient email address is required.",
    };
  }

  if (!isSmtpConfigured()) {
    return runSimulatedDispatch(options);
  }

  const transporter = getEmailTransporter();
  if (!transporter) {
    console.warn("[Email Engine] Transporter unavailable. Falling back to simulation mode.");
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
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    });

    console.log(`[Email Engine] Dispatched successfully! ID: ${info.messageId} to ${recipient}`);

    return {
      success: true,
      messageId: info.messageId,
      simulated: false,
    };
  } catch (error: any) {
    console.error(`[Email Engine] SMTP Dispatch failed to ${recipient}:`, error?.message || error);
    
    // In local development or testing environments, return simulated success on SMTP network failures
    if (process.env.NODE_ENV !== "production") {
      console.warn("[Email Engine] Fallback to simulated mode due to dev network/SMTP error.");
      return runSimulatedDispatch(options);
    }

    return {
      success: false,
      error: error?.message || "Failed to send email via SMTP",
    };
  }
}

// ─── HIGH-LEVEL HELPER METHODS ───────────────────────────────────────────────

/**
 * Dispatches an itemized order delivery email with credentials vault and instructions.
 */
export async function sendOrderDeliveryEmail(
  params: OrderDeliveryEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderOrderDeliveryEmail(params);
  return sendEmail({
    to: params.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Dispatches a wallet top-up / balance credited confirmation email.
 */
export async function sendWalletTopupEmail(
  params: WalletTopupEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderWalletTopupEmail(params);
  return sendEmail({
    to: params.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Dispatches a warranty replacement status update email (Approved, Rejected, Replaced, Under Review).
 */
export async function sendReplacementStatusEmail(
  params: ReplacementUpdateEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderReplacementUpdateEmail(params);
  return sendEmail({
    to: params.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Dispatches a refund status update email (Requested, Approved, Refunded, Rejected).
 */
export async function sendRefundStatusEmail(
  params: RefundUpdateEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderRefundUpdateEmail(params);
  return sendEmail({
    to: params.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Dispatches a high-security OTP verification email for MFA/password reset/account actions.
 */
export async function sendSecurityOtpEmail(
  params: SecurityOtpEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderSecurityOtpEmail(params);
  return sendEmail({
    to: params.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Dispatches a support ticket creation confirmation email.
 */
export async function sendTicketCreatedEmail(
  customerEmail: string,
  params: TicketCreatedEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderTicketCreatedEmail(params);
  return sendEmail({
    to: customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Dispatches an admin reply notification for a support ticket.
 */
export async function sendAdminReplyEmail(
  customerEmail: string,
  params: AdminReplyEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderAdminReplyEmail(params);
  return sendEmail({
    to: customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Dispatches a ticket resolution confirmation email.
 */
export async function sendTicketResolvedEmail(
  customerEmail: string,
  params: TicketResolvedEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderTicketResolvedEmail(params);
  return sendEmail({
    to: customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Sends a welcome onboarding email to newly registered users.
 */
export async function sendWelcomeEmail(user: {
  name: string;
  email: string;
}): Promise<EmailServiceResult> {
  const customerName = user.name || "Valued Member";
  const subject = "Welcome to AI Haat - Your Premium Digital Marketplace!";

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0;">
        Welcome to AI Haat, ${customerName}! 👋
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
        Your account is ready. You now have access to Bangladesh's premier marketplace for genuine AI subscriptions, developer licenses, and premium digital software.
      </p>
    </div>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFF9F5; border: 1px solid #FFE4D6; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <div style="font-size: 13px; font-weight: 800; color: #C2410C; margin-bottom: 10px;">
            ✨ Why Customers Trust AI Haat:
          </div>
          <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #9A3412; line-height: 1.8;">
            <li><b>Instant Automatic Delivery:</b> Receive login credentials &amp; license keys in seconds.</li>
            <li><b>100% Replacement Warranty:</b> Active guarantee for your entire subscription duration.</li>
            <li><b>Encrypted Digital Vault:</b> All your purchased keys are stored securely under your account.</li>
            <li><b>Local &amp; Fast Payments:</b> bKash, Nagad, Rocket, and Wallet instant top-up.</li>
          </ul>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="https://aihaat.shop/products" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-size: 14px; font-weight: 800; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3);">
        🚀 Explore Available Tools
      </a>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject,
    html: renderOrderDeliveryEmail({
      customerName: user.name,
      customerEmail: user.email,
      orderId: "WELCOME",
      credentials: "Welcome to AI Haat! Log in to your dashboard to get started.",
      subject,
    }).html.replace(/<!-- Dynamic Email Body Content -->[\s\S]*?<!-- 24\/7 Support Banner -->/, `<!-- Dynamic Email Body Content --><tr><td class="content-padding" style="padding: 32px 30px; background-color: #FFFFFF;">${contentHtml}</td></tr><!-- 24/7 Support Banner -->`),
    text: `Welcome to AI Haat, ${customerName}!\nYour account is active. Visit https://aihaat.shop to explore AI subscriptions and tools.`,
  });
}

/**
 * Diagnostic tool to test and verify SMTP connection with Hostinger.
 */
export async function verifySmtpConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isSmtpConfigured()) {
    return {
      ok: false,
      message: "SMTP is not configured. Missing SMTP_HOST, SMTP_USER, or SMTP_PASS environment variables.",
    };
  }

  const transporter = getEmailTransporter();
  if (!transporter) {
    return {
      ok: false,
      message: "Failed to initialize Nodemailer transporter.",
    };
  }

  try {
    await transporter.verify();
    return {
      ok: true,
      message: "Hostinger SMTP connection successfully verified!",
    };
  } catch (error: any) {
    return {
      ok: false,
      message: `SMTP Connection test failed: ${error?.message || error}`,
    };
  }
}

/**
 * Dispatches an affiliate commission earned email.
 */
export async function sendAffiliateCommissionEarnedEmail(
  params: AffiliateCommissionEarnedEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderAffiliateCommissionEarnedEmail(params);
  return sendEmail({
    to: params.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Dispatches an affiliate payout completed email.
 */
export async function sendAffiliatePayoutCompletedEmail(
  params: AffiliatePayoutCompletedEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderAffiliatePayoutCompletedEmail(params);
  return sendEmail({
    to: params.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Dispatches an affiliate tier upgraded email.
 */
export async function sendAffiliateTierUpgradedEmail(
  params: AffiliateTierUpgradedEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderAffiliateTierUpgradedEmail(params);
  return sendEmail({
    to: params.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Dispatches a customer subscription / warranty expiry notice email.
 */
export async function sendCustomerExpiryNoticeEmail(
  params: CustomerExpiryNoticeEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderCustomerExpiryNoticeEmail(params);
  return sendEmail({
    to: params.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Dispatches an abandoned cart recovery email (Stage 1 or Stage 2).
 */
export async function sendAbandonedCartRecoveryEmail(
  params: AbandonedCartRecoveryEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderAbandonedCartRecoveryEmail(params);
  return sendEmail({
    to: params.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

/**
 * Dispatches a post-delivery review request email with 1-click rating buttons.
 */
export async function sendReviewRequestEmail(
  params: ReviewRequestEmailParams
): Promise<EmailServiceResult> {
  const rendered = renderReviewRequestEmail(params);
  return sendEmail({
    to: params.customerEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}


