/*
  Warnings:

  - You are about to drop the column `status` on the `peminjaman` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `peminjaman` DROP COLUMN `status`,
    ADD COLUMN `Status` ENUM('KEMBALI', 'DIPINJAM', 'HILANG') NOT NULL DEFAULT 'DIPINJAM';
