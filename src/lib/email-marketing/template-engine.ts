import { EmailTemplateSeed } from "./types";

export interface TemplateContext {
  customerName?: string;
  firstName?: string;
  email: string;
  siteName?: string;
  siteUrl?: string;
  customerDashboardUrl?: string;
  orderCount?: number;
  totalSpent?: number;
  lastOrderDate?: string;
  unsubscribeUrl?: string;
  productName?: string;
  productUrl?: string;
  productPrice?: string;
  couponCode?: string;
  [key: string]: any;
}

/**
 * Escapes HTML characters to prevent XSS in dynamic variables.
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Replaces all supported dynamic template variables with sanitized values.
 */
export function renderDynamicVariables(content: string, ctx: TemplateContext): string {
  if (!content) return "";

  const siteName = ctx.siteName || "AI Haat";
  const siteUrl = ctx.siteUrl || "https://aihaat.shop";
  const customerName = ctx.customerName || "Valued Customer";
  const firstName = ctx.firstName || (customerName.split(" ")[0] || "Valued Customer");
  const email = ctx.email || "";
  const customerDashboardUrl = ctx.customerDashboardUrl || `${siteUrl}/dashboard`;
  const orderCount = ctx.orderCount !== undefined ? String(ctx.orderCount) : "0";
  const totalSpent = ctx.totalSpent !== undefined ? `৳${ctx.totalSpent}` : "৳0";
  const lastOrderDate = ctx.lastOrderDate || "N/A";
  const unsubscribeUrl = ctx.unsubscribeUrl || `${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
  const productName = ctx.productName || "Featured Tool";
  const productUrl = ctx.productUrl || `${siteUrl}/products`;
  const productPrice = ctx.productPrice || "";
  const couponCode = ctx.couponCode || "";

  const replacements: Record<string, string> = {
    customer_name: escapeHtml(customerName),
    first_name: escapeHtml(firstName),
    email: escapeHtml(email),
    site_name: escapeHtml(siteName),
    site_url: siteUrl,
    customer_dashboard_url: customerDashboardUrl,
    order_count: escapeHtml(orderCount),
    total_spent: escapeHtml(totalSpent),
    last_order_date: escapeHtml(lastOrderDate),
    unsubscribe_url: unsubscribeUrl,
    product_name: escapeHtml(productName),
    product_url: productUrl,
    product_price: escapeHtml(productPrice),
    coupon_code: escapeHtml(couponCode),
  };

  // Replace double curly braces {{variable}}
  return content.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (match, varName) => {
    const key = varName.toLowerCase();
    if (key in replacements) {
      return replacements[key];
    }
    if (ctx[varName] !== undefined) {
      return escapeHtml(String(ctx[varName]));
    }
    return match;
  });
}

/**
 * Wraps raw HTML content inside the bulletproof AI Haat responsive master email frame.
 */
export function wrapInMasterEmailLayout(options: {
  contentHtml: string;
  preheader?: string;
  unsubscribeUrl?: string;
  siteUrl?: string;
  trackingPixelUrl?: string;
}): string {
  const siteUrl = options.siteUrl || "https://aihaat.shop";
  const preheader = options.preheader || "Exclusive updates & offers from AI Haat";
  const unsubUrl = options.unsubscribeUrl || `${siteUrl}/unsubscribe`;
  const trackingPixel = options.trackingPixelUrl
    ? `<img src="${options.trackingPixelUrl}" width="1" height="1" border="0" style="display:none;width:1px;height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;" alt="" />`
    : "";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
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
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .content-padding { padding: 20px 16px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .hero-title { font-size: 22px !important; line-height: 28px !important; }
    }
  </style>
</head>
<body style="background-color: #F8FAFC; margin: 0; padding: 0; -webkit-font-smoothing: antialiased;">
  <!-- Preheader preview text (hidden) -->
  <div style="display: none; font-size: 1px; color: #F8FAFC; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${preheader} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px 36px 12px;">
        <!-- Container table 600px -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); padding: 28px 24px; border-bottom: 3px solid #FC5C03;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <div style="font-size: 26px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
                        AI <span style="color: #FC5C03;">HAAT</span>
                      </div>
                      <div style="font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 3px;">
                        Premium Digital Marketplace
                      </div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td class="content-padding" style="padding: 36px 32px; background-color: #FFFFFF; font-size: 15px; line-height: 1.6; color: #334155;">
              ${options.contentHtml}
            </td>
          </tr>

          <!-- Guarantee Badge Strip -->
          <tr>
            <td style="background-color: #FFF9F5; border-top: 1px solid #FFE4D6; padding: 18px 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 12px; font-weight: 700; color: #9A3412;">
                    ⚡ Instant Automatic Delivery &nbsp;•&nbsp; 🛡️ Replacement Warranty &nbsp;•&nbsp; 🔒 100% Safe Payments
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0F172A; padding: 28px 24px; text-align: center; color: #94A3B8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 10px 0; font-weight: 700; color: #FFFFFF; font-size: 13px;">
                AI Haat — Bangladesh's #1 Digital Tool & AI Subscription Store
              </p>
              <p style="margin: 0 0 16px 0; color: #64748B; font-size: 11px;">
                Official Inquiries: <a href="mailto:support@aihaat.shop" style="color: #FC5C03; text-decoration: none;">support@aihaat.shop</a> | Website: <a href="${siteUrl}" target="_blank" style="color: #FC5C03; text-decoration: none;">aihaat.shop</a>
              </p>
              
              <div style="border-top: 1px solid #1E293B; margin-top: 16px; padding-top: 16px;">
                <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748B;">
                  You are receiving this promotional broadcast because you have an account or opted in on AI Haat.
                </p>
                <p style="margin: 0; font-size: 11px;">
                  <a href="${unsubUrl}" target="_blank" style="color: #94A3B8; text-decoration: underline;">
                    Unsubscribe from marketing emails
                  </a>
                  &nbsp;|&nbsp;
                  <a href="${siteUrl}/dashboard/preferences" target="_blank" style="color: #94A3B8; text-decoration: underline;">
                    Manage Email Preferences
                  </a>
                </p>
              </div>
            </td>
          </tr>

        </table>
        
        <!-- Tracking Pixel -->
        ${trackingPixel}
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 9 Production-Grade Bulletproof Seed Templates
 */
export const INITIAL_EMAIL_TEMPLATES: EmailTemplateSeed[] = [
  {
    name: "Promotional Mega Offer",
    category: "PROMOTIONAL",
    description: "Highlight huge percentage discounts, featured subscriptions, and strong CTA.",
    subject: "🔥 Exclusive Deal: Get Up to 40% OFF on Top AI Tools!",
    contentHtml: `<h1 class="hero-title" style="font-size: 24px; font-weight: 900; color: #0F172A; margin: 0 0 12px 0;">
  Special Offer Just for You, {{first_name}}! 🚀
</h1>
<p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
  Upgrade your daily workflow with genuine AI subscriptions at Bangladesh's lowest price. For a limited time, enjoy exclusive savings across our entire catalog!
</p>

<!-- Promo Box -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%); border: 2px dashed #FC5C03; border-radius: 16px; margin: 0 0 28px 0; padding: 20px;">
  <tr>
    <td align="center">
      <span style="font-size: 12px; font-weight: 800; color: #C2410C; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">
        Use Coupon Code at Checkout:
      </span>
      <div style="display: inline-block; background-color: #FFFFFF; border: 1px solid #FDBA74; padding: 8px 24px; border-radius: 10px; font-size: 20px; font-family: monospace; font-weight: 900; color: #EA580C; letter-spacing: 2px;">
        {{coupon_code}}
      </div>
      <span style="font-size: 11px; color: #9A3412; display: block; margin-top: 6px;">
        Valid until midnight. Instant activation guaranteed!
      </span>
    </td>
  </tr>
