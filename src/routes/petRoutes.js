import { Router } from 'express';
import { createPet, getPetsByOng, updatePetImage, getAllPets, getPetById } from '../controllers/petController.js';  
import { upload } from '../middleware/uploadMiddleware.js';


const router = Router();

router.post('/', createPet);
router.get('/ong/:userId', getPetsByOng); // Atenção aqui!
router.get('/', getAllPets);
router.get('/:id', getPetById)
router.post('/:id/image', upload.single('image'), updatePetImage);

export default router;
