/*
  Warnings:

  - You are about to drop the column `createdAt` on the `peminjaman` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `peminjaman` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `peminjaman` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `peminjaman` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `peminjaman` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `uuid`,
    MODIFY `status` ENUM('KEMBALI', 'DIPINJAM', 'HILANG') NOT NULL DEFAULT 'DIPINJAM';
