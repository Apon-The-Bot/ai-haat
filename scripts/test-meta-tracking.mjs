import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import crypto from "node:crypto";
import ts from "typescript";

function load(path, dependencies = {}, globals = {}) {
  const source = readFileSync(new URL(`../src/${path}.ts`, import.meta.url), "utf8");
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  const require = (id) => {
    assert.ok(Object.hasOwn(dependencies, id), `Unexpected dependency ${id}`);
    return dependencies[id];
  };
  new Function("module", "exports", "require", ...Object.keys(globals), code)(
    module, module.exports, require, ...Object.values(globals)
  );
  return module.exports;
}

const metaEvents = load("lib/analytics/meta-events");
const encryption = load("lib/mfa/crypto", { crypto }, {
  process: { env: { MFA_ENCRYPTION_KEY: crypto.randomBytes(32).toString("hex") } },
});
const settingsLib = load("lib/analytics/meta-settings", {
  "@/lib/prisma": { prisma: {} }, "@/lib/mfa/crypto": encryption, "./meta-events": metaEvents,
});
const { defaultMetaSettings, updateMetaSettings, publicMetaSettings, adminMetaSettings, readMetaToken, metaActive } = settingsLib;
const token = "synthetic_fixture_access_token";
const saved = updateMetaSettings({
  ...defaultMetaSettings, pixelId: "1234567890", enabled: true, capi: true, advanced: true, token,
}, defaultMetaSettings);
assert.equal(readMetaToken(saved), token);
assert.match(saved.tokenCiphertext, /^v1:/);
assert.ok(!JSON.stringify(saved).includes(token));
assert.ok(!JSON.stringify(publicMetaSettings(saved)).includes("token"));
assert.ok(!JSON.stringify(adminMetaSettings(saved)).includes(saved.tokenCiphertext));
assert.equal(updateMetaSettings({ ...saved, token: token + "_replacement" }, saved).connection, "pending");
assert.throws(() => updateMetaSettings({ ...saved, pixelId: "12/evil" }, saved), /Invalid Pixel/);
assert.throws(() => updateMetaSettings({ ...saved, graphVersion: "v20.0" }, saved), /Unsupported/);
assert.throws(() => updateMetaSettings({ ...saved, pixelId: "87654321" }, saved), /access token/);
assert.equal(metaActive({ ...saved, testMode: true }, "capi", "Purchase"), false);
assert.equal(metaActive({ ...saved, paused: true }, "browser"), false);
assert.equal(metaActive({ ...saved, events: { ...saved.events, Purchase: false } }, "browser", "Purchase"), false);

const purchase = load("lib/analytics/meta-purchase");
const consent = load("lib/analytics/meta-consent");
const order = {
  id: "fixture-order", orderNumber: "AH-FIXTURE", totalBDT: 95, userId: "buyer",
  paymentStatus: "VERIFIED", deliveryStatus: "PROCESSING", metaConsentId: "a".repeat(64),
  customerEmail: "fixture@example.test", customerPhone: "01700000000",
  metaAttribution: { userAgent: "FixtureBrowser/1.0" },
  items: [{ productId: "product", variationId: "variant", priceBDT: 50, quantity: 2 }],
};
const data = purchase.buildCapiPurchaseData(order);
assert.equal(data.value, 95);
assert.equal(data.currency, "BDT");
assert.deepEqual(data.content_ids, ["product:variant"]);
assert.equal(purchase.purchaseEligible(order), true);
for (const change of [{ userId: null }, { metaConsentId: null }, { paymentStatus: "PENDING" }, { deliveryStatus: "CANCELLED" }]) {
  assert.equal(purchase.purchaseEligible({ ...order, ...change }), false);
}

const url = new URL("https://aihaat.shop/checkout/success?orderId=AH-FIXTURE");
const commands = [];
const win = { location: url, fbq: (...args) => commands.push(args) };
const browser = load("lib/analytics/meta-browser", {}, {
  window: win,
  document: { referrer: "", createElement: () => ({}), head: { append: (script) => script.onload() } },
});
const browserSettings = { ...publicMetaSettings(saved), ads: true, analytics: false, decided: true };
browser.setBrowserMetaConfig({ ...browserSettings, ads: false });
assert.equal(browser.trackMeta("PageView"), false);
assert.ok(commands.every((command) => command[0] === "consent"));
browser.setBrowserMetaConfig(browserSettings);
assert.equal(browser.trackMeta("PageView"), true);
assert.equal(browser.trackMeta("PageView"), false);
assert.equal(browser.isMetaBrowserUrl(new URL("https://aihaat.shop/login?code=secret")), false);
assert.equal(browser.isMetaBrowserUrl(new URL("https://aihaat.shop/gift/private-token")), false);
const eventId = purchase.purchaseEventId(order.orderNumber);
assert.equal(browser.trackMeta("Purchase", data, eventId, saved.pixelId), true);
const pixelCommand = commands.find((command) => command[2] === "Purchase");
assert.deepEqual(pixelCommand, ["trackSingle", saved.pixelId, "Purchase", data, { eventID: eventId }]);
browser.suspendBrowserMeta();
assert.equal(browser.trackMeta("Purchase", data, eventId, saved.pixelId), false);

