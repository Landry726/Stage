const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { format } = require('date-fns'); // Assurez-vous d'importer 'format' depuis 'date-fns'
const { fr } = require('date-fns/locale'); // Importer la locale française
 
//Afficher les cotisations
exports.getCotisations = async (req, res) => {
  try {
    const cotisations = await prisma.cotisation.findMany({
      include: { membre: true },
    });

  
    const cotisationsWithStatus = cotisations.map((cotisation) => {
      let status = 'Non Payé';  // Valeur par défaut

     
      if (cotisation.montant === null) {
        status = 'Non Payé';
      } else if (cotisation.montant < 3000) {
        status = 'Insuffisant';
      } else if (cotisation.montant >= 3000) {
        status = 'Payé';
      }

     
      const formattedDate = cotisation.datePaiement ? format(new Date(cotisation.datePaiement), 'dd/MM/yyyy') : null;

  
      return { ...cotisation, status, datePaiement: formattedDate };  // Ajoute le mois en français
    });

    res.json(cotisationsWithStatus);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des cotisations' });
  }
};

  
//Ajouter une cotisation
exports.createCotisation = async (req, res) => {
  const { membreId, montant, mois, datePaiement } = req.body;

  try {
    const formattedDate = new Date(datePaiement);
    
    const existingCotisation = await prisma.cotisation.findFirst({
      where: {
        membreId,
        mois,
      },
    });

    if (montant > 3000) {
      return res.status(400).json({
        message: `Le montant de la cotisation ne doit pas dépasser 3000. Vous avez saisi ${montant}. Veuillez corriger.`,
      });
    }

    if (existingCotisation) {
      return res.status(400).json({
        message: `Le membre a déjà payé pour le mois de ${mois}. Veuillez vérifier les informations.`,
      });
    }

    
    let status = 'Non Payé'; 

    if (montant === null || montant === 0) {
      status = 'Non Payé';
    } else if (montant < 3000) {
      status = 'Insuffisant';
    } else if (montant >= 3000) {
      status = 'Payé';
    }

    
    const newCotisation = await prisma.cotisation.create({
      data: {
        membreId,
        datePaiement: formattedDate,
        montant,
        mois,
        status, 
      },
    });

    res.status(201).json({
      message: 'Cotisation créée avec succès',
      cotisation: newCotisation,
    });
  } catch (error) {
    console.error('Erreur lors de la création de la cotisation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la cotisation' });
  }
};


// Mettre à jour une cotisation
exports.updateCotisation = async (req, res) => {
  const { id } = req.params;
  const { montant, mois, datePaiement, membreId } = req.body;

  try {
    // Validation des champs
    if (!montant || !mois || !datePaiement || !membreId) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    // Conversion de montant en Float
    const montantFloat = parseFloat(montant);
    if (isNaN(montantFloat)) {
      return res.status(400).json({ error: "Le montant doit être un nombre valide" });
    }

    // Validation et conversion de la date
    const formattedDate = new Date(datePaiement);
    if (isNaN(formattedDate)) {
      return res.status(400).json({ error: "La date de paiement est invalide" });
    }

    // Détermination du statut
    let status = 'Non Payé'; 
    if (montantFloat >= 3000) {
      status = 'Payé';
    } else if (montantFloat < 3000) {
      status = 'Insuffisant';
    }

    // Mise à jour de la cotisation dans Prisma
    const updatedCotisation = await prisma.cotisation.update({
      where: { id: Number(id) },
      data: {
        montant: montantFloat,
        mois,
        datePaiement: formattedDate,
        status,
        membreId: Number(membreId), // Assurez-vous que membreId est bien un entier
      },
    });

    res.json(updatedCotisation);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la cotisation:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la cotisation: ' + error.message });
  }
};




// Supprimer une cotisation
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

exports.getCotisationsByMember = async (req, res) => {
  const { membreId } = req.params; // ID du membre passé en paramètre

  // Vérifier que membreId est un entier valide
  if (isNaN(parseInt(membreId))) {
    return res.status(400).json({ message: 'ID du membre invalide.' });
  }

  try {
    // Récupérer toutes les cotisations pour le membre spécifié
    const cotisations = await prisma.cotisation.findMany({
      where: { 
        membreId: parseInt(membreId) // Assurez-vous que membreId est un entier
      },
      select: { 
        mois : true, 
        datePaiement: true,  // La date de la cotisation
        montant: true, // Le montant de la cotisation
        membre: {
          select: {
            nom: true, // Le nom du membre (ou tout autre champ associé)
          }
        }
      },
    });

    // Vérifier si des résultats existent
    if (cotisations.length === 0) {
      return res.status(404).json({ message: 'Aucune cotisation trouvée pour ce membre.' });
    }

    // Renvoyer les informations des cotisations
    res.json(cotisations);
  } catch (error) {
    console.error('Erreur lors de la récupération des cotisations:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des cotisations.' });
  }
};
exports.getCotisationsByYear = async (req, res) => {
  const { year } = req.params; // Paramètre de l'année

  try {
    const cotisations = await prisma.cotisation.findMany({
      where: {
        datePaiement: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`)
        }
      },
      include: {
        membre: true
      }
    });

    // Initialiser un tableau avec 12 cases pour représenter les mois (valeurs initiales à 0)
    const cotisationsByMonth = Array(12).fill(0); // Chaque case représente le nombre de cotisations pour un mois

    // Parcourir les cotisations et incrémenter le compteur du mois correspondant
    cotisations.forEach((cotisation) => {
      const month = new Date(cotisation.datePaiement).getMonth(); // Mois (0 = Janvier, 11 = Décembre)
      cotisationsByMonth[month]++;
    });

    res.json({
      year,
      cotisationsByMonth // Résultat : tableau avec le nombre de cotisations par mois
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des cotisations par année' });
  }
};
exports.getMembresSansCotisation = async (req, res) => {
  try {
    // Récupérer les membres sans cotisation
    const membresSansCotisation = await prisma.membre.findMany({
      where: {
        cotisations: {
          none: {}, // Aucune cotisation liée
        },
      },
      select: {
        id: true,
        nom: true,
        poste : true,
      },
    });

    // Envoyer la réponse
    res.status(200).json(membresSansCotisation);
  } catch (error) {
    console.error('Erreur lors de la récupération des membres sans cotisation :', error);
    res.status(500).json({ error: 'Une erreur est survenue.' });
  }
};

