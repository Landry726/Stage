const express = require('express');
const router = express.Router();
const paiementMissionController = require('../controllers/paiementMissionControllers');

router.get('/', paiementMissionController.getPaiementMissions);
router.get('/:id', paiementMissionController.getPaiementMissionById);
router.post('/', paiementMissionController.effectuerPaiement);
router.put('/:id', paiementMissionController.updatePaiementMission);
router.delete('/:id', paiementMissionController.deletePaiementMission);


module.exports = router;
