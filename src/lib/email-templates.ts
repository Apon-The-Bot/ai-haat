/**
 * AI Haat - Premium Branded Responsive Transactional Email Templates
 *
 * Designed with AI Haat brand aesthetics:
 * - Primary Brand Accent: #FC5C03 (AI Haat Orange)
 * - Dark Slate Header: #0F172A / #1E293B
 * - Card Containers: #FFFFFF with #E2E8F0 subtle borders
 * - Call-to-action Buttons: High-conversion responsive CTA buttons
 * - Mobile-friendly & cross-client compatible (Gmail, Outlook, Apple Mail, Yahoo)
 */

export interface OrderItemDetail {
  productName: string;
  variationName?: string;
  quantity?: number;
  priceBDT?: number;
}

export interface OrderDeliveryEmailParams {
  customerName: string;
  customerEmail: string;
  orderId: string;
  productName?: string;
  variationName?: string;
  items?: OrderItemDetail[];
  credentials: string;
  downloadUrl?: string | null;
  instructions?: string | null;
  totalAmountBDT?: number;
  warrantyPeriod?: string;
  vaultUrl?: string;
  subject?: string;
}

export interface WalletTopupEmailParams {
  customerName: string;
  customerEmail: string;
  amountBDT: number;
  paymentMethod: string;
  trxId?: string;
  newBalanceBDT: number;
  date?: string;
  walletUrl?: string;
  subject?: string;
}

export interface ReplacementUpdateEmailParams {
  customerName: string;
  customerEmail: string;
  orderId: string;
  productName: string;
  variationName?: string;
  status: "APPROVED" | "REPLACED" | "REJECTED" | "UNDER_REVIEW" | "COMPLETED" | string;
  adminNotes?: string | null;
  replacementCredentials?: string | null;
  downloadUrl?: string | null;
  instructions?: string | null;
  requestId?: string;
  vaultUrl?: string;
  subject?: string;
}

export interface RefundUpdateEmailParams {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  productName: string;
  refundAmountBDT: number;
  refundMethod: string;
  status: "REQUESTED" | "APPROVED" | "REFUNDED" | "REJECTED";
  adminNotes?: string;
  payoutTrxId?: string;
  walletBalanceBDT?: number;
  subject?: string;
}

export interface SecurityOtpEmailParams {
  customerName?: string;
  customerEmail: string;
  otp: string;
  purpose?: "MFA_SETUP" | "MFA_DISABLE" | "SECURITY_CHANGE" | "LOGIN" | "PASSWORD_RESET" | string;
  expiresInMinutes?: number;
  ipAddress?: string;
  userAgent?: string;
  requestedAt?: string;
  subject?: string;
}

export interface TicketCreatedEmailParams {
  customerName: string;
  ticketNumber: string;
  subject: string;
  category: string;
  orderNumber?: string;
}

export interface AdminReplyEmailParams {
  customerName: string;
  ticketNumber: string;
  subject: string;
  adminReplySnippet: string;
}

export interface TicketResolvedEmailParams {
  customerName: string;
  ticketNumber: string;
  subject: string;
}

export interface AffiliateCommissionEarnedEmailParams {
  customerName: string;
  customerEmail: string;
  commissionAmountBDT: number;
  orderTotalBDT: number;
  referralCode: string;
  newBalanceBDT: number;
}

export interface AffiliatePayoutCompletedEmailParams {
  customerName: string;
  customerEmail: string;
  payoutAmountBDT: number;
  payoutMethod: string;
  payoutTrxId?: string;
}

export interface AffiliateTierUpgradedEmailParams {
  customerName: string;
  customerEmail: string;
  newTier: string;
  newRatePercent: number;
}

export interface AbandonedCartItemDetail {
  productName: string;
  variationName?: string;
  quantity?: number;
  priceBDT?: number;
  image?: string;
}

export interface AbandonedCartRecoveryEmailParams {
  customerName?: string;
  customerEmail: string;
  stage: 1 | 2;
  items: AbandonedCartItemDetail[];
  subtotalBDT: number;
  recoveryUrl: string;
  couponCode?: string;
  discountPercent?: number;
  unsubscribeUrl?: string;
  subject?: string;
}

export interface ReviewRequestEmailParams {
  customerName?: string;
  customerEmail: string;
  orderNumber: string;
  productName: string;
  variationName?: string;
  quickRateBaseUrl: string;
  reviewModalUrl?: string;
  token: string;
  subject?: string;
}

export interface EmailRenderResult {
  subject: string;
  html: string;
  text: string;
}

// ─── UTILITY HELPERS ─────────────────────────────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatCredentialsToHtml(raw: string): string {
  const sanitized = escapeHtml(raw);
  return sanitized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("<br/>");
}

