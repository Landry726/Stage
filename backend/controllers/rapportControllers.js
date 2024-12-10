const ExcelJS = require('exceljs');
const { PrismaClient } = require('@prisma/client');

// Initialisation de Prisma
const prisma = new PrismaClient();

const generateExcelReport = async (req, res) => {
  try {
    // Récupération des données
    const caisses = await prisma.caisseSociale.findMany({
      include: {
        entrees: true,
        sorties: true,
      },
    });

    const cotisations = await prisma.cotisation.findMany({
      include: {
        membre: true,
      },
    });

    const paiementsMissions = await prisma.paiementMission.findMany({
      include: {
        mission: {
          include: {
            membre: true,
          },
        },
      },
    });

    // Création du workbook Excel
    const workbook = new ExcelJS.Workbook();

    // Feuille des cotisations
    const cotisationSheet = workbook.addWorksheet('Rapport Cotisations');
    cotisationSheet.columns = [
      { header: 'Nom Membre', key: 'nomMembre', width: 30 },
      { header: 'Mois', key: 'mois', width: 15 },
      { header: 'Date Paiement', key: 'datePaiement', width: 15 },
      { header: 'Montant', key: 'montant', width: 15 },
      { header: 'Statut', key: 'statut', width: 15 },
    ];

    let totalCotisations = 0;
    cotisations.forEach((cotisation) => {
      const isPaid = Boolean(cotisation.datePaiement);
      const row = cotisationSheet.addRow({
        nomMembre: cotisation.membre.nom,
        mois: cotisation.mois,
        datePaiement: isPaid
          ? cotisation.datePaiement.toLocaleDateString('fr-FR')
          : 'Non payé',
        montant: cotisation.montant + 'Ar' ,
        statut: isPaid ? 'Payé' : 'Non payé',
      });

      totalCotisations += isPaid ? cotisation.montant : 0;

      // Coloration conditionnelle pour les non-payés
      if (!isPaid) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF0000' }, // Rouge
          };
        });
      }
    });

    // Ajouter un total en bas
    cotisationSheet.addRow({}); // Ligne vide
    cotisationSheet.addRow({
      nomMembre: 'Total Cotisations',
      montant: totalCotisations + 'Ar',
    }).font = { bold: true };

    // Feuille des paiements de mission
    const paiementMissionSheet = workbook.addWorksheet('Rapport Paiements Missions');
    paiementMissionSheet.columns = [
      { header: 'Nom Membre', key: 'nomMembre', width: 30 },
      { header: 'Mois Effectué', key: 'moisEffectue', width: 20 },
      { header: 'Montant Mission', key: 'mission', width: 20 },
      { header: 'Montant Payé', key: 'montantPaye', width: 20 },
      { header: 'Reste à Payer', key: 'restePayer', width: 20 },
      { header: 'Statut', key: 'statut', width: 15 },
    ];

    let totalMissions = 0;
    paiementsMissions.forEach((paiement) => {
      const isPaid = paiement.restePayer === 0;
      const row = paiementMissionSheet.addRow({
        nomMembre: paiement.mission.membre.nom,
        moisEffectue: paiement.mission.mois,
        mission: paiement.mission.montant,
        montantPaye: paiement.montant + 'Ar',
        restePayer: paiement.restePayer,
        statut: isPaid ? 'Payé' : 'Non payé',
      });

      totalMissions += paiement.montant;

      // Coloration conditionnelle pour les non-payés
      if (!isPaid) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFF0000' }, // Rouge
          };
        });
      }
    });

    // Ajouter un total en bas
    paiementMissionSheet.addRow({}); // Ligne vide
    paiementMissionSheet.addRow({
      nomMembre: 'Total Missions',
      montantPaye: totalMissions + 'Ar',
    }).font = { bold: true };

    // Feuille pour la caisse sociale
    const caisseSheet = workbook.addWorksheet('Rapport Caisse Sociale');
    caisseSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Montant', key: 'montant', width: 15 },
      { header: 'Motif', key: 'motif', width: 30 },
    ];

    let totalCaisse = 0;

    // Ajouter les cotisations dans la caisse sociale
    if (totalCotisations > 0) {
      caisseSheet.addRow({
        date: new Date().toLocaleDateString('fr-FR'), // Date actuelle pour la cotisation
        type: 'Entrée',
        montant: totalCotisations + 'Ar',
        motif: `Cotisation`,
      });
      totalCaisse += totalCotisations;
    }

    // Ajouter les paiements de mission dans la caisse sociale
    if (totalMissions > 0) {
      caisseSheet.addRow({
        date: new Date().toLocaleDateString('fr-FR'), // Date actuelle pour la mission
        type: 'Entrée',
        montant: totalMissions + 'Ar',
        motif: `Mission`,
      });
      totalCaisse += totalMissions;
    }

    // Ajouter les entrées et sorties de la caisse
    caisses.forEach((caisse) => {
      caisse.entrees.forEach((entree) => {
        caisseSheet.addRow({
          date: entree.date.toLocaleDateString('fr-FR'),
          type: 'Entrée',
          montant: entree.montant + 'Ar',
          motif: entree.motif,
        });
        totalCaisse += entree.montant;
      });

      caisse.sorties.forEach((sortie) => {
        caisseSheet.addRow({
          date: sortie.date.toLocaleDateString('fr-FR'),
          type: 'Sortie',
          montant: sortie.montant + 'Ar',
          motif: sortie.motif,
        });
        totalCaisse -= sortie.montant;
      });
    });

    // Ajouter un total en bas de la feuille caisse sociale
    caisseSheet.addRow({}); // Ligne vide
    caisseSheet.addRow({
      date: '',
      type: 'Total Caisse Sociale',
      montant: totalCaisse,
      motif: '',
    }).font = { bold: true };

    // Configurer la réponse HTTP pour le téléchargement
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Rapport_Social.xlsx'
    );

    // Envoyer le fichier Excel
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erreur lors de la génération du fichier Excel :', error);
    res.status(500).json({ error: 'Erreur lors de la génération du rapport' });
  }
};

module.exports = { generateExcelReport };
