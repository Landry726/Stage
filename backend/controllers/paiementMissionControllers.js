const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfMonth, endOfMonth } = require('date-fns');

const months = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

exports.getPaiementMissions = async (req, res) => {
  try {
    const paiements = await prisma.paiementMission.findMany({
      include: { membre: true, mission: true },
    });

    // Tableau des noms de mois
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    // Formater le mois en texte
    const missionsWithMonthText = paiements.map(paiement => {
      const mission = paiement.mission;
      const mois = new Date(mission.mois); // Assurez-vous que 'mois' est une Date
      const monthName = mois ? months[mois.getMonth()] : null; // Extraire le mois en texte
      return {
        ...paiement,
        mission: {
          ...mission,
          mois: monthName, // Remplacer le champ 'mois' par son nom en texte
        }
      };
    });

    res.json(missionsWithMonthText);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des paiements des missions' });
  }
};



// GET paiement mission by ID
exports.getPaiementMissionById = async (req, res) => {
  const { id } = req.params;
  try {
    const paiement = await prisma.paiementMission.findUnique({
      where: { id: Number(id) },
      include: { membre: true, mission: true },
    });
    if (paiement) {
      res.json(paiement);
    } else {
      res.status(404).json({ error: 'Paiement mission introuvable' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du paiement de la mission' });
  }
};

// CREATE paiement mission
exports.createPaiementMission = async (req, res) => {
  const { membreId, missionId, montant, restePayer, datePaiement } = req.body;
  try {
    const newPaiement = await prisma.paiementMission.create({
      data: {
        membreId,
        missionId,
        montant,
        restePayer,
        datePaiement: new Date(datePaiement),
      },
    });
    res.json(newPaiement);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du paiement de la mission' });
  }
};

// UPDATE paiement mission
exports.updatePaiementMission = async (req, res) => {
  const { id } = req.params;
  const { montant, restePayer, datePaiement } = req.body;
  try {
    const updatedPaiement = await prisma.paiementMission.update({
      where: { id: Number(id) },
      data: { montant, restePayer, datePaiement: new Date(datePaiement) },
    });
    res.json(updatedPaiement);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du paiement de la mission' });
  }
};

// DELETE paiement mission
exports.deletePaiementMission = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.paiementMission.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Paiement de la mission supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du paiement de la mission' });
  }
};

/**
 * Effectuer un paiement pour une mission
 * @param {Object} req - La requête avec les données du paiement
 * @param {Object} res - La réponse
 */
exports.effectuerPaiement = async (req, res) => {
  const { missionId, membreId, montantPayer } = req.body;

  try {
    // 1. Récupérer les détails de la mission
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      select: {
        id: true,
        montant: true, // Montant total de la mission
      },
    });

    if (!mission) {
      return res.status(404).json({ error: "Mission non trouvée" });
    }

    // 2. Vérifier si un paiement a déjà été effectué pour ce mois et ce membre
    const currentMonth = new Date().getMonth() + 1; // Mois actuel
    const currentYear = new Date().getFullYear(); // Année actuelle

    const paiementExistant = await prisma.paiementMission.findFirst({
      where: {
        missionId: missionId,
        membreId: membreId,
        datePaiement: {
          gte: new Date(currentYear, currentMonth - 1, 1), // Premier jour du mois actuel
          lt: new Date(currentYear, currentMonth, 1), // Premier jour du mois suivant
        },
      },
    });

    if (paiementExistant) {
      // Si un paiement existe, on permet la modification du paiement
      return res.status(400).json({
        error: `Le paiement pour ce mois a déjà été effectué pour ce membre. Vous pouvez modifier le paiement existant.`,
      });
    }

    // 3. Vérifier si le paiement existe par ID ou nom du membre et mission
    const paiementExistIdNom = await prisma.paiementMission.findFirst({
      where: {
        missionId: missionId,
        membreId: membreId,
      },
    });

    if (paiementExistIdNom) {
      // Si le paiement existe déjà pour ce membre, l'empêcher d'ajouter un nouveau paiement
      return res.status(400).json({
        error: "Le paiement pour ce membre a déjà été effectué pour cette mission. Vous pouvez seulement le modifier.",
      });
    }

    // 4. Calculer le montant déjà payé pour cette mission
    const paiements = await prisma.paiementMission.findMany({
      where: { missionId: missionId },
      select: { montant: true },
    });

    // Somme des montants déjà payés
    const totalDejaPaye = paiements.reduce((acc, paiement) => acc + paiement.montant, 0);

    // Calculer le montant restant à payer
    const restePayer = mission.montant - totalDejaPaye;

    // 5. Vérifier si le montant payé dépasse le reste à payer
    if (parseFloat(montantPayer) > restePayer) {
      return res.status(400).json({ error: "Le montant payé dépasse le reste à payer" });
    }

    // 6. Calculer le nouveau montant restant après le paiement
    const nouveauRestePayer = restePayer - parseFloat(montantPayer);

    // 7. Enregistrer le paiement dans la table PaiementMission
    const paiement = await prisma.paiementMission.create({
      data: {
        membreId: membreId,
        missionId: missionId,
        montant: parseFloat(montantPayer),
        datePaiement: new Date(), // Date actuelle
        restePayer: nouveauRestePayer, // Montant restant mis à jour
      },
    });

    // 8. Réponse avec le montant restant
    const message = nouveauRestePayer === 0
      ? "Paiement complet effectué pour cette mission. Aucun reste à payer."
      : `Paiement partiel effectué. Reste à payer : ${nouveauRestePayer}`;

    res.status(200).json({
      message,
      paiement,
      restePayer: nouveauRestePayer,
    });

  } catch (error) {
    console.error("Erreur lors du paiement :", error);
    res.status(500).json({ error: "Erreur lors du paiement" });
  }
};