function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`;
}

// ─── MASTER EMAIL LAYOUT ─────────────────────────────────────────────────────

interface BaseLayoutOptions {
  previewText: string;
  badgeText?: string;
  badgeBg?: string;
  badgeColor?: string;
  badgeBorder?: string;
  contentHtml: string;
  footerNotice?: string;
}

function renderBaseEmailLayout(options: BaseLayoutOptions): string {
  const badgeHtml = options.badgeText
    ? `
      <div style="display: inline-block; margin-top: 12px; background: ${options.badgeBg || "rgba(252, 92, 3, 0.15)"}; color: ${options.badgeColor || "#FC5C03"}; border: 1px solid ${options.badgeBorder || "rgba(252, 92, 3, 0.35)"}; padding: 5px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px;">
        ${escapeHtml(options.badgeText)}
      </div>
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>AI Haat</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-width: 100% !important;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0F172A;
      -webkit-font-smoothing: antialiased;
    }
    @media only screen and (max-width: 620px) {
      .email-wrapper { padding: 16px 8px !important; }
      .email-container { width: 100% !important; border-radius: 16px !important; }
      .content-padding { padding: 24px 18px !important; }
      .header-padding { padding: 28px 18px !important; }
      .otp-code { font-size: 28px !important; letter-spacing: 6px !important; }
      .btn-primary { width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
      .grid-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC;">
  <!-- Preview text for email inboxes -->
  <div style="display: none; font-size: 1px; color: #F8FAFC; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${escapeHtml(options.previewText)}
    ${"&nbsp;&zwnj;".repeat(30)}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC;">
    <tr>
      <td align="center" class="email-wrapper" style="padding: 36px 12px;">
        <!-- Email Card Box -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);">
          
          <!-- Dark Hero Header -->
          <tr>
            <td class="header-padding" align="center" style="background: linear-gradient(145deg, #0F172A 0%, #1E293B 100%); padding: 36px 28px; text-align: center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://aihaat.shop" target="_blank" style="text-decoration: none; display: inline-block;">
                      <div style="font-size: 30px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px; line-height: 1;">
                        AI <span style="color: #FC5C03;">Haat</span>
                      </div>
                    </a>
                    <div style="font-size: 10px; text-transform: uppercase; color: #94A3B8; letter-spacing: 2px; font-weight: 700; margin-top: 6px;">
                      Premier AI &amp; Digital Marketplace
                    </div>
                    ${badgeHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dynamic Email Body Content -->
          <tr>
            <td class="content-padding" style="padding: 32px 30px; background-color: #FFFFFF;">
              ${options.contentHtml}
            </td>
          </tr>

          <!-- 24/7 Support Banner -->
          <tr>
            <td style="padding: 0 30px 24px 30px; background-color: #FFFFFF;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 16px 20px;">
                <tr>
                  <td>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 13px; font-weight: 700; color: #0F172A; padding-bottom: 4px;">
                          💬 Need Fast Support or Warranty Assistance?
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #64748B; line-height: 1.5;">
                          Our support team is available 24/7. Reach us via 
                          <a href="https://t.me/aihaat_support" target="_blank" style="color: #FC5C03; text-decoration: none; font-weight: 700;">Telegram</a>, 
                          <a href="https://wa.me/8801700000000" target="_blank" style="color: #FC5C03; text-decoration: none; font-weight: 700;">WhatsApp</a>, 
                          or reply directly to this email.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 24px 30px; border-top: 1px solid #E2E8F0; text-align: center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                ${
                  options.footerNotice
                    ? `
                <tr>
                  <td style="font-size: 12px; color: #64748B; padding-bottom: 12px; line-height: 1.5;">
                    ${options.footerNotice}
                  </td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="font-size: 11px; color: #94A3B8; line-height: 1.6;">
                    This transactional message was sent from <b>delivery@aihaat.shop</b> to securely notify you regarding your AI Haat account activity.
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: #94A3B8; padding-top: 10px;">
                    © ${new Date().getFullYear()} AI Haat. All rights reserved. • <a href="https://aihaat.shop" target="_blank" style="color: #FC5C03; text-decoration: none; font-weight: 600;">aihaat.shop</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── 1. ORDER DELIVERY EMAIL TEMPLATE ────────────────────────────────────────

/**
 * Renders the complete, beautiful Order Delivery Email with itemized table,
 * dark monospace credentials vault, download links, instructions, and CTA button.
 */
export function renderOrderDeliveryEmail(params: OrderDeliveryEmailParams): EmailRenderResult {
  const orderId = params.orderId || "AH-ORDER";
  const customerName = params.customerName || "Valued Customer";
  const vaultUrl = params.vaultUrl || "https://aihaat.shop/dashboard/keys";
  const warrantyText = params.warrantyPeriod || "100% Replacement Warranty Active";

  // Build items summary or fallback to single product
  const items: OrderItemDetail[] =
    params.items && params.items.length > 0
      ? params.items
      : [
          {
            productName: params.productName || "Digital Subscription",
            variationName: params.variationName || "Standard Plan",
          },
        ];

  const mainProductName = items[0]?.productName || params.productName || "Digital Product";
  const subject =
    params.subject || `Order Delivered: ${mainProductName} (Order #${orderId}) - AI Haat`;

  // Itemized table rows
  const itemRowsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px dashed #E2E8F0;">
        <td style="padding: 10px 0; font-size: 13px; color: #0F172A; font-weight: 700;">
          ${escapeHtml(item.productName)}
          ${
            item.variationName
              ? `<div style="font-size: 11px; color: #64748B; font-weight: 500; margin-top: 2px;">Plan: ${escapeHtml(item.variationName)}</div>`
              : ""
          }
        </td>
        ${
          item.quantity
            ? `<td align="center" style="padding: 10px 8px; font-size: 12px; color: #475569; font-weight: 600;">x${item.quantity}</td>`
            : ""
        }
        ${
          item.priceBDT
            ? `<td align="right" style="padding: 10px 0; font-size: 13px; color: #0F172A; font-weight: 700;">${formatCurrency(item.priceBDT)}</td>`
            : ""
        }
      </tr>
    `
    )
    .join("");

  const formattedCreds = formatCredentialsToHtml(params.credentials);

  const contentHtml = `
    <!-- Greeting & Intro -->
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.3px;">
        Hello, ${escapeHtml(customerName)}! 👋
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        Thank you for purchasing with <b>AI Haat</b>. Your digital product has been successfully issued and is ready for immediate use. You can also view and manage this at any time in your Digital Vault.
      </p>
    </div>

    <!-- Order Info Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin-bottom: 24px; padding: 18px 20px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding-bottom: 6px;">Order Number</td>
              <td align="right" style="font-size: 13px; font-weight: 800; color: #0F172A; padding-bottom: 6px;">#${escapeHtml(orderId)}</td>
            </tr>
            <tr>
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding-bottom: 6px;">Delivery Status</td>
              <td align="right" style="font-size: 12px; font-weight: 800; color: #059669; padding-bottom: 6px;">✓ Instant Delivered</td>
            </tr>
            <tr>
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding-bottom: 12px;">Warranty Coverage</td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #FC5C03; padding-bottom: 12px;">🛡️ ${escapeHtml(warrantyText)}</td>
            </tr>
          </table>

          <div style="border-top: 1px solid #E2E8F0; padding-top: 10px; margin-top: 4px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #94A3B8; letter-spacing: 0.5px; margin-bottom: 6px;">Itemized Summary</div>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              ${itemRowsHtml}
              ${
                params.totalAmountBDT
                  ? `
                <tr>
                  <td style="padding: 10px 0 0 0; font-size: 13px; font-weight: 800; color: #0F172A;">Total Paid:</td>
                  <td align="right" colspan="2" style="padding: 10px 0 0 0; font-size: 15px; font-weight: 900; color: #FC5C03;">${formatCurrency(params.totalAmountBDT)}</td>
                </tr>
              `
                  : ""
              }
            </table>
          </div>
        </td>
      </tr>
    </table>

    <!-- Digital Credentials Vault Box (Dark Monospace Container) -->
    <div style="background-color: #0F172A; border-radius: 18px; padding: 22px; margin-bottom: 24px; border: 1px solid #334155; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; color: #94A3B8; margin-bottom: 10px;">
              🔐 Access Credentials &amp; License Keys
            </div>
            <div style="background-color: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 16px; color: #34D399; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; line-height: 1.7; word-break: break-all;">
              ${formattedCreds}
            </div>
            <div style="font-size: 11px; color: #94A3B8; margin-top: 10px; line-height: 1.4;">
              🔒 <b>Security Note:</b> Never share these credentials with untrusted parties. For account subscriptions, do not modify profile names or security settings unless permitted.
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Software Download Package (if provided) -->
    ${
      params.downloadUrl
        ? `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 16px; padding: 18px 20px; margin-bottom: 24px;">
        <tr>
          <td align="center">
            <div style="font-size: 14px; font-weight: 800; color: #1E40AF; margin-bottom: 6px;">
              📥 Software / Installer Download Package
            </div>
            <div style="font-size: 12px; color: #3B82F6; margin-bottom: 12px; line-height: 1.4;">
              Click below to download the application files, setup package, or APK directly:
            </div>
            <a href="${escapeHtml(params.downloadUrl)}" target="_blank" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; text-decoration: none; padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 700;">
              Download Installation Package
            </a>
          </td>
        </tr>
      </table>
    `
        : ""
    }

    <!-- Usage Guidelines / Instructions -->
    ${
      params.instructions
        ? `
      <div style="background-color: #FFF9F5; border: 1px solid #FFE4D6; border-radius: 16px; padding: 18px 20px; margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 800; color: #C2410C; margin-bottom: 6px;">
          💡 Important Activation &amp; Usage Rules:
        </div>
        <div style="font-size: 13px; color: #9A3412; line-height: 1.6;">
          ${escapeHtml(params.instructions).replace(/\n/g, "<br/>")}
        </div>
      </div>
    `
        : ""
    }

    <!-- Call To Action: Access Digital Vault -->
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${escapeHtml(vaultUrl)}" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 15px 36px; border-radius: 14px; font-size: 14px; font-weight: 800; letter-spacing: 0.3px; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3);">
        🔑 Open Digital Vault
      </a>
      <div style="font-size: 12px; color: #94A3B8; margin-top: 8px;">
        Direct link: <a href="${escapeHtml(vaultUrl)}" style="color: #64748B; text-decoration: underline;">${escapeHtml(vaultUrl)}</a>
      </div>
    </div>
  `;

  const html = renderBaseEmailLayout({
    previewText: `Your digital delivery for Order #${orderId} (${mainProductName}) is ready.`,
    badgeText: "Instant Delivery Complete",
    badgeBg: "rgba(16, 185, 129, 0.15)",
    badgeColor: "#059669",
    badgeBorder: "rgba(16, 185, 129, 0.35)",
    contentHtml,
    footerNotice: "Save this email or bookmark your AI Haat Digital Vault for fast warranty and access retrieval.",
  });

  const text = `AI Haat - Order Delivery
Order: #${orderId}
Customer: ${customerName}
Product: ${mainProductName}
${params.variationName ? `Plan: ${params.variationName}` : ""}

Credentials / License Keys:
${params.credentials}

${params.downloadUrl ? `Download Package: ${params.downloadUrl}` : ""}
${params.instructions ? `Instructions:\n${params.instructions}` : ""}

Access your Digital Vault: ${vaultUrl}
Need support? Contact us at delivery@aihaat.shop or https://t.me/aihaat_support`;

  return { subject, html, text };
}

// ─── 2. WALLET TOPUP EMAIL TEMPLATE ──────────────────────────────────────────

/**
 * Renders the branded Wallet Topup confirmation email with amount credited,
 * transaction details, payment method, updated balance, and quick action.
 */
