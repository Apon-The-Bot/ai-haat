CREATE TABLE `whatsapp_automation_events` (
  `id` CHAR(64) NOT NULL,
  `schemaVersion` INTEGER NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  `producer` VARCHAR(32) NOT NULL,
  `entityId` VARCHAR(64) NOT NULL,
  `entityVersion` VARCHAR(64) NOT NULL,
  `correlationId` VARCHAR(64) NOT NULL,
  `occurredAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `whatsapp_automation_events_createdAt_id_idx` (`createdAt`, `id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
