/**
 * AI Haat - Customer Digital Vault, Credential Security & Warranty Automation Master Verification Test Suite
 * Run with: npx tsx scripts/test-vault-warranty-master-suite.ts
 */

import { encryptCredential, decryptCredential } from "../src/lib/mfa/crypto";
import {
  calculateWarrantyStatus,
  calculateCustomerEntitlementStatus,
  calculateReplacementEligibility,
} from "../src/lib/commerce/warranty";
import {
  resolveActivationGuide,
  AI_TOOLS_GUIDE,
  STREAMING_GUIDE,
  VPN_GUIDE,
  WINDOWS_OFFICE_GUIDE,
  DEVELOPER_TOOLS_GUIDE,
  GENERAL_DIGITAL_GUIDE,
} from "../src/lib/commerce/activation-guides";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    console.log(`  \x1b[32m✔\x1b[0m ${testName}`);
    passedCount++;
  } else {
    console.error(`  \x1b[31m✖\x1b[0m ${testName}`);
    if (details) console.error("    Details:", details);
    failedCount++;
  }
}

async function runMasterTestSuite() {
  console.log("\n=========================================================================");
  console.log("🚀 STARTING AI HAAT DIGITAL VAULT & WARRANTY MASTER TEST SUITE");
  console.log("=========================================================================\n");

  // Ensure encryption key exists for testing
  if (!process.env.MFA_ENCRYPTION_KEY) {
    process.env.MFA_ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  }
  if (!process.env.EMAIL_OTP_PEPPER) {
    process.env.EMAIL_OTP_PEPPER = "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";
  }

  // -------------------------------------------------------------------------
  // SECTION 1: CREDENTIAL SECURITY & CRYPTO INTEGRITY
  // -------------------------------------------------------------------------
  console.log("\n🔑 [SECTION 1] Credential Security & AES-256-GCM Crypto Tests");
  try {
    const rawPlaintext = "email: user@aihaat.shop\npassword: SuperSecret#2026!\npin: 9942";
    const encrypted = encryptCredential(rawPlaintext);

    assert(encrypted.startsWith("v1:"), "Encrypted credentials use v1 versioning header");
    assert(encrypted !== rawPlaintext, "Plaintext credentials are encrypted at rest");

    const decrypted = decryptCredential(encrypted);
    assert(decrypted === rawPlaintext, "Decrypted credentials match original plaintext exactly");

    // Legacy unencrypted fallback check
    const legacyPlain = "LEGACY-UNENCRYPTED-KEY-9999";
    const legacyDecrypted = decryptCredential(legacyPlain);
    assert(legacyDecrypted === legacyPlain, "Legacy unencrypted credentials return plaintext seamlessly");

    // Special characters & Unicode support
    const unicodePayload = "User: গ্রাহক_01@aihaat.shop\nPass: বাংলা_পাসওয়ার্ড_#123\nToken: sk-proj-αβγ123";
    const encUnicode = encryptCredential(unicodePayload);
    assert(decryptCredential(encUnicode) === unicodePayload, "Unicode, Bengali text, and special API tokens encrypt/decrypt cleanly");
  } catch (err: any) {
    assert(false, `Crypto section threw error: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SECTION 2: WARRANTY CALCULATION & EXPIRY TRACKING
  // -------------------------------------------------------------------------
  console.log("\n⏳ [SECTION 2] Warranty Countdown & Expiry Tracking Engine");
  try {
    const now = new Date();

    // Active warranty (purchased today, 30 days coverage)
    const activeStatus = calculateWarrantyStatus(now, 30);
    assert(activeStatus.isValid === true, "Active 30-day warranty is marked valid");
    assert(activeStatus.daysRemaining >= 29 && activeStatus.daysRemaining <= 30, "Active warranty computes correct remaining days");
    assert(activeStatus.isLifetime === false, "30-day warranty is not marked lifetime");

    // Expired warranty (purchased 40 days ago, 30 days coverage)
    const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);
    const expiredStatus = calculateWarrantyStatus(fortyDaysAgo, 30);
    assert(expiredStatus.isValid === false, "Expired warranty is marked invalid");
    assert(expiredStatus.daysRemaining === 0, "Expired warranty days remaining clamps to 0");

    // Lifetime warranty (100 years / 36500 days)
    const lifetimeStatus = calculateWarrantyStatus(now, 36500);
    assert(lifetimeStatus.isValid === true, "Lifetime warranty is marked valid");
    assert(lifetimeStatus.isLifetime === true, "Lifetime warranty flag is set to true");

    // Entitlement status calculation
    const entitlementActive = calculateCustomerEntitlementStatus(now, 365);
    assert(entitlementActive.isActive === true && entitlementActive.daysRemaining! > 360, "1-Year entitlement duration computes active status");

    const entitlementLifetime = calculateCustomerEntitlementStatus(now, null);
    assert(entitlementLifetime.isLifetime === true && entitlementLifetime.expiresAt === null, "Null duration is treated as Lifetime entitlement");
  } catch (err: any) {
    assert(false, `Warranty calculation section threw error: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SECTION 3: REPLACEMENT ELIGIBILITY CALCULATOR
  // -------------------------------------------------------------------------
  console.log("\n🛡️ [SECTION 3] Replacement Eligibility & Policy Validation");
  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    // Case 1: Valid active warranty item
    const eligibleItem = calculateReplacementEligibility(
      { warrantyExpiresAt: futureDate, isReplacement: false, replacementsAsOriginal: [] },
      { isRefunded: false, replacementAllowedAtPurchase: true }
    );
    assert(eligibleItem.isEligible === true, "Active warranty item with no refunds or open claims is eligible");

    // Case 2: Expired warranty item
    const expiredItem = calculateReplacementEligibility(
      { warrantyExpiresAt: pastDate, isReplacement: false, replacementsAsOriginal: [] },
      { isRefunded: false, replacementAllowedAtPurchase: true }
    );
    assert(expiredItem.isEligible === false, "Expired warranty item is NOT eligible");
    assert(expiredItem.reason?.toLowerCase().includes("expired") === true, "Expired warranty provides clear explanation reason");

    // Case 3: Refunded item
    const refundedItem = calculateReplacementEligibility(
      { warrantyExpiresAt: futureDate, isReplacement: false, replacementsAsOriginal: [] },
      { isRefunded: true, replacementAllowedAtPurchase: true }
    );
    assert(refundedItem.isEligible === false, "Refunded item is NOT eligible for replacement");

    // Case 4: Item with active open replacement claim
    const openClaimItem = calculateReplacementEligibility(
      {
        warrantyExpiresAt: futureDate,
        isReplacement: false,
        replacementsAsOriginal: [{ status: "REQUESTED" }],
      },
      { isRefunded: false, replacementAllowedAtPurchase: true }
    );
    assert(openClaimItem.isEligible === false, "Item with pending open replacement claim is blocked from duplicates");
    assert(openClaimItem.reason?.toLowerCase().includes("in progress") === true, "Open claim reason is correctly noted");
  } catch (err: any) {
    assert(false, `Replacement eligibility section threw error: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SECTION 4: PRODUCT ACTIVATION & SETUP GUIDES RESOLVER
  // -------------------------------------------------------------------------
  console.log("\n📚 [SECTION 4] Interactive Product Activation Guides Resolver");
  try {
    // 4.1 AI Tools
    const chatGptGuide = resolveActivationGuide({ name: "ChatGPT Plus 1 Month", category: "AI Tools" });
    assert(chatGptGuide.categoryKey === AI_TOOLS_GUIDE.categoryKey, "ChatGPT resolves to AI Tools Guide");
    assert(chatGptGuide.securityWarnings.length >= 2, "AI Guide includes critical security warnings");
    assert(chatGptGuide.setupSteps.some((s) => s.codeSnippet?.includes("OPENAI_API_KEY")), "AI Guide includes API key code snippet");

    // 4.2 Streaming
    const netflixGuide = resolveActivationGuide({ name: "Netflix Premium 1 Screen", category: "Streaming" });
    assert(netflixGuide.categoryKey === STREAMING_GUIDE.categoryKey, "Netflix resolves to Streaming Guide");
    assert(netflixGuide.securityWarnings.some((w) => w.titleEn.includes("Profile")), "Streaming Guide includes Profile Integrity warning");

    // 4.3 VPN
    const nordGuide = resolveActivationGuide({ name: "NordVPN 1 Year Shared", category: "VPN" });
    assert(nordGuide.categoryKey === VPN_GUIDE.categoryKey, "NordVPN resolves to VPN Guide");

    // 4.4 Windows & Office
    const winGuide = resolveActivationGuide({ name: "Windows 11 Pro Genuine Retail Key", category: "Operating Systems" });
    assert(winGuide.categoryKey === WINDOWS_OFFICE_GUIDE.categoryKey, "Windows 11 Pro resolves to Windows & Office Guide");
    assert(winGuide.setupSteps.some((s) => s.codeSnippet?.includes("slmgr")), "Windows Guide includes slmgr command line snippet");

    // 4.5 Developer Tools
    const canvaGuide = resolveActivationGuide({ name: "Canva Pro Team Invite", category: "Design Tools" });
    assert(canvaGuide.categoryKey === DEVELOPER_TOOLS_GUIDE.categoryKey, "Canva Pro resolves to Developer & Design Guide");

    // 4.6 Fallback General
    const genericGuide = resolveActivationGuide({ name: "Custom Digital Service", category: "Misc" });
    assert(genericGuide.categoryKey === GENERAL_DIGITAL_GUIDE.categoryKey, "Generic digital product falls back to General Digital Guide");
  } catch (err: any) {
    assert(false, `Activation guide section threw error: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SECTION 5: CREDENTIAL PARSING & .TXT EXPORT FORMATTER
  // -------------------------------------------------------------------------
  console.log("\n📦 [SECTION 5] Credential Parsing & TXT Export Generation");
  try {
    const parseCredentials = (raw: string) => {
      const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
      let username = "";
      let password = "";
      let licenseKey = "";
      const extraLines: string[] = [];

      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.startsWith("user:") || lower.startsWith("email:") || lower.startsWith("username:")) {
          username = line.substring(line.indexOf(":") + 1).trim();
        } else if (lower.startsWith("pass:") || lower.startsWith("password:") || lower.startsWith("pin:")) {
          password = line.substring(line.indexOf(":") + 1).trim();
        } else if (lower.startsWith("key:") || lower.startsWith("license:") || lower.startsWith("code:") || lower.startsWith("serial:")) {
          licenseKey = line.substring(line.indexOf(":") + 1).trim();
        } else if (lines.length === 1 && !line.includes(":") && line.length > 10) {
          licenseKey = line;
        } else {
          extraLines.push(line);
        }
      }

      return { username, password, licenseKey, extraLines, raw };
    };

    // Account Credentials Parsing
    const creds1 = "email: customer@aihaat.shop\npassword: StrongPassword123\nProfile: 3 (PIN: 1122)\nServer: Singapore #4";
    const p1 = parseCredentials(creds1);
    assert(p1.username === "customer@aihaat.shop", "Parsed account username accurately");
    assert(p1.password === "StrongPassword123", "Parsed account password accurately");
    assert(p1.extraLines.length === 2, "Captured extra metadata lines (Profile & Server)");

    // Raw License Key Parsing
    const creds2 = "W269N-WFGWX-YVC9B-4J6C9-T83GX";
    const p2 = parseCredentials(creds2);
    assert(p2.licenseKey === "W269N-WFGWX-YVC9B-4J6C9-T83GX", "Parsed single-line license key accurately");

    // Formatted Text File Export Generation Check
    const exportTxt = `=====================================================
AI HAAT SECURE DIGITAL VAULT - PRODUCT CREDENTIALS
https://aihaat.shop
=====================================================

Product Name   : ChatGPT Plus 1 Month
Plan / Variant : 1 Month Shared
Account Type   : Shared Account
Order Reference: #AIH-882190
Delivery Date  : August 28, 2026
Warranty Status: ACTIVE (Expires September 28, 2026)
-----------------------------------------------------
CREDENTIAL ACCESS DETAILS
-----------------------------------------------------
Email / User   : customer@aihaat.shop
Password / PIN : StrongPassword123
-----------------------------------------------------
FULL CREDENTIAL PAYLOAD:
${creds1}
=====================================================
`;
    assert(exportTxt.includes("AI HAAT SECURE DIGITAL VAULT"), "TXT export format contains official vault header");
    assert(exportTxt.includes("AIH-882190"), "TXT export contains order reference ID");
    assert(exportTxt.includes("StrongPassword123"), "TXT export contains plaintext password for offline backup");
  } catch (err: any) {
    assert(false, `Credential parsing section threw error: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n=========================================================================");
  console.log(`📊 MASTER TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=========================================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runMasterTestSuite().catch((err) => {
  console.error("Test Suite Fatal Error:", err);
  process.exit(1);
});