export function renderWalletTopupEmail(params: WalletTopupEmailParams): EmailRenderResult {
  const customerName = params.customerName || "Valued Customer";
  const amountFormatted = formatCurrency(params.amountBDT);
  const balanceFormatted = formatCurrency(params.newBalanceBDT);
  const walletUrl = params.walletUrl || "https://aihaat.shop/dashboard/wallet";
  const dateStr =
    params.date ||
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const subject = params.subject || `Wallet Credited: +${amountFormatted} Added to Your AI Haat Balance!`;

  const contentHtml = `
    <!-- Greeting & Intro -->
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.3px;">
        Hello, ${escapeHtml(customerName)}! 💰
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        Great news! Your wallet deposit has been verified and your AI Haat balance has been successfully credited.
      </p>
    </div>

    <!-- Hero Balance Credit Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #FFF9F5 0%, #FFF1E8 100%); border: 1px solid #FFE4D6; border-radius: 20px; padding: 24px 20px; margin-bottom: 24px; text-align: center;">
      <tr>
        <td align="center">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; color: #C2410C; margin-bottom: 6px;">
            Amount Successfully Added
          </div>
          <div style="font-size: 34px; font-weight: 900; color: #059669; letter-spacing: -0.5px; margin-bottom: 12px;">
            +${amountFormatted}
          </div>
          <div style="display: inline-block; background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 12px; padding: 8px 18px;">
            <span style="font-size: 12px; color: #64748B; font-weight: 600;">Current Wallet Balance:</span>
            <span style="font-size: 14px; color: #0F172A; font-weight: 800; margin-left: 4px;">${balanceFormatted}</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Transaction Breakdown Box -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin-bottom: 24px; padding: 18px 20px;">
      <tr>
        <td>
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #94A3B8; letter-spacing: 0.5px; margin-bottom: 12px;">
            Transaction Details
          </div>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            ${
              params.trxId
                ? `
              <tr style="border-bottom: 1px dashed #E2E8F0;">
                <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 8px 0;">Transaction ID (TrxID)</td>
                <td align="right" style="font-size: 12px; font-weight: 800; color: #0F172A; padding: 8px 0; font-family: monospace;">${escapeHtml(params.trxId)}</td>
              </tr>
            `
                : ""
            }
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 8px 0;">Payment Method</td>
              <td align="right" style="font-size: 12px; font-weight: 800; color: #0F172A; padding: 8px 0;">${escapeHtml(params.paymentMethod)}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 8px 0;">Processed Date</td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #0F172A; padding: 8px 0;">${escapeHtml(dateStr)}</td>
            </tr>
            <tr>
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 8px 0 0 0;">Transaction Status</td>
              <td align="right" style="font-size: 12px; font-weight: 800; color: #059669; padding: 8px 0 0 0;">✓ Verified &amp; Completed</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Instant Benefits Note -->
    <div style="background-color: #F1F5F9; border-radius: 14px; padding: 14px 18px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="font-size: 12px; color: #475569; line-height: 1.5;">
            ⚡ <b>Instant 1-Click Checkout:</b> You can now use your wallet balance during checkout for zero-delay instant orders on ChatGPT Plus, Claude, Midjourney, Canva, VPNs, and Developer Tools.
          </td>
        </tr>
      </table>
    </div>

    <!-- Action Buttons -->
    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${escapeHtml(walletUrl)}" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-size: 14px; font-weight: 800; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3);">
        💳 View Wallet &amp; Shop Now
      </a>
    </div>
  `;

  const html = renderBaseEmailLayout({
    previewText: `Your AI Haat wallet was credited with +${amountFormatted}. New balance: ${balanceFormatted}.`,
    badgeText: "Wallet Balance Credited",
    badgeBg: "rgba(16, 185, 129, 0.15)",
    badgeColor: "#059669",
    badgeBorder: "rgba(16, 185, 129, 0.35)",
    contentHtml,
    footerNotice: "If you did not authorize or recognize this top-up transaction, please contact AI Haat support immediately.",
  });

  const text = `AI Haat - Wallet Top-Up Successful
Hello ${customerName},

Amount Credited: +${amountFormatted}
New Balance: ${balanceFormatted}
Payment Method: ${params.paymentMethod}
${params.trxId ? `Transaction ID: ${params.trxId}` : ""}
Date: ${dateStr}

View your wallet balance and transactions: ${walletUrl}
Questions? Contact delivery@aihaat.shop`;

  return { subject, html, text };
}

// ─── 3. REPLACEMENT UPDATE EMAIL TEMPLATE ────────────────────────────────────

/**
 * Renders warranty claim update emails (Approved, Replaced, Rejected, Under Review)
 * with admin feedback notes, replacement credentials, and action button.
 */
export function renderReplacementUpdateEmail(params: ReplacementUpdateEmailParams): EmailRenderResult {
  const customerName = params.customerName || "Valued Customer";
  const orderId = params.orderId || "AH-ORDER";
  const productName = params.productName || "Digital Subscription";
  const vaultUrl = params.vaultUrl || "https://aihaat.shop/dashboard/keys";

  const isApproved =
    params.status === "APPROVED" || params.status === "REPLACED" || params.status === "COMPLETED";
  const isRejected = params.status === "REJECTED";
  const isUnderReview = params.status === "UNDER_REVIEW" || params.status === "REQUESTED";

  let subject =
    params.subject ||
    (isApproved
      ? `Replacement Approved: ${productName} (Order #${orderId}) - AI Haat`
      : isRejected
      ? `Warranty Claim Decision: ${productName} (Order #${orderId}) - AI Haat`
      : isUnderReview
      ? `Warranty Claim Received: ${productName} (Order #${orderId}) - AI Haat`
      : `Warranty Claim Update: ${productName} (Order #${orderId}) - AI Haat`);

  let badgeText = "Warranty Claim Update";
  let badgeBg = "rgba(252, 92, 3, 0.15)";
  let badgeColor = "#FC5C03";
  let badgeBorder = "rgba(252, 92, 3, 0.35)";
  let statusBannerBg = "#FFF9F5";
  let statusBannerBorder = "#FFE4D6";
  let statusTitleColor = "#C2410C";
  let statusTitle = "Replacement Claim Update";

  if (isApproved) {
    badgeText = "✓ Replacement Approved & Dispatched";
    badgeBg = "rgba(16, 185, 129, 0.15)";
    badgeColor = "#059669";
    badgeBorder = "rgba(16, 185, 129, 0.35)";
    statusBannerBg = "#ECFDF5";
    statusBannerBorder = "#A7F3D0";
    statusTitleColor = "#065F46";
    statusTitle = "Your Replacement Has Been Approved!";
  } else if (isRejected) {
    badgeText = "Claim Closed";
    badgeBg = "rgba(239, 68, 68, 0.15)";
    badgeColor = "#DC2626";
    badgeBorder = "rgba(239, 68, 68, 0.35)";
    statusBannerBg = "#FEF2F2";
    statusBannerBorder = "#FECACA";
    statusTitleColor = "#991B1B";
    statusTitle = "Replacement Request Status: Rejected";
  } else if (isUnderReview) {
    badgeText = "⏳ Under Review";
    badgeBg = "rgba(245, 158, 11, 0.15)";
    badgeColor = "#D97706";
    badgeBorder = "rgba(245, 158, 11, 0.35)";
    statusBannerBg = "#FFFBEB";
    statusBannerBorder = "#FDE68A";
    statusTitleColor = "#92400E";
    statusTitle = "Your Claim Is Under Technical Review";
  }

  const contentHtml = `
    <!-- Greeting & Intro -->
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.3px;">
        Hello, ${escapeHtml(customerName)}! 🛡️
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        Here is the official update regarding your warranty replacement claim for Order <b>#${escapeHtml(orderId)}</b>.
      </p>
    </div>

    <!-- Status Banner Box -->
    <div style="background-color: ${statusBannerBg}; border: 1px solid ${statusBannerBorder}; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 15px; font-weight: 800; color: ${statusTitleColor}; margin-bottom: 6px;">
        ${statusTitle}
      </div>
      <div style="font-size: 13px; color: #334155; line-height: 1.5;">
        ${
          isApproved
            ? "Your warranty claim has been verified and a fresh replacement has been dispatched to your digital account."
            : isRejected
            ? "After review by our technical team, your warranty request could not be approved at this time."
            : "Our warranty team is currently checking the reported issue. You will receive an update shortly."
        }
      </div>
    </div>

    <!-- Claim & Order Details Table -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin-bottom: 24px; padding: 18px 20px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            ${
              params.requestId
                ? `
              <tr style="border-bottom: 1px dashed #E2E8F0;">
                <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Claim Reference ID</td>
                <td align="right" style="font-size: 12px; font-weight: 800; color: #0F172A; padding: 6px 0; font-family: monospace;">${escapeHtml(params.requestId)}</td>
              </tr>
            `
                : ""
            }
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Order Number</td>
              <td align="right" style="font-size: 12px; font-weight: 800; color: #0F172A; padding: 6px 0;">#${escapeHtml(orderId)}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Product</td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #0F172A; padding: 6px 0;">${escapeHtml(productName)}</td>
            </tr>
            ${
              params.variationName
                ? `
              <tr style="border-bottom: 1px dashed #E2E8F0;">
                <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Variation / Plan</td>
                <td align="right" style="font-size: 12px; font-weight: 700; color: #0F172A; padding: 6px 0;">${escapeHtml(params.variationName)}</td>
              </tr>
            `
                : ""
            }
            <tr>
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0 0 0;">Claim Status</td>
              <td align="right" style="font-size: 12px; font-weight: 800; color: ${badgeColor}; padding: 6px 0 0 0;">${escapeHtml(params.status)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Admin Response / Notes Box -->
    ${
      params.adminNotes
        ? `
      <div style="background-color: #FFFFFF; border: 1px solid #CBD5E1; border-left: 4px solid #FC5C03; border-radius: 12px; padding: 16px 18px; margin-bottom: 24px;">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748B; margin-bottom: 4px; letter-spacing: 0.5px;">
          👨‍💻 AI Haat Support Remarks:
        </div>
        <div style="font-size: 13px; color: #0F172A; line-height: 1.6;">
          ${escapeHtml(params.adminNotes).replace(/\n/g, "<br/>")}
        </div>
      </div>
    `
        : ""
    }

    <!-- Replacement Credentials (if approved) -->
    ${
      isApproved && params.replacementCredentials
        ? `
      <div style="background-color: #0F172A; border-radius: 18px; padding: 22px; margin-bottom: 24px; border: 1px solid #334155;">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; color: #34D399; margin-bottom: 10px;">
          🔑 Fresh Replacement Credentials
        </div>
        <div style="background-color: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 16px; color: #34D399; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; line-height: 1.7; word-break: break-all;">
          ${formatCredentialsToHtml(params.replacementCredentials)}
        </div>
      </div>
    `
        : ""
    }

    <!-- Optional Download Package -->
    ${
      params.downloadUrl
        ? `
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 16px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
        <tr>
          <td>
            <div style="font-size: 13px; font-weight: 800; color: #1E40AF; margin-bottom: 8px;">
              📥 Updated Software Package
            </div>
            <a href="${escapeHtml(params.downloadUrl)}" target="_blank" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; text-decoration: none; padding: 10px 22px; border-radius: 10px; font-size: 13px; font-weight: 700;">
              Download Files
            </a>
          </td>
        </tr>
      </table>
    `
        : ""
    }

    <!-- Important Guidelines -->
    ${
      params.instructions
        ? `
      <div style="background-color: #FFF9F5; border: 1px solid #FFE4D6; border-radius: 16px; padding: 16px 20px; margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: 800; color: #C2410C; margin-bottom: 4px;">
          💡 Important Warranty Guidelines:
        </div>
        <div style="font-size: 12px; color: #9A3412; line-height: 1.6;">
          ${escapeHtml(params.instructions).replace(/\n/g, "<br/>")}
        </div>
      </div>
    `
        : ""
    }

    <!-- Call to Action -->
    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${escapeHtml(vaultUrl)}" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-size: 14px; font-weight: 800; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3);">
        🛡️ Access Digital Vault
      </a>
    </div>
  `;

  const html = renderBaseEmailLayout({
    previewText: `Replacement status for Order #${orderId} (${productName}): ${params.status}`,
    badgeText,
    badgeBg,
    badgeColor,
    badgeBorder,
    contentHtml,
    footerNotice: "AI Haat Warranty provides 100% full replacement protection for all active subscriptions.",
  });

  const text = `AI Haat - Warranty Replacement Update
Order: #${orderId}
Product: ${productName}
Status: ${params.status}
${params.adminNotes ? `Admin Notes: ${params.adminNotes}` : ""}

${params.replacementCredentials ? `Replacement Credentials:\n${params.replacementCredentials}` : ""}
${params.downloadUrl ? `Download: ${params.downloadUrl}` : ""}

Check your digital vault: ${vaultUrl}
Need support? Reach out at delivery@aihaat.shop`;

  return { subject, html, text };
}

