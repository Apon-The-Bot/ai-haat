/**
 * AI Haat Luxury Responsive HTML Email Template Generator
 * Safe for both Client and Server execution (pure HTML/CSS generator)
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
}) {
  const formattedCredentials = data.credentials
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("<br/>");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your AI Haat Delivery - ${data.orderId}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F8FAFC;
      padding: 40px 15px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      border: 1px solid #E2E8F0;
    }
    .header {
      background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
      padding: 36px 30px;
      text-align: center;
    }
    .brand-title {
      color: #FFFFFF;
      font-size: 26px;
      font-weight: 900;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .brand-title span {
      color: #FC5C03;
    }
    .badge {
      display: inline-block;
      margin-top: 10px;
      background: rgba(252, 92, 3, 0.2);
      color: #FC5C03;
      border: 1px solid rgba(252, 92, 3, 0.4);
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 32px 30px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 800;
      color: #0F172A;
      margin: 0 0 8px 0;
    }
    .subtext {
      font-size: 14px;
      color: #64748B;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .order-box {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .order-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      padding: 6px 0;
      border-bottom: 1px dashed #E2E8F0;
    }
    .order-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .order-label {
      color: #64748B;
      font-weight: 500;
    }
    .order-val {
      color: #0F172A;
      font-weight: 700;
    }
    .vault-box {
      background: #0F172A;
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 24px;
      border: 1px solid #334155;
    }
    .vault-header {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 1px;
      color: #94A3B8;
      margin-bottom: 12px;
    }
    .vault-code {
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 16px;
      color: #34D399;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 14px;
      line-height: 1.8;
      word-break: break-all;
    }
    .download-card {
      background-color: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      text-align: center;
    }
    .download-title {
      font-size: 14px;
      font-weight: 800;
      color: #1E40AF;
      margin: 0 0 10px 0;
    }
    .btn-download {
      display: inline-block;
      background-color: #2563EB;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 10px 24px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      margin-top: 6px;
    }
    .instruction-box {
      background-color: #FFF9F5;
      border: 1px solid #FFE4D6;
      border-radius: 16px;
      padding: 18px 20px;
      margin-bottom: 24px;
    }
    .instruction-title {
      font-size: 13px;
      font-weight: 800;
      color: #C2410C;
      margin: 0 0 6px 0;
    }
    .instruction-text {
      font-size: 13px;
      color: #9A3412;
      line-height: 1.6;
      margin: 0;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 16px 0;
    }
    .btn-primary {
      display: inline-block;
      background-color: #FC5C03;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 14px 36px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(252, 92, 3, 0.25);
    }
    .footer {
      background-color: #F8FAFC;
      padding: 24px 30px;
      border-top: 1px solid #E2E8F0;
      text-align: center;
      font-size: 12px;
      color: #94A3B8;
      line-height: 1.6;
    }
    .footer a {
      color: #FC5C03;
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Header -->
      <div class="header">
        <h1 class="brand-title">AI <span>Haat</span></h1>
        <div class="badge">Official Digital Delivery</div>
      </div>

      <!-- Main Body -->
      <div class="content">
        <h2 class="greeting">Hello, ${data.customerName}! 👋</h2>
        <p class="subtext">
          Thank you for ordering with AI Haat. Your digital subscription is ready. Please find your credentials and usage instructions below.
        </p>

        <!-- Order Summary -->
        <div class="order-box">
          <div class="order-row">
            <span class="order-label">Order Number</span>
            <span class="order-val">#${data.orderId}</span>
          </div>
          <div class="order-row">
            <span class="order-label">Product</span>
            <span class="order-val">${data.productName}</span>
          </div>
          ${
            data.variationName
              ? `
          <div class="order-row">
            <span class="order-label">Plan / Variation</span>
            <span class="order-val">${data.variationName}</span>
          </div>
          `
              : ""
          }
          <div class="order-row">
            <span class="order-label">Warranty Status</span>
            <span class="order-val" style="color: #059669;">100% Full Replacement Active</span>
          </div>
        </div>

        <!-- Credentials Vault -->
        <div class="vault-box">
          <div class="vault-header">🔐 Your Access Credentials / Key</div>
          <div class="vault-code">
            ${formattedCredentials}
          </div>
        </div>

        <!-- Optional Download Link -->
        ${
          data.downloadUrl
            ? `
        <div class="download-card">
          <h3 class="download-title">📥 Software / APK Download Package</h3>
          <p style="font-size: 12px; color: #4B5563; margin: 0 0 12px 0;">Download the required software installation or APK file from the secure link below:</p>
          <a href="${data.downloadUrl}" target="_blank" class="btn-download">Download File (Direct Link)</a>
        </div>
        `
            : ""
        }

        <!-- Usage Instructions -->
        ${
          data.instructions
            ? `
        <div class="instruction-box">
          <h4 class="instruction-title">💡 Important Guidelines & Warranty Rules:</h4>
          <p class="instruction-text">${data.instructions}</p>
        </div>
        `
            : ""
        }

        <!-- CTA Button -->
        <div class="cta-container">
          <a href="https://aihaat.shop/dashboard/keys" target="_blank" class="btn-primary">
            Open Digital Vault
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 8px 0;">
          Need instant assistance? Reach out to our 24/7 Support via WhatsApp or reply directly to this email.
        </p>
        <p style="margin: 0;">
          Sent from <b>delivery@aihaat.shop</b> • © 2026 AI Haat. All rights reserved.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `;
}
