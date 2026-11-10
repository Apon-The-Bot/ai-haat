import { prisma } from "../src/lib/prisma";

async function setupTables() {
  console.log("Checking and creating User Control tables in MySQL...");

  // 1. user_restrictions table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_restrictions (
      id VARCHAR(191) PRIMARY KEY,
      userId VARCHAR(191) NOT NULL,
      featureKey VARCHAR(100) NOT NULL,
      isRestricted BOOLEAN NOT NULL DEFAULT TRUE,
      actionRestrictions TEXT NULL,
      spendingLimitBDT DECIMAL(12,2) NULL,
      dailyLimitBDT DECIMAL(12,2) NULL,
      reason VARCHAR(500) NOT NULL,
      adminNote TEXT NULL,
      expiresAt DATETIME NULL,
      createdById VARCHAR(191) NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_feature (userId, featureKey),
      INDEX idx_expires (expiresAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ user_restrictions table verified/created");

  // 2. user_status_records table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_status_records (
      id VARCHAR(191) PRIMARY KEY,
      userId VARCHAR(191) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
      reason VARCHAR(500) NOT NULL,
      internalNote TEXT NULL,
      durationHours INT NULL,
      expiresAt DATETIME NULL,
      adminId VARCHAR(191) NOT NULL,
      adminEmail VARCHAR(191) NOT NULL,
      isActive BOOLEAN NOT NULL DEFAULT TRUE,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_status (userId, isActive),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ user_status_records table verified/created");

  // 3. user_admin_notes table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_admin_notes (
      id VARCHAR(191) PRIMARY KEY,
      userId VARCHAR(191) NOT NULL,
      adminId VARCHAR(191) NOT NULL,
      adminEmail VARCHAR(191) NOT NULL,
      note TEXT NOT NULL,
      category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_notes (userId, createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ user_admin_notes table verified/created");

  // 4. user_activity_logs table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_activity_logs (
      id VARCHAR(191) PRIMARY KEY,
      userId VARCHAR(191) NOT NULL,
      eventType VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      description VARCHAR(500) NOT NULL,
      metadata TEXT NULL,
      ipAddress VARCHAR(45) NULL,
      userAgent VARCHAR(255) NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user_activity (userId, createdAt),
      INDEX idx_event_category (category, eventType)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ user_activity_logs table verified/created");

  // 5. user_tags table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_tags (
      id VARCHAR(191) PRIMARY KEY,
      userId VARCHAR(191) NOT NULL,
      tag VARCHAR(100) NOT NULL,
      assignedById VARCHAR(191) NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_user_tag (userId, tag),
      INDEX idx_tag (tag)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ user_tags table verified/created");

  console.log("All User Control tables successfully configured!");
}

setupTables()
  .catch((e) => {
    console.error("Failed to setup tables:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