// ─── 4. SECURITY OTP EMAIL TEMPLATE ──────────────────────────────────────────

/**
 * Renders the high-security OTP email with 6-digit code badge, 10-minute expiry warning,
 * security instructions, and request metadata.
 */
export function renderSecurityOtpEmail(params: SecurityOtpEmailParams): EmailRenderResult {
  const customerName = params.customerName || "AI Haat User";
  const otpCode = params.otp.trim();
  const expiresInMinutes = params.expiresInMinutes || 10;
  const purpose = params.purpose || "SECURITY_VERIFICATION";

  let titleBn = "আপনার সিকিউরিটি ভেরিফিকেশন কোড";
  let titleEn = "Your Security Verification Code";
  let purposeDescription = "Use the 6-digit verification code below to authorize your security action.";

  if (purpose === "MFA_SETUP") {
    titleBn = "টু-ফ্যাক্টর অথেনটিকেশন (2FA) সেটআপ কোড";
    titleEn = "Two-Factor Authentication Setup";
    purposeDescription = "Use this code to verify and activate Two-Factor Authentication (2FA) on your AI Haat account.";
  } else if (purpose === "MFA_DISABLE") {
    titleBn = "টু-ফ্যাক্টর অথেনটিকেশন নিষ্ক্রিয়করণ কোড";
    titleEn = "Disable Two-Factor Authentication";
    purposeDescription = "A request was received to turn off 2FA security. Use this code only if you initiated this request.";
  } else if (purpose === "SECURITY_CHANGE" || purpose === "PASSWORD_RESET") {
    titleBn = "সিকিউরিটি পরিবর্তন ভেরিফিকেশন কোড";
    titleEn = "Account Security Change Verification";
    purposeDescription = "Use this code to authorize updates to your account credentials or security settings.";
  } else if (purpose === "LOGIN") {
    titleBn = "লগইন ভেরিফিকেশন কোড";
    titleEn = "Account Login Verification";
    purposeDescription = "Use this one-time code to safely sign in to your AI Haat account.";
  }

  const subject = params.subject || `${otpCode} is your AI Haat security verification code`;

  const dateStr =
    params.requestedAt ||
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Dhaka",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const contentHtml = `
    <!-- Header Title -->
    <div style="margin-bottom: 20px; text-align: center;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0; letter-spacing: -0.3px;">
        ${titleBn}
      </h1>
      <div style="font-size: 13px; font-weight: 700; color: #FC5C03;">
        ${titleEn}
      </div>
      <p style="font-size: 13px; color: #475569; line-height: 1.5; margin: 12px 0 0 0;">
        Hello, <b>${escapeHtml(customerName)}</b>. ${escapeHtml(purposeDescription)}
      </p>
    </div>

    <!-- OTP Code Display Card -->
    <div style="background-color: #FFF9F5; border: 2px dashed #FC5C03; border-radius: 18px; padding: 24px 16px; margin-bottom: 24px; text-align: center;">
      <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; color: #C2410C; margin-bottom: 10px;">
        One-Time Verification Code (OTP)
      </div>
      <div class="otp-code" style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #0F172A; padding: 6px 0; background-color: #FFFFFF; border-radius: 12px; display: inline-block; width: 85%; border: 1px solid #FFE4D6;">
        ${escapeHtml(otpCode)}
      </div>
      <div style="margin-top: 14px; font-size: 13px; font-weight: 700; color: #C2410C;">
        ⏱️ Valid for ${expiresInMinutes} minutes only
      </div>
    </div>

    <!-- Security Warnings Box -->
    <div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 16px; padding: 18px 20px; margin-bottom: 24px;">
      <div style="font-size: 13px; font-weight: 800; color: #991B1B; margin-bottom: 8px;">
        🔒 Critical Security Advice:
      </div>
      <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #7F1D1D; line-height: 1.7;">
        <li><b>Never share this code:</b> AI Haat staff will NEVER ask for your OTP via phone, chat, or email.</li>
        <li><b>Check the URL:</b> Always verify you are on <code style="background-color: #FEE2E2; padding: 2px 4px; border-radius: 4px;">aihaat.shop</code> before submitting.</li>
        <li><b>Didn't request this?</b> If you did not request this OTP, please change your password immediately and secure your email account.</li>
      </ul>
    </div>

    <!-- Request Metadata Audit Info -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px;">
      <tr>
        <td style="font-size: 11px; color: #64748B;">
          <div>📅 <b>Requested At:</b> ${escapeHtml(dateStr)} (Asia/Dhaka)</div>
          ${
            params.ipAddress
              ? `<div style="margin-top: 4px;">🌐 <b>IP Address:</b> <code style="font-family: monospace;">${escapeHtml(params.ipAddress)}</code></div>`
              : ""
          }
          ${
            params.userAgent
              ? `<div style="margin-top: 4px;">💻 <b>Device:</b> ${escapeHtml(params.userAgent.slice(0, 80))}</div>`
              : ""
          }
        </td>
      </tr>
    </table>
  `;

  const html = renderBaseEmailLayout({
    previewText: `Your verification code is ${otpCode}. Valid for ${expiresInMinutes} minutes.`,
    badgeText: "Security Verification",
    badgeBg: "rgba(252, 92, 3, 0.15)",
    badgeColor: "#FC5C03",
    badgeBorder: "rgba(252, 92, 3, 0.35)",
    contentHtml,
    footerNotice: "Do not reply to this email with sensitive data. For security assistance, visit aihaat.shop/dashboard/security.",
  });

  const text = `AI Haat Security Verification Code: ${otpCode}
Valid for ${expiresInMinutes} minutes.

Action: ${titleEn}
Account: ${params.customerEmail}
Requested At: ${dateStr}
${params.ipAddress ? `IP: ${params.ipAddress}` : ""}

Never share this code with anyone. AI Haat support will never ask for your OTP.`;

  return { subject, html, text };
}

// ─── BACKWARD COMPATIBILITY HELPER ───────────────────────────────────────────

/**
 * Legacy wrapper matching old signature for client-side iframe preview in Admin Orders page.
 */
export function generateDeliveryHtml(data: {
  customerName: string;
  customerEmail: string;
  orderId: string;
  productName: string;
  variationName?: string;
  credentials: string;
  downloadUrl?: string | null;
  instructions?: string | null;
}): string {
  return renderOrderDeliveryEmail(data).html;
}

// ─── 5. REFUND UPDATE EMAIL TEMPLATE ─────────────────────────────────────────

/**
 * Renders refund update emails (Requested, Approved, Refunded, Rejected)
 * with details and action buttons.
 */
export function renderRefundUpdateEmail(params: RefundUpdateEmailParams): EmailRenderResult {
  const customerName = params.customerName || "Valued Customer";
  const orderNumber = params.orderNumber || "AH-ORDER";
  const productName = params.productName || "Digital Subscription";
  
  const isRequested = params.status === "REQUESTED";
  const isApproved = params.status === "APPROVED";
  const isRefunded = params.status === "REFUNDED";
  const isRejected = params.status === "REJECTED";

  let subject = params.subject || `Refund Update: Order #${orderNumber} - AI Haat`;
  let badgeText = "Refund Update";
  let badgeBg = "rgba(252, 92, 3, 0.15)";
  let badgeColor = "#FC5C03";
  let badgeBorder = "rgba(252, 92, 3, 0.35)";
  
  if (isRequested) {
    subject = params.subject || `Refund Request Received: Order #${orderNumber} - AI Haat`;
    badgeText = "⏳ Refund Request Received";
    badgeBg = "rgba(245, 158, 11, 0.15)";
    badgeColor = "#D97706";
    badgeBorder = "rgba(245, 158, 11, 0.35)";
  } else if (isApproved) {
    subject = params.subject || `Refund Approved: Order #${orderNumber} - AI Haat`;
    badgeText = "✓ Refund Approved";
    badgeBg = "rgba(16, 185, 129, 0.15)";
    badgeColor = "#059669";
    badgeBorder = "rgba(16, 185, 129, 0.35)";
  } else if (isRefunded) {
    subject = params.subject || `Refund Processed: Order #${orderNumber} - AI Haat`;
    badgeText = "🎉 Refund Processed & Credited";
    badgeBg = "rgba(16, 185, 129, 0.15)";
    badgeColor = "#059669";
    badgeBorder = "rgba(16, 185, 129, 0.35)";
  } else if (isRejected) {
    subject = params.subject || `Refund Request Closed: Order #${orderNumber} - AI Haat`;
    badgeText = "Refund Request Closed";
    badgeBg = "rgba(239, 68, 68, 0.15)";
    badgeColor = "#DC2626";
    badgeBorder = "rgba(239, 68, 68, 0.35)";
  }

  const ctaText = params.refundMethod === "Wallet" ? "View Wallet" : "Access Customer Dashboard";
  const ctaUrl = params.refundMethod === "Wallet" ? "https://aihaat.shop/dashboard/wallet" : "https://aihaat.shop/dashboard";

  const contentHtml = `
    <!-- Greeting & Intro -->
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.3px;">
        Hello, ${escapeHtml(customerName)}!
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        Here is the latest update regarding your refund request for Order <b>#${escapeHtml(orderNumber)}</b>.
      </p>
    </div>

    <!-- Details Table -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin-bottom: 24px; padding: 18px 20px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Order Number</td>
              <td align="right" style="font-size: 12px; font-weight: 800; color: #0F172A; padding: 6px 0;">#${escapeHtml(orderNumber)}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Product</td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #0F172A; padding: 6px 0;">${escapeHtml(productName)}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Refund Amount</td>
              <td align="right" style="font-size: 12px; font-weight: 800; color: #0F172A; padding: 6px 0;">${formatCurrency(params.refundAmountBDT)}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Payout Method</td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #0F172A; padding: 6px 0;">${escapeHtml(params.refundMethod)}</td>
            </tr>
            ${params.payoutTrxId ? `
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Transaction ID</td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #0F172A; padding: 6px 0;">${escapeHtml(params.payoutTrxId)}</td>
            </tr>` : ""}
            ${params.walletBalanceBDT !== undefined ? `
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">New Wallet Balance</td>
              <td align="right" style="font-size: 12px; font-weight: 800; color: #0F172A; padding: 6px 0;">${formatCurrency(params.walletBalanceBDT)}</td>
            </tr>` : ""}
            <tr>
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0 0 0;">Status</td>
              <td align="right" style="font-size: 12px; font-weight: 800; color: ${badgeColor}; padding: 6px 0 0 0;">${escapeHtml(params.status)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Admin Notes -->
    ${params.adminNotes ? `
    <div style="background-color: #FFFFFF; border: 1px solid #CBD5E1; border-left: 4px solid #FC5C03; border-radius: 12px; padding: 16px 18px; margin-bottom: 24px;">
      <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748B; margin-bottom: 4px; letter-spacing: 0.5px;">
        👨‍💻 AI Haat Support Remarks:
      </div>
      <div style="font-size: 13px; color: #0F172A; line-height: 1.6;">
        ${escapeHtml(params.adminNotes).replace(/\n/g, "<br/>")}
      </div>
    </div>` : ""}

    <!-- Action Button -->
    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${escapeHtml(ctaUrl)}" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-size: 14px; font-weight: 800; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3);">
        ${ctaText}
      </a>
    </div>
  `;

  const html = renderBaseEmailLayout({
    previewText: `Your refund request for Order #${orderNumber} (${productName}) has an update: ${params.status}.`,
    badgeText,
    badgeBg,
    badgeColor,
    badgeBorder,
    contentHtml,
    footerNotice: "If you have any questions about this refund, please reply directly to this email.",
  });

  const text = `AI Haat - Refund Update
Hello ${customerName},

Order: #${orderNumber}
Product: ${productName}
Refund Amount: ৳${params.refundAmountBDT}
Method: ${params.refundMethod}
Status: ${params.status}
${params.payoutTrxId ? `Transaction ID: ${params.payoutTrxId}` : ""}
${params.walletBalanceBDT !== undefined ? `New Wallet Balance: ৳${params.walletBalanceBDT}` : ""}

${params.adminNotes ? `Admin Notes:\n${params.adminNotes}\n` : ""}
Manage your account: ${ctaUrl}`;

  return { subject, html, text };
}

