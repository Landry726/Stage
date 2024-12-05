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
      { header: 'Nom Membre', key: 'nomMembre', width: 30 ,  },
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
        montant: cotisation.montant,
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
    cotisationSheet.addRow({});
    cotisationSheet.addRow({
      nomMembre: 'Total',
      montant: totalCotisations,
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
        montantPaye: paiement.montant,
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
    paiementMissionSheet.addRow({});
    paiementMissionSheet.addRow({
      nomMembre: 'Total',
      montantPaye: totalMissions,
    }).font = { bold: true };

    // Feuille pour la caisse sociale
    const caisseSheet = workbook.addWorksheet('Rapport Caisse Sociale');
    caisseSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Montant', key: 'montant', width: 15 },
      { header: 'Motif', key: 'motif', width: 30 },
    ];

    caisses.forEach((caisse) => {
      caisseSheet.addRow({
        date: '',
        type: 'Solde Actuel',
        montant: caisse.soldeActuel,
        motif: '',
      });

      if (caisse.entrees.length > 0) {
        caisse.entrees.forEach((entree) => {
          caisseSheet.addRow({
            date: entree.date.toLocaleDateString('fr-FR'),
            type: 'Entrée',
            montant: entree.montant,
            motif: entree.motif,
          });
        });
      }

      if (caisse.sorties.length > 0) {
        caisse.sorties.forEach((sortie) => {
          caisseSheet.addRow({
            date: sortie.date.toLocaleDateString('fr-FR'),
            type: 'Sortie',
            montant: sortie.montant,
            motif: sortie.motif,
          });
        });
      }
    });

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