</table>

<!-- CTA Button -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
  <tr>
    <td align="center">
      <a href="{{site_url}}/shop" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%); color: #FFFFFF; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 38px; border-radius: 14px; box-shadow: 0 6px 20px rgba(252, 92, 3, 0.35);">
        🛒 Claim Your Offer Now
      </a>
    </td>
  </tr>
</table>`,
  },
  {
    name: "New Product Launch",
    category: "NEW_PRODUCT",
    description: "Announce brand new digital tools or fresh AI accounts added to inventory.",
    subject: "✨ Newly Added on AI Haat: {{product_name}} is Here!",
    contentHtml: `<div style="text-align: center; margin-bottom: 20px;">
  <span style="display: inline-block; background-color: #EFF6FF; color: #1D4ED8; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; border: 1px solid #BFDBFE;">
    🎉 New In Stock
  </span>
</div>
<h1 class="hero-title" style="font-size: 24px; font-weight: 900; color: #0F172A; text-align: center; margin: 0 0 12px 0;">
  {{product_name}} is Now Available!
</h1>
<p style="font-size: 14px; color: #475569; text-align: center; line-height: 1.6; margin: 0 0 24px 0;">
  Hey {{first_name}}, we've just stocked genuine licenses and subscriptions for <strong>{{product_name}}</strong>. Get yours today with instant automatic delivery!
