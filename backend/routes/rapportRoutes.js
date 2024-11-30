const express = require('express');
const router = express.Router();
const rapport = require('../controllers/rapportControllers');

// Route pour générer le rapport Excel
router.get('/', rapport.generateExcelReport);

module.exports = router;
