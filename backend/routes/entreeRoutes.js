// routes/entreeRoutes.js
const express = require('express');
const router = express.Router();
const entree = require('../controllers/entreeControllers');

// Route pour ajouter une nouvelle entrée
router.post('/', entree.addEntree);
router.get('/', entree.getAllEntree);
router.put('/:id', entree.updateEntree);
router.delete('/:id', entree.deleteEntree);
router.get('/total', entree.getTotalEntree);
module.exports = router;
