
const express = require('express');
const router = express.Router();
const userController = require ('../controllers/userController.js');


//Route pour recuperer le profile l'utilisateur 
router.get('/', userController.getUserProfile);
router.delete('/:id' , userController.deleteUser);
router.put('/:id' , userController.updateUser);


module.exports = router;