import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

function loadModule(path, dependencies, fetchMock) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React },
  }).outputText;
  const module = { exports: {} };
  const requireMock = (name) => {
    if (!Object.hasOwn(dependencies, name)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  };
  new Function("require", "module", "exports", "process", "fetch", code)(
    requireMock, module, module.exports, {
      env: {
        NEXTAUTH_SECRET: "synthetic-test-only",
        PIPRAPAY_BASE_URL: "https://gateway.example.test",
        PIPRAPAY_API_KEY: "synthetic-test-only",
      },
    }, fetchMock
  );
  return module.exports;
}

let session;
class JsonResponse {
  constructor(body, { status = 200 } = {}) { Object.assign(this, { body, status }); }
  static json(body, options) { return new JsonResponse(body, options); }
}
const server = { NextResponse: JsonResponse };
const nextAuth = { getServerSession: async () => session };
const forbiddenDb = new Proxy({}, { get() { throw new Error("Unexpected database access"); } });
const { GET } = loadModule("../src/app/api/auth/me/route.ts", {
  "next/server": server,
  "next-auth": nextAuth,
  "@/lib/auth": { authOptions: {} },
  "@/lib/prisma": { prisma: forbiddenDb },
  "@/lib/mfa/session": {},
  "@/lib/wallet-db": {},
});
const profile = await GET(new Request("https://example.test/api/auth/me?email=admin@example.test"));
assert.equal(profile.status, 401);

const { requireAdmin, requireMfaVerified } = loadModule("../src/lib/auth-guard.ts", {
  "next/server": server,
  "next-auth": nextAuth,
  "./auth": { authOptions: {} },
  "./mfa/session": {},
  "./prisma": { prisma: forbiddenDb },
  "./user-control/user-control-service": { getUserEffectiveStatus: async () => ({ status: "ACTIVE" }) },
});
assert.equal((await requireAdmin()).status, 401);
session = { user: { id: "fixture", email: "admin@example.test", role: "USER" } };
assert.equal((await requireAdmin()).status, 403);
session.user.role = "ADMIN";
assert.equal((await requireAdmin()).user.id, "fixture");
assert.equal((await requireMfaVerified()).status, 503);

let row = { id: "fixture", role: "USER", security: null };
const { authOptions } = loadModule("../src/lib/auth.ts", {
  "next-auth/providers/google": { default: (options) => options },
  "@/utils/email": {},
  "@/lib/prisma": { prisma: { user: { findFirst: async () => row } } },
});
const staleAdmin = { email: "admin@example.test", role: "ADMIN", id: "fixture" };
assert.equal((await authOptions.callbacks.jwt({ token: staleAdmin })).role, "USER");
row = null;
const missing = await authOptions.callbacks.jwt({ token: staleAdmin });
assert.equal(missing.role, "USER");
assert.equal(missing.id, undefined);
console.log("Auth boundary tests passed.");

const { requireAuth } = loadModule("../src/lib/auth-guard.ts", {
  "next/server": server,
  "next-auth": nextAuth,
  "./auth": { authOptions: {} },
  "./mfa/session": {},
  "./prisma": { prisma: forbiddenDb },
  "./user-control/user-control-service": { getUserEffectiveStatus: async () => ({ status: "ACTIVE" }) },
});
const { safeAuthReturn } = loadModule("../src/lib/security/auth-return.ts", {});
assert.equal(safeAuthReturn("/checkout?coupon=SAVE"), "/checkout?coupon=SAVE");
for (const target of ["https://evil.test", "//evil.test", "/\\evil.test", "/x/..//evil.test", "/login?x=1"]) {
  assert.equal(safeAuthReturn(target), "/", target);
}
const common = {
  "next/server": server,
  "@/lib/auth-guard": { requireAuth, requireAdminMfa: async () => JsonResponse.json({}, { status: 401 }) },
  "@/lib/security/csrf": { isSameOriginMutation: (request) => request.headers.get("origin") === "https://aihaat.shop" },
  "@/lib/rate-limit": { checkRateLimit: () => ({ allowed: true }), getClientIp: () => "fixture" },
  "@/lib/user-control/user-control-service": { checkFeatureEntitlement: async () => ({ allowed: true }) },
};
const request = (body, origin = "https://aihaat.shop") => new Request("https://aihaat.shop/api/fixture", {
  method: "POST",
  headers: { origin },
  body: JSON.stringify(body),
});
let order = { id: "fixture-order", orderNumber: "AH-FIXTURE", userId: "other", totalBDT: 100, paymentStatus: "PENDING" };
let gatewayCalls = 0;
const payment = loadModule("../src/app/api/payment/create/route.ts", {
  ...common,
  "node:crypto": await import("node:crypto"),
  "@/lib/prisma": { prisma: { order: { findFirst: async () => order } } },
}, async (_url, options) => {
  gatewayCalls++;
  const payload = JSON.parse(options.body);
  assert.deepEqual(payload.metadata, { orderId: "AH-FIXTURE", userId: "fixture", email: "buyer@example.test" });
  assert.equal(payload.amount, "100.00");
  return { json: async () => ({ pp_url: "https://gateway.example.test/checkout" }) };
});
let createdOrder;
const orders = loadModule("../src/app/api/orders/route.ts", {
  ...common,
  crypto: await import("node:crypto"),
  "@/lib/prisma": { prisma: {
    $transaction: async (run) => run({ order: { create: async ({ data }) => { createdOrder = data; } } }),
  } },
  "@/lib/orders-db": { saveOrder: () => {} },
  "@/utils/telegram": { sendNewOrderTelegramAlert: async () => {} },
  "@/lib/commerce/pricing": { calculateOrderQuote: async () => ({
    isValid: true, quote: { items: [], totalBDT: 100, subtotalBDT: 100, discountBDT: 0 },
  }) },
  "@/lib/audit-logger": {},
  "@/lib/gifting/product-gifting": {},
  "@/lib/commerce/abandoned-cart": { markCartConverted: async () => {} },
  "@/lib/notifications": { NOTIFICATION_EVENTS: {}, dispatchNotificationEvent: async () => {} },
});
const gifts = loadModule("../src/app/api/gift/claim/[token]/route.ts", {
  ...common, "@/lib/gifting/product-gifting": {},
});
const delivery = loadModule("../src/app/api/admin/deliver/route.ts", {
  ...common, "@/utils/email": {}, "@/lib/prisma": { prisma: forbiddenDb }, "@/lib/mfa/crypto": {},
});
const checkout = loadModule("../src/app/checkout/page.tsx", {
  ...common,
  react: { default: { createElement: () => "checkout fixture" } },
  "@/components/checkout/CheckoutPageClient": {},
  "next/navigation": { redirect: (destination) => { throw new Error(destination); } },
});
const giftCards = loadModule("../src/app/api/gift-cards/create/route.ts", {
  ...common,
  "@/lib/prisma": { prisma: forbiddenDb },
  "@/lib/gifting/gift-cards": {
    createGiftCard: async (params) => {
      assert.equal(params.purchasedByUserId, "fixture");
      assert.equal(params.senderEmail, "buyer@example.test");
      return params.amountBDT <= 100 ? { code: "fixture" } : null;
    },
  },
});
session = undefined;
await assert.rejects(() => checkout.default({ searchParams: Promise.resolve({ coupon: "SAVE", renewal: "true" }) }),
  { message: "/login?callbackUrl=%2Fcheckout%3Fcoupon%3DSAVE%26renewal%3Dtrue" });
