const express = require('express');
const router = express.Router();
const caisseController = require('../controllers/caisseControllers');

// Créer une nouvelle caisse
router.post('/', caisseController.createCaisse);

// Récupérer toutes les caisses
router.get('/', caisseController.getAllCaisses);

// Récupérer une caisse par ID
// router.get('/:id', caisseController.getCaisseById);

// Mettre à jour une caisse
router.put('/:id', caisseController.updateCaisse);

// Supprimer une caisse
router.delete('/:id', caisseController.deleteCaisse);

// Route pour récupérer le total des caisses
router.get('/total', caisseController.getTotalCaisses);

router.get('/trends', caisseController.getTrends);


module.exports = router;
