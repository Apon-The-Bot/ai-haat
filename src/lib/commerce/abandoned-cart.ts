import fs from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendAbandonedCartRecoveryEmail } from "@/lib/email-service";

export interface AbandonedCartItem {
  productId: string;
  productName: string;
  variationId?: string;
  variationName?: string;
  priceBDT: number;
  quantity: number;
  image?: string;
}

export interface AbandonedCart {
  id: string;
  recoveryToken: string;
  customerEmail: string;
  customerPhone?: string;
  customerName?: string;
  items: AbandonedCartItem[];
  subtotalBDT: number;
  appliedCoupon?: string;
  status: "ACTIVE" | "RECOVERED" | "CONVERTED" | "CLEARED" | "EXPIRED";
  stage1SentAt?: string | null;
  stage2SentAt?: string | null;
  recoveredAt?: string | null;
  orderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaptureCartInput {
  email: string;
  phone?: string;
  name?: string;
  items: Array<{
    productId?: string;
    id?: string;
    productName?: string;
    name?: string;
    variationId?: string;
    variationName?: string;
    selectedVariation?: { id?: string; name?: string; priceBDT?: number };
    priceBDT?: number;
    quantity?: number;
    image?: string;
    product?: { id?: string; name?: string; image?: string };
  }>;
  subtotalBDT?: number;
  appliedCoupon?: string;
}

export interface RecoveryProcessResult {
  stage: 1 | 2;
  processed: number;
  sent: number;
  skippedSuppressed: number;
  skippedConverted: number;
  errors: number;
  details: Array<{ email: string; status: string; reason?: string }>;
}

const dataDir = path.join(process.cwd(), "data");
const cartsFile = path.join(dataDir, "abandoned-carts.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(cartsFile)) {
    fs.writeFileSync(cartsFile, JSON.stringify([], null, 2), "utf-8");
  }
}

