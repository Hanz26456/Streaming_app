-- AlterTable
ALTER TABLE `movie` ADD COLUMN `isPremium` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `series` ADD COLUMN `isPremium` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isPremium` BOOLEAN NOT NULL DEFAULT false;
