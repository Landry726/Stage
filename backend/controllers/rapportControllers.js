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

    // Créer un nouveau workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rapport Caisse');

    // Ajouter les colonnes de l'en-tête
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Montant', key: 'montant', width: 15 },
      { header: 'Motif', key: 'motif', width: 30 },
    ];

    // Parcourir chaque caisse et structurer les données
    caisses.forEach((caisse) => {
      // Ajouter une ligne pour identifier la caisse
      worksheet.addRow({
        caisseId: caisse.id,
        date: '',
        type: 'Solde Actuel',
        montant: caisse.soldeActuel,
        motif: '',
      });

      // Ajouter les données des entrées
      if (caisse.entrees.length > 0) {
        worksheet.addRow({ type: '--- Entrées ---' }); // Séparation visuelle
        caisse.entrees.forEach((entree) => {
          worksheet.addRow({
            caisseId: '',
            date: entree.date.toISOString().split('T')[0],
            type: 'Entrée',
            montant: entree.montant,
            motif: entree.motif,
          });
        });

        // Ajouter le total des entrées
        const totalEntrees = caisse.entrees.reduce((sum, entree) => sum + entree.montant, 0);
        worksheet.addRow({
          caisseId: '',
          date: '',
          type: 'Total Entrées',
          montant: totalEntrees,
          motif: '',
        });
      }

      // Ajouter les données des sorties
      if (caisse.sorties.length > 0) {
        worksheet.addRow({ type: '--- Sorties ---' }); // Séparation visuelle
        caisse.sorties.forEach((sortie) => {
          worksheet.addRow({
            caisseId: '',
            date: sortie.date.toISOString().split('T')[0],
            type: 'Sortie',
            montant: sortie.montant,
            motif: sortie.motif,
          });
        });

        // Ajouter le total des sorties
        const totalSorties = caisse.sorties.reduce((sum, sortie) => sum + sortie.montant, 0);
        worksheet.addRow({
          caisseId: '',
          date: '',
          type: 'Total Sorties',
          montant: totalSorties,
          motif: '',
        });
      }

      // Ligne vide entre caisses
      worksheet.addRow({});
    });

    // Appliquer des styles aux en-têtes
    worksheet.getRow(1).font = { bold: true };

    // Configurer la réponse HTTP pour le téléchargement
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Rapport_Caisse.xlsx'
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