</p>

<!-- Feature Bullets -->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
  <tr>
    <td>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.8;">
        <li><strong>Full Term Warranty:</strong> Complete replacement warranty for the duration.</li>
        <li><strong>Instant Credentials:</strong> Delivered straight to your Digital Vault in seconds.</li>
        <li><strong>bKash / Nagad / Rocket:</strong> Seamless local payment and auto-verification.</li>
      </ul>
    </td>
  </tr>
</table>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px;">
  <tr>
    <td align="center">
      <a href="{{product_url}}" target="_blank" style="display: inline-block; background: #FC5C03; color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 34px; border-radius: 12px;">
        🚀 Explore {{product_name}}
      </a>
    </td>
  </tr>
</table>`,
  },
  {
    name: "Flash Sale Countdown",
    category: "FLASH_SALE",
    description: "High-urgency flash sale template with urgency badges and instant call to action.",
    subject: "⚡ FLASH SALE: 24 Hours Only — Huge Price Drop!",
    contentHtml: `<div style="background-color: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 12px; padding: 12px; text-align: center; margin-bottom: 20px;">
  <span style="font-size: 13px; font-weight: 800; color: #DC2626;">
    ⏰ Limited Window: Sale Ends in 24 Hours!
  </span>
</div>
<h1 class="hero-title" style="font-size: 24px; font-weight: 900; color: #0F172A; margin: 0 0 10px 0;">
  Midnight Flash Deals are Live! 🔥
</h1>
<p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
  Hello {{first_name}}, grab premium AI subscriptions, Canva, ChatGPT Plus, Claude, Midjourney, and developer licenses at unbeatable flash sale pricing. Stocks are limited!
</p>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
  <tr>
    <td align="center">
      <a href="{{site_url}}/shop" target="_blank" style="display: inline-block; background: #DC2626; color: #FFFFFF; font-size: 15px; font-weight: 800; text-decoration: none; padding: 15px 36px; border-radius: 12px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);">
        ⚡ View Flash Sale Catalog
      </a>
    </td>
  </tr>
</table>`,
  },
  {
    name: "VIP Coupon Drop",
    category: "COUPON",
    description: "Dedicated voucher voucher template designed for VIP customers and repeat buyers.",
    subject: "🎁 A Special Gift for You: Flat Discount Voucher Inside!",
    contentHtml: `<h1 class="hero-title" style="font-size: 24px; font-weight: 900; color: #0F172A; margin: 0 0 12px 0;">
  Here is Your Exclusive VIP Voucher 🎁
</h1>
<p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
  Thank you for choosing AI Haat! As one of our valued customers, here is a special coupon you can use on your next order:
</p>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF5FF; border: 2px dashed #9333EA; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
  <tr>
    <td>
      <span style="font-size: 11px; font-weight: 800; color: #7E22CE; text-transform: uppercase; letter-spacing: 1.5px;">
        EXCLUSIVE PROMO CODE
      </span>
      <div style="font-size: 26px; font-weight: 900; color: #6B21A8; font-family: monospace; letter-spacing: 3px; margin: 10px 0;">
        {{coupon_code}}
      </div>
      <p style="font-size: 12px; color: #9333EA; margin: 0;">
        Apply during checkout on any subscription tool.
      </p>
    </td>
  </tr>
</table>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center">
      <a href="{{site_url}}/shop" target="_blank" style="display: inline-block; background: #9333EA; color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 34px; border-radius: 12px;">
        ✨ Redeem My Coupon
      </a>
    </td>
  </tr>
