import { prisma } from "../src/lib/prisma";

async function setupIntelligenceTables() {
  console.log("Checking and creating User Intelligence tables in MySQL...");

  // 1. user_device_instances table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_device_instances (
      id VARCHAR(191) PRIMARY KEY,
      userId VARCHAR(191) NOT NULL,
      deviceInstanceId VARCHAR(191) NOT NULL,
      deviceType VARCHAR(50) NOT NULL DEFAULT 'unknown',
      browserName VARCHAR(100) NULL,
      browserVersion VARCHAR(100) NULL,
      osName VARCHAR(100) NULL,
      osVersion VARCHAR(100) NULL,
      screenResolution VARCHAR(50) NULL,
      viewport VARCHAR(50) NULL,
      devicePixelRatio DOUBLE NULL,
      touchSupport BOOLEAN NULL,
      colorDepth INT NULL,
      cpuCores INT NULL,
      deviceMemoryGB DOUBLE NULL,
      isTrusted BOOLEAN NOT NULL DEFAULT FALSE,
      label VARCHAR(255) NULL,
      firstSeenAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      lastSeenAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      lastIpAddress VARCHAR(100) NULL,
      INDEX idx_user_device (userId, deviceInstanceId),
      INDEX idx_device_last_seen (userId, lastSeenAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ user_device_instances table verified/created");

  // 2. user_technical_observations table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_technical_observations (
      id VARCHAR(191) PRIMARY KEY,
      userId VARCHAR(191) NOT NULL,
      deviceInstanceId VARCHAR(191) NULL,
      sessionReference VARCHAR(191) NULL,
      observationType VARCHAR(100) NOT NULL,
      classification VARCHAR(50) NOT NULL DEFAULT 'AUTOMATIC',
      data TEXT NOT NULL,
      source VARCHAR(100) NOT NULL,
      confidence VARCHAR(50) NOT NULL DEFAULT 'HIGH',
      permissionStatus VARCHAR(50) NULL,
      ipAddress VARCHAR(100) NULL,
      capturedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      retentionUntil DATETIME NULL,
      INDEX idx_user_obs_type (userId, observationType, capturedAt),
      INDEX idx_user_obs_time (userId, capturedAt),
      INDEX idx_retention (retentionUntil)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ user_technical_observations table verified/created");

  // 3. user_consent_records table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_consent_records (
      id VARCHAR(191) PRIMARY KEY,
      userId VARCHAR(191) NOT NULL,
      consentType VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'GRANTED',
      purpose VARCHAR(255) NOT NULL,
      ipAddress VARCHAR(100) NULL,
      userAgent VARCHAR(500) NULL,
      noticeVersion VARCHAR(50) NOT NULL DEFAULT '2026.1',
      grantedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      revokedAt DATETIME NULL,
      INDEX idx_user_consent (userId, consentType),
      INDEX idx_consent_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log("✓ user_consent_records table verified/created");

  console.log("All User Intelligence tables successfully verified in MySQL.");
}

setupIntelligenceTables()
  .catch((err) => {
    console.error("Setup error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
