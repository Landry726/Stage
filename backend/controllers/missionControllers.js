const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// GET all missions
exports.getMissions = async (req, res) => {
  try {
    const missions = await prisma.mission.findMany({
      include: { membre: true },
    });

    // Tableau des mois en texte
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    // Formater le mois
    const missionsWithMonthText = missions.map(mission => {
      const mois = mission.mois; // Supposons que 'mois' est un champ de type Date
      const monthName = mois ? months[mois.getMonth()] : null; // Récupère le nom du mois
      return {
        ...mission,
        mois: monthName, // Remplace le champ 'mois' par le nom du mois
      };
    });

    res.json(missionsWithMonthText);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching missions' });
  }
};



// GET mission by ID
exports.getMissionById = async (req, res) => {
  const { id } = req.params;
  try {
    const mission = await prisma.mission.findUnique({
      where: { id: Number(id) },
      include: { membre: true },
    });
    if (mission) {
      res.json(mission);
    } else {
      res.status(404).json({ error: 'Mission not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching mission' });
  }
};

// CREATE mission
exports.createMission = async (req, res) => {
  const { membreId, montant, mois } = req.body;

  try {
    // Conversion de "montant" en Float
    const montantFloat = parseFloat(montant);

    // Vérifier si la conversion a échoué
    if (isNaN(montantFloat)) {
      return res.status(400).json({ error: 'Montant invalide fourni' });
    }

    // Formatage de la date (ajout de '-01' pour former une date valide)
    const formattedMois = new Date(`${mois}-01`);

    // Vérifier si la mission existe déjà
    const existingMission = await prisma.mission.findFirst({
      where: {
        membreId,
        mois: formattedMois, // Vérifie la mission du même membre pour le même mois
      },
    });

    if (existingMission) {
      return res.status(400).json({ error: 'Une mission pour ce membre et ce mois existe déjà' });
    }

    // Créer la mission si elle n'existe pas
    const newMission = await prisma.mission.create({
      data: {
        membreId,
        montant: montantFloat, // Envoi du montant converti en tant que Float
        mois: formattedMois,
      },
    });

    res.json({
      message: 'Mission créée avec succès',
      mission: newMission,
    });
  } catch (error) {
    console.error(error); // Log l'erreur pour déboguer
    res.status(500).json({
      error: 'Erreur lors de la création de la mission',
      details: error.message,
    });
  }
};



exports.updateMission = async (req, res) => {
  const { id } = req.params;
  const { montant, mois } = req.body;

  try {
    const data = { montant };

    if (mois) {
      const formattedMois = new Date(mois);
      if (isNaN(formattedMois.getTime())) {
        return res.status(400).json({ error: 'Date invalide fournie pour le mois' });
      }
      data.mois = formattedMois;
    }

    const updatedMission = await prisma.mission.update({
      where: { id: Number(id) },
      data: data,
    });

    // Récupérer le nom du mois pour la réponse
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    const monthName = updatedMission.mois ? months[updatedMission.mois.getMonth()] : null;

    res.json({
      ...updatedMission,
      mois: monthName // Remplace `mois` par le nom du mois
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la mission:", error);
    res.status(500).json({
      error: {
        message: 'Erreur interne lors de la mise à jour de la mission',
        details: error.message,
        clientVersion: error.clientVersion || 'N/A'
      }
    });
  }
};



// DELETE mission
exports.deleteMission = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.mission.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Mission deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting mission' });
  }
};
