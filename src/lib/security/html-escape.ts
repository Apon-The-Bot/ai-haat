/**
 * Central HTML Sanitization & Encoding Engine for AI Haat
 * Protects against Reflected & Stored XSS, Telegram HTML Injection, and Template Breakouts
 */

/**
 * Encodes all dangerous HTML characters into strict HTML entities
 */
export function escapeHtml(str: string | null | undefined): string {
  if (str === null || str === undefined) return "";
  const s = String(str);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Escapes characters specifically required for Telegram parse_mode: HTML
 */
export function escapeTelegramHtml(str: string | null | undefined): string {
  if (str === null || str === undefined) return "";
  const s = String(str);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Strips active/executable tags entirely from raw text
 */
export function sanitizePlainString(str: string | null | undefined): string {
  if (!str) return "";
  return String(str).replace(/[<>]/g, "").trim();
}

/**
 * Securely renders thank-you HTML for Quick Rate reviews
 */
export function renderThankYouHtml(productName: string, rating: number, authorName: string, orderNumber?: string): string {
  const safeRating = Math.max(1, Math.min(5, Math.floor(Number(rating) || 5)));
  const starsHtml = "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
  const safeProductName = escapeHtml(productName);
  const safeAuthorName = escapeHtml(authorName);
  const safeOrderNumber = orderNumber ? escapeHtml(orderNumber) : null;

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ধন্যবাদ আপনার রেটিং এর জন্য | AI Haat</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #F8FAFC;
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #FFFFFF;
      max-width: 480px;
      width: 90%;
      border-radius: 24px;
      padding: 40px 32px;
      text-align: center;
      border: 1px solid #E2E8F0;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ECFDF5;
      color: #059669;
      border: 1px solid #A7F3D0;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 20px;
    }
    .stars {
      font-size: 32px;
      color: #F59E0B;
      letter-spacing: 4px;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 10px 0;
      color: #0F172A;
    }
    p {
      font-size: 14px;
      color: #64748B;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .product-box {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 14px 18px;
      margin-bottom: 24px;
      font-size: 13px;
      font-weight: 700;
      color: #1E293B;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #FC5C03 0%, #E04F00 100%);
      color: #FFFFFF;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 800;
      box-shadow: 0 4px 14px rgba(252, 92, 3, 0.3);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      ✓ Verified Buyer Badge Attached
    </div>
    <div class="stars">${starsHtml}</div>
    <h1>আপনার রেটিং জমা হয়েছে! 🎉</h1>
    <p>
      ধন্যবাদ <strong>${safeAuthorName}</strong>! <strong>${safeProductName}</strong> এর উপর আপনার ${safeRating}-স্টার রেটিং ও মতামত AI Haat এর ভেরিফাইড রিভিউ সেকশনে যুক্ত করা হয়েছে।
    </p>
    ${safeOrderNumber ? `<div class="product-box">অর্ডার আইডি: <span style="font-family: monospace; color: #FC5C03;">${safeOrderNumber}</span></div>` : ""}
    <a href="https://aihaat.shop/products" class="btn">🚀 আরও প্রোডাক্টস দেখুন</a>
  </div>
</body>
</html>`;
}
