# AI HAAT — DATABASE MIGRATIONS & SCHEMA ARCHITECTURE
**Document ID:** REPORT-16  
**System:** AI Haat Enterprise Control Center (`aihaat.shop`)  
**Scope:** DDL specifications for 8 dedicated relational tables, indexes, constraints, migration safety, and rollback procedures.

---

## 1. Executive Summary

To support the Enterprise User 360° Control Center, the database architecture was expanded with 8 specialized MySQL tables. The migration was executed non-destructively on the production database, ensuring zero downtime, 100% preservation of existing customer records, and strict foreign key integrity with the core `User` model.

---

## 2. DDL Specifications for Provisioned Tables

All tables utilize the `InnoDB` storage engine with `utf8mb4` character set and `utf8mb4_unicode_ci` collation for universal character and emoji support.

### 2.1 `user_restrictions`
```sql
CREATE TABLE IF NOT EXISTS `user_restrictions` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `featureKey` VARCHAR(100) NOT NULL,
  `restrictionType` VARCHAR(50) NOT NULL,
  `limitValue` DOUBLE NULL,
  `reason` VARCHAR(255) NOT NULL,
  `adminId` VARCHAR(191) NOT NULL,
  `adminEmail` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `uniq_user_feature` (`userId`, `featureKey`),
  INDEX `idx_user_restrictions_userId` (`userId`),
  INDEX `idx_user_restrictions_feature` (`featureKey`),
  CONSTRAINT `fk_user_restrictions_user` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.2 `user_status_records`
```sql
CREATE TABLE IF NOT EXISTS `user_status_records` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `adminId` VARCHAR(191) NULL,
  `adminEmail` VARCHAR(191) NULL,
  `expiresAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_user_status_userId` (`userId`),
  INDEX `idx_user_status_created` (`createdAt`),
  CONSTRAINT `fk_user_status_user` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.3 `user_admin_notes`
```sql
CREATE TABLE IF NOT EXISTS `user_admin_notes` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `authorId` VARCHAR(191) NOT NULL,
  `authorName` VARCHAR(100) NOT NULL,
  `authorEmail` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
  `isPinned` BOOLEAN NOT NULL DEFAULT FALSE,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_admin_notes_userId` (`userId`),
  INDEX `idx_admin_notes_pinned` (`isPinned`),
  CONSTRAINT `fk_user_admin_notes_user` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.4 `user_activity_logs`
```sql
CREATE TABLE IF NOT EXISTS `user_activity_logs` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `metadata` JSON NULL,
  `ipAddress` VARCHAR(100) NULL,
  `userAgent` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_user_act_userId` (`userId`),
  INDEX `idx_user_act_cat_created` (`category`, `createdAt`),
  CONSTRAINT `fk_user_activity_logs_user` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.5 `user_tags`
```sql
CREATE TABLE IF NOT EXISTS `user_tags` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `tag` VARCHAR(50) NOT NULL,
  `color` VARCHAR(20) NOT NULL DEFAULT 'slate',
  `assignedBy` VARCHAR(100) NOT NULL DEFAULT 'admin',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `uniq_user_tag` (`userId`, `tag`),
  INDEX `idx_user_tags_userId` (`userId`),
  CONSTRAINT `fk_user_tags_user` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.6 `user_device_instances`
```sql
CREATE TABLE IF NOT EXISTS `user_device_instances` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `instanceId` VARCHAR(100) NOT NULL,
  `deviceName` VARCHAR(100) NULL,
  `deviceType` VARCHAR(50) NULL,
  `browser` VARCHAR(100) NULL,
  `os` VARCHAR(100) NULL,
  `platform` VARCHAR(50) NULL,
  `screenResolution` VARCHAR(50) NULL,
  `isTrusted` BOOLEAN NOT NULL DEFAULT FALSE,
  `firstSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `lastSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `uniq_user_device_instance` (`userId`, `instanceId`),
  INDEX `idx_user_devices_userId` (`userId`),
  CONSTRAINT `fk_user_devices_user` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.7 `user_technical_observations`
```sql
CREATE TABLE IF NOT EXISTS `user_technical_observations` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `ipAddress` VARCHAR(100) NOT NULL,
  `ipType` VARCHAR(20) NOT NULL DEFAULT 'IPv4',
  `isp` VARCHAR(150) NULL,
  `asn` VARCHAR(50) NULL,
  `isProxy` BOOLEAN NOT NULL DEFAULT FALSE,
  `country` VARCHAR(10) NULL,
  `city` VARCHAR(100) NULL,
  `latitude` DOUBLE NULL,
  `longitude` DOUBLE NULL,
  `locationSource` VARCHAR(50) NOT NULL DEFAULT 'IP_APPROXIMATE',
  `webVitals` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `idx_user_tech_userId` (`userId`),
  INDEX `idx_user_tech_created` (`createdAt`),
  CONSTRAINT `fk_user_tech_obs_user` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.8 `user_consent_records`
```sql
CREATE TABLE IF NOT EXISTS `user_consent_records` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `userId` VARCHAR(191) NOT NULL,
  `consentType` VARCHAR(50) NOT NULL,
  `isGranted` BOOLEAN NOT NULL DEFAULT FALSE,
  `ipAddress` VARCHAR(100) NULL,
  `userAgent` VARCHAR(255) NULL,
  `grantedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `revokedAt` DATETIME(3) NULL,
  INDEX `idx_user_consent_user_type` (`userId`, `consentType`),
  CONSTRAINT `fk_user_consent_user` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 3. Prisma Schema Synchronization

The Prisma schema (`prisma/schema.prisma`) was updated with 8 corresponding models and bidirectional relations on the primary `User` model. Following schema edits, `npx prisma generate` generated typed client bindings, enabling full type safety and zero compilation errors (`tsc --noEmit` code 0).

---

## 4. Rollback & Disaster Recovery Procedures

In the unlikely event that a database rollback is required:
1. Each table is decoupled from core commerce order models (`Order`, `OrderItem`).
2. Dropping the newly added tables does **not** corrupt user credentials or purchase ledgers:
   ```sql
   DROP TABLE IF EXISTS `user_consent_records`;
   DROP TABLE IF EXISTS `user_technical_observations`;
   DROP TABLE IF EXISTS `user_device_instances`;
   DROP TABLE IF EXISTS `user_tags`;
   DROP TABLE IF EXISTS `user_activity_logs`;
   DROP TABLE IF EXISTS `user_admin_notes`;
   DROP TABLE IF EXISTS `user_status_records`;
   DROP TABLE IF EXISTS `user_restrictions`;
   ```
3. Database backup snapshots are captured prior to schema alterations as standard protocol.

---
*Signed by AI Haat Enterprise Architecture Group — 2026-11-10*
