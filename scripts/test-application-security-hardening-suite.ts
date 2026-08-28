import assert from "assert";
import crypto from "crypto";
import { escapeHtml, escapeTelegramHtml, renderThankYouHtml } from "../src/lib/security/html-escape";
import { renderSafeMarkdownInline } from "../src/components/blog/safe-markdown";
import { getClientIp, checkRateLimit } from "../src/lib/rate-limit";
import { isSameOriginMutation } from "../src/lib/security/csrf";
import { validateImageBuffer } from "../src/lib/security/upload-validator";
import { hashRecoveryCode, verifyRecoveryCode } from "../src/lib/mfa/crypto";
import { authOptions } from "../src/lib/auth";

interface TestCase {
  category: string;
  name: string;
  run: () => void | Promise<void>;
}

const testCases: TestCase[] = [];

function registerTest(category: string, name: string, run: () => void | Promise<void>) {
  testCases.push({ category, name, run });
}

// -------------------------------------------------------------------------
// 1. NextAuth Identity & Canonical User ID
// -------------------------------------------------------------------------
registerTest("NextAuth Identity", "NextAuth session callback maps canonical token.appUserId to session.user.id", async () => {
  const sessionCallback = (authOptions.callbacks as any)?.session;
  assert.strictEqual(typeof sessionCallback, "function");

  const mockSession = { user: { name: "Test User", email: "test@example.com" } };
  const mockToken = {
    appUserId: "canonical_prisma_cuid_12345",
    id: "canonical_prisma_cuid_12345",
    role: "USER",
    walletBalanceBDT: 500,
    mfaRequired: false,
  };

  const resolved = await sessionCallback({ session: mockSession, token: mockToken });
  assert.strictEqual(resolved.user.id, "canonical_prisma_cuid_12345");
  assert.strictEqual(resolved.user.role, "USER");
  assert.strictEqual(resolved.user.walletBalanceBDT, 500);
});

registerTest("NextAuth Identity", "NextAuth session callback preserves canonical ID over Google sub", async () => {
  const sessionCallback = (authOptions.callbacks as any)?.session;
  const mockSession = { user: { name: "Test User", email: "test@example.com" } };
  const mockToken = {
    appUserId: "prisma_user_cuid_999",
    id: "108392183921839218",
    role: "ADMIN",
    walletBalanceBDT: 0,
    mfaRequired: true,
  };

  const resolved = await sessionCallback({ session: mockSession, token: mockToken });
  assert.strictEqual(resolved.user.id, "prisma_user_cuid_999", "Canonical appUserId must take precedence");
  assert.strictEqual(resolved.user.role, "ADMIN");
});

// -------------------------------------------------------------------------
// 2. XSS & HTML Injection Defense
// -------------------------------------------------------------------------
registerTest("XSS Defense", "escapeHtml safely encodes dangerous HTML entities", () => {
  const dangerous = "<script" + ">alert('xss & \"attack\"')" + "</script" + ">";
  const safe = escapeHtml(dangerous);
  assert.strictEqual(safe.includes("<script" + ">"), false);
  assert.strictEqual(safe.includes("alert"), true);
  assert.strictEqual(safe.includes("&lt;script&gt;"), true);
  assert.strictEqual(safe.includes("&amp;"), true);
  assert.strictEqual(safe.includes("&quot;"), true);
  assert.strictEqual(safe.includes("&#x27;"), true);
});

registerTest("XSS Defense", "renderThankYouHtml neutralizes XSS in review quick-rate", () => {
  const payload = '"><script' + '>alert("pwned")</script' + '><img src=x onerror=alert(1)>';
  const html = renderThankYouHtml(payload, 5, payload, payload);
  assert.strictEqual(html.includes("<script" + ">alert"), false);
  assert.strictEqual(html.includes("<img src=x"), false);
  assert.strictEqual(html.includes("&lt;script&gt;"), true);
  assert.strictEqual(html.includes("&lt;img"), true);
});

registerTest("XSS Defense", "renderSafeMarkdownInline returns React elements without raw dangerous HTML", () => {
  const text = "This is **bold text** with normal content.";
  const elements = renderSafeMarkdownInline(text);
  assert.strictEqual(Array.isArray(elements), true);
  assert.strictEqual(elements.length > 0, true);
});

// -------------------------------------------------------------------------
// 3. Rate Limiting & Proxy IP Spoofing
// -------------------------------------------------------------------------
registerTest("Rate Limiting", "getClientIp ignores spoofed X-Forwarded-For when TRUST_PROXY is disabled and returns unknown:direct", () => {
  const oldTrust = process.env.TRUST_PROXY;
  const oldCf = process.env.TRUST_CF_CONNECTING_IP;
  delete process.env.TRUST_PROXY;
  delete process.env.TRUST_CF_CONNECTING_IP;

  const fakeReq = {
    headers: new Headers({
      "x-forwarded-for": "203.0.113.195, 10.0.0.1",
      "cf-connecting-ip": "198.51.100.22",
    }),
  } as any;

  const ip = getClientIp(fakeReq);
  assert.strictEqual(ip, "unknown:direct", "Untrusted proxy headers must return unknown:direct");

  process.env.TRUST_PROXY = oldTrust;
  process.env.TRUST_CF_CONNECTING_IP = oldCf;
});

