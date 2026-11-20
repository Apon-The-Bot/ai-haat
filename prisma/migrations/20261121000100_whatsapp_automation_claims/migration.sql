ALTER TABLE `whatsapp_automation_events`
  ADD COLUMN `state` VARCHAR(24) NOT NULL DEFAULT 'Pending',
  ADD COLUMN `availableAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ADD COLUMN `claimToken` CHAR(36) NULL,
  ADD COLUMN `inspectedAt` DATETIME(3) NULL,
  ADD INDEX `wa_automation_due_idx` (`state`, `availableAt`, `id`);
