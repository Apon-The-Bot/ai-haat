/**
 * Telegram Notification Service for AI Haat
 * Dispatches real-time alerts to Admin Telegram Chat / Channel
 * Hardened with HTML Entity Escaping against Injection and Malformed Tag Parse Errors
 */
import { getTelegramSettings } from "@/lib/telegram-db";
import { escapeTelegramHtml } from "@/lib/security/html-escape";

export { escapeTelegramHtml };

export async function sendTelegramMessage(
  textHtml: string,
  customConfig?: { botToken?: string; chatId?: string }
): Promise<{ success: boolean; error?: string }> {
  const settings = getTelegramSettings();
  const botToken = customConfig?.botToken || settings.botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = customConfig?.chatId || settings.chatId || process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
  const isEnabled = customConfig ? true : settings.isEnabled;

  if (!isEnabled) {
    return { success: false, error: "Telegram bot notifications are disabled in settings." };
  }

  if (!botToken || !chatId) {
    return { success: false, error: "Telegram Bot Token or Chat ID is not configured." };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: textHtml,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    if (data.ok === true) {
      return { success: true };
    } else {
      return { success: false, error: data.description || "Failed to send telegram message." };
    }
  } catch (error: any) {
    console.error("[Telegram Bot Error]:", error);
    return { success: false, error: error.message || "Network error sending telegram message." };
  }
}

export async function sendNewOrderTelegramAlert(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: Array<{ productName: string; variationName: string; priceBDT: number; quantity: number }>;
  totalBDT: number;
  paymentMethod: string;
  senderNumber?: string;
  trxId?: string;
  notes?: string;
}) {
  const settings = getTelegramSettings();
  if (!settings.notifyOnOrder) return { success: false, error: "Order notifications disabled" };

  const itemsText = order.items
    .map(
      (item) =>
        `  • <b>${escapeTelegramHtml(item.productName)}</b> (${escapeTelegramHtml(item.variationName)}) × ${Number(item.quantity) || 1} = <b>৳${Number(item.priceBDT) * Number(item.quantity)}</b>`
    )
    .join("\n");

  const message = `
🚀 <b>নতুন অর্ডার গৃহীত হয়েছে! (New Order Placed)</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID:</b> <code>${escapeTelegramHtml(order.orderNumber)}</code>
👤 <b>ক্রেতার নাম:</b> ${escapeTelegramHtml(order.customerName)}
📞 <b>মোবাইল:</b> <code>${escapeTelegramHtml(order.customerPhone)}</code>
📧 <b>ইমেইল:</b> ${escapeTelegramHtml(order.customerEmail)}

📦 <b>প্রোডাক্টসমূহ:</b>
${itemsText}

💰 <b>সর্বমোট মূল্য:</b> <b>৳${order.totalBDT}</b>
💳 <b>পেমেন্ট মেথড:</b> ${escapeTelegramHtml(order.paymentMethod.toUpperCase())}
📱 <b>প্রেরক নাম্বার:</b> <code>${escapeTelegramHtml(order.senderNumber || "N/A")}</code>
🔑 <b>Transaction ID:</b> <code>${escapeTelegramHtml(order.trxId || "N/A")}</code>
${order.notes ? `📝 <b>নোট / Player UID:</b> <code>${escapeTelegramHtml(order.notes)}</code>\n` : ""}⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
<i>দয়া করে এডমিন প্যানেল থেকে ডেলিভারি সম্পন্ন করুন।</i>
`;

  return sendTelegramMessage(message);
}

export async function sendWalletRechargeTelegramAlert(deposit: {
  userName: string;
  userPhone: string;
  userEmail: string;
  amountBDT: number;
  method: string;
  senderNumber?: string;
  trxId?: string;
}) {
  const settings = getTelegramSettings();
  if (!settings.notifyOnWallet) return { success: false, error: "Wallet notifications disabled" };

  const message = `
💰 <b>ওয়ালেট রিচার্জ অনুরোধ (Wallet Recharge Request)</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>ইউজার:</b> ${escapeTelegramHtml(deposit.userName)}
📞 <b>ফোন:</b> <code>${escapeTelegramHtml(deposit.userPhone)}</code>
📧 <b>ইমেইল:</b> ${escapeTelegramHtml(deposit.userEmail)}
💵 <b>পরিমাণ:</b> <b>৳${deposit.amountBDT}</b>
💳 <b>মেথড:</b> ${escapeTelegramHtml(deposit.method.toUpperCase())}
📱 <b>প্রেরক নাম্বার:</b> <code>${escapeTelegramHtml(deposit.senderNumber || "N/A")}</code>
🔑 <b>TrxID:</b> <code>${escapeTelegramHtml(deposit.trxId || "N/A")}</code>
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
<i>এডমিন ড্যাশবোর্ড থেকে TrxID যাচাই করে অ্যাপ্রুভ করুন।</i>
`;

  return sendTelegramMessage(message);
}