// ─── 6. SUPPORT TICKET EMAIL TEMPLATES ───────────────────────────────────────

/**
 * Renders ticket created email.
 */
export function renderTicketCreatedEmail(params: TicketCreatedEmailParams): EmailRenderResult {
  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.3px;">
        Hello, ${escapeHtml(params.customerName)}! 🎫
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        We have received your support request. Our team is reviewing it and will get back to you shortly.
      </p>
    </div>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin-bottom: 24px; padding: 18px 20px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Ticket Number</td>
              <td align="right" style="font-size: 12px; font-weight: 800; color: #0F172A; padding: 6px 0;">#${escapeHtml(params.ticketNumber)}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Category</td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #0F172A; padding: 6px 0;">${escapeHtml(params.category)}</td>
            </tr>
            ${params.orderNumber ? `
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Order Number</td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #0F172A; padding: 6px 0;">#${escapeHtml(params.orderNumber)}</td>
            </tr>` : ""}
            <tr>
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0 0 0;">Subject</td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #0F172A; padding: 6px 0 0 0;">${escapeHtml(params.subject)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="https://aihaat.shop/dashboard/support" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-size: 14px; font-weight: 800; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3);">
        View Ticket in Dashboard
      </a>
    </div>
  `;

  const html = renderBaseEmailLayout({
    previewText: `Your support ticket #${params.ticketNumber} has been created.`,
    badgeText: "Ticket Created",
    badgeBg: "rgba(59, 130, 246, 0.15)",
    badgeColor: "#2563EB",
    badgeBorder: "rgba(59, 130, 246, 0.35)",
    contentHtml,
    footerNotice: "You can track your ticket status in your AI Haat dashboard.",
  });

  const text = `Hello ${params.customerName},\n\nYour support ticket #${params.ticketNumber} has been created.\nSubject: ${params.subject}\nCategory: ${params.category}\n\nView Ticket: https://aihaat.shop/dashboard/support`;
  
  return { subject: `Ticket Created: #${params.ticketNumber} - ${params.subject}`, html, text };
}

