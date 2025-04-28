import { Router } from 'express';
import { createPet, getPetsByUser } from '../controllers/petController.js';  

const router = Router();

router.post('/', createPet);
router.get('/:userId', getPetsByUser);

export default router;  