export async function sendProductRequestTelegramAlert(req: {
  productName: string;
  category?: string;
  budgetBDT?: number | string;
  targetBudget?: string;
  duration?: string;
  urgency?: string;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  contact?: string;
  details?: string;
  requestId?: string;
}) {
  const settings = getTelegramSettings();
  if (settings.notifyOnProductRequest === false) {
    return { success: false, error: "Product request notifications disabled in settings." };
  }

  const rawBudget = req.budgetBDT
    ? `৳${req.budgetBDT}`
    : req.targetBudget
    ? req.targetBudget
    : "আলোচনা সাপেক্ষে (Negotiable)";
  const budgetDisplay = escapeTelegramHtml(rawBudget);

  const contactList: string[] = [];
  if (req.customerName) contactList.push(`👤 <b>নাম:</b> ${escapeTelegramHtml(req.customerName)}`);
  if (req.customerPhone) contactList.push(`📱 <b>WhatsApp / ফোন:</b> <code>${escapeTelegramHtml(req.customerPhone)}</code>`);
  if (req.customerEmail) contactList.push(`📧 <b>ইমেইল:</b> <code>${escapeTelegramHtml(req.customerEmail)}</code>`);
  if (contactList.length === 0 && req.contact) {
    contactList.push(`📞 <b>যোগাযোগ:</b> <code>${escapeTelegramHtml(req.contact)}</code>`);
  }

  const urgencyLabel = req.urgency === "URGENT" || req.urgency === "Immediate / Within 1-3 Hours"
    ? "🔴 অতি জরুরী (১-৩ ঘণ্টা)"
    : req.urgency === "HIGH" || req.urgency === "Within 24 Hours"
    ? "🟡 দ্রুত (আজকের মধ্যেই)"
    : "🟢 সাধারণ (১-২ দিন)";

  const message = `
🔥 <b>নতুন কাস্টম প্রোডাক্ট রিকোয়েস্ট (Custom Sourcing / Pre-Order)</b>
━━━━━━━━━━━━━━━━━━━━
${req.requestId ? `🆔 <b>Request ID:</b> <code>${escapeTelegramHtml(req.requestId)}</code>\n` : ""}📦 <b>কাঙ্ক্ষিত প্রোডাক্ট/টুল:</b> <b>${escapeTelegramHtml(req.productName)}</b>
${req.category ? `🏷️ <b>ক্যাটাগরি:</b> ${escapeTelegramHtml(req.category)}\n` : ""}💰 <b>টার্গেট বাজেট:</b> <b>${budgetDisplay}</b>
${req.duration ? `⏳ <b>মেয়াদ (Duration):</b> ${escapeTelegramHtml(req.duration)}\n` : ""}⚡ <b>জরুরী অবস্থা:</b> ${urgencyLabel}
━━━━━━━━━━━━━━━━━━━━
<b>কাস্টমার তথ্য:</b>
${contactList.join("\n")}
${req.notes ? `\n📝 <b>নোট/স্পেশাল রিকোয়ারমেন্ট:</b>\n<i>${escapeTelegramHtml(req.notes)}</i>` : req.details ? `\n📝 <b>বিবরণ:</b>\n<i>${escapeTelegramHtml(req.details)}</i>` : ""}
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
<i>দয়া করে কাস্টমারের সাথে দ্রুত যোগাযোগ করুন ও কোটেশন দিন।</i>
`;

  return sendTelegramMessage(message);
}

export async function sendReplacementTelegramAlert(claim: {
  orderNumber: string;
  productName: string;
  variationName?: string;
  customerName?: string;
  customerEmail: string;
  reason: string;
  description: string;
}) {
  const settings = getTelegramSettings();
  if (!settings.isEnabled) return { success: false, error: "Telegram notifications disabled" };

  const message = `
⚠️ <b>ওয়ারেন্টি রিপ্লেসমেন্ট ক্লেইম (Warranty Replacement Claim)</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID:</b> <code>${escapeTelegramHtml(claim.orderNumber)}</code>
📦 <b>প্রোডাক্ট:</b> <b>${escapeTelegramHtml(claim.productName)}</b> ${claim.variationName ? `(${escapeTelegramHtml(claim.variationName)})` : ""}
👤 <b>গ্রাহক:</b> ${escapeTelegramHtml(claim.customerName || "Customer")} (<code>${escapeTelegramHtml(claim.customerEmail)}</code>)
❗ <b>সমস্যার ধরন (Reason):</b> <b>${escapeTelegramHtml(claim.reason)}</b>
📝 <b>গ্রাহকের বিবরণ:</b>
<i>${escapeTelegramHtml(claim.description)}</i>
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
<i>এডমিন ড্যাশবোর্ড থেকে রিপ্লেসমেন্ট কী প্রদান করুন।</i>
`;

  return sendTelegramMessage(message);
}

