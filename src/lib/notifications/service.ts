import { prisma } from "@/lib/prisma";
import {
  NotificationEventInput,
  NotificationEventType,
  NotificationChannel,
  NOTIFICATION_EVENTS,
} from "./types";
import {
  renderOrderCreatedEmail,
  renderPaymentVerifiedEmail,
  renderOrderDeliveredEmail,
  renderWalletTopupEmail,
  renderRefundUpdateEmail,
  renderReplacementUpdateEmail,
  renderSupportReplyEmail,
  renderSecurityOtpEmail,
} from "./templates";
import {
  renderAffiliateCommissionEarnedEmail,
  renderAffiliatePayoutCompletedEmail,
  renderAffiliateTierUpgradedEmail,
} from "@/lib/email-templates";
import { dispatchInAppNotification } from "./channels/in-app";
import { dispatchEmail } from "./channels/email";
import { dispatchTelegramAlert } from "./channels/telegram";
import { getTelegramSettings } from "@/lib/telegram-db";

/**
 * Determine default channels for each event type
 */
export function resolveDefaultChannels(eventType: NotificationEventType): NotificationChannel[] {
  switch (eventType) {
    case NOTIFICATION_EVENTS.ORDER_CREATED:
    case NOTIFICATION_EVENTS.PAYMENT_VERIFIED:
    case NOTIFICATION_EVENTS.ORDER_DELIVERED:
    case NOTIFICATION_EVENTS.DELIVERY_PARTIAL:
    case NOTIFICATION_EVENTS.WALLET_TOPUP_COMPLETED:
    case NOTIFICATION_EVENTS.WALLET_TOPUP_FAILED:
    case NOTIFICATION_EVENTS.REFUND_REQUESTED:
    case NOTIFICATION_EVENTS.REFUND_APPROVED:
    case NOTIFICATION_EVENTS.REFUND_REJECTED:
    case NOTIFICATION_EVENTS.REFUND_COMPLETED:
    case NOTIFICATION_EVENTS.REPLACEMENT_REQUESTED:
    case NOTIFICATION_EVENTS.REPLACEMENT_APPROVED:
    case NOTIFICATION_EVENTS.REPLACEMENT_REJECTED:
    case NOTIFICATION_EVENTS.REPLACEMENT_COMPLETED:
    case NOTIFICATION_EVENTS.AFFILIATE_COMMISSION_EARNED:
    case NOTIFICATION_EVENTS.AFFILIATE_COMMISSION_HOLDING:
    case NOTIFICATION_EVENTS.AFFILIATE_COMMISSION_RELEASED:
    case NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_APPROVED:
    case NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_REJECTED:
    case NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_COMPLETED:
    case NOTIFICATION_EVENTS.AFFILIATE_TIER_UPGRADED:
      return ["IN_APP", "EMAIL"];

    case NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_REQUESTED:
      return ["IN_APP", "EMAIL", "TELEGRAM"];

    case NOTIFICATION_EVENTS.SUPPORT_REPLY_CUSTOMER:
    case NOTIFICATION_EVENTS.SUPPORT_RESOLVED:
      return ["IN_APP", "EMAIL"];

    case NOTIFICATION_EVENTS.AUTH_OTP:
    case NOTIFICATION_EVENTS.MFA_ENABLED:
    case NOTIFICATION_EVENTS.MFA_DISABLED:
    case NOTIFICATION_EVENTS.RECOVERY_CODES_REGENERATED:
      return ["EMAIL"];

    case NOTIFICATION_EVENTS.PAYMENT_MISMATCH:
    case NOTIFICATION_EVENTS.LOW_STOCK:
    case NOTIFICATION_EVENTS.OUT_OF_STOCK:
    case NOTIFICATION_EVENTS.FULFILLMENT_FAILED:
    case NOTIFICATION_EVENTS.SUPPLIER_INGESTION:
      return ["TELEGRAM"];

    default:
      return ["IN_APP"];
  }
}

/**
 * Master notification dispatcher.
 * Guaranteed: Side-effect only. Business operations are never interrupted by notification failures.
 */
