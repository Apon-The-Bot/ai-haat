import nodemailer from "nodemailer";
import { generateDeliveryHtml } from "./emailTemplate";

export function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.hostinger.com";
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER || "delivery@aihaat.shop";
  const pass = process.env.SMTP_PASS || "Rk#delivery@aihaat.sh0p";

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export { generateDeliveryHtml };

/**
 * Send Welcome Email to newly registered user
 */
export async function sendWelcomeEmail(user: { name: string; email: string }) {
  const transporter = getTransporter();

  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 32px 24px; border: 1px solid #E2E8F0; border-radius: 20px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #0F172A; margin: 0; font-size: 26px; font-weight: 900;">AI <span style="color: #FC5C03;">Haat</span></h1>
      <p style="color: #64748B; font-size: 11px; text-transform: uppercase; margin: 4px 0 0 0; letter-spacing: 1px; font-weight: 700;">Official Marketplace</p>
    </div>
    
    <div style="background-color: #FFF9F5; border: 1px solid #FFE4D6; padding: 20px; border-radius: 16px; margin-bottom: 20px;">
      <h2 style="color: #0F172A; font-size: 18px; margin: 0 0 8px 0; font-weight: 800;">Welcome, ${user.name}! 👋</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
        Your AI Haat account is ready. You can now purchase premium AI tools, software subscriptions, and developer licenses with instant delivery and full replacement warranty.
      </p>
    </div>

    <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
      <p style="color: #94A3B8; font-size: 12px; margin: 0;">Need help? Reply to this email or contact us at <a href="mailto:delivery@aihaat.shop" style="color: #FC5C03; font-weight: 700;">delivery@aihaat.shop</a></p>
    </div>
  </div>
  `;

  if (!transporter) {
    console.log(`[Welcome Email Simulated] to ${user.email}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: '"AI Haat Delivery" <delivery@aihaat.shop>',
      to: user.email,
      subject: "Welcome to AI Haat - Account Ready!",
      html,
    });
    return true;
  } catch (error) {
    console.error("[Welcome Email Error]:", error);
    return false;
  }
}

/**
 * Send Delivery HTML Email via Hostinger SMTP
 */
export async function sendOrderDeliveryEmail(data: {
  customerName: string;
  customerEmail: string;
  orderId: string;
  productName: string;
  variationName?: string;
  credentials: string;
  downloadUrl?: string | null;
  instructions?: string | null;
  subject?: string;
}) {
  const transporter = getTransporter();
  const html = generateDeliveryHtml(data);
  const subject = data.subject || `Your AI Haat Delivery: ${data.productName} (Order #${data.orderId})`;

  if (!transporter) {
    console.log(`[Hostinger SMTP Simulated] Email to ${data.customerEmail} - Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: '"AI Haat Delivery" <delivery@aihaat.shop>',
      to: data.customerEmail,
      subject,
      html,
    });
    console.log(`[Hostinger Email Sent] ID: ${info.messageId} to ${data.customerEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[Hostinger SMTP Error]:", error);
    return { success: false, error: error.message };
  }
}
