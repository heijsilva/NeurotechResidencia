import { Router } from 'express';
import { createPet, getPetsByOng } from '../controllers/petController.js';  

const router = Router();

router.post('/', createPet);
router.get('/:userId', getPetsByOng);

export default router;  