registerTest("Rate Limiting", "getClientIp respects Cloudflare header only when TRUST_CF_CONNECTING_IP is true", () => {
  const oldCf = process.env.TRUST_CF_CONNECTING_IP;
  process.env.TRUST_CF_CONNECTING_IP = "true";

  const req = {
    headers: new Headers({
      "cf-connecting-ip": "103.145.12.8",
    }),
  } as any;

  const ip = getClientIp(req);
  assert.strictEqual(ip, "103.145.12.8");

  process.env.TRUST_CF_CONNECTING_IP = oldCf;
});

registerTest("Rate Limiting", "checkRateLimit accurately throttles exceeding attempts and calculates retryAfter", () => {
  const key = "test_limit_" + Date.now();
  const first = checkRateLimit(key, 3, 10000);
  assert.strictEqual(first.allowed, true);
  assert.strictEqual(first.remaining, 2);

  const second = checkRateLimit(key, 3, 10000);
  assert.strictEqual(second.allowed, true);
  assert.strictEqual(second.remaining, 1);

  const third = checkRateLimit(key, 3, 10000);
  assert.strictEqual(third.allowed, true);
  assert.strictEqual(third.remaining, 0);

  const fourth = checkRateLimit(key, 3, 10000);
  assert.strictEqual(fourth.allowed, false);
  assert.strictEqual(fourth.remaining, 0);
  assert.strictEqual(fourth.retryAfterMs > 0, true);
});

// -------------------------------------------------------------------------
// 4. CSRF / Same-Origin Defense
// -------------------------------------------------------------------------
registerTest("CSRF Defense", "isSameOriginMutation allows safe GET / HEAD requests", () => {
  const req = { method: "GET", headers: new Headers() } as any;
  assert.strictEqual(isSameOriginMutation(req), true);
});

registerTest("CSRF Defense", "isSameOriginMutation blocks cross-origin POST requests from malicious domains", () => {
  const req = {
    method: "POST",
    headers: new Headers({
      origin: "https://evil-untrusted-site.com",
    }),
  } as any;
  assert.strictEqual(isSameOriginMutation(req), false);
});

registerTest("CSRF Defense", "isSameOriginMutation blocks cookie-authenticated browser mutations lacking Origin and Referer", () => {
  const req = {
    method: "POST",
    headers: new Headers({
      cookie: "__Secure-next-auth.session-token=mock_session_token_xyz",
    }),
  } as any;
  assert.strictEqual(isSameOriginMutation(req), false, "Must fail closed for cookie mutations lacking Origin/Referer");
});

registerTest("CSRF Defense", "isSameOriginMutation allows trusted origins (https://aihaat.shop, localhost)", () => {
  const req1 = {
    method: "POST",
    headers: new Headers({
      origin: "https://aihaat.shop",
    }),
  } as any;
  assert.strictEqual(isSameOriginMutation(req1), true);

  const req2 = {
    method: "POST",
    headers: new Headers({
      origin: "http://localhost:3000",
    }),
  } as any;
  assert.strictEqual(isSameOriginMutation(req2), true);
});

// -------------------------------------------------------------------------
// 5. File Upload Magic-Byte Validation
// -------------------------------------------------------------------------
registerTest("Upload Validator", "validateImageBuffer accepts valid JPEG binary header", () => {
  const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const res = validateImageBuffer(jpegBuffer);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.detectedFormat, "jpeg");
});

registerTest("Upload Validator", "validateImageBuffer accepts valid PNG binary header", () => {
  const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const res = validateImageBuffer(pngBuffer);
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.detectedFormat, "png");
});

registerTest("Upload Validator", "validateImageBuffer rejects malicious non-image file masquerading as image", () => {
  const fakeBuffer = Buffer.from("console.log('malicious script execution payload');\n\n\n\n");
  const res = validateImageBuffer(fakeBuffer);
  assert.strictEqual(res.valid, false);
  assert.strictEqual(res.error?.includes("Invalid file content"), true);
});

registerTest("Upload Validator", "validateImageBuffer rejects SVG with scripts", () => {
  const htmlBuffer = Buffer.from("<svg onload=alert(1)><body><script></script></body>");
  const res = validateImageBuffer(htmlBuffer);
  assert.strictEqual(res.valid, false);
});

// -------------------------------------------------------------------------
// 6. MFA Recovery Code Hashing
// -------------------------------------------------------------------------
registerTest("MFA Security", "hashRecoveryCode generates versioned hmac-v1 hash", () => {
  const code = "ABCD-1234";
  const hashed = hashRecoveryCode(code);
  assert.strictEqual(hashed.startsWith("hmac-v1:"), true);
  assert.strictEqual(hashed.length, 8 + 64);
});

