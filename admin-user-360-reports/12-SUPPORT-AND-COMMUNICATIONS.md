# AI HAAT — SUPPORT & COMMUNICATIONS ENGINE SPECIFICATION
**Document ID:** REPORT-12  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** Customer support ticketing integration, internal staff collaboration notes, pinned flags, and omnichannel notification management.

---

## 1. Executive Summary

The Support and Communications Engine bridges customer service operations with core administrative controls. It centralizes customer-initiated support tickets, private staff-only collaboration notes, and outbound notification channels within the User 360° Console, ensuring seamless communication without context switching.

---

## 2. Integrated Customer Support Ticketing

The User 360° profile embeds full visibility into the customer's support lifecycle via `SupportTicket` and `TicketMessage` models.

```
       Customer Submits Support Request
                       │
                       ▼
          ┌─────────────────────────┐
          │  Ticket Status: OPEN    │ (Priority: LOW | MEDIUM | HIGH | URGENT)
          └────────────┬────────────┘
                       │
                       ▼ Admin Agent Responds
          ┌─────────────────────────┐
          │ Status: WAITING_ON_USER │
          └────────────┬────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
 Customer Replies            Issue Solved / Timeout
 Status: OPEN                Status: RESOLVED -> CLOSED
```

### 2.1 Ticket Capabilities in 360° Console:
- **Instant Context:** Agents viewing a ticket can see the user's order history, wallet balance, and active restrictions without navigating away.
- **Priority Escalation:** Tickets from customers tagged as `VIP Customer` are automatically highlighted with elevated SLA timers.
- **Direct Order Linking:** Tickets initiated from a specific order link directly to the relevant `DigitalDeliveryItem` or payment transaction.

---

## 3. Internal Staff Collaboration Notes (`user_admin_notes`)

To prevent fragmented communication across external team chats, AI Haat provides an internal note system stored in `user_admin_notes`.

```sql
CREATE TABLE `user_admin_notes` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `authorId` VARCHAR(191) NOT NULL,
  `authorName` VARCHAR(100) NOT NULL,
  `authorEmail` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
  `isPinned` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_admin_notes_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.1 Note Categories & Governance:
- **`GENERAL`:** General account context, user preferences, and business relationship notes.
- **`SUPPORT`:** Summaries of complex customer service phone calls or manual troubleshooting.
- **`FRAUD_RISK`:** Security investigator notes, suspicious activity observations, and identity verification logs.
- **`FINANCIAL`:** Manual payment reconciliations, bKash/Nagad TrxID clarifications, or custom commercial discount agreements.
- **`VERIFICATION`:** KYC document checks and corporate identity confirmations.

### 3.2 Pinned Notes Feature
Administrators can toggle `isPinned: true`. Pinned notes are rendered in high-contrast amber alerts at the top of the user's profile, ensuring that critical warnings (e.g. "Do not refund without senior manager approval — chargeback history") are immediately visible to any staff member opening the user record.

### 3.3 Strict Isolation Guarantee
Internal notes are strictly filtered from all customer-facing endpoints (`/api/user/*`, `/api/tickets/*`). No customer API or database projection ever includes `user_admin_notes`.

---

## 4. Omnichannel Notification Management

Administrators can inspect and trigger notifications to the customer across multiple channels:

### 4.1 In-App Notifications (`Notification` Model)
- Shows notification title, message body, read status (`isRead: boolean`), timestamp, and deep-link action URL.
- Admins can dispatch custom administrative notices directly to the customer's dashboard (e.g. system maintenance alerts or license replenishment updates).

### 4.2 Outbound Broadcasts
- Automated triggers dispatch transactional notifications on status changes, wallet adjustments, and order completions via email and in-app feeds.
- Delivery records and read timestamps are tracked for regulatory verification and proof of notice.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
