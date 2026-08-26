/**
 * Telegram Notification Service for AI Haat
 * Dispatches real-time alerts to Admin Telegram Chat / Channel
 */

export async function sendTelegramMessage(textHtml: string): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Telegram Alert Simulated]:\n${textHtml.replace(/<[^>]*>?/gm, "")}`);
    }
    return false;
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
    return data.ok === true;
  } catch (error) {
    console.error("[Telegram Bot Error]:", error);
    return false;
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
  const itemsText = order.items
    .map(
      (item) =>
        `  • <b>${item.productName}</b> (${item.variationName}) × ${item.quantity} = <b>৳${item.priceBDT * item.quantity}</b>`
    )
    .join("\n");

  const message = `
🚀 <b>নতুন অর্ডার গৃহীত হয়েছে! (New Order Placed)</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID:</b> <code>${order.orderNumber}</code>
👤 <b>ক্রেতার নাম:</b> ${order.customerName}
📞 <b>মোবাইল:</b> <code>${order.customerPhone}</code>
📧 <b>ইমেইল:</b> ${order.customerEmail}

📦 <b>প্রোডাক্টসমূহ:</b>
${itemsText}

💰 <b>সর্বমোট মূল্য:</b> <b>৳${order.totalBDT}</b>
💳 <b>পেমেন্ট মেথড:</b> ${order.paymentMethod.toUpperCase()}
📱 <b>প্রেরক নাম্বার:</b> <code>${order.senderNumber || "N/A"}</code>
🔑 <b>Transaction ID:</b> <code>${order.trxId || "N/A"}</code>
${order.notes ? `📝 <b>নোট / Player UID:</b> <code>${order.notes}</code>\n` : ""}
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
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
  const message = `
💰 <b>ওয়ালেট রিচার্জ অনুরোধ (Wallet Recharge Request)</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>ইউজার:</b> ${deposit.userName}
📞 <b>ফোন:</b> <code>${deposit.userPhone}</code>
📧 <b>ইমেইল:</b> ${deposit.userEmail}
💵 <b>পরিমাণ:</b> <b>৳${deposit.amountBDT}</b>
💳 <b>মেথড:</b> ${deposit.method.toUpperCase()}
📱 <b>প্রেরক নাম্বার:</b> <code>${deposit.senderNumber || "N/A"}</code>
🔑 <b>TrxID:</b> <code>${deposit.trxId || "N/A"}</code>
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
<i>এডমিন ড্যাশবোর্ড থেকে TrxID যাচাই করে অ্যাপ্রুভ করুন।</i>
`;

  return sendTelegramMessage(message);
}

export async function sendProductRequestTelegramAlert(req: {
  productName: string;
  targetBudget?: string;
  contact: string;
  details?: string;
}) {
  const message = `
❓ <b>কাস্টম প্রোডাক্ট রিকোয়েস্ট (New Product Sourcing Request)</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>কাঙ্ক্ষিত প্রোডাক্ট:</b> ${req.productName}
💵 <b>বাজেট:</b> ${req.targetBudget || "N/A"}
📞 <b>যোগাযোগ:</b> <code>${req.contact}</code>
📝 <b>বিবরণ:</b> ${req.details || "N/A"}
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
`;

  return sendTelegramMessage(message);
}