/**
 * Renders admin reply email.
 */
export function renderAdminReplyEmail(params: AdminReplyEmailParams): EmailRenderResult {
  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.3px;">
        Hello, ${escapeHtml(params.customerName)}!
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        You have a new response from our support team regarding your ticket <b>#${escapeHtml(params.ticketNumber)}</b>.
      </p>
    </div>
    
    <div style="background-color: #FFFFFF; border: 1px solid #CBD5E1; border-left: 4px solid #FC5C03; border-radius: 12px; padding: 16px 18px; margin-bottom: 24px;">
      <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748B; margin-bottom: 4px; letter-spacing: 0.5px;">
        👨‍💻 AI Haat Support Reply:
      </div>
      <div style="font-size: 13px; color: #0F172A; line-height: 1.6;">
        ${escapeHtml(params.adminReplySnippet).replace(/\n/g, "<br/>")}
      </div>
    </div>
    
    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="https://aihaat.shop/dashboard/support" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-size: 14px; font-weight: 800; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3);">
        Reply in Dashboard
      </a>
    </div>
  `;

  const html = renderBaseEmailLayout({
    previewText: `New reply on ticket #${params.ticketNumber}: ${params.subject}`,
    badgeText: "New Reply",
    badgeBg: "rgba(245, 158, 11, 0.15)",
    badgeColor: "#D97706",
    badgeBorder: "rgba(245, 158, 11, 0.35)",
    contentHtml,
    footerNotice: "Reply directly via your dashboard to keep all communication in one place.",
  });

  const text = `Hello ${params.customerName},\n\nNew reply on your ticket #${params.ticketNumber}:\n${params.adminReplySnippet}\n\nReply in Dashboard: https://aihaat.shop/dashboard/support`;
  
  return { subject: `New Reply: Ticket #${params.ticketNumber} - ${params.subject}`, html, text };
}

/**
 * Renders ticket resolved email.
 */
export function renderTicketResolvedEmail(params: TicketResolvedEmailParams): EmailRenderResult {
  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.3px;">
        Hello, ${escapeHtml(params.customerName)}! ✅
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        Your support ticket <b>#${escapeHtml(params.ticketNumber)}</b> has been marked as resolved.
      </p>
    </div>
    <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
      <div style="font-size: 13px; color: #065F46; line-height: 1.5;">
        We hope we were able to assist you satisfactorily. If you need further help or have another issue, you can always open a new ticket or review the resolution details in your dashboard.
      </div>
    </div>
    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="https://aihaat.shop/dashboard/support" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-size: 14px; font-weight: 800; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3);">
        View Ticket Details
      </a>
    </div>
  `;

  const html = renderBaseEmailLayout({
    previewText: `Your support ticket #${params.ticketNumber} is resolved.`,
    badgeText: "✓ Ticket Resolved",
    badgeBg: "rgba(16, 185, 129, 0.15)",
    badgeColor: "#059669",
    badgeBorder: "rgba(16, 185, 129, 0.35)",
    contentHtml,
    footerNotice: "Thank you for reaching out to AI Haat Support.",
  });

  const text = `Hello ${params.customerName},\n\nYour support ticket #${params.ticketNumber} has been resolved.\n\nView Details: https://aihaat.shop/dashboard/support`;
  
  return { subject: `Ticket Resolved: #${params.ticketNumber} - ${params.subject}`, html, text };
}

/**
 * Renders affiliate commission earned email.
 */
export function renderAffiliateCommissionEarnedEmail(params: AffiliateCommissionEarnedEmailParams): EmailRenderResult {
  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.3px;">
        Hello, ${escapeHtml(params.customerName)}! 🎉
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        You've just earned a new commission from a referred order!
      </p>
    </div>
    
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #FFF9F5 0%, #FFF1E8 100%); border: 1px solid #FFE4D6; border-radius: 20px; padding: 24px 20px; margin-bottom: 24px; text-align: center;">
      <tr>
        <td align="center">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; color: #C2410C; margin-bottom: 6px;">
            Commission Earned
          </div>
          <div style="font-size: 34px; font-weight: 900; color: #059669; letter-spacing: -0.5px; margin-bottom: 12px;">
            +${formatCurrency(params.commissionAmountBDT)}
          </div>
          <div style="display: inline-block; background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 12px; padding: 8px 18px;">
            <span style="font-size: 12px; color: #64748B; font-weight: 600;">Available Balance:</span>
            <span style="font-size: 14px; color: #0F172A; font-weight: 800; margin-left: 4px;">${formatCurrency(params.newBalanceBDT)}</span>
          </div>
        </td>
      </tr>
    </table>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin-bottom: 24px; padding: 18px 20px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr style="border-bottom: 1px dashed #E2E8F0;">
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0;">Referral Code Used</td>
              <td align="right" style="font-size: 12px; font-weight: 800; color: #0F172A; padding: 6px 0;">${escapeHtml(params.referralCode)}</td>
            </tr>
            <tr>
              <td style="font-size: 12px; font-weight: 600; color: #64748B; padding: 6px 0 0 0;">Referred Order Value</td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #0F172A; padding: 6px 0 0 0;">${formatCurrency(params.orderTotalBDT)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="https://aihaat.shop/dashboard/affiliate" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-size: 14px; font-weight: 800; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3);">
        View Earnings
      </a>
    </div>
  `;

  const html = renderBaseEmailLayout({
    previewText: `You've earned +${formatCurrency(params.commissionAmountBDT)} commission!`,
    badgeText: "Commission Earned",
    badgeBg: "rgba(16, 185, 129, 0.15)",
    badgeColor: "#059669",
    badgeBorder: "rgba(16, 185, 129, 0.35)",
    contentHtml,
    footerNotice: "Thank you for being a valued partner.",
  });

  const text = `Hello ${params.customerName},\n\nYou've earned +${formatCurrency(params.commissionAmountBDT)} commission!\nNew Available Balance: ${formatCurrency(params.newBalanceBDT)}\n\nView Earnings: https://aihaat.shop/dashboard/affiliate`;
  
  return { subject: `You've Earned +${formatCurrency(params.commissionAmountBDT)} Commission!`, html, text };
}

/**
 * Renders affiliate payout completed email.
 */
export function renderAffiliatePayoutCompletedEmail(params: AffiliatePayoutCompletedEmailParams): EmailRenderResult {
  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.3px;">
        Hello, ${escapeHtml(params.customerName)}! 💸
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        Your affiliate payout has been successfully processed!
      </p>
    </div>
    
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 16px; margin-bottom: 24px; padding: 18px 20px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr style="border-bottom: 1px dashed #A7F3D0;">
              <td style="font-size: 12px; font-weight: 600; color: #065F46; padding: 6px 0;">Payout Amount</td>
              <td align="right" style="font-size: 14px; font-weight: 800; color: #065F46; padding: 6px 0;">${formatCurrency(params.payoutAmountBDT)}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #A7F3D0;">
              <td style="font-size: 12px; font-weight: 600; color: #065F46; padding: 6px 0;">Method</td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #065F46; padding: 6px 0;">${escapeHtml(params.payoutMethod)}</td>
            </tr>
            ${params.payoutTrxId ? `
            <tr>
              <td style="font-size: 12px; font-weight: 600; color: #065F46; padding: 6px 0 0 0;">Transaction ID</td>
              <td align="right" style="font-size: 12px; font-weight: 700; color: #065F46; padding: 6px 0 0 0;">${escapeHtml(params.payoutTrxId)}</td>
            </tr>
            ` : ""}
          </table>
        </td>
      </tr>
    </table>
    
    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="https://aihaat.shop/dashboard/wallet" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-size: 14px; font-weight: 800; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3);">
        View Wallet / Payouts
      </a>
    </div>
  `;

  const html = renderBaseEmailLayout({
    previewText: `Your payout of ${formatCurrency(params.payoutAmountBDT)} is completed.`,
    badgeText: "Payout Completed",
    badgeBg: "rgba(16, 185, 129, 0.15)",
    badgeColor: "#059669",
    badgeBorder: "rgba(16, 185, 129, 0.35)",
    contentHtml,
    footerNotice: "Thank you for being a valued partner.",
  });

  const text = `Hello ${params.customerName},\n\nYour payout of ${formatCurrency(params.payoutAmountBDT)} is completed.\nMethod: ${params.payoutMethod}\n\nView Wallet: https://aihaat.shop/dashboard/wallet`;
  
  return { subject: `Payout Completed: ${formatCurrency(params.payoutAmountBDT)}`, html, text };
}