export async function dispatchNotificationEvent(event: NotificationEventInput): Promise<{
  success: boolean;
  eventId?: string;
  skippedDuplicate?: boolean;
  error?: string;
}> {
  try {
    const channels = event.channels || resolveDefaultChannels(event.eventType);
    const priority = event.priority || (event.eventType === NOTIFICATION_EVENTS.AUTH_OTP ? "HIGH" : "NORMAL");

    // 1. Deduplication Guard: Check if event already exists
    const existingEvent: any = await prisma.notificationEvent.findUnique({
      where: { dedupeKey: event.dedupeKey },
    });

    if (existingEvent && existingEvent.status === "SENT") {
      return {
        success: true,
        eventId: existingEvent.id,
        skippedDuplicate: true,
      };
    }

    // 2. Data Minimization: Sanitize payload to never persist plaintext passwords or OTPs in queue
    const safePayload = { ...event.payload };
    if ("otpCode" in safePayload) {
      delete (safePayload as any).otpCode; // Never persist plaintext OTP
    }
    if ("credentials" in safePayload && typeof safePayload.credentials === "string" && safePayload.credentials.length > 200) {
      safePayload.credentials = "[REDACTED_FOR_SECURITY_VIEW_IN_VAULT]";
    }

    // 3. Create or Update NotificationEvent outbox record
    const eventRecord = existingEvent || (await prisma.notificationEvent.create({
      data: {
        eventType: event.eventType,
        entityType: event.entityType || null,
        entityId: event.entityId || null,
        userId: event.userId || null,
        recipientEmail: event.recipientEmail || (event.payload as any)?.customerEmail || (event.payload as any)?.userEmail || null,
        recipientPhone: event.recipientPhone || (event.payload as any)?.customerPhone || null,
        dedupeKey: event.dedupeKey,
        payload: JSON.stringify(safePayload),
        channels: channels.join(","),
        status: "PROCESSING",
        priority,
        attempts: (existingEvent?.attempts || 0) + 1,
        lastAttemptAt: new Date(),
      },
    }));

    let allChannelsSucceeded = true;
    let lastChannelError: string | null = null;
    let errorCategory: string | null = null;

    // 4. Dispatch Channel: IN_APP
    if (channels.includes("IN_APP") && event.userId) {
      const inAppResult = await dispatchInAppForEvent(event);
      await prisma.notificationDelivery.create({
        data: {
          eventId: eventRecord.id,
          channel: "IN_APP",
          recipient: event.userId,
          status: inAppResult.success ? "SENT" : "FAILED",
          error: inAppResult.error || null,
          sentAt: inAppResult.success ? new Date() : null,
        },
      });

      if (!inAppResult.success) {
        allChannelsSucceeded = false;
        lastChannelError = inAppResult.error || "In-App dispatch failed";
      }
    }

    // 5. Dispatch Channel: EMAIL
    const recipientEmail = event.recipientEmail || (event.payload as any)?.customerEmail || (event.payload as any)?.userEmail;
    if (channels.includes("EMAIL") && recipientEmail) {
      const emailResult = await dispatchEmailForEvent(event, recipientEmail);
      await prisma.notificationDelivery.create({
        data: {
          eventId: eventRecord.id,
          channel: "EMAIL",
          recipient: recipientEmail,
          status: emailResult.success ? "SENT" : "FAILED",
          providerMessageId: emailResult.messageId || null,
          error: emailResult.error || null,
          sentAt: emailResult.success ? new Date() : null,
        },
      });

      if (!emailResult.success) {
        allChannelsSucceeded = false;
        lastChannelError = emailResult.error || "Email dispatch failed";
        errorCategory = emailResult.errorCategory || "TRANSIENT";
      }
    }

    // 6. Dispatch Channel: TELEGRAM
    if (channels.includes("TELEGRAM")) {
      const telegramResult = await dispatchTelegramForEvent(event);
      await prisma.notificationDelivery.create({
        data: {
          eventId: eventRecord.id,
          channel: "TELEGRAM",
          recipient: "TELEGRAM_ADMIN",
          status: telegramResult.success ? "SENT" : "FAILED",
          providerMessageId: telegramResult.messageId || null,
          error: telegramResult.error || null,
          sentAt: telegramResult.success ? new Date() : null,
        },
      });

      if (!telegramResult.success && telegramResult.errorCategory !== "CONFIGURATION") {
        allChannelsSucceeded = false;
        lastChannelError = telegramResult.error || "Telegram dispatch failed";
        errorCategory = telegramResult.errorCategory || "TRANSIENT";
      }
    }

    // 7. Update Event Final Status
    if (allChannelsSucceeded) {
      await prisma.notificationEvent.update({
        where: { id: eventRecord.id },
        data: {
          status: "SENT",
          processedAt: new Date(),
          lastError: null,
        },
      });
    } else {
      const nextDelayMinutes = Math.min(30, Math.pow(2, eventRecord.attempts || 1));
      const nextAttemptAt = new Date(Date.now() + nextDelayMinutes * 60 * 1000);
      const isMaxReached = (eventRecord.attempts || 0) >= (eventRecord.maxAttempts || 4);

      await prisma.notificationEvent.update({
        where: { id: eventRecord.id },
        data: {
          status: isMaxReached ? "FAILED" : "RETRY_WAIT",
          nextAttemptAt: isMaxReached ? null : nextAttemptAt,
          lastError: lastChannelError,
          errorCategory,
        },
      });
    }

    return {
      success: true,
      eventId: eventRecord.id,
    };
  } catch (error: any) {
    console.error("[Notification Engine Uncaught Error]:", error?.message || error);
    // Non-blocking guarantee
    return {
      success: false,
      error: error?.message || "Notification processing error",
    };
  }
}

