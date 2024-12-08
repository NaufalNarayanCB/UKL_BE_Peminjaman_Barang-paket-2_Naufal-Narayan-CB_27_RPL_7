/*
  Warnings:

  - You are about to drop the column `description` on the `item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `item` DROP COLUMN `description`,
    ADD COLUMN `location` VARCHAR(191) NULL;
