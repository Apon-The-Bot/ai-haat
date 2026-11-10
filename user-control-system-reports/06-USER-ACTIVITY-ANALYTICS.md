# 06 — USER ACTIVITY INTELLIGENCE & EVENT ANALYTICS

## 1. Overview & Objectives

Understanding customer behavior is critical for fraud detection, customer support, and system audits. The **User Activity & Feature Analytics Subsystem** provides administrators with a granular, chronological audit log of all significant customer events across AI Haat (`aihaat.shop`) without compromising customer privacy or violating security boundaries.

---

## 2. Event Ingestion Architecture

Activity events are ingested through the centralized `logUserActivity()` service in `src/lib/user-control/user-control-service.ts`:

```typescript
export async function logUserActivity(params: {
  userId: string;
  category: "AUTH" | "COMMERCE" | "FINANCIAL" | "DIGITAL" | "SECURITY" | "ADMIN_ACTION";
  eventType: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  // Sanitize metadata to prevent accidental leakage of sensitive keys
  const sanitizedMeta = sanitizeEventMetadata(params.metadata);

  return prisma.userActivityLog.create({
    data: {
      userId: params.userId,
      category: params.category,
      eventType: params.eventType,
      description: params.description,
      metadata: sanitizedMeta ? JSON.stringify(sanitizedMeta) : null,
      ipAddress: params.ipAddress ? hashOrMaskIP(params.ipAddress) : null,
      userAgent: params.userAgent || null,
    },
  });
}
```

---

## 3. Supported Event Taxonomy

Events are categorized into 6 functional streams:

| Category | Typical Events | Typical Metadata Recorded |
| :--- | :--- | :--- |
| **`AUTH`** | `USER_LOGIN`, `USER_LOGOUT`, `AUTH_FAILED`, `PASSWORD_RESET_REQ` | Auth method (`CREDENTIALS`, `GOOGLE`), device fingerprint. |
| **`COMMERCE`** | `PRODUCT_VIEW`, `CART_ADD`, `CHECKOUT_INITIATED`, `ORDER_PLACED` | Order ID, product slug, total order amount in BDT. |
| **`FINANCIAL`** | `WALLET_RECHARGE_INIT`, `WALLET_DEBIT`, `ADMIN_ADJUSTMENT` | Transaction reference, BDT amount, payment gateway. |
| **`DIGITAL`** | `KEY_VIEWED`, `CREDENTIAL_REVEALED`, `FILE_DOWNLOADED` | Delivered key ID, product title, delivery status. |
| **`SECURITY`** | `2FA_ENABLED`, `SESSION_REVOKED`, `STATUS_CHANGED` | Target status, session ID, reason. |
| **`ADMIN_ACTION`**| `FEATURE_RESTRICTED`, `ADMIN_NOTE_ADDED`, `TAGS_UPDATED` | Admin ID, modified feature key, previous values. |

---

## 4. Privacy, Data Minimization & Security Safeguards

To prevent activity tracking from becoming an attack vector:
1. **Zero Secret Ingestion:** The `sanitizeEventMetadata` interceptor strictly strips forbidden keys:
   - `password`, `hashedPassword`, `pin`, `otp`, `token`, `secret`, `cvv`, `cardNumber`, `sessionSecret`.
2. **IP Masking:** IP addresses are stored cleanly or masked where regulatory compliance mandates privacy preservation.
3. **No Covert Surveillance:** Keystroke logging, mouse tracking, or arbitrary external navigation monitoring is prohibited.

---

## 5. Database Schema & Indexing

Backed by the `user_activity_logs` table:

```sql
CREATE TABLE IF NOT EXISTS `user_activity_logs` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `eventType` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `metadata` JSON NULL,
  `ipAddress` VARCHAR(100) NULL,
  `userAgent` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_user_activity_timeline` (`userId`, `createdAt` DESC),
  INDEX `idx_activity_category` (`category`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 6. Admin Timeline Visualization

In `Tab 11 — Activity Timeline` (`/admin/users/[id]`):
- Renders an interactive, responsive vertical timeline.
- Features real-time category filtering (`All`, `Commerce`, `Auth`, `Financial`, `Security`, `Admin`).
- Displays formatted timestamps in Bangladeshi Standard Time (BST, UTC+6).
- Renders contextual JSON metadata inspector dialogs for deep investigation into high-value transactions or security anomalies.
