ALTER TABLE `orders`
  ADD COLUMN `metaConsentId` VARCHAR(64) NULL,
  ADD COLUMN `metaAttribution` JSON NULL,
  ADD INDEX `orders_metaConsentId_idx` (`metaConsentId`);

ALTER TABLE `analytics_events`
  ADD COLUMN `nextAttemptAt` DATETIME(3) NULL,
  ADD INDEX `analytics_events_provider_status_nextAttemptAt_idx` (`provider`, `status`, `nextAttemptAt`);

CREATE TABLE `advertising_consents` (
  `id` VARCHAR(64) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `advertising_consents_expiresAt_idx` (`expiresAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
