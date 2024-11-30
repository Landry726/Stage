const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Créer une nouvelle caisse
exports.createCaisse = async (req, res) => {
  try {
    const { soldeActuel } = req.body;

    const newCaisse = await prisma.caisseSociale.create({
      data: {
        soldeActuel: soldeActuel || 0,
      },
    });

    res.status(201).json(newCaisse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de la caisse" });
  }
};

// Lire toutes les caisses avec le total des entrées et sorties
exports.getAllCaisses = async (req, res) => {
  try {
    // Récupérer toutes les caisses avec la somme des entrées et des sorties
    const caisses = await prisma.caisseSociale.findMany({
      include: {
        // Inclure les entrées et sorties, avec la somme des montants
        entrees: {
          select: {
            montant: true,
          },
        },
        sorties: {
          select: {
            montant: true,
          },
        },
      },
    });

    const caissesWithTotals = await Promise.all(caisses.map(async (caisse) => {
      // Utilisation de la fonction Prisma aggregate pour calculer les totaux des entrées
      const totalEntrees = await prisma.soldeEntree.aggregate({
        _sum: {
          montant: true,
        },
        where: {
          caisseId: caisse.id,
        },
      });

      // Utilisation de la fonction Prisma aggregate pour calculer les totaux des sorties
      const totalSorties = await prisma.soldeSortie.aggregate({
        _sum: {
          montant: true,
        },
        where: {
          caisseId: caisse.id,
        },
      });

      // Récupérer les montants agrégés ou 0 si aucune entrée ou sortie
      const sommeEntrees = totalEntrees._sum.montant || 0;
      const sommeSorties = totalSorties._sum.montant || 0;

      // Calculer le solde actuel
      const soldeActuel = sommeEntrees - sommeSorties;

      // Mettre à jour la caisse dans la base de données avec le solde actuel
      await prisma.caisseSociale.update({
        where: { id: caisse.id },
        data: { soldeActuel: soldeActuel },
      });

      return {
        ...caisse,
        totalEntrees: sommeEntrees,
        totalSorties: sommeSorties,
        soldeActuel,
      };
    }));

    // Retourner les caisses avec les totaux calculés et mis à jour
    res.json(caissesWithTotals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des caisses" });
  }
};



// Lire une caisse par ID avec le total des entrées et sorties
exports.getCaisseById = async (req, res) => {
  try {
    const { id } = req.params;

    const caisse = await prisma.caisseSociale.findUnique({
      where: { id: parseInt(id) },
      include: {
        entrees: true,
        sorties: true,
      },
    });

    if (!caisse) {
      return res.status(404).json({ error: "Caisse non trouvée" });
    }

    const totalEntrees = caisse.entrees.reduce((sum, entree) => sum + entree.montant, 0);
    const totalSorties = caisse.sorties.reduce((sum, sortie) => sum + sortie.montant, 0);
    const soldeActuel = totalEntrees - totalSorties;

    res.json({
      ...caisse,
      totalEntrees,
      totalSorties,
      soldeActuel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération de la caisse" });
  }
};

// Mettre à jour une caisse
exports.updateCaisse = async (req, res) => {
  try {
    const { id } = req.params;
    const { soldeActuel } = req.body;

    const updatedCaisse = await prisma.caisseSociale.update({
      where: { id: parseInt(id) },
      data: {
        soldeActuel: soldeActuel || 0,
      },
    });

    res.json(updatedCaisse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de la caisse" });
  }
};

// Supprimer une caisse
exports.deleteCaisse = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.caisseSociale.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression de la caisse" });
  }
};

exports.getTotalCaisses = async (req, res) => {
  try {
    // Utilisation de Prisma pour calculer la somme des soldes actuels
    const totalCaisses = await prisma.caisseSociale.aggregate({
      _sum: {
        soldeActuel: true, // Champ à sommer
      },
    });

    // Retourner le total ou 0 s'il n'y a pas de caisses
    res.status(200).json({
      totalCaisses: totalCaisses._sum.soldeActuel || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors du calcul du total des caisses" });
  }
};
