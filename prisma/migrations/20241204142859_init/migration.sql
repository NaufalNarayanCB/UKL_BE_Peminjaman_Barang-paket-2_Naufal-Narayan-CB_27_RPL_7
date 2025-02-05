/*
  Warnings:

  - The primary key for the `peminjaman` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `peminjaman` table. All the data in the column will be lost.
  - Added the required column `id_peminjaman` to the `Peminjaman` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `peminjaman` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `id_peminjaman` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id_peminjaman`);