/**
 * Renders affiliate tier upgraded email.
 */
export function renderAffiliateTierUpgradedEmail(params: AffiliateTierUpgradedEmailParams): EmailRenderResult {
  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.3px;">
        Congratulations, ${escapeHtml(params.customerName)}! 🌟
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        You've been upgraded to a new affiliate tier!
      </p>
    </div>
    
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 16px; margin-bottom: 24px; padding: 18px 20px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr style="border-bottom: 1px dashed #FDE68A;">
              <td style="font-size: 12px; font-weight: 600; color: #92400E; padding: 6px 0;">New Tier</td>
              <td align="right" style="font-size: 16px; font-weight: 900; color: #92400E; padding: 6px 0;">${escapeHtml(params.newTier)}</td>
            </tr>
            <tr>
              <td style="font-size: 12px; font-weight: 600; color: #92400E; padding: 6px 0 0 0;">New Commission Rate</td>
              <td align="right" style="font-size: 14px; font-weight: 800; color: #92400E; padding: 6px 0 0 0;">${params.newRatePercent}%</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="https://aihaat.shop/dashboard/affiliate" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-size: 14px; font-weight: 800; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3);">
        View Affiliate Dashboard
      </a>
    </div>
  `;

  const html = renderBaseEmailLayout({
    previewText: `You've been upgraded to ${params.newTier} Tier!`,
    badgeText: "Tier Upgraded",
    badgeBg: "rgba(245, 158, 11, 0.15)",
    badgeColor: "#D97706",
    badgeBorder: "rgba(245, 158, 11, 0.35)",
    contentHtml,
    footerNotice: "Keep referring to earn more!",
  });

  const text = `Hello ${params.customerName},\n\nYou've been upgraded to ${params.newTier} Tier!\nNew Commission Rate: ${params.newRatePercent}%\n\nView Dashboard: https://aihaat.shop/dashboard/affiliate`;
  
  return { subject: `You've been upgraded to ${params.newTier} Tier!`, html, text };
}

export interface CustomerExpiryNoticeEmailParams {
  customerName: string;
  customerEmail: string;
  productName: string;
  variationName?: string;
  orderNumber: string;
  expiryDate: string;
  daysRemaining: number;
  renewalUrl?: string;
  vaultUrl?: string;
  subject?: string;
}

/**
 * 12. Customer Subscription & Warranty Expiry Notice Template
 */
