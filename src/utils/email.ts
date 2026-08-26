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