</table>`,
  },
  {
    name: "Product Update & Changelog",
    category: "PRODUCT_UPDATE",
    description: "Inform users about platform updates, vault improvements, and new features.",
    subject: "📢 Platform Update: Faster Deliveries & New Payment Gateways",
    contentHtml: `<h1 class="hero-title" style="font-size: 22px; font-weight: 900; color: #0F172A; margin: 0 0 12px 0;">
  What's New on AI Haat 🚀
</h1>
<p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
  Dear {{first_name}}, we've rolled out several exciting upgrades to make your shopping experience smoother, safer, and faster:
</p>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; border-collapse: separate; border-spacing: 0 10px;">
  <tr>
    <td style="background-color: #F8FAFC; border-left: 4px solid #FC5C03; padding: 14px 16px; border-radius: 0 10px 10px 0;">
      <strong style="color: #0F172A; font-size: 14px; display: block;">⚡ Instant Delivery Engine 2.0</strong>
      <span style="font-size: 13px; color: #64748B;">Automated stock dispensing delivers credentials to your customer vault in under 60 seconds.</span>
    </td>
  </tr>
  <tr>
    <td style="background-color: #F8FAFC; border-left: 4px solid #10B981; padding: 14px 16px; border-radius: 0 10px 10px 0;">
      <strong style="color: #0F172A; font-size: 14px; display: block;">🛡️ 1-Click Replacement Portal</strong>
      <span style="font-size: 13px; color: #64748B;">Submit warranty claims directly from your customer dashboard with real-time status tracking.</span>
    </td>
  </tr>
</table>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center">
      <a href="{{customer_dashboard_url}}" target="_blank" style="display: inline-block; background: #0F172A; color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 30px; border-radius: 12px;">
        👤 Visit Customer Portal
      </a>
    </td>
  </tr>
</table>`,
  },
  {
    name: "Weekly AI Digest & Newsletter",
    category: "NEWSLETTER",
    description: "Curated weekly news, tool reviews, and trending AI applications.",
    subject: "📰 AI Haat Weekly: Top AI Tools & Trends You Shouldn't Miss",
    contentHtml: `<h1 class="hero-title" style="font-size: 24px; font-weight: 900; color: #0F172A; margin: 0 0 12px 0;">
  AI Haat Weekly Digest 🧠
</h1>
<p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
  Welcome to this week's edition of the AI Haat digest, {{first_name}}! Here are the most impactful AI updates and recommendations for digital creators and professionals.
</p>

<!-- Newsletter Item -->
<div style="border-bottom: 1px solid #E2E8F0; padding-bottom: 16px; margin-bottom: 16px;">
  <h3 style="font-size: 16px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0;">
    1. Choosing the Right LLM for Coding & Content
  </h3>
  <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0;">
    Claude 3.5 Sonnet and ChatGPT Plus continue to dominate programmer benchmarks. Check our store for instant access to developer plans.
  </p>
</div>

<div style="border-bottom: 1px solid #E2E8F0; padding-bottom: 16px; margin-bottom: 20px;">
  <h3 style="font-size: 16px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0;">
    2. Pro Graphic Design on a Budget
  </h3>
  <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0;">
    Canva Pro edu & team accounts provide all premium stock photos and brand kits without the hefty monthly USD subscription.
  </p>
</div>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center">
      <a href="{{site_url}}/shop" target="_blank" style="display: inline-block; background: #FC5C03; color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; padding: 13px 32px; border-radius: 12px;">
        Browse All Available Tools →
      </a>
    </td>
  </tr>
</table>`,
  },
  {
    name: "Customer Announcement",
    category: "ANNOUNCEMENT",
    description: "Official notices, store schedules, support updates, and important announcements.",
    subject: "📢 Important Announcement from AI Haat",
    contentHtml: `<h1 class="hero-title" style="font-size: 22px; font-weight: 900; color: #0F172A; margin: 0 0 12px 0;">
  Official Customer Notice 📋
</h1>
<p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
  Dear {{customer_name}},
</p>
<p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
  We are writing to share an important service announcement with all our registered members. Our 24/7 Telegram & WhatsApp support lines are now enhanced with faster resolution times for warranty replacements and digital vault questions.