assert.equal((await orders.POST(request({}))).status, 401);
assert.equal((await payment.POST(request({ orderId: order.id }))).status, 401);
assert.equal((await delivery.POST(request({}))).status, 401);
assert.equal((await giftCards.POST(request({ amountBDT: 50 }))).status, 401);
assert.equal((await gifts.GET(request({}), { params: Promise.resolve({ token: "fixture" }) })).status, 401);
assert.equal((await gifts.POST(request({}), { params: Promise.resolve({ token: "fixture" }) })).status, 401);
assert.equal(gatewayCalls, 0);
assert.equal(createdOrder, undefined);

session = { user: { id: "fixture", role: "USER", email: "buyer@example.test" } };
assert.equal(await checkout.default({ searchParams: Promise.resolve({}) }), "checkout fixture");
assert.equal((await giftCards.POST(request({ amountBDT: 150 }))).status, 409);
assert.equal((await giftCards.POST(request({ amountBDT: 50, purchasedByUserId: "spoofed" }))).status, 200);
assert.equal((await payment.POST(request({ orderId: order.id }, "https://evil.test"))).status, 403);
assert.equal((await payment.POST(request({ orderId: order.id }))).status, 404);
order.userId = null;
assert.equal((await payment.POST(request({ orderId: order.id }))).status, 404);
assert.equal(gatewayCalls, 0);
order.userId = session.user.id;
const spoofed = { customerEmail: "other@example.test", metadata: { userId: "other", orderId: "other" } };
assert.equal((await orders.POST(request({ ...spoofed, customerName: "Fixture", customerPhone: "01700000000", items: [{}] }))).status, 200);
assert.equal(createdOrder.userId, session.user.id);
assert.equal(createdOrder.customerEmail, session.user.email);
assert.equal((await payment.POST(request({ ...spoofed, orderId: order.id, amount: 1 }))).status, 200);
assert.equal(gatewayCalls, 1);

let verificationMetadata;
let fulfillmentCalls = 0;
const webhook = loadModule("../src/app/api/payment/webhook/route.ts", {
  ...common,
  "@/lib/analytics/server": { trackServerPurchase: async () => {} },
  "@/lib/prisma": { prisma: {
    order: {
      findFirst: async ({ where }) => where.id?.not ? null : order,
      updateMany: async ({ where, data }) => {
        if (order.paymentStatus !== where.paymentStatus) return { count: 0 };
        order = { ...order, ...data };
        return { count: 1 };
      },
    },
    orderTimelineEvent: { create: async () => {} },
  } },
  "@/lib/orders-db": { updateOrderStatus: () => {} },
  "@/lib/wallet-db": {},
  "@/lib/commerce/inventory": { tryAutoFulfillOrder: async () => { fulfillmentCalls++; } },
  "@/lib/notifications": { NOTIFICATION_EVENTS: {}, dispatchNotificationEvent: async () => {} },
  "@/lib/commerce/affiliates": { processPaidOrderCommission: async () => {} },
  "@/lib/loyalty/coins": { awardCoinsForOrder: async () => {} },
}, async () => ({
  ok: true,
  json: async () => ({ status: "completed", amount: 100, metadata: verificationMetadata }),
}));
session = undefined;
const webhookRequest = () => request({ pp_id: "fixture-ref", metadata: { orderId: order.orderNumber, userId: "spoofed" } });
assert.equal((await webhook.POST(webhookRequest())).status, 400);
assert.equal(fulfillmentCalls, 0);
verificationMetadata = { orderId: order.orderNumber, userId: "fixture" };
assert.equal((await webhook.POST(webhookRequest())).status, 200);
assert.equal((await webhook.POST(webhookRequest())).status, 200);
assert.equal(order.paymentStatus, "VERIFIED");
assert.equal(fulfillmentCalls, 1);
console.log("Purchase boundary tests passed.");
