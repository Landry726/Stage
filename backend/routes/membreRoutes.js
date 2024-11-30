const express = require('express');
const router = express.Router();
const membreController = require('../controllers/membreControllers');

router.get('/', membreController.getMembres);
router.post('/', membreController.createMembre);
router.put('/:id', membreController.updateMembre);
router.delete('/:id', membreController.deleteMembre);
router.get('/count' , membreController.countMembres);
router.get('/:id', membreController.getMembreById);

module.exports = router;
