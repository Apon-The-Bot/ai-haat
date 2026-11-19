ALTER TABLE `users` ADD COLUMN `googleImage` VARCHAR(191) NULL;
ALTER TABLE `users` ADD COLUMN `profileImageSource` VARCHAR(191) NULL;
UPDATE `users` SET `googleImage` = `image`, `profileImageSource` = 'GOOGLE' WHERE `image` IS NOT NULL;