</p>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin: 20px 0;">
  <tr>
    <td>
      <span style="font-size: 12px; font-weight: 700; color: #0F172A; display: block; margin-bottom: 4px;">Need instant support?</span>
      <span style="font-size: 12px; color: #64748B;">Reach us anytime via Telegram or WhatsApp directly through the AI Haat website.</span>
    </td>
  </tr>
</table>

<p style="font-size: 13px; color: #64748B; margin: 0;">
  Warm regards,<br />
  <strong>The AI Haat Team</strong>
</p>`,
  },
  {
    name: "Customer Re-engagement",
    category: "RE_ENGAGEMENT",
    description: "Win back inactive customers with an exclusive re-activation discount.",
    subject: "We Miss You at AI Haat! Here's a Special Discount Just for You 👋",
    contentHtml: `<h1 class="hero-title" style="font-size: 24px; font-weight: 900; color: #0F172A; margin: 0 0 12px 0;">
  We Miss You, {{first_name}}! 👋
</h1>
<p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
  It's been a while since your last visit to AI Haat. We've added dozens of new AI tools, software licenses, and instant auto-delivery stocks since you were last here!
</p>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 24px;">
  <tr>
    <td>
      <span style="font-size: 12px; font-weight: 800; color: #C2410C; display: block; margin-bottom: 6px;">
        Use this special comeback coupon:
      </span>
      <span style="font-size: 22px; font-weight: 900; color: #EA580C; font-family: monospace;">
        {{coupon_code}}
      </span>
    </td>
  </tr>
</table>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center">
      <a href="{{site_url}}/shop" target="_blank" style="display: inline-block; background: #FC5C03; color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 34px; border-radius: 12px;">
        🛒 Rediscover AI Haat
      </a>
    </td>
  </tr>
</table>`,
  },
  {
    name: "Festival & Seasonal Celebration",
    category: "SEASONAL",
    description: "Festive celebration email (Eid, Ramadan, Puja, New Year) with special holiday deals.",
    subject: "🌙 Festive Wishes & Special Celebration Discounts from AI Haat!",
    contentHtml: `<div style="text-align: center; margin-bottom: 16px;">
  <span style="font-size: 32px;">🎉</span>
</div>
<h1 class="hero-title" style="font-size: 24px; font-weight: 900; color: #0F172A; text-align: center; margin: 0 0 12px 0;">
  Warm Festive Wishes to You & Your Family! ✨
</h1>
<p style="font-size: 14px; color: #475569; text-align: center; line-height: 1.6; margin: 0 0 24px 0;">
  Dear {{first_name}}, to celebrate this joyful season, we are offering exclusive festive discounts across our entire catalog of premium digital subscriptions!
</p>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); border-radius: 16px; padding: 24px; text-align: center; color: #FFFFFF; margin-bottom: 24px;">
  <tr>
    <td>
      <span style="font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1.5px;">
        SEASONAL FESTIVE VOUCHER
      </span>
      <div style="font-size: 26px; font-weight: 900; color: #FC5C03; font-family: monospace; letter-spacing: 3px; margin: 8px 0;">
        {{coupon_code}}
      </div>
      <span style="font-size: 12px; color: #E2E8F0;">
        Enjoy instant discounts on all AI tools & subscriptions!
      </span>
    </td>
  </tr>
</table>

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td align="center">
      <a href="{{site_url}}/shop" target="_blank" style="display: inline-block; background: #FC5C03; color: #FFFFFF; font-size: 14px; font-weight: 800; text-decoration: none; padding: 15px 36px; border-radius: 14px; box-shadow: 0 6px 20px rgba(252, 92, 3, 0.35);">
        🎁 Explore Festive Deals
      </a>
    </td>
  </tr>
</table>`,
  },
];
/**
 * Seeds default templates into the database if not already present.
 */
export async function ensureDefaultTemplates(prismaInstance: any) {
  const count = await prismaInstance.emailTemplate.count();
  if (count === 0) {
    for (const t of INITIAL_EMAIL_TEMPLATES) {
      await prismaInstance.emailTemplate.create({
        data: {
          name: t.name,
          category: t.category,
          description: t.description,
          subject: t.subject,
          contentHtml: t.contentHtml,
          isDefault: true,
        },
      });
    }
  }
}