let providerCalls = 0;
const capi = load("lib/analytics/meta-capi", { "./meta-settings": settingsLib }, {
  fetch: async (url, options) => {
    providerCalls++;
    assert.equal(url, "https://graph.facebook.com/v26.0/1234567890/events");
    const payload = JSON.parse(options.body);
    assert.equal(payload.access_token, token);
    assert.equal(payload.test_event_code, undefined);
    assert.equal(payload.data[0].event_id, pixelCommand[4].eventID);
    assert.equal(payload.data[0].event_name, pixelCommand[2]);
    assert.equal(payload.data[0].custom_data.value, 95);
    assert.equal(payload.data[0].user_data.em?.[0]?.length, 64);
    assert.equal(payload.data[0].user_data.client_user_agent, "FixtureBrowser/1.0");
    assert.ok(!options.body.includes(order.customerEmail));
    return providerCalls === 1
      ? { ok: false, status: 503, json: async () => ({ error: { code: 2 } }) }
      : { ok: true, status: 200, json: async () => ({ events_received: 1 }) };
  },
});
let queued;
let currentSettings = saved;
const knownError = class extends Error { code = "P2002"; };
const Prisma = { DbNull: null, PrismaClientKnownRequestError: knownError };
const prisma = {
  order: { findFirst: async () => order, findUnique: async () => order, updateMany: async () => ({ count: 1 }) },
  advertisingConsent: {
    findUnique: async () => ({ expiresAt: new Date(Date.now() + 60_000) }),
    deleteMany: async () => ({ count: 0 }),
  },
  analyticsEvent: {
    create: async ({ data }) => {
      if (queued) throw new knownError();
      queued = { id: "event", createdAt: new Date(), nextAttemptAt: null, ...data, attempts: 0 };
    },
    updateMany: async ({ where, data }) => {
      if (!where.id) return { count: 0 };
      queued = { ...queued, ...data, attempts: queued.attempts + (data.attempts?.increment || 0) };
      return { count: 1 };
    },
    deleteMany: async () => ({ count: 0 }),
    findMany: async () => queued?.status === "PENDING" && (!queued.nextAttemptAt || queued.nextAttemptAt <= new Date()) ? [queued] : [],
  },
};
const deps = {
  "@prisma/client": { Prisma }, "@/lib/prisma": { prisma }, "./meta-purchase": purchase,
  "./meta-settings": { ...settingsLib, getMetaSettings: async () => currentSettings },
};
const server = load("lib/analytics/server", deps);
const delivery = load("lib/analytics/meta-delivery", {
  ...deps, "./meta-capi": capi, "./meta-consent": consent,
  "./sanitize": load("lib/analytics/sanitize", { crypto }),
});
await server.trackServerPurchase(order.id);
await server.trackServerPurchase(order.id);
assert.equal(queued.eventId, eventId);
assert.equal(queued.status, "PENDING");
assert.equal(providerCalls, 0);
assert.deepEqual(await delivery.runMetaOutbox(), { retry: 1 });
assert.equal(queued.attempts, 1);
assert.ok(queued.nextAttemptAt > new Date());
assert.deepEqual(await delivery.runMetaOutbox(), {});
queued.nextAttemptAt = new Date(Date.now() - 1);
assert.deepEqual(await delivery.runMetaOutbox(), { sent: 1 });
assert.equal(queued.eventId, eventId);
assert.equal(queued.status, "SENT");

queued = { ...queued, status: "PENDING", attempts: 0, nextAttemptAt: null };
currentSettings = { ...saved, pixelId: "8765432100" };
assert.deepEqual(await delivery.runMetaOutbox(), { suppressed: 1 });
assert.equal(queued.lastError, "dataset_changed");
assert.equal(providerCalls, 2);
currentSettings = saved;
queued = { ...queued, status: "PENDING", attempts: 0, nextAttemptAt: null };
prisma.advertisingConsent.findUnique = async () => null;
assert.deepEqual(await delivery.runMetaOutbox(), { suppressed: 1 });
assert.equal(queued.lastError, "consent_expired_or_withdrawn");
assert.equal(providerCalls, 2);

class ResponseFixture {
  constructor(body, status = 200) { Object.assign(this, { body, status }); }
  static json(body, options) { return new ResponseFixture(body, options?.status); }
}
const denied = new ResponseFixture({}, 403);
const admin = load("app/api/admin/integrations/meta/route", {
  "node:crypto": crypto, "next/server": { NextResponse: ResponseFixture },
  "@/lib/auth-guard": { requireAdminMfa: async () => denied }, "@/lib/security/csrf": {},
  "@/lib/prisma": { prisma: {} }, "@/lib/analytics/meta-settings": deps["./meta-settings"],
  "@/lib/analytics/meta-capi": capi, "@/lib/analytics/meta-purchase": purchase, "@/lib/rate-limit": {},
});
assert.equal((await admin.GET()).status, 403);
assert.equal((await admin.POST(new Request("https://aihaat.shop/api/admin/integrations/meta", { method: "POST" }))).status, 403);
const receiptApi = load("app/api/orders/analytics/route", {
  "next/server": { NextResponse: ResponseFixture }, "@/lib/auth-guard": {
    requireAuth: async () => ({ user: { id: "other-user" } }),
  },
  "@/lib/prisma": { prisma: { order: { findFirst: async ({ where }) => {
    assert.equal(where.userId, "other-user");
    assert.equal(where.paymentStatus, "VERIFIED");
    return null;
  } } } },
  "@/lib/analytics/meta-settings": deps["./meta-settings"], "@/lib/analytics/meta-consent": consent,
  "@/lib/analytics/meta-purchase": purchase, "@/lib/rate-limit": { checkRateLimit: () => ({ allowed: true }) },
});
assert.equal((await receiptApi.GET({ nextUrl: new URL(`https://aihaat.shop/api/orders/analytics?orderId=${order.orderNumber}`) })).status, 404);
console.log("Meta settings, consent, browser deduplication, purchase integrity and retry fixtures passed.");
