ALTER TABLE `wallet_transactions` ADD COLUMN `referenceKey` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `wallet_transactions_referenceKey_key` ON `wallet_transactions` (`referenceKey`);
ALTER TABLE `coin_transactions` ADD COLUMN `referenceKey` VARCHAR(191) NULL;
CREATE UNIQUE INDEX `coin_transactions_referenceKey_key` ON `coin_transactions` (`referenceKey`);
