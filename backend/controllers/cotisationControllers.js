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
  const { membreId, montant, mois, datePaiement, status } = req.body;

  try {
      const formattedDate = new Date(datePaiement); // Convertit en format Date si nécessaire

      // Vérification ou traitement de 'status' si nécessaire
      const cotisationStatus = status || 'Pending'; // Par exemple, si le statut n'est pas fourni, utiliser 'Pending'

      const newCotisation = await prisma.cotisation.create({
          data: {
              membreId,
              datePaiement: formattedDate,
              montant,
              mois,
              status: cotisationStatus, // Assurez-vous de passer une valeur valide ici
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
  const { montant, mois  ,datePaiement  , membreId } = req.body;  // Ne pas inclure 'status' ici
  try {
    // Mettre à jour la cotisation avec 'montant' et 'mois'
    const updatedCotisation = await prisma.cotisation.update({
      where: { id: Number(id) },
      data: { montant, mois  ,datePaiement ,status , membreId },
    });

    // Calculer le statut après la mise à jour du montant
    let status = 'Non Payé';  // Valeur par défaut

    if (updatedCotisation.montant === null) {
      status = 'Non Payé';
    } else if (updatedCotisation.montant < 3000) {
      status = 'Insuffisant';
    } else if (updatedCotisation.montant >= 3000) {
      status = 'Payé';
    }

    // Réponse avec la cotisation mise à jour et le statut calculé
    res.json({ ...updatedCotisation, status });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la cotisation' });
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