export async function sendLowStockTelegramAlert(alert: {
  productName: string;
  variationName?: string;
  remainingStock: number;
}) {
  const settings = getTelegramSettings();
  if (!settings.isEnabled) return { success: false, error: "Telegram notifications disabled" };

  const message = `
🚨 <b>স্টক শেষ হওয়ার সতর্কতা (Low Stock Alert)</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>প্রোডাক্ট:</b> <b>${escapeTelegramHtml(alert.productName)}</b> ${alert.variationName ? `(${escapeTelegramHtml(alert.variationName)})` : ""}
⚠️ <b>অবশিষ্ট স্টক:</b> <b>${alert.remainingStock} টি</b>
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
<i>দয়া করে শীঘ্রই নতুন স্টক ইনপুট দিন।</i>
`;

  return sendTelegramMessage(message);
}

export async function sendRefundTelegramAlert(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  amountBDT: number;
  refundMethod: string;
  reason: string;
  description: string;
  payoutPhone?: string;
}) {
  const settings = getTelegramSettings();
  if (!settings.isEnabled) return { success: false, error: "Telegram notifications disabled" };

  const message = `
⚠️ <b>নতুন রিফান্ড রিকোয়েস্ট! (Refund Request)</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID:</b> <code>${escapeTelegramHtml(params.orderNumber)}</code>
👤 <b>ক্রেতা:</b> ${escapeTelegramHtml(params.customerName)} (${escapeTelegramHtml(params.customerEmail)})
📦 <b>প্রোডাক্ট:</b> ${escapeTelegramHtml(params.productName)}
💰 <b>টাকার পরিমাণ:</b> ৳${params.amountBDT} (${escapeTelegramHtml(params.refundMethod)})
📱 <b>পেমেন্ট নম্বর:</b> <code>${escapeTelegramHtml(params.payoutPhone || "Wallet")}</code>
❓ <b>কারণ:</b> ${escapeTelegramHtml(params.reason)}
📝 <b>বিবরণ:</b> ${escapeTelegramHtml(params.description)}
━━━━━━━━━━━━━━━━━━━━
`;

  return sendTelegramMessage(message);
}