// ─── INTERNAL DISPATCH ROUTERS ───────────────────────────────────────────────

async function dispatchInAppForEvent(event: NotificationEventInput) {
  const p = event.payload;
  let title = "বিজ্ঞপ্তি (Notification)";
  let message = "";
  let link = "/dashboard";
  let type: any = "SYSTEM";

  switch (event.eventType) {
    case NOTIFICATION_EVENTS.ORDER_CREATED:
      title = `অর্ডার #${p.orderNumber} সফলভাবে গৃহীত হয়েছে`;
      message = `আপনার ৳${p.totalBDT} মূল্যের অর্ডারটি গ্রহণ করা হয়েছে। পেমেন্ট সম্পন্ন হলে ডেলিভারি শুরু হবে।`;
      link = p.orderUrl || "/dashboard/orders";
      type = "ORDER";
      break;

    case NOTIFICATION_EVENTS.PAYMENT_VERIFIED:
      title = `পেমেন্ট ভেরিফাইড! (#${p.orderNumber})`;
      message = `আপনার ৳${p.amountBDT} পেমেন্ট নিশ্চিত করা হয়েছে। ডিজিটাল ডেলিভারি প্রস্তুত হচ্ছে।`;
      link = p.orderUrl || "/dashboard/orders";
      type = "ORDER";
      break;

    case NOTIFICATION_EVENTS.ORDER_DELIVERED:
    case NOTIFICATION_EVENTS.DELIVERY_PARTIAL:
      title = `ডিজিটাল ডেলিভারি সম্পন্ন! (#${p.orderNumber})`;
      message = `আপনার অর্ডারকৃত ডিজিটাল প্রোডাক্টের অ্যাক্সেস তথ্য প্রস্তুত। ডিজিটাল ভল্ট চেক করুন।`;
      link = p.vaultUrl || "/dashboard/keys";
      type = "DELIVERY";
      break;

    case NOTIFICATION_EVENTS.WALLET_TOPUP_COMPLETED:
      title = "ওয়ালেট রিচার্জ সফল!";
      message = `আপনার ওয়ালেটে ৳${p.amountBDT} সফলভাবে জমা হয়েছে। বর্তমান ব্যালেন্স: ৳${p.newBalanceBDT || ""}`;
      link = p.walletUrl || "/dashboard/wallet";
      type = "WALLET";
      break;

    case NOTIFICATION_EVENTS.REFUND_COMPLETED:
      title = `রিফান্ড সম্পন্ন — Order #${p.orderNumber}`;
      message = `আপনার ৳${p.amountBDT} রিফান্ড সম্পন্ন হয়েছে।`;
      link = p.refundsUrl || "/dashboard/refunds";
      type = "SYSTEM";
      break;

    case NOTIFICATION_EVENTS.REPLACEMENT_COMPLETED:
      title = `ওয়ারেন্টি রিপ্লেসমেন্ট সম্পন্ন! (#${p.orderNumber})`;
      message = `আপনার ${p.productName} এর রিপ্লেসমেন্ট সম্পন্ন হয়েছে। নতুন কী ভল্টে যুক্ত করা হয়েছে।`;
      link = p.vaultUrl || "/dashboard/replacements";
      type = "REPLACEMENT";
      break;

    case NOTIFICATION_EVENTS.SUPPORT_REPLY_CUSTOMER:
      title = `সাপোর্ট রিপ্লাই — Ticket #${p.ticketId?.slice(-6)}`;
      message = `আপনার সাপোর্ট টিকিটে নতুন রিপ্লাই এসেছে: "${p.messageSnippet?.slice(0, 60)}..."`;
      link = p.ticketUrl || `/dashboard/support/${p.ticketId}`;
      type = "SYSTEM";
      break;

    case NOTIFICATION_EVENTS.AFFILIATE_COMMISSION_EARNED:
      title = `অ্যাফিলিয়েট কমিশন অর্জিত হয়েছে! (৳${p.amountBDT})`;
      message = `অর্ডার #${p.orderNumber} থেকে আপনার ৳${p.amountBDT} কমিশন যোগ হয়েছে।`;
      link = p.dashboardUrl || "/dashboard/affiliate";
      type = "SYSTEM";
      break;

    case NOTIFICATION_EVENTS.AFFILIATE_COMMISSION_HOLDING:
      title = `কমিশন রিফান্ড হোল্ডিংয়ে জমা হয়েছে`;
      message = `অর্ডার #${p.orderNumber} এর ৳${p.amountBDT} কমিশন ${p.holdUntilDays || 7} দিন রিফান্ড পিরিয়ড শেষে ব্যালেন্সে যোগ হবে।`;
      link = p.dashboardUrl || "/dashboard/affiliate";
      type = "SYSTEM";
      break;

    case NOTIFICATION_EVENTS.AFFILIATE_COMMISSION_RELEASED:
      title = `কমিশন উত্তোলনের জন্য প্রস্তুত!`;
      message = `অর্ডার #${p.orderNumber} এর ৳${p.amountBDT} কমিশন হোল্ডিং শেষে উপলব্ধ ব্যালেন্সে যুক্ত হয়েছে।`;
      link = p.dashboardUrl || "/dashboard/affiliate";
      type = "SYSTEM";
      break;

    case NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_REQUESTED:
      title = `পেআউট রিকোয়েস্ট গৃহীত হয়েছে`;
      message = `আপনার ৳${p.amountBDT} পেআউট রিকোয়েস্ট (${p.payoutMethod}) গ্রহণ করা হয়েছে এবং পর্যালোচনায় রয়েছে।`;
      link = p.dashboardUrl || "/dashboard/affiliate";
      type = "SYSTEM";
      break;

    case NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_APPROVED:
    case NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_COMPLETED:
      title = `পেআউট সম্পন্ন হয়েছে! 🎉`;
      message = `আপনার ৳${p.amountBDT} পেআউট (${p.payoutMethod}) সফলভাবে সম্পন্ন হয়েছে।${p.payoutTrxId ? ` TrxID: ${p.payoutTrxId}` : ""}`;
      link = p.dashboardUrl || "/dashboard/affiliate";
      type = "SYSTEM";
      break;

    case NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_REJECTED:
      title = `পেআউট বাতিল ও ব্যালেন্স রিফান্ড`;
      message = `আপনার ৳${p.amountBDT} পেআউট রিকোয়েস্ট বাতিল করা হয়েছে এবং ব্যালেন্সে ফেরত দেওয়া হয়েছে।${p.adminNotes ? ` কারণ: ${p.adminNotes}` : ""}`;
      link = p.dashboardUrl || "/dashboard/affiliate";
      type = "SYSTEM";
      break;

    case NOTIFICATION_EVENTS.AFFILIATE_TIER_UPGRADED:
      title = `অ্যাফিলিয়েট টিয়ার আপগ্রেড! 🏆`;
      message = `অভিনন্দন! আপনি ${p.newTier} টিয়ারে উত্তীর্ণ হয়েছেন (${p.newRatePercent}% কমিশন রেট)।`;
      link = p.dashboardUrl || "/dashboard/affiliate";
      type = "SYSTEM";
      break;

    default:
      message = JSON.stringify(p);
  }

  return dispatchInAppNotification({
    userId: event.userId!,
    title,
    message,
    type,
    link,
    dedupeKey: event.dedupeKey,
  });
}

