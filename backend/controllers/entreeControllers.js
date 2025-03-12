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

//Total de sortie 
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

exports.updateEntree = async (req, res) => {
  try {
    const { id } = req.params; // Récupérer l'ID de l'entrée à partir des paramètres de l'URL
    const { caisseId, montant, motif, date } = req.body;

    // Vérification des entrées
    if (!caisseId || isNaN(parseInt(caisseId))) {
      return res.status(400).json({ error: "ID de la caisse invalide" });
    }
    if (!montant || isNaN(parseFloat(montant))) {
      return res.status(400).json({ error: "Montant invalide" });
    }

    // Vérifier si la caisse existe et récupérer son solde actuel
    const caisse = await prisma.caisseSociale.findUnique({
      where: { id: parseInt(caisseId) },
      select: { soldeActuel: true },
    });
    if (!caisse) {
      return res.status(404).json({ error: "Caisse non trouvée" });
    }

    // Vérifier si l'entrée existe
    const entree = await prisma.soldeEntree.findUnique({
      where: { id: parseInt(id) },
    });
    if (!entree) {
      return res.status(404).json({ error: "Entrée non trouvée" });
    }

    // Mettre à jour l'entrée dans la base de données
    const nouvelleEntree = await prisma.soldeEntree.update({
      where: { id: parseInt(id) },
      data: {
        caisseId: parseInt(caisseId),
        montant: parseFloat(montant),
        motif,
        date: new Date(date),
      },
    });

    // Mettre à jour le solde de la caisse après modification
    const updatedCaisse = await prisma.caisseSociale.update({
      where: { id: parseInt(caisseId) },
      data: {
        soldeActuel: caisse.soldeActuel - entree.montant + parseFloat(montant),
      },
    });

    res.status(200).json({
      message: "Entrée mise à jour avec succès",
      nouvelleEntree,
      soldeActuel: updatedCaisse.soldeActuel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'entrée" });
  }
};

exports.deleteEntree = async (req, res) => {
  try {
    const { id } = req.params; // Récupérer l'ID de l'entrée à supprimer

    // Vérifier si l'entrée existe
    const entree = await prisma.soldeEntree.findUnique({
      where: { id: parseInt(id) },
    });
    if (!entree) {
      return res.status(404).json({ error: "Entrée non trouvée" });
    }

    // Récupérer les informations de la caisse associée à l'entrée
    const caisse = await prisma.caisseSociale.findUnique({
      where: { id: entree.caisseId },
      select: { soldeActuel: true },
    });

    // Supprimer l'entrée
    await prisma.soldeEntree.delete({
      where: { id: parseInt(id) },
    });

    // Mettre à jour le solde de la caisse après la suppression de l'entrée
    const updatedCaisse = await prisma.caisseSociale.update({
      where: { id: entree.caisseId },
      data: {
        soldeActuel: caisse.soldeActuel - entree.montant,
      },
    });

    res.status(200).json({
      message: "Entrée supprimée avec succès",
      soldeActuel: updatedCaisse.soldeActuel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'entrée" });
  }
};

