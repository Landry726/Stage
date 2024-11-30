const express = require('express');
const router = express.Router();
const missionController = require('../controllers/MissionControllers');

router.get('/', missionController.getMissions);
router.get('/:id', missionController.getMissionById);
router.post('/', missionController.createMission);
router.put('/:id', missionController.updateMission);
router.delete('/:id', missionController.deleteMission);

module.exports = router;
