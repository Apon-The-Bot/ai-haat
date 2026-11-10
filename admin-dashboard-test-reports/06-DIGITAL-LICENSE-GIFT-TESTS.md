# AI HAAT — DIGITAL LICENSE VAULT & GIFTING SYSTEM TESTS
**Project:** AI Haat (`aihaat.shop`)  
**Scope:** Digital Vault Security, AES-256-GCM Encryption, Gift Cards & Recipient Gifting Workflows  
**Audit Timestamp:** November 2026  
**Auditor:** Application Security Architect & Cryptography Specialist  

---

## 1. DIGITAL ASSET SECURITY ARCHITECTURE

AI Haat delivers sensitive digital assets, including software product keys, official subscription logins, and API access tokens. To prevent credential theft, data leaks, and unauthorized viewing:
- **AES-256-GCM Encryption at Rest (`src/lib/mfa/crypto.ts`):** All sensitive delivered credentials and vault stock payloads are encrypted using an authenticated cipher with a versioned envelope (`v1:<iv>:<tag>:<ciphertext>`).
- **Owner-Only Vault Access:** Digital vault credentials can only be accessed by the authenticating purchaser or authorized recipient holding a valid gift claim token.
- **Client-Side Masking & Anti-Blowout Wrapping:** Passwords and keys are masked by default (`••••••••`) with a 1-click toggle, and wrapped using `break-all` to prevent horizontal viewport blowout on mobile screens.
- **Digital Gifting Token Isolation:** Unauthenticated public order tracking strictly sanitizes `giftClaimToken = null`, ensuring only the gift sender or recipient holds the private unboxing URL.

---

## 2. AUTOMATED TEST SUITE EXECUTION RESULTS

The digital vault, warranty countdown, and gifting engines were validated against:
- **`scripts/test-vault-warranty-master-suite.ts`**: 37/37 Tests Passed (100.0%)
- **`scripts/test-digital-gifting-e2e.ts`**: All 7 Lifecycle Tests Passed (100.0%)
- **`scripts/test-comprehensive-audit.ts` (Features 1, 2, 10)**: All Tests Passed (100.0%)
- **`scripts/verify-all-fixes.ts` (Test Group 2)**: Passed (AUDIT-002 Gift Claim Token Leak Defense)

---

## 3. DETAILED TEST FINDINGS & VERIFICATIONS

### 3.1 Cryptographic Encryption at Rest (AES-256-GCM)
In `src/lib/mfa/crypto.ts`:
- **Envelope Format:** Ciphertext is saved in the format `v1:<hex-iv>:<hex-auth-tag>:<hex-ciphertext>`.
- **Integrity Validation:** If any byte of the ciphertext or tag is modified, the decipher throws an authentication error in constant time, preventing tampering attacks.
- **Legacy Compatibility:** Legacy plaintext credentials stored before the encryption upgrade pass through transparently via fallback decryption.
- **Unicode & Bengali Handling:** Verified in `test-vault-warranty-master-suite.ts` (Section 1) that passwords containing complex symbols, non-ASCII characters, and Bengali text encrypt and decrypt cleanly without character corruption.

### 3.2 Customer Digital Vault UI (`/dashboard/keys`)
In `src/app/dashboard/keys/page.tsx`:
- **Masking by Default:** The interface masks sensitive passwords (`••••••••`) until the user explicitly clicks the eye icon.
- **1-Click Copy:** Clicking the copy icon copies the raw plaintext password or license key to the user's clipboard and displays a green confirmation toast (`"কপি করা হয়েছে!"`).
- **Offline Backup Export (`.txt`):** Users can click **"Download TXT Backup"** to export an offline credential file containing the order number, product name, login username, plaintext password, warranty expiration date, and activation instructions.

### 3.3 Warranty Tracking & 1-Click Renewal Engine
In `src/lib/warranty.ts`:
- **Warranty Status Calculation:**
  - **Active Warranty:** Displays remaining days and a green badge (e.g., *"২৮ দিন বাকি"*).
  - **Lifetime Warranty:** Flagged with a golden star badge (*"আজীবন লাইফটাইম অ্যাক্সেস"*).
  - **Expired Warranty:** Displays a red alert badge (*"ওয়ারেন্টি উত্তীর্ণ"*). Remaining days clamp safely to `0`.
