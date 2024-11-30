const ExcelJS = require('exceljs');
const { PrismaClient } = require('@prisma/client');

// Initialisation de Prisma
const prisma = new PrismaClient();

const generateExcelReport = async (req, res) => {
  try {
    // Récupérer les données de la caisse sociale avec leurs entrées et sorties
    const caisses = await prisma.caisseSociale.findMany({
      include: {
        entrees: true,
        sorties: true,
      },
    });

    // Récupérer les cotisations et paiements de mission avec les membres
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

    // Créer un nouveau workbook Excel
    const workbook = new ExcelJS.Workbook();

    // Feuille pour les cotisations
    const cotisationSheet = workbook.addWorksheet('Rapport Cotisations');
    cotisationSheet.columns = [
      { header: 'Nom Membre', key: 'nomMembre', width: 30 },
      { header: 'Date Paiement', key: 'datePaiement', width: 15 },
      { header: 'Montant', key: 'montant', width: 15 },
      { header: 'Mois', key: 'mois', width: 15 },
      { header: 'Statut', key: 'statut', width: 15 },
    ];

    cotisations.forEach((cotisation) => {
      cotisationSheet.addRow({
        nomMembre: cotisation.membre.nom, // Afficher le nom du membre
        datePaiement: cotisation.datePaiement.toLocaleDateString('fr-FR'), // Format de date DD/MM/YYYY
        montant: cotisation.montant,
        mois: cotisation.mois,
        statut: cotisation.status,
      });
    });

    // Appliquer du style : gras pour les en-têtes
    cotisationSheet.getRow(1).font = { bold: true };

    // Feuille pour les paiements de mission
    const paiementMissionSheet = workbook.addWorksheet('Rapport Paiements Missions');
    paiementMissionSheet.columns = [
      { header: 'Nom Membre', key: 'nomMembre', width: 30 },
      { header: ' Montant Mission', key: 'mission', width: 20 },
      { header: 'Mois', key: 'mois', width: 15 },
      { header: 'Montant', key: 'montant', width: 15 },
      { header: 'Statut', key: 'statut', width: 15 },
    ];

    paiementsMissions.forEach((paiement) => {
      const missionStatus = paiement.restePayer > 0 ? 'Non payé' : 'Payé';
      const row = paiementMissionSheet.addRow({
        nomMembre: paiement.mission.membre.nom,
        mission: paiement.mission.montant,
        mois: paiement.mission.mois,
        montant: paiement.montant,
        statut: missionStatus,
      });

      // Ajouter du style pour les missions non payées et insuffisantes
      if (missionStatus === 'Non payé') {
        row.eachCell((cell) => {
          cell.style = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0000' } } }; // Rouge
        });
      } else if (missionStatus === 'Insuffisant') {
        row.eachCell((cell) => {
          cell.style = { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '00FF00' } } }; // Vert
        });
      }
    });

    // Appliquer du style : gras pour les en-têtes
    paiementMissionSheet.getRow(1).font = { bold: true };

    // Feuille pour la caisse sociale
    const caisseSheet = workbook.addWorksheet('Rapport Caisse Sociale');
    caisseSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Montant', key: 'montant', width: 15 },
      { header: 'Motif', key: 'motif', width: 30 },
    ];

    // Parcourir chaque caisse et structurer les données
    caisses.forEach((caisse) => {
      // Ajouter une ligne pour identifier la caisse
      caisseSheet.addRow({
        date: '',
        type: 'Solde Actuel',
        montant: caisse.soldeActuel,
        motif: '',
      });

      // Ajouter les données des entrées
      if (caisse.entrees.length > 0) {
        caisseSheet.addRow({ type: '--- Entrées ---' }); // Séparation visuelle
        caisse.entrees.forEach((entree) => {
          caisseSheet.addRow({
            date: entree.date.toLocaleDateString('fr-FR'),
            type: 'Entrée',
            montant: entree.montant,
            motif: entree.motif,
          });
        });

        // Ajouter le total des entrées
        const totalEntrees = caisse.entrees.reduce((sum, entree) => sum + entree.montant, 0);
        caisseSheet.addRow({
          date: '',
          type: 'Total Entrées',
          montant: totalEntrees,
          motif: '',
        });
      }

      // Ajouter les données des sorties
      if (caisse.sorties.length > 0) {
        caisseSheet.addRow({ type: '--- Sorties ---' }); // Séparation visuelle
        caisse.sorties.forEach((sortie) => {
          caisseSheet.addRow({
            date: sortie.date.toLocaleDateString('fr-FR'),
            type: 'Sortie',
            montant: sortie.montant,
            motif: sortie.motif,
          });
        });

        // Ajouter le total des sorties
        const totalSorties = caisse.sorties.reduce((sum, sortie) => sum + sortie.montant, 0);
        caisseSheet.addRow({
          date: '',
          type: 'Total Sorties',
          montant: totalSorties,
          motif: '',
        });
      }

      // Ligne vide entre caisses
      caisseSheet.addRow({});
    });

    // Appliquer des styles aux en-têtes
    [cotisationSheet, paiementMissionSheet, caisseSheet].forEach((sheet) => {
      sheet.getRow(1).font = { bold: true };
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

    // Envoyer le fichier Excel au frontend
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Erreur lors de la génération du fichier Excel :', error);
    res.status(500).json({ error: 'Erreur lors de la génération du rapport' });
  }
};

module.exports = { generateExcelReport };
