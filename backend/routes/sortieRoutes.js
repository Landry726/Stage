// routes/sortieRoute.js
const express = require('express');
const router = express.Router();
const sortie= require('../controllers/sortieControllers');

// Route pour ajouter une nouvelle entrée
router.post('/', sortie.createSortie);
router.get('/' , sortie.getAllSorties);
router.get('/total', sortie.getTotalSortie);

module.exports = router;