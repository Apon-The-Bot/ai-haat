# 10 — PRIVACY, DATA GOVERNANCE & ACCOUNT LIFECYCLE

## 1. Principles of Data Governance in Financial E-Commerce

In an e-commerce platform that processes digital payments and manages customer wallet liabilities, data privacy must be carefully balanced with statutory financial obligations and fraud prevention:

- **The Integrity Conflict:** Naive data deletion (`DELETE FROM User`) destroys foreign key relationships in `Order`, `Payment`, and `WalletTransaction`, corrupting tax ledgers and invalidating financial audits.
- **The Resolution:** AI Haat implements a **Tiered Governance Model** distinguishing between Personal Identifiable Information (PII) and immutable financial/operational records.

---

## 2. Account Deactivation vs. Physical Deletion

When an account is terminated or a customer requests account deletion:

### 2.1 Soft Deactivation (`status = DEACTIVATED`)
- Account status transitions to `DEACTIVATED`.
- All active sessions are immediately terminated via `revokeAllUserSessions()`.
- Customer authentication is blocked permanently.
- Profile cannot be discovered in public customer searches.

### 2.2 PII Anonymization Protocol
Where data erasure is legally required or approved by management:
1. **PII Sanitization:**
   - Full Name set to `Anonymized Customer [Hash]`.
   - Email Address scrambled to `deleted_[userId]@anonymized.aihaat.local`.
   - Phone Number, Profile Image URL, and Saved Delivery Addresses erased.
   - Password hash and MFA secret seeds permanently deleted.
2. **Financial Ledger Preservation:**
   - Historical `Order`, `OrderItem`, and `WalletTransaction` records remain intact, preserving transaction dates, BDT totals, and payment gateway references.
   - Double-entry accounting integrity is maintained without preserving sensitive personal identifiers.

---

## 3. Right to Data Portability & Secure Data Export

Administrators can generate customer data archives to fulfill customer support or compliance requests:
- **Export Formats:** RFC 4180-compliant CSV and JSON.
- **CSV Formula Injection Mitigation:** To prevent spreadsheet software (e.g. Microsoft Excel, LibreOffice Calc) from executing malicious code embedded in customer names or addresses, the export engine prepends a single quote (`'`) to any field starting with `=`, `+`, `-`, or `@`.
- **Audit Logging:** Every data export event is recorded in `AdminAuditLog` (`USER_DATA_EXPORTED_CSV`) with the ID of the exporting administrator.

---

## 4. Administrative Data Minimization

The User 360° Control Center enforces data minimization on the presentation layer:
- Staff members cannot view customer passwords or unencrypted security keys.
- Delivered digital credentials remain masked until an explicit, justified reveal operation is recorded.
- Sensitive payment details (e.g. full credit card numbers or MFS PINs) are never collected or stored in the database.
