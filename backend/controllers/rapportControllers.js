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
    const cotisationSheet = workbook.addWorksheet('Cotisation');
   

    cotisationSheet.columns = [
      { header: 'NOM MEMBRE', key: 'nomMembre', width: 30 },
      { header: 'POSTE', key: 'poste', width: 20 },
      { header: 'MOIS', key: 'mois', width: 15 },
      { header: 'DATE PAIEMENT', key: 'datePaiement', width: 15 },
      { header: 'MONTANT', key: 'montant', width: 15 },
      { header: 'STATUT', key: 'statut', width: 15 },
    ];
    
    cotisationSheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    let totalCotisations = 0;
    
    cotisations.forEach((cotisation) => {
      const isPaid = Boolean(cotisation.datePaiement);
      const montant = isPaid ? cotisation.montant + ' ' : '-';
      const datePaiement = isPaid ? cotisation.datePaiement.toLocaleDateString('fr-FR') : 'Non payé';
    
      const row = cotisationSheet.addRow({
        nomMembre: cotisation.membre.nom,
        poste: cotisation.membre.poste,
        mois: cotisation.mois,
        datePaiement,
        montant,
        statut: cotisation.status,  // statut est une string
      });
    
      totalCotisations += isPaid ? cotisation.montant : 0;
    
      // Vérifier si le statut indique une insuffisance
      const statutStr = (cotisation.status || '').toLowerCase().trim(); // Normalisation du statut
      if (statutStr === 'insuffisant' || statutStr === '0' || statutStr.includes('insuff')) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
        });
      }
    });
    
    // Ligne de total
    cotisationSheet.addRow({});
    cotisationSheet.addRow({ nomMembre: 'Total Cotisations', montant: totalCotisations + ' Ar' })
      .font = { bold: true };
    

    // Feuille des paiements de mission
    const paiementMissionSheet = workbook.addWorksheet('Rapport Paiements Missions');
    paiementMissionSheet.columns = [
      { header: 'NOM MEMBRE', key: 'nomMembre', width: 30 },
      { header: 'MOIS EFFECTUÉ', key: 'moisEffectue', width: 20 },
      { header: 'MONTANT MISSION', key: 'mission', width: 20 },
      { header: 'MONTANT PAYÉ', key: 'montantPaye', width: 20 },
      { header: 'RESTE À PAYER', key: 'restePayer', width: 20 },
      { header: 'STATUT', key: 'statut', width: 15 },
    ];

    paiementMissionSheet.getRow(1).eachCell((cell) => {
  cell.font = { bold: true };
});

    let totalMissions = 0;
    paiementsMissions.forEach((paiement) => {
      const isPaid = paiement.restePayer === 0;
      const row = paiementMissionSheet.addRow({
        nomMembre: paiement.mission.membre.nom,
        moisEffectue: paiement.mission.mois,
        mission: paiement.mission.montant ,
        montantPaye: paiement.montant,
        restePayer: paiement.restePayer,
        statut: isPaid ? 'Payé' : 'Non payé',
      });

      totalMissions += paiement.montant;

      if (!isPaid) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
        });
      }
    });

    paiementMissionSheet.addRow({});
    paiementMissionSheet.addRow({
      nomMembre: 'Total Missions',
      montantPaye: totalMissions + ' Ar',
    }).font = { bold: true };

    // Feuille pour la caisse sociale
    const caisseSheet = workbook.addWorksheet('Caisse Sociale');
    caisseSheet.columns = [
      { header: 'DATE', key: 'date', width: 15 },
      { header: 'MOTIF ENTREE', key: 'motif_entree', width: 30  },
      { header: 'ENTREE', key: 'entree', width: 15 },
      { header: 'MOTIF SORTIE', key: 'motif_sortie', width: 30 },
      { header: 'SORTIE', key: 'sortie', width: 15 },
    ];
    caisseSheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    let totalCaisse = 0;

    if (totalCotisations > 0) {
      caisseSheet.addRow({
        date: new Date().toLocaleDateString('fr-FR'),
        motif_entree: 'Cotisation',
        entree: totalCotisations,
        motif_sortie: '',
        sortie: '',
      });
      totalCaisse += totalCotisations;
    }

    if (totalMissions > 0) {
      caisseSheet.addRow({
        date: new Date().toLocaleDateString('fr-FR'),
        motif_entree: 'Mission',
        entree: totalMissions ,
        motif_sortie: '',
        sortie: '',
      });
      totalCaisse += totalMissions;
    }

    caisses.forEach((caisse) => {
      caisse.entrees.forEach((entree) => {
        caisseSheet.addRow({
          date: entree.date.toLocaleDateString('fr-FR'),
          motif_entree: entree.motif,
          entree: entree.montant,
          motif_sortie: '',
          sortie: '',
        });
        totalCaisse += entree.montant;
      });

      caisse.sorties.forEach((sortie) => {
        caisseSheet.addRow({
          date: sortie.date.toLocaleDateString('fr-FR'),
          motif_entree: '',
          entree: '',
          motif_sortie: sortie.motif,
          sortie: sortie.montant,
        });
        totalCaisse -= sortie.montant;
      });
    });

    caisseSheet.addRow({});
    caisseSheet.addRow({
      date: 'Total Caisse',
      motif_entree: '',
      entree: totalCaisse >= 0 ? totalCaisse + ' Ar' : '',
      motif_sortie: '',
      sortie: totalCaisse < 0 ? Math.abs(totalCaisse) + ' Ar' : '',
    }).font = { bold: true };

    caisseSheet.eachRow((row) => {
      row.height = 25;
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