export function getLocalAbandonedCarts(): AbandonedCart[] {
  ensureDir();
  try {
    const raw = fs.readFileSync(cartsFile, "utf-8");
    const parsed = JSON.parse(raw) as AbandonedCart[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalAbandonedCarts(carts: AbandonedCart[]) {
  ensureDir();
  fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2), "utf-8");
}

/**
 * Check if customer has unsubscribed or is in suppression list
 */
export async function isEmailSuppressed(email: string): Promise<boolean> {
  const normalized = email.toLowerCase().trim();
  if (!normalized) return true;

  try {
    const suppression = await prisma.emailSuppression.findUnique({
      where: { email: normalized },
    });
    if (suppression) return true;

    const contact = await prisma.emailContact.findUnique({
      where: { email: normalized },
    });
    if (contact && (!contact.isSubscribed || !contact.promotionalConsent)) {
      return true;
    }
  } catch (e) {
    // If DB is offline, allow lifecycle recovery by default
  }

  return false;
}

/**
 * Captures or updates checkout intent and generates a unique 1-click recovery token
 */
export async function captureAbandonedCart(input: CaptureCartInput): Promise<AbandonedCart | null> {
  const email = (input.email || "").toLowerCase().trim();
  if (!email || !email.includes("@")) return null;

  if (!input.items || !Array.isArray(input.items) || input.items.length === 0) {
    return null;
  }

  const sanitizedItems: AbandonedCartItem[] = input.items.map((item) => {
    const pId = item.productId || item.product?.id || item.id || "product";
    const pName = item.productName || item.product?.name || item.name || "AI Tool Subscription";
    const vId = item.variationId || item.selectedVariation?.id;
    const vName = item.variationName || item.selectedVariation?.name;
    const price = item.priceBDT || item.selectedVariation?.priceBDT || 0;
    const qty = Math.max(1, Number(item.quantity) || 1);
    const img = item.image || item.product?.image;

    return {
      productId: pId,
      productName: pName,
      variationId: vId,
      variationName: vName,
      priceBDT: price,
      quantity: qty,
      image: img,
    };
  });

  const calculatedSubtotal = input.subtotalBDT ?? sanitizedItems.reduce((sum, i) => sum + i.priceBDT * i.quantity, 0);
  const nowStr = new Date().toISOString();
  const carts = getLocalAbandonedCarts();

  // Check if active cart exists for email
  const existingIdx = carts.findIndex(
    (c) => c.customerEmail.toLowerCase() === email && c.status === "ACTIVE"
  );

  if (existingIdx >= 0) {
    const existing = carts[existingIdx];
    existing.items = sanitizedItems;
    existing.subtotalBDT = calculatedSubtotal;
    existing.customerPhone = input.phone || existing.customerPhone;
    existing.customerName = input.name || existing.customerName;
    existing.appliedCoupon = input.appliedCoupon || existing.appliedCoupon;
    existing.updatedAt = nowStr;
    carts[existingIdx] = existing;
    saveLocalAbandonedCarts(carts);
    return existing;
  }

  const recoveryToken = `rec_${crypto.randomBytes(16).toString("hex")}`;
  const newCart: AbandonedCart = {
    id: `cart_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`,
    recoveryToken,
    customerEmail: email,
    customerPhone: input.phone?.trim() || undefined,
    customerName: input.name?.trim() || undefined,
    items: sanitizedItems,
    subtotalBDT: calculatedSubtotal,
    appliedCoupon: input.appliedCoupon?.trim() || undefined,
    status: "ACTIVE",
    stage1SentAt: null,
    stage2SentAt: null,
    recoveredAt: null,
    orderId: null,
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  carts.unshift(newCart);
  saveLocalAbandonedCarts(carts);
  return newCart;
}

/**
 * Marks abandoned cart converted when order is placed, suppressing further reminders
 */
export async function markCartConverted(emailOrToken: string, orderId?: string): Promise<boolean> {
  const target = (emailOrToken || "").toLowerCase().trim();
  if (!target) return false;

  const carts = getLocalAbandonedCarts();
  let modified = false;

  for (const cart of carts) {
    if (
      (cart.recoveryToken.toLowerCase() === target || cart.customerEmail.toLowerCase() === target) &&
      cart.status === "ACTIVE"
    ) {
      cart.status = "CONVERTED";
      cart.orderId = orderId || cart.orderId || null;
      cart.updatedAt = new Date().toISOString();
      modified = true;
    }
  }

  if (modified) {
    saveLocalAbandonedCarts(carts);
  }

  return modified;
}

/**
 * Marks abandoned cart cleared when user manually clears their cart
 */
export async function markCartCleared(emailOrToken: string): Promise<boolean> {
  const target = (emailOrToken || "").toLowerCase().trim();
  if (!target) return false;

  const carts = getLocalAbandonedCarts();
  let modified = false;

  for (const cart of carts) {
    if (
      (cart.recoveryToken.toLowerCase() === target || cart.customerEmail.toLowerCase() === target) &&
      cart.status === "ACTIVE"
    ) {
      cart.status = "CLEARED";
      cart.updatedAt = new Date().toISOString();
      modified = true;
    }
  }

  if (modified) {
    saveLocalAbandonedCarts(carts);
  }

  return modified;
}

/**
 * Retrieve cart details by recovery token for 1-click cart restoration
 */
export async function getCartByRecoveryToken(token: string): Promise<AbandonedCart | null> {
  const cleanToken = (token || "").trim();
  if (!cleanToken) return null;

  const carts = getLocalAbandonedCarts();
  const cart = carts.find((c) => c.recoveryToken === cleanToken);

  if (!cart) return null;
  if (cart.status === "CLEARED" || cart.status === "CONVERTED") {
    return null;
  }

  return cart;
}

/**
 * Marks cart as RECOVERED when restored by customer
 */
export async function markCartRecovered(token: string): Promise<AbandonedCart | null> {
  const cleanToken = (token || "").trim();
  if (!cleanToken) return null;

  const carts = getLocalAbandonedCarts();
  const cart = carts.find((c) => c.recoveryToken === cleanToken);

  if (!cart) return null;

  cart.status = "RECOVERED";
  cart.recoveredAt = new Date().toISOString();
  cart.updatedAt = new Date().toISOString();

  saveLocalAbandonedCarts(carts);
  return cart;
}

/**
 * Finds carts eligible for 2-stage recovery
 * Stage 1: >= 1 hour after abandonment, stage1SentAt == null
 * Stage 2: >= 24 hours after abandonment, stage1SentAt != null, stage2SentAt == null
 */
export function getEligibleAbandonedCarts(stage: 1 | 2, now = new Date()): AbandonedCart[] {
  const carts = getLocalAbandonedCarts();
  const nowMs = now.getTime();
  const oneHourMs = 60 * 60 * 1000;
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;
  const maxRetentionMs = 7 * 24 * 60 * 60 * 1000; // 7 days

  return carts.filter((c) => {
    if (c.status !== "ACTIVE") return false;
    const createdMs = new Date(c.createdAt).getTime();
    const ageMs = nowMs - createdMs;

    if (ageMs > maxRetentionMs) return false;

    if (stage === 1) {
      return ageMs >= oneHourMs && !c.stage1SentAt;
    } else if (stage === 2) {
      return ageMs >= twentyFourHoursMs && Boolean(c.stage1SentAt) && !c.stage2SentAt;
    }

    return false;
  });
}

/**
 * Executes recovery email dispatching for a given stage
 */
export async function processAbandonedCartStage(
  stage: 1 | 2,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aihaat.shop",
  now = new Date()
): Promise<RecoveryProcessResult> {
  const eligible = getEligibleAbandonedCarts(stage, now);
  const result: RecoveryProcessResult = {
    stage,
    processed: eligible.length,
    sent: 0,
    skippedSuppressed: 0,
    skippedConverted: 0,
    errors: 0,
    details: [],
  };

  for (const cart of eligible) {
    // 1. Suppression List Guard
    const isSuppressed = await isEmailSuppressed(cart.customerEmail);
    if (isSuppressed) {
      result.skippedSuppressed++;
      result.details.push({ email: cart.customerEmail, status: "SKIPPED", reason: "Suppressed or unsubscribed" });
      continue;
    }

    // 2. Converted / Order Placed Guard
    try {
      const recentOrder = await prisma.order.findFirst({
        where: {
          customerEmail: cart.customerEmail,
          createdAt: { gte: new Date(cart.createdAt) },
        },
      });

      if (recentOrder) {
        await markCartConverted(cart.customerEmail, recentOrder.id);
        result.skippedConverted++;
        result.details.push({ email: cart.customerEmail, status: "SKIPPED", reason: "Order placed after abandonment" });
        continue;
      }
    } catch {
      // Ignore DB error, proceed with dispatch
    }

    // 3. Construct 1-click Cart Recovery Link
    const couponParam = stage === 2 ? "&coupon=SAVE5" : "";
    const recoveryUrl = `${baseUrl.replace(/\/+$/, "")}/cart?recover=${cart.recoveryToken}${couponParam}`;
    const unsubscribeUrl = `${baseUrl.replace(/\/+$/, "")}/api/unsubscribe?email=${encodeURIComponent(cart.customerEmail)}`;

    try {
      const emailResult = await sendAbandonedCartRecoveryEmail({
        customerName: cart.customerName,
        customerEmail: cart.customerEmail,
        stage,
        items: cart.items.map((i) => ({
          productName: i.productName,
          variationName: i.variationName,
          priceBDT: i.priceBDT,
          quantity: i.quantity,
          image: i.image,
        })),
        subtotalBDT: cart.subtotalBDT,
        recoveryUrl,
        couponCode: stage === 2 ? "SAVE5" : undefined,
        discountPercent: stage === 2 ? 5 : undefined,
        unsubscribeUrl,
      });

      if (emailResult.success) {
        const carts = getLocalAbandonedCarts();
        const found = carts.find((c) => c.id === cart.id);
        if (found) {
          const sentTime = now.toISOString();
          if (stage === 1) {
            found.stage1SentAt = sentTime;
          } else {
            found.stage2SentAt = sentTime;
          }
          found.updatedAt = sentTime;
          saveLocalAbandonedCarts(carts);
        }

        result.sent++;
        result.details.push({ email: cart.customerEmail, status: "SENT" });
      } else {
        result.errors++;
        result.details.push({ email: cart.customerEmail, status: "ERROR", reason: emailResult.error });
      }
    } catch (err: any) {
      result.errors++;
      result.details.push({ email: cart.customerEmail, status: "ERROR", reason: err?.message || String(err) });
    }
  }

  return result;
}