export function renderCustomerExpiryNoticeEmail(params: CustomerExpiryNoticeEmailParams): EmailRenderResult {
  const daysText = params.daysRemaining <= 1 ? "1 day (Tomorrow)" : `${params.daysRemaining} days`;
  const subject = params.subject || `⚠️ Action Required: Your subscription for ${params.productName} expires in ${daysText}`;

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: #FEF3C7; border-radius: 50%; font-size: 26px; margin-bottom: 12px;">
        ⏳
      </div>
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0;">
        Subscription Expiring Soon
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        Hello <strong>${escapeHtml(params.customerName)}</strong>, your digital subscription is coming to an end.
      </p>
    </div>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 16px; margin-bottom: 24px; padding: 18px 20px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr style="border-bottom: 1px dashed #FDE68A;">
              <td style="font-size: 12px; font-weight: 600; color: #92400E; padding: 6px 0;">Product</td>
              <td align="right" style="font-size: 14px; font-weight: 800; color: #92400E; padding: 6px 0;">${escapeHtml(params.productName)} ${params.variationName ? `(${escapeHtml(params.variationName)})` : ""}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #FDE68A;">
              <td style="font-size: 12px; font-weight: 600; color: #92400E; padding: 6px 0;">Order Reference</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #0F172A; font-family: monospace; padding: 6px 0;">${escapeHtml(params.orderNumber)}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #FDE68A;">
              <td style="font-size: 12px; font-weight: 600; color: #92400E; padding: 6px 0;">Time Remaining</td>
              <td align="right" style="font-size: 14px; font-weight: 900; color: #DC2626; padding: 6px 0;">${daysText}</td>
            </tr>
            <tr>
              <td style="font-size: 12px; font-weight: 600; color: #92400E; padding: 6px 0 0 0;">Expiry Date</td>
              <td align="right" style="font-size: 13px; font-weight: 700; color: #0F172A; padding: 6px 0 0 0;">${escapeHtml(params.expiryDate)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size: 13px; color: #64748B; line-height: 1.6; margin-bottom: 24px; text-align: center;">
      Renew now to ensure uninterrupted access to your AI tools, software licenses, and dedicated support.
    </p>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${params.renewalUrl || "https://aihaat.shop/shop"}" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-size: 14px; font-weight: 800; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3); margin-right: 8px;">
        Renew Subscription
      </a>
      <a href="${params.vaultUrl || "https://aihaat.shop/dashboard/keys"}" target="_blank" style="display: inline-block; background: #F1F5F9; color: #334155; text-decoration: none; padding: 14px 24px; border-radius: 14px; font-size: 14px; font-weight: 700; border: 1px solid #CBD5E1;">
        View Digital Vault
      </a>
    </div>
  `;

  const html = renderBaseEmailLayout({
    previewText: `Your ${params.productName} subscription expires in ${daysText}. Renew now!`,
    badgeText: "Expiry Notice",
    badgeBg: "rgba(245, 158, 11, 0.15)",
    badgeColor: "#D97706",
    badgeBorder: "rgba(245, 158, 11, 0.35)",
    contentHtml,
    footerNotice: "Need help renewing? Contact our 24/7 WhatsApp or Support Ticket service.",
  });

  const text = `Hello ${params.customerName},\n\nYour subscription for ${params.productName} (${params.orderNumber}) will expire in ${daysText} on ${params.expiryDate}.\n\nRenew your access today: ${params.renewalUrl || "https://aihaat.shop/shop"}\nView Vault: https://aihaat.shop/dashboard/keys\n\nAI Haat Team`;

  return { subject, html, text };
}

/**
 * 13. Abandoned Cart Recovery Template (Stage 1 & Stage 2)
 */
export function renderAbandonedCartRecoveryEmail(params: AbandonedCartRecoveryEmailParams): EmailRenderResult {
  const customerName = params.customerName || "Valued Shopper";
  const isStage2 = params.stage === 2;
  const couponCode = params.couponCode || "SAVE5";
  const discountPercent = params.discountPercent || 5;

  const defaultSubject = isStage2
    ? `🎁 Special ${discountPercent}% Off: Complete your AI Haat order before items expire!`
    : `🛒 You left items in your AI Haat cart! Complete your order`;
  const subject = params.subject || defaultSubject;

  const previewText = isStage2
    ? `Claim your exclusive ${discountPercent}% discount with code ${couponCode} and finish checkout!`
    : `Your selected AI subscriptions are waiting in your cart. Instant delivery available.`;

  const badgeText = isStage2 ? `Exclusive ${discountPercent}% Off` : "Cart Saved";
  const badgeColor = isStage2 ? "#059669" : "#FC5C03";
  const badgeBg = isStage2 ? "rgba(16, 185, 129, 0.15)" : "rgba(252, 92, 3, 0.15)";
  const badgeBorder = isStage2 ? "rgba(16, 185, 129, 0.35)" : "rgba(252, 92, 3, 0.35)";

  const itemsRows = params.items
    .map((item) => {
      const pName = escapeHtml(item.productName);
      const vName = item.variationName ? ` <span style="color: #64748B; font-size: 11px;">(${escapeHtml(item.variationName)})</span>` : "";
      const qty = item.quantity || 1;
      const price = item.priceBDT ? formatCurrency(item.priceBDT * qty) : "";

      return `
        <tr style="border-bottom: 1px dashed #E2E8F0;">
          <td style="padding: 10px 0; font-size: 13px; font-weight: 700; color: #0F172A;">
            ${pName}${vName}
            <div style="font-size: 11px; font-weight: 500; color: #94A3B8;">Qty: ${qty}</div>
          </td>
          <td align="right" style="padding: 10px 0; font-size: 13px; font-weight: 800; color: #0F172A;">
            ${price}
          </td>
        </tr>
      `;
    })
    .join("");

  const couponSectionHtml = isStage2
    ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ECFDF5; border: 1.5px dashed #10B981; border-radius: 16px; margin: 20px 0; padding: 16px 20px; text-align: center;">
      <tr>
        <td>
          <div style="font-size: 11px; font-weight: 800; color: #065F46; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">
            🎉 Special Retention Voucher
          </div>
          <div style="font-size: 13px; color: #047857; margin-bottom: 10px;">
            Apply this coupon code at checkout for <b>${discountPercent}% OFF</b>:
          </div>
          <div style="display: inline-block; background-color: #FFFFFF; border: 1px solid #A7F3D0; border-radius: 10px; padding: 8px 24px; font-family: monospace; font-size: 18px; font-weight: 900; color: #065F46; letter-spacing: 2px;">
            ${escapeHtml(couponCode)}
          </div>
        </td>
      </tr>
    </table>
    `
    : "";

  const contentHtml = `
    <div style="margin-bottom: 20px;">
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; letter-spacing: -0.3px;">
        Hello, ${escapeHtml(customerName)}! 👋
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        ${
          isStage2
            ? "We noticed you haven't finished your purchase yet. Because we'd love to have you onboard, we've unlocked a special discount just for you!"
            : "You left items in your AI Haat shopping cart! Your items are reserved, and you can restore your cart with a single click."
        }
      </p>
    </div>

    ${couponSectionHtml}

    <!-- Items Summary Box -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin-bottom: 24px; padding: 16px 20px;">
      <tr>
        <td>
          <div style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px;">
            Reserved Cart Items
          </div>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            ${itemsRows}
            <tr>
              <td style="padding-top: 12px; font-size: 13px; font-weight: 700; color: #475569;">Cart Subtotal</td>
              <td align="right" style="padding-top: 12px; font-size: 15px; font-weight: 900; color: #0F172A;">
                ${formatCurrency(params.subtotalBDT)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Trust Badges -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFF9F5; border: 1px solid #FFE4D6; border-radius: 14px; padding: 14px 18px; margin-bottom: 24px;">
      <tr>
        <td style="font-size: 12px; color: #9A3412; line-height: 1.7;">
          ⚡ <b>Instant Delivery:</b> Credentials delivered to your vault in seconds.<br/>
          🛡️ <b>100% Replacement Warranty:</b> Active for your full subscription period.<br/>
          💳 <b>Local Payments:</b> bKash, Nagad, Rocket & Wallet support.
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin: 28px 0 12px 0;">
      <a href="${params.recoveryUrl}" target="_blank" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; text-decoration: none; padding: 14px 34px; border-radius: 14px; font-size: 15px; font-weight: 800; box-shadow: 0 6px 18px rgba(252, 92, 3, 0.3);">
        ${isStage2 ? `🎁 Claim ${discountPercent}% Off & Complete Order` : "👉 Restore Cart & Complete Order"}
      </a>
    </div>
  `;

  const unsubscribeUrl = params.unsubscribeUrl || `https://aihaat.shop/api/unsubscribe?email=${encodeURIComponent(params.customerEmail)}`;

  const html = renderBaseEmailLayout({
    previewText,
    badgeText,
    badgeBg,
    badgeColor,
    badgeBorder,
    contentHtml,
    footerNotice: `Don't want to receive cart reminders? <a href="${unsubscribeUrl}" target="_blank" style="color: #64748B; text-decoration: underline;">Unsubscribe here</a>.`,
  });

  const text = `Hello ${customerName},\n\nYou left items in your AI Haat cart!\n\nSubtotal: ${formatCurrency(params.subtotalBDT)}\n${isStage2 ? `Use coupon ${couponCode} for ${discountPercent}% off!\n` : ""}Complete your order here: ${params.recoveryUrl}\n\nAI Haat Team`;

  return { subject, html, text };
}

/**
 * 14. Post-Delivery Review Collection Template
 */
export function renderReviewRequestEmail(params: ReviewRequestEmailParams): EmailRenderResult {
  const customerName = params.customerName || "Valued Customer";
  const subject = params.subject || `⭐ How was your experience with ${params.productName}? Leave a 1-click rating`;
  const previewText = `Tell us about your experience with ${params.productName}. Click a star to rate instantly!`;

  const ratingOptions = [
    { stars: 5, label: "5 ★ Excellent" },
    { stars: 4, label: "4 ★ Great" },
    { stars: 3, label: "3 ★ Good" },
    { stars: 2, label: "2 ★ Fair" },
    { stars: 1, label: "1 ★ Poor" },
  ];

  const ratingButtonsHtml = ratingOptions
    .map((opt) => {
      const sep = params.quickRateBaseUrl.includes("?") ? "&" : "?";
      const rateUrl = `${params.quickRateBaseUrl}${sep}rating=${opt.stars}`;
      return `
        <a href="${rateUrl}" target="_blank" style="display: inline-block; margin: 4px; padding: 10px 16px; background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 12px; font-size: 13px; font-weight: 700; color: #0F172A; text-decoration: none; min-width: 90px; text-align: center;">
          ${opt.label}
        </a>
      `;
    })
    .join("");

  const sep = params.quickRateBaseUrl.includes("?") ? "&" : "?";
  const fullReviewUrl = params.reviewModalUrl || `${params.quickRateBaseUrl}${sep}full=true`;

  const contentHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; background-color: #FEF3C7; border-radius: 50%; font-size: 28px; margin-bottom: 12px;">
        ⭐
      </div>
      <h1 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0;">
        How Was Your Experience?
      </h1>
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0;">
        Hello <strong>${escapeHtml(customerName)}</strong>, your order <strong>${escapeHtml(params.orderNumber)}</strong> for <strong>${escapeHtml(params.productName)}</strong> was delivered.
      </p>
    </div>

    <!-- Product Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; margin-bottom: 24px; padding: 18px 20px; text-align: center;">
      <tr>
        <td>
          <div style="font-size: 15px; font-weight: 800; color: #0F172A; margin-bottom: 4px;">
            ${escapeHtml(params.productName)} ${params.variationName ? `(${escapeHtml(params.variationName)})` : ""}
          </div>
          <div style="font-size: 12px; color: #64748B;">
            Order Reference: <span style="font-family: monospace; font-weight: 700; color: #0F172A;">${escapeHtml(params.orderNumber)}</span>
          </div>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin-bottom: 20px;">
      <p style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 12px;">
        Tap below to rate your experience in 1 click:
      </p>
      <div style="display: block; text-align: center;">
        ${ratingButtonsHtml}
      </div>
    </div>

    <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px dashed #E2E8F0;">
      <p style="font-size: 12px; color: #64748B; margin-bottom: 10px;">
        Want to write a detailed review with comments?
      </p>
      <a href="${fullReviewUrl}" target="_blank" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; text-decoration: none; padding: 10px 24px; border-radius: 10px; font-size: 12px; font-weight: 700;">
        ✍️ Write Full Review
      </a>
      <div style="font-size: 11px; color: #94A3B8; margin-top: 8px;">
        🛡️ A <b>Verified Buyer</b> badge will automatically be attached to your review.
      </div>
    </div>
  `;

  const html = renderBaseEmailLayout({
    previewText,
    badgeText: "Review Request",
    badgeBg: "rgba(59, 130, 246, 0.15)",
    badgeColor: "#2563EB",
    badgeBorder: "rgba(59, 130, 246, 0.35)",
    contentHtml,
    footerNotice: "Thank you for helping other creators make informed decisions.",
  });

  const text = `Hello ${customerName},\n\nHow was your experience with ${params.productName} (Order: ${params.orderNumber})?\n\nRate 5 Stars: ${params.quickRateBaseUrl}${sep}rating=5\nRate 4 Stars: ${params.quickRateBaseUrl}${sep}rating=4\nRate 3 Stars: ${params.quickRateBaseUrl}${sep}rating=3\n\nAI Haat Team`;

  return { subject, html, text };
}
