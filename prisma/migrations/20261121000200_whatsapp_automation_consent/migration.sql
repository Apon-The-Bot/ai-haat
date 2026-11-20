CREATE TABLE `whatsapp_automation_identities` (
  `id` VARCHAR(64) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `revision` VARCHAR(64) NOT NULL,
  `addressFingerprint` CHAR(64) NOT NULL,
  `verifiedAt` DATETIME(3) NOT NULL,
  `revokedAt` DATETIME(3) NULL,
  UNIQUE INDEX `wa_identity_user_revision_key` (`userId`, `revision`),
  PRIMARY KEY (`id`),
  CONSTRAINT `whatsapp_automation_identities_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `whatsapp_automation_consents` (
  `identityId` VARCHAR(64) NOT NULL,
  `purpose` VARCHAR(32) NOT NULL,
  `grantedAt` DATETIME(3) NOT NULL,
  `revokedAt` DATETIME(3) NULL,
  `wordingVersion` VARCHAR(64) NOT NULL,
  `locale` VARCHAR(16) NOT NULL,
  `source` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`identityId`, `purpose`),
  CONSTRAINT `whatsapp_automation_consents_identityId_fkey` FOREIGN KEY (`identityId`) REFERENCES `whatsapp_automation_identities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `whatsapp_automation_suppressions` (
  `identityId` VARCHAR(64) NOT NULL,
  `scope` VARCHAR(32) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`identityId`, `scope`),
  CONSTRAINT `whatsapp_automation_suppressions_identityId_fkey` FOREIGN KEY (`identityId`) REFERENCES `whatsapp_automation_identities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
