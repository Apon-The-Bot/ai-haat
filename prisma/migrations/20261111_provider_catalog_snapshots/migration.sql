CREATE TABLE `provider_catalog_snapshots` (
  `providerId` VARCHAR(64) NOT NULL,
  `products` JSON NOT NULL,
  `fetchedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`providerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `provider_catalog_syncs` (
  `id` VARCHAR(191) NOT NULL,
  `providerId` VARCHAR(64) NOT NULL,
  `activeKey` VARCHAR(64) NULL,
  `actorId` VARCHAR(191) NOT NULL,
  `status` VARCHAR(16) NOT NULL,
  `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` DATETIME(3) NULL,
  `productCount` INTEGER NULL,
  `error` VARCHAR(255) NULL,
  UNIQUE INDEX `provider_catalog_syncs_activeKey_key` (`activeKey`),
  INDEX `provider_catalog_syncs_providerId_startedAt_idx` (`providerId`, `startedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
