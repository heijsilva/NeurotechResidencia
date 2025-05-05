import { Router } from 'express';
import { createPet, getPetsByOng, updatePetImage } from '../controllers/petController.js';  
import { upload } from '../middleware/uploadMiddleware.js';


const router = Router();

router.post('/', createPet);
router.get('/:userId', getPetsByOng);
router.post('/:id/image', upload.single('image'), updatePetImage);

export default router;
