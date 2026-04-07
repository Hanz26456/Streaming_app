/*
  Warnings:

  - You are about to alter the column `progress` on the `watchhistory` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - A unique constraint covering the columns `[userId,movieId]` on the table `WatchHistory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,episodeId]` on the table `WatchHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `WatchHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `watchhistory` DROP FOREIGN KEY `WatchHistory_movieId_fkey`;

-- DropIndex
DROP INDEX `WatchHistory_movieId_fkey` ON `watchhistory`;

-- AlterTable
ALTER TABLE `movie` ADD COLUMN `trailerKey` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `series` ADD COLUMN `trailerKey` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `watchhistory` ADD COLUMN `duration` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `episodeId` INTEGER NULL,
    ADD COLUMN `seriesId` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `movieId` INTEGER NULL,
    MODIFY `progress` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `movieId` INTEGER NULL,
    `seriesId` INTEGER NULL,
    `liked` BOOLEAN NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Review_userId_movieId_key`(`userId`, `movieId`),
    UNIQUE INDEX `Review_userId_seriesId_key`(`userId`, `seriesId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `WatchHistory_userId_movieId_key` ON `WatchHistory`(`userId`, `movieId`);

-- CreateIndex
CREATE UNIQUE INDEX `WatchHistory_userId_episodeId_key` ON `WatchHistory`(`userId`, `episodeId`);

-- AddForeignKey
ALTER TABLE `WatchHistory` ADD CONSTRAINT `WatchHistory_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movie`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WatchHistory` ADD CONSTRAINT `WatchHistory_episodeId_fkey` FOREIGN KEY (`episodeId`) REFERENCES `Episode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WatchHistory` ADD CONSTRAINT `WatchHistory_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `Series`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `Movie`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_seriesId_fkey` FOREIGN KEY (`seriesId`) REFERENCES `Series`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