export async function sendSupplierIngestionTelegramAlert(params: {
  supplierName: string;
  supplierCode: string;
  batchRef: string;
  productName: string;
  variationName?: string;
  itemsAdded: number;
  itemsSkipped: number;
  unitCostBDT?: number;
}) {
  const settings = getTelegramSettings();
  if (!settings.isEnabled) return { success: false, error: "Telegram notifications disabled" };

  let message = `📦 <b>সাপ্লায়ার নতুন স্টক ইনজেস্ট হয়েছে! (Supplier Ingestion)</b>
━━━━━━━━━━━━━━━━━━━━
🏢 <b>সাপ্লায়ার:</b> ${escapeTelegramHtml(params.supplierName)} (<code>${escapeTelegramHtml(params.supplierCode)}</code>)
🔖 <b>ব্যাচ:</b> <code>${escapeTelegramHtml(params.batchRef)}</code>
📦 <b>প্রোডাক্ট:</b> ${escapeTelegramHtml(params.productName)} ${params.variationName ? `(${escapeTelegramHtml(params.variationName)})` : ""}
✅ <b>যুক্ত হয়েছে:</b> <b>${params.itemsAdded} টি</b>
⚠️ <b>ডুপ্লিকেট স্কিপ:</b> ${params.itemsSkipped} টি\n`;
  if (params.unitCostBDT) {
    message += `💰 <b>কেনা মূল্য:</b> ৳${params.unitCostBDT}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━━`;

  return sendTelegramMessage(message);
}

export async function sendStockExpiryTelegramAlert(params: {
  expiredCount: number;
  expiringSoonCount: number;
  customerExpiringCount: number;
  details?: string;
}) {
  const settings = getTelegramSettings();
  if (!settings.isEnabled) return { success: false, error: "Telegram notifications disabled" };

  let message = `⏳ <b>স্টক এক্সপায়ারি সতর্কতা (Inventory Expiry Alert)</b>
━━━━━━━━━━━━━━━━━━━━
❌ <b>মেয়াদোত্তীর্ণ স্টক:</b> <b>${params.expiredCount} টি</b> (EXPIRED চিহ্নিত করা হয়েছে)
⚠️ <b>৩ দিনের মধ্যে মেয়াদ শেষ হবে:</b> <b>${params.expiringSoonCount} টি</b>
👥 <b>কাস্টমার সাবস্ক্রিপশন মেয়াদ শেষ:</b> <b>${params.customerExpiringCount} জন</b>\n`;
  if (params.details) {
    message += `📝 <b>বিবরণ:</b> ${escapeTelegramHtml(params.details)}\n`;
  }
  message += `━━━━━━━━━━━━━━━━━━━━`;

  return sendTelegramMessage(message);
}

export async function sendSupportTicketTelegramAlert(params: {
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  category: string;
  priority: string;
  subject: string;
  orderNumber?: string;
}) {
  const settings = getTelegramSettings();
  if (!settings.isEnabled) return { success: false, error: "Telegram notifications disabled" };

  const message = `
🎟️ <b>নতুন সাপোর্ট টিকেট! (New Support Ticket)</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Ticket:</b> <code>${escapeTelegramHtml(params.ticketNumber)}</code>
👤 <b>কাস্টমার:</b> ${escapeTelegramHtml(params.customerName)} (<code>${escapeTelegramHtml(params.customerEmail)}</code>)
🏷️ <b>ক্যাটাগরি:</b> ${escapeTelegramHtml(params.category)}
⚠️ <b>প্রায়োরিটি:</b> ${escapeTelegramHtml(params.priority)}
${params.orderNumber ? `🛒 <b>Order ID:</b> <code>${escapeTelegramHtml(params.orderNumber)}</code>\n` : ""}📝 <b>সাবজেক্ট:</b> ${escapeTelegramHtml(params.subject)}
━━━━━━━━━━━━━━━━━━━━
<i>এডমিন ড্যাশবোর্ড থেকে টিকেটের উত্তর দিন।</i>
`;

  return sendTelegramMessage(message);
}

export async function sendSupportReplyTelegramAlert(params: {
  ticketNumber: string;
  customerName: string;
  messageSnippet: string;
  orderNumber?: string;
}) {
  const settings = getTelegramSettings();
  if (!settings.isEnabled) return { success: false, error: "Telegram notifications disabled" };

  const message = `
💬 <b>কাস্টমার রিপ্লাই! (Support Reply)</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Ticket:</b> <code>${escapeTelegramHtml(params.ticketNumber)}</code>
👤 <b>কাস্টমার:</b> ${escapeTelegramHtml(params.customerName)}
${params.orderNumber ? `🛒 <b>Order ID:</b> <code>${escapeTelegramHtml(params.orderNumber)}</code>\n` : ""}
📝 <b>মেসেজ:</b>
<i>${escapeTelegramHtml(params.messageSnippet)}</i>
━━━━━━━━━━━━━━━━━━━━
`;

  return sendTelegramMessage(message);
}

export async function sendAffiliatePayoutTelegramAlert(params: {
  partnerName: string;
  partnerEmail: string;
  amountBDT: number;
  payoutMethod: string;
  payoutPhone?: string;
  availableBalanceBDT: number;
}) {
  const settings = getTelegramSettings();
  if (!settings.isEnabled) return { success: false, error: "Telegram notifications disabled" };

  const message = `
💸 <b>নতুন অ্যাফিলিয়েট পেআউট রিকোয়েস্ট! (Affiliate Payout)</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>পার্টনার:</b> ${escapeTelegramHtml(params.partnerName)}
📧 <b>ইমেইল:</b> <code>${escapeTelegramHtml(params.partnerEmail)}</code>
💰 <b>উত্তোলনের পরিমাণ:</b> <b>৳${params.amountBDT}</b>
💳 <b>মেথড:</b> ${escapeTelegramHtml(params.payoutMethod.toUpperCase())}
📱 <b>একাউন্ট নম্বর:</b> <code>${escapeTelegramHtml(params.payoutPhone || "N/A")}</code>
💵 <b>বর্তমান ব্যালেন্স:</b> ৳${params.availableBalanceBDT}
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
<i>দয়া করে এডমিন প্যানেল থেকে পেআউট সম্পন্ন করুন।</i>
`;

  return sendTelegramMessage(message);
}

export async function sendAffiliateNewPartnerTelegramAlert(params: {
  partnerName: string;
  partnerEmail: string;
  referralCode: string;
}) {
  const settings = getTelegramSettings();
  if (!settings.isEnabled) return { success: false, error: "Telegram notifications disabled" };

  const message = `
🤝 <b>নতুন অ্যাফিলিয়েট পার্টনার যুক্ত হয়েছেন! (New Affiliate Partner)</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>নাম:</b> ${escapeTelegramHtml(params.partnerName)}
📧 <b>ইমেইল:</b> <code>${escapeTelegramHtml(params.partnerEmail)}</code>
🔖 <b>রেফারেল কোড:</b> <code>${escapeTelegramHtml(params.referralCode)}</code>
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
`;

  return sendTelegramMessage(message);
}
