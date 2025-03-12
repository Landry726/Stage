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

  
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];


    const missionsWithMonthText = paiements.map(paiement => {
      const mission = paiement.mission;
      const mois = new Date(mission.mois); 
      const monthName = mois ? months[mois.getMonth()] : null; 
      return {
        ...paiement,
        mission: {
          ...mission,
          mois: monthName, 
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
  const { montant, datePaiement } = req.body;

  try {
    const paiement = await prisma.paiementMission.findUnique({
      where: { id: Number(id) },
      include: { mission: true },
    });

    if (!paiement) {
      return res.status(404).json({ error: "Paiement introuvable" });
    }

    const mission = paiement.mission;
    const paiements = await prisma.paiementMission.findMany({
      where: { missionId: mission.id },
      select: { montant: true },
    });

    const totalDejaPaye = paiements.reduce((acc, p) => acc + p.montant, 0) - paiement.montant; // Exclure l'ancien montant
    const restePayer = mission.montant - totalDejaPaye;

    if (parseFloat(montant) > restePayer) {
      return res.status(400).json({ error: "Le montant mis à jour dépasse le reste à payer" });
    }

    const nouveauRestePayer = restePayer - parseFloat(montant);

    const updatedPaiement = await prisma.paiementMission.update({
      where: { id: Number(id) },
      data: {
        montant: parseFloat(montant),
        datePaiement: new Date(datePaiement),
        restePayer: nouveauRestePayer,
      },
    });

    const message = nouveauRestePayer === 0
      ? "Paiement complet effectué pour cette mission. Aucun reste à payer."
      : `Paiement partiel effectué. Reste à payer : ${nouveauRestePayer}`;

    res.status(200).json({
      message,
      updatedPaiement,
      restePayer: nouveauRestePayer,
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du paiement :", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du paiement" });
  }
};

// DELETE paiement mission
exports.deletePaiementMission = async (req, res) => {
  const { id } = req.params;

  try {
    const paiement = await prisma.paiementMission.findUnique({
      where: { id: Number(id) },
      include: { mission: true },
    });

    if (!paiement) {
      return res.status(404).json({ error: "Paiement introuvable" });
    }

    const mission = paiement.mission;

    await prisma.paiementMission.delete({
      where: { id: Number(id) },
    });

    const paiementsRestants = await prisma.paiementMission.findMany({
      where: { missionId: mission.id },
      select: { montant: true },
    });

    const totalRestantPaye = paiementsRestants.reduce((acc, p) => acc + p.montant, 0);
    const nouveauRestePayer = mission.montant - totalRestantPaye;

    res.status(200).json({
      message: "Paiement supprimé avec succès",
      restePayer: nouveauRestePayer,
    });

  } catch (error) {
    console.error("Erreur lors de la suppression du paiement :", error);
    res.status(500).json({ error: "Erreur lors de la suppression du paiement" });
  }
};


/**
 * Effectuer un paiement pour une mission
 * @param {Object} req - La requête avec les données du paiement
 * @param {Object} res - La réponse
 */

//Effectuer un paiement pour une mission--
exports.effectuerPaiement = async (req, res) => {
  const { missionId, membreId, montantPayer } = req.body;

  try {

    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      select: {
        id: true,
        montant: true, 
      },
    });

    if (!mission) {
      return res.status(404).json({ error: "Mission non trouvée" });
    }

    const currentMonth = new Date().getMonth() + 1; 
    const currentYear = new Date().getFullYear(); 

    const paiementExistant = await prisma.paiementMission.findFirst({
      where: {
        missionId: missionId,
        membreId: membreId,
        datePaiement: {
          gte: new Date(currentYear, currentMonth - 1, 1), 
          lt: new Date(currentYear, currentMonth, 1), 
        },
      },
    });

    if (paiementExistant) {
    
      return res.status(400).json({
        error: `Le paiement pour ce mois a déjà été effectué pour ce membre. Vous pouvez modifier le paiement existant.`,
      });
    }

    const paiementExistIdNom = await prisma.paiementMission.findFirst({
      where: {
        missionId: missionId,
        membreId: membreId,
      },
    });

    if (paiementExistIdNom) {
      return res.status(400).json({
        error: "Le paiement pour ce membre a déjà été effectué pour cette mission. Vous pouvez seulement le modifier.",
      });
    }

   
    const paiements = await prisma.paiementMission.findMany({
      where: { missionId: missionId },
      select: { montant: true },
    });


    const totalDejaPaye = paiements.reduce((acc, paiement) => acc + paiement.montant, 0);

    
    const restePayer = mission.montant - totalDejaPaye;

 
    if (parseFloat(montantPayer) > restePayer) {
      return res.status(400).json({ error: "Le montant payé dépasse le reste à payer" });
    }

   
    const nouveauRestePayer = restePayer - parseFloat(montantPayer);

    const paiement = await prisma.paiementMission.create({
      data: {
        membreId: membreId,
        missionId: missionId,
        montant: parseFloat(montantPayer),
        datePaiement: new Date(), 
        restePayer: nouveauRestePayer, 
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

