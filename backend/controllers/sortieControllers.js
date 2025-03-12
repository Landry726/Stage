// SoldeSortieController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createSortie = async (req, res) => {
  try {
    const { caisseId, montant, motif, date } = req.body;

    // Vérification de la validité de `caisseId`
    if (!caisseId || isNaN(parseInt(caisseId))) {
      return res.status(400).json({ error: "ID de la caisse invalide" });
    }

    // Vérifier que le montant est valide
    if (!montant || isNaN(parseFloat(montant))) {
      return res.status(400).json({ error: "Montant invalide" });
    }

    // Vérifier que la caisse existe et récupérer son solde actuel
    const caisse = await prisma.caisseSociale.findUnique({
      where: {
        id: parseInt(caisseId), // Convertir l'ID en entier
      },
      select: {
        soldeActuel: true,
      },
    });

    // Vérifier si la caisse existe
    if (!caisse) {
      return res.status(404).json({ error: "Caisse non trouvée" });
    }

    // Vérifier si le solde est suffisant pour effectuer la sortie
    if (caisse.soldeActuel < parseFloat(montant)) {
      return res.status(400).json({ error: "Solde insuffisant pour effectuer cette sortie" });
    }

    // Créer la sortie dans la base de données
    const newSortie = await prisma.soldeSortie.create({
      data: {
        caisseId: parseInt(caisseId), // Convertir l'ID en entier
        montant: parseFloat(montant), // S'assurer que le montant est un float
        motif,
        date: new Date(date), // Convertir la date en objet Date
      },
    });

    // Mettre à jour le solde actuel de la caisse après la sortie
    const updatedCaisse = await prisma.caisseSociale.update({
      where: { id: parseInt(caisseId) },
      data: {
        soldeActuel: caisse.soldeActuel - parseFloat(montant),
      },
    });

    // Retourner la sortie créée et le solde actuel mis à jour
    res.status(201).json({
      message: "Sortie enregistrée avec succès",
      newSortie,
      updatedSolde: updatedCaisse.soldeActuel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de la sortie" });
  }
};

// Récupérer toutes les sorties
exports.getAllSorties = async (req, res) => {
  try {
    const sorties = await prisma.soldeSortie.findMany({
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

// Calculer la somme des sorties
exports.getTotalSortie = async (req, res) => {
  try {
    const totalSortie = await prisma.soldeSortie.aggregate({
      _sum: {
        montant: true, // Somme des montants
      },
    });

    res.status(200).json({
      totalSortie: totalSortie._sum.montant || 0, // Retourne 0 si aucune sortie
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors du calcul de la somme des sorties" });
  }
};

// Mettre à jour une sortie
exports.updateSortie = async (req, res) => {
  try {
    const { id } = req.params; // Récupérer l'ID de la sortie à partir des paramètres de l'URL
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

    // Vérifier si la sortie existe
    const sortie = await prisma.soldeSortie.findUnique({
      where: { id: parseInt(id) },
    });
    if (!sortie) {
      return res.status(404).json({ error: "Sortie non trouvée" });
    }

    // Calculer le nouveau solde de la caisse après modification
    const nouvelleSortie = await prisma.soldeSortie.update({
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
        soldeActuel: caisse.soldeActuel - sortie.montant + parseFloat(montant),
      },
    });

    res.status(200).json({
      message: "Sortie mise à jour avec succès",
      nouvelleSortie,
      soldeActuel: updatedCaisse.soldeActuel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de la sortie" });
  }
};

// Supprimer une sortie
exports.deleteSortie = async (req, res) => {
  try {
    const { id } = req.params; // Récupérer l'ID de la sortie à supprimer

    // Vérifier si la sortie existe
    const sortie = await prisma.soldeSortie.findUnique({
      where: { id: parseInt(id) },
    });
    if (!sortie) {
      return res.status(404).json({ error: "Sortie non trouvée" });
    }

    // Récupérer les informations de la caisse associée à la sortie
    const caisse = await prisma.caisseSociale.findUnique({
      where: { id: sortie.caisseId },
      select: { soldeActuel: true },
    });

    // Supprimer la sortie
    await prisma.soldeSortie.delete({
      where: { id: parseInt(id) },
    });

    // Mettre à jour le solde de la caisse après la suppression de la sortie
    const updatedCaisse = await prisma.caisseSociale.update({
      where: { id: sortie.caisseId },
      data: {
        soldeActuel: caisse.soldeActuel + sortie.montant,
      },
    });

    res.status(200).json({
      message: "Sortie supprimée avec succès",
      soldeActuel: updatedCaisse.soldeActuel,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression de la sortie" });
  }
};
