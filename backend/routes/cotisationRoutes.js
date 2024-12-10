const express  = require('express');
const router = express.Router();
const cotisationController = require('../controllers/cotisationControllers');

router.post('/',cotisationController.createCotisation);
router.get('/',cotisationController.getCotisations);
router.put('/:id',cotisationController.updateCotisation);
router.delete('/:id',cotisationController.deleteCotisation);
router.get('/:id' , cotisationController.getCotisationById);
router.get('/membres/:membreId/mois', cotisationController.getCotisationsByMember);
router.get('/cotisations/year/:year', cotisationController.getCotisationsByYear);

module.exports = router;    