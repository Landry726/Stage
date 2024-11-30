const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { format } = require('date-fns'); // Assurez-vous d'importer 'format' depuis 'date-fns'
const { fr } = require('date-fns/locale'); // Importer la locale française

exports.getCotisations = async (req, res) => {
  try {
    const cotisations = await prisma.cotisation.findMany({
      include: { membre: true },
    });

    // Ajout du champ 'status' basé sur le montant
    const cotisationsWithStatus = cotisations.map((cotisation) => {
      let status = 'Non Payé';  // Valeur par défaut

      // Vérification du montant
      if (cotisation.montant === null) {
        status = 'Non Payé';
      } else if (cotisation.montant < 3000) {
        status = 'Insuffisant';
      } else if (cotisation.montant >= 3000) {
        status = 'Payé';
      }

      // Formater la date de paiement
      const formattedDate = cotisation.datePaiement ? format(new Date(cotisation.datePaiement), 'dd/MM/yyyy') : null;

      // Extraire et formater le mois en français
      const moisText = cotisation.datePaiement ? format(new Date(cotisation.datePaiement), 'MMMM', { locale: fr }) : null; // Mois en texte (Janvier, Février, etc.)

      return { ...cotisation, status, datePaiement: formattedDate, mois: moisText };  // Ajoute le mois en français
    });

    res.json(cotisationsWithStatus);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des cotisations' });
  }
};

  
// POST: Créer une nouvelle cotisation
exports.createCotisation = async (req, res) => {
  const { membreId, montant, mois, datePaiement } = req.body;

  try {
    const formattedDate = new Date(datePaiement); // Convertit la date en format Date si nécessaire

    // Déterminer le statut en fonction du montant
    let status = 'Non Payé'; // Statut par défaut

    if (montant === null || montant === 0) {
      status = 'Non Payé';
    } else if (montant < 3000) {
      status = 'Insuffisant';
    } else if (montant >= 3000) {
      status = 'Payé';
    }

    // Créer la cotisation avec le statut calculé
    const newCotisation = await prisma.cotisation.create({
      data: {
        membreId,
        datePaiement: formattedDate,
        montant,
        mois,
        status, // Statut déterminé en fonction du montant
      },
    });

    res.json(newCotisation);
  } catch (error) {
    console.error('Erreur lors de la création de la cotisation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la cotisation' });
  }
};



// PUT: Mettre à jour une cotisation
exports.updateCotisation = async (req, res) => {
  const { id } = req.params;
  const { montant, mois, datePaiement, membreId } = req.body;

  try {
    // Vérification des valeurs avant de procéder à la mise à jour
    if (!montant || !mois || !datePaiement || !membreId) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    // Validation de la date
    const formattedDate = new Date(datePaiement);
    if (isNaN(formattedDate)) {
      return res.status(400).json({ error: "La date de paiement est invalide" });
    }

    // Calcul du statut
    let status = 'Non Payé'; // Valeur par défaut
    if (montant && montant >= 3000) {
      status = 'Payé';
    } else if (montant && montant < 3000) {
      status = 'Insuffisant';
    }

    // Mise à jour de la cotisation avec les données valides
    const updatedCotisation = await prisma.cotisation.update({
      where: { id: Number(id) },
      data: {
        montant,
        mois,
        datePaiement: formattedDate,
        status,
        membreId,
      },
    });

    // Retourner la cotisation mise à jour
    res.json(updatedCotisation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la cotisation:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la cotisation: ' + error.message });
  }
};



// DELETE: Supprimer une cotisation
exports.deleteCotisation = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.cotisation.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Cotisation supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la cotisation' });
  }
};

exports.getCotisationById = async (req, res) => {
  const { id } = req.params;
  try {
    const cotisation = await prisma.cotisation.findUnique({
      where: { id: Number(id) },
      include: { membre: true },
    });

    if (!cotisation) {
      return res.status(404).json({ error: 'Cotisation non trouvée' });
    }

    // Calculer le statut
    let status = 'Non Payé';  // Valeur par défaut

    if (cotisation.montant === null) {
      status = 'Non Payé';
    } else if (cotisation.montant < 3000) {
      status = 'Insuffisant';
    } else if (cotisation.montant >= 3000) {
      status = 'Payé';
    }

    // Répondre avec la cotisation et son statut
    res.json({ ...cotisation, status });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la cotisation' });
  }
};
