# AI HAAT — SETTINGS, EMAIL MARKETING & NOTIFICATIONS AUDIT
**Project:** AI Haat (`aihaat.shop`)  
**Scope:** Store Configuration, Mailer Secret Encryption, Email Marketing Engine & Telegram Alerts  
**Audit Timestamp:** November 2026  
**Auditor:** DevSecOps Engineer & API Integration Specialist  

---

## 1. INFRASTRUCTURE & DISPATCH TOPOLOGY

AI Haat coordinates system communications and operational settings across four major layers:
1. **Global Site Settings (`SiteSettings` & `/admin/settings`):** Centralized storage for store name, support hotline, WhatsApp contact, payment gateway active toggles, and system maintenance mode.
2. **Mailer Secret Encryption at Rest (AUDIT-006):** SMTP and Amazon SES credentials stored in `SiteSettings` are encrypted with AES-256-GCM, preventing database credential exposure.
3. **Dedicated Email Marketing Engine (`/admin/email-marketing/*`):** Broadcast campaign composer, WYSIWYG newsletter template builder, dynamic audience segments, subscriber contact book, and delivery logs.
4. **Omnichannel Notification Dispatches (`NotificationLog`):** Real-time administrative Telegram notifications for inward batches and order payments, plus customer transactional emails.

---

## 2. AUTOMATED TEST SUITE EXECUTION RESULTS

The settings, email, and notification components were validated against:
- **`scripts/verify-all-fixes.ts` (Test Group 5):** Passed (AUDIT-006 Mailer Secret Encryption at Rest)
- **`scripts/test-application-security-hardening-suite.ts`:** Passed (Telegram HTML injection defense & XSS escapes)
- **`scripts/audit-admin-endpoints.ts`:** Passed (Verified all 139 admin API connections, including the 4 email marketing endpoint repairs)
- **`scripts/test-notification-master-suite.ts`:** Passed (Dispatch logs & multi-channel alerts)

---

## 3. DETAILED TEST FINDINGS & VERIFICATIONS

### 3.1 Store Configuration & Gateway Controls (`/admin/settings`)
In `src/app/admin/settings/page.tsx`:
- **Superadmin Authorization:** Non-superadmin access returns HTTP 403 Forbidden.
- **Maintenance Mode Switch:** When toggled active, the storefront redirects all non-admin visitors to `/maintenance` with a branded downtime notice.
- **Payment Gateway Toggles:** Administrators can independently enable or disable:
  - `bKash` (Automated & Manual)
  - `Nagad` (Automated & Manual)
  - `Rocket` (Manual)
  - `Customer Wallet` (Internal Balance)
- **WhatsApp Support Number:** Configurable support number updates the floating widget across the site without requiring code redeployments.

### 3.2 Mailer Secret Encryption at Rest (AUDIT-006)
In `src/lib/settings.ts` and `src/lib/mfa/crypto.ts`:
- **Vulnerability Remediated:** Previously, SMTP and SES passwords in `SiteSettings` were persisted as raw plaintext in MySQL.
- **Implemented Fix:**
  - Before saving to the database, `smtpPassword` and `sesSecretAccessKey` are passed through `encryptCredential()`.
  - The ciphertext is stored in the standard `v1:<iv>:<tag>:<ciphertext>` AES-256-GCM format.
  - When retrieved by the mailer dispatch service, `decryptCredential()` restores the plaintext in memory.
  - Verified in `verify-all-fixes.ts` that plaintext is encrypted, ciphertext does not leak the password, and decryption recovers the original secret exactly.

### 3.3 Email Marketing Engine (`/admin/email-marketing/*`)
The administrative email marketing suite spans 9 dedicated pages:
1. **Campaign Overview (`/admin/email-marketing`):** Summarizes active campaigns, delivery rate, open rate, click rate, and unsubscribe metrics.
2. **Broadcast Composer (`/campaigns/new`, `/[id]/edit`):**
   - Step 1: Campaign details (Title, Subject, Preview Text).
   - Step 2: Audience selection (All Subscribers, VIP Buyers, Inactive Customers).
   - Step 3: Template binding with dynamic coupon selector.
   - *Fixed:* Repaired endpoint typo calling `/api/coupons` -> corrected to `/api/admin/coupons`.
3. **Template Gallery & Designer (`/templates`, `/new`, `/[id]`):**
   - Visual HTML email builder supporting token placeholders: `{{customerName}}`, `{{couponCode}}`, `{{unsubscribeUrl}}`.
   - *Fixed:* Implemented missing `POST /api/admin/email-marketing/templates/[id]` endpoint for 1-click template cloning.
4. **Dynamic Audience Segments (`/segments`):**
   - Rule builder based on total spend (e.g., `spend > 2000 BDT`) or order count.
   - *Fixed:* Implemented missing `DELETE /api/admin/email-marketing/segments` handler to enable safe removal of unused segments.
5. **Mailer Settings & Handshake Ping (`/settings`):**
   - Supports Amazon SES (API/SMTP) and custom SMTP servers.
   - *Fixed:* Added `POST` handler to `/api/admin/email-marketing/settings/verify` allowing administrators to test live connection status directly from the UI.

### 3.4 Telegram Alert System & Anti-Injection Sanitization
In `src/lib/telegram.ts`:
- **Operational Alerts:** The system dispatches formatted Telegram notifications to administrators for:
  - Verified customer payments (`Order #AH-XXXXX`)
  - Low vault stock alerts (`< 5 keys remaining`)
  - New supplier batch inward procurement
- **HTML Injection Defense:** To prevent bot errors caused by unescaped HTML characters (`<`, `>`, `&`), all dynamic data fields are passed through `escapeTelegramHtml()` before payload transmission.

---

## 4. SETTINGS & COMMUNICATIONS VERIFICATION SCORECARD

| Subsystem | Audit Status | Verified Safety Invariant |
|-----------|:------------:|---------------------------|
| Global Site Settings | **PASS** | Maintenance toggle, WhatsApp hotline, gateway switches |
| Mailer Secret Encryption | **PASS** | AES-256-GCM envelope; zero plaintext passwords in DB |
| Email Marketing Overview | **PASS** | Accurate delivery, open, and bounce metric tracking |
| Campaign Composer | **PASS** | Fixed `/api/admin/coupons` typo; coupon binding works |
| Template Duplication | **PASS** | Fixed missing `POST` handler; 1-click clone functional |
| Segment Deletion | **PASS** | Fixed missing `DELETE` handler; rule removal verified |
| Mailer Connection Ping | **PASS** | Fixed missing `POST` handler; connection handshake verified |
| Telegram Alerts | **PASS** | `escapeTelegramHtml` neutralizes HTML injection attacks |
| Customer Transactional Mail | **PASS** | Responsive HTML templates render cleanly across email clients |
