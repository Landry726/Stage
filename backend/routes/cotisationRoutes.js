const express  = require('express');
const router = express.Router();
const cotisationController = require('../controllers/cotisationControllers');

router.post('/',cotisationController.createCotisation);
router.get('/',cotisationController.getCotisations);
router.put('/:id',cotisationController.updateCotisation);
router.delete('/:id',cotisationController.deleteCotisation);
router.get('/:id' , cotisationController.getCotisationById);

module.exports = router;