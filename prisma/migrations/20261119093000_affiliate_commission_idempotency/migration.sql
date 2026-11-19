ALTER TABLE `affiliate_commissions` ADD COLUMN `sourceKey` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `affiliate_commissions_sourceKey_key` ON `affiliate_commissions` (`sourceKey`);
