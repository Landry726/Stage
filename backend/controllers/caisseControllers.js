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
    // Récupérer toutes les caisses avec les entrées et sorties
    const caisses = await prisma.caisseSociale.findMany({
      include: {
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
      // Étape 1 : Calculer les totaux des entrées liées à la caisse
      const totalEntrees = await prisma.soldeEntree.aggregate({
        _sum: {
          montant: true,
        },
        where: {
          caisseId: caisse.id,
        },
      });

      // Étape 2 : Calculer les totaux des sorties liées à la caisse
      const totalSorties = await prisma.soldeSortie.aggregate({
        _sum: {
          montant: true,
        },
        where: {
          caisseId: caisse.id,
        },
      });

      // Étape 3 : Calculer la somme des cotisations
      const totalCotisations = await prisma.cotisation.aggregate({
        _sum: { montant: true },
      });
      const montantCotisation = totalCotisations._sum.montant || 0;

      // Étape 4 : Calculer la somme des paiements de missions
      const totalPaiementsMissions = await prisma.paiementMission.aggregate({
        _sum: { montant: true },
      });
      const montantMission = totalPaiementsMissions._sum.montant || 0;

      // Étape 5 : Additionner les cotisations et paiements de missions aux entrées
      const sommeEntrees = (totalEntrees._sum.montant || 0) + montantCotisation + montantMission;
      const sommeSorties = totalSorties._sum.montant || 0;

      // Étape 6 : Calculer le solde actuel
      const soldeActuel = sommeEntrees - sommeSorties;

      // Étape 7 : Mettre à jour le solde actuel dans la base
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

    // Retourner les caisses avec les totaux mis à jour
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

exports.getTrends = async (req, res) => {
  try {
    // Récupérer toutes les entrées
    const entrees = await prisma.soldeEntree.findMany({
      select: {
        date: true,
        montant: true,
      },
    });

    // Récupérer toutes les sorties
    const sorties = await prisma.soldeSortie.findMany({
      select: {
        date: true,
        montant: true,
      },
    });

    // Calculer la somme totale des cotisations
    const totalCotisations = await prisma.cotisation.aggregate({
      _sum: {
        montant: true, // Somme des montants des cotisations
      },
    });

    // Calculer la somme totale des paiements de missions
    const totalPaiementsMissions = await prisma.paiementMission.aggregate({
      _sum: {
        montant: true, // Somme des montants des paiements de missions
      },
    });

    // Fonction pour extraire le mois et l'année
    const formatMonthYear = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`; // Format YYYY-MM
    };

    // Agréger les données par mois pour les entrées
    const entreesParMois = entrees.reduce((acc, entree) => {
      const mois = formatMonthYear(entree.date);
      acc[mois] = (acc[mois] || 0) + entree.montant;
      return acc;
    }, {});

    // Agréger les données par mois pour les sorties
    const sortiesParMois = sorties.reduce((acc, sortie) => {
      const mois = formatMonthYear(sortie.date);
      acc[mois] = (acc[mois] || 0) + sortie.montant;
      return acc;
    }, {});

    // Ajouter le total des cotisations et des paiements missions au mois correspondant (mois actuel)
    const currentMonth = formatMonthYear(new Date());
    entreesParMois[currentMonth] = 
      (entreesParMois[currentMonth] || 0) + 
      (totalCotisations._sum.montant || 0) + 
      (totalPaiementsMissions._sum.montant || 0);

    // Obtenir tous les mois uniques
    const allMonths = Array.from(new Set([...Object.keys(entreesParMois), ...Object.keys(sortiesParMois)]));

    // Créer une structure combinée
    const data = allMonths.map((mois) => ({
      mois, // Format YYYY-MM
      entrees: entreesParMois[mois] || 0,
      sorties: sortiesParMois[mois] || 0,
    }));

    // Trier par mois (chronologiquement)
    data.sort((a, b) => new Date(a.mois) - new Date(b.mois));

    // Envoyer les données au client
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tendances mensuelles' });
  }
};


