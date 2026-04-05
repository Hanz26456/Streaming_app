/*
  Warnings:

  - A unique constraint covering the columns `[avatarUrl]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `user`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `avatarUrl` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_avatarUrl_key` ON `User`(`avatarUrl`);
