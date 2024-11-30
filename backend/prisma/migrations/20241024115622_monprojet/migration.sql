-- CreateTable
CREATE TABLE `Membre` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `poste` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Membre_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `membreId` INTEGER NOT NULL,
    `montant` DOUBLE NOT NULL,
    `mois` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaiementMission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `datePaiement` DATETIME(3) NOT NULL,
    `membreId` INTEGER NOT NULL,
    `missionId` INTEGER NOT NULL,
    `montant` DOUBLE NOT NULL,
    `restePayer` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cotisation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `membreId` INTEGER NOT NULL,
    `datePaiement` DATETIME(3) NOT NULL,
    `montant` DOUBLE NOT NULL,
    `mois` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CaisseSociale` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `soldeActuel` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoldeEntree` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `montant` DOUBLE NOT NULL,
    `motif` VARCHAR(191) NOT NULL,
    `caisseId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SoldeSortie` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `montant` DOUBLE NOT NULL,
    `motif` VARCHAR(191) NOT NULL,
    `caisseId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Mission` ADD CONSTRAINT `Mission_membreId_fkey` FOREIGN KEY (`membreId`) REFERENCES `Membre`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaiementMission` ADD CONSTRAINT `PaiementMission_membreId_fkey` FOREIGN KEY (`membreId`) REFERENCES `Membre`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaiementMission` ADD CONSTRAINT `PaiementMission_missionId_fkey` FOREIGN KEY (`missionId`) REFERENCES `Mission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cotisation` ADD CONSTRAINT `Cotisation_membreId_fkey` FOREIGN KEY (`membreId`) REFERENCES `Membre`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoldeEntree` ADD CONSTRAINT `SoldeEntree_caisseId_fkey` FOREIGN KEY (`caisseId`) REFERENCES `CaisseSociale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SoldeSortie` ADD CONSTRAINT `SoldeSortie_caisseId_fkey` FOREIGN KEY (`caisseId`) REFERENCES `CaisseSociale`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
