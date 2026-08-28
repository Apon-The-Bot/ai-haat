import fs from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendReviewRequestEmail } from "@/lib/email-service";
import { isEmailSuppressed } from "@/lib/commerce/abandoned-cart";
import { createReview } from "@/lib/reviews-db";

export interface ReviewRequestRecord {
  id: string;
  token: string;
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  variationName?: string;
  customerEmail: string;
  customerName: string;
  userId?: string;
  status: "SENT" | "RATED" | "SKIPPED";
  rating?: number;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRetentionProcessResult {
  processed: number;
  sent: number;
  skippedSuppressed: number;
  skippedAlreadyReviewed: number;
  skippedAlreadySent: number;
  errors: number;
  details: Array<{ orderNumber: string; email: string; status: string; reason?: string }>;
}

const dataDir = path.join(process.cwd(), "data");
const requestsFile = path.join(dataDir, "review-requests.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(requestsFile)) {
    fs.writeFileSync(requestsFile, JSON.stringify([], null, 2), "utf-8");
  }
}

export function getLocalReviewRequests(): ReviewRequestRecord[] {
  ensureDir();
  try {
    const raw = fs.readFileSync(requestsFile, "utf-8");
    const parsed = JSON.parse(raw) as ReviewRequestRecord[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalReviewRequests(records: ReviewRequestRecord[]) {
  ensureDir();
  fs.writeFileSync(requestsFile, JSON.stringify(records, null, 2), "utf-8");
}

export function findReviewRequestByToken(token: string): ReviewRequestRecord | null {
  const clean = (token || "").trim();
  if (!clean) return null;
  const list = getLocalReviewRequests();
  return list.find((r) => r.token === clean) || null;
}

/**
 * Scans delivered orders that are at least 24 hours old and dispatches 1-click review emails
 */
export async function processPostDeliveryReviewRequests(
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aihaat.shop",
  now = new Date()
): Promise<ReviewRetentionProcessResult> {
  const result: ReviewRetentionProcessResult = {
    processed: 0,
    sent: 0,
    skippedSuppressed: 0,
    skippedAlreadyReviewed: 0,
    skippedAlreadySent: 0,
    errors: 0,
    details: [],
  };

  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // 1. Find delivered orders within eligible retention window (delivered 24h to 14d ago)
  let deliveredOrders: any[] = [];
  try {
    deliveredOrders = await prisma.order.findMany({
      where: {
        deliveryStatus: "DELIVERED",
        updatedAt: {
          lte: oneDayAgo,
          gte: fourteenDaysAgo,
        },
      },
      include: {
        items: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
  } catch (dbErr) {
    console.warn("[Review Retention] Prisma query fallback:", dbErr);
  }

  const existingRequests = getLocalReviewRequests();

  for (const order of deliveredOrders) {
    result.processed++;
    const customerEmail = (order.customerEmail || "").toLowerCase().trim();
    if (!customerEmail || !customerEmail.includes("@")) {
      result.details.push({ orderNumber: order.orderNumber, email: customerEmail, status: "SKIPPED", reason: "Invalid email" });
      continue;
    }

    // Check email suppression list
    const isSuppressed = await isEmailSuppressed(customerEmail);
    if (isSuppressed) {
      result.skippedSuppressed++;
      result.details.push({ orderNumber: order.orderNumber, email: customerEmail, status: "SKIPPED", reason: "User suppressed/unsubscribed" });
      continue;
    }

    // Process primary delivered item
    const primaryItem = order.items?.[0] || {
      productId: "chatgpt-plus",
      productName: "AI Tool Subscription",
      variationName: "Standard",
    };

    const productId = primaryItem.productId || "chatgpt-plus";
    const productName = primaryItem.productName || "Digital Subscription";
    const variationName = primaryItem.variationName || undefined;

    // Check if review request already sent for this order
    const alreadySent = existingRequests.find(
      (r) => (r.orderId === order.id || r.orderNumber === order.orderNumber) && r.productId === productId
    );

    if (alreadySent) {
      result.skippedAlreadySent++;
      result.details.push({ orderNumber: order.orderNumber, email: customerEmail, status: "SKIPPED", reason: "Review request already dispatched" });
      continue;
    }

    // Check if user already reviewed this product
    try {
      const existingReview = await prisma.review.findFirst({
        where: {
          productId,
          author: { contains: order.customerName || "Customer" },
        },
      });

      if (existingReview) {
        result.skippedAlreadyReviewed++;
        result.details.push({ orderNumber: order.orderNumber, email: customerEmail, status: "SKIPPED", reason: "Product already reviewed" });
        continue;
      }
    } catch {
      // Ignore DB check error
    }

    // Generate unique review request token
    const token = `rev_${crypto.randomBytes(16).toString("hex")}`;
    const quickRateBaseUrl = `${baseUrl.replace(/\/+$/, "")}/api/reviews/quick-rate?token=${token}`;
    const reviewModalUrl = `${baseUrl.replace(/\/+$/, "")}/products/${productId}?review=true&order=${order.orderNumber}`;

    try {
      const emailResult = await sendReviewRequestEmail({
        customerName: order.customerName || "Valued Customer",
        customerEmail,
        orderNumber: order.orderNumber,
        productName,
        variationName,
        quickRateBaseUrl,
        reviewModalUrl,
        token,
      });

      if (emailResult.success) {
        const record: ReviewRequestRecord = {
          id: `req_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
          token,
          orderId: order.id,
          orderNumber: order.orderNumber,
          productId,
          productName,
          variationName,
          customerEmail,
          customerName: order.customerName || "Valued Customer",
          userId: order.userId || undefined,
          status: "SENT",
          sentAt: now.toISOString(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };

        existingRequests.push(record);
        saveLocalReviewRequests(existingRequests);

        result.sent++;
        result.details.push({ orderNumber: order.orderNumber, email: customerEmail, status: "SENT" });
      } else {
        result.errors++;
        result.details.push({ orderNumber: order.orderNumber, email: customerEmail, status: "ERROR", reason: emailResult.error });
      }
    } catch (sendErr: any) {
      result.errors++;
      result.details.push({ orderNumber: order.orderNumber, email: customerEmail, status: "ERROR", reason: sendErr?.message || String(sendErr) });
    }
  }

  return result;
}

/**
 * Handles 1-click rating submission with automatic Verified Buyer badge attachment
 */
export async function submitQuickRating(
  token: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; message: string; review?: any; record?: ReviewRequestRecord }> {
  const record = findReviewRequestByToken(token);
  if (!record) {
    return {
      success: false,
      message: "Invalid or expired review rating token.",
    };
  }

  const normalizedRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
  const defaultComment =
    normalizedRating === 5
      ? "অসাধারণ সার্ভিস এবং অত্যন্ত দ্রুত ডেলিভারি পেয়েছি! AI Haat এর সার্ভিস নিয়ে আমি পুরোপুরি সন্তুষ্ট।"
      : normalizedRating === 4
      ? "খুব ভালো সার্ভিস এবং দ্রুত ডেলিভারি। সাপোর্ট টিম অত্যন্ত আন্তরিক।"
      : normalizedRating === 3
      ? "মোটামুটি ভালো অভিজ্ঞতা।"
      : "সার্ভিসটি আরও উন্নত করা যেতে পারে।";

  const finalComment = (comment && comment.trim()) ? comment.trim() : defaultComment;

  // Create review with Verified Buyer badge attached
  const newReview = await createReview({
    userId: record.userId,
    userName: record.customerName,
    author: record.customerName || "Verified Buyer",
    rating: normalizedRating,
    comment: finalComment,
    productId: record.productId,
    productName: record.productName,
    isVerifiedPurchase: true, // Attached automatically!
    status: "APPROVED", // Approved automatically with verified badge
  });

  // Update request record
  const allRequests = getLocalReviewRequests();
  const matched = allRequests.find((r) => r.token === record.token);
  if (matched) {
    matched.status = "RATED";
    matched.rating = normalizedRating;
    matched.updatedAt = new Date().toISOString();
    saveLocalReviewRequests(allRequests);
  }

  return {
    success: true,
    message: "আপনার রেটিং সফলভাবে গৃহীত হয়েছে এবং ভেরিফাইড বায়ার ব্যাজ যুক্ত হয়েছে!",
    review: newReview,
    record: matched || record,
  };
}
