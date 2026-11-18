ALTER TABLE `User` ADD COLUMN `googleImage` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN `profileImageSource` VARCHAR(191) NULL;
UPDATE `User` SET `googleImage` = `image`, `profileImageSource` = 'GOOGLE' WHERE `image` IS NOT NULL;