async function dispatchEmailForEvent(event: NotificationEventInput, recipientEmail: string) {
  const p = event.payload;
  let rendered;

  switch (event.eventType) {
    case NOTIFICATION_EVENTS.ORDER_CREATED:
      rendered = renderOrderCreatedEmail(p);
      break;

    case NOTIFICATION_EVENTS.PAYMENT_VERIFIED:
      rendered = renderPaymentVerifiedEmail(p);
      break;

    case NOTIFICATION_EVENTS.ORDER_DELIVERED:
    case NOTIFICATION_EVENTS.DELIVERY_PARTIAL:
      rendered = renderOrderDeliveredEmail(p);
      break;

    case NOTIFICATION_EVENTS.WALLET_TOPUP_COMPLETED:
    case NOTIFICATION_EVENTS.WALLET_TOPUP_FAILED:
      rendered = renderWalletTopupEmail(p);
      break;

    case NOTIFICATION_EVENTS.REFUND_REQUESTED:
    case NOTIFICATION_EVENTS.REFUND_APPROVED:
    case NOTIFICATION_EVENTS.REFUND_REJECTED:
    case NOTIFICATION_EVENTS.REFUND_COMPLETED:
      rendered = renderRefundUpdateEmail(p);
      break;

    case NOTIFICATION_EVENTS.REPLACEMENT_REQUESTED:
    case NOTIFICATION_EVENTS.REPLACEMENT_APPROVED:
    case NOTIFICATION_EVENTS.REPLACEMENT_REJECTED:
    case NOTIFICATION_EVENTS.REPLACEMENT_COMPLETED:
      rendered = renderReplacementUpdateEmail(p);
      break;

    case NOTIFICATION_EVENTS.SUPPORT_REPLY_CUSTOMER:
    case NOTIFICATION_EVENTS.SUPPORT_RESOLVED:
      rendered = renderSupportReplyEmail(p);
      break;

    case NOTIFICATION_EVENTS.AUTH_OTP:
      rendered = renderSecurityOtpEmail(p);
      break;

    case NOTIFICATION_EVENTS.AFFILIATE_COMMISSION_EARNED:
    case NOTIFICATION_EVENTS.AFFILIATE_COMMISSION_RELEASED:
      rendered = renderAffiliateCommissionEarnedEmail({
        customerName: p.customerName || "Affiliate",
        customerEmail: recipientEmail,
        commissionAmountBDT: p.amountBDT,
        orderTotalBDT: p.orderTotalBDT || p.amountBDT,
        referralCode: p.referralCode || "AFFILIATE",
        newBalanceBDT: p.newBalanceBDT || p.amountBDT,
      });
      break;

    case NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_COMPLETED:
    case NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_APPROVED:
      rendered = renderAffiliatePayoutCompletedEmail({
        customerName: p.customerName || "Affiliate",
        customerEmail: recipientEmail,
        payoutAmountBDT: p.amountBDT,
        payoutMethod: p.payoutMethod,
        payoutTrxId: p.payoutTrxId,
      });
      break;

    case NOTIFICATION_EVENTS.AFFILIATE_TIER_UPGRADED:
      rendered = renderAffiliateTierUpgradedEmail({
        customerName: p.customerName || "Affiliate",
        customerEmail: recipientEmail,
        newTier: p.newTier,
        newRatePercent: p.newRatePercent,
      });
      break;

    default:
      return { success: true };
  }

  return dispatchEmail({
    to: recipientEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
}

async function dispatchTelegramForEvent(event: NotificationEventInput) {
  const p = event.payload;
  let textHtml = "";

  switch (event.eventType) {
    case NOTIFICATION_EVENTS.AFFILIATE_PAYOUT_REQUESTED:
      textHtml = `
💸 <b>নতুন অ্যাফিলিয়েট পেআউট রিকোয়েস্ট! (Affiliate Payout)</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>পার্টনার:</b> ${p.customerName || "Affiliate"}
📧 <b>ইমেইল:</b> <code>${p.customerEmail}</code>
💰 <b>উত্তোলনের পরিমাণ:</b> <b>৳${p.amountBDT}</b>
💳 <b>মেথড:</b> ${p.payoutMethod?.toUpperCase() || "MFS"}
📱 <b>একাউন্ট নম্বর:</b> <code>${p.payoutPhone || "Wallet"}</code>
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
<i>দয়া করে এডমিন প্যানেল থেকে পেআউট সম্পন্ন করুন।</i>
`;
      break;

    case NOTIFICATION_EVENTS.LOW_STOCK:
      textHtml = `
⚠️ <b>স্টক সতর্কতা (LOW STOCK ALERT)</b>
━━━━━━━━━━━━━━━━━━━━
📦 <b>প্রোডাক্ট:</b> ${p.productName} ${p.variationName ? `(${p.variationName})` : ""}
🔢 <b>মজুদ সংখ্যা:</b> <b>${p.availableCount}</b> (সীমা: ${p.threshold})
🏢 <b>সাপ্লায়ার:</b> ${p.supplierName || "Default"}
⏰ <b>সময়:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
<i>দয়া করে দ্রুত স্টক রিফিল করুন।</i>
`;
      break;

    case NOTIFICATION_EVENTS.OUT_OF_STOCK:
      textHtml = `
🚨 <b>জরুরি: স্টক শেষ (OUT OF STOCK AFTER PAYMENT)</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID:</b> <code>${p.orderNumber}</code>
📦 <b>প্রোডাক্ট:</b> ${p.productName} ${p.variationName ? `(${p.variationName})` : ""}
💰 <b>পরিশোধিত মূল্য:</b> <b>৳${p.paidAmountBDT}</b>
👤 <b>ক্রেতা:</b> ${p.customerEmail}
━━━━━━━━━━━━━━━━━━━━
<i>পেমেন্ট সম্পন্ন হয়েছে কিন্তু কোনো স্টক খালি নেই। অবিলম্বে স্টক যুক্ত করুন বা ম্যানুয়াল ডেলিভারি দিন।</i>
`;
      break;

    case NOTIFICATION_EVENTS.PAYMENT_MISMATCH:
      textHtml = `
⚠️ <b>পেমেন্ট অ্যামাউন্ট অমিল (PAYMENT MISMATCH)</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID:</b> <code>${p.orderNumber}</code>
💰 <b>প্রত্যাশিত মূল্য:</b> ৳${p.expectedAmount}
💵 <b>প্রাপ্ত মূল্য:</b> ৳${p.receivedAmount}
🔑 <b>TrxRef:</b> <code>${p.trxRef || "N/A"}</code>
━━━━━━━━━━━━━━━━━━━━
<i>অর্ডারটি পর্যালোচনার জন্য হোল্ড করা হয়েছে।</i>
`;
      break;

    case NOTIFICATION_EVENTS.FULFILLMENT_FAILED:
      textHtml = `
❌ <b>ডেলিভারি ব্যর্থ হয়েছে (FULFILLMENT FAILED)</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Order ID:</b> <code>${p.orderNumber}</code>
📦 <b>প্রোডাক্ট:</b> ${p.productName}
📝 <b>কারণ:</b> ${p.reason || "Decryption / Allocation failure"}
━━━━━━━━━━━━━━━━━━━━
`;
      break;

    default:
      textHtml = `🔔 <b>AI Haat Alert:</b> ${event.eventType}`;
  }

  return dispatchTelegramAlert(textHtml.trim());
}
