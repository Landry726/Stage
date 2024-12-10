/*
  Warnings:

  - You are about to alter the column `mois` on the `cotisation` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `cotisation` MODIFY `mois` DATETIME(3) NOT NULL;
