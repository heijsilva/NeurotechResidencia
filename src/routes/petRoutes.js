const { Router } = require('express');
const { createPet, getPetsByUser } = require('../controllers/petController.js');  

const router = Router();

router.post('/', createPet);              
router.get('/:userId', getPetsByUser);     

module.exports = router;  
