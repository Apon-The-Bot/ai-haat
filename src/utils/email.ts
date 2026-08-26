/**
 * Email Notification Service for AI Haat
 * Sends Welcome Emails and Order Delivery Invoices
 */

import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
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
  });
}

export async function sendWelcomeEmail(user: { name: string; email: string }) {
  const transporter = getTransporter();

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E8E8EE; border-radius: 16px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #1A1D26; margin: 0; font-size: 24px;">AI <span style="color: #FC5C03;">Haat</span></h1>
      <p style="color: #7A8190; font-size: 12px; text-transform: uppercase; margin: 4px 0 0 0; letter-spacing: 1px;">Premium Digital Marketplace</p>
    </div>
    
    <div style="background-color: #FFF9F5; border: 1px solid #FFF2E8; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
      <h2 style="color: #1A1D26; font-size: 18px; margin: 0 0 8px 0;">স্বাগতম, ${user.name}!</h2>
      <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin: 0;">
        এআই হাট-এ আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। এখন থেকে আপনি যেকোনো প্রিমিয়াম সফটওয়্যার, এআই টুলস ও ডিজিটাল সাবস্ক্রিপশন সহজে কিনতে পারবেন।
      </p>
    </div>

    <div style="margin-bottom: 24px;">
      <h3 style="color: #1A1D26; font-size: 14px; margin-bottom: 12px;">আপনার ড্যাশবোর্ডে যা পাবেন:</h3>
      <ul style="color: #4B5563; font-size: 13px; line-height: 1.8; padding-left: 20px;">
        <li>🔐 <b>ডিজিটাল ভল্ট:</b> আপনার কেনা সমস্ত লাইসেন্স কি ও অ্যাকাউন্ট ক্রেডেনশিয়াল এক জায়গায়।</li>
        <li>💳 <b>ওয়ালেট ব্যালেন্স:</b> বিকাশ বা নগদে রিচার্জ করে ১-ক্লিকে কেনাকাটা।</li>
        <li>📦 <b>লাইভ ট্র্যাকিং:</b> অর্ডারের ইনস্ট্যান্ট আপডেট ও ইনভয়েস।</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #E8E8EE;">
      <p style="color: #7A8190; font-size: 12px; margin: 0;">যেকোনো প্রয়োজনে আমাদের সাপোর্ট টিমে ইমেইল করুন: <a href="mailto:support@aihaat.com" style="color: #FC5C03;">support@aihaat.com</a></p>
    </div>
  </div>
  `;

  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Email Simulated - Welcome to ${user.email}]`);
    }
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "AI Haat <support@aihaat.com>",
      to: user.email,
      subject: "Welcome to AI Haat - আপনার অ্যাকাউন্ট প্রস্তুত!",
      html,
    });
    return true;
  } catch (error) {
    console.error("[Email Error]:", error);
    return false;
  }
}

export async function sendOrderDeliveryEmail(data: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  productName: string;
  accountType: string;
  credentials: string;
  instructions?: string;
}) {
  const transporter = getTransporter();

  const html = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E8E8EE; border-radius: 16px; background-color: #ffffff;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #1A1D26; margin: 0; font-size: 24px;">AI <span style="color: #FC5C03;">Haat</span></h1>
      <p style="color: #7A8190; font-size: 12px; text-transform: uppercase; margin: 4px 0 0 0; letter-spacing: 1px;">Digital Delivery Confirmation</p>
    </div>
    
    <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
      <h2 style="color: #065F46; font-size: 16px; margin: 0;">🎉 আপনার অর্ডারটি ডেলিভারি করা হয়েছে!</h2>
      <p style="color: #047857; font-size: 13px; margin: 4px 0 0 0;">Order ID: <b>${data.orderNumber}</b></p>
    </div>

    <div style="background-color: #F9FAFB; border: 1px solid #E8E8EE; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
      <h3 style="color: #1A1D26; font-size: 14px; margin: 0 0 10px 0;">📦 প্রোডাক্ট: ${data.productName} (${data.accountType})</h3>
      
      <div style="background-color: #1A1D26; color: #10B981; font-family: monospace; font-size: 13px; padding: 14px; border-radius: 8px; word-break: break-all; margin-top: 10px;">
        ${data.credentials.replace(/\n/g, "<br />")}
      </div>

      ${
        data.instructions
          ? `<p style="color: #4B5563; font-size: 12px; line-height: 1.5; margin-top: 12px;"><b>ব্যবহারের নিয়ম:</b> ${data.instructions}</p>`
          : ""
      }
    </div>

    <p style="color: #4B5563; font-size: 12px; line-height: 1.6;">
      এই তথ্যটি আপনার <b>AI Haat Client Dashboard</b>-এর ডিজিটাল ভল্টেও সংরক্ষিত থাকবে।
    </p>

    <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #E8E8EE;">
      <p style="color: #7A8190; font-size: 12px; margin: 0;">যেকোনো সমস্যায় হোয়াটসঅ্যাপে মেসেজ দিন: <b>+880 1712-345678</b></p>
    </div>
  </div>
  `;

  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Email Simulated - Order Delivery to ${data.customerEmail}]`);
    }
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "AI Haat <support@aihaat.com>",
      to: data.customerEmail,
      subject: `[Delivered] আপনার অর্ডার ${data.orderNumber} এর লগইন ডিটেইলস`,
      html,
    });
    return true;
  } catch (error) {
    console.error("[Email Error]:", error);
    return false;
  }
}