- **1-Click Subscription Renewal:** When a subscription is within 7 days of expiration, a prominent **"1-Click Renew"** button appears. Clicking it redirects the customer to checkout with the product pre-selected, carrying forward the previous order reference to ensure uninterrupted service.

### 3.4 Interactive Activation Guides Resolver
In `src/lib/guides.ts`:
- Automatically resolves product-specific activation instructions based on category and title keywords:
  - **ChatGPT Plus:** AI Tools activation guide with security tips on shared workspace etiquette.
  - **Netflix 4K UHD:** Streaming guide with private profile PIN setup and TV login instructions.
  - **NordVPN:** VPN guide with Meshnet and Threat Protection configuration steps.
  - **Windows 11 Pro:** Operating system activation guide with command-line `slmgr.vbs` snippets.
  - **Canva Pro:** Design suite guide for team invitation acceptance.

### 3.5 Digital Gift Cards Engine (`GiftCard`)
In `src/app/api/gift-cards/route.ts` and `src/app/dashboard/gift-cards/page.tsx`:
- **Code Generation:** Generates standardized, formatted gift codes: `AIHT-XXXX-XXXX-XXXX` (16 hexadecimal characters formatted into 4 groups).
- **Redemption Mechanics:**
  - Customer enters the gift code in `/dashboard/wallet` or `/dashboard/gift-cards`.
  - The server verifies that the card is `ACTIVE` and `balanceBDT > 0`.
  - Atomically credits the customer's wallet balance by the card value.
  - Marks the gift card as `REDEEMED`, recording `redeemedByUserId` and `redeemedAt`.
- **Idempotency Guard:** Verified in `test-comprehensive-audit.ts` (Feature 10) that attempting to re-redeem an already redeemed card returns HTTP 400 (`"This gift card has already been redeemed"`), preventing double-crediting attacks.

### 3.6 Recipient Digital Gifting Workflow
In `scripts/test-digital-gifting-e2e.ts`:
1. **Checkout Gifting Toggle:** During checkout, the sender toggles **"Send as a Gift"** and provides:
   - Recipient Name (e.g., *"Tanvir Hasan"*)
   - Personal Greeting (e.g., *"Happy Birthday!"*)
   - Theme Selection (`neon`, `birthday`, `festive`, `friendship`, `midnight`)
   - Price Hiding Toggle (`hidePrice: true`)
2. **Private Claim Token:** A cryptographically secure 16-byte random token (`giftClaimToken`) is generated.
3. **Public Tracking Isolation (AUDIT-002):** Unauthenticated visitors tracking the order via phone or order number cannot view the claim token or the delivered credentials.
4. **Recipient Unboxing Experience (`/gift/[token]`):**
   - Recipient opens the secret URL.
   - Animated gift box renders with chosen theme and confetti animation (`canvas-confetti`).
   - Clicking **"Unbox Gift"** marks `giftWrapOpened = true`, reveals the sender's personalized message, hides prices, and displays the decrypted product credentials.

---

## 4. DIGITAL ASSET VERIFICATION SCORECARD

| Security / Feature Aspect | Status | Verified Result |
|---------------------------|:------:|-----------------|
| Credential Encryption at Rest | **PASS** | AES-256-GCM envelope with auth-tag integrity validation |
| Password Masking & Reveal | **PASS** | Masked by default; 1-click reveal; clipboard copy feedback |
| Viewport Blowout Protection | **PASS** | `break-all` wrapping prevents mobile layout horizontal blowout |
| Warranty Countdown Math | **PASS** | Exact day delta; clamps safely to 0 on expired warranties |
| Interactive Guides Resolver | **PASS** | Dynamic resolution across AI, streaming, VPN, and OS keys |
| Gift Card Idempotency | **PASS** | Atomic redemption prevents double-spending; tracks redeemer |
| Gifting Token Privacy | **PASS** | Public tracking strictly redacts claim tokens; recipient-only |
