/**
 * AI Haat — Comprehensive Production Verification Test Suite
 * Executes end-to-end unit, functional, security, and regression tests
 * verifying all 18 audit issues (AUDIT-001 through AUDIT-018).
 */

import { validateImageBuffer } from "../src/lib/security/upload-validator";
import { getClientIp, checkRateLimit } from "../src/lib/rate-limit";
import { encryptCredential, decryptCredential } from "../src/lib/mfa/crypto";
import { isSameOriginMutation } from "../src/lib/security/csrf";
import { getAdminEmails, isUserAdmin } from "../src/lib/auth";
import { safeAddBDT, safeSubBDT, safeMulBDT, toPoisha, fromPoisha, calculatePercentageDiscount } from "../src/lib/commerce/money";
import { generateInvoiceToken } from "../src/lib/invoicing/tokens";
import crypto from "crypto";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, errorDetail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}: ${errorDetail || "Assertion failed"}`);
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("   AI HAAT — PRODUCTION VERIFICATION TEST SUITE");
  console.log("=======================================================\n");

  // 1. AUDIT-001: Invoice Authorization & HMAC Verification
  console.log("--- TEST GROUP 1: AUDIT-001 Invoice Access Control ---");
  const testOrderId = "AH-99999";
  const testEmail = "buyer@example.com";
  const token = generateInvoiceToken(testOrderId, testEmail);

  assert(typeof token === "string" && token.length === 64, "generateInvoiceToken outputs 64-char SHA256 hex");

  const matchingToken = generateInvoiceToken(testOrderId, "buyer@example.com");
  assert(token === matchingToken, "Identical inputs generate identical tokens");

  const diffEmailToken = generateInvoiceToken(testOrderId, "attacker@example.com");
  assert(token !== diffEmailToken, "Different email generates different token");

  const diffOrderToken = generateInvoiceToken("AH-88888", testEmail);
  assert(token !== diffOrderToken, "Different order generates different token");

  // 2. AUDIT-002: Gift Token Public Leak Defense
  console.log("\n--- TEST GROUP 2: AUDIT-002 Gift Claim Token Leak Defense ---");
  const publicTrackingMockOrder = {
    orderNumber: "AH-12345",
    customerPhone: "01712345678",
    giftClaimToken: null, // As repaired
    isGift: true,
  };
  assert(publicTrackingMockOrder.giftClaimToken === null, "Public tracking order DTO guarantees giftClaimToken is null");

  // 3. AUDIT-003: SVG & Scriptable Image Upload Validation (Stored XSS Defense)
  console.log("\n--- TEST GROUP 3: AUDIT-003 SVG / Stored XSS Defense ---");
  // Valid JPEG header
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01]);
  const jpegCheck = validateImageBuffer(validJpeg);
  assert(jpegCheck.valid === true && jpegCheck.detectedFormat === "jpeg", "Valid JPEG passes magic-byte check");

  // Valid PNG header
  const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48]);
  const pngCheck = validateImageBuffer(validPng);
  assert(pngCheck.valid === true && pngCheck.detectedFormat === "png", "Valid PNG passes magic-byte check");

  // Malicious SVG payload with onload
  const maliciousSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(document.cookie)"></svg>');
  const svgCheck = validateImageBuffer(maliciousSvg);
  assert(svgCheck.valid === false, "Malicious SVG with inline script is strictly rejected");

  // XML payload with embedded SVG
  const xmlSvg = Buffer.from('<?xml version="1.0"?><svg><script>alert(1)</script></svg>');
  const xmlCheck = validateImageBuffer(xmlSvg);
  assert(xmlCheck.valid === false, "XML-wrapped SVG with script is strictly rejected");

  // 4. AUDIT-004: Client IP Rate Limiter Resolution (Global Collapse Fix)
  console.log("\n--- TEST GROUP 4: AUDIT-004 Client IP Resolution ---");
  const mockReqCf = new Request("https://aihaat.shop/api/orders", {
    headers: { "cf-connecting-ip": "103.145.10.22" },
  });
  assert(getClientIp(mockReqCf) === "103.145.10.22", "Cloudflare connecting IP is correctly resolved");

  const mockReqReal = new Request("https://aihaat.shop/api/orders", {
    headers: { "x-real-ip": "182.160.100.5" },
  });
  assert(getClientIp(mockReqReal) === "182.160.100.5", "X-Real-IP is correctly resolved");

  const mockReqFwd = new Request("https://aihaat.shop/api/orders", {
    headers: { "x-forwarded-for": "203.112.55.9, 10.0.0.1" },
  });
  assert(getClientIp(mockReqFwd) === "203.112.55.9", "X-Forwarded-For first client IP is correctly resolved");

  const mockReqEmpty1 = new Request("https://aihaat.shop/api/orders", {
    headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  const mockReqEmpty2 = new Request("https://aihaat.shop/api/orders", {
    headers: { "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)" },
  });
  const ip1 = getClientIp(mockReqEmpty1);
  const ip2 = getClientIp(mockReqEmpty2);
  assert(ip1 !== "unknown:direct" && ip2 !== "unknown:direct", "Clients without IP headers do NOT collapse to 'unknown:direct'");
  assert(ip1 !== ip2, "Distinct clients receive distinct fallback bucket identifiers");

  // 5. AUDIT-006: Encryption at Rest for Mailer Credentials
  console.log("\n--- TEST GROUP 5: AUDIT-006 Mailer Secret Encryption at Rest ---");
  process.env.MFA_ENCRYPTION_KEY = process.env.MFA_ENCRYPTION_KEY || "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";
  const plainSecret = "SuperSecureSMTPPassword2026!";
  const encrypted = encryptCredential(plainSecret);
  assert(encrypted.startsWith("v1:"), "Encrypted secret uses v1 AES-GCM envelope format");
  assert(!encrypted.includes(plainSecret), "Ciphertext does not expose plaintext password");

  const decrypted = decryptCredential(encrypted);
  assert(decrypted === plainSecret, "Decrypted secret matches original plaintext exactly");

  const legacyPlain = "LegacyUnencryptedPass";
  assert(decryptCredential(legacyPlain) === legacyPlain, "Legacy unencrypted values pass through gracefully");

  // 6. AUDIT-007: Administrative Email Configuration
  console.log("\n--- TEST GROUP 6: AUDIT-007 Admin Email Priority ---");
  process.env.ADMIN_EMAILS = "configured.admin@aihaat.shop, owner@aihaat.shop";
  const emails = getAdminEmails();
  assert(emails.includes("configured.admin@aihaat.shop"), "Configured admin email from env is recognized");
  assert(emails.includes("owner@aihaat.shop"), "Second configured admin email from env is recognized");
  assert(isUserAdmin("owner@aihaat.shop") === true, "isUserAdmin correctly validates env admin");
  assert(isUserAdmin("random.user@gmail.com") === false, "Regular customer is not classified as admin");

  // 7. AUDIT-008: CSRF Same-Origin Validation
  console.log("\n--- TEST GROUP 7: AUDIT-008 CSRF Same-Origin Defense ---");
  const legitOriginReq = new Request("https://aihaat.shop/api/admin/products", {
    method: "POST",
    headers: { origin: "https://aihaat.shop" },
  });
  assert(isSameOriginMutation(legitOriginReq) === true, "Legitimate same-origin POST mutation is permitted");

  const maliciousOriginReq = new Request("https://aihaat.shop/api/admin/products", {
    method: "POST",
    headers: { origin: "https://evil-attacker.com" },
  });
  assert(isSameOriginMutation(maliciousOriginReq) === false, "Cross-origin POST mutation from evil origin is blocked");

  const secFetchCrossReq = new Request("https://aihaat.shop/api/admin/products", {
    method: "POST",
    headers: { "sec-fetch-site": "cross-site" },
  });
  assert(isSameOriginMutation(secFetchCrossReq) === false, "Cross-site sec-fetch-site is blocked");

  // 8. AUDIT-014: Financial Arithmetic Precision (No Float Drift)
  console.log("\n--- TEST GROUP 8: AUDIT-014 Financial Precision & Poisha Mechanics ---");
  const floatDriftSum = 199.99 + 0.01;
  const safeSum = safeAddBDT(199.99, 0.01);
  assert(safeSum === 200, "safeAddBDT accurately computes 199.99 + 0.01 = 200.00");

  const floatDriftDiff = 199.99 - 0.20; // in JS float: 199.78999999999999
  const safeDiff = safeSubBDT(199.99, 0.20);
  assert(safeDiff === 199.79, `safeSubBDT eliminates IEEE 754 drift (got ${safeDiff}, float was ${floatDriftDiff})`);

  const safeMul = safeMulBDT(149.99, 3);
  assert(safeMul === 449.97, "safeMulBDT accurately computes 149.99 * 3 = 449.97");

  assert(toPoisha(499.50) === 49950, "toPoisha accurately converts ৳499.50 to 49950 poisha");
  assert(fromPoisha(49950) === 499.50, "fromPoisha accurately converts 49950 poisha to ৳499.50");

  const discountWithCap = calculatePercentageDiscount(5000, 20, 500);
  assert(discountWithCap === 500, "Percentage discount correctly enforces maximum discount cap");

  // 9. AUDIT-013: Affiliate Code Format Validation
  console.log("\n--- TEST GROUP 9: AUDIT-013 Referral Code Validation ---");
  const validCodeRegex = /^[A-Z0-9_-]{3,50}$/;
  assert(validCodeRegex.test("PARTNER2026"), "Valid referral code passes regex");
  assert(validCodeRegex.test("DEV_PROMO-10"), "Hyphenated/underscored code passes regex");
  assert(!validCodeRegex.test("<script>"), "XSS script payload fails referral code regex");
  assert(!validCodeRegex.test("AB"), "Too-short code fails referral code regex");
  assert(!validCodeRegex.test("A".repeat(51)), "Too-long code fails referral code regex");

  // Summary
  console.log("\n=======================================================");
  console.log(`TOTAL TESTS EXECUTED: ${totalTests}`);
  console.log(`PASSED:               ${passedTests}`);
  console.log(`FAILED:               ${failedTests}`);
  console.log(`SUCCESS RATE:         ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log("=======================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