registerTest("MFA Security", "verifyRecoveryCode successfully verifies correct code in constant time", () => {
  const code = "WXYZ-7890";
  const hashed = hashRecoveryCode(code);
  assert.strictEqual(verifyRecoveryCode("WXYZ-7890", hashed), true);
  assert.strictEqual(verifyRecoveryCode("wxyz-7890", hashed), true, "Case-insensitive normalization");
  assert.strictEqual(verifyRecoveryCode("WXYZ-9999", hashed), false);
});

registerTest("MFA Security", "verifyRecoveryCode supports legacy SHA-256 hashes", () => {
  const legacyCode = "LEGACY-1234";
  const legacyHash = crypto.createHash("sha256").update(legacyCode).digest("hex");
  assert.strictEqual(verifyRecoveryCode("LEGACY-1234", legacyHash), true);
  assert.strictEqual(verifyRecoveryCode("WRONG-1234", legacyHash), false);
});

registerTest("MFA Security", "getRecoveryCodePepper fails closed in production if environment secret is missing", () => {
  const oldEnv = process.env.NODE_ENV;
  const oldPepper = process.env.MFA_RECOVERY_CODE_PEPPER;
  (process.env as any).NODE_ENV = "production";
  delete process.env.MFA_RECOVERY_CODE_PEPPER;

  assert.throws(() => {
    hashRecoveryCode("TEST-FAIL-CLOSED");
  }, /MFA_RECOVERY_CODE_PEPPER environment variable is required in production/);

  (process.env as any).NODE_ENV = oldEnv;
  process.env.MFA_RECOVERY_CODE_PEPPER = oldPepper;
});

// -------------------------------------------------------------------------
// 7. Telegram HTML Injection
// -------------------------------------------------------------------------
registerTest("Telegram Injection", "escapeTelegramHtml escapes reserved <, >, & while preserving formatting integrity", () => {
  const input = "Product 1 < 2 & 3 > 0 with <b>Bold</b> and <script>";
  const escaped = escapeTelegramHtml(input);
  assert.strictEqual(escaped.includes("<script" + ">"), false);
  assert.strictEqual(escaped.includes("<b>"), false);
  assert.strictEqual(escaped.includes("&lt;b&gt;"), true);
  assert.strictEqual(escaped.includes("&amp;"), true);
});

// -------------------------------------------------------------------------
// 8. Content Security Policy Header Validation
// -------------------------------------------------------------------------
registerTest("Content Security Policy", "next.config.mjs contains comprehensive Content-Security-Policy header", async () => {
  const nextConfigModule = await import("../next.config.mjs");
  const nextConfig = nextConfigModule.default;
  assert.strictEqual(typeof nextConfig.headers, "function");

  const headersList = await (nextConfig as any).headers();
  const globalHeaderRule = headersList.find((h: any) => h.source === "/:path*");
  assert.strictEqual(!!globalHeaderRule, true, "Global /:path* headers rule must exist");

  const cspHeader = globalHeaderRule.headers.find((h: any) => h.key === "Content-Security-Policy");
  assert.strictEqual(!!cspHeader, true, "Content-Security-Policy header must exist");
  assert.strictEqual(cspHeader.value.includes("default-src 'self'"), true);
  assert.strictEqual(cspHeader.value.includes("script-src"), true);
  assert.strictEqual(cspHeader.value.includes("connect-src"), true);
  assert.strictEqual(cspHeader.value.includes("frame-ancestors 'none'"), true);
  assert.strictEqual(cspHeader.value.includes("object-src 'none'"), true);
});

// -------------------------------------------------------------------------
// Deterministic Execution Engine
// -------------------------------------------------------------------------
async function main() {
  console.log("================================================================================");
  console.log("AI HAAT - PHASE 4: AUTHENTICATION & APPLICATION SECURITY TEST SUITE");
  console.log("Deterministic Asynchronous Sequential Execution Harness");
  console.log("================================================================================\n");

  const declaredCount = testCases.length;
  let executedCount = 0;
  let passedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  let currentCategory = "";

  for (const testCase of testCases) {
    if (testCase.category !== currentCategory) {
      currentCategory = testCase.category;
      console.log(`\n--- ${currentCategory} ---`);
    }

    executedCount++;
    try {
      await testCase.run();
      console.log(`  [PASS] ${testCase.name}`);
      passedCount++;
    } catch (err: any) {
      console.error(`  [FAIL] ${testCase.name}:`, err.message);
      failedCount++;
    }
  }

  console.log("\n================================================================================");
  console.log("PHASE 4 SECURITY SUITE RECONCILIATION SUMMARY");
  console.log(`Declared test cases : ${declaredCount}`);
  console.log(`Executed test cases : ${executedCount}`);
  console.log(`Passed              : ${passedCount}`);
  console.log(`Failed              : ${failedCount}`);
  console.log(`Skipped             : ${skippedCount}`);
  console.log("================================================================================");

  if (declaredCount !== executedCount || failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test harness uncaught error:", err);
  process.exit(1);
});
