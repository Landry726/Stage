// controllers/EntreeController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Contrôleur pour ajouter une nouvelle entrée
exports.addEntree = async (req, res) => {
  try {
    const { motif, montant, date, caisseId } = req.body;

    // Validation des champs requis
    if (!motif || !montant || !date || !caisseId) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Ajout de l'entrée dans la base de données
    const newEntree = await prisma.soldeEntree.create({
      data: {
        motif,
        montant: parseFloat(montant),
        date: new Date(date),
        caisse: { connect: { id: parseInt(caisseId) } },
      },
    });

    // Réponse de succès
    res.status(201).json({ message: 'Entrée ajoutée avec succès', entree: newEntree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'ajout de l'entrée" });
  }
};
// Récupérer toutes les sorties
exports.getAllEntree = async (req, res) => {
  try {
    const sorties = await prisma.soldeEntree.findMany({
      include: {
        caisse: { // Utiliser "caisse" au lieu de "caisseSociale"
          select: {
            id: true,
            soldeActuel: true, // Vous pouvez ajouter d'autres champs à sélectionner
          },
        },
      },
    });

    res.status(200).json(sorties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des sorties" });
  }
};
exports.updateEntree = async (req, res) => {
  try {
    const { id } = req.params;  // ID de l'entrée à modifier
    const { motif, montant, date, caisseId } = req.body;

    // Validation des champs requis
    if (!motif || !montant || !date || !caisseId) {
      return res.status(400).json({ error: 'Tous les champs sont requis pour la mise à jour' });
    }

    // Vérification de la validité de l'ID
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    // Mise à jour de l'entrée
    const updatedEntree = await prisma.soldeEntree.update({
      where: {
        id: parsedId,  // Utilisation de l'ID converti en entier
      },
      data: {
        motif,
        montant: parseFloat(montant),
        date: new Date(date),
        caisse: { connect: { id: parseInt(caisseId) } },
      },
    });

    // Réponse de succès
    res.status(200).json({ message: 'Entrée mise à jour avec succès', entree: updatedEntree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'entrée" });
  }
};


// Supprimer une entrée
exports.deleteEntree = async (req, res) => {
  try {
    const { id } = req.params;  // ID de l'entrée à supprimer

    // Suppression de l'entrée
    const deletedEntree = await prisma.soldeEntree.delete({
      where: { id: parseInt(id) },  // Chercher et supprimer l'entrée par son ID
    });

    // Réponse de succès
    res.status(200).json({ message: 'Entrée supprimée avec succès', entree: deletedEntree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'entrée" });
  }
};

exports.getTotalEntree = async (req, res) => {
  try {
    // Étape 1 : Calculer la somme des montants dans la table soldeEntree
    const totalEntree = await prisma.soldeEntree.aggregate({
      _sum: {
        montant: true, // Somme des montants
      },
    });

    // Étape 2 : Calculer la somme des cotisations
    const totalCotisations = await prisma.cotisation.aggregate({
      _sum: {
        montant: true, // Somme des montants des cotisations
      },
    });

    // Étape 3 : Calculer la somme des paiements de missions
    const totalPaiementsMissions = await prisma.paiementMission.aggregate({
      _sum: {
        montant: true, // Somme des montants des paiements de missions
      },
    });

    // Étape 4 : Additionner les trois montants
    const sommeTotale =
      (totalEntree._sum.montant || 0) +
      (totalCotisations._sum.montant || 0) +
      (totalPaiementsMissions._sum.montant || 0);

    // Étape 5 : Retourner le résultat
    res.status(200).json({
      totalEntree: sommeTotale, // La somme totale des entrées
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors du calcul de la somme totale des entrées" });
  }
};


