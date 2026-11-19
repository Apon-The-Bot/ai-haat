CREATE TABLE `whatsapp_accounts` (
  `id` VARCHAR(64) NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `state` VARCHAR(32) NOT NULL DEFAULT 'Disconnected',
  `leaseId` VARCHAR(64) NULL,
  `leaseEnds` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `whatsapp_session_records` (
  `accountId` VARCHAR(64) NOT NULL,
  `recordId` VARCHAR(191) NOT NULL,
  `payload` LONGBLOB NOT NULL,
  PRIMARY KEY (`accountId`, `recordId`),
  FOREIGN KEY (`accountId`) REFERENCES `whatsapp_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
