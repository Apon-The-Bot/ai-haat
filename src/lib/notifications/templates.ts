/**
 * AI Haat - Centralized Transactional Email Templates
 * Mobile-responsive, bilingual (Bangla + English), XSS-sanitized HTML & Plain-Text
 */

import {
  OrderCreatedPayload,
  PaymentVerifiedPayload,
  OrderDeliveredPayload,
  WalletTopupPayload,
  RefundUpdatePayload,
  ReplacementUpdatePayload,
  SupportUpdatePayload,
  SecurityOtpPayload,
} from "./types";

/**
 * XSS & HTML Injection Sanitizer
 */
export function escapeHtml(str: any): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Master Email Layout Shell with AI Haat Brand Styling
 */
export function renderEmailShell(params: {
  title: string;
  preheader?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryNotice?: string;
}): string {
  const { title, preheader, bodyHtml, ctaText, ctaUrl, secondaryNotice } = params;

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f8fafc; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; }
    .brand-logo { color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; text-decoration: none; display: inline-block; }
    .brand-logo span { color: #FC5C03; }
    .content { padding: 36px 32px; color: #334155; line-height: 1.6; font-size: 15px; }
    .btn { display: inline-block; background-color: #FC5C03; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 14px 32px; text-decoration: none; border-radius: 12px; margin: 24px 0 16px; text-align: center; }
    .footer { background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer a { color: #FC5C03; text-decoration: none; font-weight: 600; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>` : ""}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding: 24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0" border="0">
          <!-- Header -->
          <tr>
            <td class="header">
              <a href="https://aihaat.shop" class="brand-logo">AI <span>HAAT</span></a>
              <div style="color: #94a3b8; font-size: 13px; margin-top: 4px; font-weight: 500;">Premium Digital Commerce</div>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td class="content">
              ${bodyHtml}
              ${ctaText && ctaUrl ? `
                <div style="text-align: center;">
                  <a href="${escapeHtml(ctaUrl)}" class="btn">${escapeHtml(ctaText)}</a>
                </div>
              ` : ""}
              ${secondaryNotice ? `
                <div style="margin-top: 24px; padding: 12px 16px; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; font-size: 12px; color: #92400e;">
                  ${secondaryNotice}
                </div>
              ` : ""}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="margin: 0 0 8px;">আপনার যেকোনো জিজ্ঞাসা বা সহায়তার জন্য আমাদের <a href="https://aihaat.shop/dashboard/support">সাপোর্ট সেন্টারে</a> যোগাযোগ করুন।</p>
              <p style="margin: 0; color: #94a3b8;">© ${new Date().getFullYear()} AI Haat (aihaat.shop). All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ─── 1. ORDER CREATED / CONFIRMATION ─────────────────────────────────────────

export function renderOrderCreatedEmail(payload: OrderCreatedPayload): RenderedEmail {
  const subject = `অর্ডার কনফার্মেশন — Order #${payload.orderNumber}`;
  const itemsHtml = payload.items
    .map(
      (item) => `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px;">
        <span><strong>${escapeHtml(item.productName)}</strong> (${escapeHtml(item.variationName)}) × ${item.quantity}</span>
        <span style="font-weight: 700; color: #0f172a;">৳${item.priceBDT * item.quantity}</span>
      </div>
    `
    )
    .join("");

  const bodyHtml = `
    <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 800;">ধন্যবাদ, ${escapeHtml(payload.customerName)}!</h2>
    <p style="margin: 0 0 16px; color: #475569;">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। পেমেন্ট ভেরিফিকেশন সম্পন্ন হওয়া মাত্রই ডিজিটাল ডেলিভারি শুরু হবে।</p>
    
    <div class="card">
      <div style="font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 10px;">Order Summary (#${escapeHtml(payload.orderNumber)})</div>
      ${itemsHtml}
      <div style="margin-top: 12px; text-align: right; font-size: 16px; font-weight: 900; color: #FC5C03;">
        সর্বমোট: ৳${payload.totalBDT}
      </div>
    </div>
    <p style="font-size: 13px; color: #64748b; margin: 16px 0 0;">পেমেন্ট মেথড: <strong>${escapeHtml(payload.paymentMethod.toUpperCase())}</strong></p>
  `;

  const html = renderEmailShell({
    title: subject,
    preheader: `Order #${payload.orderNumber} placed successfully on AI Haat.`,
    bodyHtml,
    ctaText: "অর্ডার বিস্তারিত দেখুন",
    ctaUrl: payload.orderUrl || "https://aihaat.shop/dashboard/orders",
  });

  const text = `ধন্যবাদ ${payload.customerName}, আপনার অর্ডার #${payload.orderNumber} সফলভাবে গৃহীত হয়েছে। সর্বমোট: ৳${payload.totalBDT}। বিস্তারিত দেখুন: ${payload.orderUrl}`;

  return { subject, html, text };
}

// ─── 2. PAYMENT VERIFIED ─────────────────────────────────────────────────────

export function renderPaymentVerifiedEmail(payload: PaymentVerifiedPayload): RenderedEmail {
  const subject = `পেমেন্ট কনফার্মড — Order #${payload.orderNumber}`;
  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="display: inline-block; width: 48px; height: 48px; background-color: #ecfdf5; color: #10b981; border-radius: 50%; line-height: 48px; font-size: 24px; font-weight: bold;">✓</div>
    </div>
    <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 800; text-align: center;">পেমেন্ট সফলভাবে ভেরিফাইড হয়েছে!</h2>
    <p style="margin: 0 0 16px; color: #475569; text-align: center;">প্রিয় ${escapeHtml(payload.customerName)}, আপনার <strong>৳${payload.amountBDT}</strong> পেমেন্ট নিশ্চিত করা হয়েছে।</p>
    
    <div class="card">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <span style="color: #64748b;">Order Number:</span>
        <strong style="color: #0f172a;">#${escapeHtml(payload.orderNumber)}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <span style="color: #64748b;">পরিশোধিত মূল্য:</span>
        <strong style="color: #10b981;">৳${payload.amountBDT}</strong>
      </div>
      ${payload.trxId ? `
      <div style="display: flex; justify-content: space-between; font-size: 14px;">
        <span style="color: #64748b;">Transaction ID:</span>
        <strong style="font-family: monospace; color: #0f172a;">${escapeHtml(payload.trxId)}</strong>
      </div>
      ` : ""}
    </div>
    <p style="font-size: 14px; color: #475569;">আমাদের অটোমেশন ইঞ্জিন আপনার ডিজিটাল কী/একাউন্ট প্রস্তুত করছে। ডেলিভারি সম্পন্ন হওয়া মাত্রই আপনি ভল্ট থেকে অ্যাক্সেস করতে পারবেন।</p>
  `;

  const html = renderEmailShell({
    title: subject,
    preheader: `Payment of ৳${payload.amountBDT} verified for Order #${payload.orderNumber}.`,
    bodyHtml,
    ctaText: "অর্ডার স্ট্যাটাস দেখুন",
    ctaUrl: payload.orderUrl || "https://aihaat.shop/dashboard/orders",
  });

  const text = `প্রিয় ${payload.customerName}, আপনার অর্ডার #${payload.orderNumber} এর ৳${payload.amountBDT} পেমেন্ট ভেরিফাইড হয়েছে। বিস্তারিত: ${payload.orderUrl}`;

  return { subject, html, text };
}

// ─── 3. ORDER DELIVERED / DIGITAL CREDENTIALS ────────────────────────────────

export function renderOrderDeliveredEmail(payload: OrderDeliveredPayload): RenderedEmail {
  const isPartial = payload.pendingItemsCount > 0;
  const subject = isPartial
    ? `ডিজিটাল ডেলিভারি আপডেট (${payload.deliveredItems.length} টি প্রস্তুত) — Order #${payload.orderNumber}`
    : `আপনার ডিজিটাল প্রোডাক্ট প্রস্তুত! — Order #${payload.orderNumber}`;

  const deliveredListHtml = payload.deliveredItems
    .map(
      (item) => `
      <div style="padding: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px;">
        <div style="font-weight: 700; color: #0f172a; font-size: 14px;">${escapeHtml(item.productName)}</div>
        <div style="font-size: 12px; color: #64748b;">ভ্যারিয়েশন: ${escapeHtml(item.variationName)} | পরিমাণ: ${item.quantity}</div>
        ${item.instructions ? `<div style="font-size: 12px; color: #d97706; margin-top: 4px;">নির্দেশনা: ${escapeHtml(item.instructions)}</div>` : ""}
      </div>
    `
    )
    .join("");

  const bodyHtml = `
    <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 800;">ডিজিটাল ডেলিভারি সম্পন্ন!</h2>
    <p style="margin: 0 0 16px; color: #475569;">প্রিয় ${escapeHtml(payload.customerName)}, আপনার অর্ডারকৃত ডিজিটাল সাবস্ক্রিপশন / কী সফলভাবে ইস্যু করা হয়েছে।</p>
    
    <div class="card">
      <div style="font-size: 12px; font-weight: 800; color: #10b981; text-transform: uppercase; margin-bottom: 10px;">
        ✓ ডেলিভারিকৃত প্রোডাক্টসমূহ (${payload.deliveredItems.length})
      </div>
      ${deliveredListHtml}
      ${isPartial ? `
        <div style="margin-top: 10px; padding: 8px 12px; background-color: #fffbeb; border-radius: 6px; font-size: 12px; color: #b45309;">
          ⏳ বাকি ${payload.pendingItemsCount} টি আইটেম ম্যানুয়ালি প্রসেস করা হচ্ছে। খুব দ্রুত প্রস্তুত হবে।
        </div>
      ` : ""}
    </div>

    <div style="padding: 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; margin: 20px 0; text-align: center;">
      <div style="font-weight: 700; color: #065f46; font-size: 14px; margin-bottom: 4px;">🔐 সিকিউর ডিজিটাল ভল্ট (Digital Vault)</div>
      <p style="font-size: 13px; color: #047857; margin: 0;">আপনার গোপন পাসওয়ার্ড ও অ্যাক্টিভেশন কী নিরাপদে দেখতে আপনার AI Haat একাউন্টের ডিজিটাল ভল্টে প্রবেশ করুন।</p>
    </div>
  `;

  const html = renderEmailShell({
    title: subject,
    preheader: `Your digital product for Order #${payload.orderNumber} is ready in your Digital Vault.`,
    bodyHtml,
    ctaText: "ডিজিটাল ভল্ট ওপেন করুন (View Keys)",
    ctaUrl: payload.vaultUrl || "https://aihaat.shop/dashboard/keys",
    secondaryNotice: "নিরাপত্তার স্বার্থে ইমেইলে সরাসরি পাসওয়ার্ড পাঠানো পরিহার করা হয়। আপনার একাউন্টের ডিজিটাল ভল্ট থেকে যেকোনো সময় গোপন তথ্য দেখুন।",
  });

  const text = `প্রিয় ${payload.customerName}, আপনার অর্ডার #${payload.orderNumber} এর ডিজিটাল ডেলিভারি সম্পন্ন হয়েছে। ডিজিটাল ভল্ট থেকে কী দেখুন: ${payload.vaultUrl}`;

  return { subject, html, text };
}

// ─── 4. WALLET TOP-UP NOTIFICATION ───────────────────────────────────────────

export function renderWalletTopupEmail(payload: WalletTopupPayload): RenderedEmail {
  const isSuccess = payload.status === "COMPLETED";
  const subject = isSuccess
    ? `ওয়ালেট রিচার্জ সফল — ৳${payload.amountBDT} জমা হয়েছে`
    : `ওয়ালেট রিচার্জ ব্যর্থ — ৳${payload.amountBDT}`;

  const bodyHtml = `
    <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 800;">
      ${isSuccess ? "ওয়ালেট রিচার্জ সফল হয়েছে!" : "ওয়ালেট রিচার্জ সম্পন্ন হতে পারেনি"}
    </h2>
    <p style="margin: 0 0 16px; color: #475569;">প্রিয় ${escapeHtml(payload.userName)}, আপনার ওয়ালেট ট্রানজ্যাকশন আপডেট নিচে দেওয়া হলো:</p>
    
    <div class="card">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <span style="color: #64748b;">রিচার্জের পরিমাণ:</span>
        <strong style="color: ${isSuccess ? "#10b981" : "#ef4444"}; font-size: 16px;">৳${payload.amountBDT}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <span style="color: #64748b;">মেথড:</span>
        <strong style="color: #0f172a;">${escapeHtml(payload.method.toUpperCase())}</strong>
      </div>
      ${payload.trxId ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <span style="color: #64748b;">Transaction ID:</span>
        <strong style="font-family: monospace; color: #0f172a;">${escapeHtml(payload.trxId)}</strong>
      </div>
      ` : ""}
      ${payload.newBalanceBDT !== undefined ? `
      <div style="display: flex; justify-content: space-between; font-size: 14px; padding-top: 8px; border-top: 1px dashed #e2e8f0;">
        <span style="color: #64748b;">বর্তমান ওয়ালেট ব্যালেন্স:</span>
        <strong style="color: #FC5C03;">৳${payload.newBalanceBDT}</strong>
      </div>
      ` : ""}
    </div>
  `;

  const html = renderEmailShell({
    title: subject,
    preheader: `Wallet top-up of ৳${payload.amountBDT} ${isSuccess ? "completed" : "failed"}.`,
    bodyHtml,
    ctaText: "ওয়ালেট ব্যালেন্স দেখুন",
    ctaUrl: payload.walletUrl || "https://aihaat.shop/dashboard/wallet",
  });

  const text = `প্রিয় ${payload.userName}, আপনার ওয়ালেটে ৳${payload.amountBDT} রিচার্জ ${isSuccess ? "সফল হয়েছে" : "ব্যর্থ হয়েছে"}। ব্যালেন্স দেখুন: ${payload.walletUrl}`;

  return { subject, html, text };
}

// ─── 5. REFUND UPDATE ────────────────────────────────────────────────────────

export function renderRefundUpdateEmail(payload: RefundUpdatePayload): RenderedEmail {
  const statusLabels: Record<string, string> = {
    REQUESTED: "অনুরোধ গৃহীত হয়েছে",
    APPROVED: "অনুমোদিত হয়েছে",
    REJECTED: "বাতিল করা হয়েছে",
    COMPLETED: "সম্পন্ন হয়েছে (টাকা ফেরত প্রদান করা হয়েছে)",
  };

  const subject = `রিফান্ড আপডেট — Order #${payload.orderNumber} (${statusLabels[payload.status] || payload.status})`;

  const bodyHtml = `
    <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 800;">রিফান্ড স্ট্যাটাস আপডেট</h2>
    <p style="margin: 0 0 16px; color: #475569;">প্রিয় ${escapeHtml(payload.customerName)}, আপনার অর্ডার #${escapeHtml(payload.orderNumber)} এর রিফান্ড অনুরোধের বর্তমান স্ট্যাটাস নিচে দেওয়া হলো:</p>
    
    <div class="card">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <span style="color: #64748b;">রিফান্ডের পরিমাণ:</span>
        <strong style="color: #0f172a; font-size: 16px;">৳${payload.amountBDT}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <span style="color: #64748b;">স্ট্যাটাস:</span>
        <strong style="color: ${payload.status === "COMPLETED" ? "#10b981" : payload.status === "REJECTED" ? "#ef4444" : "#f59e0b"};">
          ${statusLabels[payload.status] || payload.status}
        </strong>
      </div>
      ${payload.adminNote ? `
      <div style="margin-top: 10px; padding: 10px; background-color: #f1f5f9; border-radius: 6px; font-size: 13px; color: #334155;">
        <strong>এডমিন নোট:</strong> ${escapeHtml(payload.adminNote)}
      </div>
      ` : ""}
    </div>
  `;

  const html = renderEmailShell({
    title: subject,
    preheader: `Refund status for Order #${payload.orderNumber}: ${statusLabels[payload.status] || payload.status}`,
    bodyHtml,
    ctaText: "রিফান্ড বিবরণ দেখুন",
    ctaUrl: payload.refundsUrl || "https://aihaat.shop/dashboard/refunds",
  });

  const text = `প্রিয় ${payload.customerName}, অর্ডার #${payload.orderNumber} এর রিফান্ড স্ট্যাটাস: ${statusLabels[payload.status] || payload.status}। বিবরণ: ${payload.refundsUrl}`;

  return { subject, html, text };
}

// ─── 6. REPLACEMENT UPDATE ───────────────────────────────────────────────────

export function renderReplacementUpdateEmail(payload: ReplacementUpdatePayload): RenderedEmail {
  const isCompleted = payload.status === "COMPLETED";
  const subject = isCompleted
    ? `ওয়ারেন্টি রিপ্লেসমেন্ট সম্পন্ন! — Order #${payload.orderNumber}`
    : `রিপ্লেসমেন্ট অনুরোধ আপডেট — Order #${payload.orderNumber}`;

  const bodyHtml = `
    <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 800;">ওয়ারেন্টি রিপ্লেসমেন্ট আপডেট</h2>
    <p style="margin: 0 0 16px; color: #475569;">প্রিয় ${escapeHtml(payload.customerName)}, আপনার প্রোডাক্ট <strong>${escapeHtml(payload.productName)} (${escapeHtml(payload.variationName)})</strong> এর রিপ্লেসমেন্ট সংক্রান্ত আপডেট:</p>
    
    <div class="card">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <span style="color: #64748b;">অর্ডার নম্বর:</span>
        <strong style="color: #0f172a;">#${escapeHtml(payload.orderNumber)}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
        <span style="color: #64748b;">স্ট্যাটাস:</span>
        <strong style="color: ${isCompleted ? "#10b981" : "#3b82f6"};">${payload.status}</strong>
      </div>
      ${payload.adminNote ? `
      <div style="margin-top: 10px; padding: 10px; background-color: #f1f5f9; border-radius: 6px; font-size: 13px; color: #334155;">
        <strong>এডমিন নোট:</strong> ${escapeHtml(payload.adminNote)}
      </div>
      ` : ""}
    </div>
    ${isCompleted ? `
    <p style="font-size: 14px; color: #059669; font-weight: 600;">নতুন রিপ্লেসমেন্ট অ্যাকাউন্ট / কী আপনার ডিজিটাল ভল্টে যুক্ত হয়েছে।</p>
    ` : ""}
  `;

  const html = renderEmailShell({
    title: subject,
    preheader: `Replacement status updated for Order #${payload.orderNumber}.`,
    bodyHtml,
    ctaText: isCompleted ? "নতুন কী দেখুন (Digital Vault)" : "রিপ্লেসমেন্ট বিবরণ দেখুন",
    ctaUrl: payload.vaultUrl || "https://aihaat.shop/dashboard/replacements",
  });

  const text = `প্রিয় ${payload.customerName}, আপনার অর্ডার #${payload.orderNumber} এর রিপ্লেসমেন্ট স্ট্যাটাস: ${payload.status}। বিস্তারিত: ${payload.vaultUrl}`;

  return { subject, html, text };
}

// ─── 7. SUPPORT TICKET REPLY ─────────────────────────────────────────────────

export function renderSupportReplyEmail(payload: SupportUpdatePayload): RenderedEmail {
  const subject = `নতুন সাপোর্ট বার্তা — Ticket #${payload.ticketId.slice(-6)}: ${payload.ticketSubject}`;

  const bodyHtml = `
    <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 800;">সাপোর্ট টিম থেকে নতুন বার্তা</h2>
    <p style="margin: 0 0 16px; color: #475569;">প্রিয় ${escapeHtml(payload.customerName)}, আপনার সাপোর্ট টিকিটে একজন কাস্টমার প্রতিনিধি রিপ্লাই প্রদান করেছেন।</p>
    
    <div class="card">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px;">
        বিষয়: ${escapeHtml(payload.ticketSubject)}
      </div>
      <div style="padding: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #1e293b; line-height: 1.5;">
        ${escapeHtml(payload.messageSnippet)}
      </div>
    </div>
  `;

  const html = renderEmailShell({
    title: subject,
    preheader: `New reply on Support Ticket #${payload.ticketId.slice(-6)}`,
    bodyHtml,
    ctaText: "টিকেটে রিপ্লাই দিন",
    ctaUrl: payload.ticketUrl || `https://aihaat.shop/dashboard/support/${payload.ticketId}`,
  });

  const text = `প্রিয় ${payload.customerName}, আপনার সাপোর্ট টিকিট #${payload.ticketId} এ নতুন রিপ্লাই এসেছে: "${payload.messageSnippet}". বিস্তারিত দেখুন: ${payload.ticketUrl}`;

  return { subject, html, text };
}

// ─── 8. SECURITY OTP EMAIL ───────────────────────────────────────────────────

export function renderSecurityOtpEmail(payload: SecurityOtpPayload): RenderedEmail {
  const subject = `${payload.otpCode} হলো আপনার AI Haat ভেরিফিকেশন কোড`;

  const bodyHtml = `
    <h2 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 800; text-align: center;">সিকিউরিটি ভেরিফিকেশন কোড</h2>
    <p style="margin: 0 0 20px; color: #475569; text-align: center;">আপনার একাউন্টের নিরাপত্তা নিশ্চিত করতে নিচের ওয়ান-টাইম পাসওয়ার্ড (OTP) কোডটি ব্যবহার করুন:</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <div style="display: inline-block; padding: 14px 28px; background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #FC5C03; font-family: monospace;">
        ${escapeHtml(payload.otpCode)}
      </div>
      <p style="font-size: 12px; color: #64748b; margin-top: 10px;">কোডটির মেয়াদ <strong>${payload.expiresInMinutes} মিনিট</strong> পর্যন্ত বহাল থাকবে।</p>
    </div>
  `;

  const html = renderEmailShell({
    title: subject,
    preheader: `Your verification OTP is ${payload.otpCode}`,
    bodyHtml,
    secondaryNotice: "সতর্কতা: এই ওটিপি কোডটি কারো সাথে শেয়ার করবেন না। AI Haat কর্তৃপক্ষ কখনোই আপনার ওটিপি জানতে চাইবে না।",
  });

  const text = `আপনার AI Haat ভেরিফিকেশন কোড হলো ${payload.otpCode}। এটি ${payload.expiresInMinutes} মিনিট কার্যকর থাকবে। কারো সাথে শেয়ার করবেন না।`;

  return { subject, html, text };
}
